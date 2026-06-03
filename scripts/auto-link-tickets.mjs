/**
 * Run auto-link for a game/draw (same rules as site)
 * node scripts/auto-link-tickets.mjs txlotto 2026-06-03
 */
const SUPA_URL = 'https://jbxvloruouddlkovdoot.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieHZsb3J1b3VkZGxrb3Zkb290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODk2NzUsImV4cCI6MjA5NjA2NTY3NX0.Upe10fvcSE39KrGZO3C6i9TiuJV_ajFswm6lABJ2w9w';

const GAMES = {
  powerball: { mainCount: 5, bonusCount: 1 },
  mega: { mainCount: 5, bonusCount: 1 },
  txtwostep: { mainCount: 4, bonusCount: 1 },
  txlotto: { mainCount: 6, bonusCount: 0 },
  allornothing: { mainCount: 12, bonusCount: 0 },
};

const gameKey = process.argv[2] || 'txlotto';
const drawDate = process.argv[3] || '2026-06-03';

const H = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function get(path) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  return r.json();
}

async function patch(path, body) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function setSignature(gameKey, main, bonus) {
  const m = [...main].sort((a, b) => a - b);
  let sig = m.join('-');
  if (GAMES[gameKey].bonusCount && bonus?.length) sig += '+' + bonus[0];
  return sig;
}

function numbersFromFilename(name, gameKey) {
  const g = GAMES[gameKey];
  const nums = (String(name).match(/\d+/g) || []).map(Number).filter((n) => n > 0);
  const need = g.mainCount + g.bonusCount;
  if (nums.length < need) return null;
  let main, bonus = [];
  if (g.bonusCount > 0) {
    if (nums.length === need) {
      main = nums.slice(0, g.mainCount).sort((a, b) => a - b);
      bonus = [nums[g.mainCount]];
    } else {
      bonus = [nums[nums.length - 1]];
      main = nums.slice(0, -1).sort((a, b) => a - b).slice(-g.mainCount);
    }
  } else {
    main = (nums.length === g.mainCount ? nums : nums.slice(-g.mainCount)).sort((a, b) => a - b);
  }
  if (main.length !== g.mainCount) return null;
  return { main, bonus };
}

function ticketIndexFromName(name) {
  const s = String(name || '').trim();
  let m = s.match(/^([A-Za-z]+)(\d+)$/);
  if (m) return parseInt(m[2], 10);
  m = s.match(/^(\d+)/);
  if (m) return parseInt(m[1], 10);
  return null;
}

function isRandomBooking(b) {
  if (b.method === 'random') return true;
  return (b.sets_data || []).some((sd) => sd.mode === 'random' || (!sd.mode && b.method === 'random'));
}

function sortByName(list) {
  return list.sort((a, b) => {
    const na = (a.file_name || '').match(/^([A-Za-z]+)(\d+)$/);
    const nb = (b.file_name || '').match(/^([A-Za-z]+)(\d+)$/);
    if (na && nb) return parseInt(na[2]) - parseInt(nb[2]);
    return String(a.file_name).localeCompare(b.file_name);
  });
}

async function main() {
  const images = sortByName(
    await get(
      `lottery_images?game_key=eq.${gameKey}&draw_date=eq.${drawDate}&booking_id=is.null&select=*`
    )
  );
  const bookings = await get(
    `bookings?game_key=eq.${gameKey}&draw_date=eq.${drawDate}&status=neq.cancelled&select=*&order=created_at.asc`
  );
  const linked = await get(
    `lottery_images?game_key=eq.${gameKey}&draw_date=eq.${drawDate}&booking_id=not.is.null&select=booking_id,set_index`
  );

  const taken = new Set();
  const bookingHasImage = new Set();
  for (const img of linked) {
    bookingHasImage.add(img.booking_id);
    if (img.set_index != null) taken.add(`${img.booking_id}|${img.set_index}`);
  }

  const slots = [];
  for (const b of bookings) {
    (b.sets_data || []).forEach((sd, idx) => {
      if (isRandomBooking(b) || !sd.mainSel?.length) return;
      slots.push({
        bookingId: b.id,
        setIndex: idx,
        signature: setSignature(gameKey, sd.mainSel, sd.bonusSel || []),
        name: b.customer_name,
      });
    });
  }
  const slotBySig = {};
  for (const s of slots) {
    const k = `${s.bookingId}|${s.setIndex}`;
    if (!taken.has(k)) slotBySig[s.signature] = s;
  }

  const manualBookings = bookings.filter((b) => !isRandomBooking(b));
  let matched = 0;

  for (const img of images) {
    const src = img.source_filename || img.file_name || '';
    const parsed = numbersFromFilename(src, gameKey);
    if (!parsed) continue;
    const sig = setSignature(gameKey, parsed.main, parsed.bonus);
    const slot = slotBySig[sig];
    if (!slot) continue;
    await patch(`lottery_images?id=eq.${encodeURIComponent(img.id)}`, {
      booking_id: slot.bookingId,
      set_index: slot.setIndex,
      number_signature: sig,
    });
    console.log('NUM', img.file_name, '→', slot.name, 'แถว', slot.setIndex + 1);
    taken.add(`${slot.bookingId}|${slot.setIndex}`);
    delete slotBySig[sig];
    matched++;
  }

  const left = sortByName(
    await get(
      `lottery_images?game_key=eq.${gameKey}&draw_date=eq.${drawDate}&booking_id=is.null&select=*`
    )
  );

  for (const img of left) {
    const ord = ticketIndexFromName(img.file_name);
    if (!ord || ord < 1 || ord > manualBookings.length) continue;
    const bk = manualBookings[ord - 1];
    if (bookingHasImage.has(bk.id)) continue;
    await patch(`lottery_images?id=eq.${encodeURIComponent(img.id)}`, {
      booking_id: bk.id,
      set_index: null,
      number_signature: `order:${ord}`,
    });
    console.log('ORD', img.file_name, '→', bk.customer_name);
    bookingHasImage.add(bk.id);
    matched++;
  }

  console.log('Matched', matched, 'for', gameKey, drawDate);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
