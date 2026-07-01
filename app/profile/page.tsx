"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const CAT_ICONS: Record<string,string> = {
  Certificate:"🏅",Project:"🚀",Internship:"💼",Skill:"⚡",
  Research:"🔬",Achievement:"🏆",Resume:"📄",Other:"📌",
};

const MENU = [
  { href:"/journey",  icon:"◎", label:"My Timeline" },
  { href:"/search?category=Certificate", icon:"🏅", label:"My Certificates" },
  { href:"/search?category=Project",    icon:"🚀", label:"My Projects" },
  { href:"/search?category=Internship", icon:"💼", label:"My Internships" },
  { href:"/insights", icon:"↗", label:"Career Insights" },
  { href:"/resume",   icon:"📄", label:"Resume Builder" },
  { href:"/portfolio",icon:"🌐", label:"Portfolio Builder" },
  { href:"/settings", icon:"⚙", label:"Settings" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", title:"", location:"", bio:"" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then(r=>r.json()).then(d => { setProfile(d.profile); if(d.profile) setForm(d.profile); });
    fetch("/api/documents").then(r=>r.json()).then(d=>setDocs(d.documents||[]));
  }, []);

  const skills = [...new Set(docs.flatMap((d:any) => d.entities?.skills || []))];
  const stats = {
    documents: docs.length,
    skills: skills.length,
    projects: docs.filter((d:any)=>d.category==="Project").length,
    achievements: docs.filter((d:any)=>d.category==="Achievement").length,
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/profile", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    setProfile(form); setSaving(false); setEditing(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Cover */}
      <div className="relative h-44">
        <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80"
          alt="cover" className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"/>
        <Link href="/settings"
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors">
          ⚙
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Avatar + name */}
        <div className="flex flex-col items-center -mt-12 mb-6">
          <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80"
            alt="avatar" className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-card"/>
          <h1 className="text-xl font-bold text-primary mt-3">{profile?.name || "Your Name"}</h1>
          <p className="text-sm text-muted mt-1">{profile?.title || "AI Enthusiast & Developer"}</p>
          {profile?.location && (
            <p className="text-xs text-faint mt-1 flex items-center gap-1">📍 {profile.location}</p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { l:"Documents", v:stats.documents },
            { l:"Skills", v:stats.skills },
            { l:"Projects", v:stats.projects },
            { l:"Achievements", v:stats.achievements },
          ].map(s => (
            <div key={s.l} className="text-center p-3 rounded-2xl bg-soft border border-edge">
              <div className="text-2xl font-bold text-primary">{s.v}</div>
              <div className="text-[11px] text-faint mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Edit profile */}
        {!editing ? (
          <div className="mv-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-primary">Profile</h3>
              <button onClick={() => setEditing(true)} className="text-xs font-semibold text-faint hover:text-primary transition-colors px-3 py-1.5 rounded-xl bg-soft">Edit</button>
            </div>
            <div className="space-y-3 text-sm">
              <Row label="Name" value={profile?.name || "—"}/>
              <Row label="Email" value={profile?.email || "—"}/>
              <Row label="Title" value={profile?.title || "—"}/>
              <Row label="Location" value={profile?.location || "—"}/>
              {profile?.bio && <Row label="Bio" value={profile.bio}/>}
            </div>
          </div>
        ) : (
          <div className="mv-card mb-6 animate-fade-up">
            <h3 className="font-bold text-primary mb-5">Edit Profile</h3>
            <div className="space-y-4">
              {[
                { f:"name", l:"Full Name", ph:"Bhanu Pratap" },
                { f:"email", l:"Email", ph:"bhanu@gmail.com" },
                { f:"title", l:"Title", ph:"AI Enthusiast & Developer" },
                { f:"location", l:"Location", ph:"Delhi, India" },
              ].map(x => (
                <div key={x.f}>
                  <label className="text-xs font-semibold text-faint uppercase tracking-wide mb-1.5 block">{x.l}</label>
                  <input className="mv-input" placeholder={x.ph}
                    value={(form as any)[x.f]} onChange={e => setForm(f=>({...f,[x.f]:e.target.value}))}/>
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-faint uppercase tracking-wide mb-1.5 block">Bio</label>
                <textarea className="mv-input min-h-[80px] resize-none leading-relaxed" placeholder="Short bio…"
                  value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))}/>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving}
                  className="flex-1 h-11 rounded-2xl bg-primary text-white text-sm font-semibold disabled:opacity-60 hover:bg-primary/90 transition-all">
                  {saving ? "Saving…" : "Save Profile"}
                </button>
                <button onClick={() => setEditing(false)} className="flex-1 h-11 rounded-2xl bg-soft border border-edge text-sm font-semibold text-primary hover:border-primary/30 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mv-card mb-6">
            <h3 className="font-bold text-primary mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0,20).map(s => (
                <span key={s} className="text-xs bg-soft border border-edge rounded-pill px-3 py-1.5 font-medium text-primary">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="mv-card mb-8 overflow-hidden p-0">
          {MENU.map((m, i) => (
            <Link key={m.href} href={m.href}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-soft transition-colors group ${i<MENU.length-1?"border-b border-edge":""}`}>
              <span className="text-lg w-7 text-center">{m.icon}</span>
              <span className="flex-1 text-sm font-medium text-primary">{m.label}</span>
              <svg className="w-4 h-4 text-faint group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label:string; value:string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-faint text-xs uppercase tracking-wide font-medium shrink-0 mt-0.5">{label}</span>
      <span className="text-primary font-medium text-right">{value}</span>
    </div>
  );
}
