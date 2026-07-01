"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.push("/signin");
    }, 2500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white w-full">
      <div className="relative flex flex-col items-center animate-fade-up">
        <div className="w-24 h-24 bg-primary rounded-[28px] flex items-center justify-center mb-6 shadow-float animate-pulse-ring">
          <span className="text-white font-bold text-5xl">M</span>
        </div>
        <h1 className="text-primary text-3xl font-bold tracking-tight">MemoryVerse AI</h1>
        <p className="text-muted mt-2 text-sm font-medium">Your life. Organized.</p>
        
        {/* Loading dots */}
        <div className="flex gap-2 mt-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: "0ms"}} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: "150ms"}} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
        </div>
      </div>
    </div>
  );
}
