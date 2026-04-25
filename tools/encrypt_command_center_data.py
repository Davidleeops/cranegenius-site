#!/usr/bin/env python3
"""Encrypt command-center plaintext JSON for safe static hosting.

Usage:
  python3 tools/encrypt_command_center_data.py

Password source:
  - COMMAND_CENTER_DATA_PASSWORD env var, or
  - interactive prompt
"""

from __future__ import annotations

import base64
import getpass
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes


ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "command-center" / "secure" / "command-center.enc.json"
DATASETS = {
    "contacts": ROOT / "command-center" / "data" / "contacts.json",
    "dashboard_stats": ROOT / "command-center" / "data" / "dashboard_stats.json",
    "kpi_summary": ROOT / "command-center" / "data" / "kpi_summary.json",
    "pipeline": ROOT / "command-center" / "data" / "pipeline.json",
    "signals": ROOT / "command-center" / "data" / "signals.json",
    "financials": ROOT / "data" / "financials.json",
}
KDF_ITERATIONS = 250_000


def b64(value: bytes) -> str:
    return base64.b64encode(value).decode("ascii")


def load_password() -> str:
    env_password = os.environ.get("COMMAND_CENTER_DATA_PASSWORD")
    if env_password:
        return env_password
    first = getpass.getpass("Command-center password: ")
    if not first:
        raise SystemExit("Password is required")
    second = getpass.getpass("Confirm password: ")
    if first != second:
        raise SystemExit("Passwords did not match")
    return first


def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=KDF_ITERATIONS,
    )
    return kdf.derive(password.encode("utf-8"))


def load_datasets() -> tuple[dict, list[str]]:
    datasets: dict[str, object] = {}
    missing: list[str] = []
    for name, path in DATASETS.items():
        if not path.exists():
            missing.append(str(path.relative_to(ROOT)))
            continue
        with path.open() as handle:
            datasets[name] = json.load(handle)
    if not datasets:
        raise SystemExit("No plaintext datasets found to encrypt")
    return datasets, missing


def encrypt_payload(payload: dict, password: str) -> dict:
    salt = os.urandom(16)
    iv = os.urandom(12)
    key = derive_key(password, salt)
    aes = AESGCM(key)
    plaintext = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    ciphertext = aes.encrypt(iv, plaintext, None)
    return {
        "version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "datasets": sorted(payload["datasets"].keys()),
        "kdf": {
            "name": "PBKDF2",
            "hash": "SHA-256",
            "iterations": KDF_ITERATIONS,
            "salt_b64": b64(salt),
        },
        "cipher": {
            "name": "AES-GCM",
            "length": 256,
            "iv_b64": b64(iv),
        },
        "ciphertext_b64": b64(ciphertext),
    }


def verify_roundtrip(bundle: dict, password: str) -> None:
    salt = base64.b64decode(bundle["kdf"]["salt_b64"])
    iv = base64.b64decode(bundle["cipher"]["iv_b64"])
    ciphertext = base64.b64decode(bundle["ciphertext_b64"])
    key = derive_key(password, salt)
    plaintext = AESGCM(key).decrypt(iv, ciphertext, None)
    json.loads(plaintext.decode("utf-8"))


def main() -> None:
    password = load_password()
    datasets, missing = load_datasets()
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "datasets": datasets,
    }
    bundle = encrypt_payload(payload, password)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(bundle, separators=(",", ":")))
    verify_roundtrip(bundle, password)

    print(f"Wrote {OUT_PATH}")
    print("Included datasets:")
    for name in sorted(datasets):
        source = DATASETS[name].relative_to(ROOT)
        print(f"  - {name}: {source}")
    if missing:
        print("Missing datasets (skipped):")
        for path in missing:
            print(f"  - {path}")


if __name__ == "__main__":
    main()
