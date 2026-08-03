// dispatchKeyEvent port: register Samsung remote keys + one keydown router.
// UP/CH_UP = next, DOWN/CH_DOWN = prev (Android convention — Satyam's template had it inverted).
window.WiomTV = window.WiomTV || {};
(function () {
  var C = WiomTV.C;

  var KEY = {
    UP: 38, DOWN: 40, LEFT: 37, RIGHT: 39, ENTER: 13,
    BACK: 10009, ESC: 27,
    CH_UP: 427, CH_DOWN: 428,
    MEDIA_PLAY: 415, MEDIA_PAUSE: 19, MEDIA_STOP: 413, MEDIA_PLAY_PAUSE: 10252
  };

  var lastBackAt = 0;

  function registerTvKeys() {
    try {
      var dev = tizen.tvinputdevice;
      ['ChannelUp', 'ChannelDown', 'MediaPlay', 'MediaPause', 'MediaPlayPause', 'MediaStop']
        .forEach(function (k) { try { dev.registerKey(k); } catch (e) {} });
    } catch (e) { /* desktop browser dev loop */ }
  }

  function exitApp() {
    try { tizen.application.getCurrentApplication().exit(); }
    catch (e) { window.close(); }
  }

  function onKeyDown(e) {
    var k = e.keyCode;
    var st = WiomTV.TvState.state;
    var pc = WiomTV.PlayerController;
    var ui = WiomTV.Overlays;

    // Force-update gate: consumes everything (OK handled by overlay itself — no-op CTA on Tizen).
    if (pc.blockingOverlay()) { e.preventDefault(); return; }

    if (st.gridOpen) {
      if (k === KEY.BACK || k === KEY.ESC) { WiomTV.LogoGrid.close(false); }
      else { WiomTV.LogoGrid.handleKey(k); }
      e.preventDefault();
      return;
    }

    switch (k) {
      case KEY.UP: case KEY.CH_UP:
        WiomTV.TvState.next(); break;
      case KEY.DOWN: case KEY.CH_DOWN:
        WiomTV.TvState.previous(); break;
      case KEY.ENTER:
        WiomTV.LogoGrid.open(); break;
      case KEY.MEDIA_PLAY: case KEY.MEDIA_PAUSE: case KEY.MEDIA_PLAY_PAUSE:
        pc.togglePlayPause(); break;
      case KEY.BACK: case KEY.ESC:
        // Double-press-to-exit within 2000ms; NEVER instant exit.
        var now = performance.now();
        if (now - lastBackAt <= C.BACK_EXIT_WINDOW_MS) {
          WiomTV.QoeLog.flushView();
          WiomTV.Telemetry.flush(true);
          exitApp();
        } else {
          lastBackAt = now;
          ui.showExitToast();
        }
        break;
      default:
        return; // unhandled: let the platform have it
    }
    e.preventDefault();
  }

  function start() {
    registerTvKeys();
    document.addEventListener('keydown', onKeyDown);
  }

  WiomTV.Keys = { start: start, KEY: KEY };
})();
