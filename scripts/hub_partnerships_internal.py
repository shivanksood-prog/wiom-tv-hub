#!/usr/bin/env python3
"""Embed the internal revenue block into partnerships.html.

Two modes:

    python3 scripts/hub_partnerships_internal.py            # OPEN  — plaintext (current)
    python3 scripts/hub_partnerships_internal.py --lock     # LOCKED — AES-GCM envelope

The page detects which shape is embedded and only shows the passphrase gate when
the block is actually encrypted, so switching is a one-command change.

OPEN mode note: the hub repo is PUBLIC. Plaintext take-rates embedded here are
readable by anyone with the URL and land in git history permanently — re-locking
later does NOT remove them from history. That trade was made deliberately; if it
ever needs reversing, the numbers themselves have to change, not just the lock.

LOCKED mode note: real AES-256-GCM (PBKDF2-SHA256, 300k), but its strength is the
strength of the passphrase and the blob is downloadable for offline attack. A lock,
not access control.
"""
import argparse
import base64
import getpass
import hashlib
import json
import os
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "hub_partnerships_internal.json"
PAGE = ROOT / "partnerships.html"
ITER = 300_000
PATTERN = r'(<script id="internal" type="application/json">)(.*?)(</script>)'

ap = argparse.ArgumentParser()
ap.add_argument("--lock", action="store_true", help="encrypt the block behind a passphrase")
args = ap.parse_args()

plaintext = SRC.read_text(encoding="utf-8")

if args.lock:
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    except ImportError:
        sys.exit("pip install cryptography")
    pw = os.environ.get("WIOM_HUB_PASS") or getpass.getpass("Passphrase: ")
    if len(pw) < 10:
        sys.exit("Use at least 10 characters — this blob is publicly downloadable.")
    salt, iv = os.urandom(16), os.urandom(12)
    key = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, ITER, dklen=32)
    ct = AESGCM(key).encrypt(iv, plaintext.encode("utf-8"), None)
    b64 = lambda b: base64.b64encode(b).decode()
    blob = json.dumps({"v": 1, "kdf": "PBKDF2-SHA256", "iter": ITER,
                       "salt": b64(salt), "iv": b64(iv), "ct": b64(ct)})
    what = f"LOCKED ({len(ct)} bytes ciphertext)"
else:
    blob = json.dumps(json.loads(plaintext), ensure_ascii=False, separators=(",", ":"))
    what = f"OPEN — plaintext, publicly readable ({len(blob)} bytes)"

html = PAGE.read_text(encoding="utf-8")
if not re.search(PATTERN, html, re.S):
    sys.exit('partnerships.html has no <script id="internal"> block to write into.')
PAGE.write_text(re.sub(PATTERN, lambda m: m.group(1) + blob + m.group(3), html, flags=re.S),
                encoding="utf-8")
print(f"{PAGE.relative_to(ROOT)} -> {what}")
if not args.lock:
    print("WARNING: the take-rates are now plaintext in a PUBLIC repo and enter git history.")
