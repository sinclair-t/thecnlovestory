/*
  # Seed Initial Wedding Data

  Populates:
  - ASOEBE categories
  - ASOEBE products with demo pricing
  - Bank account details (placeholder)
  - Wedding settings (venue, schedule, notices)
*/

-- =====================
-- ASOEBE CATEGORIES
-- =====================
INSERT INTO asoebe_categories (name, slug, description, display_order, active) VALUES
  ('ASOEBE Girls', 'asoebe-girls', 'Beautiful fabric for the ladies attending the wedding', 1, true),
  ('ASOEBE Men', 'asoebe-men', 'Elegant fabric for the gentlemen attending the wedding', 2, true),
  ('Friends of the Bride', 'friends-of-bride', 'Special fabric reserved for the Bride''s closest friends', 3, true),
  ('Groom''s Family', 'grooms-family', 'Exclusive fabric for the Groom''s family members', 4, true),
  ('Bride''s Family', 'brides-family', 'Exclusive fabric for the Bride''s family members', 5, true)
ON CONFLICT DO NOTHING;

-- =====================
-- ASOEBE PRODUCTS
-- =====================
INSERT INTO asoebe_products (category_id, name, description, price_per_yard, image_url, active) VALUES
  (
    (SELECT id FROM asoebe_categories WHERE slug = 'asoebe-girls'),
    'Gold Damask Lace',
    'Stunning gold damask lace fabric perfect for the celebration. Rich texture with intricate patterns that catch the light beautifully. Minimum 4 yards recommended for a complete outfit.',
    18500.00,
    'https://images.pexels.com/photos/1040173/pexels-photo-1040173.jpeg',
    true
  ),
  (
    (SELECT id FROM asoebe_categories WHERE slug = 'asoebe-girls'),
    'Ivory Silk Georgette',
    'Luxurious ivory silk georgette with a fluid drape. Ideal for elegant gele wrapping and flowing gowns. Recommended minimum 6 yards.',
    22000.00,
    'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg',
    true
  ),
  (
    (SELECT id FROM asoebe_categories WHERE slug = 'asoebe-men'),
    'Forest Green Aso-Oke',
    'Premium hand-woven forest green aso-oke for the gentlemen. This rich fabric exudes elegance and tradition. Sold in full sets (agbada, buba, sokoto).',
    35000.00,
    'https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg',
    true
  ),
  (
    (SELECT id FROM asoebe_categories WHERE slug = 'asoebe-men'),
    'Gold Embossed Agbada Fabric',
    'Majestic gold embossed fabric for a grand agbada ensemble. Makes a bold statement at any celebration. Sold per yard.',
    28000.00,
    'https://images.pexels.com/photos/2531734/pexels-photo-2531734.jpeg',
    true
  ),
  (
    (SELECT id FROM asoebe_categories WHERE slug = 'friends-of-bride'),
    'Blush Pink Lace',
    'Delicate blush pink French lace exclusively for the Bride''s closest friends. Limited availability. Minimum 4 yards.',
    32000.00,
    'https://images.pexels.com/photos/1488319/pexels-photo-1488319.jpeg',
    true
  ),
  (
    (SELECT id FROM asoebe_categories WHERE slug = 'grooms-family'),
    'Deep Navy George',
    'Rich deep navy george fabric for the Groom''s family. High-quality hand-embroidered with subtle gold detailing.',
    25000.00,
    'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg',
    true
  ),
  (
    (SELECT id FROM asoebe_categories WHERE slug = 'brides-family'),
    'Champagne Lace Royale',
    'Exquisite champagne lace fabric reserved for the Bride''s family. Features intricate floral patterns with gold thread.',
    38000.00,
    'https://images.pexels.com/photos/3622622/pexels-photo-3622622.jpeg',
    true
  )
ON CONFLICT DO NOTHING;

-- =====================
-- BANK ACCOUNTS
-- =====================
INSERT INTO bank_accounts (label, bank_name, account_number, account_name, currency, purpose, active, display_order) VALUES
  ('ASOEBE Payment', 'First Bank of Nigeria', '3012345678', 'Adebayo Oluwaseun Trust', 'NGN', 'asoebe', true, 1),
  ('Gift Transfer', 'Guaranty Trust Bank (GTB)', '0123456789', 'Adebayo Oluwaseun Trust', 'NGN', 'gift', true, 2),
  ('General Payments', 'Access Bank', '0987654321', 'Adebayo Oluwaseun Trust', 'NGN', 'general', true, 3)
ON CONFLICT DO NOTHING;

-- =====================
-- SETTINGS
-- =====================
INSERT INTO settings (key, value, description) VALUES
  ('wedding_couple_names', 'Tunde & Amaka', 'Names of the couple'),
  ('wedding_date', 'September 20, 2026', 'Wedding date (display format)'),
  ('wedding_date_iso', '2026-09-20', 'Wedding date (ISO format)'),
  ('ceremony_time', '10:00 AM – 2:30 PM', 'Ceremony time'),
  ('reception_time', '4:30 PM – 1:00 AM', 'Reception time'),
  ('venue_name', 'Eko Hotels & Suites', 'Wedding venue name'),
  ('venue_address', 'Plot 1415, Adetokunbo Ademola Street, Victoria Island, Lagos, Nigeria', 'Full venue address'),
  ('venue_google_maps_url', 'https://maps.google.com', 'Google Maps link to venue'),
  ('asoebe_deadline', 'July 31, 2026', 'ASOEBE purchase deadline'),
  ('asoebe_deadline_iso', '2026-07-31', 'ASOEBE deadline (ISO format)'),
  ('shipping_covered_amount', '5000', 'NGN amount covered for shipping'),
  ('notice_no_physical_gifts', 'Please do not bring physical gifts. The bride and groom are not based in Nigeria. You can show your love through our gift section.', 'Notice about physical gifts'),
  ('notice_asoebe_mandatory', 'ASOEBE fabric is mandatory for seating allocation inside the wedding event hall.', 'Notice about ASOEBE requirement'),
  ('contact_email', 'wedding@tundeandamaka.com', 'Wedding contact email'),
  ('hashtag', '#TundeAndAmaka2026', 'Wedding hashtag'),
  ('groom_name', 'Tunde Adebayo', 'Groom full name'),
  ('bride_name', 'Amaka Okonkwo', 'Bride full name')
ON CONFLICT (key) DO NOTHING;
