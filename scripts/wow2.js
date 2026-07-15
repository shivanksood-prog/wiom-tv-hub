// Weekly (Wed->Tue) scorecard pull, adapted from sibling wow.js.
// Adds: 4h/tune cap (primary watch), raw-vs-capped pollution accounting, D15 eligibility, capped percentiles.
const db = require('better-sqlite3')('data/analytics.db', { readonly: true });
const IST = "date(ts,'+330 minutes')";
const CAP = 14400; // 4h per tune
const now = db.prepare("SELECT datetime('now') u, datetime('now','+330 minutes') ist").get();
const todayIst = now.ist.slice(0, 10);
const lastFull = (() => { const t = new Date(todayIst + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() - 1); return t.toISOString().slice(0, 10); })();

const WEEKS = {
  wk1: { from: '2026-07-01', to: '2026-07-07' },
  wk2: { from: '2026-07-08', to: '2026-07-14' },
  wk3: { from: '2026-07-15', to: '2026-07-21' },
};
for (const w of Object.values(WEEKS)) {
  w.toObserved = w.to < lastFull ? w.to : lastFull; // complete days only
  w.days = Math.round((new Date(w.toObserved) - new Date(w.from)) / 86400000) + 1;
}

// A. per-IST-day base aggregates (capped + raw watch)
const daily = db.prepare(`
  SELECT ${IST} d,
    SUM(CASE WHEN event='tune' THEN MIN(COALESCE(duration_sec,0), ${CAP}) ELSE 0 END) watch_sec_cap,
    SUM(CASE WHEN event='tune' THEN COALESCE(duration_sec,0) ELSE 0 END) watch_sec_raw,
    COUNT(DISTINCT CASE WHEN uid IS NOT NULL THEN uid END) dau,
    SUM(event='session_start') sessions,
    SUM(event='tune') tunes,
    SUM(event='playback_error') errs,
    SUM(event='playback_start') pstarts
  FROM events
  WHERE ${IST} >= '2026-07-01' AND ${IST} <= ?
  GROUP BY d ORDER BY d`).all(lastFull);

// pollution: tunes above cap
const outliers = db.prepare(`
  SELECT ${IST} d, COUNT(*) n, SUM(duration_sec) sec, SUM(uid IS NULL) nulluid, MAX(duration_sec) mx
  FROM events WHERE event='tune' AND duration_sec > ${CAP}
    AND ${IST} >= '2026-07-01' AND ${IST} <= ?
  GROUP BY d`).all(lastFull);

// B. per uid-day watch (capped tune dwell) for percentiles
const uidDay = db.prepare(`
  SELECT uid, ${IST} d, SUM(MIN(COALESCE(duration_sec,0), ${CAP})) w
  FROM events
  WHERE event='tune' AND uid IS NOT NULL
    AND ${IST} >= '2026-07-01' AND ${IST} <= ?
  GROUP BY uid, d`).all(lastFull);

// C. cohorts + active uid-days
const devices = db.prepare(`
  SELECT uid, date(first_seen,'+330 minutes') fd FROM devices
  WHERE date(first_seen,'+330 minutes') >= '2026-07-01'`).all();
const activeSet = new Set(db.prepare(`
  SELECT DISTINCT uid || '|' || ${IST} k FROM events
  WHERE uid IS NOT NULL AND ${IST} >= '2026-07-01'`).all().map(r => r.k));
// D15 returns need day>=fd+15 activity; also grab per-uid max active IST day offset
const d15Set = new Set(db.prepare(`
  SELECT DISTINCT e.uid || '|d15' k
  FROM events e JOIN devices v ON v.uid = e.uid
  WHERE e.uid IS NOT NULL
    AND julianday(date(e.ts,'+330 minutes')) - julianday(date(v.first_seen,'+330 minutes')) >= 15`).all().map(r => r.k));

