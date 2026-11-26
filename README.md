# Mind Space Library
**A Smart Digital Reading & University Book Store Platform**

---

### What is Mind Space Library?
* **All-in-One Academic Hub:** A modern web application designed for schools, colleges, and universities to manage both **digital PDF reading** and **physical print book purchases** from a single platform.
* **Distraction-Free Reading Space:** Combines an ambient welcome experience, live book availability tracking, a protected PDF reader, and a personal study notes vault.

---

### Why This Project Was Built
* **Limited Copy Bottleneck:** In educational institutions, hundreds of students often need the same reference book at the same time during exams or assignments.
* **Unfair Stock & Manual Queues:** Traditional campus book counters face stock conflicts, manual booking delays, and lack real-time visibility on remaining copies.
* **Scattered Study Materials:** Students usually read PDFs in one app and take notes elsewhere, making exam revision disorganized.

---

### Key Features & Benefits
* **30-Seat Digital PDF Access (4-Day Loan):**
  * Up to **30 students** can read a digital edition simultaneously for 4 days, ensuring fair access without server overload.
  * Automatic seat release keeps popular books circulating smoothly.
* **Faculty Priority Override:**
  * Teachers and faculty members can bypass the 30-seat limit anytime for lecture preparation and research.
* **First-Come, First-Served (FCFS) Campus Book Store:**
  * Students can pre-book physical print copies online using their Student ID and department details.
  * Real-time database locking ensures that whoever orders first gets the copy—eliminating double-booking or stock errors.
* **Automatic Bulk Discounts for Students:**
  * **Buy 2–4 books (any mix):** Instant **15% OFF**
  * **Buy 5+ books (any mix):** Instant **25% OFF**
* **Private Study Notes Studio:**
  * Built-in PDF/text reader with a personal encrypted notes vault where students can save page-wise formulas and summaries to their account.

---

### Importance in Schools & Universities
* **24/7 Campus Accessibility:** Students can access textbooks and reserve print copies anytime from mobile or laptop, even outside library hours.
* **Zero Conflict & Full Transparency:** Live counters (`Active Readers` and `Copies Left`) keep the system completely fair and transparent for everyone.
* **Cost-Effective for Students:** Tiered bulk discounts encourage group purchases and make semester textbooks more affordable.
* **Paperless & Organized Administration:** Replaces manual logbooks with automated digital receipts, order tracking, and role-based access control.

---

### Tech Stack Used
* **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons
* **Backend:** Next.js API Routes, Node.js
* **Database:** PostgreSQL (with `FOR UPDATE` row-level concurrency locking)
* **Security:** JWT Authentication (HTTP-only cookies) & Encrypted Password Hashing (`bcryptjs`)

---

### Quick Setup
1. Clone the repository and navigate into `frontend/`
2. Run `npm install`
3. Add `DATABASE_URL` and `JWT_SECRET` in `.env.local`
4. Start the app with `npm run dev` and open `http://localhost:3000`
