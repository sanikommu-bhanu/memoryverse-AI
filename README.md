# MemoryVerse AI '26

> **"I never have to search through folders again."**

An AI-powered Digital Identity System that transforms scattered academic and professional documents into a structured, searchable, intelligent knowledge repository.

Built for **Wooble MemoryVerse AI Hackathon '26** · ML/AI · Intermediate

---

## 🚀 Live Demo Setup

```bash
# 1. Install dependencies
npm install

# 2. Add your free Gemini API key
cp .env.example .env
# Edit .env → GEMINI_API_KEY=your_key_from_aistudio.google.com

# 3. Run
npm run dev
# Open http://localhost:3000
```

**No database setup. No Docker. No cloud accounts required.** The app runs entirely locally with file-based persistence.

---

## 🧠 What Makes This Real AI (Not Fake)

### 1. Real Embeddings — `lib/gemini.ts`
Every document is embedded using **Google's `text-embedding-004` model** (768-dimensional vectors). This is the same embedding model used in production RAG systems.

```typescript
// Real API call to Gemini embeddings
const data = await post(
  `${BASE}/models/text-embedding-004:embedContent?key=${KEY}`,
  { content: { parts: [{ text: truncated }] } }
);
return data.embedding.values; // 768-dim float vector
```

### 2. Real Vector Search — `lib/vectorSearch.ts`
Cosine similarity search over all stored embedding vectors — no fake keyword matching:

```typescript
export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
```

### 3. Real RAG Pipeline — `lib/rag.ts`
- Query → embed → cosine search → retrieve top-6 docs → inject as context → Gemini answer
- Every AI answer is grounded in the user's actual uploaded documents
- Sources with similarity scores are returned alongside every answer

### 4. Real Document Processing — `lib/textExtract.ts` + `lib/analyze.ts`
- **PDF**: `pdf-parse` extracts full text
- **DOCX**: `mammoth` extracts raw text
- **TXT/CSV/MD/JSON**: Direct file read
- AI analysis via Gemini: title, category, summary, entities (skills, organizations, dates, technologies)

---

## 🏗 Architecture

```
User uploads file
      ↓
API Route /api/upload
      ↓
textExtract.ts → raw text (PDF/DOCX/TXT)
      ↓
analyze.ts → Gemini LLM
  • title, category, summary
  • entities: skills, orgs, dates, tech
      ↓ (parallel)
gemini.ts → text-embedding-004
  → 768-dim embedding vector
      ↓
store.ts → JSON file database
  (documents[] with embeddings stored)
      ↓
vectorSearch.ts → cosine similarity
  (semantic search over all embeddings)
      ↓
rag.ts → RAG pipeline
  (retrieve top-K → inject context → Gemini answer)
```

---

## 📦 Module Breakdown

| Module | Purpose | Tech |
|--------|---------|------|
| `lib/gemini.ts` | Embeddings + LLM generation | Gemini text-embedding-004, gemini-1.5-flash |
| `lib/vectorSearch.ts` | Cosine similarity search | Pure TypeScript math |
| `lib/analyze.ts` | Document understanding | Gemini + local fallback |
| `lib/rag.ts` | RAG pipeline, resume/portfolio gen | Gemini grounded generation |
| `lib/textExtract.ts` | Multi-format text extraction | pdf-parse, mammoth |
| `lib/store.ts` | File-based vector store | JSON + Node.js fs |
| `app/api/*` | REST API routes | Next.js Route Handlers |
| `app/*` | Full UI | Next.js 14 App Router |

---

## 🎯 Judging Criteria Coverage

| Criteria | Weight | What We Built |
|----------|--------|---------------|
| AI organization/categorization/retrieval | 40% | Gemini LLM categorizes every doc into 8 types; entity extraction (skills, orgs, dates, tech); full semantic retrieval |
| NLP/RAG/Embeddings/Vector DB/Semantic Search | 25% | Real Gemini embeddings (768-dim), cosine similarity vector search, full RAG pipeline with cited sources |
| Innovation/UX | 20% | Premium white-first design; knowledge graph; timeline; AI chat assistant; resume + portfolio generator |
| Clarity of architecture | 15% | This README + architecture diagram + thought process doc |

---

## 🔑 Offline / No API Key Mode

The app **fully works without an API key** using:
- A deterministic 128-dim TF-IDF-style embedding (VOCAB hash) for vector search
- Regex-based entity extraction for skills, dates, organizations
- Rule-based document categorization
- Keyword-fallback search with relevance scoring

This means **nothing is broken** if you demo without configuring Gemini — you just get less rich AI outputs.

---

## 📁 Project Structure

```
memoryverse-ai/
├── app/
│   ├── api/            API routes (upload, search, chat, insights, resume, portfolio)
│   ├── page.tsx        Home dashboard
│   ├── upload/         File upload with AI processing animation
│   ├── search/         Semantic search results
│   ├── journey/        Timeline of all documents
│   ├── graph/          Interactive knowledge graph
│   ├── chat/           AI assistant (RAG-powered)
│   ├── resume/         AI resume builder
│   ├── portfolio/      AI portfolio generator
│   ├── insights/       Career readiness dashboard
│   ├── profile/        User profile
│   ├── settings/       App configuration
│   └── document/[id]/  Document detail + entity view
├── lib/
│   ├── gemini.ts       Gemini API (embeddings + generation)
│   ├── vectorSearch.ts Cosine similarity vector search
│   ├── analyze.ts      Document AI analysis pipeline
│   ├── rag.ts          RAG pipeline + resume/portfolio generation
│   ├── textExtract.ts  PDF/DOCX/TXT text extraction
│   ├── store.ts        File-based persistent store
│   └── types.ts        Shared TypeScript types
├── data/
│   └── store.json      Auto-created. Stores all documents + vectors + chat.
└── docs/
    ├── ARCHITECTURE.md  AI system architecture diagram
    └── THOUGHT_PROCESS.md  Design decisions and reasoning
```
