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
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  Receipt,
  Phone,
  Hash,
  Building2,
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
  const [navTab, setNavTab] = useState("all"); // "all" | "digital" | "saved" | "orders"
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [toast, setToast] = useState(null);
  const [layout, setLayout] = useState("grid");
  const [savedIds, setSavedIds] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // University Store Cart & FCFS Checkout State
  const [cart, setCart] = useState([]); // [{ bookId, title, author, priceBdt, maxCopies, quantity }]
  const [cartOpen, setCartOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupNote, setPickupNote] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orders, setOrders] = useState([]);

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

  const loadOrders = useCallback(async () => {
    try {
      const r = await fetch("/api/orders");
      if (r.ok) {
        const d = await r.json();
        setOrders(d.orders || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    const t = setTimeout(load, 250);
    const i = setInterval(load, 15000);
    loadOrders();
    return () => {
      clearTimeout(t);
      clearInterval(i);
    };
  }, [user, load, loadOrders]);

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

  // Cart & Bulk Discount Helpers (2-4 books = 15%, 5+ books = 25%)
  const addToCart = (book) => {
    if (Number(book.physicalCopies) <= 0) {
      say("error", `"${book.title}" is currently sold out.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.bookId === book.id);
      if (existing) {
        if (existing.quantity >= Number(book.physicalCopies)) {
          say("error", `Only ${book.physicalCopies} print copies available for "${book.title}".`);
          return prev;
        }
        return prev.map((item) =>
          item.bookId === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          bookId: book.id,
          title: book.title,
          author: book.author,
          priceBdt: Number(book.priceBdt),
          maxCopies: Number(book.physicalCopies),
          quantity: 1,
        },
      ];
    });
    setCartOpen(true);
  };

  const updateCartQty = (bookId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.bookId !== bookId) return item;
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          if (nextQty > item.maxCopies) {
            say("error", `Maximum ${item.maxCopies} print copies in stock.`);
            return item;
          }
          return { ...item, quantity: nextQty };
        })
        .filter(Boolean)
    );
  };

  const totalCartBooks = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.priceBdt * item.quantity, 0);
  const discountPercent = totalCartBooks >= 5 ? 25 : totalCartBooks >= 2 ? 15 : 0;
  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const cartFinalTotal = cartSubtotal - discountAmount;

  const submitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          department,
          phone,
          pickupNote,
          items: cart.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Order failed");

      say("success", d.message);
      setCart([]);
      setPickupNote("");
      setCartOpen(false);
      setNavTab("orders");
      load();
      loadOrders();
    } catch (err) {
      say("error", err.message);
      load();
    } finally {
      setPlacingOrder(false);
    }
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
      {/* Crisp Library Background Image + Subtle Lavender Tint */}
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
                      Library & Store
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

                <button
                  type="button"
                  onClick={() => {
                    setNavTab("orders");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    navTab === "orders"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                      : "text-indigo-100/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Receipt className="w-4 h-4" /> My Print Orders
                  </span>
                  {orders.length > 0 && (
                    <span className="text-[11px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full">
                      {orders.length}
                    </span>
                  )}
                </button>
              </nav>

              {categories.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/50 px-3 mb-2">
                    Departments
                  </p>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCat("All");
                        setNavTab("all");
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
                          setNavTab("all");
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
              <div className="rounded-2xl bg-gradient-to-br from-amber-400/20 via-orange-400/15 to-indigo-400/20 border border-white/15 p-3.5 text-center backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-white/15 mx-auto mb-2 flex items-center justify-center text-amber-300">
                  <Tag className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-white">University Bulk Offer</p>
                <p className="text-[11px] text-indigo-200/85 mt-1 leading-relaxed">
                  Buy <strong>2+ books</strong> for <strong>15% OFF</strong> •{" "}
                  <strong>5+ books</strong> for <strong>25% OFF</strong> (FCFS)
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

      {/* RIGHT SLIDE-OVER: UNIVERSITY FCFS BOOK STORE BAG & PRE-BOOK FORM */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-[#140e24]/50 backdrop-blur-xs"
            onClick={() => setCartOpen(false)}
          />
          <aside className="relative w-full max-w-md h-full bg-white shadow-2xl z-10 flex flex-col justify-between overflow-hidden">
            {/* Drawer Header */}
            <div className="bg-gradient-to-r from-[#1f1635] to-[#2e204f] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base leading-tight">
                    University Book Order Bag
                  </h2>
                  <p className="text-[11px] text-indigo-200/80">
                    First-Come, First-Served (FCFS) Stock Lock
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-xl text-indigo-200 hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bulk Discount Progress Banner */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-indigo-50 border-b border-amber-200/70 px-5 py-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#1f1635] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-orange-600" />
                  {discountPercent === 25
                    ? "Max 25% Bulk Discount Unlocked!"
                    : discountPercent === 15
                    ? "15% Discount Active! Add " + (5 - totalCartBooks) + " more for 25% OFF"
                    : totalCartBooks === 1
                    ? "Add 1 more book for 15% OFF!"
                    : "Buy 2 books (15% OFF) • Buy 5 books (25% OFF)"}
                </span>
                {discountPercent > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px]">
                    -{discountPercent}%
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-amber-200/60">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalCartBooks / 5) * 100)}%` }}
                />
              </div>
            </div>

            {/* Scrollable Cart Items + University Student Form */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {cart.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                  <p className="text-sm font-bold text-slate-700">Your order bag is empty</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Click <strong>"Buy Print"</strong> on any book card to reserve physical copies.
                  </p>
                </div>
              ) : (
                <>
                  {/* Selected Books List */}
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Selected Copies ({totalCartBooks})
                    </p>
                    {cart.map((item) => (
                      <div
                        key={item.bookId}
                        className="p-3 rounded-2xl bg-[#f8f7ff] border border-indigo-100 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-zinc-900 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.priceBdt} BDT × {item.quantity} •{" "}
                            <span className="text-emerald-700 font-semibold">
                              {item.maxCopies} left
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.bookId, -1)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            ) : (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.bookId, 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* University Student Pre-Booking Form */}
                  <form id="fcfs-order-form" onSubmit={submitOrder} className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#1f1635]">
                        University Pre-Booking Details
                      </p>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        FCFS Queue
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Student / Faculty ID *
                      </label>
                      <div className="relative">
                        <Hash className="w-3.5 h-3.5 text-indigo-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder="e.g. C211045"
                          className="w-full pl-9 pr-3 py-2 bg-[#f7f6ff] border border-indigo-100 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Department *
                        </label>
                        <div className="relative">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="e.g. CSE / BBA"
                            className="w-full pl-9 pr-3 py-2 bg-[#f7f6ff] border border-indigo-100 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-indigo-400 absolute left-3 top-3" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full pl-9 pr-3 py-2 bg-[#f7f6ff] border border-indigo-100 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Pickup Time / Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={pickupNote}
                        onChange={(e) => setPickupNote(e.target.value)}
                        placeholder="e.g. Tomorrow 11:00 AM at Central Library Desk"
                        className="w-full px-3 py-2 bg-[#f7f6ff] border border-indigo-100 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Sticky Price Breakdown & Confirm CTA */}
            {cart.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50/90 p-5 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal ({totalCartBooks} books)</span>
                    <span className="font-semibold text-zinc-800">
                      {cartSubtotal.toFixed(2)} BDT
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Bulk Discount ({discountPercent}%)</span>
                    <span>-{discountAmount.toFixed(2)} BDT</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-[#1f1635] pt-1.5 border-t border-slate-200">
                    <span>Payable at Library Desk</span>
                    <span>{cartFinalTotal.toFixed(2)} BDT</span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="fcfs-order-form"
                  disabled={placingOrder}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1f1635] via-indigo-700 to-purple-700 hover:opacity-95 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/20 transition disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {placingOrder ? "Locking Stock (FCFS)..." : "Confirm Purchase (FCFS)"}
                  </span>
                </button>
              </div>
            )}
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
                  Digital Reader & University Book Store
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                navTab === "all"
                  ? "bg-white text-[#1f1635] shadow-xs"
                  : "text-slate-600 hover:text-[#1f1635]"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              All Books
            </button>

            <button
              type="button"
              onClick={() => setNavTab("digital")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                navTab === "digital"
                  ? "bg-white text-[#1f1635] shadow-xs"
                  : "text-slate-600 hover:text-[#1f1635]"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              PDFs
            </button>

            <button
              type="button"
              onClick={() => setNavTab("saved")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                navTab === "saved"
                  ? "bg-white text-[#1f1635] shadow-xs"
                  : "text-slate-600 hover:text-[#1f1635]"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-600" />
              Saved
            </button>

            <button
              type="button"
              onClick={() => setNavTab("orders")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                navTab === "orders"
                  ? "bg-white text-[#1f1635] shadow-xs"
                  : "text-slate-600 hover:text-[#1f1635]"
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              My Orders
              {orders.length > 0 && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                  {orders.length}
                </span>
              )}
            </button>
          </nav>

          {/* Right: Order Bag Trigger + Bell + Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Live Order Bag Button */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-sm shadow-orange-500/25 transition active:scale-95"
              title="Open University Book Order Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Order Bag</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/25 text-[10px] font-extrabold">
                {totalCartBooks}
              </span>
              {discountPercent > 0 && (
                <span className="hidden xl:inline px-1.5 py-0.2 rounded-full bg-white text-orange-700 text-[10px] font-extrabold">
                  -{discountPercent}%
                </span>
              )}
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
                    <span className="text-xs font-bold text-[#1f1635]">Offers & Live Status</span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-50/70">
                      <Tag className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-zinc-900">Bulk Purchase Discounts</p>
                        <p className="text-[11px] text-slate-600">
                          Buy 2 books = <strong>15% OFF</strong> • Buy 5 books ={" "}
                          <strong>25% OFF</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-indigo-50/60">
                      <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-zinc-900">
                          First-Come, First-Served Store
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Print copies lock instantaneously upon order submission.
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
                      {user.role} • {orders.length} Print Orders
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNavTab("orders");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    My Print Orders ({orders.length})
                  </button>
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

          {/* Top Stat & Bulk Discount Banner Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-white/95 rounded-2xl border border-indigo-100/80 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-[#1f1635] leading-none">
                  {books.length} <span className="text-xs font-semibold text-slate-500">Titles</span>
                </p>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {digitalCount} Digital PDFs • {CAP}-Seat Cap
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Library className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                  University Bulk Deal
                </span>
                <p className="text-sm sm:text-base font-extrabold mt-1 leading-tight">
                  2 Books: 15% OFF • 5 Books: 25% OFF
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#23183d] to-[#342359] text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base font-extrabold leading-tight">
                  First-Come, First-Served
                </p>
                <p className="text-[11px] text-indigo-200/80 mt-1">
                  Limited print copies • Pre-book with Student ID
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold text-amber-300 transition shrink-0"
              >
                Bag ({totalCartBooks})
              </button>
            </div>
          </div>

          {/* VIEW A: MY PRINT ORDERS TAB */}
          {navTab === "orders" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#1f1635]">
                  My Confirmed Print Book Orders (FCFS)
                </h2>
                <button
                  type="button"
                  onClick={() => setNavTab("all")}
                  className="text-xs font-bold text-indigo-700 hover:underline"
                >
                  + Browse More Books
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center bg-white/95 rounded-2xl border border-indigo-100 p-12">
                  <Receipt className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg text-[#1f1635]">No print orders yet</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Select "Buy Print" on any book card to reserve physical copies with bulk discounts.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white/95 rounded-2xl border border-indigo-100 p-5 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-xs font-extrabold text-[#1f1635]">
                            Order #{ord.id}
                          </span>
                          <p className="text-[11px] text-slate-500">
                            ID: {ord.student_id} • {ord.department} • {ord.phone}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          {ord.status}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {(ord.items || []).map((it) => (
                          <div key={it.id} className="flex justify-between text-xs text-slate-700">
                            <span className="truncate pr-2">
                              {it.title} <strong>×{it.quantity}</strong>
                            </span>
                            <span className="font-semibold shrink-0">
                              {(Number(it.unitPriceBdt) * Number(it.quantity)).toFixed(2)} BDT
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-emerald-700 font-bold">
                          Discount Applied: {ord.discount_percent}%
                        </span>
                        <span className="text-sm font-extrabold text-[#1f1635]">
                          Total: {ord.final_total_bdt} BDT
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* VIEW B: CATALOG GRID / LIST WITH DIGITAL READ + BUY PRINT */
            <>
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

              {/* Sub-header Bar */}
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
                    Try a different search or category.
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
                    const soldOut = Number(book.physicalCopies) <= 0;

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
                                    Print Copy
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-3">
                            <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span
                                  className={`inline-flex items-center gap-1 font-medium ${
                                    soldOut ? "text-red-600" : "text-slate-600"
                                  }`}
                                >
                                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                                  {soldOut ? "Sold Out" : `${book.physicalCopies} copies`}
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

                            {/* Action Row: Bookmark + Read Digital + Buy Print (FCFS) */}
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

                              {book.hasDigital && (
                                <button
                                  onClick={() => readDigital(book)}
                                  disabled={busy === book.id || (full && !isFaculty)}
                                  className={`flex-1 py-2.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition shadow-xs ${
                                    override
                                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                                      : full
                                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                      : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                                  }`}
                                >
                                  {override ? (
                                    <>
                                      <ShieldAlert className="w-3.5 h-3.5" />
                                      <span>Priority</span>
                                    </>
                                  ) : full ? (
                                    `Full (${CAP})`
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5" />
                                      <span>{busy === book.id ? "..." : "Read PDF"}</span>
                                    </>
                                  )}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => addToCart(book)}
                                disabled={soldOut}
                                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition shrink-0 ${
                                  soldOut
                                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-white border-amber-200 hover:border-amber-500"
                                }`}
                                title="Order print copy (15% off on 2+, 25% off on 5+)"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>{soldOut ? "Sold Out" : "Buy Print"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}