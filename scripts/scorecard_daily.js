// Daily series for the hub Scorecard page. All days IST (UTC+5:30). uid era: 2026-06-23.
const d = require("better-sqlite3")("data/analytics.db", { readonly: true });
const q = (s, ...a) => d.prepare(s).all(...a);
const IST = "date(ts,'+330 minutes')";
const START = "2026-06-23";

// today (IST) from DB server clock
const istNow = new Date(Date.now() + 330 * 60000);
const todayIst = istNow.toISOString().slice(0, 10);
const lastFull = new Date(istNow); lastFull.setUTCDate(lastFull.getUTCDate() - 1);
const lastFullIst = lastFull.toISOString().slice(0, 10);

// uid -> first_seen IST date
const fsMap = {};
q("SELECT uid, date(first_seen,'+330 minutes') fd FROM devices").forEach(r => fsMap[r.uid] = r.fd);

// ---- volume: users/sessions per day per class ----
const days = {};
const day = (dt) => days[dt] || (days[dt] = {
  day: dt, dau: 0, newu: 0, rep: 0, sess: 0, sessNew: 0, sessRep: 0,
  watch: 0, watchNew: 0, watchRep: 0, tunes: 0, tunesNew: 0, tunesRep: 0,
  errs: 0, errsNew: 0, errsRep: 0, pAll: [], pNew: [], pRep: []
});

q(`SELECT ${IST} dt, uid, COUNT(DISTINCT session_id) s FROM events
   WHERE uid IS NOT NULL AND ${IST} >= ? GROUP BY 1,2`, START).forEach(r => {
  const o = day(r.dt), isNew = fsMap[r.uid] === r.dt;
  o.dau++; o.sess += r.s;
  if (isNew) { o.newu++; o.sessNew += r.s; } else { o.rep++; o.sessRep += r.s; }
});

// ---- watch (tune dwell) + tunes + errors, per uid-day ----
q(`SELECT ${IST} dt, uid,
     SUM(CASE WHEN event='tune' THEN duration_sec ELSE 0 END) w,
     SUM(CASE WHEN event='tune' THEN 1 ELSE 0 END) t,
     SUM(CASE WHEN event='playback_error' THEN 1 ELSE 0 END) e
   FROM events WHERE uid IS NOT NULL AND event IN ('tune','playback_error') AND ${IST} >= ?
   GROUP BY 1,2`, START).forEach(r => {
  const o = day(r.dt), isNew = fsMap[r.uid] === r.dt;
  o.watch += r.w; o.tunes += r.t; o.errs += r.e;
  if (r.t > 0) { o.pAll.push(r.w); (isNew ? o.pNew : o.pRep).push(r.w); }
  if (isNew) { o.watchNew += r.w; o.tunesNew += r.t; o.errsNew += r.e; }
  else { o.watchRep += r.w; o.tunesRep += r.t; o.errsRep += r.e; }
});

// ---- D1 / D15 retention per cohort day ----
const retD1 = {}, retD15 = {}, cohN = {};
q(`WITH coh AS (SELECT uid, date(first_seen,'+330 minutes') fd FROM devices WHERE date(first_seen,'+330 minutes') >= ?)
   SELECT fd, COUNT(*) n,
     SUM(d1) d1, SUM(d15) d15
   FROM (
     SELECT c.uid, c.fd,
       MAX(CASE WHEN julianday(date(e.ts,'+330 minutes')) - julianday(c.fd) = 1 THEN 1 ELSE 0 END) d1,
       MAX(CASE WHEN julianday(date(e.ts,'+330 minutes')) - julianday(c.fd) >= 15 THEN 1 ELSE 0 END) d15
     FROM coh c LEFT JOIN events e ON e.uid = c.uid
     GROUP BY c.uid)
   GROUP BY fd`, START).forEach(r => { cohN[r.fd] = r.n; retD1[r.fd] = r.d1; retD15[r.fd] = r.d15; });

