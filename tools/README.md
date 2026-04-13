# Tools

## `gdelt_healthcheck.py`

Quick script to make sure the CapexLayer dashboard can still pull the GDELT
feed (via Supabase) and translate at least one headline into English using the
same public Google endpoint used by the UI.

### Usage

```bash
cd tools
python3 gdelt_healthcheck.py
```

Exit status is `0` on success, non-zero otherwise, so it can be dropped into a
cron job or CI workflow. The script prints the number of articles returned and
an English translation of the first headline when everything is working.
