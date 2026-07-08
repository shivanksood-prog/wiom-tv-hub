# Phase 1 : Next Steps  

**Wiom TV · Phase 1 · Next Steps**

*This note baselines where Wiom TV is today with zero intervention, proposes our ways of working for Phase 1, sets out a first read of the data and the power-user calls, and lays out the next plan — calling users to find the biggest need, and setting up the codebase with Claude.*

Data as of 5 June 2026 · CleverTap (in-app behaviour) + Metabase (customer/plan status).

**In brief**

  - **Baseline.** Where Wiom TV is today — still serving daily users with no changes shipped.
  - **First read of data.** What the numbers and channel behaviour say about adoption.
  - **Ways of working.** A North Star metric, and how we move from thesis to solution.
  - **Next plan.** Calling users for the biggest need; codebase with Claude; content onboarding.

**1 · Where Wiom TV is today — baseline**

Wiom TV is running with a healthy DAU. With no intervention — no changes shipped, the backend simply running — it is still serving around 64 people’s daily needs (avg DAU, last 30 days). That is the right place to start: baseline what is happening before we touch anything.

**◆ DAU — last 15 days**

|  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| \*\*Date\*\* | \*\*21/05\*\* | \*\*22/05\*\* | \*\*23/05\*\* | \*\*24/05\*\* | \*\*25/05\*\* | \*\*26/05\*\* | \*\*27/05\*\* | \*\*28/05\*\* | \*\*29/05\*\* | \*\*30/05\*\* | \*\*31/05\*\* | \*\*01/06\*\* | \*\*02/06\*\* | \*\*03/06\*\* | \*\*04/06\*\* |
| DAU | 50 | 57 | 50 | 63 | 55 | 56 | 65 | 66 | 62 | 70 | 81 | 71 | 61 | 67 | 65 |

**DAU is steady.**  \~64/day (range 50–81) with zero inorganic acquisition or product changes — a stable, self-sustaining base.

  

**◆ DAU / MAU / sessions / average viewing hours — last 30 days**

|  |  |
| :-: | :-: |
| \*\*Metric\*\* | \*\*Value\*\* |
| Avg DAU | 64 / day |
| MAU (distinct users, 30d) | 465 |
| DAU / MAU stickiness | 14% |
| Sessions per user / month | 6.5 |
| Avg viewing hours per user / month | 2.92 h |
| Avg hours per session | 27 min |

**Who showed up yesterday? (4 June 2026)**

|  |  |
| :-: | :-: |
| \*\*Metric\*\* | \*\*Value\*\* |
| Viewers (launched the app) | 65 |
| Total hours of view | 60.5 h |

**◆ Yesterday — who they are (of 54 phone-identified viewers)**

|  |  |
| :-: | :-: |
| \*\*User type\*\* | \*\*Count\*\* |
| Wiom customer — active plan | 20 |
| Wiom customer — expired / churned plan | 9 |
| Non-customer (TV-only) | 25 |

**The app holds all three segments.**  current customers, churned customers (the TV relationship outliving the broadband pipe), and non-customers (a daily-engaged broadband-conversion list).

  

**The cohort puzzle**

With no new acquisition effort, the user base could have decayed. So either new users are coming in, or old ones are being retained — the data shows both.

**◆ Monthly cohorts**

**Cohorts stabilise at \~12% after 3 months.**  a hardened loyal core — and the survivors deepen (launches and watch-time per returning user keep rising).

**2 · First read of data**

**What are people watching?**

**◆ Yesterday — channel-wise view time (top 8)**

|  |  |
| :-: | :-: |
| \*\*Channel\*\* | \*\*View hours\*\* |
| Aaj Tak | 14.1 |
| Channel Divya | 1.7 |
| Hindi Khabar | 1.3 |
| DD News | 1.2 |
| Zee News | 1.1 |
| NDTV India | 0.6 |
| Republic Bharat | 0.5 |
| Dangal TV | 0.5 |

**Aaj Tak is the anchor.**  14.1h of 60.5h (\~23% of all view time) — and it is the channel that loads when you launch the app, so there is a default-channel bias to keep in mind.

  

**What separates Retained from Churned (November cohort)**

Comparing the November cohort: those active in January who repeat-visited afterwards (retained, n=88) vs those who did not (churned, n=107) — what differs in their January behaviour.

**The story.**  Churned users were looking for content they didn’t find — they hunted, flipped, and left. Retained users got comfortable with Aaj Tak (the first channel) and the news lane, settled in, and came back. Retention here is anchoring on content that exists; churn is a failed search.

  

**◆ November cohort — what differs (January, median)**

|  |  |  |
| :-: | :-: | :-: |
| \*\*Behaviour (median)\*\* | \*\*Retained\*\* | \*\*Churned\*\* |
| View time per user | \*\*178 min\*\* | \*\*12 min (15×)\*\* |
| Launches | 5 | 1 |
| Sessions | 5 | 1 |
| News share of viewing | 50% | 36% |
| Aaj Tak dwell when they land | \*\*67 s\*\* | \*\*21 s\*\* |

