"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Search, Users, ShieldAlert, LogOut, Clock, CheckCircle2, XCircle } from "lucide-react";

const CAP = 30;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [toast, setToast] = useState(null);

  const say = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setUser(d.user))
      .catch(() => router.push("/"));
  }, [router]);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/books?${new URLSearchParams({ q, category: cat })}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setBooks(d.books);
      setCategories(d.categories);
    } catch (e) {
      say("error", e.message);
    } finally {
      setLoading(false);
    }
  }, [q, cat]);

  // Search as you type, and refresh reader counts every 15 seconds
  useEffect(() => {
    if (!user) return;
    const t = setTimeout(load, 250);
    const i = setInterval(load, 15000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, [user, load]);

  const readDigital = async (book) => {
    setBusy(book.id);
    try {
      const r = await fetch(`/api/books/${book.id}/read`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.push(`/reader/${book.id}`);
    } catch (e) {
      say("error", e.message);
      load();
    } finally {
      setBusy(null);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("mindspace_user");
    router.push("/");
  };

  if (!user) return null;
  const isFaculty = user.role === "faculty";

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-zinc-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Mind Space Library</h1>
              <p className="text-[11px] text-slate-500">Digital & Physical Resource Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isFaculty ? "bg-amber-100 text-amber-800" : "bg-blue-50 text-blue-800"}`}>
                {user.role}{isFaculty && " • Priority Override"}
              </span>
            </div>
            <button onClick={logout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Sign out" aria-label="Sign out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {toast && (
          <div role="alert" className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-sm ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
            {toast.type === "error" ? <XCircle className="w-5 h-5 shrink-0 text-red-600" /> : <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />}
            <p className="font-medium">{toast.message}</p>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              aria-label="Search books"
              placeholder="Search by title, author, or ISBN..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <select
            aria-label="Category"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-full md:w-auto"
          >
            <option value="All">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-slate-500 py-12">Loading library catalog...</p>
        ) : books.length === 0 ? (
          <div className="text-center bg-white rounded-2xl border border-slate-200 p-12">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">No books found</h3>
            <p className="text-sm text-slate-500 mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => {
              const full = book.activeReaders >= CAP;
              const override = isFaculty && full;
              return (
                <div key={book.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">{book.category}</span>
                      {book.hasDigital && (
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${full ? "bg-red-50 text-red-700" : book.activeReaders >= 25 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                          <Users className="w-3.5 h-3.5" />
                          {book.activeReaders}/{CAP} Readers
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-lg leading-snug mb-1">{book.title}</h2>
                    <p className="text-sm text-slate-500 mb-4">by {book.author}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mb-5">
                      <div>
                        <span className="text-slate-400 block">Physical stock</span>
                        <span className="font-semibold text-slate-700">{book.physicalCopies} copies available</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Purchase price</span>
                        <span className="font-semibold text-slate-700">{book.priceBdt} BDT</span>
                      </div>
                    </div>
                  </div>

                  {book.hasDigital ? (
                    <button
                      onClick={() => readDigital(book)}
                      disabled={busy === book.id || (full && !isFaculty)}
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition ${override ? "bg-amber-600 hover:bg-amber-700 text-white" : full ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-950 text-white"}`}
                    >
                      {override ? (<><ShieldAlert className="w-4 h-4" />Faculty priority read ({CAP}/{CAP})</>)
                        : full ? `Digital capacity full (${CAP}/${CAP})`
                        : (<><Clock className="w-4 h-4" />{busy === book.id ? "Allocating seat..." : "Read digital (4-day access)"}</>)}
                    </button>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-2.5">No digital edition. Physical copy only.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}