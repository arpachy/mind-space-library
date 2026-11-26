import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET /api/books?q=&category=&page=&limit=
export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") || "").trim();
  const category = sp.get("category") || "";
  const limit = Math.min(Math.max(parseInt(sp.get("limit")) || 24, 1), 60);
  const offset = (Math.max(parseInt(sp.get("page")) || 1, 1) - 1) * limit;

  const where = [];
  const v = [];
  if (q) {
    v.push(`%${q}%`);
    where.push(`(b.title ILIKE $${v.length} OR b.author ILIKE $${v.length} OR b.isbn ILIKE $${v.length})`);
  }
  if (category && category !== "All") {
    v.push(category);
    where.push(`b.category = $${v.length}`);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";

  try {
    const total = Number((await pool.query(`SELECT COUNT(*) FROM books b ${w}`, v)).rows[0].count);
    const r = await pool.query(
      `SELECT b.id, b.title, b.author, b.category, b.isbn,
        b.has_digital AS "hasDigital", b.price AS "priceBdt",
        (SELECT COUNT(*) FROM book_copies c WHERE c.book_id=b.id AND c.status='available')::int AS "physicalCopies",
        (SELECT COUNT(*) FROM reading_sessions s WHERE s.book_id=b.id AND s.expires_at>NOW() AND NOT s.is_faculty)::int AS "activeReaders"
       FROM books b ${w}
       ORDER BY b.title
       LIMIT $${v.length + 1} OFFSET $${v.length + 2}`,
      [...v, limit, offset]
    );
    const cats = (await pool.query("SELECT DISTINCT category FROM books ORDER BY category")).rows.map((x) => x.category);
    return NextResponse.json({ total, books: r.rows, categories: cats });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not load books." }, { status: 500 });
  }
}