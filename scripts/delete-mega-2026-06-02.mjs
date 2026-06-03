/**
 * Remove all Mega Millions data for draw 2026-06-02
 * node scripts/delete-mega-2026-06-02.mjs
 */
const SUPA_URL = 'https://jbxvloruouddlkovdoot.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHZsb3J1b3VkZGxrb3Zkb290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODk2NzUsImV4cCI6MjA5NjA2NTY3NX0.Upe10fvcSE39KrGZO3C6i9TiuJV_ajFswm6lABJ2w9w';

const GAME = 'mega';
const DRAW = '2026-06-02';

const H = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function del(path) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, { method: 'DELETE', headers: H });
  const text = await res.text();
  if (!res.ok) throw new Error(`DELETE ${path}: ${res.status} ${text}`);
  try {
    return text ? JSON.parse(text) : [];
  } catch {
    return [];
  }
}

async function main() {
  const w = await del(`winners?game_key=eq.${GAME}&draw_date=eq.${DRAW}`);
  console.log('winners', Array.isArray(w) ? w.length : 0);

  const imgs = await del(`lottery_images?game_key=eq.${GAME}&draw_date=eq.${DRAW}`);
  console.log('lottery_images', Array.isArray(imgs) ? imgs.length : 0);

  try {
    await del(`lottery_results?id=eq.${GAME}-${DRAW}`);
    console.log('lottery_results', 1);
  } catch (e) {
    const r2 = await del(`lottery_results?game_key=eq.${GAME}&draw_date=eq.${DRAW}`);
    console.log('lottery_results', Array.isArray(r2) ? r2.length : 0);
  }

  const b = await del(`bookings?game_key=eq.${GAME}&draw_date=eq.${DRAW}`);
  console.log('bookings', Array.isArray(b) ? b.length : 0);

  console.log('Done — Mega', DRAW, 'cleared');
}

main().catch((e) => {
  console.error(e.message);
  console.error('If 403: run supabase-setup.sql (bookings DELETE grant) in SQL Editor, then retry.');
  process.exit(1);
});
