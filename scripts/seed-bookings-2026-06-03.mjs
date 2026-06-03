/**
 * Confirmed bookings — draw Wed 2026-06-03
 * node scripts/seed-bookings-2026-06-03.mjs
 */
const SUPA_URL = 'https://jbxvloruouddlkovdoot.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHZsb3J1b3VkZGxrb3Zkb290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODk2NzUsImV4cCI6MjA5NjA2NTY3NX0.Upe10fvcSE39KrGZO3C6i9TiuJV_ajFswm6lABJ2w9w';

const DRAW = '2026-06-03';

const headers = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
};

function pb(main, ball) {
  const m = [...main].sort((a, b) => a - b);
  return { mainSel: m, bonusSel: [ball], mode: 'manual' };
}

function tx(nums) {
  const m = [...nums].sort((a, b) => a - b);
  return { mainSel: m, bonusSel: [], mode: 'manual' };
}

function aon(nums) {
  const m = [...nums].sort((a, b) => a - b);
  return { mainSel: m, bonusSel: [], mode: 'manual' };
}

/** Power Ball — เลขตัวสุดท้าย = Power Ball */
const POWERBALL = [
  { name: 'Gunner', powerPlay: false, sets: [pb([69, 1, 4, 3, 57], 7)] },
  {
    name: 'ทีมหุ้น 70',
    powerPlay: false,
    sets: [pb([2, 28, 29, 43, 56], 16), pb([6, 11, 56, 61, 65], 13)],
  },
  { name: 'วิวรรธน์', powerPlay: false, sets: [pb([8, 13, 28, 49, 57], 2)] },
  { name: 'aum', powerPlay: false, sets: [pb([16, 47, 50, 58, 65], 8)] },
  { name: 'Lee', powerPlay: false, sets: [pb([33, 36, 39, 46, 61], 3)] },
  { name: '453 Yot', powerPlay: false, sets: [pb([14, 28, 46, 48, 57], 17)] },
  { name: 'เสี่ยค่อน', powerPlay: false, sets: [pb([2, 21, 31, 63, 67], 6)] },
  { name: 'Korn', powerPlay: true, sets: [pb([6, 22, 51, 55, 67], 17)] },
  { name: 'Wiroj', powerPlay: true, sets: [pb([18, 36, 41, 63, 69], 13)] },
  { name: 'tOnG', powerPlay: false, sets: [pb([18, 22, 58, 63, 64], 24)] },
  { name: 'Somnuk', powerPlay: false, sets: [pb([2, 25, 49, 51, 52], 11)] },
  { name: 'กมล', powerPlay: false, sets: [pb([29, 31, 38, 46, 59], 23)] },
  {
    name: 'อนุชิต',
    powerPlay: false,
    sets: [pb([44, 46, 52, 58, 60], 21), pb([8, 24, 48, 56, 63], 18)],
  },
  {
    name: 'Rattapol',
    powerPlay: false,
    sets: [pb([5, 22, 37, 54, 59], 9), pb([2, 10, 24, 44, 51], 4)],
  },
  { name: 'J-Kaisorn', powerPlay: false, sets: [pb([3, 9, 12, 57, 62], 21)] },
  { name: 'นาคิน', powerPlay: false, sets: [pb([14, 18, 29, 40, 44], 9)] },
  { name: 'Natcha', powerPlay: false, sets: [pb([25, 39, 43, 60, 65], 20)] },
  { name: 'สำราญ', powerPlay: false, sets: [pb([1, 4, 7, 28, 57], 12)] },
  { name: 'Supparerk', powerPlay: false, sets: [pb([7, 14, 35, 65, 66], 22)] },
  { name: 'Tumm', powerPlay: false, sets: [pb([18, 21, 48, 58, 59], 2)] },
  { name: 'Hugo', powerPlay: false, sets: [pb([28, 33, 47, 62, 64], 1)] },
  { name: 'Son', powerPlay: false, sets: [pb([1, 35, 38, 45, 59], 19)] },
];

