#!/usr/bin/env python3
"""
CraneGenius Command Center — SQLite to JSON exporter.

Reads ~/data_runtime/cranegenius_ci.db and writes plaintext JSON files
into the ignored command-center/data/ directory for local export, then can
optionally build the encrypted static bundle for dashboard consumption.

Usage:
    python3 export_command_center_data.py

Optional:
    COMMAND_CENTER_DATA_PASSWORD='...' python3 export_command_center_data.py
    # Exports plaintext JSON locally, then refreshes command-center/secure/command-center.enc.json
"""

import json
import os
import sqlite3
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = os.path.expanduser("~/data_runtime/cranegenius_ci.db")
OUT_DIR = Path(__file__).parent / "data"
ROOT = Path(__file__).resolve().parents[1]
ENCRYPT_SCRIPT = ROOT / "tools" / "encrypt_command_center_data.py"


def connect():
    try:
        conn = sqlite3.connect(DB_PATH)
    except sqlite3.OperationalError as exc:
        raise SystemExit(f"ERROR: Unable to open database at {DB_PATH}: {exc}") from exc
    conn.row_factory = sqlite3.Row
    return conn


def write_json(filename, data):
    path = OUT_DIR / filename
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)
    print(f"  -> {path}  ({os.path.getsize(path):,} bytes)")


# ─── KPI Summary ──────────────────────────────────────────────────────
def export_kpi_summary(conn):
    print("Exporting kpi_summary.json ...")
    cur = conn.cursor()

    counts = {}
    for label, sql in [
        ("total_companies", "SELECT COUNT(*) FROM companies"),
        ("total_contacts", "SELECT COUNT(*) FROM contacts"),
        ("verified_contacts", "SELECT COUNT(*) FROM contacts WHERE email_verified = 1"),
        ("total_signals", "SELECT COUNT(*) FROM signal_events"),
        ("project_candidates", "SELECT COUNT(*) FROM project_candidates"),
        ("high_confidence_projects", "SELECT COUNT(*) FROM project_candidates WHERE confidence_score > 0.75"),
        ("manpower_profiles", "SELECT COUNT(*) FROM manpower_profiles"),
        ("total_opportunities", "SELECT COUNT(*) FROM opportunities"),
        ("outreach_sent", "SELECT COUNT(*) FROM outreach_history"),
    ]:
        cur.execute(sql)
        counts[label] = cur.fetchone()[0]

    # Signals by type
    cur.execute("""
        SELECT signal_type, COUNT(*) as cnt
        FROM signal_events
        GROUP BY signal_type
        ORDER BY cnt DESC
    """)
    signals_by_type = {row["signal_type"]: row["cnt"] for row in cur.fetchall()}

    # Signals by state
    cur.execute("""
        SELECT state, COUNT(*) as cnt
        FROM signal_events
        WHERE state IS NOT NULL AND state != ''
        GROUP BY state
        ORDER BY cnt DESC
    """)
    signals_by_state = {row["state"]: row["cnt"] for row in cur.fetchall()}

    # Cities covered (distinct cities with signals)
    cur.execute("""
        SELECT COUNT(DISTINCT city) FROM signal_events
        WHERE city IS NOT NULL AND city != ''
    """)
    counts["cities_covered"] = cur.fetchone()[0]

    # Companies by type
    cur.execute("""
        SELECT company_type, COUNT(*) as cnt
        FROM companies
        WHERE company_type IS NOT NULL AND company_type != ''
        GROUP BY company_type
        ORDER BY cnt DESC
    """)
    companies_by_type = {row["company_type"]: row["cnt"] for row in cur.fetchall()}

    # Contacts by role
    cur.execute("""
        SELECT contact_role, COUNT(*) as cnt
        FROM contacts
        WHERE contact_role IS NOT NULL AND contact_role != ''
        GROUP BY contact_role
        ORDER BY cnt DESC
    """)
    contacts_by_role = {row["contact_role"]: row["cnt"] for row in cur.fetchall()}

    write_json("kpi_summary.json", {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        **counts,
        "signals_by_type": signals_by_type,
        "signals_by_state": signals_by_state,
        "companies_by_type": companies_by_type,
        "contacts_by_role": contacts_by_role,
    })


