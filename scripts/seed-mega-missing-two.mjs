/**
 * Add missing Mega Millions bookings — draw 2026-06-02
 * node scripts/seed-mega-missing-two.mjs
 */
const SUPA_URL = 'https://jbxvloruouddlkovdoot.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHZsb3J1b3VkZGxrb3Zkb290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODk2NzUsImV4cCI6MjA5NjA2NTY3NX0.Upe10fvcSE39KrGZO3C6i9TiuJV_ajFswm6lABJ2w9w';

const DRAW = '2026-06-02';
const SELL = 150;
const COST = 120;
const RESULT_MAIN = [1, 19, 33, 56, 63];
const RESULT_BONUS = 12;

function set(main, bonus) {
  const m = [...main].sort((a, b) => a - b);
  return { mainSel: m, bonusSel: bonus ? [bonus] : [], mode: 'manual' };
}

function repeatSet(main, bonus, times) {
  const s = set(main, bonus);
  const arr = [];
  for (let i = 0; i < times; i++) arr.push(JSON.parse(JSON.stringify(s)));
  return arr;
}

const BOOKINGS = [
  {
    id: 'SJLMEGA046',
    name: 'หมี So good',
    // 3 7 16 46 60 M17 (3X) = 3 ชุดเลขเดียวกัน
    sets: repeatSet([3, 7, 16, 46, 60], 17, 3),
  },
  {
    id: 'SJLMEGA047',
    name: 'เค.เอ.เค',
    // 5 แถว: (nX) = จำนวนชุด — M 40 (4X) ใช้ Mega Ball 4 (40 เกิน 1–25)
    sets: [
      ...repeatSet([22, 31, 40, 45, 58], 20, 2),
      ...repeatSet([21, 23, 40, 60, 61], 4, 5),
      ...repeatSet([26, 32, 59, 65, 68], 4, 4),
      ...repeatSet([18, 21, 26, 41, 51], 12, 2),
      ...repeatSet([1, 17, 37, 42, 60], 7, 2),
    ],
  },
];

const headers = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
};

async function rest(method, path, body) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
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

async function recheckWinners() {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/bookings?game_key=eq.mega&draw_date=eq.${DRAW}&status=eq.confirmed&select=*`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
  );
  const bookings = await res.json();
  await rest('DELETE', `winners?game_key=eq.mega&draw_date=eq.${DRAW}`);

  let wins = 0;
  for (const b of bookings) {
    let best = null;
    for (const sd of b.sets_data || []) {
      const p = checkPrizeMega(sd.mainSel || [], sd.bonusSel || []);
      if (p && (!best || p.usd > best.usd)) best = p;
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
      console.log('  WIN', b.customer_name, best.label, '$' + best.usd);
      wins++;
    }
  }
  console.log('Total winners after recheck:', wins);
}

async function main() {
  for (const e of BOOKINGS) {
    const n = e.sets.length;
    const row = {
      id: e.id,
      customer_name: e.name,
      customer_phone: '',
      game_key: 'mega',
      game_name: 'Mega Millions',
      draw_date: DRAW,
      sets_data: e.sets,
      sets_count: n,
      method: 'manual',
      power_play: false,
      sell_price: SELL,
      cost_price: COST,
      total_sell: SELL * n,
      total_cost: COST * n,
      note: 'seed missing rows',
      status: 'confirmed',
    };
    await rest('POST', 'bookings', row);
    console.log('OK', e.id, e.name, n, 'ชุด');
  }
  console.log('\nRechecking winners...');
  await recheckWinners();
  console.log('\nNote: เค.เอ.เค แถว "M 40 (4X)" บันทึกเป็น Mega Ball 4 (40 ไม่ใช่เลข Mega ที่ถูกต้อง)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
