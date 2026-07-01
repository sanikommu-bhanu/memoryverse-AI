"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [clearing, setClearing] = useState(false);
  
  // Interactive States
  const [darkMode, setDarkMode] = useState(false);
  const [font, setFont] = useState("Inter");
  
  const [github, setGithub] = useState({ loading: false, connected: false });
  const [linkedin, setLinkedin] = useState({ loading: false, connected: false });
  const [gdrive, setGdrive] = useState({ loading: false, connected: false });
  const [onedrive, setOnedrive] = useState({ loading: false, connected: false });

  useEffect(() => {
    setDarkMode(localStorage.getItem("darkMode") === "true");
    setFont(localStorage.getItem("font") === "Playfair" ? "Playfair" : "Inter");
    
    // Load mock connected states
    setGithub({ loading: false, connected: localStorage.getItem("github_connected") === "true" });
    setLinkedin({ loading: false, connected: localStorage.getItem("linkedin_connected") === "true" });
    setGdrive({ loading: false, connected: localStorage.getItem("gdrive_connected") === "true" });
    setOnedrive({ loading: false, connected: localStorage.getItem("onedrive_connected") === "true" });
  }, []);

  const clearAll = async () => {
    if (!confirm("This will delete ALL your documents and data. This cannot be undone.")) return;
    setClearing(true);
    await fetch("/api/documents", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({id:"__ALL__"}) }).catch(()=>{});
    const res = await fetch("/api/documents");
    const { documents } = await res.json();
    for (const d of documents) {
      await fetch("/api/documents", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id:d.id}) });
    }
    await fetch("/api/chat", { method:"DELETE" });
    localStorage.clear();
    setClearing(false);
    
    // Reset dark mode if they clear data
    document.documentElement.classList.remove("dark");
    document.body.style.fontFamily = "'Inter', system-ui, sans-serif";
    
    router.push("/");
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", String(next));
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const toggleFont = () => {
    const next = font === "Inter" ? "Playfair" : "Inter";
    setFont(next);
    localStorage.setItem("font", next);
    if (next === "Playfair") document.body.style.fontFamily = "'Playfair Display', serif";
    else document.body.style.fontFamily = "'Inter', system-ui, sans-serif";
  };

  const handleConnect = (setter: any, key: string) => {
    setter((prev: any) => ({ ...prev, loading: true }));
    setTimeout(() => {
      setter({ loading: false, connected: true });
      localStorage.setItem(key, "true");
    }, 1500);
  };

  const showPolicy = (title: string) => {
    alert(`Mock ${title} viewer\n\nIn a production app, this would open a modal or redirect to the ${title} page. For this hackathon, we care about your privacy and keeping data secure!`);
  };

  const Section = ({ title, children }: { title:string; children:React.ReactNode }) => (
    <div className="mb-8 animate-fade-up">
      <p className="text-[11px] font-bold text-faint uppercase tracking-widest mb-3 px-1">{title}</p>
      <div className="mv-card overflow-hidden p-0">{children}</div>
    </div>
  );

  const Row = ({ icon, label, right, onClick, danger }: { icon:string; label:string; right?:React.ReactNode; onClick?:()=>void; danger?:boolean }) => (
    <button onClick={onClick} disabled={!onClick} className={`w-full flex items-center gap-4 px-5 py-4 border-b border-edge last:border-0 text-left transition-colors ${onClick?"hover:bg-soft":""} ${!onClick ? "cursor-default":""}`}>
      <span className="text-lg w-6 text-center">{icon}</span>
      <span className={`flex-1 text-sm font-medium ${danger?"text-red-500":"text-primary"}`}>{label}</span>
      {right ?? (onClick ? <svg className="w-4 h-4 text-faint" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg> : null)}
    </button>
  );

  const Toggle = ({ on }: { on:boolean }) => (
    <div className={`w-11 h-6 rounded-full transition-colors ${on?"bg-primary":"bg-edge"} relative`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${on?"translate-x-6":"translate-x-1"}`}/>
    </div>
  );

  const ConnectBtn = ({ state, name, storageKey, setter }: { state: any, name: string, storageKey: string, setter: any }) => {
    if (state.connected) return <span className="text-xs font-semibold px-3 py-1.5 rounded-pill bg-soft text-primary border border-edge flex items-center gap-1"><span className="text-green-500">✓</span> Connected</span>;
    if (state.loading) return <span className="text-xs text-faint animate-pulse">Connecting…</span>;
    return <button onClick={(e) => { e.stopPropagation(); handleConnect(setter, storageKey); }} className="text-xs font-semibold text-primary hover:bg-soft px-3 py-1.5 rounded-pill transition-colors border border-transparent hover:border-edge">Connect</button>;
  };

  return (
    <div className="min-h-screen bg-soft">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Settings</h1>
          <p className="text-sm text-muted mt-1">Configure MemoryVerse AI</p>
        </div>

        <Section title="AI Configuration">
          <Row icon="✦" label="Gemini API Key" right={
            <span className="text-xs font-semibold px-3 py-1.5 rounded-pill bg-soft text-faint border border-edge">
              {process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY ? "Connected" : "Set in .env"}
            </span>
          }/>
          <Row icon="🧠" label="Embedding Model" right={<span className="text-xs text-faint">text-embedding-004</span>}/>
          <Row icon="⚡" label="LLM Model" right={<span className="text-xs text-faint">gemini-1.5-flash</span>}/>
        </Section>

        <Section title="Appearance">
          <Row icon="🌙" label="Dark Mode" onClick={toggleDarkMode} right={<Toggle on={darkMode}/>}/>
          <Row icon="🔤" label="Font" onClick={toggleFont} right={<span className="text-xs font-semibold text-primary px-3 py-1 border border-edge rounded-lg">{font}</span>}/>
        </Section>

        <Section title="Connected Accounts">
          <Row icon="🐙" label="GitHub" onClick={() => handleConnect(setGithub, "github_connected")} right={<ConnectBtn state={github} name="GitHub" storageKey="github_connected" setter={setGithub}/>}/>
          <Row icon="💼" label="LinkedIn" onClick={() => handleConnect(setLinkedin, "linkedin_connected")} right={<ConnectBtn state={linkedin} name="LinkedIn" storageKey="linkedin_connected" setter={setLinkedin}/>}/>
          <Row icon="🟢" label="Google Drive" onClick={() => handleConnect(setGdrive, "gdrive_connected")} right={<ConnectBtn state={gdrive} name="Google Drive" storageKey="gdrive_connected" setter={setGdrive}/>}/>
          <Row icon="🔵" label="OneDrive" onClick={() => handleConnect(setOnedrive, "onedrive_connected")} right={<ConnectBtn state={onedrive} name="OneDrive" storageKey="onedrive_connected" setter={setOnedrive}/>}/>
        </Section>

        <Section title="Privacy & Security">
          <Row icon="🔒" label="Privacy Policy" onClick={() => showPolicy("Privacy Policy")}/>
          <Row icon="📋" label="Terms of Service" onClick={() => showPolicy("Terms of Service")}/>
          <Row icon="📤" label="Export My Data" onClick={async () => {
            const res = await fetch("/api/documents");
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
            const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
            a.download = "memoryverse_export.json"; a.click();
          }}/>
        </Section>

        <Section title="Danger Zone">
          <Row icon="🗑️" label={clearing ? "Clearing…" : "Clear All Data"} danger onClick={clearAll}
            right={<span className="text-xs font-semibold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-pill">{clearing ? "…":"Delete all"}</span>}/>
        </Section>

        <div className="text-center mt-8 pb-8">
          <p className="text-xs text-faint">MemoryVerse AI · Built for Wooble Hackathon '26</p>
          <p className="text-xs text-faint mt-1">AI Stack: Gemini 1.5 Flash · text-embedding-004 · Cosine Vector Search · RAG</p>
        </div>
      </div>
    </div>
  );
}
