import type { ExtractedPage, RawChunk } from "@/types/mcq";

// Target sizes (characters) for a chunk fed into the LLM: large enough to give real context
// for a question + 4 plausible distractors, small enough that one chunk covers one coherent idea.
const MIN_CHUNK_CHARS = 400;
const MAX_CHUNK_CHARS = 2000;

const HEADING_MAX_LENGTH = 90;
const HEADING_PATTERN = /^(chapter|section|unit|part)\b|^\d+(\.\d+)*[.)]?\s+\S|^[A-Z][A-Z\s\d:&-]{3,}$/;

interface Block {
  heading: string | null;
  paragraphs: string[];
}

function looksLikeHeading(line: string, nextLine: string | undefined): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > HEADING_MAX_LENGTH) return false;
  if (/[.!?]$/.test(trimmed)) return false; // sentences ending in punctuation are prose, not headings
  const nextIsBlankOrHeading = !nextLine || !nextLine.trim();
  return HEADING_PATTERN.test(trimmed) && nextIsBlankOrHeading;
}

// Groups raw page text into (heading, paragraphs[]) blocks using blank-line paragraph breaks
// and a heuristic heading detector, rather than splitting on a fixed character count.
function toBlocks(pages: ExtractedPage[]): Block[] {
  const lines = pages.flatMap((p) => p.text.split("\n"));
  const blocks: Block[] = [{ heading: null, paragraphs: [] }];
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    const text = currentParagraphLines.join(" ").replace(/\s+/g, " ").trim();
    currentParagraphLines = [];
    if (text) blocks[blocks.length - 1].paragraphs.push(text);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (looksLikeHeading(line, lines[i + 1])) {
      flushParagraph();
      blocks.push({ heading: line.trim(), paragraphs: [] });
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      continue;
    }
    currentParagraphLines.push(line.trim());
  }
  flushParagraph();

  return blocks.filter((b) => b.paragraphs.length > 0);
}

// Splits a paragraph that alone exceeds MAX_CHUNK_CHARS on sentence boundaries so no single
// chunk balloons past the LLM-friendly size, even if the source has no paragraph breaks.
function splitOversizedParagraph(paragraph: string): string[] {
  if (paragraph.length <= MAX_CHUNK_CHARS) return [paragraph];
  const sentences = paragraph.match(/[^.!?]+[.!?]+|\S+$/g) ?? [paragraph];
  const parts: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current.length + sentence.length > MAX_CHUNK_CHARS && current) {
      parts.push(current.trim());
      current = "";
    }
    current += sentence;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export function chunkText(pages: ExtractedPage[]): RawChunk[] {
  const blocks = toBlocks(pages);
  const chunks: RawChunk[] = [];
  let sequence = 0;
  let currentText = "";
  let currentHeading: string | null = null;

  const flushChunk = () => {
    if (currentText.trim()) {
      chunks.push({ sequence: sequence++, heading: currentHeading, text: currentText.trim() });
    }
    currentText = "";
  };

  for (const block of blocks) {
    // A block's heading is only injected into the body text once, the first time that block
    // contributes to the chunk currently being built — whether or not it starts a new chunk.
    // Otherwise a section heading merged into an existing chunk (because it was still under
    // MAX_CHUNK_CHARS) would vanish entirely instead of staying visible as context.
    let headingInjected = false;
    const pieces = block.paragraphs.flatMap(splitOversizedParagraph);
    for (const piece of pieces) {
      const wouldExceed = currentText.length + piece.length > MAX_CHUNK_CHARS;
      if (wouldExceed && currentText.length > 0) {
        flushChunk();
        currentHeading = block.heading;
        headingInjected = false;
      }
      if (!currentText) currentHeading = block.heading;
      if (block.heading && !headingInjected) {
        currentText += (currentText ? "\n\n" : "") + block.heading;
        headingInjected = true;
      }
      currentText += (currentText ? "\n\n" : "") + piece;
    }
  }
  flushChunk();

  return mergeUndersizedChunks(chunks);
}

// A trailing tail of content (e.g. a short closing paragraph after the last heading) can end
// up as its own sub-MIN_CHUNK_CHARS chunk. Fold it into a neighbor rather than shipping a
// chunk too small to give the LLM real context, then renumber sequences.
function mergeUndersizedChunks(chunks: RawChunk[]): RawChunk[] {
  const merged: RawChunk[] = [];
  for (const chunk of chunks) {
    const previous = merged[merged.length - 1];
    if (chunk.text.length < MIN_CHUNK_CHARS && previous) {
      previous.text += "\n\n" + chunk.text;
    } else {
      merged.push({ ...chunk });
    }
  }
  return merged.map((chunk, i) => ({ ...chunk, sequence: i }));
}
