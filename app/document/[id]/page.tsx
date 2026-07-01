"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MemoryDoc } from "@/lib/types";

const CAT_ICONS: Record<string,string> = {
  Certificate:"🏅", Project:"🚀", Internship:"💼", Skill:"⚡",
  Research:"🔬", Achievement:"🏆", Resume:"📄", Other:"📌",
};

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<MemoryDoc|null>(null);
  const [allDocs, setAllDocs] = useState<MemoryDoc[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/documents").then(r=>r.json()).then(d => {
      const docs: MemoryDoc[] = d.documents||[];
      setAllDocs(docs);
      setDoc(docs.find(x => x.id === id) ?? null);
    });
  }, [id]);

  const related = allDocs.filter(d => d.id !== id &&
    (d.entities.skills.some(s => doc?.entities.skills.includes(s)) || d.category === doc?.category)
  ).slice(0,4);

  const handleDelete = async () => {
    if (!confirm("Delete this document?")) return;
    setDeleting(true);
    await fetch("/api/documents", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
    router.push("/");
  };

  if (!doc) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-muted text-sm">Loading document…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
            Document Overview
          </button>
          <button onClick={handleDelete} disabled={deleting} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>

        {/* Hero card */}
        <div className="mv-card mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-soft flex items-center justify-center text-3xl shrink-0">
              {CAT_ICONS[doc.category]||"📌"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-primary leading-snug">{doc.title}</h1>
              <p className="text-sm text-faint mt-1">{doc.fileName}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-faint">Confidence</div>
              <div className="text-lg font-bold text-green-600">{doc.confidence}%</div>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            {l:"Type", v:doc.category},
            {l:"Year", v:doc.year},
            {l:"Uploaded", v:new Date(doc.uploadedAt).toLocaleDateString()},
            {l:"File", v:doc.fileName.slice(0,28)},
          ].map(r => (
            <div key={r.l} className="mv-card">
              <div className="text-[11px] text-faint uppercase tracking-wide">{r.l}</div>
              <div className="text-sm font-semibold text-primary mt-1 truncate">{r.v}</div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mv-card mb-6">
          <h3 className="text-xs font-bold text-faint uppercase tracking-widest mb-3">Summary</h3>
          <p className="text-sm text-muted leading-relaxed">{doc.summary}</p>
        </div>

        {/* Skills */}
        {doc.entities.skills.length > 0 && (
          <div className="mv-card mb-6">
            <h3 className="text-xs font-bold text-faint uppercase tracking-widest mb-3">Detected Skills</h3>
            <div className="flex flex-wrap gap-2">
              {doc.entities.skills.map(s => (
                <Link key={s} href={`/search?q=${encodeURIComponent(s)}`}
                  className="text-xs bg-soft border border-edge rounded-pill px-3 py-1.5 font-medium text-primary hover:border-primary/40 transition-colors">{s}</Link>
              ))}
            </div>
          </div>
        )}

        {/* Organizations */}
        {doc.entities.organizations.length > 0 && (
          <div className="mv-card mb-6">
            <h3 className="text-xs font-bold text-faint uppercase tracking-widest mb-3">Organizations</h3>
            <div className="flex flex-wrap gap-2">
              {doc.entities.organizations.map(o => (
                <span key={o} className="text-xs bg-soft border border-edge rounded-pill px-3 py-1.5 font-medium text-primary">{o}</span>
              ))}
            </div>
          </div>
        )}

        {/* Related docs */}
        {related.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-faint uppercase tracking-widest mb-3">Linked To</h3>
            <div className="space-y-2">
              {related.map(r => (
                <Link key={r.id} href={`/document/${r.id}`}
                  className="flex items-center gap-3 mv-card hover:shadow-card transition-all group">
                  <span className="text-lg">{CAT_ICONS[r.category]||"📌"}</span>
                  <span className="flex-1 text-sm font-medium text-primary truncate">{r.title}</span>
                  <svg className="w-4 h-4 text-faint group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
