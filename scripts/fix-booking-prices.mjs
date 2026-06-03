/**
 * Recalculate sell_price, cost_price, total_sell, total_cost from current prices table
 * node scripts/fix-booking-prices.mjs
 */
const SUPA_URL = 'https://jbxvloruouddlkovdoot.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHZsb3J1b3VkZGxrb3Zkb290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODk2NzUsImV4cCI6MjA5NjA2NTY3NX0.Upe10fvcSE39KrGZO3C6i9TiuJV_ajFswm6lABJ2w9w';

const H = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
};

async function main() {
  const prices = await (
    await fetch(`${SUPA_URL}/rest/v1/prices?select=*`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    })
  ).json();
  const map = {};
  prices.forEach((p) => { map[p.game_key] = p; });
  console.log('Prices:', prices.map((p) => `${p.game_key} sell=${p.sell_price}`).join(', '));

  const bookings = await (
    await fetch(`${SUPA_URL}/rest/v1/bookings?select=id,game_key,sets_count,power_play,sell_price,total_sell`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    })
  ).json();

  let n = 0;
  for (const b of bookings) {
    const p = map[b.game_key];
    if (!p) continue;
    const unitSell = (Number(p.sell_price) || 0) + (b.power_play ? Number(p.pp_sell) || 0 : 0);
    const unitCost = (Number(p.cost_price) || 0) + (b.power_play ? Number(p.pp_cost) || 0 : 0);
    const sets = b.sets_count || 1;
    const totalSell = unitSell * sets;
    const totalCost = unitCost * sets;
    if (b.sell_price === unitSell && b.total_sell === totalSell) continue;

    await fetch(`${SUPA_URL}/rest/v1/bookings?id=eq.${b.id}`, {
      method: 'PATCH',
      headers: H,
      body: JSON.stringify({
        sell_price: unitSell,
        cost_price: unitCost,
        total_sell: totalSell,
        total_cost: totalCost,
      }),
    });
    console.log('PATCH', b.id, b.game_key, sets, 'แถว', unitSell, '→ total', totalSell);
    n++;
  }
  console.log('Updated', n, 'bookings');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
