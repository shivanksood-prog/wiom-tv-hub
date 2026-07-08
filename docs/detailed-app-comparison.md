# Detailed App Comparison  

**WIOM TV**   |   PRODUCT & ENGINEERING COMPARISON

**Wiom TV (ours) vs Satyam’s “Indian TV”**

Consolidated Comparison — Twelve Ranked Dimensions

|  |  |  |
| :-: | :-: | :-: |
|   | \*\*Our app — Wiom TV\*\* | \*\*His app — “Indian TV”\*\* |
| \*\*Date\*\* | 12 June 2026 | 12 June 2026 |
| \*\*Repository / package\*\* | \\\~/wiom-tv-android — com.wiom.tv.zb | github.com/satyamdarmora/WiomTV — com.indiantv.app |
| \*\*Version\*\* | v1.1-pilot (versionCode 3) | v1.0.0, single commit dated 22 Feb 2026 |
| \*\*Size\*\* | 14 Kotlin files, \\\~1,310 LOC | Android app \\\~1,910 LOC |
| \*\*Surfaces\*\* | Android TV only | Three: Android app + Node/Express web player (server.js + public/) + Samsung Tizen app (tizen/), all sharing one 100-channel channels.json |

  

This document consolidates the full deep dive (comparison\_deep\_dive.md) and the stream-serving/legality analysis into a single ranked set of twelve comparisons. **Comparison \#1 is the stream-serving mechanic** — it is the most consequential because it determines the legal posture of the whole product.

# **1.**  **Stream-Serving Mechanic & Legal Exposure ★ (the one that matters most)**

How each app actually puts a channel on screen — and therefore where it sits on the copyright risk ladder.

|  |  |  |  |
| :-: | :-: | :-: | :-: |
|   | \*\*Our app (Android)\*\* | \*\*His Android\*\* | \*\*His web/Tizen server\*\* |
| \*\*Who fetches the bytes\*\* | User’s device → broadcaster origin | User’s device → broadcaster origin | \*\*His server → broadcaster → user\*\* |
| \*\*Rewrites the stream\*\* | No | No | \*\*Yes — every segment + AES key URI rerouted (\*\*rewriteM3U8\*\*)\*\* |
| \*\*Spoofs headers to origin\*\* | No | No | \*\*Yes — fake\*\* Referer\*\*/\*\*Origin\*\*/\*\*User-Agent \*\*(server.js:188–192)\*\* |
| \*\*Scrapes a platform\*\* | No | No | \*\*Yes — rips YouTube live\*\* videoId \*\*out of\*\* ytInitialData |
| \*\*Hosts / relays content\*\* | No | No | \*\*Yes —\*\* proxyRes.pipe(res) |
| \*\*Risk-ladder tier\*\* | Mode 3 (lightest gray) | Mode 3 | \*\*Mode 5 — restream (darkest)\*\* |
| \*\*“We’re just a window onto public streams” — true?\*\* | \*\*Yes, factually\*\* (device-direct fetch, same as VLC) | Yes | \*\*No — his server is the transmitter\*\* |

  

**Takeaway.**  On the Android surface the two apps are in the **same** risk tier (direct client-side ExoPlayer fetch of a public HLS URL — mode 3). But his **web/Tizen** surface proxies the stream through his own server, rewrites the playlist, and spoofs headers to defeat origin access controls — that is restreaming (mode 5) plus evidence of intent/circumvention, the worst place to be under §2(ff)/§37 of the Copyright Act and the IT Act safe-harbor analysis. Our device-direct architecture is what makes the “I’m just showing users channels already online” argument **factually true**; his proxy makes the same sentence **false** for his web product.

**Hard rule this implies for us.**  Never add a proxy hop or header-spoofing to coax a stubborn or geo-blocked stream into playing. The moment we do, we cross from his Android tier into his web tier and forfeit the only genuinely true sentence in our legal case. A stream that only plays with spoofed headers gets **dropped, not coerced.**

# **2.**  **Product Intent — TV Appliance vs Phone+TV Hybrid**

