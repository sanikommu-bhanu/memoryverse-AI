import { NextRequest, NextResponse } from "next/server";
import { generateResume } from "@/lib/rag";

export async function POST(req: NextRequest) {
  const { template } = await req.json().catch(() => ({ template: "ATS" }));
  const resume = await generateResume(template || "ATS");
  return NextResponse.json({ resume });
}
