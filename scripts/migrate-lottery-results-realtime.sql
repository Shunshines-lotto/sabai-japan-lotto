-- เปิด Realtime สำหรับ lottery_results (การ์ดหน้าแรกอัพเดตแจ็คพอต/ผลอัตโนมัติ)
-- รันครั้งเดียวใน Supabase SQL Editor ถ้ายังไม่เคยรัน

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE lottery_results;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
