"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MemoryDoc } from "@/lib/types";

const CATS = ["All","Certificate","Project","Internship","Research","Achievement","Resume","Skill"];
const CAT_ICONS: Record<string,string> = {
  Certificate:"🏅", Project:"🚀", Internship:"💼", Skill:"⚡",
  Research:"🔬", Achievement:"🏆", Resume:"📄", Other:"📌",
};

export default function Search() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q")||"");
  const [cat, setCat] = useState(sp.get("category")||"All");
  const [results, setResults] = useState<{doc:MemoryDoc;score:number}[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (query: string, category: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (category !== "All") params.set("category", category);
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setResults(data.results || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { doSearch(q, cat); }, [cat]);

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); doSearch(q, cat); };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-primary mb-6">Semantic Search</h1>

        {/* Search input */}
        <form onSubmit={onSubmit} className="relative mb-6">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search anything…"
            className="w-full pl-11 pr-16 py-4 rounded-2xl bg-soft border border-edge text-sm text-primary placeholder:text-faint outline-none focus:border-primary/40 transition-colors"/>
          <button type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
            Search
          </button>
        </form>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{scrollbarWidth:"none"}}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap shrink-0 transition-all ${cat===c ? "bg-primary text-white" : "bg-soft text-primary border border-edge hover:border-primary/30"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-faint">{results.length} result{results.length!==1?"s":""}</span>
          {loading && <span className="text-xs text-faint animate-pulse">Searching…</span>}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl shimmer"/>)}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-4xl">🔍</span>
            <p className="font-semibold text-primary mt-4">No results found</p>
            <p className="text-sm text-muted mt-2">Try a different search term or upload more documents</p>
            <Link href="/upload" className="mv-btn-primary inline-flex mt-6">Upload Document</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map(({ doc, score }) => (
              <Link key={doc.id} href={`/document/${doc.id}`}
                className="flex items-center gap-4 mv-card hover:shadow-card transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-soft flex items-center justify-center text-xl shrink-0">
                  {CAT_ICONS[doc.category]||"📌"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-primary text-sm truncate">{doc.title}</p>
                    <span className="text-[11px] bg-soft text-faint px-2 py-0.5 rounded-pill shrink-0">{doc.category}</span>
                  </div>
                  <p className="text-xs text-faint mt-0.5">{doc.year} · {doc.fileName}</p>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{doc.summary}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-faint">Match</div>
                  <div className="text-sm font-bold text-primary">{Math.round(score*100)}%</div>
                </div>
                <svg className="w-4 h-4 text-faint group-hover:text-primary transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
