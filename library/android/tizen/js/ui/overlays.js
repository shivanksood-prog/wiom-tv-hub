// Overlays — DOM/class-toggle port of Overlays.kt with exact Android timings.
// All elements pre-exist in index.html; nothing is created on hot paths.
window.WiomTV = window.WiomTV || {};
(function () {
  var C = WiomTV.C;

  var el = {};
  var timers = { splashCue: null, zapCue: null, bugHide: null, bufferCue: null, toast: null };

  function $(id) { return document.getElementById(id); }

  function init() {
    el.splash = $('boot-splash'); el.splashCue = $('splash-cue');
    el.zap = $('zap-cover'); el.zapChip = $('zap-logo-chip'); el.zapImg = $('zap-logo-img');
    el.zapInitials = $('zap-initials'); el.zapName = $('zap-name');
    el.bug = $('channel-bug'); el.bugChip = $('bug-logo-chip'); el.bugImg = $('bug-logo-img');
    el.bugInitials = $('bug-initials'); el.bugName = $('bug-name'); el.bugGenre = $('bug-genre');
    el.buffer = $('buffering-cue');
    el.reconnect = $('reconnect-overlay');
    el.update = $('force-update'); el.updateMsg = $('update-message'); el.updateUrl = $('update-url');
    el.toast = $('exit-toast');

    // Splash cue after 450ms (BootSplash parity)
    timers.splashCue = setTimeout(function () {
      el.splashCue.classList.remove('hidden');
      el.splashCue.classList.add('fade-in');
    }, C.SPLASH_CUE_DELAY_MS);
  }

  function hideSplash() {
    if (timers.splashCue) clearTimeout(timers.splashCue);
    el.splash.classList.add('hidden');
  }

  // ---- logo chip helper: initials until the logo loads; onerror keeps initials ----
  function setChip(imgEl, initialsEl, chipEl, channel) {
    initialsEl.textContent = channel.name.slice(0, 2).toUpperCase();
    initialsEl.style.display = '';
    imgEl.style.display = 'none';
    chipEl.style.background = WiomTV.LogoGrid.tileColor(channel.name);
    if (channel.logoUrl) {
      imgEl.onload = function () { imgEl.style.display = 'block'; initialsEl.style.display = 'none'; };
      imgEl.onerror = function () { imgEl.style.display = 'none'; initialsEl.style.display = ''; };
      if (imgEl.src !== channel.logoUrl) imgEl.src = channel.logoUrl;
      else if (imgEl.complete && imgEl.naturalWidth) imgEl.onload();
    }
  }

  // ---- ZapCover: black cut instant; logo-chip cue after 400ms ----
  function showZapCover(channel) {
    if (timers.zapCue) clearTimeout(timers.zapCue);
    el.zap.classList.remove('hidden');
    var center = el.zap.querySelector('.zap-center');
    center.style.visibility = 'hidden';
    setChip(el.zapImg, el.zapInitials, el.zapChip, channel);
    el.zapName.textContent = channel.name;
    timers.zapCue = setTimeout(function () {
      center.style.visibility = 'visible';
      center.classList.add('fade-in');
    }, C.LOADING_CUE_DELAY_MS);
  }

  function hideZapCover() {
    if (timers.zapCue) clearTimeout(timers.zapCue);
    el.zap.classList.add('hidden');
  }

  // ---- ChannelBug: shows on keypress; auto-hide 3500ms after first frame ----
  function showBug(channel) {
    if (timers.bugHide) clearTimeout(timers.bugHide);
    setChip(el.bugImg, el.bugInitials, el.bugChip, channel);
    el.bugName.textContent = channel.name;
    var label = WiomTV.GENRE_LABEL[channel.genre];
    el.bugGenre.textContent = label || (channel.genre.charAt(0).toUpperCase() + channel.genre.slice(1));
    el.bug.classList.remove('hidden');
  }

  function scheduleBugHide(seq) {
    if (timers.bugHide) clearTimeout(timers.bugHide);
    timers.bugHide = setTimeout(function () {
      if (seq !== WiomTV.PlayerController._pc.tuneSeq) return;
      el.bug.classList.add('hidden');
    }, C.BUG_AUTOHIDE_MS);
  }

  // ---- BufferingCue: pill after 1500ms steady-state rebuffer only ----
  function scheduleBufferingCue(seq, steadyState) {
    if (!steadyState) return; // suppressed during zap/grid/reconnect
    if (timers.bufferCue) clearTimeout(timers.bufferCue);
    timers.bufferCue = setTimeout(function () {
      var pc = WiomTV.PlayerController._pc;
      if (seq !== pc.tuneSeq || pc.reconnecting || WiomTV.TvState.state.gridOpen) return;
      el.buffer.classList.remove('hidden');
    }, C.STEADY_BUFFER_CUE_MS);
  }

  function hideBufferingCue() {
    if (timers.bufferCue) clearTimeout(timers.bufferCue);
    el.buffer.classList.add('hidden');
  }

  // ---- ReconnectOverlay ----
  function showReconnect() { el.reconnect.classList.remove('hidden'); }
  function hideReconnect() { el.reconnect.classList.add('hidden'); }

  // ---- ForceUpdateOverlay ----
  function showForceUpdate(gate) {
    el.updateMsg.textContent = gate.updateMessage;
    el.updateUrl.textContent = gate.updateUrl || '';
    el.update.classList.remove('hidden');
  }
  function hideForceUpdate() { el.update.classList.add('hidden'); }

  // ---- Exit toast (~2s, matches BACK_EXIT_WINDOW) ----
  function showExitToast() {
    if (timers.toast) clearTimeout(timers.toast);
    el.toast.classList.remove('hidden');
    timers.toast = setTimeout(function () { el.toast.classList.add('hidden'); }, C.BACK_EXIT_WINDOW_MS);
  }

  WiomTV.Overlays = {
    init: init, hideSplash: hideSplash,
    showZapCover: showZapCover, hideZapCover: hideZapCover,
    showBug: showBug, scheduleBugHide: scheduleBugHide,
    scheduleBufferingCue: scheduleBufferingCue, hideBufferingCue: hideBufferingCue,
    showReconnect: showReconnect, hideReconnect: hideReconnect,
    showForceUpdate: showForceUpdate, hideForceUpdate: hideForceUpdate,
    showExitToast: showExitToast
  };
})();
