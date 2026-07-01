import { retrieveContext } from "./vectorSearch";
import { generate, hasKey } from "./gemini";
import { db } from "./store";
import { MemoryDoc } from "./types";

export interface RAGResult {
  answer: string;
  sources: { id: string; title: string; score: number }[];
}

export async function ragAnswer(question: string): Promise<RAGResult> {
  const hits = await retrieveContext(question, 6);
  const sources = hits.map(h => ({ id: h.doc.id, title: h.doc.title, score: Math.round(h.score * 100) }));

  const context = hits.map(h =>
    `[${h.doc.category}] ${h.doc.title} (${h.doc.year})\nSummary: ${h.doc.summary}\nSkills: ${h.doc.entities.skills.join(", ") || "n/a"}\nOrgs: ${h.doc.entities.organizations.join(", ") || "n/a"}`
  ).join("\n\n---\n\n");

  if (hasKey() && hits.length > 0) {
    try {
      const prompt = `You are MemoryVerse AI — a personal career and knowledge assistant.
Answer the user's question using ONLY the retrieved documents below.
Be specific, warm, and concise. Cite document titles. If the context lacks information, say so honestly.

Retrieved documents:
${context}

User question: ${question}

Answer:`;
      const answer = await generate(prompt, 512);
      return { answer, sources };
    } catch { /* fall through */ }
  }

  // Local fallback
  if (!hits.length) {
    const docs = db.getDocs();
    return {
      answer: docs.length === 0
        ? "You haven't uploaded any documents yet. Once you do, I can answer questions about your skills, projects, and career journey using your real data."
        : `I searched your ${docs.length} document(s) but couldn't find a strong match for "${question}". Try rephrasing or add a free Gemini API key for smarter semantic search.`,
      sources: [],
    };
  }
  return {
    answer: `Based on your documents, the most relevant items are: ${hits.slice(0,3).map(h => h.doc.title).join(", ")}. ${hits[0].doc.summary}`,
    sources,
  };
}

