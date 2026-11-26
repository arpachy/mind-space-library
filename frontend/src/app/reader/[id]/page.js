"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  FileText,
  ExternalLink,
  Sparkles,
  StickyNote,
  CheckCircle2,
  BookmarkCheck,
} from "lucide-react";

const QUICK_TAGS = ["Page 1", "Page 2", "Page 3", "Page 4", "Key Formula"];

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
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [noteSavedToast, setNoteSavedToast] = useState(false);
  const [viewMode, setViewMode] = useState("pdf"); // "pdf" | "text"

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setUser(d.user))
      .catch(() => router.push("/"));
  }, [router]);

  // Book content only loads when the server confirms an active 4-day session
  useEffect(() => {
    if (!user) return;
    fetch(`/api/books/${bookId}/read`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setBook(d.book);
        setSession(d.session);
      })
      .catch((e) => setAccessError(e.message))
      .finally(() => setLoading(false));
  }, [user, bookId]);

  const loadNotes = useCallback(async () => {
    const r = await fetch(`/api/books/${bookId}/notes`);
    if (r.ok) setNotes((await r.json()).notes);
  }, [bookId]);

  useEffect(() => {
    if (user) loadNotes();
  }, [user, loadNotes]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    setNoteError("");
    setSavingNote(true);
    try {
      const r = await fetch(`/api/books/${bookId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteInput, pageRef: pageTag || "General Note" }),
      });
      if (!r.ok) return setNoteError((await r.json()).error);
      setNoteInput("");
      setPageTag("");
      setNoteSavedToast(true);
      setTimeout(() => setNoteSavedToast(false), 2500);
      loadNotes();
    } finally {
      setSavingNote(false);
    }
  };

  const deleteNote = async (id) => {
    const r = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (!r.ok) return setNoteError((await r.json()).error);
    loadNotes();
  };

  const release = async () => {
    setReleasing(true);
    await fetch(`/api/books/${bookId}/read`, { method: "DELETE" });
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#dad4ff] via-[#ece9ff] to-[#d8e3ff] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#1f1635] text-white flex items-center justify-center shadow-lg mb-3 animate-pulse">
          <BookOpen className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-[#1f1635]">Verifying 4-day reading pass...</p>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#dad4ff] via-[#ece9ff] to-[#d8e3ff] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl border border-red-200 p-7 text-center shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-lg text-[#1f1635] mb-1">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6">{accessError}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition"
          >
            Back to Library Dashboard
          </button>
        </div>
      </div>
    );
  }

  const expiry = new Date(session.expiresAt).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="relative min-h-screen text-zinc-900 p-0 lg:p-6 overflow-x-hidden">
      {/* Matching Crisp Library Background Image + Subtle Lavender Tint */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1920&q=80")`,
        }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#dad4ff]/55 via-[#ece9ff]/50 to-[#d8e3ff]/60 backdrop-blur-[2px]" />

      {/* Main Floating Glass Reader Shell */}
      <div className="max-w-7xl mx-auto min-h-screen lg:min-h-[calc(100vh-3rem)] bg-white/88 backdrop-blur-md lg:rounded-[30px] lg:border lg:border-white/90 shadow-2xl shadow-indigo-950/20 flex flex-col overflow-hidden">
        {/* Top Floating Reader Header */}
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-indigo-100/90 px-4 sm:px-7 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-10 h-10 rounded-xl bg-indigo-50/90 hover:bg-[#1f1635] text-[#1f1635] hover:text-white flex items-center justify-center transition shrink-0"
              aria-label="Back to dashboard"
              title="Back to library"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-[#1f1635] truncate">
                  {book.title}
                </h1>
                {book.category && (
                  <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 shrink-0">
                    {book.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">
                by <span className="font-medium text-slate-700">{book.author}</span>
                {book.isbn && <span className="hidden sm:inline text-slate-400"> • ISBN {book.isbn}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold bg-indigo-50/90 border border-indigo-100 text-indigo-900 px-3.5 py-2 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Expires: {expiry}</span>
            </div>

            <button
              onClick={release}
              disabled={releasing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200/80 hover:border-rose-600 text-xs font-semibold rounded-xl transition-all shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{releasing ? "Releasing..." : "Finish & Release Seat"}</span>
            </button>
          </div>
        </header>

        {/* Split Workspace: Left PDF Studio (7 cols) + Right Private Study Notes (5 cols) */}
        <main className="flex-1 px-4 sm:px-7 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Protected Digital Reader */}
          <section className="lg:col-span-7 bg-white/95 rounded-2xl border border-indigo-100/90 p-5 sm:p-6 shadow-xs flex flex-col">
            {/* Reader Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1f1635] bg-indigo-50 px-3 py-1.5 rounded-xl">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  Digital Edition
                </span>
                {session.isFaculty && (
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-xl">
                    Faculty Override
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Segmented View Toggle */}
                <div className="inline-flex rounded-xl bg-[#f4f3ff] p-1 border border-indigo-100 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setViewMode("pdf")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      viewMode === "pdf"
                        ? "bg-[#1f1635] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#1f1635]"
                    }`}
                  >
                    PDF Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("text")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      viewMode === "text"
                        ? "bg-[#1f1635] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#1f1635]"
                    }`}
                  >
                    Text Summary
                  </button>
                </div>

                <a
                  href={`/api/books/${bookId}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl transition"
                  title="Open protected PDF in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </a>
              </div>
            </div>

            {/* PDF Iframe or Text Summary View */}
            {viewMode === "pdf" ? (
              <div className="rounded-2xl overflow-hidden border border-indigo-100 bg-slate-100/80 shadow-inner flex-1 min-h-[580px]">
                <iframe
                  src={`/api/books/${bookId}/pdf`}
                  className="w-full h-[600px]"
                  title={`${book.title} PDF Viewer`}
                />
              </div>
            ) : (
              <div className="p-5 sm:p-6 bg-[#faf9ff] border border-indigo-100 rounded-2xl leading-7 whitespace-pre-wrap text-sm text-zinc-800 flex-1">
                {book.contentPreview}
              </div>
            )}

            {/* Footer Meta */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Reader: <strong className="text-zinc-800">{user.name}</strong> ({user.role})
              </span>
              <span className="inline-flex items-center gap-1.5 text-indigo-700 font-medium">
                <FileText className="w-3.5 h-3.5" /> 4-Day Licensed Stream (30-Seat Cap)
              </span>
            </div>
          </section>

          {/* Right Panel: Private Study Notes Studio */}
          <aside className="lg:col-span-5 bg-white/95 rounded-2xl border border-indigo-100/90 p-5 sm:p-6 shadow-xs flex flex-col">
            {/* Notes Header */}
            <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#1f1635] leading-tight">
                    Private Study Notes
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Encrypted to your account • Persists after session
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold bg-[#1f1635] text-white px-3 py-1 rounded-full">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </span>
            </div>

            {/* Add Note Form */}
            <form onSubmit={addNote} className="space-y-3 mb-5 pb-5 border-b border-slate-100">
              <div>
                <input
                  type="text"
                  aria-label="Chapter or page"
                  value={pageTag}
                  onChange={(e) => setPageTag(e.target.value)}
                  placeholder="Chapter / page reference (e.g. Ch. 1, Page 2)"
                  className="w-full px-3.5 py-2 bg-[#f7f6ff] border border-indigo-100 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
                {/* Quick Page Tag Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setPageTag(tag)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                        pageTag === tag
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border-slate-200/80"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                required
                aria-label="Note"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Write key takeaways, definitions, formulas, or exam highlights..."
                className="w-full p-3.5 bg-[#f7f6ff] border border-indigo-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition"
              />

              {noteError && (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {noteError}
                </p>
              )}

              <button
                type="submit"
                disabled={savingNote}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 transition"
              >
                {noteSavedToast ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Saved to Private Vault!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {savingNote ? "Saving note..." : "Save Private Note"}
                  </>
                )}
              </button>
            </form>

            {/* Saved Notes List */}
            <div className="space-y-3 overflow-y-auto max-h-[390px] pr-1 flex-1">
              {notes.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-2xl bg-[#faf9ff] border border-dashed border-indigo-200/80">
                  <StickyNote className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No study notes yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select a page tag above and save your first note.
                  </p>
                </div>
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="group p-3.5 rounded-2xl bg-[#f8f7ff] hover:bg-white border border-indigo-100/90 hover:border-indigo-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-800 bg-indigo-100/80 px-2.5 py-0.5 rounded-lg">
                        <BookmarkCheck className="w-3 h-3 text-indigo-600" />
                        {n.pageRef}
                      </span>
                      <button
                        onClick={() => deleteNote(n.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        aria-label="Delete note"
                        title="Delete note"
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

            <p className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              Notes are server-verified against your JWT session.
            </p>
          </aside>
        </main>
      </div>
    </div>
  );
}