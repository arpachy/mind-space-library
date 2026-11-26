import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function createBookPdf(book, outPath) {
  const pdfDoc = await PDFDocument.create();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pagesContent = [
    {
      heading: "COVER & EDITION DETAILS",
      body: [
        `Title: ${book.title}`,
        `Author: ${book.author}`,
        `Category: ${book.category}`,
        `Digital Copy ID: #${book.id}`,
        "",
        "Mind Space Digital Library — Licensed 30-Seat Concurrent Edition.",
        "This digital copy is protected under a 4-day active reading session.",
      ],
    },
    {
      heading: "CHAPTER 1: INTRODUCTION & FOUNDATIONS",
      body: [
        `In "${book.title}", ${book.author} explores the foundational principles`,
        `of ${book.category}. Understanding these core building blocks is essential`,
        "for both academic mastery and practical real-world implementation.",
        "",
        "Key Learning Objectives:",
        "1. Understand the structural framework and historical context.",
        "2. Analyze primary methodologies and problem-solving patterns.",
        "3. Apply theoretical concepts to structured case studies.",
      ],
    },
    {
      heading: "CHAPTER 2: CORE METHODOLOGY & ANALYSIS",
      body: [
        "Modern systems require predictable behavior under concurrent load.",
        "Whether designing scalable architectures or analyzing complex literature,",
        "rigorous verification separates reliable work from fragile assumptions.",
        "",
        "Study Tip: Use the Private Study Notes panel on the right side of",
        "your reader screen to save page-referenced annotations (e.g., Page 3).",
      ],
    },
    {
      heading: "CHAPTER 3: CASE STUDIES & SUMMARY",
      body: [
        "Summary of Key Takeaways:",
        `- Primary focus areas within ${book.category} have been outlined.`,
        "- Critical review questions are provided below for exam preparation.",
        "",
        "Review Questions:",
        "1. What are the three main pillars discussed in Chapter 1?",
        "2. How do these principles apply to contemporary challenges?",
        "",
        "End of Preview Edition — Mind Space Library.",
      ],
    },
  ];

  pagesContent.forEach((p, idx) => {
    const page = pdfDoc.addPage([595, 842]);
    const { height } = page.getSize();

    page.drawText(`MIND SPACE LIBRARY | ${book.category.toUpperCase()}`, {
      x: 50,
      y: height - 50,
      size: 10,
      font: bold,
      color: rgb(0.35, 0.35, 0.45),
    });

    page.drawText(book.title, {
      x: 50,
      y: height - 85,
      size: 18,
      font: bold,
      color: rgb(0.1, 0.1, 0.15),
    });

    page.drawText(p.heading, {
      x: 50,
      y: height - 130,
      size: 13,
      font: bold,
      color: rgb(0.15, 0.35, 0.7),
    });

    let yPos = height - 165;
    for (const line of p.body) {
      page.drawText(line, {
        x: 50,
        y: yPos,
        size: 11,
        font: regular,
        color: rgb(0.15, 0.15, 0.15),
      });
      yPos -= 22;
    }

    page.drawText(`Page ${idx + 1} of ${pagesContent.length}`, {
      x: 260,
      y: 40,
      size: 10,
      font: regular,
      color: rgb(0.45, 0.45, 0.45),
    });
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outPath, pdfBytes);
}

async function run() {
  const outDir = path.join(process.cwd(), "public", "books");
  fs.mkdirSync(outDir, { recursive: true });

  const { rows } = await pool.query(
    "SELECT id, title, author, category FROM books WHERE has_digital = true ORDER BY id"
  );

  for (const book of rows) {
    await createBookPdf(book, path.join(outDir, `${book.id}.pdf`));
    console.log(`Generated: public/books/${book.id}.pdf (${book.title})`);
  }

  if (rows.length > 0) {
    await createBookPdf(rows[0], path.join(outDir, "sample.pdf"));
    console.log("Generated: public/books/sample.pdf");
  }

  await pool.end();
}

run();