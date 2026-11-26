import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getUser } from "@/lib/auth";

const out = (m, s) => NextResponse.json({ error: m }, { status: s });

export async function GET(_req, { params }) {
  const me = await getUser();
  if (!me) return out("Sign in first.", 401);
  const bookId = Number((await params).id);
  const r = await pool.query(
    `SELECT id, page_ref AS "pageRef", content, created_at AS "createdAt"
     FROM study_notes WHERE user_id=$1 AND book_id=$2 ORDER BY created_at DESC`, [me.id, bookId]);
  return NextResponse.json({ notes: r.rows });
}

export async function POST(req, { params }) {
  const me = await getUser();
  if (!me) return out("Sign in first.", 401);
  const bookId = Number((await params).id);
  const b = await req.json().catch(() => ({}));
  const content = String(b.content || "").trim(), pageRef = String(b.pageRef || "").trim().slice(0, 80) || "General";
  if (!content) return out("Write something before saving.", 400);
  if (content.length > 5000) return out("Notes are limited to 5000 characters.", 400);
  try {
    const r = await pool.query(
      `INSERT INTO study_notes (user_id,book_id,page_ref,content) VALUES ($1,$2,$3,$4)
       RETURNING id, page_ref AS "pageRef", content, created_at AS "createdAt"`, [me.id, bookId, pageRef, content]);
    return NextResponse.json({ note: r.rows[0] }, { status: 201 });
  } catch { return out("Could not save the note.", 500); }
}