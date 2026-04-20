/*
  # Create Music Storage Bucket and Our Story Settings

  ## Changes

  ### 1. Music Storage Bucket
  - Creates the `music` storage bucket for background MP3 uploads
  - Sets a 20MB file size limit
  - Restricts to audio MIME types only
  - Enables public access so the audio URL can be fetched by visitors
  - Adds RLS policies: authenticated admins can upload/delete, public can read

  ### 2. Our Story Settings
  - Adds `story_heading`, `story_paragraph_1`, and `story_paragraph_2` keys to `settings`
  - Pre-populated with the existing hardcoded text from Home.tsx
  - Allows admins to edit the Our Story section content from the Settings panel

  ### Security
  - Only authenticated users can upload/delete from the music bucket
  - Public (anon) can read/download from the music bucket (needed for playback)
*/

-- ============================================================
-- MUSIC STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'music',
  'music',
  true,
  20971520,
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/webm']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read music files"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'music');

CREATE POLICY "Authenticated can upload music files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'music');

CREATE POLICY "Authenticated can delete music files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'music');

CREATE POLICY "Authenticated can update music files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'music');

-- ============================================================
-- OUR STORY EDITABLE CONTENT
-- ============================================================

INSERT INTO settings (key, value, description) VALUES
  ('story_heading', 'A Love Story Worth Celebrating', 'Heading text for the Our Story section on the Home page'),
  ('story_paragraph_1', 'What started as a chance encounter blossomed into the most beautiful chapter of our lives. From late-night conversations to spontaneous adventures, every moment has brought us closer to this extraordinary day.', 'First paragraph of the Our Story section'),
  ('story_paragraph_2', 'We are overjoyed to invite you to witness our union and celebrate with us. Your presence means the world to us, and we cannot wait to create memories together that will last a lifetime.', 'Second paragraph of the Our Story section')
ON CONFLICT (key) DO NOTHING;
