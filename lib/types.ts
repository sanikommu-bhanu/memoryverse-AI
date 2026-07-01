export type DocCategory = "Certificate"|"Project"|"Internship"|"Skill"|"Research"|"Achievement"|"Resume"|"Other";

export interface Entities {
  skills: string[];
  organizations: string[];
  dates: string[];
  technologies: string[];
}

export interface MemoryDoc {
  id: string;
  title: string;
  category: DocCategory;
  fileName: string;
  mimeType: string;
  rawText: string;
  summary: string;
  entities: Entities;
  year: string;
  confidence: number;
  embedding: number[];   // real 768-dim Gemini embedding vector
  uploadedAt: string;
}

export interface ChatTurn {
  id: string;
  role: "user"|"assistant";
  content: string;
  sources?: { id: string; title: string; score: number }[];
  createdAt: string;
}

export interface StoreShape {
  documents: MemoryDoc[];
  chat: ChatTurn[];
  profile: UserProfile | null;
}

export interface UserProfile {
  name: string;
  email: string;
  title: string;
  location: string;
  bio: string;
}

export interface SearchResult {
  doc: MemoryDoc;
  score: number;
}
