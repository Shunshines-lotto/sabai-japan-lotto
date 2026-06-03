/**
 * Recheck all Mega winners for a draw using updated payout table
 * node scripts/recheck-mega-winners.mjs [draw_date]
 */
const DRAW = process.argv[2] || '2026-06-02';
const SUPA_URL = 'https://jbxvloruouddlkovdoot.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHZsb3J1b3VkZGxrb3Zkb290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODk2NzUsImV4cCI6MjA5NjA2NTY3NX0.Upe10fvcSE39KrGZO3C6i9TiuJV_ajFswm6lABJ2w9w';
const USD_TO_THB = 32;

const MEGA_MP = {
  'Match 5': { 2: 2000000, 3: 3000000, 4: 4000000, 5: 5000000, 10: 10000000 },
  'Match 4+MB': { 2: 20000, 3: 30000, 4: 40000, 5: 50000, 10: 100000 },
  'Match 4': { 2: 1000, 3: 1500, 4: 2000, 5: 2500, 10: 5000 },
  'Match 3+MB': { 2: 400, 3: 600, 4: 800, 5: 1000, 10: 2000 },
  'Match 3': { 2: 20, 3: 30, 4: 40, 5: 50, 10: 100 },
  'Match 2+MB': { 2: 20, 3: 30, 4: 40, 5: 50, 10: 100 },
  'Match 1+MB': { 2: 14, 3: 21, 4: 28, 5: 35, 10: 70 },
  'Match MB': { 2: 10, 3: 15, 4: 20, 5: 25, 10: 50 },
};

const LEVELS = [
  { match: 5, bonus: true, label: 'Jackpot', usd: 0 },
  { match: 5, bonus: false, label: 'Match 5', usd: 1000000 },
  { match: 4, bonus: true, label: 'Match 4+MB', usd: 10000 },
  { match: 4, bonus: false, label: 'Match 4', usd: 500 },
  { match: 3, bonus: true, label: 'Match 3+MB', usd: 200 },
  { match: 3, bonus: false, label: 'Match 3', usd: 10 },
  { match: 2, bonus: true, label: 'Match 2+MB', usd: 10 },
  { match: 1, bonus: true, label: 'Match 1+MB', usd: 7 },
  { match: 0, bonus: true, label: 'Match MB', usd: 5 },
];

const H = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
};

function getMp(sd) {
  const m = parseInt(sd.megaplier, 10);
  return m >= 2 && m <= 10 ? m : 2;
}

function checkPrize(main, bonus, resultMain, resultBonus) {
  const mm = main.filter((n) => resultMain.includes(n)).length;
  const mb = bonus.length > 0 && bonus[0] === resultBonus;
  for (const lv of LEVELS) {
    const ok = lv.bonus ? mb : true;
    if (mm === lv.match && ok) return { label: lv.label, usd: lv.usd };
  }
  return null;
}

function prizeUsd(prize, sd) {
  if (!prize || prize.label === 'Jackpot') return 0;
  const mp = getMp(sd);
  const row = MEGA_MP[prize.label];
  return row && row[mp] ? row[mp] : (prize.usd || 0) * mp;
}

async function main() {
  const resR = await fetch(`${SUPA_URL}/rest/v1/lottery_results?id=eq.mega-${DRAW}&select=*`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  const [result] = await resR.json();
  if (!result) throw new Error('No lottery_results for mega-' + DRAW);
  const resultMain = result.main_numbers;
  const resultBonus = result.bonus_number;
  console.log('Draw result:', resultMain.join(','), '+ MB', resultBonus);

  const bRes = await fetch(
    `${SUPA_URL}/rest/v1/bookings?game_key=eq.mega&draw_date=eq.${DRAW}&status=eq.confirmed&select=*`,
    { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
  );
  const bookings = await bRes.json();

  await fetch(`${SUPA_URL}/rest/v1/winners?game_key=eq.mega&draw_date=eq.${DRAW}`, {
    method: 'DELETE',
    headers: H,
  });

  let wins = 0;
  for (const b of bookings) {
    let best = null;
    let bestMp = 2;
    for (const sd of b.sets_data || []) {
      const p = checkPrize(sd.mainSel || [], sd.bonusSel || [], resultMain, resultBonus);
      if (p) {
        const usd = prizeUsd(p, sd);
        if (usd > 0 && (!best || usd > best.usd)) {
          best = { label: p.label, usd };
          bestMp = getMp(sd);
        }
      }
    }
    if (best) {
      const levelLabel = best.label + (bestMp > 1 ? ` (${bestMp}X)` : '');
      await fetch(`${SUPA_URL}/rest/v1/winners`, {
        method: 'POST',
        headers: H,
        body: JSON.stringify({
          id: `${b.id}-mega-${DRAW}`,
          booking_id: b.id,
          game_key: 'mega',
          draw_date: DRAW,
          customer_name: b.customer_name,
          matched_numbers: resultMain,
          prize_usd: best.usd,
          prize_thb: best.usd * USD_TO_THB,
          prize_level: levelLabel,
        }),
      });
      console.log('WIN', b.customer_name, levelLabel, '$' + best.usd, '฿' + best.usd * USD_TO_THB);
      wins++;
    }
  }
  console.log('\nTotal winners:', wins);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
