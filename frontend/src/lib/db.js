import { Pool } from "pg";

const url = process.env.DATABASE_URL;
const local = /localhost|127\.0\.0\.1/.test(url || "");
// Reuse one pool across hot reloads / serverless invocations
export const pool =
  globalThis._pgPool ||
  (globalThis._pgPool = new Pool({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false },
     max: 5 }));