-- Supabase Dashboard → SQL Editor → Run once
-- ลบข้อมูล Mega Millions งวด 2026-06-02 ทั้งหมด

DELETE FROM public.winners WHERE game_key = 'mega' AND draw_date = '2026-06-02';
DELETE FROM public.lottery_images WHERE game_key = 'mega' AND draw_date = '2026-06-02';
DELETE FROM public.lottery_results WHERE game_key = 'mega' AND draw_date = '2026-06-02';
DELETE FROM public.bookings WHERE game_key = 'mega' AND draw_date = '2026-06-02';
