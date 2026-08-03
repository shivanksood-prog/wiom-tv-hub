// Port of Channel.kt + Channels.kt: parse, kill-switch filter, genre-ranked sort.
window.WiomTV = window.WiomTV || {};
(function () {
  // Channel.kt:17-18 fallback order; remote genreOrder overrides.
  var GENRE_ORDER = ['entertainment', 'movies', 'music', 'devotional', 'kids',
                     'regional', 'news', 'sports', 'knowledge', 'lifestyle'];

  function genreRank(genre, order) {
    var i = order.indexOf(genre);
    return i === -1 ? order.length : i; // unknown genre ranks last
  }

  // Returns { channels: [...], defaultChannelId, updateGate } or throws on bad JSON.
  // parseChannels semantics: drop enabled:false, sort (genreRank, order, name),
  // or (order, name) when sortMode === 'global'.
  function parseChannels(text) {
    var root = JSON.parse(text);
    var raw = root.channels || [];
    var genreOrder = Array.isArray(root.genreOrder) && root.genreOrder.length ? root.genreOrder : GENRE_ORDER;
    var globalSort = root.sortMode === 'global';

    var list = [];
    for (var i = 0; i < raw.length; i++) {
      var c = raw[i];
      if (!c.id || !c.name || !c.streamUrl) continue; // id/name/streamUrl required
      if (c.enabled === false) continue;              // kill-switch
      list.push({
        id: String(c.id),
        name: String(c.name),
        logoUrl: c.logoUrl || '',
        genre: c.genre || 'other',
        order: typeof c.order === 'number' ? c.order : 0,
        streamUrl: String(c.streamUrl),
        format: c.format || 'hls',              // 'hlsjs' = per-channel AVPlay escape hatch
        classification: c.classification || 'amber'
      });
    }
    if (list.length < 1) throw new Error('no enabled channels');

    list.sort(function (a, b) {
      if (!globalSort) {
        var ra = genreRank(a.genre, genreOrder), rb = genreRank(b.genre, genreOrder);
        if (ra !== rb) return ra - rb;
      }
      if (a.order !== b.order) return a.order - b.order;
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });

    return {
      channels: list,
      defaultChannelId: root.defaultChannelId || null,
      // ConfigPoller.kt:21-36 force-update gate; minVersionCode > 0 arms it.
      updateGate: {
        minVersionCode: typeof root.minVersionCode === 'number' ? root.minVersionCode : 0,
        forceUpdate: root.forceUpdate !== false,
        updateUrl: root.updateUrl || '',
        updateMessage: root.updateMessage || WiomTV.S.UPDATE_DEFAULT_MSG
      }
    };
  }

  WiomTV.Channels = { parse: parseChannels, GENRE_ORDER: GENRE_ORDER };
})();
