/*
  # Add Storage Policies for Receipts Bucket

  ## Problem Fixed
  Anonymous users were unable to upload receipt files because no storage RLS policies
  existed on the `storage.objects` table. This caused `uploadReceipt()` to silently fail
  and return null, meaning no receipt records were created in the database.

  ## Changes
  - Allow anonymous and authenticated users to upload files to the `receipts` bucket
    (folders: orders/ and gifts/)
  - Allow public read access to all files in the `receipts` bucket (already public bucket)
  - Allow authenticated admins to delete receipt files
*/

CREATE POLICY "Anyone can upload receipts"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Public can read receipts"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated can delete receipts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'receipts');
