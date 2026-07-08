// CORS bridge for the hub's replicated dashboard.
// Forwards ?path=stats&period=24h  →  https://wiom.tv/api/stats?period=24h
// Apps Script web apps deployed as "Anyone" return JSON readable cross-origin.
const UPSTREAM = 'https://wiom.tv/api/';
const ALLOWED = ['stats', 'cohorts'];

function doGet(e) {
  const p = (e && e.parameter) || {};
  const path = p.path || '';
  if (ALLOWED.indexOf(path) === -1) {
    return out_({ error: 'unknown path' });
  }
  const qs = Object.keys(p)
    .filter(function (k) { return k !== 'path'; })
    .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(p[k]); })
    .join('&');
  try {
    const r = UrlFetchApp.fetch(UPSTREAM + path + (qs ? '?' + qs : ''), {
      muteHttpExceptions: true,
      followRedirects: true,
    });
    return ContentService.createTextOutput(r.getContentText())
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return out_({ error: 'upstream failed' });
  }
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
