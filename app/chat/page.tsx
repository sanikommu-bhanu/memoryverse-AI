"use client";
import { useEffect, useRef, useState } from "react";
import { ChatTurn } from "@/lib/types";

const SUGGESTIONS = [
  "What are my strongest skills?",
  "Summarize my career journey",
  "Show my AI certificates",
  "What skills am I missing?",
  "Generate a cover letter intro",
  "Find my internship documents",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat").then(r=>r.json()).then(d=>setMessages(d.chat||[]));
    // Check if API key exists
    fetch("/api/insights").then(r => { setHasKey(r.ok); });
  }, []);

  const scrollBottom = () => setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");
    const userMsg: ChatTurn = { id: `u${Date.now()}`, role:"user", content:q, createdAt: new Date().toISOString() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    scrollBottom();
    try {
      const res = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ question: q }) });
      const data = await res.json();
      if (data.turn) setMessages(m => [...m, data.turn]);
    } catch (e: any) {
      setMessages(m => [...m, { id:`e${Date.now()}`, role:"assistant", content:"Sorry, something went wrong. Please try again.", createdAt: new Date().toISOString() }]);
    } finally { setLoading(false); scrollBottom(); }
  };

  const clearChat = async () => {
    await fetch("/api/chat", { method:"DELETE" });
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-edge bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div>
          <h1 className="font-bold text-primary">AI Assistant</h1>
          <p className="text-xs text-faint mt-0.5">Your personal AI companion · RAG-powered</p>
        </div>
        <button onClick={clearChat} className="text-xs text-faint hover:text-primary transition-colors px-3 py-1.5 rounded-xl bg-soft">Clear</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-4">
        {!hasKey && (
          <div className="mv-card bg-amber-50 border-amber-200 text-amber-800 text-sm">
            <strong>Tip:</strong> Add your free Gemini API key to <code className="bg-amber-100 px-1 rounded">.env</code> for full AI-powered answers. The app still works with local search.
          </div>
        )}

        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✦</div>
            <h2 className="font-bold text-primary text-lg">Ask me about your journey</h2>
            <p className="text-sm text-muted mt-2 mb-8">I search your real documents using semantic embeddings</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="px-4 py-2.5 rounded-2xl bg-soft border border-edge text-sm font-medium text-primary hover:border-primary/40 transition-all active:scale-95">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role==="user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] lg:max-w-[68%] ${m.role==="user" ? "bg-primary text-white rounded-2xl rounded-br-sm" : "bg-soft text-primary border border-edge rounded-2xl rounded-bl-sm"} px-5 py-4`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-[11px] font-bold uppercase tracking-wide opacity-60 mb-2">Sources</p>
                  <div className="space-y-1">
                    {m.sources.map(s => (
                      <a key={s.id} href={`/document/${s.id}`}
                        className="flex items-center gap-2 text-[11px] opacity-75 hover:opacity-100 transition-opacity">
                        <span>📄</span><span className="truncate">{s.title}</span>
                        <span className="ml-auto font-bold">{s.score}%</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-soft border border-edge rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{animationDelay:`${i*120}ms`}}/>)}
              </div>
              <span className="text-xs text-muted">Searching your documents…</span>
            </div>
          </div>
        )}

        <div ref={endRef}/>
      </div>

      {/* Input bar */}
      <div className="border-t border-edge px-4 lg:px-8 py-4 bg-white">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
            placeholder="Ask anything about your documents…"
            rows={1}
            className="flex-1 mv-input resize-none min-h-[48px] max-h-32 py-3 leading-relaxed"
            style={{height:"auto"}}/>
          <button onClick={() => send()} disabled={!input.trim()||loading}
            className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M22 2 11 13M22 2 15 22 11 13 2 9l20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
