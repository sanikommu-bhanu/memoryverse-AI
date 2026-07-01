# MemoryVerse AI — Architecture & AI Workflow

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MEMORYVERSE AI                           │
│                  AI-Powered Digital Identity                    │
└─────────────────────────────────────────────────────────────────┘

                          USER
                            │
                    ┌───────▼────────┐
                    │   Next.js 14   │
                    │   Web App      │
                    │   (Port 3000)  │
                    └───────┬────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
    ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │  /api/upload│  │  /api/search│  │  /api/chat  │
    │  POST file  │  │  GET ?q=... │  │  POST msg   │
    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
           │                │                │
           ▼                ▼                ▼
┌──────────────────────────────────────────────────────┐
│                    PROCESSING LAYER                   │
│                                                       │
│  textExtract.ts          vectorSearch.ts    rag.ts   │
│  ┌────────────┐          ┌─────────────┐  ┌───────┐ │
│  │ PDF→text   │          │ embedQuery  │  │Retrieve│ │
│  │ DOCX→text  │          │ cosine()    │  │Context │ │
│  │ TXT→text   │          │ topK sort   │  │Generate│ │
│  └─────┬──────┘          └──────┬──────┘  └───┬───┘ │
│        │                        │              │     │
│        └──────────┬─────────────┘              │     │
│                   ▼                            │     │
│          analyze.ts (AI Pipeline)             │     │
│          ┌─────────────────────┐              │     │
│          │ 1. Gemini LLM       │              │     │
│          │    → title          │              │     │
│          │    → category       │              │     │
│          │    → summary        │              │     │
│          │    → entities       │              │     │
│          │                     │              │     │
│          │ 2. text-embedding   │              │     │
│          │    -004 API         │              │     │
│          │    → 768-dim vector │              │     │
│          └──────────┬──────────┘              │     │
└─────────────────────┼──────────────────────────┼─────┘
                      │                          │
                      ▼                          │
           ┌──────────────────────┐              │
           │     store.ts         │◄─────────────┘
           │   (File-based DB)    │
           │                      │
           │  data/store.json     │
           │  {                   │
           │    documents: [      │
           │      {               │
           │        id, title,    │
           │        category,     │
           │        entities,     │
           │        embedding:    │
           │        [768 floats], │◄── Real Gemini vectors
           │        rawText,      │
           │        summary       │
           │      }               │
           │    ],                │
           │    chat: [...],      │
           │    profile: {...}    │
           │  }                   │
           └──────────────────────┘
```

---

## AI Processing Pipeline (Per Document)

```
Upload File (.pdf / .docx / .txt / .csv / image)
         │
         ▼
┌─────────────────────┐
│   Text Extraction   │
│                     │
│  PDF  → pdf-parse   │
│  DOCX → mammoth     │
│  TXT  → fs.readFile │
│                     │
│  Output: rawText    │
│  (up to 10,000 ch.) │
└────────┬────────────┘
         │
         ▼ (runs in parallel)
┌────────┴────────────────────────────────┐
│                                         │
▼                                         ▼
┌─────────────────────┐    ┌──────────────────────────┐
│   Gemini LLM Call   │    │   Embedding API Call     │
│                     │    │                          │
│  gemini-1.5-flash   │    │  text-embedding-004      │
│                     │    │  → float[768]            │
│  Extracts:          │    │                          │
│  • title            │    │  Used for:               │
│  • category (8 types│    │  • Semantic search       │
│  • summary          │    │  • RAG retrieval         │
│  • skills[]         │    │  • Similarity scoring    │
│  • organizations[]  │    │                          │
│  • dates[]          │    │  Fallback (no API key):  │
│  • technologies[]   │    │  128-dim VOCAB hash      │
│  • confidence 0-100 │    └──────────────────────────┘
└────────┬────────────┘             │
         │                          │
         └──────────┬───────────────┘
                    ▼
         ┌──────────────────┐
         │  MemoryDoc saved │
         │  to store.json   │
         └──────────────────┘
```

---

## RAG Pipeline (Per Chat Query)

```
User asks: "What are my strongest AI skills?"
         │
         ▼
┌─────────────────────────┐
│  Embed query            │
│  text-embedding-004     │
│  → queryVec[768]        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Cosine similarity      │
│  for each stored doc:   │
│                         │
│  score = dot(q, d) /    │
│    (|q| × |d|)          │
│                         │
│  Sort descending        │
│  Return top-6           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Build context string   │
│                         │
│  "[Certificate] Google  │
│  TF Dev Cert (2024)     │
│  Summary: ...           │
│  Skills: TF, Python..." │
│                         │
│  + 5 more documents     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Gemini LLM             │
│  gemini-1.5-flash       │
│                         │
│  Prompt:                │
│  "You are MemoryVerse   │
│  AI. Answer using ONLY  │
│  the retrieved docs.    │
│  [context]              │
│  Question: ..."         │
│                         │
│  Output: grounded answer│
│  + cited document titles│
└─────────────────────────┘
```

---

## Semantic Search vs Keyword Search

| Feature | Keyword Search | MemoryVerse Semantic Search |
|---------|---------------|------------------------------|
| Query: "ML skills" | Needs exact phrase | Finds "Deep Learning", "Neural Networks", "PyTorch" etc. |
| Query: "2024 work experience" | Needs "2024" in text | Finds any 2024 document semantically |
| Typos | Fails | Handles via embedding proximity |
| Synonyms | Fails | Succeeds (same vector space) |
| Method | String.includes() | Cosine similarity on 768-dim vectors |

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 App Router | Full-stack React framework |
| Styling | Tailwind CSS | Utility-first CSS |
| LLM | Gemini 1.5 Flash | Document analysis, RAG answers, resume gen |
| Embeddings | text-embedding-004 | 768-dim semantic vectors |
| Vector Math | TypeScript (lib/vectorSearch.ts) | Cosine similarity |
| PDF Parsing | pdf-parse | Text extraction from PDFs |
| DOCX Parsing | mammoth | Text extraction from Word docs |
| Storage | Node.js fs + JSON | File-based vector store |
| API | Next.js Route Handlers | REST API endpoints |