# ─── Pipeline (Top Project Candidates) ────────────────────────────────
def export_pipeline(conn):
    print("Exporting pipeline.json ...")
    cur = conn.cursor()

    # Top 200 project candidates by crane_relevance_score
    cur.execute("""
        SELECT
            project_candidate_id,
            project_name_normalized,
            project_type,
            vertical,
            city,
            state,
            company_name_normalized,
            signal_count,
            crane_relevance_score,
            demand_score,
            timing_score,
            monetization_score,
            confidence_score,
            recommended_flag,
            recommendation_reason,
            status,
            earliest_signal_date,
            latest_signal_date
        FROM project_candidates
        WHERE status = 'active'
        ORDER BY crane_relevance_score DESC
        LIMIT 200
    """)
    candidates = [dict(row) for row in cur.fetchall()]

    # Score distribution for digest
    cur.execute("""
        SELECT
            COUNT(*) FILTER (WHERE crane_relevance_score >= 80) as high,
            COUNT(*) FILTER (WHERE crane_relevance_score >= 60 AND crane_relevance_score < 80) as medium,
            COUNT(*) FILTER (WHERE crane_relevance_score < 60) as low
        FROM project_candidates
        WHERE status = 'active'
    """)
    row = cur.fetchone()
    score_dist = {"high": row["high"], "medium": row["medium"], "low": row["low"]}

    # By vertical
    cur.execute("""
        SELECT vertical, COUNT(*) as cnt
        FROM project_candidates
        WHERE status = 'active' AND vertical IS NOT NULL
        GROUP BY vertical
        ORDER BY cnt DESC
    """)
    by_vertical = {r["vertical"]: r["cnt"] for r in cur.fetchall()}

    # By state
    cur.execute("""
        SELECT state, COUNT(*) as cnt
        FROM project_candidates
        WHERE status = 'active' AND state IS NOT NULL
        GROUP BY state
        ORDER BY cnt DESC
        LIMIT 15
    """)
    by_state = {r["state"]: r["cnt"] for r in cur.fetchall()}

    # Also produce the shape pipeline.html expects for its render()
    # digest/last_run/per_signal format
    cur.execute("""
        SELECT signal_type, COUNT(*) as cnt,
               SUM(CASE WHEN confidence_score > 0.5 THEN 1 ELSE 0 END) as good,
               SUM(CASE WHEN confidence_score <= 0.5 THEN 1 ELSE 0 END) as weak
        FROM signal_events
        GROUP BY signal_type
        ORDER BY cnt DESC
    """)
    per_signal = []
    total_good = 0
    total_weak = 0
    for r in cur.fetchall():
        per_signal.append({
            "source": r["signal_type"],
            "records_returned": r["cnt"],
            "empty_feed": r["cnt"] == 0,
        })
        total_good += r["good"]
        total_weak += r["weak"]

    write_json("pipeline.json", {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "candidates": candidates,
        "score_distribution": score_dist,
        "by_vertical": by_vertical,
        "by_state": by_state,
        "digest": {
            "counts": {
                "success": total_good,
                "failed": 0,
                "degraded": total_weak,
            },
            "n": len(per_signal),
        },
        "last_run": {
            "status": "ok",
            "run_id": "export-" + datetime.now().strftime("%Y%m%d-%H%M"),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "signal_threshold": {"reason": "SQLite export — all signals included"},
        },
        "per_signal": per_signal,
    })


# ─── Signals ──────────────────────────────────────────────────────────
def export_signals(conn):
    print("Exporting signals.json ...")
    cur = conn.cursor()

    cur.execute("""
        SELECT
            signal_event_id,
            signal_type,
            source_name,
            project_name_raw,
            company_name_raw,
            city,
            state,
            observed_at,
            confidence_score,
            source_url
        FROM signal_events
        ORDER BY observed_at DESC, signal_event_id DESC
        LIMIT 500
    """)
    events = [dict(row) for row in cur.fetchall()]

    # Summary stats
    cur.execute("SELECT COUNT(*) FROM signal_events")
    total = cur.fetchone()[0]

    cur.execute("""
        SELECT signal_type, COUNT(*) as cnt
        FROM signal_events GROUP BY signal_type ORDER BY cnt DESC
    """)
    by_type = {r["signal_type"]: r["cnt"] for r in cur.fetchall()}

    cur.execute("""
        SELECT state, COUNT(*) as cnt
        FROM signal_events
        WHERE state IS NOT NULL AND state != ''
        GROUP BY state ORDER BY cnt DESC LIMIT 20
    """)
    by_state = {r["state"]: r["cnt"] for r in cur.fetchall()}

    write_json("signals.json", {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total": total,
        "showing": len(events),
        "by_type": by_type,
        "by_state": by_state,
        "events": events,
    })


