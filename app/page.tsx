"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MemoryDoc } from "@/lib/types";

const UNSPLASH = {
  workspace: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80",
  avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80",
};

const CATS = ["Certificates","Projects","Internships","Skills","Resume","Research","GitHub","Achievements"];
const CAT_ICONS: Record<string,string> = {
  Certificates:"🏅", Projects:"🚀", Internships:"💼", Skills:"⚡",
  Resume:"📄", Research:"🔬", GitHub:"🐙", Achievements:"🏆",
};

function ProgressRing({ pct, size=96, stroke=8 }: { pct:number; size?:number; stroke?:number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (circ * pct) / 100;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F5F5F7" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#111" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        style={{transform:"rotate(-90deg)",transformOrigin:"50% 50%",transition:"stroke-dashoffset .6s ease"}}/>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize={size/5.5} fontWeight="700" fill="#111">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [docs, setDocs] = useState<MemoryDoc[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeCat, setActiveCat] = useState("Certificates");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    if (!localStorage.getItem("signedIn")) {
      router.push("/splash");
      return;
    }
    fetch("/api/documents").then(r=>r.json()).then(d=>setDocs(d.documents||[]));
    fetch("/api/insights").then(r=>r.json()).then(setInsights);
    fetch("/api/profile").then(r=>r.json()).then(d=>setProfile(d.profile));
  }, [router]);

  const name = profile?.name?.split(" ")[0] || "there";
  const counts: Record<string,number> = {};
  docs.forEach(d => { counts[d.category] = (counts[d.category]||0)+1; });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-56 lg:h-72 w-full overflow-hidden">
        <img src={UNSPLASH.workspace} alt="workspace" className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60"/>
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{greeting}</p>
            <h1 className="text-white text-3xl font-bold mt-1">{name} 👋</h1>
          </div>
          <Link href="/profile">
            <img src={UNSPLASH.avatar} alt="avatar" className="w-11 h-11 rounded-full border-2 border-white object-cover"/>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Search bar */}
        <Link href="/search"
          className="flex items-center gap-3 w-full bg-soft border border-edge rounded-2xl px-5 py-4 text-faint text-sm hover:border-primary/30 transition-colors cursor-text">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Ask MemoryVerse...
        </Link>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATS.map(c => (
            <button key={c} onClick={() => setActiveCat(c)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-pill text-sm font-medium whitespace-nowrap transition-all shrink-0 ${activeCat===c ? "bg-primary text-white" : "bg-soft text-primary border border-edge hover:border-primary/30"}`}>
              <span>{CAT_ICONS[c]}</span>{c}
            </button>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {k:"Certificate",l:"Certificates"},{k:"Project",l:"Projects"},
            {k:"Internship",l:"Internships"},{k:"Skill",l:"Skills"},
            {k:"Resume",l:"Resume"},{k:"Achievement",l:"Achievements"},
          ].map(s => (
            <Link href={`/search?category=${s.k}`} key={s.k}
              className="mv-card flex flex-col items-center py-4 hover:shadow-card transition-shadow text-center cursor-pointer">
              <span className="text-xl mb-1">{CAT_ICONS[s.l]||"📌"}</span>
              <span className="text-2xl font-bold text-primary">{counts[s.k]||0}</span>
              <span className="text-[11px] text-faint mt-1">{s.l}</span>
            </Link>
          ))}
        </div>

        {/* AI Insight card */}
        {insights && (
          <div className="mv-card flex items-center gap-6">
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-faint uppercase tracking-widest">AI Insight</span>
              <p className="text-lg font-bold text-primary mt-2 leading-snug">
                You're {insights.readiness}% ready for AI Engineer roles.
              </p>
              <p className="text-sm text-muted mt-2">
                {insights.missingSkills[0] ? `Complete: ${insights.missingSkills[0]}` : "You're building a strong profile — keep going."}
              </p>
              <Link href="/insights"
                className="inline-block mt-3 text-xs font-semibold text-primary border border-edge rounded-pill px-4 py-2 hover:bg-soft transition-colors">
                View Full Insights →
              </Link>
            </div>
            <ProgressRing pct={insights.readiness} size={80} stroke={7}/>
          </div>
        )}

        {/* Journey Timeline preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Journey Timeline</h2>
            <Link href="/journey" className="text-sm text-faint hover:text-primary transition-colors">View All</Link>
          </div>
          {docs.length === 0 ? (
            <div className="mv-card flex flex-col items-center py-10 text-center">
              <span className="text-3xl mb-3">📁</span>
              <p className="font-semibold text-primary">No documents yet</p>
              <p className="text-sm text-muted mt-1">Upload your first document to start your journey</p>
              <Link href="/upload" className="mv-btn-primary mt-4">Upload Now</Link>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {docs.slice(0,8).map(d => (
                <Link key={d.id} href={`/document/${d.id}`}
                  className="shrink-0 w-44 mv-card hover:shadow-card transition-shadow">
                  <span className="text-[11px] font-bold text-faint">{d.year}</span>
                  <p className="text-sm font-semibold text-primary mt-1 leading-snug line-clamp-2">{d.title}</p>
                  <span className="mt-3 inline-block text-[11px] bg-soft text-muted px-2 py-1 rounded-pill">{d.category}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent documents */}
        {docs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-primary">Recent Uploads</h2>
              <Link href="/search" className="text-sm text-faint hover:text-primary">View All</Link>
            </div>
            <div className="space-y-3">
              {docs.slice(0,5).map(d => (
                <Link key={d.id} href={`/document/${d.id}`}
                  className="flex items-center gap-4 mv-card hover:shadow-card transition-all group">
                  <div className="w-10 h-10 rounded-2xl bg-soft flex items-center justify-center shrink-0 text-lg">
                    {CAT_ICONS[d.category]||"📌"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary text-sm truncate">{d.title}</p>
                    <p className="text-xs text-faint mt-0.5">{d.category} · {d.year}</p>
                  </div>
                  <span className="text-xs text-faint font-medium bg-soft px-2 py-1 rounded-pill">{d.confidence}%</span>
                  <svg className="w-4 h-4 text-faint group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
