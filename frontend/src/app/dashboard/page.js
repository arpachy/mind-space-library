"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Users,
  ShieldAlert,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Layers,
  Tag,
  Sparkles,
} from "lucide-react";

const CAP = 30;

const CATEGORY_STYLES = {
  "COMPUTER SCIENCE": {
    bar: "from-indigo-500 to-blue-600",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
  },
  BUSINESS: {
    bar: "from-sky-500 to-cyan-600",
    badge: "bg-sky-50 text-sky-700 ring-sky-200/70",
  },
  EDUCATION: {
    bar: "from-violet-500 to-purple-600",
    badge: "bg-violet-50 text-violet-700 ring-violet-200/70",
  },
  "LIFE SCIENCES": {
    bar: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  },
  HISTORY: {
    bar: "from-amber-500 to-orange-600",
    badge: "bg-amber-50 text-amber-800 ring-amber-200/70",
  },
  "SOCIAL SCIENCES": {
    bar: "from-rose-500 to-pink-600",
    badge: "bg-rose-50 text-rose-700 ring-rose-200/70",
  },
};

function getCategoryStyle(category = "") {
  return (
    CATEGORY_STYLES[category.toUpperCase()] || {
      bar: "from-blue-600 to-indigo-700",
      badge: "bg-blue-50 text-blue-800 ring-blue-200/70",
    }
  );
}

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
    return () => {
      clearTimeout(t);
      clearInterval(i);
    };
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
    <div className="min-h-screen bg-[#f6f7f9] text-zinc-900">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-800 text-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-tight">Mind Space Library</h1>
              <p className="text-[11px] text-slate-500">Digital & Physical Resource Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-zinc-800">{user.name}</p>
              <span
                className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${
                  isFaculty ? "bg-amber-100 text-amber-800" : "bg-blue-50 text-blue-800"
                }`}
              >
                {user.role}
                {isFaculty && " • Priority Override"}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {toast && (
          <div
            role="alert"
            className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 text-sm shadow-sm ${
              toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            {toast.type === "error" ? (
              <XCircle className="w-5 h-5 shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-8 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              aria-label="Search books"
              placeholder="Search by title, author, or ISBN..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-blue-700" /> {books.length} titles
            </span>
            <select
              aria-label="Category"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 w-full md:w-auto focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
            >
              <option value="All">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 bg-white rounded-2xl border border-slate-200/70 p-6 animate-pulse" />
            ))}
          </div>
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
              const pct = Math.min(100, Math.round((book.activeReaders / CAP) * 100));
              const style = getCategoryStyle(book.category);

              return (
                <article
                  key={book.id}
                  className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 hover:border-slate-300 transition-all duration-300"
                >
                  {/* Top Category Accent Strip */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${style.bar}`} />

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Meta Row */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ring-1 ring-inset ${style.badge}`}
                        >
                          {book.category}
                        </span>

                        {book.hasDigital && (
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                              full
                                ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200/70"
                                : book.activeReaders >= 25
                                ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/70"
                                : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/70"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                full ? "bg-red-500" : book.activeReaders >= 25 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                            />
                            {book.activeReaders}/{CAP} Readers
                          </span>
                        )}
                      </div>

                      {/* Title & Author */}
                      <h2 className="font-bold text-lg text-zinc-900 leading-snug mb-1 group-hover:text-blue-950 transition-colors">
                        {book.title}
                      </h2>
                      <p className="text-sm text-slate-500 mb-5">by {book.author}</p>

                      {/* Live Seat Capacity Meter (for digital editions) */}
                      {book.hasDigital && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                            <span className="inline-flex items-center gap-1 font-medium">
                              <Users className="w-3 h-3 text-slate-400" /> Digital seat occupancy
                            </span>
                            <span className="font-semibold text-slate-700">{CAP - book.activeReaders} open</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                full ? "bg-red-500" : book.activeReaders >= 25 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Stock & Price Stat Pills */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/60 mb-5">
                        <div className="flex items-start gap-2">
                          <Layers className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-slate-400 text-[11px] block">Physical stock</span>
                            <span className="font-semibold text-slate-800">{book.physicalCopies} copies</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 border-l border-slate-200/80 pl-2.5">
                          <Tag className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-slate-400 text-[11px] block">Purchase price</span>
                            <span className="font-semibold text-slate-800">{book.priceBdt} BDT</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action CTA */}
                    {book.hasDigital ? (
                      <button
                        onClick={() => readDigital(book)}
                        disabled={busy === book.id || (full && !isFaculty)}
                        className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                          override
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm shadow-amber-200"
                            : full
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white shadow-sm shadow-blue-900/15"
                        }`}
                      >
                        {override ? (
                          <>
                            <ShieldAlert className="w-4 h-4" />
                            Faculty priority read ({CAP}/{CAP})
                          </>
                        ) : full ? (
                          `Digital capacity full (${CAP}/${CAP})`
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />
                            <span>{busy === book.id ? "Allocating seat..." : "Read digital (4-day access)"}</span>
                            <ArrowUpRight className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="w-full py-2.5 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400 text-center font-medium">
                        Physical copy only • No digital edition
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}