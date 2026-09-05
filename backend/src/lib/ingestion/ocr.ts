import { createWorker } from "tesseract.js";

// A single lazily-created worker is reused across calls — spinning one up per page is slow
// and Tesseract workers are safe to reuse sequentially.
let workerPromise: ReturnType<typeof createWorker> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng");
  }
  return workerPromise;
}

export async function ocrImageBuffer(image: Buffer): Promise<string> {
  const worker = await getWorker();
  const {
    data: { text },
  } = await worker.recognize(image);
  return text.trim();
}
