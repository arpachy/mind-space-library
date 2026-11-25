CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'staff', 'librarian', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  isbn TEXT UNIQUE,
  has_digital BOOLEAN NOT NULL DEFAULT FALSE,
  digital_url TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_copies (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  copy_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'borrowed', 'reserved', 'lost')),
  UNIQUE (book_id, copy_number)
);

-- 1. Digital Access (4-day limit & 30-concurrent non-faculty reader rule)
CREATE TABLE IF NOT EXISTS digital_access (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '4 days'),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Private Notepad (Strictly isolated per user - A03 Challenge)
CREATE TABLE IF NOT EXISTS private_notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, book_id)
);

-- 3. Physical Loans (1-day advance pre-booking, 7-day loan, 100 BDT fine)
CREATE TABLE IF NOT EXISTS physical_loans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  copy_id INTEGER REFERENCES book_copies(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('reserved', 'borrowed', 'returned', 'cancelled')),
  requested_for TIMESTAMPTZ NOT NULL, -- Must be at least 1 day ahead
  borrowed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ, -- 7 days after borrowed_at
  returned_at TIMESTAMPTZ,
  fine_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Book Purchases (2-day advance request, 50% advance non-refundable on cancel)
CREATE TABLE IF NOT EXISTS book_purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  total_price NUMERIC(10, 2) NOT NULL,
  advance_paid NUMERIC(10, 2) NOT NULL, -- 50% of total_price
  pickup_date TIMESTAMPTZ NOT NULL, -- Must be at least 2 days ahead
  status TEXT NOT NULL DEFAULT 'pending_pickup' CHECK (status IN ('pending_pickup', 'completed', 'cancelled_forfeited')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Audit & Access History Logs (Tracks reading history & unauthorized attempts - A03 Challenge)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id INTEGER,
  status TEXT NOT NULL DEFAULT 'success',
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);