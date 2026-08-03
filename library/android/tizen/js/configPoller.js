// Port of ConfigPoller.kt: bundled-asset fallback -> localStorage last-good -> remote 5-min poll.
// Fail-open on every error path (keep last-good).
window.WiomTV = window.WiomTV || {};
(function () {
  var C = WiomTV.C;
  var LS_KEY = 'wiomtv.channels_json';

  function log(msg) { console.log('[WiomConfig] ' + msg); }

  function xhrGet(url, timeoutMs, ok, fail) {
    try {
      var x = new XMLHttpRequest();
      x.open('GET', url, true);
      x.timeout = timeoutMs;
      x.onload = function () {
        if (x.status >= 200 && x.status < 300) ok(x.responseText);
        else fail('http_' + x.status);
      };
      x.onerror = function () { fail('network'); };
      x.ontimeout = function () { fail('timeout'); };
      x.send();
    } catch (e) { fail('exception:' + e.message); }
  }

  // loadLocal: localStorage last-good -> bundled asset. cb(parsed|null).
  function loadLocal(cb) {
    var cached = null;
    try { cached = localStorage.getItem(LS_KEY); } catch (e) {}
    if (cached) {
      try { cb(WiomTV.Channels.parse(cached)); return; }
      catch (e) { log('cached config bad, falling back to asset: ' + e.message); }
    }
    xhrGet('assets/channels.json', C.CONFIG_TIMEOUT_MS, function (text) {
      try { cb(WiomTV.Channels.parse(text)); }
      catch (e) { log('bundled asset bad: ' + e.message); cb(null); }
    }, function (why) { log('bundled asset load failed: ' + why); cb(null); });
  }

  // fetchRemote: gist fetch; >=1 enabled channel required else discard. cb(parsed) only on success.
  function fetchRemote(cb) {
    if (!C.CONFIG_ENDPOINT) return;
    xhrGet(C.CONFIG_ENDPOINT, C.CONFIG_TIMEOUT_MS, function (text) {
      var parsed;
      try { parsed = WiomTV.Channels.parse(text); }
      catch (e) { log('remote config rejected: ' + e.message); return; }
      try { localStorage.setItem(LS_KEY, text); } catch (e) {}
      cb(parsed);
    }, function (why) { log('remote fetch failed (keeping last-good): ' + why); });
  }

  // startPolling: immediate fetch then every 5 min. onUpdate(parsed) on each successful fetch.
  function startPolling(onUpdate) {
    var tick = function () { fetchRemote(onUpdate); };
    tick();
    setInterval(tick, C.CONFIG_INTERVAL_MS);
  }

  WiomTV.ConfigPoller = { loadLocal: loadLocal, fetchRemote: fetchRemote, startPolling: startPolling };
})();
