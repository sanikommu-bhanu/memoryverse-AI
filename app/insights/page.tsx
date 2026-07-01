"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function Ring({ pct, size=96, stroke=8, color="#111" }: { pct:number; size?:number; stroke?:number; color?:string }) {
  const r = (size-stroke)/2;
  const c = 2*Math.PI*r;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F5F5F7" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - (c * Math.min(100, pct)) / 100}
        strokeLinecap="round"
        style={{transform:"rotate(-90deg)",transformOrigin:"50% 50%",transition:"stroke-dashoffset .8s ease"}}/>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fontSize={size/5.5} fontWeight="700" fill={color}>{Math.round(pct)}%</text>
    </svg>
  );
}

function Bar({ label, pct, color="#111" }: { label:string; pct:number; color?:string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-primary">{label}</span>
        <span className="font-bold text-primary">{pct}%</span>
      </div>
      <div className="h-2 bg-soft rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{width:`${pct}%`, background:color}}/>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [ins, setIns] = useState<any>(null);

  useEffect(() => {
    fetch("/api/insights").then(r=>r.json()).then(setIns);
  }, []);

  if (!ins) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const skillBars = ins.topSkills.slice(0,6).map((s:string, i:number) => ({
    label: s, pct: Math.max(40, 95 - i*9),
  }));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Career Insights</h1>
          <p className="text-sm text-muted mt-1">AI-computed from your {ins.totalDocs} document{ins.totalDocs!==1?"s":""}</p>
        </div>

        {/* Readiness hero */}
        <div className="mv-card flex items-center gap-6 mb-6">
          <Ring pct={ins.readiness} size={100} stroke={9}/>
          <div className="flex-1">
            <p className="text-xs font-bold text-faint uppercase tracking-widest">Job Readiness</p>
            <p className="text-lg font-bold text-primary mt-2 leading-snug">
              You're {ins.readiness}% ready for{" "}
              <span className="border-b-2 border-primary">AI Engineer</span> roles.
            </p>
            <p className="text-sm text-muted mt-2">
              {ins.missingSkills[0] ? `Next: Complete ${ins.missingSkills[0]}` : "Excellent — all core areas covered!"}
            </p>
          </div>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="mv-card flex flex-col items-center py-6">
            <Ring pct={ins.resumeScore} size={72} stroke={6} color="#2563EB"/>
            <p className="text-sm font-semibold text-primary mt-3">Resume Score</p>
          </div>
          <div className="mv-card flex flex-col items-center py-6">
            <Ring pct={ins.portfolioScore} size={72} stroke={6} color="#7C3AED"/>
            <p className="text-sm font-semibold text-primary mt-3">Portfolio Score</p>
          </div>
        </div>

        {/* Document breakdown */}
        <div className="mv-card mb-6">
          <h3 className="text-xs font-bold text-faint uppercase tracking-widest mb-5">Document Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { l:"Certificates", v: ins.breakdown.certs, e:"🏅" },
              { l:"Projects",     v: ins.breakdown.projects, e:"🚀" },
              { l:"Internships",  v: ins.breakdown.internships, e:"💼" },
              { l:"Research",     v: ins.breakdown.research, e:"🔬" },
              { l:"Achievements", v: ins.breakdown.achievements, e:"🏆" },
              { l:"Total",        v: ins.totalDocs, e:"📁" },
            ].map(x => (
              <div key={x.l} className="text-center p-3 rounded-2xl bg-soft">
                <div className="text-2xl mb-1">{x.e}</div>
                <div className="text-xl font-bold text-primary">{x.v}</div>
                <div className="text-[11px] text-faint mt-0.5">{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top skills */}
        {skillBars.length > 0 && (
          <div className="mv-card mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-faint uppercase tracking-widest">Top Technologies</h3>
              <Link href="/search" className="text-xs text-faint hover:text-primary transition-colors">View all →</Link>
            </div>
            <div className="space-y-4">
              {skillBars.map((b:any) => <Bar key={b.label} label={b.label} pct={b.pct}/>)}
            </div>
          </div>
        )}

        {/* Missing skills */}
        {ins.missingSkills.length > 0 && (
          <div className="mv-card mb-6">
            <h3 className="text-xs font-bold text-faint uppercase tracking-widest mb-4">Suggested Next Steps</h3>
            <div className="space-y-3">
              {ins.missingSkills.map((m:string) => (
                <div key={m} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                  <span className="text-lg mt-0.5">⚡</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">{m}</p>
                    <p className="text-xs text-amber-700 mt-0.5">Adding this will boost your readiness score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/resume" className="mv-card hover:shadow-card transition-all text-center py-5 cursor-pointer group">
            <div className="text-2xl mb-2">📄</div>
            <p className="font-semibold text-sm text-primary">Generate Resume</p>
            <p className="text-xs text-faint mt-1">ATS-optimized</p>
          </Link>
          <Link href="/portfolio" className="mv-card hover:shadow-card transition-all text-center py-5 cursor-pointer group">
            <div className="text-2xl mb-2">🌐</div>
            <p className="font-semibold text-sm text-primary">Build Portfolio</p>
            <p className="text-xs text-faint mt-1">Deployable HTML</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