// ---- A2HS: pwa_install in the new user's FIRST session ----
const a2hs = {};
q(`WITH fs AS (SELECT uid, session_id FROM (
     SELECT uid, session_id, ROW_NUMBER() OVER (PARTITION BY uid ORDER BY ts) rn
     FROM events WHERE uid IS NOT NULL) WHERE rn=1)
   SELECT date(dv.first_seen,'+330 minutes') fd,
     SUM(EXISTS(SELECT 1 FROM events p WHERE p.event='pwa_install' AND p.uid=fs.uid AND p.session_id=fs.session_id)) inst,
     SUM(EXISTS(SELECT 1 FROM events p WHERE p.event='install_shown' AND p.uid=fs.uid AND p.session_id=fs.session_id)) shown
   FROM devices dv JOIN fs ON fs.uid = dv.uid
   WHERE date(dv.first_seen,'+330 minutes') >= ?
   GROUP BY fd`, START).forEach(r => a2hs[r.fd] = { inst: r.inst, shown: r.shown });

// ---- assemble ----
const pct = (arr, p) => { if (!arr.length) return 0; const v = [...arr].sort((a, b) => a - b); return v[Math.max(0, Math.ceil(p * v.length) - 1)]; };
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const out = Object.values(days).sort((a, b) => a.day < b.day ? -1 : 1).map(o => {
  const d1ok = o.day < lastFullIst || (o.day === lastFullIst && false) || o.day <= lastFullIst && o.day < lastFullIst; // d1 needs day+1 complete
  const canD1 = o.day < lastFullIst;
  const dd = new Date(o.day + "T00:00:00Z"); dd.setUTCDate(dd.getUTCDate() + 15);
  const canD15 = dd.toISOString().slice(0, 10) <= lastFullIst;
  return {
    day: o.day, partial: o.day >= todayIst,
    dau: o.dau, new: o.newu, rep: o.rep,
    sess: o.sess, sessNew: o.sessNew, sessRep: o.sessRep,
    spu: r2(o.sess / (o.dau || 1)),
    watchHrs: r1(o.watch / 3600), watchHrsNew: r1(o.watchNew / 3600), watchHrsRep: r1(o.watchRep / 3600),
    wmps: r2(o.watch / 60 / (o.sess || 1)), wmpsNew: r2(o.watchNew / 60 / (o.sessNew || 1)), wmpsRep: r2(o.watchRep / 60 / (o.sessRep || 1)),
    p75: r1(pct(o.pAll, .75) / 60), p90: r1(pct(o.pAll, .9) / 60),
    p75New: r1(pct(o.pNew, .75) / 60), p90New: r1(pct(o.pNew, .9) / 60),
    p75Rep: r1(pct(o.pRep, .75) / 60), p90Rep: r1(pct(o.pRep, .9) / 60),
    tunes: o.tunes, errs: o.errs,
    ept: r2(100 * o.errs / (o.tunes || 1)), eptNew: r2(100 * o.errsNew / (o.tunesNew || 1)), eptRep: r2(100 * o.errsRep / (o.tunesRep || 1)),
    coh: cohN[o.day] || 0,
    d1: canD1 && cohN[o.day] ? r1(100 * retD1[o.day] / cohN[o.day]) : null,
    d15: canD15 && cohN[o.day] ? r1(100 * retD15[o.day] / cohN[o.day]) : null,
    a2hs: a2hs[o.day] && o.newu ? r1(100 * a2hs[o.day].inst / o.newu) : (o.newu ? 0 : null),
    a2hsN: a2hs[o.day] ? a2hs[o.day].inst : 0,
    a2hsShown: a2hs[o.day] ? a2hs[o.day].shown : 0
  };
});
console.log(JSON.stringify({ generated_utc: new Date().toISOString().slice(0, 19).replace("T", " "), today_ist: todayIst, last_full: lastFullIst, days: out }));
