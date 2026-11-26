"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Users,
  GraduationCap,
  AlertCircle,
  ChevronLeft,
  Library,
} from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState("welcome"); // "welcome" | "auth"
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const openAuth = (targetMode = "login") => {
    setMode(targetMode);
    setError("");
    setStep("auth");
  };

  const switchMode = (next) => {
    setMode(next);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password, role };

      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Authentication failed");

      if (d.user) {
        localStorage.setItem("mindspace_user", JSON.stringify(d.user));
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-3.5 py-6 sm:p-6 overflow-hidden text-zinc-900 select-none">
      {/* 1. Ambient Animated Video Background (with High-Res Fallback Poster) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1920&q=80"
        className="fixed inset-0 -z-30 w-full h-full object-cover scale-105"
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-woman-turning-pages-of-a-book-in-a-library-4834-large.mp4"
          type="video/mp4"
        />
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-hands-turning-the-pages-of-a-book-21560-large.mp4"
          type="video/mp4"
        />
      </video>

      {/* 2. Fallback Static Image Layer (ensures rich visual even on restricted networks) */}
      <div
        className="fixed inset-0 -z-40 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1920&q=80")`,
        }}
      />

      {/* 3. Deep Twilight & Animated Aurora Gradient Overlay */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#0f0a1f]/80 via-[#1d1438]/72 to-[#2a183b]/82 backdrop-blur-[2px]" />
      <div className="fixed -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/25 blur-3xl animate-pulse -z-10 pointer-events-none" />
      <div className="fixed -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl animate-pulse -z-10 pointer-events-none" />

      {/* STEP 1: WELCOME GREETING HERO SCREEN */}
      {step === "welcome" ? (
        <div className="w-full max-w-2xl text-center text-white px-4 py-8 sm:p-10 rounded-[32px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/40 transition-all duration-500">
          {/* Top Glowing Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-amber-200 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Next-Gen Digital & Physical Library Portal</span>
          </div>

          {/* Animated Brand Emblem */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/30">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>

          {/* Welcome Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-indigo-200 bg-clip-text text-transparent">
              Mind Space Library
            </span>
          </h1>

          <p className="text-sm sm:text-base text-indigo-100/85 max-w-lg mx-auto mt-4 leading-relaxed">
            Step into a distraction-free academic sanctuary. Access protected 4-day digital PDF editions, check real-time physical shelf stock, and organize private study notes.
          </p>

          {/* Compact Live Feature Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-7">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-medium text-white">
              <Users className="w-3.5 h-3.5 text-emerald-300" /> 30-Seat Live Concurrency
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-medium text-white">
              <Clock className="w-3.5 h-3.5 text-amber-300" /> 4-Day Instant PDF Access
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-medium text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-300" /> Private Study Vault
            </span>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-orange-600/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Library className="w-4 h-4" />
              <span>Enter Library Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => openAuth("register")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-sm font-semibold transition-all"
            >
              Create Student / Faculty ID
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: RESPONSIVE SPLIT AUTH CARD */
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-[30px] border border-white/80 shadow-2xl shadow-black/40 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Brand & Feature Showcase Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1a132e] via-[#261a42] to-[#331e47] text-white p-5 sm:p-8 lg:p-9 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Back to Welcome Button */}
              <button
                type="button"
                onClick={() => setStep("welcome")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-200/80 hover:text-white mb-5 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Welcome
              </button>

              <div className="flex items-center gap-3 mb-4 lg:mb-7">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-black/30 shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-base sm:text-lg tracking-tight block leading-none">
                    Mind Space
                  </span>
                  <span className="text-[11px] text-amber-200/80 font-medium mt-1 block">
                    Academic & Digital Library
                  </span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold leading-snug tracking-tight">
                Your Academic & Digital Reading Workspace
              </h2>
              <p className="hidden sm:block text-xs sm:text-sm text-indigo-100/80 mt-2.5 leading-relaxed">
                Instant access to protected digital PDF editions, physical catalog tracking, and private encrypted study notes.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="relative z-10 grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3 mt-5 lg:mt-8 pt-4 lg:pt-6 border-t border-white/10">
              <div className="flex flex-col lg:flex-row items-center text-center lg:text-left gap-1.5 lg:gap-3 bg-white/5 lg:bg-transparent p-2 lg:p-0 rounded-xl">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </div>
                <div>
                  <p className="text-[11px] lg:text-xs font-bold text-white leading-tight">
                    4-Day Loan
                  </p>
                  <p className="hidden lg:block text-[11px] text-indigo-200/70">
                    Automatic seat release & fair queue
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center text-center lg:text-left gap-1.5 lg:gap-3 bg-white/5 lg:bg-transparent p-2 lg:p-0 rounded-xl">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </div>
                <div>
                  <p className="text-[11px] lg:text-xs font-bold text-white leading-tight">
                    30-Seat Cap
                  </p>
                  <p className="hidden lg:block text-[11px] text-indigo-200/70">
                    Priority override for faculty members
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center text-center lg:text-left gap-1.5 lg:gap-3 bg-white/5 lg:bg-transparent p-2 lg:p-0 rounded-xl">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl bg-white/10 text-sky-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </div>
                <div>
                  <p className="text-[11px] lg:text-xs font-bold text-white leading-tight">
                    PDF & Notes
                  </p>
                  <p className="hidden lg:block text-[11px] text-indigo-200/70">
                    Private notes saved to your account
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Interactive Auth Form Panel */}
          <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-center bg-white">
            {/* Interactive Mode Switcher Pill */}
            <div className="grid grid-cols-2 sm:inline-flex p-1 rounded-2xl bg-[#f3f1ff] border border-indigo-100 mb-5 sm:mb-6 w-full sm:w-auto sm:self-start">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === "login"
                    ? "bg-[#1f1635] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#1f1635]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === "register"
                    ? "bg-[#1f1635] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#1f1635]"
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1f1635] tracking-tight">
                {mode === "login" ? "Welcome back" : "Join Mind Space Library"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {mode === "login"
                  ? "Sign in with your credentials to access your books."
                  : "Create a student or faculty account to start reading."}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-3.5 sm:space-y-4">
              {mode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5 sm:top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Arpa Chy"
                        className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-[#f7f6ff] border border-indigo-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Account Role
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setRole("student")}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                          role === "student"
                            ? "bg-indigo-50 border-indigo-500 text-indigo-800 shadow-2xs"
                            : "bg-[#f7f6ff] border-indigo-100 text-slate-600 hover:bg-white"
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("faculty")}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                          role === "faculty"
                            ? "bg-amber-50 border-amber-500 text-amber-800 shadow-2xs"
                            : "bg-[#f7f6ff] border-indigo-100 text-slate-600 hover:bg-white"
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        Faculty
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5 sm:top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-[#f7f6ff] border border-indigo-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password <span className="font-normal text-slate-400">(8+ characters)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5 sm:top-3" />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 sm:py-2.5 bg-[#f7f6ff] border border-indigo-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((prev) => !prev)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    className="absolute right-3 top-3 sm:top-2.5 p-1 text-slate-400 hover:text-indigo-700 transition"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 px-4 mt-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60"
              >
                {mode === "login" ? (
                  <>
                    <span>{busy ? "Signing in..." : "Sign In to Library"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{busy ? "Creating account..." : "Create Library Account"}</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-500">
              {mode === "login" ? (
                <>
                  New to Mind Space Library?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="font-bold text-indigo-700 hover:underline"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-bold text-indigo-700 hover:underline"
                  >
                    Sign in instead
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}