export async function generateResume(template: string): Promise<string> {
  const docs = db.getDocs();
  const profile = db.getProfile();
  const docList = docs.map(d => `${d.category}: ${d.title} (${d.year}) — ${d.summary} [Skills: ${d.entities.skills.join(", ")}]`).join("\n");

  if (hasKey()) {
    try {
      const prompt = `Generate a ${template}-style professional resume in clean Markdown for ${profile?.name || "the user"}, a ${profile?.title || "professional"}.
Use ONLY the real data below. Do not invent anything.
Email: ${profile?.email || ""}

Source documents:
${docList || "No documents uploaded."}

Format: # Name, ## Summary, ## Skills, ## Projects, ## Experience, ## Certifications, ## Achievements
Keep it ATS-friendly, clean, and factual.`;
      return await generate(prompt, 1200);
    } catch { /* fall through */ }
  }

  // Deterministic local resume
  const skills = [...new Set(docs.flatMap(d => d.entities.skills))].slice(0, 18);
  const projects = docs.filter(d => d.category === "Project");
  const internships = docs.filter(d => d.category === "Internship");
  const certs = docs.filter(d => d.category === "Certificate");
  const achievements = docs.filter(d => d.category === "Achievement");

  return `# ${profile?.name || "Your Name"}
${profile?.title || "Professional"} | ${profile?.email || ""}

## Summary
${profile?.title || "Professional"} with experience in ${skills.slice(0,4).join(", ") || "multiple domains"}, documented across ${docs.length} verified records in MemoryVerse AI.

## Skills
${skills.map(s => `- ${s}`).join("\n") || "- Upload documents to populate"}

## Projects
${projects.map(p => `### ${p.title} (${p.year})\n${p.summary}`).join("\n\n") || "_No projects uploaded yet_"}

## Experience / Internships
${internships.map(i => `### ${i.title} (${i.year})\n${i.summary}`).join("\n\n") || "_No internships uploaded yet_"}

## Certifications
${certs.map(c => `- **${c.title}** (${c.year})`).join("\n") || "_No certificates uploaded yet_"}

## Achievements
${achievements.map(a => `- ${a.title} (${a.year})`).join("\n") || "_No achievements uploaded yet_"}`;
}

export async function generatePortfolioHTML(): Promise<string> {
  const docs = db.getDocs();
  const profile = db.getProfile();
  const projects = docs.filter(d => d.category === "Project");
  const certs = docs.filter(d => d.category === "Certificate");
  const skills = [...new Set(docs.flatMap(d => d.entities.skills))].slice(0, 20);
  const internships = docs.filter(d => d.category === "Internship");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${profile?.name || "Portfolio"} — MemoryVerse AI</title>
<meta name="description" content="${profile?.title || "Portfolio"} — AI-generated from real documents"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,sans-serif;background:#fff;color:#111;line-height:1.6}
.hero{background:#111;color:#fff;padding:80px 24px;text-align:center}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(2rem,5vw,3.5rem);margin-bottom:12px}
.hero p{font-size:1.1rem;opacity:0.75;margin-bottom:24px}
.hero .pill{display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:999px;padding:8px 20px;font-size:0.9rem}
.container{max-width:900px;margin:0 auto;padding:60px 24px}
h2{font-size:1.5rem;font-weight:700;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid #EAEAEA}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:40px}
.tag{background:#F5F5F7;border:1px solid #EAEAEA;border-radius:999px;padding:6px 16px;font-size:0.85rem;font-weight:500}
.card{background:#fff;border:1px solid #EAEAEA;border-radius:20px;padding:24px;margin-bottom:16px;transition:box-shadow 0.2s}
.card:hover{box-shadow:0 8px 32px rgba(0,0,0,0.08)}
.card h3{font-size:1.05rem;font-weight:700;margin-bottom:6px}
.card .year{font-size:0.8rem;color:#9A9A9E;margin-bottom:8px}
.card p{font-size:0.9rem;color:#6B6B6F;line-height:1.6}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
.contact{background:#111;color:#fff;padding:60px 24px;text-align:center;margin-top:60px}
.contact a{color:#fff;text-decoration:underline}
.badge{display:inline-block;background:#F5F5F7;border-radius:8px;padding:4px 12px;font-size:0.8rem;color:#6B6B6F;margin-right:6px;margin-top:6px}
</style></head><body>
<div class="hero">
  <h1>${profile?.name || "Your Name"}</h1>
  <p>${profile?.title || "AI Enthusiast & Developer"}</p>
  <span class="pill">AI-Generated Portfolio · ${docs.length} Documents · MemoryVerse AI</span>
</div>
<div class="container">
  <h2>About Me</h2>
  <p style="font-size:1rem;color:#6B6B6F;margin-bottom:40px">${profile?.bio || `${profile?.title || "Professional"} passionate about building with AI and documenting growth across ${docs.length} verified records.`}</p>

  <h2>Skills & Technologies</h2>
  <div class="tags">${skills.map(s => `<span class="tag">${s}</span>`).join("") || '<span class="tag">Upload documents to populate skills</span>'}</div>

  ${projects.length ? `<h2>Projects</h2><div class="grid">${projects.map(p => `<div class="card"><h3>${p.title}</h3><div class="year">${p.year}</div><p>${p.summary}</p>${p.entities.skills.slice(0,4).map(s => `<span class="badge">${s}</span>`).join("")}</div>`).join("")}</div>` : ""}

  ${internships.length ? `<h2>Experience & Internships</h2><div class="grid">${internships.map(i => `<div class="card"><h3>${i.title}</h3><div class="year">${i.year} · ${i.entities.organizations[0] || ""}</div><p>${i.summary}</p></div>`).join("")}</div>` : ""}

  ${certs.length ? `<h2>Certifications</h2><div class="grid">${certs.map(c => `<div class="card"><h3>${c.title}</h3><div class="year">Issued ${c.year} · ${c.entities.organizations[0] || ""}</div><p>${c.summary}</p></div>`).join("")}</div>` : ""}
</div>
<div class="contact">
  <h2 style="color:#fff;border-color:rgba(255,255,255,0.2)">Get In Touch</h2>
  <p style="margin-top:16px;opacity:0.75">${profile?.email || "Add your email in settings"}</p>
  <p style="margin-top:8px;opacity:0.6">${profile?.location || ""}</p>
  <p style="margin-top:24px;font-size:0.8rem;opacity:0.4">Generated by MemoryVerse AI · ${new Date().getFullYear()}</p>
</div>
</body></html>`;
}

export function computeInsights() {
  const docs = db.getDocs();
  const allSkills = [...new Set(docs.flatMap(d => d.entities.skills))];
  const certs = docs.filter(d => d.category === "Certificate").length;
  const projects = docs.filter(d => d.category === "Project").length;
  const internships = docs.filter(d => d.category === "Internship").length;
  const research = docs.filter(d => d.category === "Research").length;
  const readiness = Math.min(100, certs * 8 + projects * 12 + internships * 15 + research * 10 + allSkills.length * 2);
  const hasCloud = docs.some(d => /cloud|aws|azure|gcp/i.test(d.title + d.summary));
  const missing: string[] = [];
  if (!hasCloud) missing.push("Cloud Certification (AWS/GCP/Azure)");
  if (!internships) missing.push("Internship Experience");
  if (!allSkills.some(s => /git/i.test(s))) missing.push("Version Control (Git)");
  if (!research) missing.push("Research Paper / Publication");
  return {
    readiness,
    topSkills: allSkills.slice(0, 10),
    missingSkills: missing,
    resumeScore: Math.min(100, 40 + projects * 8 + certs * 6 + internships * 10),
    portfolioScore: Math.min(100, 30 + projects * 15 + certs * 5),
    totalDocs: docs.length,
    breakdown: { certs, projects, internships, research, achievements: docs.filter(d => d.category === "Achievement").length },
  };
}
