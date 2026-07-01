import { DocCategory, Entities } from "./types";
import { generate, safeJSON, hasKey, embedText } from "./gemini";

export interface AnalysisResult {
  title: string;
  category: DocCategory;
  summary: string;
  entities: Entities;
  year: string;
  confidence: number;
  embedding: number[];
}

const SKILLS = [
  "Python","JavaScript","TypeScript","React","React Native","Node.js","Java","C++","C#",
  "TensorFlow","PyTorch","Keras","Machine Learning","Deep Learning","Computer Vision","NLP",
  "SQL","MongoDB","PostgreSQL","Firebase","AWS","Azure","GCP","Docker","Kubernetes","Git",
  "GitHub","Figma","Data Structures","Algorithms","OpenCV","Flask","Django","Express",
  "Next.js","Vue.js","Angular","HTML","CSS","Tailwind","REST API","GraphQL","Linux",
  "Cloud Computing","Scikit-learn","Pandas","NumPy","Matplotlib","Jupyter","Spark","Hadoop",
  "Blockchain","Solidity","Swift","Kotlin","Flutter","Unity","R","MATLAB","Excel","Power BI",
];

function localExtract(text: string): Entities {
  const found = SKILLS.filter(s => new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`,"i").test(text));
  const dates = [...new Set((text.match(/\b(19|20)\d{2}\b/g) ?? []))].slice(0,8);
  const orgs = [...new Set((text.match(/\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){0,3})\s(?:University|Institute|College|Technologies|Inc|Labs|Solutions|Academy|Corp|Ltd|LLC)\b/g) ?? []))].slice(0,6);
  const tech = found.filter(s => ["Python","JavaScript","TypeScript","React","Node.js","Java","C++","TensorFlow","PyTorch","OpenCV","Flask","Django","Next.js","Kubernetes","Docker","AWS"].includes(s));
  return { skills: found, technologies: tech, organizations: orgs, dates };
}

function localCategory(text: string, fileName: string): DocCategory {
  const t = (text + " " + fileName).toLowerCase();
  if (/certif|completion|credential/.test(t)) return "Certificate";
  if (/intern(ship)?/.test(t)) return "Internship";
  if (/research|paper|journal|publication|thesis/.test(t)) return "Research";
  if (/award|winner|achievement|hackathon|finalist|prize/.test(t)) return "Achievement";
  if (/resume|curriculum vitae|\bcv\b/.test(t)) return "Resume";
  if (/project|github|repositor/.test(t)) return "Project";
  if (/skill/.test(t)) return "Skill";
  return "Other";
}

export async function analyzeDocument(rawText: string, fileName: string): Promise<AnalysisResult> {
  const trimmed = rawText.slice(0, 7000);

  // Run embedding and AI analysis in parallel
  const [embedding, aiResult] = await Promise.all([
    embedText(trimmed),
    hasKey() ? runGeminiAnalysis(trimmed, fileName) : null,
  ]);

  if (aiResult) return { ...aiResult, embedding };

  // Local fallback
  const entities = localExtract(trimmed);
  const category = localCategory(trimmed, fileName);
  const year = entities.dates[0] ?? String(new Date().getFullYear());
  const title = fileName.replace(/\.[^/.]+$/, "").replace(/[_\-]+/g, " ").trim() || "Untitled";
  return {
    title,
    category,
    summary: `A ${category.toLowerCase()} document mentioning ${entities.skills.slice(0,3).join(", ") || "your work"}. Add a Gemini API key for AI-generated summaries.`,
    entities,
    year,
    confidence: 60,
    embedding,
  };
}

async function runGeminiAnalysis(text: string, fileName: string): Promise<Omit<AnalysisResult,"embedding"> | null> {
  try {
    const prompt = `You are an information extraction engine for a personal AI knowledge system.
Given this document, return ONLY valid JSON (no markdown, no fences):
{
  "title": "concise title max 8 words",
  "category": "Certificate|Project|Internship|Skill|Research|Achievement|Resume|Other",
  "summary": "2 sentence plain English summary of what this document represents",
  "entities": {
    "skills": ["skill1","skill2"],
    "organizations": ["org1"],
    "dates": ["2024"],
    "technologies": ["tech1"]
  },
  "year": "primary year e.g. 2024",
  "confidence": 85
}

File: ${fileName}
Text:
"""${text}"""`;
    const raw = await generate(prompt, 800);
    const parsed = safeJSON<any>(raw, null);
    if (parsed?.entities) return parsed as Omit<AnalysisResult,"embedding">;
    return null;
  } catch { return null; }
}
