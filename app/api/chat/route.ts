import { NextRequest, NextResponse } from "next/server";
import { ragAnswer } from "@/lib/rag";
import { db } from "@/lib/store";
import { ChatTurn } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { question } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: "No question" }, { status: 400 });

  const userTurn: ChatTurn = {
    id: `u_${Date.now()}`,
    role: "user",
    content: question,
    createdAt: new Date().toISOString(),
  };
  db.appendChat(userTurn);

  try {
    const { answer, sources } = await ragAnswer(question);
    const asTurn: ChatTurn = {
      id: `a_${Date.now()}`,
      role: "assistant",
      content: answer,
      sources,
      createdAt: new Date().toISOString(),
    };
    db.appendChat(asTurn);
    return NextResponse.json({ answer, sources, turn: asTurn });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ chat: db.getChat() });
}

export async function DELETE() {
  db.clearChat();
  return NextResponse.json({ ok: true });
}
