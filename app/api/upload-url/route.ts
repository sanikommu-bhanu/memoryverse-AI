import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument } from "@/lib/analyze";
import { db } from "@/lib/store";
import { MemoryDoc } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

    // Fetch the raw HTML from the URL
    const pageRes = await fetch(url);
    if (!pageRes.ok) throw new Error("Could not access URL");
    const html = await pageRes.text();

    // Very basic HTML to text fallback
    const rawText = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();

    if (!rawText || rawText.length < 20) throw new Error("No readable text found on page");

    const analysis = await analyzeDocument(rawText, url);
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    
    const doc: MemoryDoc = {
      id,
      title: analysis.title,
      category: analysis.category,
      fileName: url,
      mimeType: "text/html",
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
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "URL import failed" }, { status: 500 });
  }
}
