"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.ok && router.push("/dashboard"));
  }, [router]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      localStorage.setItem("mindspace_user", JSON.stringify(d.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900";

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Mind Space Library</h1>
            <p className="text-xs text-slate-500">Digital & Physical Resource Portal</p>
          </div>
        </div>

        <h2 className="font-semibold mb-4">{mode === "login" ? "Sign in" : "Create your account"}</h2>
        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label htmlFor="name" className="block text-xs font-semibold mb-1">Full name</label>
              <input id="name" className={input} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold mb-1">Email</label>
            <input id="email" type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-semibold mb-1">Password (8+ characters)</label>
            <input id="password" type="password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-sm font-semibold rounded-xl transition">
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          className="mt-4 text-sm text-blue-900 underline"
        >
          {mode === "login" ? "New here? Create an account" : "I already have an account"}
        </button>
      </div>
    </div>
  );
}