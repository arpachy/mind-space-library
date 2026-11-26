import { Pool } from "pg";

const url = process.env.DATABASE_URL;
const local = /localhost|127\.0\.0\.1/.test(url || "");

// Reuse one pool across hot reloads / serverless invocations
export const pool =
  globalThis._pgPool ||
  (globalThis._pgPool = new Pool({
    connectionString: url,
    ssl: local ? false : { rejectUnauthorized: false },
    max: 5,
  }));

let orderSchemaReady = null;

export function ensureOrderTables() {
  if (!orderSchemaReady) {
    orderSchemaReady = pool
      .query(`
        CREATE TABLE IF NOT EXISTS book_orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          student_id VARCHAR(50) NOT NULL,
          department VARCHAR(100) NOT NULL,
          phone VARCHAR(30) NOT NULL,
          pickup_note TEXT,
          total_books INTEGER NOT NULL,
          subtotal_bdt NUMERIC(10, 2) NOT NULL,
          discount_percent INTEGER NOT NULL DEFAULT 0,
          final_total_bdt NUMERIC(10, 2) NOT NULL,
          status VARCHAR(30) NOT NULL DEFAULT 'Confirmed (FCFS)',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS book_order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES book_orders(id) ON DELETE CASCADE,
          book_id INTEGER NOT NULL REFERENCES books(id),
          quantity INTEGER NOT NULL,
          unit_price_bdt NUMERIC(10, 2) NOT NULL
        );
      `)
      .catch((err) => {
        orderSchemaReady = null;
        throw err;
      });
  }
  return orderSchemaReady;
}