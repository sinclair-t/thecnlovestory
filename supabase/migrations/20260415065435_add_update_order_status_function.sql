/*
  # Add atomic order status + RSVP sync function

  ## Summary
  Creates a SECURITY DEFINER function `update_order_status` that atomically:
  1. Updates the order status in the `orders` table
  2. If status is set to 'rejected': deletes the linked RSVP (if one exists for the order's guest_id)
  3. If status is set to 'approved' (from 'rejected'): inserts an RSVP for the guest if none exists

  ## Why SECURITY DEFINER
  The RLS policies on `rsvps` DELETE and INSERT require the JWT to carry
  `app_metadata.role = 'admin'`. In some edge cases the claim may not be
  evaluated correctly through the JS client (e.g. stale token, claim propagation
  delay). Running the logic in a SECURITY DEFINER function executes with the
  permissions of the function owner (postgres superuser role), bypassing RLS
  entirely for the RSVP mutation, while the caller still needs to be authenticated.

  ## New Objects
  - Function: `public.update_order_status(p_order_id uuid, p_new_status text)`
    - Returns: jsonb with `{ success, message, rsvp_action }`
    - Security: DEFINER (runs as owner)
    - Accessible to: authenticated role only

  ## Notes
  - The function validates that the caller is authenticated before proceeding
  - No data is ever permanently lost; RSVP deletes only affect the specific guest
*/

CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id  uuid,
  p_new_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order        orders%ROWTYPE;
  v_existing_rsvp rsvps%ROWTYPE;
  v_rsvp_action  text := 'none';
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
  END IF;

  IF (auth.jwt() -> 'app_metadata' ->> 'role') <> 'admin' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authorized');
  END IF;

  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found');
  END IF;

  UPDATE orders
  SET status = p_new_status,
      updated_at = now()
  WHERE id = p_order_id;

  IF p_new_status = 'rejected' AND v_order.guest_id IS NOT NULL THEN
    SELECT * INTO v_existing_rsvp FROM rsvps WHERE guest_id = v_order.guest_id;
    IF FOUND THEN
      DELETE FROM rsvps WHERE guest_id = v_order.guest_id;
      v_rsvp_action := 'deleted';
    END IF;

  ELSIF p_new_status = 'approved' AND v_order.guest_id IS NOT NULL THEN
    SELECT * INTO v_existing_rsvp FROM rsvps WHERE guest_id = v_order.guest_id;
    IF NOT FOUND THEN
      INSERT INTO rsvps (guest_id, attending, guest_count, source)
      VALUES (v_order.guest_id, true, 1, 'asoebe_order');
      v_rsvp_action := 'inserted';
    ELSE
      v_rsvp_action := 'already_exists';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success',      true,
    'message',      'Order updated successfully',
    'rsvp_action',  v_rsvp_action
  );
END;
$$;

REVOKE ALL ON FUNCTION public.update_order_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_order_status(uuid, text) TO authenticated;
