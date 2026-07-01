"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { MemoryDoc } from "@/lib/types";

interface Node { id: string; label: string; type: "skill"|"doc"; x: number; y: number; docId?: string; color: string; }
interface Edge { from: string; to: string; }

const PALETTE = ["#111111","#374151","#4B5563","#6B7280","#059669","#2563EB","#7C3AED","#EA580C","#DB2777"];

function buildGraph(docs: MemoryDoc[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const seen = new Set<string>();
  const W = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 800) : 700;
  const H = 480;
  const cx = W / 2; const cy = H / 2;

  // Center node = "You"
  nodes.push({ id: "you", label: "You", type: "doc", x: cx, y: cy, color: "#111" });

  // Top skills across all docs
  const skillCount: Record<string,number> = {};
  docs.forEach(d => d.entities.skills.forEach(s => { skillCount[s] = (skillCount[s]||0)+1; }));
  const topSkills = Object.entries(skillCount).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([s])=>s);

  topSkills.forEach((skill, i) => {
    const angle = (i / topSkills.length) * Math.PI * 2 - Math.PI / 2;
    const r = Math.min(cx, cy) * 0.62;
    const id = `skill_${skill}`;
    if (!seen.has(id)) {
      nodes.push({ id, label: skill, type: "skill", x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), color: PALETTE[i % PALETTE.length] });
      seen.add(id);
      edges.push({ from: "you", to: id });
    }
  });

  // Doc nodes around outer ring
  docs.slice(0, 6).forEach((doc, i) => {
    const angle = (i / Math.max(docs.length,6)) * Math.PI * 2 - Math.PI / 3;
    const r = Math.min(cx, cy) * 0.92;
    nodes.push({ id: doc.id, label: doc.title.slice(0,22), type: "doc", x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), docId: doc.id, color: "#374151" });
    // Connect to matching skill nodes
    doc.entities.skills.slice(0,2).forEach(s => {
      const sid = `skill_${s}`;
      if (seen.has(sid)) edges.push({ from: doc.id, to: sid });
    });
  });

  return { nodes, edges };
}

export default function Graph() {
  const [docs, setDocs] = useState<MemoryDoc[]>([]);
  const [graph, setGraph] = useState<{nodes:Node[];edges:Edge[]}>({nodes:[],edges:[]});
  const [hovered, setHovered] = useState<string|null>(null);
  const [dims, setDims] = useState({ w: 700, h: 480 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch("/api/documents").then(r=>r.json()).then(d => {
      const docs: MemoryDoc[] = d.documents||[];
      setDocs(docs);
      if (docs.length > 0) setGraph(buildGraph(docs));
    });
    const update = () => setDims({ w: Math.min(window.innerWidth - 48, 800), h: 480 });
    update(); window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Knowledge Graph</h1>
          <p className="text-sm text-muted mt-1">AI connects your achievements — hover nodes to explore</p>
        </div>

        {docs.length === 0 ? (
          <div className="text-center py-24">
            <span className="text-5xl">⬡</span>
            <p className="font-bold text-primary mt-4">No connections yet</p>
            <p className="text-sm text-muted mt-2">Upload documents to generate your knowledge graph</p>
            <Link href="/upload" className="mv-btn-primary inline-flex mt-6">Upload Now</Link>
          </div>
        ) : (
          <div className="mv-card overflow-hidden p-0">
            <svg ref={svgRef} width="100%" height={dims.h} viewBox={`0 0 ${dims.w} ${dims.h}`}
              style={{display:"block", touchAction:"none"}}>
              {/* Edges */}
              {graph.edges.map((e,i) => {
                const from = graph.nodes.find(n=>n.id===e.from);
                const to = graph.nodes.find(n=>n.id===e.to);
                if (!from||!to) return null;
                return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#EAEAEA" strokeWidth="1.5"/>;
              })}

              {/* Nodes */}
              {graph.nodes.map(n => {
                const isCenter = n.id === "you";
                const isHovered = hovered === n.id;
                const r = isCenter ? 38 : n.type === "skill" ? 30 : 24;
                return (
                  <g key={n.id} style={{cursor:"pointer"}} onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)}>
                    <circle cx={n.x} cy={n.y} r={r + (isHovered ? 4 : 0)} fill={n.color} opacity={isHovered ? 1 : 0.9}
                      style={{transition:"all 0.2s", filter: isHovered ? "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" : "none"}}/>
                    {isCenter && (
                      <circle cx={n.x} cy={n.y} r={r+8} fill="none" stroke="#111" strokeWidth="1" opacity="0.2"/>
                    )}
                    {n.docId ? (
                      <a href={`/document/${n.docId}`}>
                        <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="white" fontWeight="500" style={{pointerEvents:"none"}}>
                          {n.label.length > 14 ? n.label.slice(0,14)+"…" : n.label}
                        </text>
                      </a>
                    ) : (
                      <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize={isCenter ? 13 : 10} fill="white" fontWeight={isCenter?"700":"600"} style={{pointerEvents:"none"}}>
                        {n.label.length > 12 ? n.label.slice(0,12)+"…" : n.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex gap-6 flex-wrap">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"/><span className="text-xs text-muted">You / Core</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"/><span className="text-xs text-muted">Skills</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-600"/><span className="text-xs text-muted">Documents</span></div>
        </div>
      </div>
    </div>
  );
}
