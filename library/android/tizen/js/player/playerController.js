// PlayerController — direct port of the PlayerScreen resilience state machine (MainActivity.kt).
// Android names kept: online, reconnecting, reconnectCause, deadStreak, renderedChannelId, tuneSeq.
// Every timer chain is tuneSeq-guarded (the monotonic stale-tune pattern applied to all chains).
window.WiomTV = window.WiomTV || {};
(function () {
  var C = WiomTV.C;

  var pc = {
    backend: null,          // active backend for the current channel
    avplay: null,
    hlsjs: null,
    tuneSeq: 0,
    online: navigator.onLine !== false,
    reconnecting: false,
    reconnectCause: null,
    reconnectStartedAt: 0,
    reconnectAttempt: 0,
    deadStreak: 0,
    renderedChannelId: null,
    paused: false,
    splashDone: false,
    updateGate: null,       // armed force-update gate
    zapTimer: null,         // surf debounce
    stallTimer: null,
    dwellTimer: null,       // 15s auto-favorite dwell
    freezeTimer: null,      // AVPlay currenttime-freeze detector
    offlineGraceTimer: null
  };

  function log(msg) { console.log('[WiomPlayer] ' + msg); }

  function currentChannel() { return WiomTV.TvState.current(); }

  function blockingOverlay() { return !!pc.updateGate; }

  // Pick backend: AVPlay on hardware unless the channel opts into hlsjs; hls.js otherwise.
  function backendFor(channel) {
    var wantHlsjs = channel.format === 'hlsjs' || !WiomTV.AVPlayBackend.available();
    if (wantHlsjs && WiomTV.HlsJsBackend.available()) {
      if (!pc.hlsjs) pc.hlsjs = new WiomTV.HlsJsBackend(document.getElementById('html-player'));
      return pc.hlsjs;
    }
    if (!pc.avplay) pc.avplay = new WiomTV.AVPlayBackend();
    return pc.avplay;
  }

  function screenAwake(on) {
    try {
      if (on) tizen.power.request('SCREEN', 'SCREEN_NORMAL');
      else tizen.power.release('SCREEN');
    } catch (e) {}
  }

  // ---- tune ----
  function tune(channel, method) {
    if (blockingOverlay()) return;
    if (pc.zapTimer) { clearTimeout(pc.zapTimer); pc.zapTimer = null; }

    var doTune = function () {
      pc.tuneSeq++;
      var seq = pc.tuneSeq;
      pc.paused = false;

      WiomTV.QoeLog.onSwitch(channel, method);
      WiomTV.Telemetry.event('play_attempted', {
        id: channel.id, genre: channel.genre, preloaded: false,
        est_bps: 0, start_rung_floor: true
      });

      WiomTV.Overlays.showZapCover(channel);
      WiomTV.Overlays.showBug(channel);

      // Swap backends if the channel needs the other one.
      var b = backendFor(channel);
      if (pc.backend && pc.backend !== b) pc.backend.destroy();
      pc.backend = b;
      wireBackend(b);
      b.open(channel, seq);

      armStallWatchdog(seq, false);
      armDwell(seq, channel);
      if (b === pc.avplay) armFreezeDetector(seq);
      screenAwake(true);
    };

    // ZAP_DEBOUNCE 180ms only for surf; boot/grid tune instantly.
    if (method === 'surf') {
      WiomTV.Overlays.showZapCover(channel); // black cut in the same "recomposition" as the keypress
      WiomTV.Overlays.showBug(channel);
      pc.zapTimer = setTimeout(doTune, C.ZAP_DEBOUNCE_MS);
    } else {
      doTune();
    }
  }

  function wireBackend(b) {
    b.cb.onFirstFrame = onFirstFrame;
    b.cb.onBufferingStart = function () {
      WiomTV.QoeLog.onBufferingStart();
      WiomTV.Overlays.scheduleBufferingCue(pc.tuneSeq, isSteadyState());
      armStallWatchdog(pc.tuneSeq, pc.renderedChannelId === (currentChannel() || {}).id);
    };
    b.cb.onReady = function () {
      WiomTV.QoeLog.onReady();
      WiomTV.Overlays.hideBufferingCue();
      disarmStallWatchdog();
    };
    b.cb.onError = function (bucket, stage, code) {
      WiomTV.Telemetry.event('play_error', {
        id: (currentChannel() || {}).id, error_bucket: bucket, error_stage: stage,
        error_code: code, online: pc.online
      });
      onDead(bucket === 'network' ? 'network' : bucket);
    };
    b.cb.onCurrentTime = function () {};
  }

  function isSteadyState() {
    var cur = currentChannel();
    return !!cur && pc.renderedChannelId === cur.id && !pc.reconnecting;
  }

  // ---- first frame ----
  function onFirstFrame(channelId) {
    var cur = currentChannel();
    if (!cur || cur.id !== channelId) return; // stale frame from a previous tune

    WiomTV.QoeLog.onFirstFrame(false);
    pc.renderedChannelId = channelId;
    pc.deadStreak = 0;
    disarmStallWatchdog();
    WiomTV.Overlays.hideZapCover();
    WiomTV.Overlays.hideBufferingCue();
    WiomTV.Overlays.scheduleBugHide(pc.tuneSeq);

    if (!pc.splashDone) {
      pc.splashDone = true;
      WiomTV.Overlays.hideSplash();
    }

    if (pc.reconnecting) {
      var offlineMs = Math.round(performance.now() - pc.reconnectStartedAt);
      pc.reconnecting = false;
      WiomTV.Overlays.hideReconnect();
      WiomTV.Telemetry.event('reconnect_done', { offline_ms: offlineMs, cause: pc.reconnectCause });
      WiomTV.Telemetry.event('recovery_resulted', { success: true, time_to_recover_ms: offlineMs, trigger: pc.reconnectCause });
      pc.reconnectCause = null;
    }

    WiomTV.LogoGrid.warmLogos(pc.tuneSeq);
  }

  // ---- dead stream handling (onDead port) ----
  function onDead(reason) {
    var seq = pc.tuneSeq;
    var cur = currentChannel();
    if (!cur) return;

    if (!pc.online) { enterReconnect('link_lost'); return; }

    WiomTV.Telemetry.event('stream_dead', { id: cur.id, reason: reason, dead_streak: pc.deadStreak + 1 });
    pc.deadStreak++;

    if (pc.deadStreak >= C.DEAD_STREAK_NETWORK_LIMIT) {
      enterReconnect('brownout');
      return;
    }

    // Auto-skip to next channel.
    WiomTV.Telemetry.event('recovery_actioned', { action: 'skip_next', auto: true, trigger: reason });
    if (seq === pc.tuneSeq) WiomTV.TvState.next();
  }

  // ---- reconnect / brownout loop ----
  function enterReconnect(cause) {
    if (pc.reconnecting) return;
    pc.reconnecting = true;
    pc.reconnectCause = cause;
    pc.reconnectStartedAt = performance.now();
    pc.reconnectAttempt = 0;
    WiomTV.Overlays.showReconnect();
    WiomTV.Overlays.hideBufferingCue();
    WiomTV.Telemetry.event('reconnect_start', { cause: cause });
    reconnectLoop();
  }

  function reconnectLoop() {
    if (!pc.reconnecting) return;
    if (!pc.online) { setTimeout(reconnectLoop, 1000); return; } // wait for link

    var delay = Math.min(
      C.RECONNECT_BACKOFF_START_MS * Math.pow(2, pc.reconnectAttempt),
      C.RECONNECT_BACKOFF_CAP_MS
    );
    pc.reconnectAttempt++;

    setTimeout(function () {
      if (!pc.reconnecting) return;
      var cur = currentChannel();
      if (!cur) return;
      log('reconnect attempt ' + pc.reconnectAttempt + ' (' + pc.reconnectCause + ')');
      WiomTV.Telemetry.event('recovery_actioned', { action: 'reprepare_same', auto: true, trigger: pc.reconnectCause });
      WiomTV.QoeLog.onReprepare();
      pc.tuneSeq++;
      var seq = pc.tuneSeq;
      var b = backendFor(cur);
      if (pc.backend && pc.backend !== b) pc.backend.destroy();
      pc.backend = b;
      wireBackend(b);
      b.open(cur, seq);
      armStallWatchdog(seq, false);
      if (b === pc.avplay) armFreezeDetector(seq);
      reconnectLoop(); // schedules next attempt; cleared only by first frame
    }, delay);
  }

  // ---- stall watchdog (12s): never-rendered -> dead-skip; was-playing -> mid_stall ----
  function armStallWatchdog(seq, hadRendered) {
    disarmStallWatchdog();
    pc.stallTimer = setTimeout(function () {
      if (seq !== pc.tuneSeq || pc.reconnecting || pc.paused) return;
      if (hadRendered) enterReconnect('mid_stall');
      else onDead('stall');
    }, C.STALL_WATCHDOG_MS);
  }

  function disarmStallWatchdog() {
    if (pc.stallTimer) { clearTimeout(pc.stallTimer); pc.stallTimer = null; }
  }

  // ---- AVPlay currenttime-freeze detector (buffer-probe substitute) ----
  function armFreezeDetector(seq) {
    if (pc.freezeTimer) clearInterval(pc.freezeTimer);
    pc.freezeTimer = setInterval(function () {
      if (seq !== pc.tuneSeq || !pc.avplay || pc.backend !== pc.avplay) { clearInterval(pc.freezeTimer); return; }
      if (pc.paused || pc.reconnecting) return;
      if (pc.avplay.getState() !== 'PLAYING') return;
      if (!pc.avplay.lastTickAt) return;
      if (performance.now() - pc.avplay.lastTickAt > C.CURRENTTIME_FREEZE_MS) {
        log('currenttime frozen >' + C.CURRENTTIME_FREEZE_MS + 'ms — playback broke');
        clearInterval(pc.freezeTimer);
        if (pc.renderedChannelId === (currentChannel() || {}).id) enterReconnect('playback_broke');
        else onDead('freeze');
      }
    }, 1000);
  }

  // ---- 15s dwell = a view (auto-favorites) ----
  function armDwell(seq, channel) {
    if (pc.dwellTimer) clearTimeout(pc.dwellTimer);
    pc.dwellTimer = setTimeout(function () {
      if (seq !== pc.tuneSeq) return;
      WiomTV.TvState.recordView(channel.id);
    }, C.VIEW_DWELL_MS);
  }

  // ---- play/pause ----
  function togglePlayPause() {
    if (!pc.backend) return;
    if (pc.paused) {
      // Live rejoin: re-tune fresh rather than trusting resume-at-edge (verify restore in S1).
      pc.paused = false;
      var cur = currentChannel();
      if (cur) tune(cur, 'boot');
    } else {
      pc.paused = true;
      pc.backend.pause();
      screenAwake(false);
    }
  }

  // ---- network flap handling (2.5s grace) ----
  function onOnline() {
    pc.online = true;
    if (pc.offlineGraceTimer) { clearTimeout(pc.offlineGraceTimer); pc.offlineGraceTimer = null; }
    // Only declare recovery-needed if playback actually broke; the freeze detector /
    // error path handles that. If we're already reconnecting, the loop resumes on its own.
  }

  function onOffline() {
    pc.online = false;
    if (pc.offlineGraceTimer) clearTimeout(pc.offlineGraceTimer);
    pc.offlineGraceTimer = setTimeout(function () {
      if (pc.online) return; // flap within grace — no visible reaction
      if (pc.renderedChannelId) enterReconnect('link_lost');
    }, C.RECONNECT_GRACE_MS);
  }

  // ---- lifecycle (visibilitychange: suspend on hide, re-tune fresh on return) ----
  function onVisibility() {
    if (document.hidden) {
      WiomTV.QoeLog.flushView();
      WiomTV.Telemetry.flush(true);
      if (pc.backend) pc.backend.suspend();
      screenAwake(false);
    } else {
      var cur = currentChannel();
      if (cur && !pc.paused) tune(cur, 'boot');
    }
  }

  // ---- force-update gate ----
  function applyUpdateGate(gate) {
    if (gate && gate.minVersionCode > 0 && gate.minVersionCode > WiomTV.APP_VERSION_CODE && gate.forceUpdate) {
      pc.updateGate = gate;
      if (pc.backend) pc.backend.stop(); // pause outright — no audio behind the gate
      WiomTV.Overlays.showForceUpdate(gate);
    } else if (pc.updateGate) {
      pc.updateGate = null;
      WiomTV.Overlays.hideForceUpdate();
      var cur = currentChannel();
      if (cur) tune(cur, 'boot');
    }
  }

  function start() {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisibility);
  }

  WiomTV.PlayerController = {
    start: start, tune: tune, togglePlayPause: togglePlayPause,
    applyUpdateGate: applyUpdateGate, blockingOverlay: blockingOverlay,
    onDead: onDead, _pc: pc
  };
})();
