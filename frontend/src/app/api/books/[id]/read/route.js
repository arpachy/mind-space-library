import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getUser } from "@/lib/auth";

const CAP = 30;
const out = (m, s) => NextResponse.json({ error: m }, { status: s });

// POST: claim a 4-day digital seat. The book row is locked so two students cannot take the last seat together.
export async function POST(_req, { params }) {
  const me = await getUser();
  if (!me) return out("Sign in first.", 401);
  const bookId = Number((await params).id);
  if (!Number.isInteger(bookId)) return out("Invalid book.", 400);
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const b = await c.query("SELECT id FROM books WHERE id=$1 AND has_digital FOR UPDATE", [bookId]);
    if (!b.rowCount) { await c.query("ROLLBACK"); return out("No digital edition for this book.", 404); }
    const have = await c.query("SELECT 1 FROM reading_sessions WHERE book_id=$1 AND user_id=$2 AND expires_at>NOW()", [bookId, me.id]);
    if (have.rowCount) { await c.query("COMMIT"); return NextResponse.json({ ok: true, renewed: false }); }
    const faculty = me.role === "faculty";
    const n = (await c.query("SELECT COUNT(*)::int n FROM reading_sessions WHERE book_id=$1 AND expires_at>NOW() AND NOT is_faculty", [bookId])).rows[0].n;
    if (!faculty && n >= CAP) { await c.query("ROLLBACK"); return out(`Capacity reached (${CAP}/${CAP} readers). Only faculty can read right now.`, 409); }
    await c.query(
      `INSERT INTO reading_sessions (book_id,user_id,expires_at,is_faculty) VALUES ($1,$2,NOW()+INTERVAL '4 days',$3)
       ON CONFLICT (book_id,user_id) DO UPDATE SET started_at=NOW(), expires_at=NOW()+INTERVAL '4 days', is_faculty=$3`,
      [bookId, me.id, faculty]
    );
    await c.query("COMMIT");
    return NextResponse.json({ ok: true, priorityOverride: faculty && n >= CAP });
  } catch (e) {
    await c.query("ROLLBACK").catch(() => {});
    console.error(e);
    return out("Could not reserve a seat. Try again.", 500);
  } finally { c.release(); }
}

// GET: book content, only with an active session
export async function GET(_req, { params }) {
  const me = await getUser();
  if (!me) return out("Sign in first.", 401);
  const bookId = Number((await params).id);
  if (!Number.isInteger(bookId)) return out("Invalid book.", 400);
  const r = await pool.query(
    `SELECT b.id,b.title,b.author,b.isbn,b.content_preview AS "contentPreview", s.expires_at AS "expiresAt", s.is_faculty AS "isFaculty"
     FROM books b LEFT JOIN reading_sessions s ON s.book_id=b.id AND s.user_id=$2 WHERE b.id=$1`, [bookId, me.id]);
  const row = r.rows[0];
  if (!row) return out("Book not found.", 404);
  if (!row.expiresAt) return out("No active reading session. Claim a digital seat from the dashboard first.", 403);
  if (new Date(row.expiresAt) <= new Date()) return out("Your 4-day access expired. Return to the dashboard to renew.", 403);
  const { expiresAt, isFaculty, ...book } = row;
  return NextResponse.json({ book, session: { expiresAt, isFaculty } });
}

// DELETE: release the seat early
export async function DELETE(_req, { params }) {
  const me = await getUser();
  if (!me) return out("Sign in first.", 401);
  const bookId = Number((await params).id);
  await pool.query("DELETE FROM reading_sessions WHERE book_id=$1 AND user_id=$2", [bookId, me.id]);
  return NextResponse.json({ ok: true });
}