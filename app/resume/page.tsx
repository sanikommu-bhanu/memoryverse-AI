"use client";
import { useState } from "react";

const TEMPLATES = [
  { key:"ATS", label:"ATS", desc:"Keyword-optimized for applicant tracking systems" },
  { key:"Modern", label:"Modern", desc:"Clean contemporary design with subtle styling" },
  { key:"Professional", label:"Professional", desc:"Traditional format trusted by top companies" },
  { key:"Minimal", label:"Minimal", desc:"Distraction-free, elegant one-pager" },
];

export default function ResumePage() {
  const [template, setTemplate] = useState("ATS");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true); setResume("");
    try {
      const res = await fetch("/api/resume", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ template }) });
      const data = await res.json();
      setResume(data.resume || "");
    } catch { setResume("Generation failed. Please try again."); }
    finally { setLoading(false); }
  };

  const copyText = () => {
    navigator.clipboard.writeText(resume);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([resume], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `resume_${template.toLowerCase()}.md`; a.click();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">AI Resume Builder</h1>
          <p className="text-sm text-muted mt-1">Create professional resumes from your real documents</p>
        </div>

        {/* Template picker */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-faint uppercase tracking-widest mb-4">Choose Template</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {TEMPLATES.map(t => (
              <button key={t.key} onClick={() => setTemplate(t.key)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${template===t.key ? "border-primary bg-primary/5" : "border-edge bg-soft hover:border-primary/30"}`}>
                <div className="w-full h-16 rounded-xl mb-3 flex flex-col gap-1 justify-center px-3 overflow-hidden"
                  style={{background: template===t.key ? "#111" : "#E5E5E7"}}>
                  {[1,2,3].map(i => <div key={i} className="h-1 rounded-full" style={{width:`${80-i*15}%`, background: template===t.key ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.7)"}}/>)}
                </div>
                <div className="font-semibold text-sm text-primary">{t.label}</div>
                <div className="text-[11px] text-faint mt-0.5 leading-snug">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button onClick={generate} disabled={loading}
          className="w-full h-14 rounded-card bg-primary text-white font-semibold text-base hover:bg-primary/90 disabled:opacity-60 transition-all active:scale-[0.99] flex items-center justify-center gap-3">
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Generating with AI…</>
          ) : "✦ Generate Resume"}
        </button>

        {/* Resume output */}
        {resume && (
          <div className="mt-8 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-primary">Your Resume</h2>
              <div className="flex gap-2">
                <button onClick={copyText} className="mv-btn-secondary text-sm px-4 py-2">
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
                <button onClick={download} className="mv-btn-primary text-sm px-4 py-2">
                  Download .md
                </button>
              </div>
            </div>
            <div className="mv-card font-mono text-[13px] text-primary leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-[600px] overflow-y-auto">
              {resume}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
