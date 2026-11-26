import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { pool } from "./db";

export function signToken(u) {
  return jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

// Returns the current user from the DB (so role changes and disabled accounts apply at once), or null.
export async function getUser() {
  const t = (await cookies()).get("token")?.value;
  if (!t) return null;
  try {
    const { id } = jwt.verify(t, process.env.JWT_SECRET);
    const r = await pool.query("SELECT id, name, email, role, is_active FROM users WHERE id=$1", [id]);
    const u = r.rows[0];
    return u && u.is_active ? u : null;
  } catch {
    return null;
  }
}
export const publicUser = (u) => ({ uid: String(u.id), name: u.name, email: u.email, role: u.role });