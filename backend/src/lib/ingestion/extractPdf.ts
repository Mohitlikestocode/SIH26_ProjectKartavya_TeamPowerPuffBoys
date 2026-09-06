import type { ExtractedPage, ExtractionResult } from "@/types/mcq";
import { ocrImageBuffer } from "./ocr";

// pdf-parse is imported lazily (inside extractPdf) rather than at module load: its transitive
// pdfjs-dist dependency touches the browser-only `DOMMatrix` global while evaluating, which
// aborts the whole server process on some Node builds. Deferring the import keeps that failure
// contained to an actual PDF extraction call instead of taking down boot for every route.

// Below this character count (after trimming), a page is treated as "no extractable text
// layer" — almost always a scanned image page rather than a genuinely short page.
const MIN_TEXT_LENGTH_THRESHOLD = 20;

export async function extractPdf(buffer: Buffer): Promise<ExtractionResult> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const textResult = await parser.getText();

    const pages: ExtractedPage[] = textResult.pages.map((p) => ({
      pageNumber: p.num,
      text: (p.text ?? "").trim(),
      isOcrFallback: false,
    }));

    const scannedPageNumbers = pages
      .filter((p) => p.text.length < MIN_TEXT_LENGTH_THRESHOLD)
      .map((p) => p.pageNumber);

    // OCR fallback: render each scanned page to a raster image and run it through Tesseract.
    // We never silently drop these pages — if OCR also fails, the page keeps isOcrFallback=true
    // and an empty/partial text so downstream callers can see it was flagged, not just missing.
    for (const pageNumber of scannedPageNumbers) {
      const page = pages.find((p) => p.pageNumber === pageNumber)!;
      page.isOcrFallback = true;
      try {
        const screenshot = await parser.getScreenshot({ partial: [pageNumber], imageBuffer: true });
        const rendered = screenshot.pages[0];
        if (rendered?.data) {
          page.text = await ocrImageBuffer(Buffer.from(rendered.data));
        }
      } catch (err) {
        console.error(`OCR fallback failed for PDF page ${pageNumber}:`, err);
        // Leave page.text as-is (likely empty) — isOcrFallback stays true so the caller can flag it.
      }
    }

    return { pages, scannedPageNumbers };
  } finally {
    await parser.destroy();
  }
}
