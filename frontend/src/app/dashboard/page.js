"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import {
  BookOpen,
  Search,
  Users,
  ShieldAlert,
  LogOut,
  Database,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const SAMPLE_BOOKS = [
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    category: "Computer Science",
    isbn: "978-0132350884",
    physicalCopies: 4,
    priceBdt: 1200,
    activeReaders: 29, // 29/30 set for instant concurrency demo!
    contentPreview:
      "Chapter 1: Meaningful Names. Clean code is simple and direct. Clean code reads like well-written prose. Never obscure the designer's intent...",
  },
  {
    title: "Introduction to Algorithms (CLRS)",
    author: "Thomas H. Cormen",
    category: "Computer Science",
    isbn: "978-0262046305",
    physicalCopies: 2,
    priceBdt: 1850,
    activeReaders: 30, // Full (30/30) to test student block vs faculty override!
    contentPreview:
      "Chapter 2: Getting Started. Insertion sort is an efficient algorithm for sorting a small number of elements...",
  },
  {
    title: "Principles of Economics",
    author: "N. Gregory Mankiw",
    category: "Economics",
    isbn: "978-0357038314",
    physicalCopies: 5,
    priceBdt: 950,
    activeReaders: 12,
    contentPreview:
      "Chapter 1: Ten Principles of Economics. Scarcity means that society has limited resources and therefore cannot produce all the goods...",
  },
  {
    title: "Linear Algebra Done Right",
    author: "Sheldon Axler",
    category: "Mathematics",
    isbn: "978-3319110790",
    physicalCopies: 3,
    priceBdt: 1100,
    activeReaders: 8,
    contentPreview:
      "Chapter 1: Vector Spaces. Complex numbers were invented so that we can take square roots of negative numbers...",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  // 1. Check Auth Session
  useEffect(() => {
    const stored = localStorage.getItem("mindspace_user");
    if (!stored) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  // 2. Real-time Books Listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "books"), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBooks(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Seed Demo Books (One-click setup for judges/demo)
  const handleSeedBooks = async () => {
    setActionLoading("seed");
    try {
      for (const b of SAMPLE_BOOKS) {
        await addDoc(collection(db, "books"), {
          ...b,
          createdAt: serverTimestamp(),
        });
      }
      showToast("success", "4 sample academic books loaded into Firestore!");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // A05: Concurrency-Safe Digital Read Entry (30-User Limit + Faculty Override)
  const handleReadDigital = async (book) => {
    if (!user) return;
    setActionLoading(book.id);

    try {
      const bookRef = doc(db, "books", book.id);
      const sessionId = `${book.id}_${user.uid}`;
      const sessionRef = doc(db, "readingSessions", sessionId);

      await runTransaction(db, async (transaction) => {
        const bookSnap = await transaction.get(bookRef);
        const sessionSnap = await transaction.get(sessionRef);

        if (!bookSnap.exists()) throw new Error("Book record not found.");

        const currentReaders = bookSnap.data().activeReaders || 0;
        const isFaculty = user.role === "faculty";

        // Check if user already has an active, non-expired 4-day session
        if (sessionSnap.exists()) {
          const existing = sessionSnap.data();
          const now = Date.now();
          if (existing.expiresAt?.toMillis() > now) {
            return; // Already has active seat, let them enter without incrementing count
          }
        }

        // Enforce 30-reader concurrency limit for non-faculty users
        if (!isFaculty && currentReaders >= 30) {
          throw new Error(
            "Capacity Reached (30/30 active readers). Only Faculty members have priority override access right now."
          );
        }

        // Calculate 4-day digital access expiry (4 * 24 * 60 * 60 * 1000 ms)
        const fourDaysFromNow = Timestamp.fromMillis(
          Date.now() + 4 * 24 * 60 * 60 * 1000
        );

        // Increment active reader count atomically
        transaction.update(bookRef, {
          activeReaders: currentReaders + 1,
        });

        // Create/Renew 4-day reading session
        transaction.set(sessionRef, {
          bookId: book.id,
          bookTitle: book.title,
          userId: user.uid,
          userName: user.name,
          userRole: user.role,
          isPriorityOverride: isFaculty && currentReaders >= 30,
          startedAt: serverTimestamp(),
          expiresAt: fourDaysFromNow,
        });
      });

      // Redirect to isolated reader & private note studio (Step 3)
      router.push(`/reader/${book.id}`);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("mindspace_user");
    router.push("/");
  };

  const categories = ["All", ...new Set(books.map((b) => b.category))];
  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.includes(searchQuery);
    const matchesCat =
      selectedCategory === "All" || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-zinc-900">
      {/* Top Navbar */}
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
              <span
                className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  user.role === "faculty"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-50 text-blue-800"
                }`}
              >
                {user.role} {user.role === "faculty" && "• Priority Override"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Alert / Toast Banner */}
        {toast && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-sm ${
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

        {/* Search, Filter & Seed Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? "bg-blue-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {books.length === 0 && !loading && (
              <button
                onClick={handleSeedBooks}
                disabled={actionLoading === "seed"}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
              >
                <Database className="w-3.5 h-3.5" />
                {actionLoading === "seed" ? "Loading..." : "Seed Demo Books"}
              </button>
            )}
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <p className="text-center text-slate-500 py-12">Loading library catalog...</p>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center bg-white rounded-2xl border border-slate-200 p-12">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">No Books Found</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Click "Seed Demo Books" above to populate the catalog with sample academic titles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => {
              const readers = book.activeReaders || 0;
              const isFull = readers >= 30;
              const canOverride = user.role === "faculty" && isFull;

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                        {book.category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          isFull
                            ? "bg-red-50 text-red-700"
                            : readers >= 25
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        {readers}/30 Readers
                      </span>
                    </div>

                    <h2 className="font-bold text-lg leading-snug mb-1">{book.title}</h2>
                    <p className="text-sm text-slate-500 mb-4">by {book.author}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mb-5">
                      <div>
                        <span className="text-slate-400 block">Physical Stock</span>
                        <span className="font-semibold text-slate-700">
                          {book.physicalCopies} copies available
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Purchase Price</span>
                        <span className="font-semibold text-slate-700">
                          {book.priceBdt} BDT
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleReadDigital(book)}
                      disabled={actionLoading === book.id || (isFull && user.role !== "faculty")}
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition ${
                        canOverride
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : isFull
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-blue-900 hover:bg-blue-950 text-white"
                      }`}
                    >
                      {canOverride ? (
                        <>
                          <ShieldAlert className="w-4 h-4" />
                          Faculty Priority Read (Override 30/30)
                        </>
                      ) : isFull ? (
                        "Digital Capacity Full (30/30)"
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          {actionLoading === book.id
                            ? "Allocating Seat..."
                            : "Read Digital (4-Day Access)"}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => router.push(`/book/${book.id}`)}
                      className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      Physical Loan (7d) / Advance Book / Buy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}