import fs from "node:fs";
import path from "node:path";

const SUPPORTED = new Set([".txt", ".md"]);

// Rough guide only — the real check is a token count, but this is enough to
// warn before spending an API call on a 400-page PDF dump.
const LARGE_SOURCE_CHARS = 400_000;

export interface Source {
  path: string;
  text: string;
  warnings: string[];
}

export function readSource(filePath: string): Source {
  const ext = path.extname(filePath).toLowerCase();

  if (!SUPPORTED.has(ext)) {
    throw new Error(
      `Unsupported source file type "${ext}". This MVP reads plain text (.txt, .md).\n` +
        `PDF/DOCX/PPTX extraction is the uploader's job in the real pipeline — for now, ` +
        `export the document to text and pass that.`,
    );
  }

  if (!fs.existsSync(filePath)) throw new Error(`Source file not found: ${filePath}`);

  const text = fs.readFileSync(filePath, "utf8").trim();
  const warnings: string[] = [];

  if (text.length < 500) {
    warnings.push(
      `Source is only ${text.length} characters. Expect few grounded questions — the brief says return fewer items rather than invent ungrounded ones.`,
    );
  }
  if (text.length > LARGE_SOURCE_CHARS) {
    warnings.push(
      `Source is ${text.length.toLocaleString()} characters — large enough that it may not fit the context window. Nothing has been truncated; split the document if a request fails.`,
    );
  }

  return { path: filePath, text, warnings };
}
