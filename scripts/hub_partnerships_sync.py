#!/usr/bin/env python3
"""Re-pull the partnerships sheet and report what changed vs partnerships.html.

The page is hand-authored (the sheet is sparse and needs editorial framing), so
this does NOT rewrite the HTML. It prints the current sheet cells and flags any
value that no longer appears in the page, so you know exactly what to edit.

Auth: the sheet is shared with kapture-bot@kapture-488314.iam.gserviceaccount.com;
credentials at ~/service_account.json.

    python3 scripts/hub_partnerships_sync.py
"""
import json
import pathlib
import re
import string
import sys
import urllib.parse
import urllib.request

from google.auth.transport.requests import Request
from google.oauth2 import service_account

SHEET_ID = "1lKkXgLhSF70J9E5zu84Be6czyHlmeIonJ22W3pjwj4I"
CREDS = pathlib.Path.home() / "service_account.json"
ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / "partnerships.html"

creds = service_account.Credentials.from_service_account_file(
    str(CREDS), scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"]
)
creds.refresh(Request())
hdr = {"Authorization": "Bearer " + creds.token}


def get(url):
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=hdr)))


meta = get(f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}?includeGridData=false")
print(f"Sheet: {meta['properties']['title']}\n")

# The page deliberately rewords the sheet (fixes "Satchet"/"repetedly", uses ₹ not Rs.),
# so coverage is scored on distinctive-token overlap rather than exact substring.
STOP = {
    "the", "a", "an", "for", "on", "in", "of", "to", "and", "or", "your", "our",
    "their", "each", "app", "tv", "rs", "x", "only", "available", "per", "is",
    "be", "even", "after", "can", "description", "options", "surface", "demo",
}
FIXES = {"satchet": "sachet", "stachet": "sachet", "repetedly": "repeatedly",
         "expectaion": "expectation", "rs": "₹"}


def toks(s):
    words = re.findall(r"[a-z0-9₹%/]+", s.lower())
    return {FIXES.get(w, w) for w in words if w not in STOP and len(w) > 2}


page_toks = toks(PAGE.read_text(encoding="utf-8"))
missing = []

for sh in meta["sheets"]:
    tab = sh["properties"]["title"]
    rng = urllib.parse.quote(f"{tab}!A1:Z200")
    rows = get(
        f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{rng}"
    ).get("values", [])
    print("=" * 78)
    print(tab)
    for i, row in enumerate(rows):
        for j, cell in enumerate(row):
            if not cell.strip():
                continue
            ref = f"{string.ascii_uppercase[j]}{i + 1}"
            print(f"  {ref}: {cell!r}")
            t = toks(cell)
            if len(t) < 2:  # too short to score meaningfully
                continue
            covered = len(t & page_toks) / len(t)
            if covered < 0.6:
                missing.append((tab, ref, cell.strip().replace("\n", " / "), covered))

print("\n" + "=" * 78)
if missing:
    print(f"{len(missing)} sheet value(s) look under-covered by partnerships.html — review these:\n")
    for tab, ref, cell, cov in missing:
        print(f"  [{tab} {ref}] {cov:.0%} covered · {cell[:140]}")
    print("\nNote: the internal revenue tab lives encrypted inside partnerships.html,")
    print("so its cells will always show here. Edit scripts/hub_partnerships_internal.json and re-run")
    print("hub_partnerships_encrypt.py for those.")
    sys.exit(1)
print("partnerships.html covers every non-trivial sheet value.")
