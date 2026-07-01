import { NextResponse } from "next/server";
import { generatePortfolioHTML } from "@/lib/rag";

export async function GET() {
  const html = await generatePortfolioHTML();
  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
