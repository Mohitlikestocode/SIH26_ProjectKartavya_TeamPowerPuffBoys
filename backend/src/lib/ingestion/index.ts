import type { ExtractionResult } from "@/types/mcq";
import { extractPdf } from "./extractPdf";
import { extractDocx } from "./extractDocx";
import { extractPptx } from "./extractPptx";

const PDF_MIME = "application/pdf";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

export const SUPPORTED_MIME_TYPES = [PDF_MIME, DOCX_MIME, PPTX_MIME] as const;

export function isSupportedMimeType(mimeType: string): boolean {
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export async function extractText(buffer: Buffer, mimeType: string): Promise<ExtractionResult> {
  switch (mimeType) {
    case PDF_MIME:
      return extractPdf(buffer);
    case DOCX_MIME:
      return extractDocx(buffer);
    case PPTX_MIME:
      return extractPptx(buffer);
    default:
      throw new Error(`Unsupported mime type: ${mimeType}`);
  }
}
