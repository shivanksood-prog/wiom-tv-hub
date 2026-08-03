// Port of Telemetry.kt, transport swapped: CleverTap SDK -> first-party ingest beacons.
// Every event also console.logs with the Android tag so sdb dlog reads like logcat.
window.WiomTV = window.WiomTV || {};
(function () {
  var C = WiomTV.C;
  var LS_Q = 'wiomtv.tq';

  var queue = [];
  var profile = {};
  var deviceId = 'tv_unknown';

  try {
    var saved = localStorage.getItem(LS_Q);
    if (saved) queue = JSON.parse(saved) || [];
  } catch (e) { queue = []; }

  function persistQueue() {
    try { localStorage.setItem(LS_Q, JSON.stringify(queue)); } catch (e) {}
  }

  function event(name, props) {
    console.log('[WiomTelemetry] ' + name + ' ' + JSON.stringify(props || {}));
    queue.push({ name: name, props: props || {}, ts: Date.now() });
    if (queue.length > C.TELEMETRY_QUEUE_MAX) queue.splice(0, queue.length - C.TELEMETRY_QUEUE_MAX);
    persistQueue();
  }

  function setProfile(props) {
    for (var k in props) { if (props.hasOwnProperty(k)) profile[k] = props[k]; }
    console.log('[WiomTelemetry] profile ' + JSON.stringify(profile));
  }

  function payload() {
    return JSON.stringify({ deviceId: deviceId, profile: profile, events: queue });
  }

  function flush(useBeacon) {
    if (!C.TELEMETRY_ENDPOINT || !queue.length) return;
    var body = payload();
    if (useBeacon && navigator.sendBeacon) {
      if (navigator.sendBeacon(C.TELEMETRY_ENDPOINT, body)) { queue = []; persistQueue(); }
      return;
    }
    var sent = queue.length;
    var x = new XMLHttpRequest();
    x.open('POST', C.TELEMETRY_ENDPOINT, true);
    x.setRequestHeader('Content-Type', 'application/json');
    x.timeout = 10000;
    x.onload = function () {
      if (x.status >= 200 && x.status < 300) { queue.splice(0, sent); persistQueue(); }
    };
    x.send(body);
  }

  // Device profile via webapis.productinfo (Samsung productinfo privilege) + tizen.systeminfo.
  function initProfile() {
    var p = {
      tv_brand: 'Samsung',
      platform: 'tizen',
      screen_res: (window.screen ? screen.width + 'x' + screen.height : 'unknown'),
      app_version: WiomTV.APP_VERSION_NAME
    };
    try {
      if (typeof webapis !== 'undefined' && webapis.productinfo) {
        deviceId = 'tv_' + webapis.productinfo.getDuid();
        p.tv_model = webapis.productinfo.getRealModel();
        p.firmware = webapis.productinfo.getFirmware();
      }
    } catch (e) { console.log('[WiomTelemetry] productinfo unavailable: ' + e.message); }
    try {
      if (typeof tizen !== 'undefined' && tizen.systeminfo) {
        tizen.systeminfo.getPropertyValue('BUILD', function (b) {
          setProfile({ tizen_build: b.buildVersion || '' });
        }, function () {});
      }
    } catch (e) {}
    // first_install_date: first-run timestamp persisted locally
    try {
      var f = localStorage.getItem('wiomtv.first_install');
      if (!f) { f = new Date().toISOString().slice(0, 10); localStorage.setItem('wiomtv.first_install', f); }
      p.first_install_date = f;
    } catch (e) {}
    setProfile(p);
  }

  // Crash replacement for Crashlytics/ANR watchdog.
  window.onerror = function (msg, src, line, col, err) {
    event('js_error', {
      message: String(msg).slice(0, 300),
      source: String(src).slice(0, 200),
      line: line || 0,
      stack: err && err.stack ? String(err.stack).slice(0, 1024) : ''
    });
  };
  window.addEventListener('unhandledrejection', function (e) {
    event('js_error', { message: 'unhandledrejection: ' + String(e.reason).slice(0, 300), source: '', line: 0, stack: '' });
  });

  function start() {
    initProfile();
    setInterval(function () { flush(false); }, C.TELEMETRY_FLUSH_MS);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) flush(true);
    });
  }

  WiomTV.Telemetry = { event: event, setProfile: setProfile, flush: flush, start: start };
})();
