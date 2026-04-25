#!/usr/bin/env python3
"""Build a platform-friendly signal registry from internal command-center data.

The public platform currently exposes a normalized signal feed. This script
creates a smaller registry that preserves richer upstream taxonomy, source
examples, and opportunity provenance so the static dashboard can surface that
context without needing the full private pipeline in the browser.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PLATFORM_DIR = ROOT / "platform"
COMMAND_CENTER_DIR = ROOT / "command-center" / "data"

PLATFORM_SIGNALS_PATH = PLATFORM_DIR / "cranegenius_signals.json"
PLATFORM_OPPS_PATH = PLATFORM_DIR / "cranegenius_opportunities.json"
COMMAND_CENTER_SIGNALS_PATH = COMMAND_CENTER_DIR / "signals.json"
REGISTRY_PATH = PLATFORM_DIR / "cranegenius_signal_registry.json"
HIDDEN_SIGNALS_PATH = PLATFORM_DIR / "cranegenius_hidden_signals.json"


PLATFORM_SIGNAL_META = {
    "building_permit": {
        "display_label": "Building Permits",
        "family": "permitting",
        "description": "Normalized building-permit activity used as an early project indicator.",
        "upstream_type_candidates": ["permit_activity", "structural_permit"],
    },
    "concrete_pour": {
        "display_label": "Concrete Activity",
        "family": "construction",
        "description": "Concrete pours and close-in-place structural work tied to active build timing.",
        "upstream_type_candidates": ["permit_activity", "capital_improvement"],
    },
    "corporate_capex": {
        "display_label": "Corporate Capex",
        "family": "capex",
        "description": "Company investment and project-commitment signals normalized for the public map.",
        "upstream_type_candidates": [
            "capital_improvement",
            "capital_improvement_plan",
            "infrastructure_announcement",
            "infrastructure_project",
        ],
    },
    "crane_permit": {
        "display_label": "Lift Permits",
        "family": "lifting",
        "description": "Crane and lift permitting activity, normalized for equipment demand timing.",
        "upstream_type_candidates": ["lift_permit", "obstruction_notice"],
    },
    "demolition_permit": {
        "display_label": "Demolition",
        "family": "permitting",
        "description": "Demolition activity surfaced as site turnover and preparation demand.",
        "upstream_type_candidates": ["permit_activity", "site_plan_review"],
    },
    "environmental_review": {
        "display_label": "Environmental & Review",
        "family": "regulatory",
        "description": "Environmental, entitlement, and review-stage signals collapsed into one public type.",
        "upstream_type_candidates": [
            "capital_improvement_plan",
            "federal_infrastructure_award",
            "site_plan_review",
            "zoning_filing",
        ],
    },
    "excavation": {
        "display_label": "Excavation",
        "family": "sitework",
        "description": "Excavation and early sitework indicators tied to equipment mobilization.",
        "upstream_type_candidates": ["permit_activity", "site_plan_review"],
    },
    "foundation_permit": {
        "display_label": "Foundation Work",
        "family": "permitting",
        "description": "Foundation-stage permits and enabling work normalized for the platform map.",
        "upstream_type_candidates": ["permit_activity", "structural_permit"],
    },
    "site_prep": {
        "display_label": "Site Preparation",
        "family": "sitework",
        "description": "Early site readiness, grading, and enabling activity.",
        "upstream_type_candidates": ["permit_activity", "site_plan_review"],
    },
    "structural_steel": {
        "display_label": "Structural Steel",
        "family": "construction",
        "description": "Steel package and erection-stage signals normalized for crane demand.",
        "upstream_type_candidates": ["structural_permit", "capital_improvement"],
    },
    "utility_expansion": {
        "display_label": "Utility & Grid Expansion",
        "family": "utility",
        "description": "Utility and grid-adjacent work collapsed into one public-facing signal type.",
        "upstream_type_candidates": [
            "electric_utility_certificate",
            "gas_pipeline_certificate",
            "lng_certificate",
            "utility_infrastructure",
            "utility_irp",
        ],
    },
    "zoning_change": {
        "display_label": "Zoning & Entitlements",
        "family": "entitlement",
        "description": "Zoning, variance, and entitlement activity normalized into one public type.",
        "upstream_type_candidates": ["zoning_filing", "zoning_variance", "site_plan_review"],
    },
}


UPSTREAM_FAMILY = {
    "battery_storage_procurement": "procurement",
    "capital_improvement": "capex",
    "capital_improvement_plan": "capex",
    "electric_utility_certificate": "utility",
    "equipment_rental_contract": "equipment",
    "equipment_rental_demand": "equipment",
    "federal_infrastructure_award": "funding",
    "gas_pipeline_certificate": "utility",
    "generic_signal": "other",
    "heavy_transport_notice": "logistics",
    "hiring_signal": "labor",
    "infrastructure_announcement": "infrastructure",
    "infrastructure_project": "infrastructure",
    "lift_permit": "lifting",
    "lng_certificate": "utility",
    "obstruction_notice": "airspace",
    "oversize_overweight_permits": "logistics",
    "permit_activity": "permitting",
    "procurement_rfp": "procurement",
    "site_plan_review": "entitlement",
    "state_capital_plan": "capex",
    "structural_permit": "construction",
    "subcontractor_registration": "contractor",
    "utility_infrastructure": "utility",
    "utility_irp": "utility",
    "zoning_filing": "entitlement",
    "zoning_variance": "entitlement",
}


OPPORTUNITY_SOURCE_META = {
    "project_candidates": {
        "label": "Project Candidates Pipeline",
        "description": "Scored internal candidate pipeline built from structured construction and capex signals.",
    },
    "global_intelligence": {
        "label": "Global Intelligence Feed",
        "description": "Curated major-project intelligence used to extend international coverage.",
    },
}


UPSTREAM_LAYER_META = {
    "procurement_rfps": {
        "label": "Procurement / RFPs",
        "description": "Bid and procurement demand that should become first-class sourcing intelligence.",
        "family": "procurement",
        "color": "#f59e0b",
        "signal_types": ["procurement_rfp"],
    },
    "equipment_rentals": {
        "label": "Equipment Rentals",
        "description": "Rental-contract demand that signals public-sector heavy-equipment activity.",
        "family": "equipment",
        "color": "#fb7185",
        "signal_types": ["equipment_rental_contract"],
    },
    "utility_certificates": {
        "label": "Utility Certificates",
        "description": "FERC and related utility infrastructure filings that point to grid buildout.",
        "family": "utility",
        "color": "#22d3ee",
        "signal_types": [
            "electric_utility_certificate",
            "gas_pipeline_certificate",
            "lng_certificate",
        ],
    },
    "labor_demand": {
        "label": "Labor Demand",
        "description": "Hiring and operator demand that can be mapped from state-level job activity.",
        "family": "labor",
        "color": "#a855f7",
        "signal_types": ["hiring_signal"],
    },
}


def titleize(value: str) -> str:
    return value.replace("_", " ").strip().title()


def load_json(path: Path):
    with path.open() as handle:
        return json.load(handle)


def mean_coord(rows: list[tuple[float, float]]) -> tuple[float, float]:
    lat = sum(item[0] for item in rows) / len(rows)
    lng = sum(item[1] for item in rows) / len(rows)
    return round(lat, 6), round(lng, 6)


def looks_like_us_bbox(lat: float, lng: float) -> bool:
    return 18 <= lat <= 72 and -170 <= lng <= -50


def build_location_lookup(platform_signals: list[dict], platform_opportunities: list[dict]) -> dict:
    city_state_rows: defaultdict[tuple[str, str], list[tuple[float, float]]] = defaultdict(list)
    state_rows: defaultdict[str, list[tuple[float, float]]] = defaultdict(list)

    for item in platform_signals:
        lat = item.get("lat")
        lng = item.get("lng")
        geography = (item.get("geography") or "").strip()
        if lat is None or lng is None or not geography:
            continue
        parts = [part.strip() for part in geography.split(",") if part.strip()]
        if len(parts) >= 2:
            city, state = parts[0], parts[-1]
            if looks_like_us_bbox(lat, lng):
                city_state_rows[(city.lower(), state.lower())].append((lat, lng))
                state_rows[state.lower()].append((lat, lng))
        elif len(parts) == 1:
            if looks_like_us_bbox(lat, lng):
                state_rows[parts[0].lower()].append((lat, lng))

    for item in platform_opportunities:
        lat = item.get("lat")
        lng = item.get("lng")
        city = (item.get("city") or "").strip()
        state = (item.get("state") or "").strip()
        if lat is None or lng is None:
            continue
        if city and state and looks_like_us_bbox(lat, lng):
            city_state_rows[(city.lower(), state.lower())].append((lat, lng))
        if state and looks_like_us_bbox(lat, lng):
            state_rows[state.lower()].append((lat, lng))

    city_state_lookup = {
        key: mean_coord(rows)
        for key, rows in city_state_rows.items()
        if rows
    }
    state_lookup = {
        key: mean_coord(rows)
        for key, rows in state_rows.items()
        if rows
    }
    return {"city_state": city_state_lookup, "state": state_lookup}


def resolve_coords(location_lookup: dict, city: str, state: str):
    city = (city or "").strip().lower()
    state = (state or "").strip().lower()
    if city and state and (city, state) in location_lookup["city_state"]:
        return location_lookup["city_state"][(city, state)]
    if state and state in location_lookup["state"]:
        return location_lookup["state"][state]
    return None


def build_registry() -> dict:
    platform_signals = load_json(PLATFORM_SIGNALS_PATH)
    platform_opportunities = load_json(PLATFORM_OPPS_PATH)
    command_center_signals = load_json(COMMAND_CENTER_SIGNALS_PATH)

    platform_counts = Counter(item.get("signal_type", "unknown") for item in platform_signals)
    platform_missing_geography = sum(1 for item in platform_signals if not item.get("geography"))
    platform_total = len(platform_signals)
    opportunity_total = len(platform_opportunities)

    upstream_by_type = command_center_signals.get("by_type", {})
    upstream_events = command_center_signals.get("events", [])
    upstream_type_count = len(upstream_by_type)
    location_lookup = build_location_lookup(platform_signals, platform_opportunities)

    source_examples = defaultdict(Counter)
    source_urls = {}
    for event in upstream_events:
        upstream_type = event.get("signal_type") or "unknown"
        source_name = event.get("source_name") or "unknown_source"
        source_examples[upstream_type][source_name] += 1
        if source_name not in source_urls and event.get("source_url"):
            source_urls[source_name] = event["source_url"]

    visible_types = []
    mapped_upstream_types = set()
    for signal_type, count in platform_counts.most_common():
        meta = PLATFORM_SIGNAL_META.get(
            signal_type,
            {
                "display_label": titleize(signal_type),
                "family": "other",
                "description": "Normalized platform signal.",
                "upstream_type_candidates": [],
            },
        )
        upstream_candidates = meta["upstream_type_candidates"]
        mapped_upstream_types.update(upstream_candidates)
        candidate_count = sum(upstream_by_type.get(candidate, 0) for candidate in upstream_candidates)
        candidate_sources = []
        seen_sources = set()
        for upstream_type in upstream_candidates:
            for source_name, source_count in source_examples.get(upstream_type, Counter()).most_common():
                if source_name in seen_sources:
                    continue
                seen_sources.add(source_name)
                candidate_sources.append(
                    {
                        "source_name": source_name,
                        "count": source_count,
                        "source_url": source_urls.get(source_name, ""),
                        "upstream_type": upstream_type,
                    }
                )
                if len(candidate_sources) >= 3:
                    break
            if len(candidate_sources) >= 3:
                break
        visible_types.append(
            {
                "signal_type": signal_type,
                "display_label": meta["display_label"],
                "family": meta["family"],
                "description": meta["description"],
                "platform_count": count,
                "upstream_type_candidates": upstream_candidates,
                "upstream_total_count": candidate_count,
                "source_examples": candidate_sources,
            }
        )

    hidden_upstream_types = []
    for upstream_type, count in sorted(upstream_by_type.items(), key=lambda item: item[1], reverse=True):
        if upstream_type in mapped_upstream_types:
            continue
        examples = [
            {
                "source_name": source_name,
                "count": source_count,
                "source_url": source_urls.get(source_name, ""),
            }
            for source_name, source_count in source_examples.get(upstream_type, Counter()).most_common(3)
        ]
        hidden_upstream_types.append(
            {
                "signal_type": upstream_type,
                "display_label": titleize(upstream_type),
                "family": UPSTREAM_FAMILY.get(upstream_type, "other"),
                "upstream_count": count,
                "source_examples": examples,
            }
        )

    hidden_signal_events = []
    upstream_layers = []
    for layer_id, meta in UPSTREAM_LAYER_META.items():
        layer_events = [event for event in upstream_events if event.get("signal_type") in meta["signal_types"]]
        mapped_events = []
        for event in layer_events:
            coords = resolve_coords(location_lookup, event.get("city", ""), event.get("state", ""))
            geography = ", ".join(part for part in [event.get("city", ""), event.get("state", "")] if part)
            hidden_signal_event = {
                "id": f"hidden-{layer_id}-{event.get('signal_event_id')}",
                "layer_id": layer_id,
                "layer_label": meta["label"],
                "signal_type": event.get("signal_type"),
                "family": meta["family"],
                "project_name": event.get("project_name_raw", ""),
                "company_name": event.get("company_name_raw", ""),
                "geography": geography,
                "city": event.get("city", ""),
                "state": event.get("state", ""),
                "confidence": event.get("confidence_score"),
                "signal_date": event.get("observed_at", ""),
                "source_name": event.get("source_name", ""),
                "source_url": event.get("source_url", ""),
                "lat": coords[0] if coords else None,
                "lng": coords[1] if coords else None,
            }
            hidden_signal_events.append(hidden_signal_event)
            if coords:
                mapped_events.append(hidden_signal_event)

        examples = []
        for signal_type in meta["signal_types"]:
            for source_name, source_count in source_examples.get(signal_type, Counter()).most_common():
                if any(example["source_name"] == source_name for example in examples):
                    continue
                examples.append(
                    {
                        "source_name": source_name,
                        "count": source_count,
                        "source_url": source_urls.get(source_name, ""),
                        "signal_type": signal_type,
                    }
                )
                if len(examples) >= 3:
                    break
            if len(examples) >= 3:
                break

        upstream_layers.append(
            {
                "id": layer_id,
                "label": meta["label"],
                "description": meta["description"],
                "family": meta["family"],
                "color": meta["color"],
                "signal_types": meta["signal_types"],
                "count": sum(upstream_by_type.get(signal_type, 0) for signal_type in meta["signal_types"]),
                "recent_event_count": len(layer_events),
                "map_ready_count": len(mapped_events),
                "map_enabled": len(mapped_events) > 0,
                "source_examples": examples,
            }
        )

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "upstream_generated_at": command_center_signals.get("generated_at"),
        "platform": {
            "signal_total": platform_total,
            "visible_signal_type_count": len(platform_counts),
            "missing_geography_count": platform_missing_geography,
            "missing_geography_share": round(platform_missing_geography / platform_total, 4)
            if platform_total
            else 0,
            "opportunity_total": opportunity_total,
            "visible_signal_types": visible_types,
            "opportunity_sources": {
                key: {
                    **meta,
                    "count": sum(1 for item in platform_opportunities if item.get("source_signal") == key),
                }
                for key, meta in OPPORTUNITY_SOURCE_META.items()
            },
            "upstream_layers": upstream_layers,
        },
        "upstream": {
            "signal_total": command_center_signals.get("total", 0),
            "type_count": upstream_type_count,
            "hidden_upstream_types": hidden_upstream_types[:12],
        },
        "hidden_signal_events": hidden_signal_events,
    }


def main() -> None:
    registry = build_registry()
    REGISTRY_PATH.write_text(json.dumps(registry, separators=(",", ":")))
    HIDDEN_SIGNALS_PATH.write_text(
        json.dumps(
            [
                event
                for event in registry["hidden_signal_events"]
                if event.get("lat") is not None and event.get("lng") is not None
            ],
            separators=(",", ":"),
        )
    )
    print(f"Wrote {REGISTRY_PATH}")
    print(f"Wrote {HIDDEN_SIGNALS_PATH}")


if __name__ == "__main__":
    main()
