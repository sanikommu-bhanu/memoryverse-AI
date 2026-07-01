import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument } from "@/lib/analyze";
import { db } from "@/lib/store";
import { MemoryDoc } from "@/lib/types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized. Connect GitHub in settings." }, { status: 401 });

    const { repoUrl } = await req.json();
    if (!repoUrl || !repoUrl.includes("github.com")) return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });

    // Parse owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return NextResponse.json({ error: "Could not parse GitHub URL" }, { status: 400 });
    
    const owner = match[1];
    const repo = match[2].replace(".git", "");

    // Fetch README.md from GitHub API
    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { "Accept": "application/vnd.github.raw+json" }
    });

    if (!readmeRes.ok) throw new Error("Could not fetch README for this repository");
    
    const rawText = await readmeRes.text();
    if (!rawText || rawText.length < 10) throw new Error("Repository README is empty");

    const analysis = await analyzeDocument(rawText, `${repo} GitHub Repo`);
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    
    const doc: MemoryDoc = {
      id,
      title: analysis.title,
      category: "Project", // Force Project category
      fileName: `github.com/${owner}/${repo}`,
      mimeType: "text/markdown",
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
    return NextResponse.json({ error: e?.message || "GitHub sync failed" }, { status: 500 });
  }
}
