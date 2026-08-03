// AVPlayBackend — production player on Samsung hardware (webapis.avplay).
// AVPlay is a strict single-instance state machine: NONE -> IDLE -> READY -> PLAYING.
// No buffer/bandwidth introspection exists; PlayerController compensates with the
// currenttime-freeze detector. First-frame signal is approximate (see onFirstFrameSignal).
window.WiomTV = window.WiomTV || {};
(function () {
  function log(msg) { console.log('[WiomAvplay] ' + msg); }

  function AVPlayBackend() {
    this.cb = {};                  // onFirstFrame, onBufferingStart, onReady, onError, onCurrentTime
    this.tuneSeq = 0;
    this.channelId = null;
    this.sawFirstSignal = false;
    this.lastTickAt = 0;           // performance.now() of last oncurrentplaytime — freeze detector input
  }

  AVPlayBackend.available = function () {
    return typeof webapis !== 'undefined' && !!webapis.avplay;
  };

  // Map AVPlay error strings onto the Android (bucket, stage) taxonomy (classifyError port).
  function classify(err) {
    var s = String(err);
    if (s.indexOf('CONNECTION_FAILED') !== -1) return ['network', 'connect'];
    if (s.indexOf('INVALID_STREAMING_DATA') !== -1) return ['source', 'manifest'];
    if (s.indexOf('NOT_SUPPORTED') !== -1) return ['decoder', 'decode'];
    if (s.indexOf('INVALID_URI') !== -1) return ['source', 'manifest'];
    if (s.indexOf('RENDER') !== -1) return ['render', 'render'];
    return ['unknown', 'unknown'];
  }

  AVPlayBackend.prototype._displayRect = function () {
    // Some panels report a 1280x720 app resolution — use the real window size, not 1920 hardcoded.
    try {
      webapis.avplay.setDisplayRect(0, 0, window.innerWidth, window.innerHeight);
      webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_LETTER_BOX');
    } catch (e) { log('setDisplayRect failed: ' + e.message); }
  };

  AVPlayBackend.prototype.open = function (channel, tuneSeq) {
    var self = this;
    this.tuneSeq = tuneSeq;
    this.channelId = channel.id;
    this.sawFirstSignal = false;
    this.lastTickAt = 0;

    this.stop(); // stop+close any previous instance

    try {
      webapis.avplay.open(channel.streamUrl);
      this._displayRect();
      // Fast-start port: no bandwidth meter on AVPlay -> always floor-start, native ABR climbs.
      try { webapis.avplay.setStreamingProperty('ADAPTIVE_INFO', 'STARTBITRATE=LOWEST'); } catch (e) {}

      webapis.avplay.setListener({
        onbufferingstart: function () {
          if (self.tuneSeq !== tuneSeq) return;
          if (self.cb.onBufferingStart) self.cb.onBufferingStart();
        },
        onbufferingprogress: function () {},
        onbufferingcomplete: function () {
          if (self.tuneSeq !== tuneSeq) return;
          if (self.cb.onReady) self.cb.onReady();
          self._firstSignal(tuneSeq); // fallback first-frame signal
        },
        oncurrentplaytime: function (ms) {
          if (self.tuneSeq !== tuneSeq) return;
          self.lastTickAt = performance.now();
          if (ms > 0) self._firstSignal(tuneSeq); // primary first-frame signal
          if (self.cb.onCurrentTime) self.cb.onCurrentTime(ms);
        },
        onerror: function (err) {
          if (self.tuneSeq !== tuneSeq) return;
          log('onerror ' + err);
          var bs = classify(err);
          if (self.cb.onError) self.cb.onError(bs[0], bs[1], String(err));
        },
        onstreamcompleted: function () {
          // A live stream "completing" = the feed ended/broke — treat as source error.
          if (self.tuneSeq !== tuneSeq) return;
          if (self.cb.onError) self.cb.onError('source', 'manifest', 'STREAM_COMPLETED');
        },
        onevent: function (eventType, eventData) {
          log('event ' + eventType + ' ' + eventData);
        }
      });

      webapis.avplay.prepareAsync(function () {
        if (self.tuneSeq !== tuneSeq) return;
        try { webapis.avplay.play(); } catch (e) {
          if (self.cb.onError) self.cb.onError('unknown', 'unknown', 'play:' + e.message);
        }
      }, function (err) {
        if (self.tuneSeq !== tuneSeq) return;
        var bs = classify(err);
        if (self.cb.onError) self.cb.onError(bs[0], bs[1], 'prepare:' + String(err));
      });
    } catch (e) {
      var bs2 = classify(e.message);
      if (this.cb.onError) this.cb.onError(bs2[0], bs2[1], 'open:' + e.message);
    }
  };

  // S1 hardware calibration decides which signal wins; emit on whichever fires first.
  AVPlayBackend.prototype._firstSignal = function (tuneSeq) {
    if (this.sawFirstSignal || this.tuneSeq !== tuneSeq) return;
    this.sawFirstSignal = true;
    if (this.cb.onFirstFrame) this.cb.onFirstFrame(this.channelId);
  };

  AVPlayBackend.prototype.pause = function () {
    try { webapis.avplay.pause(); } catch (e) {}
  };

  AVPlayBackend.prototype.play = function () {
    try { webapis.avplay.play(); } catch (e) {}
  };

  AVPlayBackend.prototype.stop = function () {
    try {
      var st = webapis.avplay.getState();
      if (st !== 'NONE') { webapis.avplay.stop(); webapis.avplay.close(); }
    } catch (e) {}
  };

  AVPlayBackend.prototype.suspend = function () {
    try { webapis.avplay.suspend(); } catch (e) {}
  };

  AVPlayBackend.prototype.getState = function () {
    try { return webapis.avplay.getState(); } catch (e) { return 'NONE'; }
  };

  AVPlayBackend.prototype.getBufferedMs = function () { return null; }; // no API — callers degrade

  AVPlayBackend.prototype.destroy = function () { this.stop(); };

  WiomTV.AVPlayBackend = AVPlayBackend;
})();
