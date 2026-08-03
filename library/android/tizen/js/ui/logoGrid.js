// LogoGrid — port of LogoGrid.kt: genre rows, favorites row, roving {row,col} focus,
// Kotlin String.hashCode tileColor parity, initials placeholders, paced logo pre-warm.
window.WiomTV = window.WiomTV || {};
(function () {
  var C = WiomTV.C;
  var KEY = null; // filled from Keys at first use (script order: keys.js loads before us)

  var g = {
    rows: [],          // [{label, tiles:[{channelIndex, channel, el}] , rowEl}]
    focus: { row: 0, col: 0 },
    builtForLineup: '',
    warmedLineup: ''
  };

  // ---- Kotlin String.hashCode port (31*h + c over UTF-16 code units, int32 overflow) ----
  function kotlinHashCode(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return h;
  }

  // Deterministic tile bg: HSV(hash%360, 0.40, 0.45) — matches Android tiles exactly.
  function tileColor(name) {
    var h = ((kotlinHashCode(name) % 360) + 360) % 360;
    var s = 0.40, v = 0.45;
    var c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
    var r = 0, gr = 0, b = 0;
    if (h < 60) { r = c; gr = x; } else if (h < 120) { r = x; gr = c; }
    else if (h < 180) { gr = c; b = x; } else if (h < 240) { gr = x; b = c; }
    else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
    function ch(n) { return Math.round((n + m) * 255); }
    return 'rgb(' + ch(r) + ',' + ch(gr) + ',' + ch(b) + ')';
  }

  function lineupKey(channels) {
    var ids = [];
    for (var i = 0; i < channels.length; i++) ids.push(channels[i].id);
    return ids.join(',');
  }

  // ---- build ----
  function makeTile(channel, channelIndex) {
    var tile = document.createElement('div');
    tile.className = 'tile';
    var img = document.createElement('div');
    img.className = 'tile-img';
    img.style.background = tileColor(channel.name);
    var initials = document.createElement('span');
    initials.className = 'initials';
    initials.textContent = channel.name.slice(0, 2).toUpperCase();
    img.appendChild(initials);
    if (channel.logoUrl) {
      var im = document.createElement('img');
      im.loading = 'lazy';
      im.onload = function () { im.style.display = 'block'; initials.style.display = 'none'; };
      im.onerror = function () { im.style.display = 'none'; initials.style.display = ''; };
      im.src = channel.logoUrl;
      img.appendChild(im);
    }
    var name = document.createElement('div');
    name.className = 'tile-name';
    name.textContent = channel.name;
    tile.appendChild(img);
    tile.appendChild(name);
    return { channelIndex: channelIndex, channel: channel, el: tile };
  }

  function build() {
    var st = WiomTV.TvState;
    var channels = st.state.channels;
    var key = lineupKey(channels);
    if (key === g.builtForLineup) return;
    g.builtForLineup = key;

    var body = document.getElementById('grid-body');
    body.innerHTML = '';
    g.rows = [];

    // Favorites row first if any (LogoGrid.kt:106)
    var favs = st.topFavorites();
    var sections = [];
    if (favs.length) {
      sections.push({ label: WiomTV.S.FAVORITES_LABEL, entries: favs.map(function (f) {
        return { channel: f.channel, index: f.index };
      }) });
    }
    // Genre rows in lineup order (channels are already genre-sorted)
    var byGenre = {}, genreSeq = [];
    for (var i = 0; i < channels.length; i++) {
      var gname = channels[i].genre;
      if (!byGenre[gname]) { byGenre[gname] = []; genreSeq.push(gname); }
      byGenre[gname].push({ channel: channels[i], index: i });
    }
    for (var s = 0; s < genreSeq.length; s++) {
      var gn = genreSeq[s];
      var label = WiomTV.GENRE_LABEL[gn] || (gn.charAt(0).toUpperCase() + gn.slice(1));
      sections.push({ label: label, entries: byGenre[gn] });
    }

    for (var r = 0; r < sections.length; r++) {
      var rowEl = document.createElement('div');
      rowEl.className = 'genre-row';
      var lab = document.createElement('div');
      lab.className = 'genre-label';
      lab.textContent = sections[r].label;
      var tileRow = document.createElement('div');
      tileRow.className = 'tile-row';
      var tiles = [];
      for (var t = 0; t < sections[r].entries.length; t++) {
        var entry = sections[r].entries[t];
        var tl = makeTile(entry.channel, entry.index);
        tileRow.appendChild(tl.el);
        tiles.push(tl);
      }
      rowEl.appendChild(lab);
      rowEl.appendChild(tileRow);
      body.appendChild(rowEl);
      g.rows.push({ label: sections[r].label, tiles: tiles, rowEl: rowEl, tileRowEl: tileRow });
    }
  }

  function invalidate() { g.builtForLineup = ''; }

  // ---- focus ----
  function setFocus(row, col) {
    var old = focusedTile();
    if (old) old.el.classList.remove('focused');
    g.focus.row = Math.max(0, Math.min(row, g.rows.length - 1));
    var tiles = g.rows[g.focus.row].tiles;
    g.focus.col = Math.max(0, Math.min(col, tiles.length - 1));
    var tile = tiles[g.focus.col];
    tile.el.classList.add('focused');
    // Instant scroll — smooth is janky on TV Chromium.
    scrollRowIntoView(tile);
  }

  function scrollRowIntoView(tile) {
    var rowEl = g.rows[g.focus.row].rowEl;
    var body = document.getElementById('grid-body');
    // vertical
    var rTop = rowEl.offsetTop, rBot = rTop + rowEl.offsetHeight;
    if (rTop < body.scrollTop) body.scrollTop = rTop;
    else if (rBot > body.scrollTop + body.clientHeight) body.scrollTop = rBot - body.clientHeight;
    // horizontal within the row
    var tr = g.rows[g.focus.row].tileRowEl;
    var tLeft = tile.el.offsetLeft, tRight = tLeft + tile.el.offsetWidth;
    if (tLeft < tr.scrollLeft) tr.scrollLeft = tLeft;
    else if (tRight > tr.scrollLeft + tr.clientWidth) tr.scrollLeft = tRight - tr.clientWidth;
  }

  function focusedTile() {
    var row = g.rows[g.focus.row];
    return row ? row.tiles[g.focus.col] : null;
  }

  // Auto-focus the currently playing channel (first occurrence outside favorites).
  function focusCurrent() {
    var cur = WiomTV.TvState.current();
    if (!cur) { setFocus(0, 0); return; }
    var startRow = (g.rows.length && g.rows[0].label === WiomTV.S.FAVORITES_LABEL) ? 1 : 0;
    for (var r = startRow; r < g.rows.length; r++) {
      for (var c = 0; c < g.rows[r].tiles.length; c++) {
        if (g.rows[r].tiles[c].channel.id === cur.id) { setFocus(r, c); return; }
      }
    }
    setFocus(0, 0);
  }

  // ---- open/close/keys ----
  function open() {
    build();
    if (!g.rows.length) return;
    WiomTV.TvState.openGrid();
    document.getElementById('logo-grid').classList.remove('hidden');
    focusCurrent();
  }

  function close(jumped) {
    WiomTV.TvState.closeGrid(jumped);
    document.getElementById('logo-grid').classList.add('hidden');
  }

  function handleKey(k) {
    if (!KEY) KEY = WiomTV.Keys.KEY;
    switch (k) {
      case KEY.LEFT: setFocus(g.focus.row, g.focus.col - 1); break;
      case KEY.RIGHT: setFocus(g.focus.row, g.focus.col + 1); break;
      case KEY.UP: setFocus(g.focus.row - 1, g.focus.col); break;
      case KEY.DOWN: setFocus(g.focus.row + 1, g.focus.col); break;
      case KEY.ENTER:
        var t = focusedTile();
        if (t) { close(true); WiomTV.TvState.jumpTo(t.channelIndex); }
        break;
    }
  }

  // ---- paced logo pre-warm: first frame + 3s, batches of 8 every 300ms ----
  function warmLogos(seq) {
    var channels = WiomTV.TvState.state.channels;
    var key = lineupKey(channels);
    if (key === g.warmedLineup) return;
    g.warmedLineup = key;

    setTimeout(function () {
      var urls = [];
      for (var i = 0; i < channels.length; i++) {
        if (channels[i].logoUrl) urls.push(channels[i].logoUrl);
      }
      var idx = 0;
      var pump = function () {
        if (idx >= urls.length) return;
        var pc = WiomTV.PlayerController._pc;
        if (pc.reconnecting) { setTimeout(pump, 2000); return; } // pause while struggling
        for (var b = 0; b < C.LOGO_WARM_BATCH && idx < urls.length; b++, idx++) {
          var im = new Image();
          im.src = urls[idx];
        }
        setTimeout(pump, C.LOGO_WARM_PACING_MS);
      };
      pump();
    }, C.LOGO_WARM_DELAY_MS);
  }

  WiomTV.LogoGrid = {
    open: open, close: close, handleKey: handleKey,
    tileColor: tileColor, invalidate: invalidate, warmLogos: warmLogos
  };
})();
