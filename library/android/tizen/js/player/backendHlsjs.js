// HlsJsBackend — Chrome dev loop + per-channel format:"hlsjs" escape hatch on TV.
// Here the full Android ABR logic IS portable: hls.bandwidthEstimate + video.buffered
// give real floor-start/floor-release (DefaultLoadControl 50s/50s/1s/4s analog).
window.WiomTV = window.WiomTV || {};
(function () {
  var C = WiomTV.C;

  function log(msg) { console.log('[WiomHlsjs] ' + msg); }

  function HlsJsBackend(videoEl) {
    this.video = videoEl;
    this.hls = null;
    this.cb = {};
    this.tuneSeq = 0;
    this.channelId = null;
    this.sawFirstFrame = false;
    this.floorTimer = null;
    this._bindVideoEvents();
  }

  HlsJsBackend.available = function () {
    return typeof Hls !== 'undefined' && Hls.isSupported();
  };

  HlsJsBackend.prototype._bindVideoEvents = function () {
    var self = this;
    this.video.addEventListener('playing', function () {
      if (!self.sawFirstFrame) {
        self.sawFirstFrame = true;
        if (self.cb.onFirstFrame) self.cb.onFirstFrame(self.channelId);
      }
      if (self.cb.onReady) self.cb.onReady();
    });
    this.video.addEventListener('waiting', function () {
      if (self.cb.onBufferingStart) self.cb.onBufferingStart();
    });
    this.video.addEventListener('timeupdate', function () {
      if (self.cb.onCurrentTime) self.cb.onCurrentTime(self.video.currentTime * 1000);
    });
  };

  HlsJsBackend.prototype.open = function (channel, tuneSeq) {
    var self = this;
    this.tuneSeq = tuneSeq;
    this.channelId = channel.id;
    this.sawFirstFrame = false;
    this.stop();
    this.video.style.display = 'block';

    // Floor-start decision mirrors Android: skip the floor on proven-fast links.
    var est = this._lastEstimate || 0;
    var floorStart = est < C.HIGH_BW_START_BPS;

    var hls = new Hls({
      maxBufferLength: 50, maxMaxBufferLength: 50,
      startLevel: floorStart ? 0 : -1,
      fragLoadingTimeOut: 10000, manifestLoadingTimeOut: 10000, levelLoadingTimeOut: 10000,
      enableWorker: true
    });
    this.hls = hls;

    hls.on(Hls.Events.ERROR, function (evt, data) {
      if (self.tuneSeq !== tuneSeq || !data.fatal) return;
      var bucket = data.type === Hls.ErrorTypes.NETWORK_ERROR ? 'network' : 'decoder';
      var stage = data.type === Hls.ErrorTypes.NETWORK_ERROR ? 'segment' : 'decode';
      if (self.cb.onError) self.cb.onError(bucket, stage, data.details || 'fatal');
    });

    hls.loadSource(channel.streamUrl);
    hls.attachMedia(this.video);
    this.video.play().catch(function () {});

    // Floor release: buffered >= 7s AND bandwidth >= 4x current level bitrate -> free ABR.
    if (floorStart) {
      this.floorTimer = setInterval(function () {
        if (self.tuneSeq !== tuneSeq || !self.hls) { clearInterval(self.floorTimer); return; }
        self._lastEstimate = self.hls.bandwidthEstimate || 0;
        var buffered = 0;
        var b = self.video.buffered;
        if (b.length) buffered = (b.end(b.length - 1) - self.video.currentTime) * 1000;
        var level = self.hls.levels && self.hls.levels[self.hls.currentLevel];
        var bitrate = level ? level.bitrate : 800000;
        if (buffered >= C.FLOOR_RELEASE_BUFFER_MS && self._lastEstimate >= C.FLOOR_RELEASE_HEADROOM * bitrate) {
          log('floor released (buffered=' + Math.round(buffered) + 'ms est=' + Math.round(self._lastEstimate) + ')');
          self.hls.currentLevel = -1;
          clearInterval(self.floorTimer);
        }
      }, 500);
    }
  };

  HlsJsBackend.prototype.pause = function () { this.video.pause(); };
  HlsJsBackend.prototype.play = function () { this.video.play().catch(function () {}); };

  HlsJsBackend.prototype.stop = function () {
    if (this.floorTimer) { clearInterval(this.floorTimer); this.floorTimer = null; }
    if (this.hls) { try { this.hls.destroy(); } catch (e) {} this.hls = null; }
  };

  HlsJsBackend.prototype.suspend = function () { this.pause(); };
  HlsJsBackend.prototype.getState = function () { return this.hls ? 'PLAYING' : 'NONE'; };

  HlsJsBackend.prototype.getBufferedMs = function () {
    var b = this.video.buffered;
    if (!b.length) return 0;
    return Math.max(0, (b.end(b.length - 1) - this.video.currentTime) * 1000);
  };

  HlsJsBackend.prototype.destroy = function () { this.stop(); this.video.style.display = 'none'; };

  WiomTV.HlsJsBackend = HlsJsBackend;
})();
