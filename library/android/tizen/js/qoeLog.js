// Line-for-line port of QoeLog.kt: TTFF, stall vs load_buffer, channel_view crediting.
window.WiomTV = window.WiomTV || {};
(function () {
  var C = WiomTV.C;

  var q = {
    channelId: null, channelName: null, channelGenre: null, channelClass: null,
    startPath: 'boot',        // 'boot' | 'surf' | 'grid' | 'reconnect'
    switchStartMs: 0,
    viewStartMs: 0,
    hadReady: false,          // buffering after READY = stall; before = load_buffer
    bufferingSinceMs: 0,
    ttffEmitted: false,
    entryMethod: 'boot'
  };

  // Fired at the moment of switch: credit the departing channel, then arm the new one.
  function onSwitch(ch, method) {
    flushView();
    q.channelId = ch.id; q.channelName = ch.name;
    q.channelGenre = ch.genre; q.channelClass = ch.classification;
    q.startPath = method; q.entryMethod = method;
    q.switchStartMs = performance.now();
    q.viewStartMs = q.switchStartMs;
    q.hadReady = false; q.bufferingSinceMs = 0; q.ttffEmitted = false;
    WiomTV.Telemetry.event('channel_switch', {
      id: ch.id, name: ch.name, method: method, surf_depth: WiomTV.TvState.state.surfDepth
    });
  }

  // Recovery re-prepare: reset hadReady so recovery buffering isn't logged as a stall.
  function onReprepare() {
    q.hadReady = false;
    q.bufferingSinceMs = 0;
    q.startPath = 'reconnect';
    q.switchStartMs = performance.now();
    q.ttffEmitted = false;
  }

  function onFirstFrame(preloaded) {
    if (q.ttffEmitted || !q.channelId) return;
    q.ttffEmitted = true;
    WiomTV.Telemetry.event('ttff', {
      id: q.channelId,
      ms: Math.round(performance.now() - q.switchStartMs),
      preloaded: !!preloaded,      // always false on Tizen (no prefetch) — schema parity
      start_path: q.startPath
    });
  }

  function onBufferingStart() {
    if (!q.bufferingSinceMs) q.bufferingSinceMs = performance.now();
  }

  function onReady() {
    if (q.bufferingSinceMs && q.channelId) {
      var ms = Math.round(performance.now() - q.bufferingSinceMs);
      if (q.hadReady) {
        if (ms >= C.MIN_STALL_REPORT_MS) WiomTV.Telemetry.event('stall', { id: q.channelId, ms: ms });
      } else {
        WiomTV.Telemetry.event('load_buffer', { id: q.channelId, ms: ms });
      }
    }
    q.bufferingSinceMs = 0;
    q.hadReady = true;
  }

  // Watch-time crediting: on departure and on app hide.
  function flushView() {
    if (!q.channelId || !q.viewStartMs) return;
    var durSec = Math.round((performance.now() - q.viewStartMs) / 1000);
    if (durSec > 0) {
      WiomTV.Telemetry.event('channel_view', {
        id: q.channelId, name: q.channelName, genre: q.channelGenre,
        classification: q.channelClass, durationSec: durSec,
        entry_method: q.entryMethod,
        was_favorite: WiomTV.TvState.isFavorite(q.channelId)
      });
    }
    q.viewStartMs = performance.now(); // re-arm so a later flush doesn't double-credit
  }

  WiomTV.QoeLog = {
    onSwitch: onSwitch, onReprepare: onReprepare, onFirstFrame: onFirstFrame,
    onBufferingStart: onBufferingStart, onReady: onReady, flushView: flushView
  };
})();
