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
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const runUpload = async (file: File) => {
    setProcessing(true);
    setError("");
    setStep(0);
    setProgress(0);

    // Animate steps
    const stepInterval = setInterval(() => {
      setStep(s => Math.min(s + 1, STEPS.length - 1));
      setProgress(p => Math.min(p + Math.random() * 18 + 8, 90));
    }, 700);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      clearInterval(stepInterval);
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Upload failed"); }
      const { doc } = await res.json();
      setProgress(100);
      setStep(STEPS.length - 1);
      await new Promise(r => setTimeout(r, 600));
      router.push(`/document/${doc.id}`);
    } catch (e: any) {
      clearInterval(stepInterval);
      setError(e.message || "Upload failed");
      setProcessing(false);
    }
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
        <h1 className="text-2xl font-bold text-primary mb-2">Processing Your Document</h1>
        <p className="text-sm text-muted mb-10">Our AI is understanding your content</p>

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
    <div className="min-h-screen bg-white px-4 py-8 max-w-2xl mx-auto">
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
              else alert(`Connect ${s.label} in Settings to enable this integration.`);
            }}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-soft border border-edge hover:border-primary/30 transition-all active:scale-95">
            <span className="text-2xl">{s.icon}</span>
            <span className="text-xs font-medium text-primary">{s.label}</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-faint text-center">We support PDF, DOC, DOCX, PPT, TXT, PNG, JPG. Max file size 50MB.</p>
    </div>
  );
}