**◆ Per-user — switching vs tune-ins (January)**

|  |  |  |
| :-: | :-: | :-: |
| \*\*Per user\*\* | \*\*Retained\*\* | \*\*Churned\*\* |
| Channel tune-ins per user (month) | 96 | 20 |
| Channel switches — session 1 | 22 | 27 |
| Switches per tune-in — session 1 (thrash) | \*\*2.9\*\* | \*\*3.8\*\* |
| Distinct channels per user (month, median) | 21.5 | 7 |

**Same flipping, different landing.**  Retained tune in 96×/user vs churned 20× — and churned flip more per channel that renders (3.8 vs 2.9 switches per tune-in in session 1). More searching, less settling.

**◆ First-session channels — where each group drifts after the Aaj Tak default**

|  |  |
| :-: | :-: |
| \*\*Group\*\* | \*\*Session-1 channels they tune into\*\* |
| Retained | Aaj Tak → more NEWS (NDTV, India News, IBC 24, DD News) |
| Churned | Aaj Tak → DEVOTIONAL + movie-sampling (Total Bhakti, Sanskar, Satsang, ShowBox, B4U) |

**◆ Tune-in genre share (January)**

|  |  |  |
| :-: | :-: | :-: |
| \*\*Genre\*\* | \*\*Retained\*\* | \*\*Churned\*\* |
| News | \*\*48%\*\* | \*\*35%\*\* |
| Devotional | 16% | 22% |
| Entertainment | 15% | 16% |
| Other | 21% | 27% |

**The content signal.**  Both groups start identically — same first session, same Aaj Tak landing, even identical load times (so it is NOT a buffering problem). The fork is content: retained concentrate on the news that’s there and settle; churned disperse into devotional + entertainment (ShowBox, B4U) hunting for variety the catalog can’t satisfy — and leave after one session.

**\*Currently not drawing any thesis from data alone, will understand after talking to users about what’s working well for them.**

**3 · Ways of working going forward**

**North Star metric**

**Daily Human Hours on Wiom TV  =  DAU × sessions × avg hours viewed**

**◆ North Star — computed (last 30 days, on a DAILY basis)**

|  |  |
| :-: | :-: |
| \*\*Component (daily)\*\* | \*\*Value\*\* |
| DAU (active users / day) | \\\~64 |
| Sessions per active user / day | 1.6 |
| Avg hours per session | 27 min (0.45 h) |
| \*\*→ Daily Human Hours = DAU × sessions × hrs\*\* | \*\*45 hours / day\*\* |

**\~45 human-hours of viewing every day**  (64 × 1.6 × 0.45 h ≈ 45) — with zero intervention. This is the number to grow: adoption, not installs or screens. It bakes in retention too — people who watch more are retained more.

**The operating loop**

  - Form a thesis from current data, a hunch, or customer calls.
  - Confirm it in JTBD terms with customer calls, if it didn’t already come from there.
  - Then design the solution.

**Tactical / hygiene fixes — open question**

Satyam — for tactical, hygiene-level fixes, should we quick-ship them, or arrive at them from a longer JTBD perspective first? Two examples from using the app:

  - **Broken channels.** A non-working channel lands the user on a block screen (“we’re working on it” / “check your wifi”).
  - **Static channel order.** Ideal state could be personalised (after data); for a quick next step we already have data on what is adopted more vs less or even the already inherited open on last viewed, so we can experiment with channel order to see how much juice is there.

Question: is “quick implement and check” the right default, or should even hygiene fixes pass through JTBD first?

**4 · Next plan — three parallel tracks**

**Track A — Understanding customer need**

Calling on users to surface the single biggest need — feeding the thesis loop above. Calling has started and is focused on what problem Wiom TV currently solves for. First thesis from this calling is expected by Tuesday 10 June. [Calling questions here.](https://shivanksood-prog.github.io/tat-compliance-rca/wiomtv_calling_script.html)

**Track B — Codebase with Claude (carried over from Phase 0)**

Securing the codebase is done\!   
Next: figure out what small changes do to the stability of the app — can Claude handle changes inside human-written code well, especially on TV? Going forward with a positive thesis: learn whether we can reliably ship to the current codebase, or whether a different architecture is required.

**Track C — Understanding content onboarding**

  - Are there similar FTA channels we can onboard?
  - Seeing that retention is driven by news watchers, select one genre and double down on it.
  - Look into prospective Tier-3 OTT partnerships to start conversations soon.

**5 · Open questions to align on**

  - Hygiene fixes — ship now or JTBD-first? Broken-channel screen and channel order.
  - North Star — sign-off on Daily Human Hours = DAU × sessions × avg hours viewed (currently \~45 hrs/day).
  - Anything else to put on the table for the start of this phase.
