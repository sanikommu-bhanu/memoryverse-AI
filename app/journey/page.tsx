"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MemoryDoc, DocCategory } from "@/lib/types";

const FILTERS: (DocCategory|"All")[] = ["All","Certificate","Project","Internship","Research","Achievement"];
const CAT_ICONS: Record<string,string> = {
  Certificate:"🏅", Project:"🚀", Internship:"💼", Skill:"⚡",
  Research:"🔬", Achievement:"🏆", Resume:"📄", Other:"📌",
};
const CAT_COLORS: Record<string,string> = {
  Certificate:"bg-yellow-100 text-yellow-700", Project:"bg-blue-100 text-blue-700",
  Internship:"bg-purple-100 text-purple-700", Research:"bg-green-100 text-green-700",
  Achievement:"bg-orange-100 text-orange-700", Resume:"bg-gray-100 text-gray-700",
};

export default function Journey() {
  const [docs, setDocs] = useState<MemoryDoc[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  useEffect(() => {
    fetch("/api/documents").then(r=>r.json()).then(d=>setDocs(d.documents||[]));
  }, []);

  const sorted = [...docs]
    .filter(d => filter === "All" || d.category === filter)
    .sort((a,b) => Number(a.year) - Number(b.year));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">My Journey</h1>
            <p className="text-sm text-muted mt-1">Visual timeline of your growth</p>
          </div>
          <Link href="/upload" className="mv-btn-primary text-sm px-4 py-2">+ Upload</Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8" style={{scrollbarWidth:"none"}}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap shrink-0 transition-all ${filter===f ? "bg-primary text-white" : "bg-soft text-primary border border-edge hover:border-primary/30"}`}>
              {f}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-24">
            <span className="text-5xl">📅</span>
            <p className="font-bold text-primary mt-4">No entries yet</p>
            <p className="text-sm text-muted mt-2">Upload documents to build your journey timeline</p>
            <Link href="/upload" className="mv-btn-primary inline-flex mt-6">Upload Now</Link>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-edge"/>

            <div className="space-y-0">
              {sorted.map((doc, idx) => (
                <div key={doc.id} className="relative flex gap-5 animate-fade-up" style={{animationDelay:`${idx*60}ms`}}>
                  {/* Dot */}
                  <div className="relative z-10 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg shadow-md">
                      {CAT_ICONS[doc.category]||"📌"}
                    </div>
                  </div>

                  {/* Content */}
                  <Link href={`/document/${doc.id}`}
                    className="flex-1 mb-8 mv-card hover:shadow-card transition-all ml-1 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-faint">{doc.year}</span>
                        <p className="font-bold text-primary mt-0.5 leading-snug">{doc.title}</p>
                        <p className="text-xs text-muted mt-1 line-clamp-2">{doc.summary}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {doc.entities.skills.slice(0,3).map(s => (
                            <span key={s} className="text-[11px] bg-soft border border-edge rounded-pill px-2.5 py-1 text-muted">{s}</span>
                          ))}
                        </div>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-pill shrink-0 ${CAT_COLORS[doc.category]||"bg-gray-100 text-gray-600"}`}>
                        {doc.category}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
