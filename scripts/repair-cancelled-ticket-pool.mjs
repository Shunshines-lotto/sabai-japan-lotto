/**
 * Release lottery_images still linked to cancelled bookings
 * node scripts/repair-cancelled-ticket-pool.mjs
 */
const SUPA_URL = 'https://jbxvloruouddlkovdoot.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHZsb3J1b3VkZGxrb3Zkb290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODk2NzUsImV4cCI6MjA5NjA2NTY3NX0.Upe10fvcSE39KrGZO3C6i9TiuJV_ajFswm6lABJ2w9w';

const H = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function releaseBooking(booking) {
  let n = 0;
  const r1 = await fetch(
    `${SUPA_URL}/rest/v1/lottery_images?booking_id=eq.${booking.id}`,
    { method: 'PATCH', headers: H, body: JSON.stringify({ booking_id: null, set_index: null }) }
  );
  if (r1.ok) {
    const rows = await r1.json();
    n += rows.length;
  }
  for (const sd of booking.sets_data || []) {
    if (!sd.ticketImageId) continue;
    const r2 = await fetch(
      `${SUPA_URL}/rest/v1/lottery_images?id=eq.${encodeURIComponent(sd.ticketImageId)}`,
      { method: 'PATCH', headers: H, body: JSON.stringify({ booking_id: null, set_index: null }) }
    );
    if (r2.ok) {
      const rows = await r2.json();
      if (rows.length) n += rows.length;
    }
  }
  return n;
}

async function main() {
  const cancelled = await (
    await fetch(`${SUPA_URL}/rest/v1/bookings?status=eq.cancelled&select=id,game_key,draw_date,sets_data`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    })
  ).json();

  let total = 0;
  for (const b of cancelled) {
    const n = await releaseBooking(b);
    if (n) console.log('Released', n, 'for', b.id, b.game_key, b.draw_date);
    total += n;
  }
  console.log('Done. Released', total, 'image links from', cancelled.length, 'cancelled bookings');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
