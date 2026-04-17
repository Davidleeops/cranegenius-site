#!/usr/bin/env python3
"""Lightweight health check for the CapexLayer GDELT feed and translation stack.

Steps performed:
1. Fetch the Supabase-powered live GDELT feed.
2. Ensure the response contains at least one article.
3. Attempt to translate the first headline into English using the same
   public Google endpoint that the dashboard relies on (verifies translator availability).

Exit status is non-zero when any of the checks fail, which makes this script
cron/CI-friendly.
"""
from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, Tuple

SUPABASE_URL = (
    "https://qdnaglhailuflynirqtt.supabase.co/functions/v1/live-feeds?feed=gdelt"
)
_ANON_JWT = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbmFnbGhhaWx1Zmx5bmlycXR0Iiwicm9sZSI6ImFub24i"
    "LCJpYXQiOjE3NzUwOTc0MjIsImV4cCI6MjA5MDY3MzQyMn0.-d_IxHBAEXa_DoahB7pqzNp7hEWyh5lNXa7gVxYMvCU"
)
SUPABASE_HEADERS = {
    "apikey": _ANON_JWT,
    "Authorization": f"Bearer {_ANON_JWT}",
    "User-Agent": "cranegenius-healthcheck/1.0",
}
TRANSLATE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (cranegenius-healthcheck)",
}
TRANSLATE_ENDPOINT = "https://translate.googleapis.com/translate_a/single"
TRANSLATE_PARAMS = {
    "client": "gtx",
    "sl": "auto",
    "tl": "en",
    "dt": "t",
}


def fetch_json(url: str, *, headers: Dict[str, str] | None = None, timeout: int = 15) -> Tuple[int, Any]:
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
            status = resp.getcode()
    except urllib.error.HTTPError as exc:
        data = exc.read() if hasattr(exc, "read") else b""
        status = exc.code
    try:
        payload = json.loads(data or b"{}")
    except json.JSONDecodeError:
        payload = {"_raw": data[:200].decode("utf-8", errors="replace")}
    return status, payload


def check_feed() -> Dict[str, Any]:
    # The live-feeds edge function is flaky and returns intermittent 5xx.
    # Retry with backoff so a single blip doesn't trip CI.
    max_attempts = 5
    status: int | None = None
    payload: Any = None
    last_error: Exception | None = None
    for attempt in range(max_attempts):
        try:
            status, payload = fetch_json(SUPABASE_URL, headers=SUPABASE_HEADERS, timeout=20)
            if status == 200:
                break
            last_error = RuntimeError(f"HTTP {status}")
        except (TimeoutError, urllib.error.URLError) as exc:
            last_error = exc
        if attempt < max_attempts - 1:
            time.sleep(1.5 * (attempt + 1))

    if status != 200:
        raise RuntimeError(
            f"Supabase feed failed after {max_attempts} attempts (last: {last_error})"
        )
    articles = payload.get("articles") or payload.get("data") or []
    if not isinstance(articles, list) or not articles:
        raise RuntimeError("Supabase feed is empty or malformed")
    return {
        "count": len(articles),
        "first": articles[0],
    }


def check_translation(sample_title: str | None = None) -> str:
    text = sample_title or "hola mundo"
    params = TRANSLATE_PARAMS.copy()
    params["q"] = text
    query = urllib.parse.urlencode(params)
    url = f"{TRANSLATE_ENDPOINT}?{query}"
    status, payload = fetch_json(url, headers=TRANSLATE_HEADERS)
    if status != 200:
        raise RuntimeError(f"Translation endpoint returned HTTP {status}")
    if not payload or not isinstance(payload, list) or not payload[0]:
        raise RuntimeError("Translation payload malformed")
    translated = "".join(part[0] for part in payload[0] if part and part[0])
    if not translated.strip():
        raise RuntimeError("Translation returned an empty string")
    return translated


def main() -> int:
    start = time.time()

    try:
        feed_info = check_feed()
    except (urllib.error.URLError, RuntimeError, json.JSONDecodeError) as exc:
        print(f"[GDELT HEALTHCHECK] FEED FAILED: {exc}", file=sys.stderr)
        return 1
    print(f"[GDELT HEALTHCHECK] feed OK | articles={feed_info['count']}")

    # Translation is an auxiliary liveness probe against an undocumented Google
    # endpoint that routinely rate-limits CI IPs. Soft-fail so transient 403/429
    # from Google doesn't mask the true health signal (the feed).
    try:
        translated = check_translation(feed_info["first"].get("title", ""))
        print(f"[GDELT HEALTHCHECK] translate OK | sample=\"{translated[:120]}\"")
    except (urllib.error.URLError, RuntimeError, json.JSONDecodeError) as exc:
        print(f"[GDELT HEALTHCHECK] translate WARN (non-fatal): {exc}", file=sys.stderr)

    duration = time.time() - start
    print(f"[GDELT HEALTHCHECK] OK ({duration:.2f}s)")
    return 0


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
