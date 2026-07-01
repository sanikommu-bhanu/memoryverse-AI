import { NextResponse } from "next/server";
import { computeInsights } from "@/lib/rag";

export async function GET() {
  return NextResponse.json(computeInsights());
}
