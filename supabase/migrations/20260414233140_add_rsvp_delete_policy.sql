/*
  # Add RSVP Delete Policy

  ## Purpose
  Allows authenticated admin users to delete RSVP records.
  This is required for the "Reject Order & Remove RSVP" feature in the admin Orders page,
  which removes a customer from the RSVP list when their Asoebi order is rejected.

  ## Changes
  - Adds a DELETE policy on the `rsvps` table for authenticated users

  ## Security
  - Only authenticated users (admins) can delete RSVP records
  - Public/anonymous users cannot delete RSVPs
*/

CREATE POLICY "Authenticated can delete rsvps"
  ON rsvps FOR DELETE
  TO authenticated
  USING (true);