// D. first session per uid + pwa_install sessions
const fsMap = new Map(db.prepare(`
  SELECT uid, session_id FROM (
    SELECT uid, session_id, ROW_NUMBER() OVER (PARTITION BY uid ORDER BY ts) rn
    FROM events WHERE uid IS NOT NULL AND session_id IS NOT NULL)
  WHERE rn=1`).all().map(r => [r.uid, r.session_id]));
const pwaSet = new Set(db.prepare(`
  SELECT DISTINCT uid || '|' || session_id k FROM events
  WHERE event='pwa_install' AND uid IS NOT NULL`).all().map(r => r.k));

const addDays = (d, n) => { const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
function pct(sorted, p) {
  if (!sorted.length) return null;
  const idx = (sorted.length - 1) * p, lo = Math.floor(idx), hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

const out = { now, today_ist: todayIst, last_full: lastFull, cap_hours: CAP / 3600, weeks: {}, outliers };
for (const [k, w] of Object.entries(WEEKS)) {
  const dd = daily.filter(r => r.d >= w.from && r.d <= w.toObserved);
  const S = key => dd.reduce((s, r) => s + r[key], 0);
  const watchCap = S('watch_sec_cap'), watchRaw = S('watch_sec_raw');
  const sessions = S('sessions'), tunes = S('tunes'), errs = S('errs'), pstarts = S('pstarts');
  const dauAvg = S('dau') / (w.days || 1);
  const wvals = uidDay.filter(r => r.d >= w.from && r.d <= w.toObserved).map(r => r.w / 60).sort((a, b) => a - b);

  const coh = devices.filter(r => r.fd >= w.from && r.fd <= w.toObserved);
  let d1Elig = 0, d1Ret = 0, d15Elig = 0, d15Ret = 0, pwaN = 0;
  for (const r of coh) {
    if (addDays(r.fd, 1) <= lastFull) { d1Elig++; if (activeSet.has(r.uid + '|' + addDays(r.fd, 1))) d1Ret++; }
    if (addDays(r.fd, 15) <= lastFull) { d15Elig++; if (d15Set.has(r.uid + '|d15')) d15Ret++; }
    const s = fsMap.get(r.uid); if (s && pwaSet.has(r.uid + '|' + s)) pwaN++;
  }
  out.weeks[k] = {
    from: w.from, to: w.to, days: w.days, complete: w.toObserved === w.to,
    watch_hrs_cap: +(watchCap / 3600).toFixed(1), watch_hrs_raw: +(watchRaw / 3600).toFixed(1),
    watch_hrs_per_day_cap: +(watchCap / 3600 / (w.days || 1)).toFixed(1),
    dau_avg: +dauAvg.toFixed(0), sessions, tunes, errs, pstarts,
    sess_per_user_day: +(sessions / (w.days || 1) / (dauAvg || 1)).toFixed(2),
    watch_min_per_sess_cap: +(watchCap / 60 / (sessions || 1)).toFixed(2),
    p75_min: wvals.length ? +pct(wvals, .75).toFixed(1) : null,
    p90_min: wvals.length ? +pct(wvals, .9).toFixed(1) : null,
    uid_days: wvals.length,
    new_uids: coh.length,
    d1_elig: d1Elig, d1_ret: d1Ret, d1_rate: d1Elig ? +(100 * d1Ret / d1Elig).toFixed(1) : null,
    d15_elig: d15Elig, d15_ret: d15Ret, d15_rate: d15Elig ? +(100 * d15Ret / d15Elig).toFixed(1) : null,
    d15_first_readable: addDays(w.from, 16), // cohort day 'from' has full D15 window once from+15 is complete => readable from+16 (IST date)
    pwa_first_sess: pwaN, pwa_rate: coh.length ? +(100 * pwaN / coh.length).toFixed(1) : null,
    err_per_tune: tunes ? +(100 * errs / tunes).toFixed(1) : null,
    err_per_pstart: pstarts ? +(100 * errs / pstarts).toFixed(1) : null,
  };
}
out.daily_ept = daily.map(r => ({ d: r.d, ept: r.tunes ? +(100 * r.errs / r.tunes).toFixed(1) : null }));
console.log(JSON.stringify(out));
