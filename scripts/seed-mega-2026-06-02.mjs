/**
 * Seed Mega Millions test bookings — draw 2026-06-02
 * Run: node scripts/seed-mega-2026-06-02.mjs
 */
const SUPA_URL = 'https://jbxvloruouddlkovdoot.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHZsb3J1b3VkZGxrb3Zkb290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODk2NzUsImV4cCI6MjA5NjA2NTY3NX0.Upe10fvcSE39KrGZO3C6i9TiuJV_ajFswm6lABJ2w9w';

const DRAW = '2026-06-02';
const SELL = 150;
const COST = 120;

// Winning numbers from sheet row M11: 1 19 33 56 63 + Mega Ball 12
const RESULT_MAIN = [1, 19, 33, 56, 63];
const RESULT_BONUS = 12;

function set(main, bonus) {
  const m = [...main].sort((a, b) => a - b);
  return { mainSel: m, bonusSel: bonus ? [bonus] : [], mode: 'manual' };
}

/** @type {{ name: string, sets: ReturnType<typeof set>[] }[]} */
const ENTRIES = [
  { name: 'Nutthapong', sets: [set([18, 26, 29, 49, 63], 6)] },
  { name: 'Tumm', sets: [set([8, 32, 39, 42, 43], 15)] },
  { name: 'พท.ณัฐพล', sets: [set([4, 7, 49, 54, 67], 19)] },
  { name: 'Aew', sets: [set([13, 22, 34, 38, 40], 18)] },
  { name: 'คำรณ', sets: [set([7, 8, 49, 54, 59], 5)] },
  {
    name: 'Nop',
    sets: [
      set([3, 8, 15, 17, 18], 19),
      set([12, 44, 59, 65, 68], 6),
      set([18, 25, 39, 55, 64], 4),
      set([3, 8, 53, 61, 66], 16),
    ],
  },
  { name: 'คนธรรมดา', sets: [set([38, 48, 50, 51, 59], 18)] },
  { name: 'Akaraphol', sets: [set([24, 29, 41, 46, 62], 19)] },
  { name: 'Krailas', sets: [set([11, 45, 47, 57, 65], 2)] },
  { name: 'Racha', sets: [set([5, 7, 25, 30, 40], 23)] },
  { name: 'Leryot', sets: [set([8, 10, 33, 48, 50], 20)] },
  {
    name: 'X-m@n',
    sets: [set([11, 32, 50, 56, 64], 25), set([4, 40, 59, 61, 65], 9)],
  },
  { name: 'Kittikun.ph', sets: [set([11, 21, 23, 26, 45], 4)] },
  { name: 'กมล', sets: [set([11, 17, 58, 62, 64], 24)] },
  { name: 'Orawee', sets: [set([17, 35, 47, 57, 69], 17)] },
  { name: 'Nipath', sets: [set([5, 25, 38, 44, 46], 8)] },
  { name: 'Panu', sets: [set([5, 21, 40, 47, 54], 20)] },
  { name: 'Narase', sets: [set([16, 17, 25, 56, 67], 20)] },
  { name: 'Son', sets: [set([9, 19, 29, 49, 59], 3)] },
  { name: 'Jum', sets: [set([15, 40, 43, 57, 67], 2)] },
  { name: 'ta', sets: [set([16, 37, 38, 54, 55], 1)] },
  { name: 'infinity', sets: [set([17, 31, 49, 66, 69], 17)] },
  { name: 'ศศินันท์', sets: [set([7, 16, 25, 59, 61], 5)] },
  { name: 'Korn', sets: [set([4, 12, 26, 38, 55], 11)] },
  { name: 'Boy ฟ้าสาง', sets: [set([25, 27, 43, 54, 58], 5)] },
  { name: 'บุษบา', sets: [set([1, 4, 17, 25, 63], 20)] },
  { name: 'สำราญ', sets: [set([11, 19, 37, 38, 57], 5)] },
  {
    name: 'Rattapol',
    sets: [set([6, 43, 58, 60, 63], 21), set([7, 11, 26, 38, 66], 24)],
  },
  { name: 'Nuttiya_kik', sets: [set([6, 12, 14, 16, 30], 3)] },
  { name: 'เสี่ยค่อน', sets: [set([11, 15, 26, 34, 65], 5)] },
  { name: 'โอฟ้าร', sets: [set([9, 13, 25, 36, 44], 20)] },
  { name: 'MAN519', sets: [set([6, 12, 26, 27, 42], 24)] },
  { name: 'Lucky', sets: [set([7, 17, 51, 53, 65], 19)] },
  {
    name: 'Krati',
    sets: [
      set([7, 43, 48, 51, 65], 20),
      set([5, 21, 29, 30, 52], 20),
      set([13, 14, 16, 38, 67], 21),
    ],
  },
  { name: 'Anuchit', sets: [set([6, 23, 28, 44, 51], 11)] },
  { name: 'Oil-Oilwondering', sets: [set([7, 18, 48, 59, 67], 2)] },
  { name: 'Ton 92', sets: [set([11, 13, 21, 57, 60], 23)] },
  { name: 'Amp', sets: [set([5, 42, 48, 52, 64], 3)] },
  { name: 'เกม', sets: [set([2, 18, 19, 26, 45], 25)] },
  { name: 'Arnut', sets: [set([5, 27, 50, 57, 64], 4)] },
  { name: 'หน่อย', sets: [set([9, 10, 45, 64, 68], 24)] },
  { name: 'qwin', sets: [set([11, 35, 51, 63, 70], 2)] },
  { name: 'เอ๋ ป่าใหญ่', sets: [set([7, 14, 39, 59, 61], 9)] },
  { name: 'Nakhajohn', sets: [set([6, 17, 26, 48, 54], 23)] },
  { name: 'Apinant.', sets: [set([1, 2, 16, 28, 29], 7)] },
];