|  |  |  |
| :-: | :-: | :-: |
|   | \*\*Ours\*\* | \*\*Theirs\*\* |
| \*\*Manifest\*\* | leanback required=true, landscape-locked, LEANBACK\\\_LAUNCHER only | leanback required=false, \*\*phone LAUNCHER + LEANBACK both\*\*, orientation unspecified, rotation configChanges |
| \*\*Touch\*\* | None | Swipe up/down to zap, on-screen mute/guide/settings buttons, tap-to-favorite, text search |
| \*\*Back button\*\* | Never exits to launcher (\\\#19) — consumed | Normal back-stack; exits app from player |
| \*\*Screen model\*\* | One screen; everything overlays live video | 3 routed screens (Player/Guide/Settings); Guide & Settings \*\*leave the video\*\* |

  

Ours is the household’s **default TV state** (boots into last-watched, can’t be backed out of). Theirs is an **app you open**, usable on a phone, with conventional navigation. Nearly every other difference flows from this.

# **3.**  **Architecture & Stack**

|  |  |  |
| :-: | :-: | :-: |
|   | \*\*Ours\*\* | \*\*Theirs\*\* |
| \*\*DI\*\* | None — plain objects, TvState passed in | \*\*Hilt\*\* throughout |
| \*\*Presentation\*\* | No ViewModels — Compose state + one TvState | \*\*MVVM\*\*: 3 ViewModels |
| \*\*Persistence\*\* | SharedPreferences (last channel + view counts) | \*\*Room\*\* (favorites + watch\\\_history) + \*\*DataStore\*\* (5 prefs) |
| \*\*JSON\*\* | org.json hand-parse with per-field defaults | \*\*kotlinx.serialization\*\* (@SerialName) |
| \*\*Navigation\*\* | None | \*\*navigation-compose\*\* + savedStateHandle |
| \*\*Images\*\* | \*\*Coil\*\* (logos everywhere) | None — text-only UI, \*\*no logo field in model\*\* |
| \*\*Extra dependencies\*\* | Wiom DS, CleverTap, Firebase Crashlytics | material-icons-extended, media3-session (declared, unused) |
| \*\*minSdk / Kotlin / Media3\*\* | 28 / 2.0.21 / 1.4.1 | 26 / 2.1.0 / 1.5.1 |

  

Theirs is textbook modern-Android (Hilt + MVVM + Room + Nav) — more layered, easier to onboard a hired developer. Ours is roughly 40% less code, with the complexity budget spent inside playback instead of architecture.

# **4.**  **Playback Engineering & Zap Speed**

## **Theirs (PlayerManager, 402-LOC PlayerScreen)**

Default ExoPlayer load control; HLS with chunkless prep; 10s timeouts; a 200ms fake “static” effect before every tune; clean state machine (IDLE / LOADING / PLAYING / RETRYING / UNAVAILABLE / NO\_NETWORK).

## **Ours (PlayerScreen + ChannelPreloader + StreamCache + QoeLog)**

  - **Fast-start load control** — playback begins at 1s of buffer (vs 2.5s default).
  - **ABR floor-start** — every zap forces lowest bitrate, released only when buffer ≥ 10s AND bandwidth ≥ 4× current bitrate (smoothness beats resolution).
  - **Adjacent-channel prefetch** — background loop replicates Media3’s live-join segment choice, pre-caches init + key + 3 segments of ▲▼ neighbours into a 64MB LRU SimpleCache; bandwidth-gated, direction-biased, per-URL failure backoff; playlists always from network, cache write-disabled on the playback path.
  - **Zap acknowledgment** — instant black cut + destination channel bug on keypress; spinner only if genuinely slow (\>2.5s); first-frame attribution verified against media-item id.
  - TextureView (not PlayerView/SurfaceView) so Compose overlays composite over video.

Theirs treats switching as “load a new URL.” Ours treats the zap as the product’s core feel (\~400 LOC on it).

# **5.**  **Failure Handling — Never-Strand vs Ask-the-User**

|  |  |  |
| :-: | :-: | :-: |
| \*\*Failure\*\* | \*\*Ours\*\* | \*\*Theirs\*\* |
| \*\*Stream error\*\* | \*\*Auto-skip to next\*\* (stream\\\_dead telemetry, deadStreak cap) | Retry 3× with countdown (2/4/8s) → “Channel Unavailable, press CH+” overlay; user must act |
| \*\*Unsupported format\*\* | Auto-skip | Immediate UNAVAILABLE, no retry (correctly non-retryable) |
| \*\*Stall\*\* | 12s watchdog → dead → skip | None — can buffer forever |
| \*\*Network loss\*\* | Calm bilingual “Reconnecting” (framed as not an error); on restore, re-prepare with floor-start | NO\\\_NETWORK overlay, pause; auto-replay on restore (their NetworkMonitor watches capability changes too — more thorough than ours) |

  

**Bug in theirs.**  The retry countdown never decrements — startRetryCountdown mutates a local var but never writes back to the retryInfo StateFlow the overlay reads → frozen “Retrying in 8s…”. Also PlayerManager is @Singleton but release() is called from onCleared() — muddled lifecycle ownership.

# **6.**  **Personalization — Implicit/Household vs Explicit/Individual**

**Theirs:** manual favorites (star), watch history (frequency + recency), user-declared preferred languages & categories, a PersonalizationEngine (fav +1000, lang +500, cat +300, freq ≤200, recency ≤200), Guide sections Favorites / Recently Watched / For You / All, plus 3 sort modes.

**Ours:** no settings, no manual controls; a “view” counts only after a **15-second dwell** (surf-past filtered); the top 8 auto-build a “♥ मेरे चैनल” rail. Matches decision \#4/\#11 (shared household TV, nobody opens settings).

**Their scoring quirk.**  With no preferences set, every channel gets a +800 baseline → “For You” ≈ watch history until configured.

# **7.**  **Channel Catalog & Content Operations**

|  |  |  |
| :-: | :-: | :-: |
|   | \*\*Ours (55 channels)\*\* | \*\*Theirs (100 channels)\*\* |
| \*\*Schema\*\* | id, name, logoUrl, genre, order, streamUrl, format, classification, enabled | ch (1–100), name, cat, lang, url |
| \*\*Source\*\* | \*\*Remote-hosted config, polled every 5 min\*\*, last-good cached, asset fallback | \*\*Bundled asset only\*\* — lineup change = new APK |
| \*\*Kill-switch\*\* | enabled:false pulls a channel from every TV in minutes; live lineup updates without restarting playback | None |
| \*\*Legal posture\*\* | classification field (all amber) — rights tracking is first-class | Absent |
| \*\*Identity\*\* | String ids; sorted genre → order → name | Positional 1–100; assumes contiguous numbers |
| \*\*Language\*\* | No language field (Hindi-skewed) | \*\*First-class\*\*: 11 languages, 25 Regional / 9 Telugu / 7 Tamil |
| \*\*Overlap\*\* | 21 names / 18 stream URLs shared between the two catalogs | — |

  

Theirs is **wider** (real multi-language). Ours is **operable** (remote update, kill-switch, classification). Theirs cannot react if a stream dies or a rights issue surfaces post-install.

# **8.**  **Discovery UX**

|  |  |  |
| :-: | :-: | :-: |
|   | \*\*Ours\*\* | \*\*Theirs\*\* |
| \*\*Entry\*\* | OK → translucent \*\*logo grid over live video\*\* (video keeps playing) | ENTER → full-screen Guide (video gone) |
| \*\*Layout\*\* | Genre rails, D-pad focus scale + border, focus on current channel | Sectioned text list + category FilterChips |
| \*\*Search\*\* | None | Text search (name/cat/lang) |
| \*\*Direct tune\*\* | None | \*\*Digit entry 0–9, 1.2s auto-confirm, number OSD\*\* |
| \*\*Visuals\*\* | Logo tiles (Coil) + colored/initial fallback, cache pre-warmed | Text-only, no imagery |
| \*\*Channel banner\*\* | Logo chip + name + genre + Hindi hint, until 3.5s after picture | Number + name + lang·cat, 3s |
| \*\*Extras\*\* | — | Mute toggle |

  

Their digit-entry + channel numbers is a genuinely cable-native idiom ours lacks. Our grid keeps the user “on TV” while browsing.

# **9.**  **Telemetry & Observability**

  - **Ours:** CleverTap (device-identity tv\_\<ANDROID\_ID\>, no login) — app\_open, channel\_switch (method), channel\_view (duration, flushed on exit), ttff (prefetch-warm split), stall, stream\_dead, grid\_open, reconnect\_\*, config\_update; Firebase Crashlytics; structured WiomQoE logcat (dropped frames, format switches, bandwidth, prefetch gate).
  - **Theirs: zero.** No analytics, no crash reporting, no QoE, no structured logging. For a learning pilot this is the most consequential gap in their build.

# **10.**  **Brand, Language, Design System**

  - **Ours:** Wiom DS (wiom-ds-android) + hand-built dark TV layer; bundled Noto Sans (no Google-Fonts dependency on cheap AOSP TVs); official wordmark in splash/grid/reconnect; Hindi-first bilingual copy; branded boot splash.
  - **Theirs:** generic Material3 dark + orange \#FF6B00; English-only; no brand assets, no splash; “Indian TV” label.

# **11.**  **Secrets, Release Engineering, Ops**

|  |  |  |
| :-: | :-: | :-: |
|   | \*\*Ours\*\* | \*\*Theirs\*\* |
| \*\*Secrets\*\* | CleverTap keys + config endpoint from gitignored local.properties → manifest/BuildConfig | None needed (nothing remote) |
| \*\*Release build\*\* | R8 minify + resource shrink (\\\~75MB “light app”), lint workaround, debug-signed for pilot | isMinifyEnabled=false, defaults |
| \*\*Versioning\*\* | versionCode 3, “1.1-pilot”, slice-annotated | versionCode 1, “1.0.0” |
| \*\*Keep-screen-on\*\* | Not set (TV display stays on) | FLAG\\\_KEEP\\\_SCREEN\\\_ON + edge-to-edge immersive (phone concerns) |

# **12.**  **Platform Reach**

  - **Ours:** Android TV only.
  - **Theirs:** Android + **Node web player** (PM2 ecosystem.config.js, HLS.js browser player) + **Samsung Tizen app** (tizen/, bundled hls.min.js). Many low-cost Indian TVs are Tizen/WebOS where our Android build can’t go — a real distribution-surface advantage (legal exposure of the web surface aside, see Section 1).

# **Synthesis**

The two apps answer different questions. **Theirs:** “how broad can a personal live-TV app be?” — 100 channels, 11 languages, search, favorites, settings, three platforms, clean conventional architecture — but static content, zero telemetry, no brand, ask-the-user failure UX, no post-install operability, and a web/Tizen serving path that is legally the heaviest tier.

**Ours:** “how good can the default-TV experience be for one household?” — half the channels, zero user-facing controls, but remote-operated content with a kill-switch, zap-speed engineering, never-strand failure handling, full QoE/adoption telemetry, Wiom brand and Hindi throughout, and a device-direct serving model that keeps the legal story honest.

## **Worth stealing from theirs**

1.  Channel numbers + remote digit entry (best TV-native idiom; cheap to add).
2.  Language as a catalog facet (their Regional/Telugu/Tamil coverage is real demand data for our content track).
3.  Their NetworkMonitor capability-change handling.
4.  Catalog cross-check: 18 shared stream URLs serve as independent validation; their \~80 non-overlapping channels are a sourcing lead list.
5.  Non-retryable error classification (parse errors shouldn’t burn the auto-skip streak like transient errors do).

## **Not worth importing**

  - Hilt/MVVM/Room layering at this scale.
  - The 200ms static-effect delay before every tune.
  - Full-screen guide that leaves the video.
  - Settings/preferences surface (contradicts decisions \#4/\#11).
  - Bundled-only catalog.
  - And — **emphatically** — the stream proxy / header-spoofing / YouTube-scraping serving path (Section 1).
