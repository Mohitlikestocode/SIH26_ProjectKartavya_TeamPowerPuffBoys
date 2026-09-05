import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import type { ExtractionResult } from "@/types/mcq";

// PPTX is a zip of per-slide XML (OOXML). Each slide's text runs live in <a:t> elements
// nested arbitrarily deep inside shape trees, so we recursively collect them rather than
// trying to model the full shape schema.
const parser = new XMLParser({ ignoreAttributes: true, textNodeName: "#text" });

function collectText(node: unknown, out: string[]): void {
  if (node === null || node === undefined) return;
  if (typeof node === "string") {
    const trimmed = node.trim();
    if (trimmed) out.push(trimmed);
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectText(item, out);
    return;
  }
  if (typeof node === "object") {
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === "a:t") collectText(value, out);
      else collectText(value, out);
    }
  }
}

function slideNumber(filename: string): number {
  const match = filename.match(/slide(\d+)\.xml$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

export async function extractPptx(buffer: Buffer): Promise<ExtractionResult> {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => slideNumber(a) - slideNumber(b));

  const pages = await Promise.all(
    slideFiles.map(async (filename, index) => {
      const xml = await zip.files[filename].async("string");
      const parsed = parser.parse(xml);
      const textRuns: string[] = [];
      collectText(parsed, textRuns);
      return {
        pageNumber: index + 1,
        text: textRuns.join(" ").trim(),
        isOcrFallback: false,
      };
    })
  );

  // A slide with no text runs at all is most likely an image-only slide (e.g. a scanned
  // diagram) — flag it the same way a scanned PDF page is flagged, since PPTX has no OCR path.
  const scannedPageNumbers = pages.filter((p) => p.text.length === 0).map((p) => p.pageNumber);
  for (const pageNumber of scannedPageNumbers) {
    pages[pageNumber - 1].isOcrFallback = true;
  }

  return { pages, scannedPageNumbers };
}
