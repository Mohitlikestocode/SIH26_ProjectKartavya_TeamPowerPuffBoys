// Shared DTOs for the content-ingestion -> MCQ-generation pipeline (Phase 1) and the admin
// review/edit/manual-create workflow (Phase 2).

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  /** true when the page had no extractable text and was routed through OCR (or flagged as needing it). */
  isOcrFallback: boolean;
}

export interface ExtractionResult {
  pages: ExtractedPage[];
  /** Page numbers that had no extractable text layer, i.e. likely scanned images. */
  scannedPageNumbers: number[];
}

export interface RawChunk {
  sequence: number;
  heading: string | null;
  text: string;
}

// What the model reports per option: only whether that option's own claim is true according to
// the passage, and why — never which option "wins". Which one wins is derived in code (see
// src/lib/mcq/deriveCorrectOption.ts) from these plus `isNegatedStem`, so neither the model nor an
// admin edit can write a self-inconsistent answer key.
export interface OptionEvaluation {
  optionIndex: number;
  isTrueStatement: boolean;
  text: string;
}

// What gets stored: index-aligned to `options`, with the derived, final isCorrect flag alongside
// the raw isTrueStatement it was derived from (kept so an admin edit has something to flip).
export interface OptionExplanation {
  optionIndex: number;
  isTrueStatement: boolean;
  isCorrect: boolean;
  text: string;
}

export interface McqDraft {
  question: string;
  options: [string, string, string, string];
  isNegatedStem: boolean;
  correctOption: number;
  explanations: OptionExplanation[];
}
