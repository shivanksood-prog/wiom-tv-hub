# June 12 : Focus next week  

**WIOM TV  ·  WEEKLY FOCUS NOTE**

**Focus for Next Week — June 12** 

From: Shivank Sood    ·    For: Satyam    ·    Purpose: *Surface the active threads and seek alignment on objective & prioritisation for next week*

  

**01 · THE OBJECTIVE WE ANCHOR TO**

## **Back to the major objective: Daily Human Hours**

Before getting into next week, let's bring the conversation back to the one number that matters:

**02 · THE ASK: FOCUS FOR NEXT WEEK**

## **All active threads, mapped by objective**

Every open thread maps to one of the three levers above. The question is not whether the threads matter — it's where the weight goes next week.

|  |
| :-: |
| \*\*QUESTION FOR SATYAM\*\*\*\*For next week, I'm doubling down on the first objective — Hours — and all aspects around it, deprioritising everything else.\*\* \*\*Hope you are on the same page?\*\* |

  

**03 · OBJECTIVE 1 — AVG HOURS**

  **PRIORITISED — NEXT WEEK'S FOCUS**  

## **Figuring out what works for people : Testing Surfaces and getting VOC**

  - **P0 ·** **Getting Wiom Net live for customers —** the new online surface; then watching analytics closely for what's working.
  - **P1 ·** **Customer calling —** doubling down on the old Wiom TV app audience; pulling insights on what's working and why people stay. Similar for Wiom Net surface.
  - **P2 ·** **Getting the zero-based app in the market —** rollout path is the open question for SD below.

  

|  |
| :-: |
| \*\*OPEN QUESTION FOR SD\*\*\*\*How do we roll out the zero-based app —\*\* manually to a selected set of customers, or to x% of consumers through the app store? Options and the trade-off are laid out in Section 07. |

  

**04 · OBJECTIVE 2 — NEW DAU**

  **DEPRIORITISED FOR NEXT WEEK**  

## **Getting new users into the funnel**

  - **Adoption —** how to ease the install of the app (mobile → TV, using the Wiom Net audience).
  - **Extending to other OS —** Samsung and other surfaces.

**05 · OBJECTIVE 3 — REPEAT DAU / SESSIONS**

  **DEPRIORITISED FOR NEXT WEEK**  

## **Getting people to come back, again and again**

  - **How does a Wiom Net customer come back again?** e.g., if he/she doesn't buy, what brings them back to watch TV?
  - **How do we get to position 1 in people's app list on TV?**

Very important questions — but to be thought through and picked later.

**06 · CONTENT PARTNERSHIP TRACK**

  **EXPLORE**  

## **Content houses — OTT tier-3 and similar**

Exploratory track — starting conversations with content houses. Not a committed thread for next week; stays in explore mode.

  

|  |
| :-: |
| \*\*OPEN QUESTION — NEED YOUR GUIDANCE HERE\*\*\*\*Honestly, this is the track where I'm most clueless\*\* — I'm relying on assumptions and what I've heard. I need your view on how to think about this track.\*\*My take:\*\* I start by making a list of content houses and begin the outreach first. Is that what you have in mind?\*\*And the harder question:\*\* as a zero-to-one app, what do we actually have to offer them — future promises, or hope? |

  

**07 · QUESTION FOR SD — ROLLOUT OPTIONS IN DETAIL**

## **How do we roll out the zero-based app?**

|  |  |  |
| :-: | :-: | :-: |
|   | \*\*Option A — Manual rollout\*\* | \*\*Option B — App store (x% of consumers)\*\* |
| \*\*What it is\*\* | Roll out manually to a selected set of customers — not through the app store. (Need to think through how we get it installed for them.) | Roll out to x% of consumers through an app store update — quick, A/B-style. |
| \*\*Upside\*\* | Fast way to check for production bugs, run data checks, and get on calls with users to understand behaviour. | Quick to execute; more data, A/B style. |
| \*\*Downside\*\* | Slower reach; install distribution has to be managed by hand. | Dependent on users updating the app; adds friction for current consumers who may not be comfortable. If something breaks, more updates → more breaks. |

  

|  |
| :-: |
| \*\*THE TRADE-OFF, PROPERLY\*\*\*\*Option A trades reach for control.\*\* Installs are slow and hand-managed, but every install is supervised — we catch production bugs early, verify the data, and can get on a call with each customer to understand behaviour before going wider.\*\*Option B trades control for scale.\*\* App-store distribution gets us more data fast, A/B style — but it depends on consumers updating the app, which adds friction for current users who may not be comfortable. And if something breaks at that scale, the fix is another forced update — each update risking another break, with no manual nudge available to manage installs.\*\*My pick : Option A\*\* |

  

**08 · UPDATES**

  

## **Wiom Net to** [**wiom.tv**](http://wiom.tv)  **:**

  - **Designed the banner —** *\[*[*link here*](https://shivanksood-prog.github.io/wiom-tv-banner-options/transition-demo.html)*\]*. Flow: **Ashish reviews/changes → Ashutosh ships.**
  - The view link will point to [**wiom.tv**](http://wiom.tv) — Marut should close the domain purchase by next week. 

## **Zero-based TV app :** 

  

1.  ## How it differs from SD's app:

  

TL;DR Higlights :  (Detailed comparison lives in its own [tab](about:blank))

  - **Legal (same):** Shivank's app is device-direct on Android — no proxy, no header spoofing — so "just showing public streams" is factually true (light gray). SD's app is the same tier on Android, but his web/Tizen server proxies, rewrites segments, spoofs headers, and scrapes YouTube — darkest gray, restreaming.
  - **Zap:** Shivank's app is engineered for speed — 1s fast-start, ABR floor-start, adjacent-channel prefetch (64MB cache), instant black-cut ack. SD's app is plain "load the URL" plus a 200ms fake static effect that *adds* delay.
  - **Failure:** Shivank's app never strands the user — auto-skip dead streams, 12s stall watchdog, calm bilingual reconnect. SD's app asks the user to act (3× retry → "Channel Unavailable"), and the retry countdown is bugged — frozen at 8s.

  

1.  ## Decision Framework : 

## TL;DR — How calls get taken :  (Detailed decisions [here](about:blank))

## **One schema for every call: Element → JTBD → Objective → Learning → Decision → Basis → Rejected alts → Reversibility. 27 rows, no exceptions.**
