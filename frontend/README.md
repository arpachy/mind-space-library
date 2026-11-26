# Mind Space Library — Digital Reader & University Book Store

A full-stack **Next.js (App Router) + PostgreSQL** academic library management system, protected PDF reader, and university print-copy pre-booking store. Engineered with PostgreSQL row-level locking (`SELECT ... FOR UPDATE`) to enforce real-time 30-seat digital reading limits and First-Come, First-Served (FCFS) physical book orders with automated bulk discounts.

---

## Core Features

### 1. Cinematic Welcome & Role-Based Authentication
- **Two-Step Entrance Flow:** Ambient video-backed welcome greeting hero transitioning smoothly into a responsive split-screen **Sign In / Create Account** portal.
- **JWT Session Security:** HTTP-only cookie authentication supporting **Student** and **Faculty** accounts.
- **Faculty Priority Override:** Faculty members can bypass the 30-concurrent-reader seat limit for research and classroom instruction.

### 2. Interactive Library Dashboard
- **Real-Time Search & Filtering:** Search books by title, author, or ISBN, filter by academic department, and switch views across **All Books**, **PDFs**, **Saved**, and **My Orders**.
- **Adaptive Responsive Views:** Horizontal card layout on mobile devices and a 3-column grid layout on desktop with manual view toggling.
- **Live Availability Indicators:** Displays real-time active digital readers (`X/30`) and remaining physical print copies.

### 3. Protected Digital PDF Reader & Encrypted Study Vault
- **4-Day Digital Loan Sessions:** Enforces a strict **30-concurrent-reader limit** per digital edition using PostgreSQL row-level locking (`FOR UPDATE`), automatically expiring after 4 days or when the user releases their seat.
- **Dual Reading Modes:** Embedded protected PDF viewer alongside a clean text summary reader.
- **Private Study Notes Vault:** Users can create chapter/page-tagged study notes (`Page 1`, `Key Formula`, etc.) bound to their account that persist after the reading session ends.

### 4. University Print Book Store (FCFS + Bulk Discounts)
- **First-Come, First-Served (FCFS) Stock Locking:** Print copy orders run inside atomic PostgreSQL transactions (`BEGIN` / `FOR UPDATE` / `COMMIT`) with sorted book ID locking to prevent overselling and deadlocks.
- **Automatic Tiered Bulk Discounts (Mix & Match Any Books):**
  - **1 book:** `0%` discount
  - **2–4 books:** `15%` discount
  - **5+ books:** `25%` discount
- **University Pre-Booking & Order Receipts:** Students and faculty submit their ID, department, phone number, and pickup note, and view confirmed FCFS receipts under **My Orders**.

---

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons
- **Backend:** Next.js Route Handlers (`frontend/src/app/api/*`), Node.js
- **Database:** PostgreSQL (`pg` connection pool with transactional row-level locking)
- **Authentication & Utilities:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, automated PDF generator (`generate-pdfs.mjs`), and concurrency test suite (`test-concurrency.mjs`)

---

## Project Structure

```text
mind-space-library/
├── frontend/
│   ├── public/                   # Static assets and generated sample PDFs
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── auth/         # Login, register, logout, and session check (/me)
│   │   │   │   ├── books/        # Catalog search, 4-day seat lock (/read), PDF stream, notes
│   │   │   │   ├── notes/        # Private study note deletion
│   │   │   │   └── orders/       # FCFS print book checkout & bulk discount engine
│   │   │   ├── dashboard/
│   │   │   │   └── page.js       # Catalog grid/list, FCFS Order Bag drawer & My Orders
│   │   │   ├── reader/
│   │   │   │   └── [id]/page.js  # Protected PDF viewer & private study notes studio
│   │   │   └── page.js           # Welcome greeting hero & Sign In / Register screen
│   │   └── lib/
│   │       ├── auth.js           # JWT signing & verification helpers
│   │       ├── db.js             # PostgreSQL pool & automatic order schema setup
│   │       └── firebase.js       # Firebase client/config helpers
│   ├── .env.local                # Local environment secrets (ignored by Git)
│   ├── generate-pdfs.mjs         # Script to generate sample digital edition PDFs
│   ├── test-concurrency.mjs      # Concurrency verification script for 30-seat & FCFS locks
│   ├── next.config.mjs
│   └── package.json
├── server/                       # Auxiliary server modules
├── firebase.json                 # Hosting/deployment configuration
├── .firebaserc
├── package.json
└── README.md