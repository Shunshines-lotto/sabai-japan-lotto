-- Run once in Supabase SQL Editor (for auto-link ticket images)
ALTER TABLE public.lottery_images ADD COLUMN IF NOT EXISTS set_index integer;
ALTER TABLE public.lottery_images ADD COLUMN IF NOT EXISTS source_filename text;
ALTER TABLE public.lottery_images ADD COLUMN IF NOT EXISTS number_signature text;
