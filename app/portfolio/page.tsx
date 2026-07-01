"use client";
import { useState, useEffect } from "react";

const SECTIONS = ["About Me","Skills","Projects","Certifications","Experience","Contact"];

export default function PortfolioPage() {
  const [selected, setSelected] = useState<string[]>(SECTIONS);
  const [building, setBuilding] = useState(false);
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/profile").then(r=>r.json()).then(d=>setProfile(d.profile));
    fetch("/api/documents").then(r=>r.json()).then(d=>setDocs(d.documents||[]));
  }, []);

  const toggle = (s: string) => setSelected(cur => cur.includes(s) ? cur.filter(x=>x!==s) : [...cur, s]);

  const build = async () => {
    setBuilding(true);
    await new Promise(r => setTimeout(r, 1200)); // realistic feel
    setBuilding(false); setReady(true);
  };

  const preview = () => window.open("/api/portfolio", "_blank");

  const download = async () => {
    const res = await fetch("/api/portfolio");
    const html = await res.text();
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "portfolio.html"; a.click();
  };

  const projects = docs.filter(d => d.category === "Project").slice(0,3);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">AI Portfolio Generator</h1>
          <p className="text-sm text-muted mt-1">Build your portfolio in minutes from real documents</p>
        </div>

        {/* Preview card */}
        <div className="relative rounded-card overflow-hidden mb-8 h-52">
          <img src="https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=1200&q=80"
            alt="portfolio" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10"/>
          <div className="absolute bottom-5 left-6">
            <p className="text-white font-bold text-xl">{profile?.name || "Your Name"}</p>
            <p className="text-white/75 text-sm mt-1">{profile?.title || "AI Enthusiast & Developer"}</p>
          </div>
          {ready && (
            <button onClick={preview}
              className="absolute top-4 right-4 bg-white text-primary text-xs font-bold px-4 py-2 rounded-pill hover:bg-soft transition-colors">
              View Portfolio →
            </button>
          )}
        </div>

        {/* Projects preview */}
        {projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-faint uppercase tracking-widest mb-4">Projects ({docs.filter(d=>d.category==="Project").length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {projects.map((p,i) => (
                <div key={p.id} className="rounded-2xl overflow-hidden border border-edge">
                  <img src={`https://images.unsplash.com/photo-${["1555066931-4365d14bab8c","1517694712202-14dd9538aa97","1607799279861-4dd421887fb3"][i%3]}?w=400&q=70`}
                    alt={p.title} className="w-full h-28 object-cover"/>
                  <div className="p-3 bg-soft">
                    <p className="text-xs font-semibold text-primary truncate">{p.title}</p>
                    <p className="text-[11px] text-faint mt-0.5">{p.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section toggles */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-faint uppercase tracking-widest mb-4">Select Sections</h2>
          <div className="grid grid-cols-2 gap-3">
            {SECTIONS.map(s => (
              <button key={s} onClick={() => toggle(s)}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${selected.includes(s) ? "border-primary bg-primary/5" : "border-edge bg-soft"}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${selected.includes(s) ? "bg-primary border-primary" : "border-edge"}`}>
                  {selected.includes(s) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5 3.8 7.5 8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className="text-sm font-medium text-primary">{s}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Build / Export */}
        {!ready ? (
          <button onClick={build} disabled={building}
            className="w-full h-14 rounded-card bg-primary text-white font-semibold text-base hover:bg-primary/90 disabled:opacity-60 transition-all active:scale-[0.99] flex items-center justify-center gap-3">
            {building ? (
              <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Building Portfolio…</>
            ) : "✦ Generate Portfolio"}
          </button>
        ) : (
          <div className="space-y-3 animate-fade-up">
            <div className="mv-card bg-green-50 border-green-200 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold text-green-800">Portfolio Ready!</p>
                <p className="text-xs text-green-600 mt-0.5">Generated from {docs.length} real document(s)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={preview} className="flex-1 h-12 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all active:scale-95">
                Preview →
              </button>
              <button onClick={download} className="flex-1 h-12 rounded-2xl bg-soft border border-edge text-primary font-semibold text-sm hover:border-primary/30 transition-all active:scale-95">
                Download HTML
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
