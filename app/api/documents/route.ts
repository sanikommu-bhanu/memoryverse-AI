import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ documents: db.getDocs() });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });
  db.deleteDoc(id);
  return NextResponse.json({ ok: true });
}
