# Hub scripts

## Which pages are generated

`dashboard.html`, `scorecard.html`, `weekly.html` and `experiment2.html` are **generated —
do not hand-edit them.** Any manual change is overwritten by the next refresh.

They are rebuilt hourly by system cron on Shivank's machine (`crontab -l`, source of truth
at `~/wiom_tv/scripts/hub_crontab`). Each job extracts read-only over ssh from
`satyam.wiom.in`, re-renders locally, and commits only when the numbers actually changed.

| Page | Pipeline (in `~/wiom_tv/scripts/`, not this repo) |
|---|---|
| `dashboard.html` | `hub_users_{extract.js,render.py,template.html,refresh.sh}` |
| `scorecard.html` | `hub_scorecard_{extract.js,render.py,refresh.sh}` |
| `weekly.html` | `hub_weekly_{extract.js,render.py,template.html,refresh.sh}` + `hub_weekly_notes.json` |
| `experiment2.html` | `hub_exp2_{extract.js,render.py,refresh.sh}` |

The pipelines live outside this repo because this repo is **public** and they contain
server paths and PII-adjacent query logic.

## Why ssh and not the wiom.tv API

The public API (`/api/stats`, `/api/cohorts`) is pre-aggregated and carries known bugs:
it counts users as `COUNT(DISTINCT session_id)` (~+38% overcount vs `uid`) and sums
`duration_sec` across all events, including `playback_stall`, which writes **milliseconds**
into that column. It also has no IST calendar days and no `devices.first_seen` ledger, so
new-vs-repeating, activation and retention cannot be derived from it at all.

Correct numbers need raw `events` + `devices` rows, which is why these run over ssh.
`dashboard_replica.html` is the old API-fed page and keeps its bug banner for comparison.

## Editing the weekly scorecard's prose

`weekly.html` splits cleanly in two:

- **numbers** — recomputed every refresh, including the significance chips (two-proportion
  z for count-backed rates, Welch's t on the daily series for per-day counts and ratios,
  bootstrap CI overlap for percentiles; |z| ≥ 3 = SIGNAL, 2–3 = borderline, < 2 = noise);
- **prose** — `~/wiom_tv/scripts/hub_weekly_notes.json`, written by a human.

Edit the notes file, bump its `written_utc` and `data_through`, and the next refresh
publishes it. Each note is badged with the day it was written against, and flagged once it
predates the week currently being headlined.

## Superseded

`scorecard_daily.js` and `wow2.js` were the original one-off pulls, kept for history.
The live versions are `hub_scorecard_extract.js` and `hub_weekly_extract.js`; `wow2.js` in
particular computed only the winsorized watch variant, while the page's primary metric
excludes tunes over 4h.
