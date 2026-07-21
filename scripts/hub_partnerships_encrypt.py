#!/usr/bin/env python3
"""Encrypt the internal revenue block for partnerships.html.

The hub repo is PUBLIC. This keeps the internal take-rate numbers out of the
published HTML as plaintext: the page ships a ciphertext blob and decrypts it
in the browser only when the passphrase is entered (WebCrypto, PBKDF2-SHA256
300k + AES-256-GCM).

This is real encryption, not base64 — but its strength is the strength of the
passphrase. Anyone with the URL can run an offline dictionary attack on the
blob, so do not reuse a password and do not treat it as access control.

Usage:
    python3 scripts/hub_partnerships_encrypt.py                 # prompts for passphrase
    WIOM_HUB_PASS='...' python3 scripts/hub_partnerships_encrypt.py

Injects the ciphertext into the <script id="encblob"> tag inside partnerships.html,
so the page stays a single self-contained file (works from file:// too).
"""
import base64
import getpass
import hashlib
import json
import os
import pathlib
import re
import sys

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except ImportError:
    sys.exit("pip install cryptography")

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "hub_partnerships_internal.json"
PAGE = ROOT / "partnerships.html"
ITER = 300_000

pw = os.environ.get("WIOM_HUB_PASS") or getpass.getpass("Passphrase: ")
if len(pw) < 10:
    sys.exit("Use at least 10 characters — this blob is publicly downloadable.")

plaintext = SRC.read_text(encoding="utf-8").encode("utf-8")
salt = os.urandom(16)
iv = os.urandom(12)
key = hashlib.pbkdf2_hmac("sha256", pw.encode("utf-8"), salt, ITER, dklen=32)
ct = AESGCM(key).encrypt(iv, plaintext, None)

b64 = lambda b: base64.b64encode(b).decode()
blob = json.dumps(
    {"v": 1, "kdf": "PBKDF2-SHA256", "iter": ITER, "salt": b64(salt), "iv": b64(iv), "ct": b64(ct)}
)

html = PAGE.read_text(encoding="utf-8")
pattern = r'(<script id="encblob" type="application/json">)(.*?)(</script>)'
if not re.search(pattern, html, re.S):
    sys.exit('partnerships.html has no <script id="encblob"> tag to write into.')
PAGE.write_text(re.sub(pattern, lambda m: m.group(1) + blob + m.group(3), html, flags=re.S), encoding="utf-8")
print(f"injected {len(ct)} bytes of ciphertext into {PAGE.relative_to(ROOT)}")
print("NOTE: scripts/hub_partnerships_internal.json holds the PLAINTEXT — it is gitignored. Keep it that way.")
