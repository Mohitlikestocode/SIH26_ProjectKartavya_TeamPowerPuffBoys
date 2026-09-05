import mammoth from "mammoth";
import type { ExtractionResult } from "@/types/mcq";

// DOCX has no inherent page concept in the raw XML, so the whole document is treated as
// a single logical "page" — the chunker downstream splits it by heading/paragraph anyway.
export async function extractDocx(buffer: Buffer): Promise<ExtractionResult> {
  const { value: text } = await mammoth.extractRawText({ buffer });
  return {
    pages: [{ pageNumber: 1, text: text.trim(), isOcrFallback: false }],
    scannedPageNumbers: [],
  };
}
