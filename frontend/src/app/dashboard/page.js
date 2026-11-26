"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  FileText,
  Layers,
  Sparkles,
  LayoutList,
  LayoutGrid,
  Bookmark,
  ShieldCheck,
  Compass,
  Library,
  MoreVertical,
  X,
  GraduationCap,
  Bell,
  ChevronDown,
  Zap,
} from "lucide-react";

const CAP = 30;

const CATEGORY_THEMES = {
  "COMPUTER SCIENCE": {
    gradient: "from-indigo-600 via-blue-700 to-slate-900",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
    images: [
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
    ],
  },
  BUSINESS: {
    gradient: "from-sky-600 via-blue-700 to-slate-900",
    badge: "bg-sky-50 text-sky-700 border-sky-200/70",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    ],
  },
  EDUCATION: {
    gradient: "from-violet-600 via-purple-700 to-slate-900",
    badge: "bg-violet-50 text-violet-700 border-violet-200/70",
    images: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
    ],
  },
  "LIFE SCIENCES": {
    gradient: "from-emerald-600 via-teal-700 to-slate-900",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    images: [
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80",
    ],
  },
  HISTORY: {
    gradient: "from-amber-600 via-orange-700 to-stone-900",
    badge: "bg-amber-50 text-amber-800 border-amber-200/70",
    images: [
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80",
    ],
  },
  "SOCIAL SCIENCES": {
    gradient: "from-rose-600 via-pink-700 to-slate-900",
    badge: "bg-rose-50 text-rose-700 border-rose-200/70",
    images: [
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80",
    ],
  },
};

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
];

function getBookTheme(book) {
  const key = (book.category || "").toUpperCase();
  const theme = CATEGORY_THEMES[key] || {
    gradient: "from-indigo-700 via-purple-800 to-slate-900",
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200/70",
    images: DEFAULT_IMAGES,
  };
  const imageUrl = theme.images[Number(book.id || 0) % theme.images.length];
  return { ...theme, imageUrl };
}

