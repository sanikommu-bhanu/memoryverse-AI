import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ profile: db.getProfile() });
}
export async function POST(req: NextRequest) {
  const profile = await req.json();
  db.setProfile(profile);
  return NextResponse.json({ ok: true, profile });
}
