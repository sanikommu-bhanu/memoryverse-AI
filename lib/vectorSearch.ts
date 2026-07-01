import { MemoryDoc, SearchResult } from "./types";
import { embedText } from "./gemini";
import { db } from "./store";

// ── Cosine similarity between two vectors ─────────────────────────────────────
export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

// ── Semantic search: embed query → score all docs → ranked results ─────────────
export async function semanticSearch(
  query: string,
  topK = 10,
  category?: string
): Promise<SearchResult[]> {
  const docs = db.getDocs();
  if (!docs.length) return [];

  const qEmbedding = await embedText(query);

  const filtered = category && category !== "All"
    ? docs.filter(d => d.category === category)
    : docs;

  const scored = filtered
    .filter(d => d.embedding && d.embedding.length > 0)
    .map(d => ({ doc: d, score: cosine(qEmbedding, d.embedding) }))
    .sort((a, b) => b.score - a.score);

  // If no embedding scores (all zeros), fall back to keyword match
  const best = scored[0]?.score ?? 0;
  if (best < 0.001) return keywordFallback(query, filtered, topK);

  return scored.slice(0, topK);
}

// ── Keyword fallback search ───────────────────────────────────────────────────
function keywordFallback(query: string, docs: MemoryDoc[], topK: number): SearchResult[] {
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  return docs
    .map(d => {
      const haystack = `${d.title} ${d.summary} ${d.category} ${d.year} ${d.entities.skills.join(" ")} ${d.entities.organizations.join(" ")}`.toLowerCase();
      const score = tokens.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0) / tokens.length;
      return { doc: d, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ── Retrieve top-K docs for RAG context injection ────────────────────────────
export async function retrieveContext(query: string, topK = 6): Promise<{ doc: MemoryDoc; score: number }[]> {
  return semanticSearch(query, topK);
}
