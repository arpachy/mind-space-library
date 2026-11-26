import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { getUser, signToken, publicUser } from "@/lib/auth";

const fail = (m, s = 400) => NextResponse.json({ error: m }, { status: s });

export async function GET(_req, { params }) {
  const { action } = await params;
  if (action !== "me") return fail("Not found", 404);
  const u = await getUser();
  return u ? NextResponse.json({ user: publicUser(u) }) : fail("Not signed in", 401);
}

export async function POST(req, { params }) {
  const { action } = await params;
  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete("token");
    return res;
  }
  if (!["login", "register"].includes(action)) return fail("Not found", 404);

  const b = await req.json().catch(() => ({}));
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Enter a valid email address.");
  if (password.length < 8) return fail("Password must be at least 8 characters.");

  let user;
  try {
    if (action === "register") {
      const name = String(b.name || "").trim();
      if (name.length < 2) return fail("Enter your full name.");
      if ((await pool.query("SELECT 1 FROM users WHERE email=$1", [email])).rowCount)
        return fail("That email already has an account. Sign in instead.", 409);
      // Everyone registers as a student. Faculty role is granted in the database.
      const r = await pool.query(
        "INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,'student') RETURNING id,name,email,role",
        [name, email, await bcrypt.hash(password, 10)]
      );
      user = r.rows[0];
    } else {
      const r = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
      const u = r.rows[0];
      if (!u || !(await bcrypt.compare(password, u.password_hash)))
        return fail("Wrong email or password.", 401);
      if (!u.is_active) return fail("This account is disabled.", 403);
      user = u;
    }
  } catch (e) {
    console.error(e);
    return fail("Server error. Try again.", 500);
  }

  const res = NextResponse.json(
    { user: publicUser(user) },
    { status: action === "register" ? 201 : 200 }
  );
  res.cookies.set("token", signToken(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 86400,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}