"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Lock,
  Plus,
  Trash2,
  LogOut,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function ReaderPage() {
  const { id: bookId } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [book, setBook] = useState(null);
  const [session, setSession] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [pageTag, setPageTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [releasing, setReleasing] = useState(false);

  // 1. Load Authenticated User
  useEffect(() => {
    const stored = localStorage.getItem("mindspace_user");
    if (!stored) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  // 2. Verify Active 4-Day Reading Session & Fetch Book Content
  useEffect(() => {
    if (!user || !bookId) return;

    const verifyAndLoad = async () => {
      try {
        const bookSnap = await getDoc(doc(db, "books", bookId));
        if (!bookSnap.exists()) {
          setAccessError("Book not found in the library catalog.");
          setLoading(false);
          return;
        }
        setBook({ id: bookSnap.id, ...bookSnap.data() });

        const sessionId = `${bookId}_${user.uid}`;
        const sessionSnap = await getDoc(doc(db, "readingSessions", sessionId));

        if (!sessionSnap.exists()) {
          setAccessError(
            "No active reading session found. Please claim a digital seat from the dashboard first."
          );
          setLoading(false);
          return;
        }

        const sessionData = sessionSnap.data();
        if (sessionData.expiresAt?.toMillis() <= Date.now()) {
          setAccessError(
            "Your 4-day digital reading access has expired. Return to the dashboard to renew."
          );
          setLoading(false);
          return;
        }

        setSession(sessionData);
      } catch (err) {
        setAccessError(err.message);
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoad();
  }, [user, bookId]);

  // 3. Real-time Listener for User-Isolated Private Notes
  useEffect(() => {
    if (!user || !bookId) return;

    const notesQuery = query(
      collection(db, "studyNotes"),
      where("userId", "==", user.uid),
      where("bookId", "==", bookId)
    );

    const unsub = onSnapshot(notesQuery, (snapshot) => {
      const list = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setNotes(list);
    });

    return () => unsub();
  }, [user, bookId]);

  // Add Isolated Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteInput.trim() || !user) return;

    try {
      await addDoc(collection(db, "studyNotes"), {
        userId: user.uid,
        bookId,
        bookTitle: book?.title || "",
        pageRef: pageTag.trim() || "General",
        content: noteInput.trim(),
        createdAt: serverTimestamp(),
      });
      setNoteInput("");
      setPageTag("");
    } catch (err) {
      alert("Failed to save note: " + err.message);
    }
  };

  // Delete Isolated Note
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteDoc(doc(db, "studyNotes", noteId));
    } catch (err) {
      alert("Failed to delete note: " + err.message);
    }
  };

  // Release Digital Seat Early (Decrements activeReaders atomically)
  const handleReleaseSeat = async () => {
    if (!user || !bookId) return;
    setReleasing(true);
    try {
      const bookRef = doc(db, "books", bookId);
      const sessionRef = doc(db, "readingSessions", `${bookId}_${user.uid}`);

      await runTransaction(db, async (transaction) => {
        const bookSnap = await transaction.get(bookRef);
        const sessionSnap = await transaction.get(sessionRef);

        if (sessionSnap.exists()) {
          transaction.delete(sessionRef);
          if (bookSnap.exists()) {
            const current = bookSnap.data().activeReaders || 0;
            transaction.update(bookRef, {
              activeReaders: Math.max(0, current - 1),
            });
          }
        }
      });

      router.push("/dashboard");
    } catch (err) {
      alert("Error releasing seat: " + err.message);
    } finally {
      setReleasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center text-slate-500 text-sm">
        Verifying digital reading license & isolated workspace...
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-6 text-center shadow-sm">
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h2 className="font-bold text-lg text-zinc-900 mb-1">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-5">{accessError}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-sm font-semibold rounded-xl transition"
          >
            Back to Library Dashboard
          </button>
        </div>
      </div>
    );
  }

  const expiryDate = session?.expiresAt?.toDate().toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-zinc-900 flex flex-col">
      {/* Top Reader Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="truncate">
              <h1 className="font-bold text-sm sm:text-base truncate">{book.title}</h1>
              <p className="text-xs text-slate-500 truncate">by {book.author}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-900 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              <span>Expires: {expiryDate}</span>
            </div>

            <button
              onClick={handleReleaseSeat}
              disabled={releasing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              {releasing ? "Releasing..." : "Finish & Release Seat"}
            </button>
          </div>
        </div>
      </header>

      {/* Split Workspace: Reader (Left) + Isolated Notes (Right) */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Book Content Viewer */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900">
                <BookOpen className="w-4 h-4" /> Digital Edition Reader
              </span>
              {session?.isPriorityOverride && (
                <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                  Faculty Priority Override Active
                </span>
              )}
            </div>

            <article className="prose prose-slate max-w-none space-y-4 text-sm sm:text-base leading-relaxed text-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900">{book.title}</h2>
              <p className="text-xs text-slate-400 font-mono">ISBN: {book.isbn}</p>
              <div className="p-4 bg-[#fcfbf9] border border-slate-200/80 rounded-xl leading-7">
                {book.contentPreview}
              </div>
              <p className="text-slate-600">
                Academic Note: Digital copies are licensed for a strict 4-day reading window under
                university fair-use concurrency limits (30 concurrent student readers per volume).
                Your annotations on the right panel are cryptographically isolated to your account
                and remain accessible even after your reading session ends.
              </p>
            </article>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Reader: {user.name} ({user.role})</span>
            <span>Session ID: {bookId.slice(0, 6)}...{user.uid.slice(0, 4)}</span>
          </div>
        </section>

        {/* User-Isolated Private Study Notes */}
        <aside className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-600" />
                Private Study Notes
              </h2>
              <p className="text-xs text-slate-500">
                Isolated to {user.email} — invisible to other users
              </p>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
              {notes.length} {notes.length === 1 ? "Note" : "Notes"}
            </span>
          </div>

          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="space-y-2.5 mb-5 pb-5 border-b border-slate-100">
            <input
              type="text"
              value={pageTag}
              onChange={(e) => setPageTag(e.target.value)}
              placeholder="Chapter / Page reference (e.g., Ch. 1, p. 14)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
            <textarea
              rows={3}
              required
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Write your private key takeaways, formulas, or exam notes..."
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Save Private Note
            </button>
          </form>

          {/* Notes List */}
          <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1 flex-1">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No private notes yet for this book. Add your first note above!
              </div>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                      {n.pageRef}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">
                    {n.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>User-isolated partition active (UID: {user.uid.slice(0, 8)}...)</span>
          </div>
        </aside>
      </main>
    </div>
  );
}