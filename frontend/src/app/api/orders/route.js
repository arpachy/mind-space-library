import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { pool, ensureOrderTables } from "@/lib/db";

const SECRET = process.env.JWT_SECRET || "mindspace_dev_secret_change_me";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("token")?.value ||
    cookieStore.get("auth_token")?.value ||
    cookieStore.get("mindspace_token")?.value;

  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// GET: Fetch current user's FCFS order history
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureOrderTables();

    const { rows: orders } = await pool.query(
      `SELECT o.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', oi.id,
                    'bookId', oi.book_id,
                    'title', b.title,
                    'author', b.author,
                    'quantity', oi.quantity,
                    'unitPriceBdt', oi.unit_price_bdt
                  )
                ) FILTER (WHERE oi.id IS NOT NULL),
                '[]'
              ) AS items
       FROM book_orders o
       LEFT JOIN book_order_items oi ON oi.order_id = o.id
       LEFT JOIN books b ON b.id = oi.book_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Place a First-Come, First-Served (FCFS) print book order with bulk discounts
export async function POST(req) {
  const client = await pool.connect();
  try {
    const user = await getAuthUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    await ensureOrderTables();

    const body = await req.json();
    const { studentId, department, phone, pickupNote = "", items = [] } = body;

    if (!studentId?.trim() || !department?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Student ID, Department, and Phone Number are required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your order bag is empty." }, { status: 400 });
    }

    // Sort book IDs ascending to prevent PostgreSQL deadlocks under concurrent orders
    const sortedItems = [...items]
      .map((i) => ({ bookId: Number(i.bookId), quantity: Math.max(1, Number(i.quantity || 1)) }))
      .sort((a, b) => a.bookId - b.bookId);

    await client.query("BEGIN");

    let subtotal = 0;
    let totalBooks = 0;
    const verifiedItems = [];

    for (const item of sortedItems) {
      // Row-level lock: guarantees First-Come, First-Served stock deduction
      const { rows } = await client.query(
        `SELECT id, title, physical_copies, price_bdt
         FROM books
         WHERE id = $1
         FOR UPDATE`,
        [item.bookId]
      );

      if (rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "One of the selected books was not found." }, { status: 404 });
      }

      const book = rows[0];
      if (Number(book.physical_copies) < item.quantity) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            error: `Sorry! "${book.title}" only has ${book.physical_copies} print copy left (First-Come, First-Served).`,
          },
          { status: 409 }
        );
      }

      const unitPrice = Number(book.price_bdt);
      subtotal += unitPrice * item.quantity;
      totalBooks += item.quantity;
      verifiedItems.push({ ...item, unitPrice, title: book.title });

      await client.query(
        `UPDATE books
         SET physical_copies = physical_copies - $1
         WHERE id = $2`,
        [item.quantity, item.bookId]
      );
    }

    // Bulk Discount Rules: 2-4 books = 15%, 5+ books = 25%
    const discountPercent = totalBooks >= 5 ? 25 : totalBooks >= 2 ? 15 : 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    const finalTotal = Number((subtotal - discountAmount).toFixed(2));

    const { rows: orderRows } = await client.query(
      `INSERT INTO book_orders
        (user_id, student_id, department, phone, pickup_note, total_books, subtotal_bdt, discount_percent, final_total_bdt)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        user.id,
        studentId.trim(),
        department.trim(),
        phone.trim(),
        pickupNote.trim(),
        totalBooks,
        subtotal.toFixed(2),
        discountPercent,
        finalTotal,
      ]
    );

    const order = orderRows[0];

    for (const item of verifiedItems) {
      await client.query(
        `INSERT INTO book_order_items (order_id, book_id, quantity, unit_price_bdt)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.bookId, item.quantity, item.unitPrice]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      message: `Order #${order.id} confirmed via First-Come, First-Served!`,
      order,
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}