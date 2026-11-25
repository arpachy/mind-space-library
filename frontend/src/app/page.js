"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { BookOpen, ShieldCheck } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const snap = await getDoc(doc(db, "users", cred.user.uid));
        if (!snap.exists()) throw new Error("User profile not found.");
        localStorage.setItem("mindspace_user", JSON.stringify(snap.data()));
        router.push("/dashboard");
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const userData = {
          uid: cred.user.uid,
          name,
          email,
          role, // 'student', 'faculty', or 'other'
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "users", cred.user.uid), userData);
        localStorage.setItem("mindspace_user", JSON.stringify({ uid: cred.user.uid, name, email, role }));
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4 text-zinc-900">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-full mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Varsity Knowledge Hub
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Mind Space Library</h1>
          <p className="text-sm text-slate-500 mt-1">
            Role-based digital reading, isolated notes & physical issue portal
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`py-2 text-sm font-semibold rounded-lg transition ${
              isLogin ? "bg-white text-zinc-900 shadow-sm" : "text-slate-500 hover:text-zinc-700"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`py-2 text-sm font-semibold rounded-lg transition ${
              !isLogin ? "bg-white text-zinc-900 shadow-sm" : "text-slate-500 hover:text-zinc-700"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Tanvir Ahmed"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Varsity Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@varsity.edu"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Select Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="student">Student (30-Reader Capacity Rule)</option>
                <option value="faculty">Faculty Member (Priority Unlimited Access)</option>
                <option value="other">Other Varsity Member</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? "Processing..." : isLogin ? "Sign In to Library" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Role-based session & isolated storage enabled</span>
        </div>
      </div>
    </main>
  );
}