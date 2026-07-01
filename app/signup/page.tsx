"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const { profile } = await res.json();
      
      const updatedProfile = { ...(profile || {}), name, email };
      
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile)
      });
      
      localStorage.setItem("signedIn", "true");
      router.push("/");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white w-full">
      {/* Left side - image */}
      <div className="hidden lg:flex w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80" 
          alt="Workspace background"
          className="w-full h-full object-cover"
        />
        <div className="absolute z-20 text-white text-center p-12">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-primary font-bold text-4xl">M</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Join MemoryVerse</h2>
          <p className="text-lg text-white/80 font-medium">Start your AI-powered career journey and organize your life today.</p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Create Account</h1>
            <p className="text-faint mt-2 text-sm font-medium">Enter your details to create your workspace</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-primary">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe"
                className="w-full px-4 py-3.5 rounded-xl border border-edge bg-soft focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-primary font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-primary">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl border border-edge bg-soft focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-primary font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-primary">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl border border-edge bg-soft focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-primary font-medium"
                required
              />
            </div>
            
            <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-button hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100">
              {loading ? "Creating Account..." : "Get Started"}
              {!loading && (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-faint font-medium">
            Already have an account? <Link href="/signin" className="text-primary font-bold hover:underline">Sign in instead</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
