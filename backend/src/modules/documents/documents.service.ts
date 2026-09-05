// Documents business logic — content ingestion + chunking. No Express types here.
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/config/db";
import { env } from "@/config/env";
import { ApiError } from "@/middleware/errorHandler";
import { extractText, isSupportedMimeType } from "@/lib/ingestion";
import { chunkText } from "@/lib/chunking/chunkText";

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

export async function ingestDocument(file: UploadedFile) {
  if (!isSupportedMimeType(file.mimetype)) {
    throw new ApiError(400, `Unsupported file type: ${file.mimetype}. Supported: PDF, DOCX, PPTX.`);
  }

  const storedFilename = `${randomUUID()}-${file.originalname}`;
  const storagePath = path.join(env.uploadDir, storedFilename);
  await mkdir(env.uploadDir, { recursive: true });
  await writeFile(storagePath, file.buffer);

  const document = await prisma.sourceDocument.create({
    data: {
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      storagePath,
      status: "processing",
    },
  });

  try {
    const extraction = await extractText(file.buffer, file.mimetype);
    const rawChunks = chunkText(extraction.pages);

    await prisma.$transaction([
      ...rawChunks.map((chunk) =>
        prisma.chunk.create({
          data: {
            documentId: document.id,
            sequence: chunk.sequence,
            heading: chunk.heading,
            text: chunk.text,
          },
        })
      ),
      prisma.sourceDocument.update({
        where: { id: document.id },
        data: {
          status: "processed",
          pageCount: extraction.pages.length,
          ocrFlaggedPages: extraction.scannedPageNumbers,
        },
      }),
    ]);

    return prisma.sourceDocument.findUniqueOrThrow({ where: { id: document.id }, include: { chunks: true } });
  } catch (err) {
    await prisma.sourceDocument.update({
      where: { id: document.id },
      data: { status: "failed", failureReason: (err as Error).message },
    });
    throw new ApiError(500, `Failed to process document: ${(err as Error).message}`);
  }
}

export async function getDocument(id: string) {
  const document = await prisma.sourceDocument.findUnique({
    where: { id },
    include: { chunks: { orderBy: { sequence: "asc" } } },
  });
  if (!document) throw new ApiError(404, "Document not found.");
  return document;
}
