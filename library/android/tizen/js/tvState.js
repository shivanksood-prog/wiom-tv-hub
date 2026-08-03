// Port of TvState.kt: lineup, current index, grid state, favorites, last-channel persistence.
window.WiomTV = window.WiomTV || {};
(function () {
  var C = WiomTV.C;

  var state = {
    channels: [],
    index: 0,
    gridOpen: false,
    switchMethod: 'boot',   // 'boot' | 'surf' | 'grid'
    surfDepth: 0,
    gridOpenedAt: 0,
    onChange: null          // set by main.js: function(channel, method) -> tune
  };

  function current() { return state.channels[state.index] || null; }

  function persistLast(id) {
    try { localStorage.setItem('wiomtv.lastChannel', id); } catch (e) {}
  }

  // Boot pick priority (TvState.kt:40-51): lastChannel -> remote defaultChannelId -> index 0.
  function load(parsed) {
    state.channels = parsed.channels;
    var pick = 0;
    var last = null;
    try { last = localStorage.getItem('wiomtv.lastChannel'); } catch (e) {}
    var want = last || parsed.defaultChannelId;
    if (want) {
      for (var i = 0; i < state.channels.length; i++) {
        if (state.channels[i].id === want) { pick = i; break; }
      }
    }
    state.index = pick;
  }

  // updateChannels (TvState.kt:55-64): keep current channel if it survived, else clamp.
  // Returns { killed: bool } — true when the watched channel vanished from the new lineup.
  function updateChannels(fresh) {
    var cur = current();
    state.channels = fresh;
    if (cur) {
      for (var i = 0; i < fresh.length; i++) {
        if (fresh[i].id === cur.id) { state.index = i; return { killed: false }; }
      }
    }
    if (state.index >= fresh.length) state.index = fresh.length - 1;
    if (state.index < 0) state.index = 0;
    return { killed: !!cur };
  }

  function move(delta, method) {
    if (!state.channels.length) return;
    state.index = (state.index + delta + state.channels.length) % state.channels.length;
    state.switchMethod = method || 'surf';
    state.surfDepth = state.switchMethod === 'surf' ? state.surfDepth + 1 : 0;
    var ch = current();
    persistLast(ch.id);
    if (state.onChange) state.onChange(ch, state.switchMethod);
  }

  function next() { move(1, 'surf'); }      // UP = next (Android convention)
  function previous() { move(-1, 'surf'); }

  function jumpTo(index) {
    if (index < 0 || index >= state.channels.length) return;
    state.index = index;
    state.switchMethod = 'grid';
    state.surfDepth = 0;
    var ch = current();
    persistLast(ch.id);
    if (state.onChange) state.onChange(ch, 'grid');
  }

  // ---- auto-favorites (TvState.kt:31-34, 66-84): 15s dwell = a view; 3 views = favorite ----
  function viewCount(id) {
    var n = 0;
    try { n = parseInt(localStorage.getItem('wiomtv.v_' + id) || '0', 10); } catch (e) {}
    return isNaN(n) ? 0 : n;
  }

  function recordView(id) {
    var n = viewCount(id) + 1;
    try { localStorage.setItem('wiomtv.v_' + id, String(n)); } catch (e) {}
    if (n === C.FAVORITE_THRESHOLD) {
      WiomTV.Telemetry.event('favorite_auto_added', { id: id, view_count: n });
    }
    return n;
  }

  function topFavorites() {
    var favs = [];
    for (var i = 0; i < state.channels.length; i++) {
      var ch = state.channels[i];
      var n = viewCount(ch.id);
      if (n >= C.FAVORITE_THRESHOLD) favs.push({ channel: ch, index: i, views: n });
    }
    favs.sort(function (a, b) { return b.views - a.views; });
    return favs.slice(0, C.FAVORITES_MAX);
  }

  function isFavorite(id) { return viewCount(id) >= C.FAVORITE_THRESHOLD; }

  // ---- grid open/close instrumentation (TvState.kt:98-117) ----
  function openGrid() {
    if (state.gridOpen) return;
    state.gridOpen = true;
    state.gridOpenedAt = performance.now();
    WiomTV.Telemetry.event('grid_open', {});
  }

  function closeGrid(jumped) {
    if (!state.gridOpen) return;
    state.gridOpen = false;
    WiomTV.Telemetry.event('grid_close', {
      open_duration_ms: Math.round(performance.now() - state.gridOpenedAt),
      jumped: !!jumped
    });
  }

  WiomTV.TvState = {
    state: state, current: current, load: load, updateChannels: updateChannels,
    next: next, previous: previous, jumpTo: jumpTo,
    recordView: recordView, topFavorites: topFavorites, isFavorite: isFavorite,
    openGrid: openGrid, closeGrid: closeGrid
  };
})();
