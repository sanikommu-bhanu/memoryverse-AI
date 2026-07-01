const KEY = process.env.GEMINI_API_KEY || "";
const BASE = "https://generativelanguage.googleapis.com/v1beta";

export const hasKey = () => KEY.length > 10;

async function post(url: string, body: object) {
  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-goog-api-key": KEY 
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── Real Gemini embedding (768 dimensions) ──────────────────────────────────
export async function embedText(text: string): Promise<number[]> {
  if (!hasKey()) return localFallbackEmbed(text);
  const truncated = text.slice(0, 8000);
  const data = await post(
    `${BASE}/models/embedding-001:embedContent`,
    { model: "models/embedding-001", content: { parts: [{ text: truncated }] } }
  );
  return data.embedding.values as number[];
}

// ─── Local deterministic fallback embedding (128-dim TF-IDF-style hash) ──────
const VOCAB: string[] = [
  "python","javascript","typescript","react","node","java","c++","tensorflow","pytorch",
  "machine learning","deep learning","computer vision","nlp","sql","mongodb","firebase",
  "aws","docker","kubernetes","git","github","figma","data structures","algorithms",
  "openCV","flask","django","express","nextjs","html","css","tailwind","api","graphql",
  "linux","cloud","certificate","project","internship","research","achievement","resume",
  "skill","university","college","institute","hackathon","award","winner","publication",
  "2020","2021","2022","2023","2024","2025","2026","engineer","developer","intern",
  "analyst","scientist","manager","student","phd","bachelor","master","degree","exam",
  "score","grade","marks","gpa","coursera","udemy","google","microsoft","amazon","meta",
  "startup","product","design","testing","deployment","security","performance","mobile",
  "web","backend","frontend","fullstack","devops","blockchain","ai","ml","data",
  "analysis","visualization","pandas","numpy","matplotlib","jupyter","colab","kaggle",
  "excel","powerpoint","word","presentation","report","portfolio","linkedin","github2",
  "certification","completion","issued","expiry","valid","accredited","accreditation",
  "workshop","seminar","conference","paper","journal","publication","research2","thesis",
  "leadership","team","collaboration","communication","problem","solving","critical",
  "thinking","creativity","innovation","entrepreneurship","management","planning",
  "organization","time","management2","detail","oriented","motivated","passionate",
  "experience","year","month","week","hours","duration","period","from","to","during"
];
function localFallbackEmbed(text: string): number[] {
  const lower = text.toLowerCase();
  return VOCAB.map(w => {
    const count = (lower.split(w).length - 1);
    return count > 0 ? Math.min(1, count * 0.3) : 0;
  });
}

// ─── Real Gemini text generation ─────────────────────────────────────────────
export async function generate(prompt: string, maxTokens = 1024): Promise<string> {
  if (!hasKey()) throw new Error("NO_KEY");
  const data = await post(
    `${BASE}/models/gemini-1.5-flash:generateContent`,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.35, maxOutputTokens: maxTokens },
    }
  );
  return data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
}

export async function extractTextFromImage(mimeType: string, base64: string): Promise<string> {
  if (!hasKey()) throw new Error("NO_KEY");
  const prompt = "Accurately transcribe all text in this image. Do not include any explanations, just the raw text.";
  const data = await post(
    `${BASE}/models/gemini-1.5-flash:generateContent`,
    {
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64 } }
        ]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 4000 },
    }
  );
  return data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
}

export function safeJSON<T>(text: string, fallback: T): T {
  try {
    const clean = text.replace(/```json|```/gi, "").trim();
    return JSON.parse(clean) as T;
  } catch { return fallback; }
}
