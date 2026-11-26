import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(_req, { params }) {
  const me = await getUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const bookId = Number((await params).id);
  if (!Number.isInteger(bookId)) {
    return NextResponse.json({ error: "Invalid book ID." }, { status: 400 });
  }

  const session = await pool.query(
    `SELECT 1 FROM reading_sessions 
     WHERE book_id = $1 AND user_id = $2 AND expires_at > NOW()`,
    [bookId, me.id]
  );

  if (!session.rowCount) {
    return NextResponse.json(
      { error: "Access denied. Claim a digital seat first." },
      { status: 403 }
    );
  }

  const specificPdf = path.join(process.cwd(), "public", "books", `${bookId}.pdf`);
  const fallbackPdf = path.join(process.cwd(), "public", "books", "sample.pdf");
  const pdfPath = fs.existsSync(specificPdf) ? specificPdf : fallbackPdf;

  if (!fs.existsSync(pdfPath)) {
    return NextResponse.json({ error: "PDF file not found." }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(pdfPath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="book-${bookId}.pdf"`,
    },
  });
}