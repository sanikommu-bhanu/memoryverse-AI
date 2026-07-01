import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import { Readable } from "stream";
import { IncomingMessage } from "http";
import { extractText } from "@/lib/textExtract";
import { analyzeDocument } from "@/lib/analyze";
import { db } from "@/lib/store";
import { MemoryDoc } from "@/lib/types";

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write to temp file for parsing
    const tmpDir = "/tmp";
    const tmpPath = `${tmpDir}/${Date.now()}_${file.name}`;
    fs.writeFileSync(tmpPath, buffer);

    try {
      const rawText = await extractText(tmpPath, file.type, file.name);
      const analysis = await analyzeDocument(rawText, file.name);

      const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
      const doc: MemoryDoc = {
        id,
        title: analysis.title,
        category: analysis.category,
        fileName: file.name,
        mimeType: file.type,
        rawText: rawText.slice(0, 12000),
        summary: analysis.summary,
        entities: analysis.entities,
        year: analysis.year,
        confidence: analysis.confidence,
        embedding: analysis.embedding,
        uploadedAt: new Date().toISOString(),
      };

      db.addDoc(doc);
      return NextResponse.json({ success: true, doc });
    } finally {
      try { fs.unlinkSync(tmpPath); } catch {}
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 });
  }
}