const TXLOTTO = [
  {
    name: 'พิสิธ',
    sets: [tx([4, 7, 18, 33, 44, 54]), tx([13, 22, 27, 42, 44, 50])],
  },
  { name: 'Nuttiya', sets: [tx([6, 12, 14, 16, 30, 32])] },
  {
    name: 'Nipath',
    sets: [tx([7, 10, 12, 17, 36, 50]), tx([6, 16, 18, 33, 37, 44])],
  },
  { name: 'Tumm', sets: [tx([17, 18, 22, 31, 38, 47])] },
];

const ALL_OR_NOTHING = [
  {
    name: 'Kanyarat',
    sets: [aon([2, 5, 7, 9, 11, 14, 16, 18, 20, 21, 23, 24])],
  },
  {
    name: 'NAWAPAT',
    sets: [aon([1, 2, 3, 7, 8, 9, 10, 15, 16, 18, 20, 21])],
  },
  {
    name: 'Boondhram',
    sets: [aon([2, 3, 4, 8, 9, 12, 13, 16, 18, 19, 21, 23])],
  },
];

async function loadPrices() {
  const res = await fetch(`${SUPA_URL}/rest/v1/prices?select=*`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  const rows = await res.json();
  const map = {};
  rows.forEach((p) => {
    map[p.game_key] = p;
  });
  return map;
}

async function rest(method, path, body) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
}

function buildRow({ id, gameKey, gameName, entry, prices, powerPlay }) {
  const p = prices[gameKey];
  const sets = entry.sets.length;
  const pp = !!powerPlay;
  const unitSell = (Number(p.sell_price) || 0) + (pp ? Number(p.pp_sell) || 0 : 0);
  const unitCost = (Number(p.cost_price) || 0) + (pp ? Number(p.pp_cost) || 0 : 0);
  return {
    id,
    customer_name: entry.name,
    customer_phone: '',
    game_key: gameKey,
    game_name: gameName,
    draw_date: DRAW,
    sets_data: entry.sets,
    sets_count: sets,
    method: 'manual',
    power_play: pp,
    sell_price: unitSell,
    cost_price: unitCost,
    total_sell: unitSell * sets,
    total_cost: unitCost * sets,
    note: 'confirmed import 2026-06-03',
    status: 'confirmed',
  };
}

async function seedGame(gameKey, gameName, entries, idPrefix, prices, withPP) {
  let n = 0;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const id = `${idPrefix}${String(i + 1).padStart(3, '0')}`;
    const row = buildRow({
      id,
      gameKey,
      gameName,
      entry: e,
      prices,
      powerPlay: withPP ? e.powerPlay : false,
    });
    const check = await fetch(
      `${SUPA_URL}/rest/v1/bookings?id=eq.${id}&select=id`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
    );
    const existing = await check.json();
    if (existing.length) {
      console.log('SKIP exists', id, e.name);
      continue;
    }
    await rest('POST', 'bookings', row);
    n++;
    console.log(
      'OK',
      id,
      e.name,
      row.sets_count,
      'แถว',
      'บาท',
      row.total_sell,
      row.power_play ? '+PP' : ''
    );
  }
  return n;
}

async function main() {
  const prices = await loadPrices();
  console.log('Draw', DRAW);
  console.log(
    'Prices PB',
    prices.powerball?.sell_price,
    '+PP',
    prices.powerball?.pp_sell,
    '| TX',
    prices.txlotto?.sell_price,
    '| AON',
    prices.allornothing?.sell_price
  );

  const n1 = await seedGame('powerball', 'Power Ball', POWERBALL, 'SJL0603P', prices, true);
  const n2 = await seedGame('txlotto', 'TX Lotto', TXLOTTO, 'SJL0603L', prices, false);
  const n3 = await seedGame('allornothing', 'All or Nothing', ALL_OR_NOTHING, 'SJL0603A', prices, false);

  console.log('\nInserted:', n1, 'Power Ball,', n2, 'TX Lotto,', n3, 'All or Nothing');
  console.log('Realtime: open Admin on site — bookings channel updates automatically.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
