const BASE = "http://localhost:3000";
const BOOK_ID = 104; // Je digital book-ta test korbe tar ID

async function registerAndLogin(email, password, name, role) {
  // Register (already thakle ignore korbe)
  await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name, role }),
  });

  // Login kore session cookie nibe
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.headers.get("set-cookie");
}

async function run() {
  console.log("1. Creating 35 test students + 1 faculty...");
  const studentCookies = [];
  for (let i = 1; i <= 35; i++) {
    const cookie = await registerAndLogin(
      `loadstudent${i}@test.com`,
      "Pass1234!",
      `Load Student ${i}`,
      "student"
    );
    studentCookies.push(cookie);
  }
  const facultyCookie = await registerAndLogin(
    "loadfaculty@test.com",
    "Pass1234!",
    "Dr. Faculty Override",
    "faculty"
  );

  console.log(`2. Firing 35 simultaneous seat requests on Book #${BOOK_ID}...`);
  const results = await Promise.all(
    studentCookies.map((cookie) =>
      fetch(`${BASE}/api/books/${BOOK_ID}/read`, {
        method: "POST",
        headers: { Cookie: cookie },
      }).then(async (r) => ({ status: r.status, body: await r.json() }))
    )
  );

  const succeeded = results.filter((r) => r.status === 200).length;
  const rejected = results.filter((r) => r.status === 409).length;

  console.log(`-> Seats Claimed (200 OK): ${succeeded} (Expected: 30)`);
  console.log(`-> Capacity Full (409 Conflict): ${rejected} (Expected: 5)`);

  console.log("3. Testing Faculty Priority Override when 30/30 full...");
  const facRes = await fetch(`${BASE}/api/books/${BOOK_ID}/read`, {
    method: "POST",
    headers: { Cookie: facultyCookie },
  });
  console.log("-> Faculty Status:", facRes.status, await facRes.json());
}

run();