/**
 * Fix หมี So good + เค.เอ.เค — (nX) = Megaplier ไม่ใช่จำนวนชุดซ้ำ
 * node scripts/seed-mega-missing-two.mjs
 */
const SUPA_URL = 'https://jbxvloruouddlkovdoot.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHZsb3J1b3VkZGxrb3Zkb290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODk2NzUsImV4cCI6MjA5NjA2NTY3NX0.Upe10fvcSE39KrGZO3C6i9TiuJV_ajFswm6lABJ2w9w';

const DRAW = '2026-06-02';
const SELL = 150;
const COST = 120;
const RESULT_MAIN = [1, 19, 33, 56, 63];
const RESULT_BONUS = 12;

function setMp(main, bonus, megaplier) {
  const m = [...main].sort((a, b) => a - b);
  return {
    mainSel: m,
    bonusSel: bonus ? [bonus] : [],
    mode: 'manual',
    megaplier: megaplier || 1,
  };
}

const FIX = [
  {
    id: 'SJLMEGA046',
    name: 'หมี So good',
    sets: [setMp([3, 7, 16, 46, 60], 17, 3)],
  },
  {
    id: 'SJLMEGA047',
    name: 'เค.เอ.เค',
    sets: [
      setMp([22, 31, 40, 45, 58], 20, 2),
      setMp([21, 23, 40, 60, 61], 4, 5),
      setMp([26, 32, 59, 65, 68], 4, 4),
      setMp([18, 21, 26, 41, 51], 12, 2),
      setMp([1, 17, 37, 42, 60], 7, 2),
    ],
  },
];

const headers = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
};

function getMp(sd) {
  const m = parseInt(sd.megaplier, 10);
  return m >= 2 && m <= 10 ? m : 1;
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

function prizeUsd(prize, sd) {
  let usd = prize.usd || 0;
  if (!usd || prize.label === 'Jackpot') return usd;
  const mp = getMp(sd);
  return mp > 1 ? usd * mp : usd;
}

async function main() {
  for (const e of FIX) {
    const n = e.sets.length;
    const row = {
      sets_data: e.sets,
      sets_count: n,
      total_sell: SELL * n,
      total_cost: COST * n,
      note: 'Megaplier (nX) per line',
    };
    const res = await fetch(`${SUPA_URL}/rest/v1/bookings?id=eq.${e.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error(await res.text());
    console.log('PATCH', e.id, e.name, n, 'ชุด', e.sets.map((s) => getMp(s) + 'X').join(', '));
  }

  const bRes = await fetch(
    `${SUPA_URL}/rest/v1/bookings?game_key=eq.mega&draw_date=eq.${DRAW}&status=eq.confirmed&select=*`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
  );
  const bookings = await bRes.json();

  await fetch(`${SUPA_URL}/rest/v1/winners?game_key=eq.mega&draw_date=eq.${DRAW}`, {
    method: 'DELETE',
    headers,
  });

  let wins = 0;
  for (const b of bookings) {
    let best = null;
    let bestSd = null;
    for (const sd of b.sets_data || []) {
      const p = checkPrizeMega(sd.mainSel || [], sd.bonusSel || []);
      if (p) {
        const usd = prizeUsd(p, sd);
        if (usd > 0 && (!best || usd > best.usd)) {
          best = { ...p, usd };
          bestSd = sd;
        }
      }
    }
    if (best) {
      const mp = getMp(bestSd);
      await fetch(`${SUPA_URL}/rest/v1/winners`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: `${b.id}-mega-${DRAW}`,
          booking_id: b.id,
          game_key: 'mega',
          draw_date: DRAW,
          customer_name: b.customer_name,
          matched_numbers: RESULT_MAIN,
          prize_usd: best.usd,
          prize_thb: best.usd * 32,
          prize_level: best.label + (mp > 1 ? ` (${mp}X)` : ''),
        }),
      });
      console.log('WIN', b.customer_name, best.label, '$' + best.usd, mp > 1 ? mp + 'X' : '');
      wins++;
    }
  }
  console.log('\nTotal winners:', wins);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
