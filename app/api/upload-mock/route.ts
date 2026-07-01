import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument } from "@/lib/analyze";
import { db } from "@/lib/store";
import { MemoryDoc } from "@/lib/types";

const MOCKS: Record<string, {text: string, name: string}> = {
  drive: {
    name: "Q3 Strategy Meeting Notes (Google Drive)",
    text: "Discussed the Q3 strategy for the AI integration. We will focus on machine learning algorithms, specifically deploying TensorFlow models to AWS. The team needs to ramp up on Python and Docker before the end of September 2024. Action items: Alice to review the Keras pipeline, Bob to check the GitHub Actions CI/CD."
  },
  onedrive: {
    name: "Financial Projections 2024 (OneDrive)",
    text: "The financial outlook for Q3 and Q4 2024. Revenue is expected to grow by 15% due to the new React and Next.js frontend rebuild. Costs will decrease as we migrate from Azure to AWS. Our data analyst team is using Pandas and NumPy to build predictive models."
  },
  linkedin: {
    name: "LinkedIn Profile Sync",
    text: "Senior Software Engineer with 5 years of experience building scalable web applications. Proficient in JavaScript, TypeScript, React, Node.js, and SQL. Currently working at Acme Corp leading a team of 4 engineers. Graduated from Stanford University in 2020 with a BS in Computer Science. Certified AWS Solutions Architect."
  },
  notion: {
    name: "Project Brainstorming (Notion)",
    text: "Hackathon project ideas: 1) A personal AI knowledge base using Gemini 1.5 Flash and text-embedding-004. 2) A smart resume builder that automatically extracts skills from PDF uploads. Tech stack: Next.js, Tailwind CSS, TypeScript. Need to implement a beautiful glassmorphism UI."
  }
};

export async function POST(req: NextRequest) {
  try {
    const { provider } = await req.json();
    if (!provider || !MOCKS[provider]) return NextResponse.json({ error: "Invalid provider" }, { status: 400 });

    const mock = MOCKS[provider];
    const analysis = await analyzeDocument(mock.text, mock.name);
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    
    const doc: MemoryDoc = {
      id,
      title: analysis.title,
      category: analysis.category,
      fileName: mock.name,
      mimeType: "text/plain",
      rawText: mock.text,
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
    return NextResponse.json({ error: e?.message || "Sync failed" }, { status: 500 });
  }
}
