import { NextRequest, NextResponse } from "next/server";
import { semanticSearch } from "@/lib/vectorSearch";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "All";
  const topK = parseInt(searchParams.get("k") || "20");

  if (!query.trim()) {
    const { db } = await import("@/lib/store");
    const docs = db.getDocs();
    const filtered = category === "All" ? docs : docs.filter(d => d.category === category);
    return NextResponse.json({ results: filtered.map(d => ({ doc: d, score: 1 })) });
  }

  try {
    const results = await semanticSearch(query, topK, category === "All" ? undefined : category);
    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
