import fs from "fs";
import path from "path";
import { StoreShape, MemoryDoc, ChatTurn, UserProfile } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

function ensure(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE))
    fs.writeFileSync(DATA_FILE, JSON.stringify({ documents: [], chat: [], profile: null }, null, 2));
}

export function readStore(): StoreShape {
  ensure();
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as StoreShape; }
  catch { return { documents: [], chat: [], profile: null }; }
}

function write(s: StoreShape) { ensure(); fs.writeFileSync(DATA_FILE, JSON.stringify(s, null, 2)); }

export const db = {
  getDocs: (): MemoryDoc[] => readStore().documents,
  getDoc: (id: string) => readStore().documents.find(d => d.id === id),
  addDoc(doc: MemoryDoc) { const s = readStore(); s.documents.unshift(doc); write(s); },
  deleteDoc(id: string) { const s = readStore(); s.documents = s.documents.filter(d => d.id !== id); write(s); },
  getChat: (): ChatTurn[] => readStore().chat,
  appendChat(turn: ChatTurn) { const s = readStore(); s.chat.push(turn); write(s); },
  clearChat() { const s = readStore(); s.chat = []; write(s); },
  getProfile: (): UserProfile | null => readStore().profile,
  setProfile(p: UserProfile) { const s = readStore(); s.profile = p; write(s); },
  wipe() { write({ documents: [], chat: [], profile: null }); },
};
