# Decision framework Android App  

# Zero-Based TV — Decision Framework

**Business line, not a project.** "Zero-based" = we re-derive every *decision* from the objective — and the codebase too: **Phase 1 is greenfield** (no inherited app). We keep prior *learnings*, not prior code. This doc is the **source of truth**: every element traces to a user/operator job and a ranked objective. Decision status — **Decided** (grounded) · **Assumed** (hypothesis + validation trigger) · **Open** (still owed).

  

## Layer 0 — Reference (everything below points here)

### 0.0 The Objective

**Make Wiom the default entertainment access layer for first-time-internet households across Bharat.**

  

  - **Wedge:** linear TV. **Prize:** the platform — a distribution surface we can later sell multiple services/content on, and a relationship with the "dreamers" our pipes don't physically reach yet.
  - **New business line**, not a sweetener for the internet business.
  - The benefit to Wiom's internet business (selling "Recharge-wala Ghar ka Net" / RWGKN, WiFi stickiness) is **real but explicitly secondary**. We do **not** optimize Phase 1 for it. It is a guardrail metric, never a target.
  - **Not bundled, not gated.** "Bundled" would mean merely sweetening the deal for an existing Wiom user. We reject that. There is **no gating to a Wiom plan**. The goal is to be the household's **primary** entertainment.

### 0.0a Phase 1 (25 days)

|  |  |
| :-: | :-: |
| \*\*Rule\*\* | \*\*Meaning\*\* |
| \*\*Coverage\*\* | Wiom-coverage households only |
| \*\*No acquisition spend\*\* | We do not spend to acquire users in Phase 1 |
| \*\*Build on existing\*\* | Reuse prior \*learnings\* (not the app — \*\*greenfield\*\*); don't reinvent the thinking |
| \*\*Solo + agents\*\* | One-founder company; built by you with agents → ruthless scope, automate, reuse |
| \*\*Beachhead\*\* | The slice already in our base: \*\*Post-WiFi + Connected-TV\*\* households (ship onto the smart TV they already own — no hardware, no marketing) |

### 0.1 Primary JTBD (the household)

**When** anyone in my home wants to watch something, **I want to** turn on the screen and immediately find something worth watching — in my language, no juggling apps/logins, no extra cost — **so** Wiom becomes the screen we just default to.

  

"Default to" encodes the objective: primary entertainment, not an occasional extra. Every element JTBD must ladder up to this.

### 0.2 Audience — the 2×2 (all quadrants valued **equally**)

|  |  |  |
| :-: | :-: | :-: |
|   | \*\*Connected TV\*\* | \*\*No Connected TV\*\* |
| \*\*Post-WiFi\*\* | Has WiFi + Smart TV — \*\*★ Phase 1 beachhead\*\* | Has WiFi, no connected TV |
| \*\*Pre-WiFi\*\* | Cable/DTH TV, no WiFi | Mobile-only, no WiFi, no TV |

  

  - The objective values a **Pre-WiFi / No-TV** person **equally** to a **Post-WiFi / Connected-TV** person. We are **not** optimizing for the unconnected household alone — and not for the connected one either.
  - Phase 1 *reaches* the ★ quadrant first only because it's the zero-cost, zero-hardware path inside our base. The product vision is the whole grid; later phases add a device/path to reach the other three.

### 0.3 Objectives (ranked — top is the tiebreaker)

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*ID\*\* | \*\*Objective\*\* | \*\*How measured (target = placeholder)\*\* | \*\*Why it ranks here\*\* |
| \*\*NSM\*\* | \*\*Default-ness\*\* — Wiom TV is the household's primary screen | Daily-active households · watch-time per household · \*\*sessions per household\*\* | The literal objective: become the default entertainment access layer |
| O1 | Frictionless, \*\*ungated\*\* access | Power-on → playing; TTFF; first-run completion; zero plan-gating | Anything that feels like a gated perk kills "primary," not "bonus" |
| O2 | The linear-TV wedge lands | Time/clicks home → watching; "always something on" usage | Wedge must feel like effortless lean-back TV (cable/DTH replacement) |
| O3 | Reliable playback (QoE) | Rebuffer ratio, error rate, crash-free sessions on real Wiom lines | Trust dies on the first stutter |
| O4 | \*\*Platform-readiness\*\* (the prize) | Time-to-add a new service/content surface; quadrant-reach optionality | Linear TV is the wedge; the surface is the asset we're really building |
| O5 | \*\*Zero-acq-spend reach\*\* | Activation rate within existing Wiom base; cost per activated household ≈ 0 | Phase 1 distribution must ride the base, not marketing |
| — | \*Guardrail (tracked,\* \*\*\*not\*\*\* \*optimized):\* internet-business halo | RWGKN sell-through, WiFi churn delta | Real benefit — but \*\*never\*\* trade NSM/O1 for it |

  

