import fs from "fs";
import path from "path";
import { extractTextFromImage, hasKey } from "./gemini";

export async function extractText(filePath: string, mimeType: string, fileName: string): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();
  try {
    if (ext === ".pdf" || mimeType === "application/pdf") {
      const pdfParse = (await import("pdf-parse")).default;
      const buf = fs.readFileSync(filePath);
      const result = await pdfParse(buf);
      return result.text || "";
    }
    if (ext === ".docx" || mimeType.includes("wordprocessingml")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || "";
    }
    if ([".txt", ".md", ".csv", ".json", ".log"].includes(ext) || mimeType.startsWith("text/")) {
      return fs.readFileSync(filePath, "utf-8");
    }
    
    // Image OCR
    if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext) || mimeType.startsWith("image/")) {
      if (!hasKey()) return `File: ${fileName} (image format — OCR requires Gemini API key)`;
      const base64 = fs.readFileSync(filePath).toString("base64");
      const text = await extractTextFromImage(mimeType, base64);
      if (!text || text.trim() === "") return `File: ${fileName} (No text could be extracted from this image)`;
      return text;
    }

    // Try reading as UTF-8 for any other file type
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const cleaned = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s{4,}/g, " ").trim();
      if (cleaned.length > 60) return cleaned.slice(0, 10000);
    } catch { /* binary */ }
    return `File: ${fileName} (binary format — text extraction not available)`;
  } catch (e: any) {
    return `File: ${fileName}. Extraction error: ${e?.message ?? "unknown"}`;
  }
}
