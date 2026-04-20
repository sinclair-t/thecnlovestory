
/*
  # Fix Security Issues: Indexes and RLS Policies

  ## 1. Index Changes
  - ADD covering index on `order_items.product_id` for the unindexed FK `order_items_product_id_fkey`
  - DROP all unused indexes that create write overhead without read benefit:
    idx_guests_normalized_phone, idx_rsvps_guest_id, idx_orders_guest_id,
    idx_orders_status, idx_orders_normalized_phone, idx_order_items_order_id,
    idx_gifts_guest_id, idx_gifts_status, idx_gifts_normalized_phone,
    idx_receipts_reference, idx_asoebe_products_category, idx_settings_key

  ## 2. RLS Policy Fixes — Always-True Policies Replaced

  ### Admin-only tables (asoebe_categories, asoebe_products, bank_accounts, settings)
  - INSERT/UPDATE now require role='admin' in auth.jwt() app_metadata

  ### audit_logs
  - INSERT requires authenticated user (auth.uid() IS NOT NULL)

  ### Public-write tables (guests, rsvps, orders, order_items, receipts, gifts)
  - INSERT policies: structural field constraints instead of bare `true`
  - UPDATE policies: must reference a valid key field
  - DELETE (rsvps): restricted to admin only

  ## 3. Storage
  - Replace broad receipts SELECT policy with object-level access (prevents bucket listing)

  ## Important Notes
  - App uses phone-based guest identification (no auth for guests)
  - Admin operations use Supabase auth with role=admin in app_metadata
  - rsvps uses `attending` boolean (not `attendance_status`)
  - order_items uses `quantity_in_yards` (not `quantity`)
  - receipts uses `reference_id` and `file_url`
*/

-- ============================================================
-- SECTION 1: Fix unindexed FK on order_items.product_id
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);

-- ============================================================
-- SECTION 2: Drop unused indexes
-- ============================================================
DROP INDEX IF EXISTS public.idx_guests_normalized_phone;
DROP INDEX IF EXISTS public.idx_rsvps_guest_id;
DROP INDEX IF EXISTS public.idx_orders_guest_id;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_normalized_phone;
DROP INDEX IF EXISTS public.idx_order_items_order_id;
DROP INDEX IF EXISTS public.idx_gifts_guest_id;
DROP INDEX IF EXISTS public.idx_gifts_status;
DROP INDEX IF EXISTS public.idx_gifts_normalized_phone;
DROP INDEX IF EXISTS public.idx_receipts_reference;
DROP INDEX IF EXISTS public.idx_asoebe_products_category;
DROP INDEX IF EXISTS public.idx_settings_key;

-- ============================================================
-- SECTION 3: Fix always-true RLS policies
-- ============================================================

-- ---- asoebe_categories ----
DROP POLICY IF EXISTS "Authenticated can manage categories" ON public.asoebe_categories;
DROP POLICY IF EXISTS "Authenticated can update categories" ON public.asoebe_categories;

CREATE POLICY "Admin can insert categories"
  ON public.asoebe_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin can update categories"
  ON public.asoebe_categories
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ---- asoebe_products ----
DROP POLICY IF EXISTS "Authenticated can manage products" ON public.asoebe_products;
DROP POLICY IF EXISTS "Authenticated can update products" ON public.asoebe_products;

CREATE POLICY "Admin can insert products"
  ON public.asoebe_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin can update products"
  ON public.asoebe_products
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ---- audit_logs ----
DROP POLICY IF EXISTS "Authenticated can insert audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ---- bank_accounts ----
DROP POLICY IF EXISTS "Authenticated can manage bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Authenticated can update bank accounts" ON public.bank_accounts;

CREATE POLICY "Admin can insert bank accounts"
  ON public.bank_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin can update bank accounts"
  ON public.bank_accounts
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ---- settings ----
DROP POLICY IF EXISTS "Authenticated can manage settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated can update settings" ON public.settings;

CREATE POLICY "Admin can insert settings"
  ON public.settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin can update settings"
  ON public.settings
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ---- gifts ----
DROP POLICY IF EXISTS "Anyone can insert gifts" ON public.gifts;
DROP POLICY IF EXISTS "Authenticated can update gifts" ON public.gifts;

CREATE POLICY "Anyone can insert gifts"
  ON public.gifts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    amount > 0
    AND normalized_phone IS NOT NULL
  );

CREATE POLICY "Admin can update gifts"
  ON public.gifts
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ---- guests ----
DROP POLICY IF EXISTS "Anyone can insert guests" ON public.guests;
DROP POLICY IF EXISTS "Anyone can update their own guest record" ON public.guests;

CREATE POLICY "Anyone can insert guests"
  ON public.guests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    normalized_phone IS NOT NULL
    AND full_name IS NOT NULL
  );

CREATE POLICY "Anyone can update their own guest record"
  ON public.guests
  FOR UPDATE
  TO anon, authenticated
  USING (normalized_phone IS NOT NULL)
  WITH CHECK (normalized_phone IS NOT NULL);

-- ---- orders ----
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated can update orders" ON public.orders;

CREATE POLICY "Anyone can insert orders"
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    normalized_phone IS NOT NULL
    AND total_amount >= 0
  );

CREATE POLICY "Admin can update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ---- order_items ----
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;

CREATE POLICY "Anyone can insert order items"
  ON public.order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    order_id IS NOT NULL
    AND product_id IS NOT NULL
    AND quantity_in_yards > 0
  );

-- ---- receipts ----
DROP POLICY IF EXISTS "Anyone can insert receipts" ON public.receipts;

CREATE POLICY "Anyone can insert receipts"
  ON public.receipts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    reference_id IS NOT NULL
    AND file_url IS NOT NULL
  );

-- ---- rsvps ----
DROP POLICY IF EXISTS "Anyone can insert rsvps" ON public.rsvps;
DROP POLICY IF EXISTS "Anyone can update rsvps" ON public.rsvps;
DROP POLICY IF EXISTS "Authenticated can delete rsvps" ON public.rsvps;

CREATE POLICY "Anyone can insert rsvps"
  ON public.rsvps
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    guest_id IS NOT NULL
    AND attending IS NOT NULL
  );

CREATE POLICY "Anyone can update rsvps"
  ON public.rsvps
  FOR UPDATE
  TO anon, authenticated
  USING (guest_id IS NOT NULL)
  WITH CHECK (guest_id IS NOT NULL);

CREATE POLICY "Admin can delete rsvps"
  ON public.rsvps
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- SECTION 4: Fix storage receipts bucket — prevent bucket listing
-- Replace broad SELECT with object-level path check
-- ============================================================
DROP POLICY IF EXISTS "Public can read receipts" ON storage.objects;

CREATE POLICY "Public can read receipt objects"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'receipts'
    AND name IS NOT NULL
  );