**Tiebreak:** higher rank wins. **Hard rule:** never sacrifice default-ness / ungated primary-entertainment value to chase the internet-business halo.

### 0.4 Constraints (bound every decision)

|  |  |  |
| :-: | :-: | :-: |
| \*\*ID\*\* | \*\*Constraint\*\* | \*\*Basis\*\* |
| C1 | \*\*25 days to Phase 1\*\* | Decided |
| C2 | Solo founder + agents → ruthless scope, automate, reuse | Decided |
| C3 | No acquisition spend in Phase 1 | Decided |
| C4 | Build on existing \*\*learnings\*\* (NN\\\#1) — but \*\*greenfield the app\*\* (zero-base the codebase to fit objectives; no inherited baggage) | Decided |
| C5 | Phase 1 reach = Wiom-coverage households; cleanest = WiFi + connected TV they already own | Decided |
| C6 | Ungated — never gated/bundled to a Wiom plan | Decided |
| C7 | Low-end hardware + variable/intermittent network; degrade gracefully | Decided |
| C8 | Hindi-first + regional, low-literacy-safe, true 10-ft / D-pad UI | Decided |
| C9 | Compliance: DPDP Act, content DRM/rights, child safety | Decided |

  

## 0.5 Non-negotiables

1.  **JTBD first, even though insights exist.** Every design/build decision traces to a customer job. Existing insights are the start, not the end. Agents help *synthesize*; **you** do the customer conversations and judgment.
2.  **You build it; agents are your hands.** One-founder-company frame. **You do:** product judgment, JTBD discovery + customer conversations, content licensing/partnership negotiation, adoption-data interpretation, review + ship agent output. **Agents do:** code across all surfaces (phone/TV/web), UI/UX under your direction, test harnesses/deploy/telemetry, content-stream integration, UX iteration. **Failure modes (forbidden):** (a) writing specs and waiting on Wiom tech teams — *already failed once for this product*; (b) hiring contractors as the first move — agents first, humans only where agents genuinely can't; (c) hand-coding out of habit — if it can be agent-built, it must be.
3.  **Optimize for proof, not polish.** No enterprise roadmap, no heavy process, no staged-release theatre. Ugly, narrow, embarrassing is fine **if a real household — including its least tech-comfortable member (e.g. an elderly first-timer) — can use the linear-TV experience.** Ship what moves adoption fastest. → **Phase 1 done-definition.**
4.  **One-way flow with Wiom OS.** Wiom's OS (State Machine, Customer Health, Metric Architecture) is WIP. This line **informs** Wiom's thinking (PayG entertainment economics, multi-product platform mechanics, Bharat viewing signals); it does **not** derive from Wiom's WIP OS. Use Wiom assets that help you ship faster; work around blockers and flag them as feedback. Platform-extending, not standalone.

## 0.6 Legal classification — locked in Phase 0

Wiom operates under **PM-WANI** with VC investors and a CSP partner network. Distributing flagrantly illegal content **via Wiom's brand and platform** is existential — regulatory standing, partner relationships, and investor confidence at once. Pick one classification, declare it, don't drift. (Note: "tier-3 OTT players" = small/regional OTT companies — a *partnership* path, not the Red zone.)

  

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*Class\*\* | \*\*Content sources\*\* | \*\*Risk\*\* | \*\*Acceptable?\*\* |
| \*\*Green — fully licensed\*\* | Doordarshan/Prasar Bharati FTA + direct deals with smaller channels + AVoD aggregator licenses (MX Player, Watcho) | Zero legal risk; narrower catalog | \*\*Yes — default\*\* |
| \*\*Amber — grey but defensible\*\* | Public non-paywalled streams; embed-permitted streams; regulatory-undefined zones; tier-3 (small/regional) OTT partnerships | Low–medium; broader catalog | \*\*Yes — with explicit per-source justification\*\* |
| \*\*Red — flagrantly illegal\*\* | Scraped premium content, pirated streams, paywall bypass | Existential | \*\*No — off limits\*\* |

  

**Decision (Phase 0 lock — for speed + insight):**

  

  - **Declared classification = Green** is the default and the long-term destination.
  - **Amber is ACTIVE in Phase 1 (short-term)**, on the branded in-home product — to move fast and gather real-world insight while we build the Green catalog. Governed by the discipline below so Amber never decays into Red.
  - **Per-source justification register** — every Amber source logged with: owner, why it's defensible, and a takedown response. *"Not behind a paywall" ≠ "licensed to redistribute" — judge each source.*
  - **Red stays off-limits** even with Amber on: scraped premium content, pirated streams, and paywall-bypass are Red, not Amber — never shipped.
  - **Content kill-switch** — every Amber source must be remotely pullable (ties to remote config / §Layer-1 \#7) so a problem source is dark within minutes, not a release cycle.
  - **Contain + time-box** — bound Amber exposure (pilot cohort, not the full base, while it's the riskiest) and set a **hard exit trigger to Green** before broad scale, monetization, or Phase 2.

  

**Why Amber now:** short-term, for speed + insight while the Green catalog is built — not sustainable long-term, so the exit-to-Green trigger and discipline above bound it. **Risk noted (so it's never forgotten):** the existential exposure is specifically on-brand-in-home — which is why the per-source register, kill-switch, and containment are mandatory, not optional.

## 0.7 Phase 1 — Definition of Done

The bar for "Phase 1 shipped." **Surface = TV** (linear-TV wedge; "up/down surfing" = remote channel-surf on the connected TV they already own). Proof, not polish (NN\#3). Every deliverable traces to Layer 0.

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Deliverable\*\* | \*\*Traces to\*\* | \*\*Notes / dependency\*\* |
| Working product on TV — \*\*channel list + channel-surf (up/down feel) + full-screen playback\*\* | O2 wedge · O1 · elements \\\#5, \\\#6, \\\#11 | The core loop. "Up/down feel" = cable-replacement surfing |
| \*\*Live channels in declared classification — start 20–40, don't chase 100\*\* | O2 · elements \\\#2, \\\#9 | Green default + Amber active (§0.6); \*\*kill-switch + per-source register must be live before any Amber channel ships.\*\* Breadth is not the goal |
| \*\*Onboarding so anyone in the household can self-start — tested with a REAL household\*\* | O1 · NN\\\#1, NN\\\#3 · element \\\#10 | External validation. The \*\*binding deliverable\*\* — must work for the household's least tech-comfortable member (e.g. an elderly first-timer) |
| \*\*First tier-3 OTT partnership conversation initiated\*\* | O4 (platform/breadth) · element \\\#2 | A \*\*you-do\*\* (NN\\\#2: licensing/negotiation is yours, not an agent's) |
| \*\*Crash + latency telemetry built in from the start\*\* | O3 · O6 · element \\\#7 | Non-negotiable from the beginning; also powers the Amber kill-switch |
| \*\*Internal household usage test (you + family)\*\* | NN\\\#3 (proof/dogfood) | Continuous dogfood |

  

**Build sequence (dependency order, not dates):** telemetry + Amber kill-switch first → working core loop on TV + 20–40 channels → real-household onboarding test → internal family dogfood. The partnership conversation runs in parallel (it's a you-do, off the build path).

  

**What this list forces into Phase 1 scope (was "later"):** the onboarding element (\#10), the channel-surf interaction (\#11), and the Amber content kill-switch (remote-config slice of \#7). These are no longer deferrable.

  

## Layer 1 — Frozen Decision Bank (frozen 2026-06-08)

The authoritative bank, in the agreed schema. The **Basis** column is the status: **Decided** (locked) · **Assumed** (locked direction — confirm in the existing-app audit / content sourcing) · **Open**.

  

Schema: **Element → JTBD (User/Operator) → Objective(s) → Learning so far (source) → Decision → Basis → Rationale / alts rejected → Reversibility**

  

|  |  |  |  |  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| \*\*\\\#\*\* | \*\*Element\*\* | \*\*JTBD\*\* | \*\*Obj\*\* | \*\*Learning so far (source)\*\* | \*\*Decision\*\* | \*\*Basis\*\* | \*\*Rationale / alts rejected\*\* | \*\*Reversibility\*\* |
| 1 | \*\*Platform / distribution (Phase 1)\*\* | \*(User)\* "When my family gets WiFi for the first time, I want a simple, familiar way to make it useful in our daily life, so the investment feels worthwhile." | O1·O5·NSM | Pre-WiFi households coming to Wiom have used \*\*Cable TV for the longest time\*\* — the TV is their existing entertainment habit and cable is the familiar mental model; meeting them there is how new WiFi proves its worth. \*(Verify: smart-TV penetration + OS mix in the base — sizes the beachhead.)\* | \*\*Phase 1: deliver on the TV the household already watches\*\* (sideloaded / CSP-assisted install onto their Android-based smart TV). Own-STB + non-Android TVs deferred | \*\*Decided\*\* | TV is the household's existing, familiar entertainment surface (lifelong cable users) → fastest path to "WiFi feels worthwhile." Self-install is impossible for this persona → CSP-assisted. \*\*STB-vs-no-STB is a distribution mechanic, not the rationale\*\* | Two-way |
| 2 | \*\*Content posture\*\* | \*(User)\* "I want channels that feel familiar to what I watched on TV — the same kind of entertainment and genres — so it feels like my TV, not something new." | NSM·O2 | Lifelong cable households recognize \*\*genres\*\*, not catalogs. We often can't license the exact premium channels (Red), but we \*\*can match the genre\*\* (Hindi serials, movies, music, devotional, regional, news) via Green/Amber | \*\*Wedge = 20–40 linear channels chosen to mirror the household's familiar TV genres, weighted to entertainment.\*\* Familiarity of genre/experience over exact-channel or count. On-demand/premium later | \*\*Decided\*\* (wedge) / Open (genre weighting) | Rejected VOD-first (not their habit), breadth-first (count ≠ familiarity), and exact-premium-channel matching (unlicensable → Red; match the genre, not the locked brand) | Two-way |
| 3 | \*\*Monetization\*\* | \*(User)\* "We already pay for the WiFi — I want it to unlock something new and familiar like TV, so that spend does more for us." | O1·O4·NSM | The WiFi is \*\*already paid for\*\*; for a pre-WiFi household, TV-on-internet is a \*\*new use case and the entry point\*\* to experiencing OTT. Free Phase 1 keeps that on-ramp wide — and the on-ramp is the platform prize | \*\*Phase 1: free + ungated. No paywall.\*\* Wiom TV rides the already-paid WiFi as a new use case; monetization is a later platform play | \*\*Decided\*\* (Phase 1) | The WiFi is already paid → TV is the value unlock / entry point, not a thing to bill separately; charging would block the on-ramp and reintroduce cable-bill friction. Rejected paid packs / gating | Two-way |
| 4 | \*\*Entitlement / access\*\* | \*(User)\* "When my home gets Wiom, the TV is just there and ready — like cable was. Nothing to log into." | O1·NSM | Login is the \\\#1 TV-app drop-off. Phase 1 = Wiom WiFi homes → the TV sits on \*\*Wiom's own network\*\*, so we may resolve the subscriber from the connection (server-side whoami / CPE mapping) with zero user action. \*Caveats: CGNAT shared IPs aren't unique; Android limits local MAC/ARP reads; needs a Wiom network-team hook (NN\\\#4) + a DPDP basis (C9)\* | \*\*No user login, ever. Progressive, non-blocking identity:\*\* (1) network-based subscriber lookup on Wiom WiFi, (2) CSP-install tag, (3) \*\*device-only fallback\*\*. Ship Phase 1 on device-only so identity never gates the build; add network household-ID as an enhancement once Wiom network confirms | \*\*Decided\*\* (no-login) / \*\*Assumed\*\* (network-ID mechanism — pending Wiom network team) | Cable had no login (familiar bar); owning the pipe lets us ID the home invisibly — but per NN\\\#4 we don't wait on Wiom tech, device-only ships regardless. Rejected OTP/app-store login, plan-gating (C6) | Two-way |
| 5 | \*\*Home / IA (10-ft)\*\* | \*(User)\* "When I switch on, my TV is already playing — like it never left — and I can pull up the channels if I want." | NSM·O2 | A home screen is friction; cable just plays. Cable resumes the \*\*last-watched channel\*\* (familiar). First-ever boot has no history → derive from objective | \*\*No home screen. Boots into the last-watched channel\*\* (cable-like). On first-ever boot, land on the \*\*region/language-matched highest-engagement channel\*\* (remote-config, telemetry-tuned). \*\*Logo grid + Favorites overlay\*\* \*\*\*on top\*\*\* \*\*of live video\*\*, never replacing it | \*\*Decided\*\* (frozen F6) | Derived from objective: O2/familiarity → resume-last (cable behavior); NSM/default-entertainment → first impression maximizes "start watching or start surfing" → highest-pull channel, not a fixed news channel. Rejected hardcoded default, setup screen, blank, full-screen menus that pause playback | Two-way |
| 6 | \*\*Playback / TTFF + channel-switch\*\* | \*(User)\* "When I change channels it switches fast like my old TV and never stutters, so it feels like real TV." | O1·O3·NSM | Cable switches in \\\<1s; internet has inherent latency → \*\*channel-switch time, not just initial TTFF, is the make-or-break metric\*\*. On weak lines + cheap TVs, smoothness \\\> sharpness | Media3/ExoPlayer; \*\*ABR biased to avoid rebuffering over resolution\*\*; fast-start (low initial buffer); \*\*instant visual feedback on switch\*\* (logo/last-frame + spinner); \*\*adaptive pre-buffering of adjacent channels only when bandwidth headroom exists\*\*; budgets for TTFF + \*\*channel-switch time\*\* + rebuffer ratio | \*\*Assumed\*\* — tune on real device + network | Derived from objective: familiarity = cable's instant switch; default-entertainment needs surfing to feel fast; C7 → smoothness beats resolution. Rejected off-the-shelf default ABR (untuned) and always-pre-buffer (hurts low-bw active stream) | Two-way (tunable) |
| 7 | \*\*Observability / QoE\*\* | \*(Operator)\* "I can see, remotely, both whether the app is becoming a household's default \*and\* whether any install or channel is misbehaving — and fix it before the user notices." | O3·O6 | Proof-first → telemetry must measure the NSM + the decisions we're validating, and trigger the Amber kill-switch. Unit = \*\*the app install on the household's own TV (no STB in Phase 1)\*\*; CleverTap already in use (C5) | \*\*Two-layer, day one: (a) adoption\*\* (CleverTap: DAU-households, session length, watch time, channel popularity, surf depth) → measures NSM + tunes \\\#2/\\\#5/\\\#10; \*\*(b) QoE/reliability\*\* (custom + Crashlytics: TTFF, channel-switch, rebuffer, errors, crash-free) → measures O3 + \*\*fires the Amber kill-switch\*\*. Privacy-minimal (C9) | \*\*Decided\*\* | Designed around the objective + decisions to validate (proof scorecard) + kill-switch trigger; rejected generic post-launch analytics | Two-way |
| 8 | \*\*Platform extensibility\*\* | \*(Operator)\* "When we want to add a new service/content surface, the app already supports it, so we ship in days not months." | O4 | The prize is the surface; but real extensibility for unvalidated services is polish (NN\\\#3) → buy it \*\*only at the one-way doors\*\* | \*\*Phase 1 buys extensibility only at one-way doors:\*\* content/shell separation + a config-driven, \*\*not-channel-hardcoded\*\* content model (mostly free via F14). \*\*Defer\*\* actual second surfaces (VOD/commerce/other), plugin frameworks, multi-tenant until a use case is validated | \*\*Decided\*\* | Derived from O4 vs NN\\\#3: keep the cheap structural doors open; building real extensibility now is polish. Rejected both single-purpose linear-only (forecloses prize) and full-platform-now (over-engineering) | One-way-ish (architecture) |
| 9 | \*\*Content legality / sourcing\*\* | \*(Operator)\* "When we put content on Wiom's brand in someone's home, it must never put Wiom's standing at risk, so the platform survives." | NSM·O4 | Amber is a \*\*short-term, insight-gathering play\*\* for speed; Green is the destination. Sourcing serves the \\\#2 genre mix (Green-first per genre, Amber only to fill gaps). Discipline keeps Amber from decaying into Red (§0.6) | \*\*Phase 1 = Green default + Amber ACTIVE (short-term, for insight)\*\* on the branded product, governed by: per-source register / channel catalog, content kill-switch, contain + time-box, hard exit-to-Green. \*\*Red never.\*\* Sourcing maps to the familiar genres. \*\*Content discovery is an agentic internet search\*\* — agents find candidate streams per genre and classify each Green/Amber (with source + justification) into channel\\\_catalog.md, \*\*never Red\*\*; the \*\*founder approves legality + handles any licensing/partnership (NN\\\#2)\*\*. Nothing goes live until approved | \*\*Decided in Phase 0\*\* — Amber short-term, for speed + insight | Amber buys breadth + real-world insight fast while we build the Green catalog; bounded by register + kill-switch + exit-to-Green. Not sustainable long-term → migrate to Green | One-way (reputational) — mitigated by kill-switch + register + containment |

  

| 10 | **Onboarding (first-time household, zero-setup)** | *(User)* "We didn't set anything up — anyone at home can sit down and the TV is already showing something, and we change channels ourselves." | O1·NSM | Onboarding **dissolves** into \#1 (CSP installs) + \#4 (no login) + \#5 (boots into a playing channel) → the household does nothing. Design to the **least tech-comfortable member** so it works for everyone | **No user onboarding flow.** CSP installs + binds + leaves it playing (operator-side); user-side = one dismissable Hindi hint ("▲▼ चैनल बदलें") over live video. Success = **anyone in the household — including its least tech-comfortable member — can surf and land on something** | **Decided** (design) — confirm in the real-household test | Built for the **household**, not a single persona; the hardest-case member (e.g. an elderly first-timer) is a design stress-test, not the target. Complexity absorbed by the CSP, not the user (NN\#3); rejected app-store/OTP setup, multi-step account, wizards | Two-way | | 11 | **Channel-surf + jump UX (no number pad)** | *(User)* "When I press up/down the channel just changes like my old TV; and when I want a channel I already remember, I jump straight to it — my remote has no number keys." | O2·NSM·O1 | Wedge = cable-replacement; **most remotes have NO number pad** → numeric entry is out; low-literacy / first-time viewers recognize channels by **logo** (recognition \> recall). **Stable order = position memory; genre grouping invites surf-discovery (\#7)** | ▲▼ = instant sequential surf through a **stable, genre-grouped** lineup; **OK → genre-organized channel logo grid overlay** (on live video, per \#5) to jump by recognizing the logo; **"मेरे चैनल" auto-built from viewing** (no manual curation); voice optional if remote has a mic | **Decided** (design) — confirm in household test | Stable order = cable position-memory; genre grouping invites surf-discovery; auto-favorites = zero effort for the persona. Rejected numeric keypad, on-screen numpad, EPG-first, manual-pin-first, unordered lineup | Two-way |

  

| 12 | **Language** | *(User)* "When I watch, it's in my language and the few words on screen make sense, so it feels made for me." | C8·O1·NSM | For low literacy, **removing text beats translating it** — logos/icons/color/position carry meaning. Regional channels carry their own language (live TV, nothing to translate) | **Content: Hindi-primary + regional channels in-language.** **Interface: text-minimal** — logos/icons/color/position carry meaning; the few unavoidable words Hindi-first with English alongside | **Decided** (frozen F5) | Removing text beats translating it; bilingual only where words are unavoidable. Rejected text-heavy UI, English-first, single-regional-first, auto-by-region | Two-way | | 13 | **Build & ship workflow** | *(Operator)* "When agents produce code, it lands in one place I can review and ship, so I stay the bottleneck of judgment, not typing." | NN\#2 | Proof-first → **"done" = works on a real TV, not "builds green"**; remote config keeps content off the release path | Fresh repo; .env (stream URLs, telemetry keys, config endpoint); **remote JSON config for channels + kill-switch (no rebuild)**; agents build → install on a **reference low-end Android TV + emulator** → **founder reviews on-device behavior** → sideload to pilot. Minimal CI | **Decided** (frozen F18) | "Done = works on the real TV" (NN\#3); remote config keeps content/kill-switch off the release path; founder reviews behavior, agents type. Rejected spec-and-wait (failed once), contractors-first, hand-coding, heavy CI/CD | Two-way |

  

| 14 | **Reuse vs greenfield** | *(Operator)* "When I start building, I build clean to our objectives — no inherited baggage." | C1·NN\#2·NN\#1 | The old app carries its own assumptions/bias; reusing it risks re-importing them and re-creating the Wiom-tech dependency that failed once | **Greenfield.** Zero-base the build to fit our objectives; **keep the customer** ***learnings*** **(NN\#1), discard the old codebase/design** | **Decided** | Founder call: avoid the old project's baggage/bias/assumptions; greenfield also satisfies NN\#2 (independently buildable by us + agents). **Existing-app audit no longer gates the build** | One-way-ish (foundational) | | 15 | **Tech stack** | *(Operator)* "A stack that plays video well on cheap TVs, so playback is reliable." | O3·C7 | Greenfield (\#14) → free to pick the best stack for low-end TV playback, no inherited constraint | **Native Android (Kotlin + Media3/ExoPlayer)** | **Decided** | Native = best low-end playback/TTFF control (O3, \#6); greenfield removes any inherited-stack constraint. Rejected Flutter/RN/web-on-TV (less playback control on low-end) | One-way-ish (foundational) | | 16 | **Dead-stream handling** | *(User)* "When a channel won't play, the TV just moves on like cable did — it never feels broken." | O3·NSM | Public FTA/Amber streams fail constantly; a dead channel reads as "app broken" | Detect stalled/failed stream (timeout/error) → **auto-skip to next working channel**; brief unobtrusive notice; log stream\_dead (feeds kill-switch) | **Decided** | Cable-like (dead channels skipped); never strand on a black screen. Rejected hard error, leaving user on a dead channel | Two-way | | 17 | **Network-loss / reconnect** | *(User)* "When the internet hiccups, the TV waits calmly and comes back on its own." | O3·C7 | Wiom lines reboot/drop mid-evening (C7) | Detect offline → calm **"reconnecting…"** state (not an error) → **auto-resume last channel** on reconnect; backoff retries | **Decided** | Variable Wiom networks are the norm; panic errors break trust. Rejected hard error screens, manual retry | Two-way | | 18 | **Channel config schema** | *(Operator)* "The app reads channels from one machine feed, so I add/pull channels without a rebuild." | F14·O6·\#8 | channel\_catalog.md is the human register; the app needs a machine contract | **Versioned remote JSON**: array of {id, name, logoUrl, genre, order, streamUrl, format, classification, enabled}; enabled:false = kill-switch | **Decided** | One contract drives list/order/grid/kill-switch; not-channel-hardcoded (\#8). Rejected hardcoded list, in-APK config | Two-way | | 19 | **Remote key map** | *(User)* "Every button does the obvious thing, and I never get dumped out of the TV by mistake." | O1·NN\#3·C8 | A wrong **Back** mapping strands the user on the Android launcher | ▲▼ = surf · OK = logo grid · Back = close overlay; **at full-screen, Back does NOT exit to launcher** (stay in app / confirm-exit guard) · Home = OS default | **Decided** | Don't strand the persona; minimal predictable mapping. Rejected Back-exits-to-launcher, complex multi-function keys | Two-way | | 20 | **Config refresh cadence** | *(Operator)* "When I pull a channel, it goes dark on every TV within minutes, not a release cycle." | §0.6·O6 | Kill-switch is only as fast as config propagation | Poll remote config every few minutes + on app foreground; pulled / enabled:false channels disappear next refresh | **Decided** | Bounds kill-switch latency (§0.6 mandate). Rejected config baked into APK, manual push | Two-way | | 21 | **Clear-HLS-only scope** | *(Operator)* "Phase 1 plays simple clear streams so the player stays reliable and fast to build." | O3·C1 | DRM (Widevine) adds big complexity; Green FTA/AVoD are largely clear HLS | **Phase 1 = clear (non-DRM) HLS only**; DRM-protected sources deferred; agentic search filters to clear streams | **Decided** | Simpler player, faster to proof (25-day clock). Rejected DRM in Phase 1 | Two-way (add DRM later) | | 22 | **Reference device / min-SDK** | *(Operator)* "I build against the cheap TV our households actually have, so it runs smoothly there." | C7·\#15 | Low-end Android TV is the target hardware | Target \~**Android TV 9 (API 28)**, **1GB-RAM class** reference device; verify on a real one | **Decided** — confirm exact device when procured | Build to the real low-end, not a flagship. Rejected targeting high-end TVs | Two-way | | 23 | **Telemetry event taxonomy** | *(Operator)* "I capture the few events that tell me default-ness + reliability, from day one." | \#7·O3·O6 | Proof scorecard needs a defined event set | app\_open · channel\_change · view\_start(channel,genre) · buffering(ms) · playback\_error · stream\_dead · session\_start/end(duration) · surf\_depth | **Decided** | Minimal set covering NSM + QoE + kill-switch signal. Rejected generic/over-broad analytics | Two-way | | 24 | **App auto-start + crash recovery** | *(Operator)* "The TV comes on already playing and recovers itself if it crashes, so it's truly unattended." | \#5·NN\#3·O3 | No one relaunches an app; for a true always-on appliance this matters | **PARKED for Phase 1** — auto-launch-on-boot + playback watchdog deferred; revisit before pilot scale / when unattended-reliability becomes the gap | **Parked** | Skipped now to protect the 25-day proof; kept visible so it's not forgotten (manual relaunch acceptable in the small monitored pilot) | Two-way | | 25 | **Brand: name, icon, launch screen** | *(User)* "I spot 'my TV' instantly among the apps, and it feels trustworthy — opening it just brings up the TV." | NSM·O1·§0.6 | Auto-start parked (\#24) → the **launcher icon is the Phase-1 entry point** (recognition-critical). All of it depends on the app name/brand (open) | **Method + timing locked; visuals deferred.** Placeholder icon/splash for the build; **finalize before the real-household test.** Icon = logo-first, Wiom-branded, low-literacy-recognizable; launch = minimal, fast, **dissolves straight into live video**. Agents generate options, founder picks (NN\#2) | **Decided** (method) / Open (name + visuals — due before household test) | Two-way door, off the proof path (NN\#3) → decide late; recognition-first; carries the Wiom brand into the home (§0.6). Rejected polishing brand before the app works | Two-way | | 26 | **Design language** | *(User)* "It looks like a proper TV — clean, easy to see from the sofa, and clearly 'Wiom' — so I trust it and can use it from across the room." | C8·NSM·O1·§0.6 | Design system **suggested by Ashish Agrawal (WIOM Design Head)**; authoritative repo = **abhishekgarg-wiom/wiom-ds-android** (the wiom-design-system URL 404s) — **public, Jetpack Compose, JitPack-installable**: element-first tokens (bg/text/stroke/icon.\*), **Noto Sans** (Devanagari → Hindi \#12), Material 3 Icons Rounded, **15 components**, Adoption Kit. **Mobile-first, not TV-native**; web repo (4e1-coder) = light/desktop fallback | **Adopt** **wiom-ds-android** **v2.0.0 (JitPack) as source of truth + define the 10-ft TV layer on top:** Compose-for-TV (androidx.tv) for focus/D-pad; reuse Wiom tokens/Noto Sans/icons; dark surfaces; **focus-first** (selected item glows brand accent); content-first overlay-on-video (\#5). Drop in the DS Adoption-Kit CLAUDE.md so agents follow it | **Decided** (direction) — **we have access (public repo)**; confirm dark-theme + TV-focus at integration | Use the design head's authoritative Compose system (brand consistency §0.6; our exact stack \#15) via a Gradle dep — no re-invention, no clone; adapt to TV (mobile-first ≠ TV-native) with Compose-for-TV. Rejected light/desktop web repo as primary, re-inventing tokens | Two-way | | 27 | **App identity & secrets** | *(Operator)* "The new app measures itself cleanly and never touches the live app's data or users." | NSM·O6·NN\#3 | The CleverTap keys in \~/.env are the **LIVE Play Store app's** — reusing them would pollute the proof scorecard (\#7) and could trigger the live app's production campaigns | **Fresh identity end-to-end, isolated from the live app:** NEW applicationId + NEW CleverTap project + NEW Firebase/Crashlytics project. Secrets in .env (gitignored) + google-services.json gitignored + signing keystore out of repo; commit .env.example only. CleverTap/Firebase = you-dos before Slice 3 | **Decided** | Clean measurement for the proof scorecard (\#7) + zero risk to the live app's prod data/campaigns; matches zero-base (\#14). Rejected reusing live app's projects, committing secrets | One-way-ish (identity) / Two-way (keys rotatable) |

  

**Phase 1 scope-out (NN\#3):** VOD · search · recommendations · profiles · parental controls · payments · phone/web · accounts/login — out, to protect proof-not-polish.

  

*Later phases: live/EPG, parental controls, DRM-protected sources, full backend (entitlement/catalog services), and the device path for the No-Connected-TV quadrants.* ***Parked:*** *\#24 auto-start + crash recovery.*

  

## How this drives the business line

  - **Decided** → build (acceptance criteria = the objective's measure).
  - **Assumed** → validate before building; sweat the **one-way** doors first (\#8 architecture, \#4 entitlement model).
  - **Open** → decisions still owed (catalog depth; later-phase device path).
  - Ranked objectives → draw the **Phase 1 line** at "minimum that makes Wiom TV the *default* screen for the ★ beachhead, ungated, in 25 days, zero acq spend."
  - **Guardrail:** the internet-business halo is measured, never optimized for.