# ─── Contacts ─────────────────────────────────────────────────────────
def export_contacts(conn):
    print("Exporting contacts.json ...")
    cur = conn.cursor()

    cur.execute("""
        SELECT
            c.contact_id,
            c.full_name,
            c.title,
            c.contact_role,
            c.seniority,
            c.email,
            c.email_verified,
            c.phone,
            c.linkedin_url,
            c.location_city,
            c.location_state,
            c.lead_score,
            c.confidence_score,
            co.company_name,
            co.company_type,
            co.domain as company_domain,
            co.location_state as company_state,
            co.target_tier
        FROM contacts c
        LEFT JOIN companies co ON c.company_id = co.company_id
        ORDER BY c.lead_score DESC, c.confidence_score DESC
        LIMIT 2000
    """)
    contacts = [dict(row) for row in cur.fetchall()]

    # Mask emails for the export (show domain only)
    for ct in contacts:
        if ct.get("email") and "@" in ct["email"]:
            parts = ct["email"].split("@")
            ct["email_masked"] = parts[0][:2] + "***@" + parts[1]
        else:
            ct["email_masked"] = None

    # Summary
    cur.execute("SELECT COUNT(*) FROM contacts")
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM contacts WHERE email_verified = 1")
    verified = cur.fetchone()[0]

    cur.execute("""
        SELECT contact_role, COUNT(*) as cnt
        FROM contacts
        WHERE contact_role IS NOT NULL
        GROUP BY contact_role ORDER BY cnt DESC
    """)
    by_role = {r["contact_role"]: r["cnt"] for r in cur.fetchall()}

    cur.execute("""
        SELECT seniority, COUNT(*) as cnt
        FROM contacts
        WHERE seniority IS NOT NULL
        GROUP BY seniority ORDER BY cnt DESC
    """)
    by_seniority = {r["seniority"]: r["cnt"] for r in cur.fetchall()}

    write_json("contacts.json", {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total": total,
        "verified": verified,
        "showing": len(contacts),
        "by_role": by_role,
        "by_seniority": by_seniority,
        "contacts": contacts,
    })


# ─── Dashboard Stats ──────────────────────────────────────────────────
def export_dashboard_stats(conn):
    print("Exporting dashboard_stats.json ...")
    cur = conn.cursor()

    # Top verticals by project count
    cur.execute("""
        SELECT vertical, COUNT(*) as cnt,
               AVG(crane_relevance_score) as avg_relevance,
               AVG(demand_score) as avg_demand
        FROM project_candidates
        WHERE vertical IS NOT NULL
        GROUP BY vertical
        ORDER BY cnt DESC
    """)
    verticals = [dict(row) for row in cur.fetchall()]

    # Top states by signal density
    cur.execute("""
        SELECT state, COUNT(*) as signals,
               COUNT(DISTINCT city) as cities
        FROM signal_events
        WHERE state IS NOT NULL AND state != ''
        GROUP BY state
        ORDER BY signals DESC
        LIMIT 15
    """)
    state_heatmap = [dict(row) for row in cur.fetchall()]

    # Company tier distribution
    cur.execute("""
        SELECT target_tier, COUNT(*) as cnt
        FROM companies
        WHERE target_tier IS NOT NULL
        GROUP BY target_tier
        ORDER BY target_tier
    """)
    tier_dist = {str(r["target_tier"]): r["cnt"] for r in cur.fetchall()}

    # Contact quality distribution
    cur.execute("""
        SELECT
            COUNT(*) FILTER (WHERE lead_score > 0.7) as hot,
            COUNT(*) FILTER (WHERE lead_score > 0.4 AND lead_score <= 0.7) as warm,
            COUNT(*) FILTER (WHERE lead_score <= 0.4) as cold
        FROM contacts
    """)
    row = cur.fetchone()
    contact_quality = {"hot": row["hot"], "warm": row["warm"], "cold": row["cold"]}

    write_json("dashboard_stats.json", {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "verticals": verticals,
        "state_heatmap": state_heatmap,
        "company_tier_distribution": tier_dist,
        "contact_quality_distribution": contact_quality,
    })


# ─── Main ─────────────────────────────────────────────────────────────
def main():
    print(f"CraneGenius Command Center Data Export")
    print(f"DB: {DB_PATH}")
    print(f"Output: {OUT_DIR}")
    print()

    if not os.path.exists(DB_PATH):
        print(f"ERROR: Database not found at {DB_PATH}")
        return

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    conn = connect()
    try:
        try:
            export_kpi_summary(conn)
            export_pipeline(conn)
            export_signals(conn)
            export_contacts(conn)
            export_dashboard_stats(conn)
        except sqlite3.OperationalError as exc:
            raise SystemExit(
                f"ERROR: Failed while reading {DB_PATH}: {exc}"
            ) from exc
    finally:
        conn.close()

    print()
    print("Done. Plaintext JSON files written to command-center/data/ (gitignored).")

    if os.environ.get("COMMAND_CENTER_DATA_PASSWORD"):
        print()
        print("COMMAND_CENTER_DATA_PASSWORD detected; refreshing encrypted bundle ...")
        subprocess.run(
            [sys.executable, str(ENCRYPT_SCRIPT)],
            check=True,
            cwd=str(ROOT),
            env=os.environ.copy(),
        )
    else:
        print()
        print("Next step: run `python3 tools/encrypt_command_center_data.py`")
        print("or rerun this exporter with COMMAND_CENTER_DATA_PASSWORD set.")


if __name__ == "__main__":
    main()
