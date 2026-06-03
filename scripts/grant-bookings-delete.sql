-- Run once in Supabase SQL Editor if delete script returns 403 on bookings
GRANT DELETE ON public.bookings TO anon, authenticated;
DROP POLICY IF EXISTS "anon_delete_bookings" ON public.bookings;
CREATE POLICY "anon_delete_bookings" ON public.bookings
  FOR DELETE TO anon USING (true);