const headers = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
};

async function rest(method, path, body, extraHeaders = {}) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    method,
    headers: { ...headers, ...extraHeaders },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${method} ${path}: ${res.status} ${t}`);
  }
  return res;
}

function buildBooking(entry, idx) {
  const sets = entry.sets.length;
  const id = `SJLMEGA${String(idx + 1).padStart(3, '0')}`;
  return {
    id,
    customer_name: entry.name,
    customer_phone: '',
    game_key: 'mega',
    game_name: 'Mega Millions',
    draw_date: DRAW,
    sets_data: entry.sets,
    sets_count: sets,
    method: 'manual',
    power_play: false,
    sell_price: SELL,
    cost_price: COST,
    total_sell: SELL * sets,
    total_cost: COST * sets,
    note: 'seed test June 2 2026',
    status: 'confirmed',
  };
}

async function main() {
  console.log('Seeding', ENTRIES.length, 'Mega Millions bookings for', DRAW);

  for (let i = 0; i < ENTRIES.length; i++) {
    const row = buildBooking(ENTRIES[i], i);
    await rest('POST', 'bookings', row);
    console.log('  OK', row.id, row.customer_name, row.sets_count, 'ชุด');
  }

  await rest(
    'POST',
    'lottery_results',
    {
      id: `mega-${DRAW}`,
      game_key: 'mega',
      draw_date: DRAW,
      main_numbers: RESULT_MAIN,
      bonus_number: RESULT_BONUS,
      jackpot_usd: 0,
      source: 'manual',
    },
    { Prefer: 'resolution=merge-duplicates' }
  );

  await rest('DELETE', `winners?game_key=eq.mega&draw_date=eq.${DRAW}`);
  const bookingsRes = await fetch(
    `${SUPA_URL}/rest/v1/bookings?game_key=eq.mega&draw_date=eq.${DRAW}&status=eq.confirmed&select=*`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
  );
  const bookings = await bookingsRes.json();

  let winnerCount = 0;
  for (const b of bookings) {
    let best = null;
    for (const sd of b.sets_data || []) {
      const prize = checkPrizeMega(sd.mainSel || [], sd.bonusSel || []);
      if (prize && (!best || prize.usd > best.usd)) best = prize;
    }
    if (best && best.usd > 0) {
      await rest('POST', 'winners', {
        id: `${b.id}-mega-${DRAW}`,
        booking_id: b.id,
        game_key: 'mega',
        draw_date: DRAW,
        customer_name: b.customer_name,
        matched_numbers: RESULT_MAIN,
        prize_usd: best.usd,
        prize_thb: best.usd * 32 * (b.sets_count || 1),
        prize_level: best.label,
      });
      winnerCount++;
      console.log('  WIN', b.customer_name, best.label, '$' + best.usd);
    }
  }

  console.log('\nResult:', RESULT_MAIN.join(','), '+ MB', RESULT_BONUS);
  console.log('Winners found:', winnerCount, '/', bookings.length, 'bookings');
  console.log('Skipped sheet rows: หมี So good, เค.เอ.เค (no numbers)');
  console.log('\nOpen Admin → รายการ / ผลรางวัล →', DRAW);
}

function checkPrizeMega(playerMain, playerBonus) {
  const matchMain = playerMain.filter((n) => RESULT_MAIN.includes(n)).length;
  const matchBonus = playerBonus.length > 0 && playerBonus[0] === RESULT_BONUS;
  const levels = [
    { match: 5, bonus: true, label: 'Jackpot', usd: 0 },
    { match: 5, bonus: false, label: 'Match 5', usd: 1000000 },
    { match: 4, bonus: true, label: 'Match 4+MB', usd: 10000 },
    { match: 4, bonus: false, label: 'Match 4', usd: 500 },
    { match: 3, bonus: true, label: 'Match 3+MB', usd: 200 },
    { match: 3, bonus: false, label: 'Match 3', usd: 10 },
    { match: 2, bonus: true, label: 'Match 2+MB', usd: 10 },
    { match: 1, bonus: true, label: 'Match 1+MB', usd: 4 },
    { match: 0, bonus: true, label: 'Match MB', usd: 2 },
  ];
  for (const lv of levels) {
    const bonusOk = lv.bonus ? matchBonus : true;
    if (matchMain === lv.match && bonusOk) return { label: lv.label, usd: lv.usd };
  }
  return null;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
