"use client";
import { useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  "Scanning document…",
  "Extracting text (OCR)…",
  "Identifying skills…",
  "Detecting entities…",
  "Generating embedding…",
  "Building knowledge graph…",
  "Finalizing…",
];

const SOURCES = [
  { key:"files", label:"Files", icon:"📄" },
  { key:"camera", label:"Camera", icon:"📷" },
  { key:"gallery", label:"Gallery", icon:"🖼️" },
  { key:"drive", label:"Google Drive", icon:"🟢" },
  { key:"onedrive", label:"OneDrive", icon:"🔵" },
  { key:"github", label:"GitHub", icon:"🐙" },
  { key:"linkedin", label:"LinkedIn", icon:"💼" },
  { key:"link", label:"Link / URL", icon:"🔗" },
  { key:"notion", label:"Notion", icon:"⬜" },
];

export default function Upload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  
  // Modals state
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubInput, setGithubInput] = useState("");

  const animateProgress = () => {
    setProcessing(true);
    setError("");
    setStep(0);
    setProgress(0);
    return setInterval(() => {
      setStep(s => Math.min(s + 1, STEPS.length - 1));
      setProgress(p => Math.min(p + Math.random() * 18 + 8, 90));
    }, 700);
  };

  const finishProgress = (docId: string, interval: NodeJS.Timeout) => {
    clearInterval(interval);
    setProgress(100);
    setStep(STEPS.length - 1);
    setTimeout(() => router.push(`/document/${docId}`), 600);
  };

  const handleFail = (e: any, interval: NodeJS.Timeout) => {
    clearInterval(interval);
    setError(e.message || "Upload failed");
    setProcessing(false);
  };

  const runUpload = async (file: File) => {
    const interval = animateProgress();
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Upload failed"); }
      const { doc } = await res.json();
      finishProgress(doc.id, interval);
    } catch (e: any) { handleFail(e, interval); }
  };

  const runUrlUpload = async () => {
    if (!urlInput) return;
    setShowUrlModal(false);
    const interval = animateProgress();
    try {
      const res = await fetch("/api/upload-url", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ url: urlInput }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "URL scrape failed"); }
      const { doc } = await res.json();
      finishProgress(doc.id, interval);
    } catch (e: any) { handleFail(e, interval); }
  };

  const runGithubUpload = async () => {
    if (!githubInput) return;
    setShowGithubModal(false);
    const interval = animateProgress();
    try {
      const res = await fetch("/api/upload-github", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ repoUrl: githubInput }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "GitHub sync failed. Did you connect your account in Settings?"); }
      const { doc } = await res.json();
      finishProgress(doc.id, interval);
    } catch (e: any) { handleFail(e, interval); }
  };

  const runMockUpload = async (provider: string) => {
    const interval = animateProgress();
    try {
      const res = await fetch("/api/upload-mock", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ provider }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Sync failed"); }
      const { doc } = await res.json();
      finishProgress(doc.id, interval);
    } catch (e: any) { handleFail(e, interval); }
  };

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    runUpload(files[0]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    onFiles(e.dataTransfer.files);
  }, []);

  if (processing) return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-sm w-full animate-fade-up">
        <h1 className="text-2xl font-bold text-primary mb-2">Processing Your Content</h1>
        <p className="text-sm text-muted mb-10">Our AI is analyzing and extracting knowledge</p>

        {/* Circular progress */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <svg width="160" height="160">
              <circle cx="80" cy="80" r="68" fill="none" stroke="#F5F5F7" strokeWidth="10"/>
              <circle cx="80" cy="80" r="68" fill="none" stroke="#111" strokeWidth="10"
                strokeDasharray={2*Math.PI*68}
                strokeDashoffset={2*Math.PI*68*(1-progress/100)}
                strokeLinecap="round"
                style={{transform:"rotate(-90deg)",transformOrigin:"50% 50%",transition:"stroke-dashoffset 0.4s ease"}}/>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="26" fontWeight="700" fill="#111">
                {Math.round(progress)}%
              </text>
            </svg>
          </div>
        </div>

        {/* Steps checklist */}
        <div className="text-left space-y-3">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex items-center gap-3 transition-all ${i > step ? "opacity-30" : ""}`}>
              {i < step ? (
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
              ) : i === step ? (
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <svg className="animate-spin-slow w-3 h-3" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="8"/></svg>
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full border border-edge shrink-0"/>
              )}
              <span className={`text-sm ${i === step ? "font-semibold text-primary" : "text-muted"}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white px-4 py-8 max-w-2xl mx-auto relative">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Upload Your Content</h1>
        <p className="text-sm text-muted mt-1">Add documents from anywhere</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">{error}</div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-card p-14 flex flex-col items-center cursor-pointer transition-all mb-8 ${dragging ? "border-primary bg-soft" : "border-edge bg-soft hover:border-primary/40"}`}>
        <input ref={inputRef} type="file" className="hidden" onChange={e => onFiles(e.target.files)}
          accept=".pdf,.docx,.txt,.csv,.md,.json,.png,.jpg,.jpeg"/>
        <input ref={cameraRef} type="file" className="hidden" onChange={e => onFiles(e.target.files)}
          accept="image/*" capture="environment"/>
        <input ref={galleryRef} type="file" className="hidden" onChange={e => onFiles(e.target.files)}
          accept="image/*"/>
        <svg width="36" height="36" fill="none" stroke="#9A9A9E" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/>
        </svg>
        <p className="font-semibold text-primary mt-4">Drag & drop files here</p>
        <p className="text-sm text-faint mt-1">or tap to browse</p>
      </div>

      {/* Sources grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {SOURCES.map(s => (
          <button key={s.key} onClick={() => {
              if (s.key === "files") inputRef.current?.click();
              else if (s.key === "camera") cameraRef.current?.click();
              else if (s.key === "gallery") galleryRef.current?.click();
              else if (s.key === "link") setShowUrlModal(true);
              else if (s.key === "github") setShowGithubModal(true);
              else runMockUpload(s.key);
            }}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-soft border border-edge hover:border-primary/30 transition-all active:scale-95">
            <span className="text-2xl">{s.icon}</span>
            <span className="text-xs font-medium text-primary">{s.label}</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-faint text-center">We support PDF, DOC, DOCX, PPT, TXT, PNG, JPG. Max file size 50MB.</p>

      {/* URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-up">
            <h3 className="font-bold text-primary mb-2">Import from URL</h3>
            <p className="text-sm text-muted mb-4">Paste an article or website link to scrape its contents.</p>
            <input type="url" placeholder="https://..." value={urlInput} onChange={e=>setUrlInput(e.target.value)} 
              className="w-full border border-edge rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:border-primary"/>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowUrlModal(false)} className="px-4 py-2 text-sm font-semibold text-muted hover:bg-soft rounded-lg transition-colors">Cancel</button>
              <button onClick={runUrlUpload} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg transition-transform active:scale-95">Import</button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-up">
            <h3 className="font-bold text-primary mb-2">Sync GitHub Repo</h3>
            <p className="text-sm text-muted mb-4">Enter a public repository URL to index its README.</p>
            <input type="text" placeholder="github.com/username/repo" value={githubInput} onChange={e=>setGithubInput(e.target.value)} 
              className="w-full border border-edge rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:border-primary"/>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowGithubModal(false)} className="px-4 py-2 text-sm font-semibold text-muted hover:bg-soft rounded-lg transition-colors">Cancel</button>
              <button onClick={runGithubUpload} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg transition-transform active:scale-95">Sync Repo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
