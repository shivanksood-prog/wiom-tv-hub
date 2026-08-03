// All timing/threshold constants carried verbatim from the Android app (MainActivity.kt et al).
window.WiomTV = window.WiomTV || {};
WiomTV.C = {
  ZAP_DEBOUNCE_MS: 180,            // surf method only; boot/grid tune instantly
  RECONNECT_GRACE_MS: 2500,        // network-flap grace before declaring offline
  STEADY_BUFFER_CUE_MS: 1500,      // BufferingCue delay
  DEAD_STREAK_NETWORK_LIMIT: 3,    // dead-skips before brownout
  STALL_WATCHDOG_MS: 12000,
  LOADING_CUE_DELAY_MS: 400,       // ZapCover cue
  BUG_AUTOHIDE_MS: 3500,           // after first frame
  SPLASH_CUE_DELAY_MS: 450,
  BACK_EXIT_WINDOW_MS: 2000,
  RECONNECT_BACKOFF_START_MS: 800, // x2 per attempt, capped:
  RECONNECT_BACKOFF_CAP_MS: 15000,
  MIN_STALL_REPORT_MS: 250,        // stalls shorter than this are not logged
  VIEW_DWELL_MS: 15000,            // auto-favorite qualifying view
  FAVORITE_THRESHOLD: 3,
  FAVORITES_MAX: 8,
  CONFIG_INTERVAL_MS: 5 * 60 * 1000,
  CONFIG_TIMEOUT_MS: 10000,
  LOGO_WARM_DELAY_MS: 3000,        // after first frame
  LOGO_WARM_BATCH: 8,
  LOGO_WARM_PACING_MS: 300,
  TELEMETRY_FLUSH_MS: 30000,
  TELEMETRY_QUEUE_MAX: 500,
  CURRENTTIME_FREEZE_MS: 2500,     // AVPlay: no oncurrentplaytime tick this long while PLAYING = broken

  // hls.js backend only (AVPlay has no bandwidth/track APIs)
  HIGH_BW_START_BPS: 5000000,
  FLOOR_RELEASE_BUFFER_MS: 7000,
  FLOOR_RELEASE_HEADROOM: 4,

  // BuildConfig.CONFIG_ENDPOINT equivalent — same gist as the Android app
  CONFIG_ENDPOINT: 'https://gist.githubusercontent.com/shivanksood-prog/e2f6780342a83611d2aee5ff27b84614/raw/channels.json',

  // S5: first-party telemetry ingest (blank = console-only, events still queue)
  TELEMETRY_ENDPOINT: ''
};
