import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getUser } from "@/lib/auth";

// A03: a user can only delete their own note. Someone else's id returns 404, not "forbidden".
export async function DELETE(_req, { params }) {
  const me = await getUser();
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const id = Number((await params).noteId);
  const r = await pool.query("DELETE FROM study_notes WHERE id=$1 AND user_id=$2", [id, me.id]);
  return r.rowCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Note not found." }, { status: 404 });
}