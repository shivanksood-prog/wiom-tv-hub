// main.js — boot wiring (MainActivity.onCreate equivalent).
// Order: overlays init -> telemetry -> keys -> config load -> tune -> start pollers.
(function () {
  var bootStart = performance.now();

  function boot() {
    WiomTV.Overlays.init();
    WiomTV.Telemetry.start();
    WiomTV.PlayerController.start();
    WiomTV.Keys.start();

    WiomTV.Telemetry.event('app_open', {
      cold: true,
      launch_ms: Math.round(performance.now() - bootStart)
    });

    // TvState -> PlayerController wiring
    WiomTV.TvState.state.onChange = function (channel, method) {
      WiomTV.PlayerController.tune(channel, method);
    };

    // Load local config (last-good -> bundled asset), tune, then start remote polling.
    WiomTV.ConfigPoller.loadLocal(function (parsed) {
      if (!parsed) {
        // Both local sources bad — keep splash, wait for remote.
        console.log('[WiomMain] no local config; waiting on remote');
        WiomTV.ConfigPoller.startPolling(onRemoteConfig);
        return;
      }
      WiomTV.TvState.load(parsed);
      WiomTV.PlayerController.applyUpdateGate(parsed.updateGate);
      var cur = WiomTV.TvState.current();
      if (cur && !WiomTV.PlayerController.blockingOverlay()) {
        WiomTV.PlayerController.tune(cur, 'boot');
      }
      WiomTV.ConfigPoller.startPolling(onRemoteConfig);
    });
  }

  // Remote config landed: swap lineup (keep current channel by id), arm/clear gate.
  function onRemoteConfig(parsed) {
    var st = WiomTV.TvState;
    var before = st.state.channels;
    var beforeIds = before.map(function (c) { return c.id; }).join(',');
    var afterIds = parsed.channels.map(function (c) { return c.id; }).join(',');

    WiomTV.PlayerController.applyUpdateGate(parsed.updateGate);

    if (!before.length) {
      // Cold boot with no local config: this is the first lineup.
      st.load(parsed);
      WiomTV.LogoGrid.invalidate();
      var cur0 = st.current();
      if (cur0 && !WiomTV.PlayerController.blockingOverlay()) {
        WiomTV.PlayerController.tune(cur0, 'boot');
      }
      return;
    }

    if (beforeIds === afterIds) return; // pure metadata change — nothing to do

    WiomTV.Telemetry.event('config_update', {
      from_count: before.length, to_count: parsed.channels.length
    });

    var watched = st.current();
    var res = st.updateChannels(parsed.channels);
    WiomTV.LogoGrid.invalidate();

    if (res.killed && watched) {
      // The channel being watched was kill-switched — switch away now.
      WiomTV.Telemetry.event('channel_killed', { id: watched.id });
      var cur = st.current();
      if (cur) WiomTV.PlayerController.tune(cur, 'boot');
    }
    // Pure reorder / additions: current channel survived by id — playback untouched.
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
