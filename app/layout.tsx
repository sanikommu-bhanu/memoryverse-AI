"use client";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Providers } from "./providers";

const NAV = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/upload", label: "Upload", icon: "↑" },
  { href: "/search", label: "Search", icon: "⌕" },
  { href: "/journey", label: "Journey", icon: "◎" },
  { href: "/graph", label: "Graph", icon: "⬡" },
  { href: "/chat", label: "AI Assistant", icon: "✦" },
  { href: "/resume", label: "Resume Builder", icon: "▤" },
  { href: "/portfolio", label: "Portfolio", icon: "◻" },
  { href: "/insights", label: "Career Insights", icon: "↗" },
  { href: "/profile", label: "Profile", icon: "◉" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") document.documentElement.classList.add("dark");
    if (localStorage.getItem("font") === "Playfair") document.body.style.fontFamily = "'Playfair Display', serif";
  }, []);

  const isOnboarding = path === "/onboarding" || path === "/splash" || path === "/signin" || path === "/signup";

  if (isOnboarding) return (
    <html lang="en"><body><Providers>{children}</Providers></body></html>
  );

  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-white">
        {/* ── Sidebar (desktop) ─────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-64 h-full border-r border-edge bg-white shrink-0 py-6">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <div className="text-sm font-bold text-primary">MemoryVerse AI</div>
                <div className="text-[11px] text-faint">Your life. Organized.</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {NAV.map(n => (
              <Link key={n.href} href={n.href}
                className={`sidebar-link ${(n.href === "/" ? path === "/" : path.startsWith(n.href)) ? "active" : ""}`}>
                <span className="text-base w-5 text-center">{n.icon}</span>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 pt-4 border-t border-edge">
            <div className="text-[11px] text-faint">MemoryVerse AI · Hackathon</div>
          </div>
        </aside>

        {/* ── Mobile top bar ─────────────────────────────────────────── */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-white/80 backdrop-blur-xl border-b border-edge">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-sm text-primary">MemoryVerse AI</span>
          </div>
          <button onClick={() => setOpen(o => !o)} className="p-2 rounded-xl bg-soft">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="#111" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <aside className="relative w-64 h-full bg-white flex flex-col py-6 shadow-float">
              <div className="px-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <span className="font-bold text-primary">MemoryVerse AI</span>
                </div>
              </div>
              <nav className="flex-1 px-3 space-y-1">
                {NAV.map(n => (
                  <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                    className={`sidebar-link ${(n.href === "/" ? path === "/" : path.startsWith(n.href)) ? "active" : ""}`}>
                    <span className="text-base w-5 text-center">{n.icon}</span>
                    {n.label}
                  </Link>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* ── Main content ───────────────────────────────────────────── */}
        <main className="flex-1 h-full overflow-y-auto lg:pt-0 pt-14">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