function BookCover({ book, isList }) {
  const [imgFailed, setImgFailed] = useState(false);
  const theme = getBookTheme(book);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${theme.gradient} shrink-0 ${
        isList
          ? "w-28 sm:w-52 h-auto min-h-[148px] rounded-xl"
          : "w-full h-44 sm:h-48 rounded-xl"
      }`}
    >
      {!imgFailed ? (
        <img
          src={theme.imageUrl}
          alt={book.title}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full p-3.5 flex flex-col justify-between text-white">
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">
            Mind Space Press
          </span>
          <div>
            <p className="font-bold text-xs sm:text-sm leading-snug line-clamp-2">{book.title}</p>
            <p className="text-[10px] opacity-75 mt-1">{book.author}</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
        {book.hasDigital ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold bg-emerald-500 text-white shadow-sm">
            <FileText className="w-3 h-3" /> PDF
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold bg-slate-800/90 text-white shadow-sm">
            Print
          </span>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const searchInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [navTab, setNavTab] = useState("all"); // "all" | "digital" | "saved"
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [toast, setToast] = useState(null);
  const [layout, setLayout] = useState("grid");
  const [savedIds, setSavedIds] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const syncLayout = () => {
      setLayout(window.innerWidth < 768 ? "list" : "grid");
    };
    syncLayout();
    window.addEventListener("resize", syncLayout);
    return () => window.removeEventListener("resize", syncLayout);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

  const toggleSave = (bookId) => {
    setSavedIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("mindspace_user");
    router.push("/");
  };

  if (!user) return null;
  const isFaculty = user.role === "faculty";
  const isList = layout === "list";

  const visibleBooks = books.filter((b) => {
    if (navTab === "digital") return b.hasDigital;
    if (navTab === "saved") return savedIds.includes(b.id);
    return true;
  });

  const digitalCount = books.filter((b) => b.hasDigital).length;

  return (
    <div className="relative min-h-screen text-zinc-900 p-0 lg:p-6 overflow-x-hidden">
      {/* Crisp Library Background Image + Subtle Lavender Tint (Reduced Blur) */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1920&q=80")`,
        }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#dad4ff]/55 via-[#ece9ff]/50 to-[#d8e3ff]/60 backdrop-blur-[2px]" />

      {/* Three-Dots Collapsible Dark Plum-Indigo Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#140e24]/45 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          <aside className="relative w-72 max-w-[84vw] h-full bg-gradient-to-b from-[#1f1635] via-[#251a40] to-[#19122b] text-white p-5 flex flex-col justify-between shadow-2xl z-10 border-r border-white/10">
            <div>
              <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-950/50">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-base tracking-tight block leading-none">
                      Mind Space
                    </span>
                    <span className="text-[11px] text-indigo-200/70 font-medium mt-1 block">
                      Digital Library
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl text-indigo-200 hover:bg-white/10 transition"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/50 px-3 mb-2.5">
                Navigation
              </p>
              <nav className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setNavTab("all");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    navTab === "all"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                      : "text-indigo-100/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Compass className="w-4 h-4" /> Overview
                  </span>
                  <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded-full">
                    {books.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNavTab("digital");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    navTab === "digital"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                      : "text-indigo-100/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <FileText className="w-4 h-4" /> E-Books & PDF
                  </span>
                  <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full">
                    {digitalCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNavTab("saved");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    navTab === "saved"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                      : "text-indigo-100/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4" /> Bookmarked
                  </span>
                  {savedIds.length > 0 && (
                    <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded-full">
                      {savedIds.length}
                    </span>
                  )}
                </button>
              </nav>

              {categories.length > 0 && (
                <div className="mt-7">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/50 px-3 mb-2.5">
                    Departments
                  </p>
                  <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCat("All");
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        cat === "All"
                          ? "bg-white/15 text-white font-semibold"
                          : "text-indigo-200/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      All Departments
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCat(c);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium truncate transition ${
                          cat === c
                            ? "bg-white/15 text-white font-semibold"
                            : "text-indigo-200/70 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4">
              <div className="rounded-2xl bg-gradient-to-br from-violet-400/25 via-purple-400/20 to-indigo-400/25 border border-white/15 p-4 text-center backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-white/15 mx-auto mb-2.5 flex items-center justify-center text-amber-300">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white">
                  {isFaculty ? "Faculty Priority Active" : "4-Day Digital Pass"}
                </p>
                <p className="text-[11px] text-indigo-200/80 mt-1 leading-relaxed">
                  {isFaculty
                    ? "Bypass 30-seat cap anytime for research & teaching."
                    : "Up to 30 concurrent readers per digital edition."}
                </p>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-indigo-200/80 hover:text-white hover:bg-red-500/20 transition"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Floating Glass Window Shell */}
      <div className="max-w-7xl mx-auto min-h-screen lg:min-h-[calc(100vh-3rem)] bg-white/88 backdrop-blur-md lg:rounded-[30px] lg:border lg:border-white/90 shadow-2xl shadow-indigo-950/20 flex flex-col overflow-hidden">
        {/* Interactive Top Floating Navbar */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-indigo-100/90 px-4 sm:px-7 h-16 flex items-center justify-between gap-3">
          {/* Left: Three-Dots Menu + Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              title="Open menu & departments"
              className="group w-10 h-10 rounded-xl bg-[#1f1635] hover:bg-indigo-700 text-white flex items-center justify-center shadow-sm shadow-indigo-950/20 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <MoreVertical className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white items-center justify-center shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-bold text-sm sm:text-base text-[#1f1635] tracking-tight leading-tight">
                  Mind Space Library
                </h1>
                <p className="text-[11px] text-slate-500 hidden xl:block">
                  Digital & Physical Resource Portal
                </p>
              </div>
            </div>
          </div>

          {/* Center: Interactive Segmented Pill Navigation */}
          <nav
            aria-label="Quick view switcher"
            className="hidden md:flex items-center gap-1 bg-indigo-50/80 p-1 rounded-2xl border border-indigo-100/90"
          >
            <button
              type="button"
              onClick={() => setNavTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                navTab === "all"
                  ? "bg-white text-[#1f1635] shadow-xs"
                  : "text-slate-600 hover:text-[#1f1635]"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              All Books
              <span className="text-[10px] font-bold bg-indigo-100/80 text-indigo-800 px-1.5 py-0.2 rounded-full">
                {books.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setNavTab("digital")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                navTab === "digital"
                  ? "bg-white text-[#1f1635] shadow-xs"
                  : "text-slate-600 hover:text-[#1f1635]"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              PDF Editions
              <span className="text-[10px] font-bold bg-purple-100/80 text-purple-800 px-1.5 py-0.2 rounded-full">
                {digitalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setNavTab("saved")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                navTab === "saved"
                  ? "bg-white text-[#1f1635] shadow-xs"
                  : "text-slate-600 hover:text-[#1f1635]"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-600" />
              Saved
              {savedIds.length > 0 && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                  {savedIds.length}
                </span>
              )}
            </button>
          </nav>

          {/* Right: Quick Search Pill + Live Bell Popover + Interactive User Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => searchInputRef.current?.focus()}
              title="Focus search (Ctrl + K)"
              className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-indigo-50 text-slate-500 hover:text-indigo-700 border border-slate-200/70 text-xs font-medium transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
              <kbd className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400">
                Ctrl K
              </kbd>
            </button>

            {/* Interactive Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setProfileOpen(false);
                }}
                aria-label="Library updates"
                className="relative p-2.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-950 transition"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-950/15 p-3.5 z-40">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-[#1f1635]">System Status</span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-indigo-50/60">
                      <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-zinc-900">
                          {digitalCount} Digital PDFs Online
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Instant 4-day seat allocation active.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-50/60">
                      <Users className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-zinc-900">
                          {isFaculty ? "Faculty Override Ready" : "30-Reader Fair Queue"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {isFaculty
                            ? "Unlimited priority access enabled."
                            : "Live reader counts sync every 15s."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 bg-indigo-50/90 hover:bg-indigo-100/80 border border-indigo-100 pl-2 pr-2.5 py-1.5 rounded-2xl transition"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                  {user.name?.slice(0, 2) || "MS"}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-zinc-900 leading-none">{user.name}</p>
                  <span
                    className={`inline-block text-[9px] font-bold uppercase tracking-wider mt-1 ${
                      isFaculty ? "text-amber-700" : "text-indigo-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-950/15 p-2 z-40">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-zinc-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 capitalize">
                      {user.role} Account • {savedIds.length} Saved
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNavTab("saved");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    Bookmarked Books ({savedIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition mt-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          className="flex-1 px-4 sm:px-7 py-6"
          onClick={() => {
            if (notifOpen) setNotifOpen(false);
            if (profileOpen) setProfileOpen(false);
          }}
        >
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

          {/* Top Stat Summary Row */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-white/95 rounded-2xl border border-indigo-100/80 p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-lg sm:text-2xl font-extrabold text-[#1f1635] leading-none">
                  {books.length}
                </p>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1">
                  Catalog Books
                </p>
              </div>
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 items-center justify-center">
                <Library className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white/95 rounded-2xl border border-indigo-100/80 p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-lg sm:text-2xl font-extrabold text-indigo-700 leading-none">
                  {digitalCount}
                </p>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1">
                  Digital PDFs
                </p>
              </div>
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-purple-50 text-purple-600 items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#23183d] to-[#342359] text-white rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-lg sm:text-2xl font-extrabold leading-none">
                  {CAP} <span className="text-xs font-semibold text-indigo-200">Seats</span>
                </p>
                <p className="text-[11px] sm:text-xs font-medium text-indigo-200/80 mt-1">
                  4-Day Access Cap
                </p>
              </div>
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-white/10 text-amber-300 items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="bg-white/95 p-3 rounded-2xl border border-indigo-100/90 shadow-2xs mb-5 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:flex-1">
              <Search className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3" />
              <input
                ref={searchInputRef}
                type="text"
                aria-label="Search books"
                placeholder="Search by title, author, or ISBN..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f7f6ff] border border-indigo-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                aria-label="Category"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="px-3.5 py-2 bg-[#f7f6ff] border border-indigo-100 rounded-xl text-sm font-medium text-slate-700 flex-1 md:w-56 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
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

          {/* Sub-header Bar with Result Count & List/Grid Switcher */}
          <div className="flex items-center justify-between mb-5 px-1">
            <p className="text-xs sm:text-sm font-medium text-slate-700">
              Showing{" "}
              <span className="font-bold text-[#1f1635]">{visibleBooks.length} Results</span>
            </p>
            <div className="inline-flex items-center gap-1 bg-white/95 p-1 rounded-xl border border-indigo-100 shadow-2xs">
              <button
                type="button"
                onClick={() => setLayout("list")}
                aria-label="List view"
                title="Horizontal card view"
                className={`p-1.5 rounded-lg transition ${
                  isList
                    ? "bg-[#1f1635] text-white shadow-xs"
                    : "text-slate-500 hover:text-[#1f1635]"
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLayout("grid")}
                aria-label="Grid view"
                title="Grid card view"
                className={`p-1.5 rounded-lg transition ${
                  !isList
                    ? "bg-[#1f1635] text-white shadow-xs"
                    : "text-slate-500 hover:text-[#1f1635]"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Book Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-80 bg-white/90 rounded-2xl border border-indigo-100/70 p-4 animate-pulse"
                />
              ))}
            </div>
          ) : visibleBooks.length === 0 ? (
            <div className="text-center bg-white/95 rounded-2xl border border-indigo-100 p-12">
              <BookOpen className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
              <h3 className="font-semibold text-lg text-[#1f1635]">No books found</h3>
              <p className="text-sm text-slate-500 mt-1">
                {navTab === "saved"
                  ? "Bookmark any book card to save it here."
                  : "Try a different search or category."}
              </p>
            </div>
          ) : (
            <div
              className={
                isList
                  ? "space-y-4"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              }
            >
              {visibleBooks.map((book) => {
                const full = book.activeReaders >= CAP;
                const override = isFaculty && full;
                const theme = getBookTheme(book);
                const isSaved = savedIds.includes(book.id);

                return (
                  <article
                    key={book.id}
                    className={`group bg-white/95 rounded-2xl border border-indigo-100/90 p-3.5 shadow-2xs hover:shadow-xl hover:shadow-indigo-950/10 hover:border-indigo-300 transition-all duration-300 ${
                      isList
                        ? "flex flex-row gap-3.5 sm:gap-5"
                        : "flex flex-col justify-between gap-4 hover:-translate-y-1"
                    }`}
                  >
                    <BookCover book={book} isList={isList} />

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border truncate ${theme.badge}`}
                          >
                            {book.category}
                          </span>
                          {book.hasDigital && (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                full
                                  ? "bg-red-50 text-red-700"
                                  : book.activeReaders >= 25
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              <Users className="w-3 h-3" />
                              {book.activeReaders}/{CAP}
                            </span>
                          )}
                        </div>

                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2
                              className={`font-bold text-zinc-900 leading-snug group-hover:text-indigo-700 transition-colors ${
                                isList ? "text-base sm:text-lg line-clamp-2" : "text-lg line-clamp-1"
                              }`}
                            >
                              {book.title}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              by <span className="font-medium text-slate-700">{book.author}</span>
                            </p>
                          </div>

                          {isList && (
                            <div className="text-right shrink-0">
                              <div className="text-base sm:text-lg font-extrabold text-zinc-900 leading-none">
                                {book.priceBdt}{" "}
                                <span className="text-[11px] font-bold text-slate-500">BDT</span>
                              </div>
                              <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                                Digital Free
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-slate-400" />
                              {book.physicalCopies} copies
                            </span>
                            {book.hasDigital && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                4-day
                              </span>
                            )}
                            {book.hasDigital && !isList && (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                Protected
                              </span>
                            )}
                          </div>

                          {!isList && (
                            <div className="text-right shrink-0">
                              <span className="text-sm font-extrabold text-zinc-900">
                                {book.priceBdt}{" "}
                                <span className="text-[11px] font-bold text-slate-500">BDT</span>
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSave(book.id)}
                            aria-label="Bookmark book"
                            className={`p-2.5 rounded-xl border transition shrink-0 ${
                              isSaved
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                : "bg-white border-slate-200 text-slate-500 hover:text-zinc-900 hover:border-slate-300"
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-indigo-700" : ""}`} />
                          </button>

                          {book.hasDigital ? (
                            <button
                              onClick={() => readDigital(book)}
                              disabled={busy === book.id || (full && !isFaculty)}
                              className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition shadow-xs ${
                                override
                                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                                  : full
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-600/20"
                              }`}
                            >
                              {override ? (
                                <>
                                  <ShieldAlert className="w-4 h-4" />
                                  Priority ({CAP}/{CAP})
                                </>
                              ) : full ? (
                                `Full (${CAP}/${CAP})`
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4" />
                                  <span>{busy === book.id ? "Opening..." : "Read Digital"}</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold text-center">
                              Physical Copy Only
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}