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
SUPABASE_HEADERS = {
    "apikey": (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbmFnbGhhaWx1Zmx5bmlycXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwOTc0MjIsImV4cCI6MjA5MDY3MzQyMn0.-d_IxHBAEXa_DoahB7pqzNp7hEWyh5lNXa7gVxYMvCU"
    ),
    "Authorization": (
        "Bearer "
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbmFnbGhhaWx1Zmx5bmlycXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwOTc0MjIsImV4cCI6MjA5MDY3MzQyMn0.-d_IxHBAEXa_DoahB7pqzNp7hEWyh5lNXa7gVxYMvCU"
    ),
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
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = resp.read()
        status = resp.getcode()
    payload = json.loads(data or b"{}")
    return status, payload


def check_feed() -> Dict[str, Any]:
    last_error: Exception | None = None
    for attempt in range(2):
        try:
            status, payload = fetch_json(SUPABASE_URL, headers=SUPABASE_HEADERS)
            break
        except TimeoutError as exc:
            last_error = exc
            if attempt == 0:
                time.sleep(2)
                continue
            raise RuntimeError("Supabase feed timed out repeatedly") from exc
    else:  # pragma: no cover - defensive, shouldn't hit
        raise RuntimeError(f"Supabase feed unreachable: {last_error}")

    if status != 200:
        raise RuntimeError(f"Supabase feed returned HTTP {status}")
    articles = payload.get("articles") or payload.get("data") or []
    if not isinstance(articles, list) or not articles:
        raise RuntimeError("Supabase feed is empty or malformed")
    return {
        "count": len(articles),
        "first": articles[0],
    }


def check_translation(sample_title: str | None = None) -> str:
    # Use either the provided sample headline or a known Spanish phrase to keep
    # the request payload short and deterministic.
    text = sample_title or "hola mundo"
    params = TRANSLATE_PARAMS.copy()
    params["q"] = text
    query = urllib.parse.urlencode(params)
    url = f"{TRANSLATE_ENDPOINT}?{query}"
    status, payload = fetch_json(url)
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
        translated = check_translation(feed_info["first"].get("title", ""))
    except (urllib.error.URLError, RuntimeError, json.JSONDecodeError) as exc:
        print(f"[GDELT HEALTHCHECK] FAILED: {exc}", file=sys.stderr)
        return 1

    duration = time.time() - start
    print(
        "[GDELT HEALTHCHECK] OK | articles={count} sample_translation=\"{headline}\" ({duration:.2f}s)".format(
            count=feed_info["count"], headline=translated, duration=duration
        )
    )
    return 0


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
