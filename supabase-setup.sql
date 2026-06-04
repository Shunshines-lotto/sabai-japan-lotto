-- Sabai Japan Lotto — run once in Supabase Dashboard → SQL Editor
-- Fixes: "permission denied for table bookings" / "permission denied for table prices"

-- ── Tables ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.prices (
  game_key   text PRIMARY KEY,
  game_name  text NOT NULL,
  sell_price numeric NOT NULL DEFAULT 0,
  pp_sell    numeric NOT NULL DEFAULT 0,
  cost_price numeric NOT NULL DEFAULT 0,
  pp_cost    numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id              text PRIMARY KEY,
  customer_name   text,
  customer_phone  text,
  game_key        text NOT NULL,
  game_name       text,
  draw_date       date,
  sets_data       jsonb NOT NULL DEFAULT '[]'::jsonb,
  sets_count      integer NOT NULL DEFAULT 1,
  method          text DEFAULT 'random',
  power_play      boolean NOT NULL DEFAULT false,
  sell_price      numeric NOT NULL DEFAULT 0,
  cost_price      numeric NOT NULL DEFAULT 0,
  total_sell      numeric NOT NULL DEFAULT 0,
  total_cost      numeric NOT NULL DEFAULT 0,
  note            text,
  status          text NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Seed price rows for every game (Admin can edit later)
INSERT INTO public.prices (game_key, game_name, sell_price, pp_sell, cost_price, pp_cost) VALUES
  ('powerball',    'Power Ball',     0, 0, 0, 0),
  ('mega',         'Mega Millions',  0, 0, 0, 0),
  ('txtwostep',    'TX Two Step',    0, 0, 0, 0),
  ('txlotto',      'TX Lotto',       0, 0, 0, 0),
  ('allornothing', 'All or Nothing', 0, 0, 0, 0)
ON CONFLICT (game_key) DO NOTHING;

-- ── Privileges (required for browser / anon key) ───────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, UPDATE ON public.prices TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO anon, authenticated;

-- ── Row Level Security ─────────────────────────────────────────
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_prices" ON public.prices;
DROP POLICY IF EXISTS "anon_update_prices" ON public.prices;
DROP POLICY IF EXISTS "anon_select_bookings" ON public.bookings;
DROP POLICY IF EXISTS "anon_insert_bookings" ON public.bookings;
DROP POLICY IF EXISTS "anon_update_bookings" ON public.bookings;
DROP POLICY IF EXISTS "anon_delete_bookings" ON public.bookings;

CREATE POLICY "anon_select_prices" ON public.prices
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_update_prices" ON public.prices
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_select_bookings" ON public.bookings
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_bookings" ON public.bookings
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_bookings" ON public.bookings
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_bookings" ON public.bookings
  FOR DELETE TO anon USING (true);

-- Realtime (ปลอดภัยเมื่อรันซ้ำ — ข้ามถ้ามีในตาราง publication แล้ว)
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE bookings; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Lottery ticket images ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lottery_images (
  id           text PRIMARY KEY,
  game_key     text NOT NULL,
  draw_date    text NOT NULL,
  file_name    text NOT NULL,
  storage_path text NOT NULL,
  public_url   text NOT NULL,
  booking_id   text DEFAULT NULL,
  set_index    integer DEFAULT NULL,
  source_filename text DEFAULT NULL,
  number_signature text DEFAULT NULL,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.lottery_images ADD COLUMN IF NOT EXISTS set_index integer;
ALTER TABLE public.lottery_images ADD COLUMN IF NOT EXISTS source_filename text;
ALTER TABLE public.lottery_images ADD COLUMN IF NOT EXISTS number_signature text;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lottery_images TO anon, authenticated;

ALTER TABLE public.lottery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lottery_images" ON public.lottery_images;
DROP POLICY IF EXISTS "anon_insert_lottery_images" ON public.lottery_images;
DROP POLICY IF EXISTS "anon_update_lottery_images" ON public.lottery_images;
DROP POLICY IF EXISTS "anon_delete_lottery_images" ON public.lottery_images;

CREATE POLICY "anon_select_lottery_images" ON public.lottery_images
  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_lottery_images" ON public.lottery_images
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_lottery_images" ON public.lottery_images
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_lottery_images" ON public.lottery_images
  FOR DELETE TO anon USING (true);

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE lottery_images; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Storage bucket: lottery-tickets ─────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('lottery-tickets', 'lottery-tickets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "lottery_tickets_public_read" ON storage.objects;
DROP POLICY IF EXISTS "lottery_tickets_public_upload" ON storage.objects;
DROP POLICY IF EXISTS "lottery_tickets_public_update" ON storage.objects;
DROP POLICY IF EXISTS "lottery_tickets_public_delete" ON storage.objects;

CREATE POLICY "lottery_tickets_public_read" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'lottery-tickets');
CREATE POLICY "lottery_tickets_public_upload" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'lottery-tickets');
CREATE POLICY "lottery_tickets_public_update" ON storage.objects
  FOR UPDATE TO anon USING (bucket_id = 'lottery-tickets') WITH CHECK (bucket_id = 'lottery-tickets');
CREATE POLICY "lottery_tickets_public_delete" ON storage.objects
  FOR DELETE TO anon USING (bucket_id = 'lottery-tickets');

-- ── Lottery results, winners, Admin 2 income ────────────────────
CREATE TABLE IF NOT EXISTS public.lottery_results (
  id            text PRIMARY KEY,
  game_key      text NOT NULL,
  draw_date     text NOT NULL,
  main_numbers  jsonb NOT NULL DEFAULT '[]'::jsonb,
  bonus_number  integer NOT NULL DEFAULT 0,
  jackpot_usd   numeric NOT NULL DEFAULT 0,
  source        text DEFAULT 'manual',
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.winners (
  id               text PRIMARY KEY,
  booking_id       text NOT NULL,
  game_key         text NOT NULL,
  draw_date        text NOT NULL,
  customer_name    text,
  matched_numbers  jsonb,
  prize_usd        numeric NOT NULL DEFAULT 0,
  prize_thb        numeric NOT NULL DEFAULT 0,
  prize_level      text,
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin2_income (
  id         text PRIMARY KEY,
  draw_date  text NOT NULL,
  is_paid    boolean NOT NULL DEFAULT false,
  paid_at    timestamptz,
  created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lottery_results TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.winners TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin2_income TO anon, authenticated;

ALTER TABLE public.lottery_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin2_income ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_lottery_results" ON public.lottery_results;
DROP POLICY IF EXISTS "anon_all_winners" ON public.winners;
DROP POLICY IF EXISTS "anon_all_admin2_income" ON public.admin2_income;

CREATE POLICY "anon_all_lottery_results" ON public.lottery_results FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_winners" ON public.winners FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_admin2_income" ON public.admin2_income FOR ALL TO anon USING (true) WITH CHECK (true);

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE winners; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE lottery_results; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── LINE admin users (Messaging API push) ───────────────────────
CREATE TABLE IF NOT EXISTS public.line_admin_users (
  user_id        text PRIMARY KEY,
  display_name   text,
  picture_url    text,
  is_active      boolean NOT NULL DEFAULT true,
  notify_booking boolean NOT NULL DEFAULT true,
  last_seen_at   timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.line_admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.line_admin_users FROM anon, authenticated;
GRANT ALL ON public.line_admin_users TO service_role;
