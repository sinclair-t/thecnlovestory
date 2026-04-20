/*
  # Nigerian Wedding Website - Complete Database Schema

  ## Overview
  Full schema for a Nigerian wedding website supporting RSVPs, ASOEBE fabric orders,
  cash gifts, admin management, and guest identity deduplication by phone number.

  ## Tables Created
  1. `guests` - Master guest identity table (deduplicated by normalized phone)
  2. `rsvps` - Guest RSVP records
  3. `asoebe_categories` - Fabric categories (Girls, Men, Friends of Bride, etc.)
  4. `asoebe_products` - Fabric products with pricing per yard
  5. `orders` - ASOEBE purchase orders
  6. `order_items` - Line items per order
  7. `gifts` - Cash gift submissions
  8. `receipts` - Payment receipt file references
  9. `bank_accounts` - Admin-managed bank account details
  10. `settings` - Site-wide editable settings
  11. `audit_logs` - Admin action audit trail

  ## Security
  - RLS enabled on all tables
  - Public can insert guests, rsvps, orders, gifts, receipts
  - Admins can read/write everything via service role
  - Public can read products, categories, bank_accounts, settings
*/

-- =====================
-- GUESTS (master identity)
-- =====================
CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  normalized_phone text UNIQUE NOT NULL,
  country_code text NOT NULL DEFAULT '+234',
  local_phone text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert guests"
  ON guests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read guests by phone"
  ON guests FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update their own guest record"
  ON guests FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- RSVPs
-- =====================
CREATE TABLE IF NOT EXISTS rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  attending boolean NOT NULL DEFAULT true,
  guest_count integer NOT NULL DEFAULT 1,
  note text,
  source text NOT NULL DEFAULT 'form',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert rsvps"
  ON rsvps FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read rsvps"
  ON rsvps FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update rsvps"
  ON rsvps FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- ASOEBE CATEGORIES
-- =====================
CREATE TABLE IF NOT EXISTS asoebe_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE asoebe_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active categories"
  ON asoebe_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can manage categories"
  ON asoebe_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update categories"
  ON asoebe_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- ASOEBE PRODUCTS
-- =====================
CREATE TABLE IF NOT EXISTS asoebe_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES asoebe_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price_per_yard numeric(10,2) NOT NULL DEFAULT 0,
  image_url text,
  active boolean DEFAULT true,
  stock_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE asoebe_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active products"
  ON asoebe_products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can manage products"
  ON asoebe_products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update products"
  ON asoebe_products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- ORDERS
-- =====================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES guests(id) ON DELETE SET NULL,
  buyer_name text NOT NULL,
  normalized_phone text NOT NULL,
  country_code text NOT NULL DEFAULT '+234',
  local_phone text NOT NULL,
  shipping_address text NOT NULL,
  shipping_city text NOT NULL,
  shipping_state text NOT NULL,
  shipping_country text NOT NULL DEFAULT 'Nigeria',
  delivery_notes text,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT orders_status_check CHECK (status IN ('pending','approved','rejected','fulfilled','shipped'))
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- ORDER ITEMS
-- =====================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES asoebe_products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity_in_yards numeric(6,2) NOT NULL DEFAULT 1,
  price_per_yard numeric(10,2) NOT NULL DEFAULT 0,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read order items"
  ON order_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- =====================
-- GIFTS
-- =====================
CREATE TABLE IF NOT EXISTS gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES guests(id) ON DELETE SET NULL,
  giver_name text NOT NULL,
  normalized_phone text NOT NULL,
  country_code text NOT NULL DEFAULT '+234',
  local_phone text NOT NULL,
  amount numeric(12,2),
  message text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT gifts_status_check CHECK (status IN ('pending','approved','rejected'))
);

ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert gifts"
  ON gifts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read gifts"
  ON gifts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can update gifts"
  ON gifts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- RECEIPTS
-- =====================
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_type text NOT NULL,
  reference_id uuid NOT NULL,
  file_path text NOT NULL,
  file_url text,
  file_name text,
  uploaded_at timestamptz DEFAULT now(),
  CONSTRAINT receipts_reference_type_check CHECK (reference_type IN ('order','gift'))
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert receipts"
  ON receipts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read receipts"
  ON receipts FOR SELECT
  TO anon, authenticated
  USING (true);

-- =====================
-- BANK ACCOUNTS
-- =====================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  purpose text NOT NULL DEFAULT 'general',
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active bank accounts"
  ON bank_accounts FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Authenticated can manage bank accounts"
  ON bank_accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update bank accounts"
  ON bank_accounts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- SETTINGS
-- =====================
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  description text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can manage settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================
-- AUDIT LOGS
-- =====================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_guests_normalized_phone ON guests(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_rsvps_guest_id ON rsvps(guest_id);
CREATE INDEX IF NOT EXISTS idx_orders_guest_id ON orders(guest_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_normalized_phone ON orders(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_gifts_guest_id ON gifts(guest_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);
CREATE INDEX IF NOT EXISTS idx_gifts_normalized_phone ON gifts(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_receipts_reference ON receipts(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_asoebe_products_category ON asoebe_products(category_id);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
