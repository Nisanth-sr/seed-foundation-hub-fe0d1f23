import "server-only";

export const MAX_CHATBOT_SOURCE_BYTES = 128 * 1024;
export const MAX_CHATBOT_SOURCE_TOTAL_BYTES = 256 * 1024;
export const MAX_CHATBOT_SOURCE_FILES = 20;
const allowedTypes = new Map([
  [".txt", "text/plain"],
  [".md", "text/markdown"],
  [".csv", "text/csv"],
  [".json", "application/json"],
]);

export function validateSourceFileName(name: string, mimeType: string, size: number) {
  const extension = name.toLowerCase().slice(name.lastIndexOf("."));
  const expectedType = allowedTypes.get(extension);
  if (!expectedType || (mimeType && mimeType !== "application/octet-stream" && mimeType !== expectedType)) {
    throw new Error("Only plain text, Markdown, CSV, and JSON files are allowed");
  }
  if (size < 1 || size > MAX_CHATBOT_SOURCE_BYTES) {
    throw new Error("Source files must be between 1 byte and 128 KiB");
  }
  return expectedType;
}

export function decodeSourceFile(bytes: Uint8Array) {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (text.includes("\0")) throw new Error("Source files must contain UTF-8 text");
  return text;
}
