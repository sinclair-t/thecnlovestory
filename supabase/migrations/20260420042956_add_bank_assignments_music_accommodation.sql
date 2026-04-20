/*
  # Add Bank Account Assignments, Music System, and Accommodation Settings

  ## Overview
  Three new features are added to the wedding app:

  ## 1. Bank Account Assignments
  - New table `product_bank_accounts` — many-to-many join table linking bank accounts to products
  - New table `gift_bank_accounts` — links bank accounts specifically to the gift page (multiple allowed)
  - Allows each product page to show different bank account(s) than others
  - Allows gift page to show one or multiple specific bank accounts
  - Falls back to purpose-based filtering if no specific assignments exist

  ## 2. Music System Settings
  - New rows in `settings` table for music configuration:
    - `music_enabled` — whether background music is active (true/false)
    - `music_file_path` — Supabase storage path of the uploaded MP3
    - `music_file_url` — Public URL of the MP3 file
    - `music_file_name` — Original filename for display
    - `music_volume` — Default volume (0.0–1.0), stored as decimal string

  ## 3. Accommodation Settings
  - New rows in `settings` table for accommodation notice:
    - `accommodation_enabled` — whether to show the notice (true/false)
    - `accommodation_hotel_name` — hotel name (default: Envoy Hotel)
    - `accommodation_hotel_url` — URL for hotel booking redirect
    - `accommodation_notice_text` — Custom notice text for guests

  ## Security
  - RLS enabled on new tables
  - Public users can read assignments (needed to show correct bank accounts)
  - Only authenticated admins can insert/update/delete assignments
*/

-- ============================================================
-- PRODUCT BANK ACCOUNT ASSIGNMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS product_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES asoebe_products(id) ON DELETE CASCADE,
  bank_account_id uuid NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, bank_account_id)
);

ALTER TABLE product_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read product bank account assignments"
  ON product_bank_accounts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert product bank account assignments"
  ON product_bank_accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete product bank account assignments"
  ON product_bank_accounts FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_product_bank_accounts_product_id ON product_bank_accounts(product_id);
CREATE INDEX IF NOT EXISTS idx_product_bank_accounts_bank_account_id ON product_bank_accounts(bank_account_id);

-- ============================================================
-- GIFT PAGE BANK ACCOUNT ASSIGNMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS gift_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id uuid NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(bank_account_id)
);

ALTER TABLE gift_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read gift bank account assignments"
  ON gift_bank_accounts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert gift bank account assignments"
  ON gift_bank_accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete gift bank account assignments"
  ON gift_bank_accounts FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_gift_bank_accounts_bank_account_id ON gift_bank_accounts(bank_account_id);

-- ============================================================
-- MUSIC SYSTEM SETTINGS
-- ============================================================

INSERT INTO settings (key, value, description) VALUES
  ('music_enabled', 'false', 'Whether background music plays on the public site'),
  ('music_file_path', '', 'Supabase storage path for the background music MP3'),
  ('music_file_url', '', 'Public URL of the background music MP3'),
  ('music_file_name', '', 'Original filename of the uploaded music'),
  ('music_volume', '0.4', 'Default playback volume (0.0 to 1.0)')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- ACCOMMODATION SETTINGS
-- ============================================================

INSERT INTO settings (key, value, description) VALUES
  ('accommodation_enabled', 'false', 'Whether to show the accommodation notice on the site'),
  ('accommodation_hotel_name', 'Envoy Hotel', 'Name of the recommended hotel'),
  ('accommodation_hotel_url', '', 'URL for the hotel booking page'),
  ('accommodation_notice_text', 'We have arranged special accommodation for our out-of-town guests at Envoy Hotel. Click the hotel name above to book your stay at our exclusive rate.', 'Custom notice text shown to guests')
ON CONFLICT (key) DO NOTHING;
