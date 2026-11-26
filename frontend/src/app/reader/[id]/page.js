"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, Lock, Plus, Trash2, LogOut, ShieldCheck, AlertTriangle } from "lucide-react";

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
  const [noteError, setNoteError] = useState("");

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
  useEffect(() => { if (user) loadNotes(); }, [user, loadNotes]);

  const addNote = async (e) => {
    e.preventDefault();
    setNoteError("");
    const r = await fetch(`/api/books/${bookId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: noteInput, pageRef: pageTag }),
    });
    if (!r.ok) return setNoteError((await r.json()).error);
    setNoteInput("");
    setPageTag("");
    loadNotes();
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

  if (loading) return <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center text-slate-500 text-sm">Checking your reading access...</div>;

  if (accessError) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-6 text-center shadow-sm">
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h2 className="font-bold text-lg mb-1">Access restricted</h2>
          <p className="text-sm text-slate-600 mb-5">{accessError}</p>
          <button onClick={() => router.push("/dashboard")} className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-sm font-semibold rounded-xl transition">
            Back to library dashboard
          </button>
        </div>
      </div>
    );
  }

  const expiry = new Date(session.expiresAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-zinc-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.push("/dashboard")} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition shrink-0" aria-label="Back to dashboard">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="truncate">
              <h1 className="font-bold text-sm sm:text-base truncate">{book.title}</h1>
              <p className="text-xs text-slate-500 truncate">by {book.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-900 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5" /> Expires: {expiry}
            </div>
            <button onClick={release} disabled={releasing} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition">
              <LogOut className="w-3.5 h-3.5" /> {releasing ? "Releasing..." : "Finish & release seat"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900"><BookOpen className="w-4 h-4" /> Digital edition</span>
            {session.isFaculty && <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">Faculty access</span>}
          </div>
          <h2 className="text-xl font-bold mb-1">{book.title}</h2>
          <p className="text-xs text-slate-400 font-mono mb-4">ISBN: {book.isbn}</p>
          <div className="p-4 bg-[#fcfbf9] border border-slate-200/80 rounded-xl leading-7 whitespace-pre-wrap">{book.contentPreview}</div>
          <p className="text-slate-600 text-sm mt-4">
            Digital copies are licensed for a 4-day reading window, with at most 30 student readers per book. Your notes stay private to your account and remain available after your session ends.
          </p>
          <p className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">Reader: {user.name} ({user.role})</p>
        </section>

        <aside className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-600" /> Private study notes</h2>
              <p className="text-xs text-slate-500">Only you can see these</p>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">{notes.length} {notes.length === 1 ? "note" : "notes"}</span>
          </div>

          <form onSubmit={addNote} className="space-y-2.5 mb-5 pb-5 border-b border-slate-100">
            <input type="text" aria-label="Chapter or page" value={pageTag} onChange={(e) => setPageTag(e.target.value)} placeholder="Chapter / page (e.g. Ch. 1, p. 14)" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900" />
            <textarea rows={3} required aria-label="Note" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Write your key takeaways, formulas, or exam notes..." className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none" />
            {noteError && <p role="alert" className="text-xs text-red-700">{noteError}</p>}
            <button type="submit" className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition">
              <Plus className="w-4 h-4" /> Save private note
            </button>
          </form>

          <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1 flex-1">
            {notes.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-xs">No notes for this book yet. Add your first one above.</p>
            ) : notes.map((n) => (
              <div key={n.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">{n.pageRef}</span>
                  <button onClick={() => deleteNote(n.id)} className="text-slate-400 hover:text-red-600 transition" aria-label="Delete note">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> Notes are checked against your account on the server.
          </p>
        </aside>
      </main>
    </div>
  );
}