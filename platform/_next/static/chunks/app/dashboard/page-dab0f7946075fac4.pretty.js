(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [105],
  {
    472: (e) => {
      e.exports = {
        controls: "MapControls_controls__fNqJP",
        controlButton: "MapControls_controlButton__8J3xF",
      };
    },
    2471: (e, t, n) => {
      "use strict";
      (n.r(t), n.d(t, { default: () => eT }));
      var r = n(5155),
        o = n(2115),
        i = n(8891),
        l = n(4606),
        a = n.n(l);
      n(4209);
      let s = {
          id: "opportunities-cluster",
          type: "circle",
          source: "opportunities",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#22c55e",
              10,
              "#eab308",
              30,
              "#c9a84c",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              18,
              10,
              24,
              30,
              32,
            ],
            "circle-opacity": 0.85,
            "circle-stroke-width": 2,
            "circle-stroke-color": "rgba(255,255,255,0.15)",
          },
        },
        c = {
          id: "opportunities-cluster-count",
          type: "symbol",
          source: "opportunities",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-size": 12,
          },
          paint: { "text-color": "#ffffff" },
        },
        d = {
          id: "opportunities-unclustered",
          type: "circle",
          source: "opportunities",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "case",
              [">=", ["get", "signal_score"], 8],
              "#22c55e",
              [">=", ["get", "signal_score"], 5],
              "#eab308",
              "#6b7280",
            ],
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              3,
              4,
              8,
              7,
              14,
              12,
            ],
            "circle-opacity": 0.9,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "rgba(255,255,255,0.2)",
          },
        };
      function u() {
        var e;
        let { current: t } = (0, i.ko)(),
          [n, l] = (0, o.useState)(null),
          [a, u] = (0, o.useState)(null);
        (0, o.useEffect)(() => {
          fetch("/platform/cranegenius_opportunities.json")
            .then((e) => e.json())
            .then((e) => {
              l({
                type: "FeatureCollection",
                features: e
                  .filter((e) => e.lat && e.lng)
                  .map((e) => ({
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [e.lng, e.lat] },
                    properties: {
                      id: e.id,
                      project_name: e.project_name,
                      city: e.city,
                      state: e.state,
                      signal_score: e.signal_score,
                      company_name: e.company_name,
                      priority_band: e.priority_band,
                      project_type: e.project_type,
                      recommended_lift_categories: (
                        e.recommended_lift_categories || []
                      ).join(", "),
                      source_signal: e.source_signal,
                    },
                  })),
              });
            })
            .catch(console.error);
        }, []);
        let p = (0, o.useCallback)(
          (e) => {
            var n;
            if (!e.features || 0 === e.features.length) return;
            let r = e.features[0];
            if (null == (n = r.properties) ? void 0 : n.point_count) {
              let e = r.properties.cluster_id,
                n = null == t ? void 0 : t.getMap();
              if (!n) return;
              n.getSource("opportunities").getClusterExpansionZoom(
                e,
                (e, t) => {
                  e || n.easeTo({ center: r.geometry.coordinates, zoom: t });
                },
              );
              return;
            }
            let o = r.geometry.coordinates.slice();
            u({ longitude: o[0], latitude: o[1], feature: r.properties });
          },
          [t],
        );
        return ((0, o.useEffect)(() => {
          let e = null == t ? void 0 : t.getMap();
          if (e)
            return (
              e.on("click", "opportunities-unclustered", p),
              e.on("click", "opportunities-cluster", p),
              e.on("mouseenter", "opportunities-unclustered", () => {
                e.getCanvas().style.cursor = "pointer";
              }),
              e.on("mouseleave", "opportunities-unclustered", () => {
                e.getCanvas().style.cursor = "";
              }),
              e.on("mouseenter", "opportunities-cluster", () => {
                e.getCanvas().style.cursor = "pointer";
              }),
              e.on("mouseleave", "opportunities-cluster", () => {
                e.getCanvas().style.cursor = "";
              }),
              () => {
                (e.off("click", "opportunities-unclustered", p),
                  e.off("click", "opportunities-cluster", p));
              }
            );
        }, [t, p]),
        n)
          ? (0, r.jsxs)(r.Fragment, {
              children: [
                (0, r.jsxs)(i.kL, {
                  id: "opportunities",
                  type: "geojson",
                  data: n,
                  cluster: !0,
                  clusterRadius: 50,
                  clusterMaxZoom: 14,
                  children: [
                    (0, r.jsx)(i.Wd, { ...s }),
                    (0, r.jsx)(i.Wd, { ...c }),
                    (0, r.jsx)(i.Wd, { ...d }),
                  ],
                }),
                a &&
                  (0, r.jsx)(i.zD, {
                    longitude: a.longitude,
                    latitude: a.latitude,
                    onClose: () => u(null),
                    closeOnClick: !1,
                    anchor: "bottom",
                    maxWidth: "320px",
                    children: (0, r.jsxs)("div", {
                      style: { fontFamily: "'DM Sans', sans-serif" },
                      children: [
                        (0, r.jsx)("div", {
                          style: {
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#bbf7d0",
                            marginBottom: 6,
                          },
                          children: a.feature.project_name,
                        }),
                        (0, r.jsxs)("div", {
                          style: {
                            fontSize: 12,
                            color: "rgba(240,237,232,0.7)",
                            marginBottom: 4,
                          },
                          children: [a.feature.city, ", ", a.feature.state],
                        }),
                        (0, r.jsxs)("div", {
                          style: {
                            display: "flex",
                            gap: 12,
                            marginBottom: 4,
                            fontSize: 12,
                          },
                          children: [
                            (0, r.jsxs)("span", {
                              children: [
                                "Score:",
                                " ",
                                (0, r.jsx)("strong", {
                                  style: {
                                    color:
                                      (e = Number(a.feature.signal_score)) >= 8
                                        ? "#22c55e"
                                        : e >= 5
                                          ? "#eab308"
                                          : "#6b7280",
                                  },
                                  children: a.feature.signal_score,
                                }),
                              ],
                            }),
                            (0, r.jsx)("span", {
                              style: { color: "rgba(240,237,232,0.5)" },
                              children: a.feature.priority_band,
                            }),
                          ],
                        }),
                        a.feature.company_name &&
                          (0, r.jsx)("div", {
                            style: {
                              fontSize: 12,
                              color: "rgba(240,237,232,0.6)",
                            },
                            children: a.feature.company_name,
                          }),
                      ],
                    }),
                  }),
              ],
            })
          : null;
      }
      let p = {
        id: "signals-points",
        type: "circle",
        source: "signals",
        paint: {
          "circle-color": "#06b6d4",
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "confidence"],
            0.3,
            3,
            0.6,
            5,
            0.9,
            8,
          ],
          "circle-opacity": 0.7,
          "circle-stroke-width": 1,
          "circle-stroke-color": "rgba(6,182,212,0.3)",
        },
      };
      function g() {
        let { current: e } = (0, i.ko)(),
          [t, n] = (0, o.useState)(null),
          [l, a] = (0, o.useState)(null);
        (0, o.useEffect)(() => {
          fetch("/platform/cranegenius_signals.json")
            .then((e) => e.json())
            .then((e) => {
              n({
                type: "FeatureCollection",
                features: e
                  .filter((e) => e.lat && e.lng)
                  .map((e) => ({
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [e.lng, e.lat] },
                    properties: {
                      id: e.id,
                      signal_type: e.signal_type,
                      signal_category: e.signal_category,
                      geography: e.geography,
                      confidence: e.confidence,
                      signal_date: e.signal_date,
                      vertical_tags: (e.vertical_tags || []).join(", "),
                    },
                  })),
              });
            })
            .catch(console.error);
        }, []);
        let s = (0, o.useCallback)((e) => {
          if (!e.features || 0 === e.features.length) return;
          let t = e.features[0],
            n = t.geometry.coordinates.slice();
          a({ longitude: n[0], latitude: n[1], feature: t.properties });
        }, []);
        return ((0, o.useEffect)(() => {
          let t = null == e ? void 0 : e.getMap();
          if (t)
            return (
              t.on("click", "signals-points", s),
              t.on("mouseenter", "signals-points", () => {
                t.getCanvas().style.cursor = "pointer";
              }),
              t.on("mouseleave", "signals-points", () => {
                t.getCanvas().style.cursor = "";
              }),
              () => {
                t.off("click", "signals-points", s);
              }
            );
        }, [e, s]),
        t)
          ? (0, r.jsxs)(r.Fragment, {
              children: [
                (0, r.jsx)(i.kL, {
                  id: "signals",
                  type: "geojson",
                  data: t,
                  children: (0, r.jsx)(i.Wd, { ...p }),
                }),
                l &&
                  (0, r.jsx)(i.zD, {
                    longitude: l.longitude,
                    latitude: l.latitude,
                    onClose: () => a(null),
                    closeOnClick: !1,
                    anchor: "bottom",
                    maxWidth: "300px",
                    children: (0, r.jsxs)("div", {
                      style: { fontFamily: "'DM Sans', sans-serif" },
                      children: [
                        (0, r.jsx)("div", {
                          style: {
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#06b6d4",
                            marginBottom: 6,
                            textTransform: "capitalize",
                          },
                          children: String(l.feature.signal_type).replace(
                            /_/g,
                            " ",
                          ),
                        }),
                        (0, r.jsx)("div", {
                          style: {
                            fontSize: 12,
                            color: "rgba(240,237,232,0.7)",
                            marginBottom: 4,
                          },
                          children: l.feature.geography,
                        }),
                        (0, r.jsxs)("div", {
                          style: {
                            display: "flex",
                            gap: 12,
                            marginBottom: 4,
                            fontSize: 12,
                          },
                          children: [
                            (0, r.jsxs)("span", {
                              children: [
                                "Confidence:",
                                " ",
                                (0, r.jsxs)("strong", {
                                  style: { color: "#06b6d4" },
                                  children: [
                                    (
                                      100 * Number(l.feature.confidence)
                                    ).toFixed(0),
                                    "%",
                                  ],
                                }),
                              ],
                            }),
                            (0, r.jsx)("span", {
                              style: { color: "rgba(240,237,232,0.5)" },
                              children: l.feature.signal_category,
                            }),
                          ],
                        }),
                        (0, r.jsx)("div", {
                          style: {
                            fontSize: 11,
                            color: "rgba(240,237,232,0.4)",
                          },
                          children: l.feature.signal_date,
                        }),
                      ],
                    }),
                  }),
              ],
            })
          : null;
      }
      let f = {
          forklifts: {
            id: "forklifts",
            label: "Forklifts",
            signalTypes: ["building_permit", "site_prep"],
            tags: ["specialty_lift", "heavy_haul"],
            color: "#f59e0b",
          },
          steel_erection: {
            id: "steel_erection",
            label: "Steel Erection",
            signalTypes: ["structural_steel", "foundation_permit"],
            tags: ["rigging", "tower_cranes", "mobile_cranes"],
            color: "#ef4444",
          },
          earth_moving: {
            id: "earth_moving",
            label: "Earth Moving",
            signalTypes: [
              "site_prep",
              "excavation",
              "demolition_permit",
              "foundation_permit",
            ],
            tags: ["heavy_haul"],
            color: "#8b5cf6",
          },
          rigging: {
            id: "rigging",
            label: "Rigging",
            signalTypes: [
              "structural_steel",
              "crane_permit",
              "utility_expansion",
            ],
            tags: ["rigging", "heavy_haul", "heavy_lift"],
            color: "#06b6d4",
          },
          concrete_pumping: {
            id: "concrete_pumping",
            label: "Concrete Pumping",
            signalTypes: ["foundation_permit", "concrete_pour"],
            tags: ["tower_cranes", "mobile_cranes"],
            color: "#10b981",
          },
        },
        y = {
          totalOpportunities: 0,
          hotOpportunities: 0,
          signalCount: 0,
          averageSignalScore: 0,
          marketLeaders: [],
          intelLayers: {},
          equipmentCounts: {},
        },
        x = new Set(["hot", "critical"]),
        h = (0, o.createContext)(void 0);
      function m(e, t, n, r) {
        return e.some((e) => e.id === t)
          ? e.map((e) => (e.id === t ? { ...e, status: n, detail: r } : e))
          : e;
      }
      async function b(e) {
        let t = await fetch(e, { cache: "no-store" });
        if (!t.ok)
          throw Error("Failed to fetch ".concat(e, ": ").concat(t.status));
        return t.json();
      }
      function v(e) {
        let { children: t } = e,
          [n, i] = (0, o.useState)([]),
          [l, a] = (0, o.useState)([]),
          [s, c] = (0, o.useState)(!0),
          [d, u] = (0, o.useState)(null),
          [p, g] = (0, o.useState)([
            {
              id: "opportunities",
              label: "Opportunities dataset",
              status: "pending",
            },
            { id: "signals", label: "Signals dataset", status: "pending" },
          ]),
          v = (0, o.useCallback)(async () => {
            (c(!0),
              u(null),
              g((e) =>
                m(m(e, "opportunities", "pending"), "signals", "pending"),
              ));
            try {
              let [e, t] = await Promise.all([
                b("/platform/cranegenius_opportunities.json"),
                b("/platform/cranegenius_signals.json"),
              ]);
              (i(e),
                a(t),
                g((n) =>
                  m(
                    m(
                      n,
                      "opportunities",
                      "ok",
                      "".concat(e.length.toLocaleString(), " records"),
                    ),
                    "signals",
                    "ok",
                    "".concat(t.length.toLocaleString(), " records"),
                  ),
                ));
            } catch (t) {
              let e = t instanceof Error ? t.message : "Unknown data error";
              (u(e),
                g((t) =>
                  m(m(t, "opportunities", "error", e), "signals", "error", e),
                ));
            } finally {
              c(!1);
            }
          }, []);
        (0, o.useEffect)(() => {
          v();
        }, [v]);
        let j = (0, o.useMemo)(
          () =>
            (function (e, t) {
              var n, r;
              let o =
                arguments.length > 2 && void 0 !== arguments[2]
                  ? arguments[2]
                  : f;
              if (!e.length && !t.length) return y;
              let i = e.length,
                l = e.filter((e) => {
                  var t;
                  return (
                    !!x.has((e.priority_band || "").toLowerCase()) ||
                    (null != (t = e.signal_score) ? t : 0) >= 8
                  );
                }).length,
                a = t.length,
                s =
                  0 === i
                    ? 0
                    : e.reduce((e, t) => e + (Number(t.signal_score) || 0), 0) /
                      i,
                c = new Map();
              e.forEach((e) => {
                if (!e.city && !e.state) return;
                let t = e.state
                  ? "".concat(e.city || "Unknown", ", ").concat(e.state)
                  : e.city || "Unknown";
                c.set(t, (c.get(t) || 0) + 1);
              });
              let d = Array.from(c.entries())
                  .sort((e, t) => t[1] - e[1])
                  .slice(0, 4),
                u = null != (r = null == (n = d[0]) ? void 0 : n[1]) ? r : 0,
                p = d.map((e) => {
                  let [t, n] = e;
                  return { name: t, value: n, maxValue: u || n || 1 };
                }),
                g = {};
              return (
                Object.entries(o).forEach((n) => {
                  let [r, o] = n;
                  g[r] = (function (e, t, n) {
                    let r = 0,
                      o = new Set();
                    for (let n of t) {
                      if (!n.lat || !n.lng) continue;
                      let t = e.signalTypes.some((e) => n.signal_type === e),
                        i = e.tags.some((e) =>
                          (n.vertical_tags || []).includes(e),
                        );
                      (t || i) && !o.has(n.id) && (o.add(n.id), r++);
                    }
                    for (let t of n) {
                      if (!t.lat || !t.lng) continue;
                      let n = t.recommended_lift_categories || [];
                      0 !== n.length &&
                        e.tags.some((e) => n.includes(e)) &&
                        !o.has(t.id) &&
                        (o.add(t.id), r++);
                    }
                    return r;
                  })(o, t, e);
                }),
                {
                  totalOpportunities: i,
                  hotOpportunities: l,
                  signalCount: a,
                  averageSignalScore: Number(s.toFixed(1)),
                  marketLeaders: p,
                  intelLayers: {
                    crane_opportunities: i,
                    industrial_signals: a,
                  },
                  equipmentCounts: g,
                }
              );
            })(n, l),
          [n, l],
        );
        return (0, r.jsx)(h.Provider, {
          value: {
            opportunities: n,
            signals: l,
            metrics: j,
            loading: s,
            error: d,
            diagnostics: p,
            refresh: v,
          },
          children: t,
        });
      }
      function j() {
        let e = (0, o.useContext)(h);
        if (!e)
          throw Error(
            "usePlatformData must be used within a PlatformDataProvider",
          );
        return e;
      }
      function S(e) {
        let { visibleVerticals: t } = e,
          { signals: n, opportunities: o } = j();
        return n.length || o.length
          ? (0, r.jsx)(r.Fragment, {
              children: Object.entries(f).map((e) => {
                let [l, a] = e;
                if (!t[l]) return null;
                let s = (function (e) {
                    let t = [];
                    for (let r of n) {
                      if (!r.lat || !r.lng) continue;
                      let n = e.signalTypes.some((e) => r.signal_type === e),
                        o = e.tags.some((e) =>
                          (r.vertical_tags || []).includes(e),
                        );
                      (n || o) &&
                        t.push({
                          type: "Feature",
                          geometry: {
                            type: "Point",
                            coordinates: [r.lng, r.lat],
                          },
                          properties: {
                            id: r.id,
                            type: "signal",
                            signal_type: r.signal_type,
                            geography: r.geography,
                          },
                        });
                    }
                    for (let n of o) {
                      if (!n.lat || !n.lng) continue;
                      let r = n.recommended_lift_categories || [];
                      e.tags.some((e) => r.includes(e)) &&
                        t.push({
                          type: "Feature",
                          geometry: {
                            type: "Point",
                            coordinates: [n.lng, n.lat],
                          },
                          properties: {
                            id: n.id,
                            type: "opportunity",
                            project_name: n.project_name,
                            score: n.signal_score,
                          },
                        });
                    }
                    return { type: "FeatureCollection", features: t };
                  })(a),
                  c = {
                    id: "equipment-".concat(l),
                    type: "circle",
                    source: "equipment-".concat(l),
                    paint: {
                      "circle-color": a.color,
                      "circle-radius": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        3,
                        3,
                        8,
                        5,
                        14,
                        8,
                      ],
                      "circle-opacity": 0.7,
                      "circle-stroke-width": 1,
                      "circle-stroke-color": "rgba(255,255,255,0.15)",
                    },
                  };
                return (0, r.jsx)(
                  i.kL,
                  {
                    id: "equipment-".concat(l),
                    type: "geojson",
                    data: s,
                    children: (0, r.jsx)(i.Wd, { ...c }),
                  },
                  l,
                );
              }),
            })
          : null;
      }
      var k = n(472),
        w = n.n(k);
      function I() {
        let { current: e } = (0, i.ko)(),
          t = (0, o.useCallback)(() => {
            navigator.geolocation &&
              navigator.geolocation.getCurrentPosition(
                (t) => {
                  null == e ||
                    e.flyTo({
                      center: [t.coords.longitude, t.coords.latitude],
                      zoom: 10,
                      duration: 1500,
                    });
                },
                () => {},
              );
          }, [e]),
          n = (0, o.useCallback)(() => {
            null == e ||
              e.flyTo({ center: [-98.5, 39.8], zoom: 4, duration: 1200 });
          }, [e]);
        return (0, r.jsxs)("div", {
          className: w().controls,
          children: [
            (0, r.jsx)("button", {
              className: w().controlButton,
              onClick: t,
              title: "Go to my location",
              "aria-label": "Locate me",
              children: (0, r.jsxs)("svg", {
                width: "16",
                height: "16",
                viewBox: "0 0 16 16",
                fill: "none",
                children: [
                  (0, r.jsx)("circle", {
                    cx: "8",
                    cy: "8",
                    r: "3",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                  }),
                  (0, r.jsx)("line", {
                    x1: "8",
                    y1: "0",
                    x2: "8",
                    y2: "4",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                  }),
                  (0, r.jsx)("line", {
                    x1: "8",
                    y1: "12",
                    x2: "8",
                    y2: "16",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                  }),
                  (0, r.jsx)("line", {
                    x1: "0",
                    y1: "8",
                    x2: "4",
                    y2: "8",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                  }),
                  (0, r.jsx)("line", {
                    x1: "12",
                    y1: "8",
                    x2: "16",
                    y2: "8",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                  }),
                ],
              }),
            }),
            (0, r.jsx)("button", {
              className: w().controlButton,
              onClick: n,
              title: "Reset to US view",
              "aria-label": "Reset view",
              children: (0, r.jsxs)("svg", {
                width: "16",
                height: "16",
                viewBox: "0 0 16 16",
                fill: "none",
                children: [
                  (0, r.jsx)("rect", {
                    x: "2",
                    y: "2",
                    width: "12",
                    height: "12",
                    rx: "2",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                  }),
                  (0, r.jsx)("circle", {
                    cx: "8",
                    cy: "8",
                    r: "2",
                    fill: "currentColor",
                  }),
                ],
              }),
            }),
          ],
        });
      }
      function M(e) {
        let { layers: t, children: n } = e,
          l = (0, o.useRef)(null),
          s = (0, o.useCallback)(() => {
            if (l.current) {
              let e = l.current.getMap();
              window.__cg_map = e;
            }
          }, []);
        return (0, r.jsxs)(i.Ay, {
          ref: l,
          initialViewState: { longitude: -98.5, latitude: 39.8, zoom: 4 },
          style: { width: "100%", height: "100%" },
          mapStyle: "/platform/map-style.json",
          mapLib: a(),
          onLoad: s,
          attributionControl: !0,
          maxZoom: 18,
          minZoom: 2,
          children: [
            (0, r.jsx)(i.ov, { position: "top-right" }),
            (0, r.jsx)(i.g0, { position: "bottom-right" }),
            t.opportunities && (0, r.jsx)(u, {}),
            t.signals && (0, r.jsx)(g, {}),
            (0, r.jsx)(S, {
              visibleVerticals: {
                forklifts: !1 !== t.forklifts,
                steel_erection: !1 !== t.steel_erection,
                earth_moving: !1 !== t.earth_moving,
                rigging: !1 !== t.rigging,
                concrete_pumping: !1 !== t.concrete_pumping,
              },
            }),
            (0, r.jsx)(I, {}),
            n,
          ],
        });
      }
      function C(e) {
        return e < 768 ? "mobile" : e < 1280 ? "tablet" : "desktop";
      }
      function E() {
        let [e, t] = (0, o.useState)(() => C(window.innerWidth));
        return (
          (0, o.useEffect)(() => {
            let e = () => t(C(window.innerWidth));
            return (
              window.addEventListener("resize", e),
              () => window.removeEventListener("resize", e)
            );
          }, []),
          {
            breakpoint: e,
            isMobile: "mobile" === e,
            isTablet: "tablet" === e,
            isDesktop: "desktop" === e,
          }
        );
      }
      let L = "capexlayer_sidebar_toggles";
      function z(e) {
        try {
          localStorage.setItem(L, JSON.stringify(e));
        } catch (e) {}
      }
      let _ = [
          {
            id: "crane_opportunities",
            label: "Crane Opportunit...",
            count: 2351,
            enabled: !0,
          },
          {
            id: "industrial_signals",
            label: "Industrial Signals",
            count: 3020,
            enabled: !0,
          },
        ],
        A = [
          { id: "forklifts", label: "Forklifts", count: 817, enabled: !0 },
          {
            id: "steel_erection",
            label: "Steel Erection",
            count: 2351,
            enabled: !0,
          },
          {
            id: "earth_moving",
            label: "Earth Moving",
            count: 1627,
            enabled: !0,
          },
          { id: "rigging", label: "Rigging", count: 1002, enabled: !0 },
          {
            id: "concrete_pumping",
            label: "Concrete Pumping",
            count: 2166,
            enabled: !0,
          },
        ],
        F = _.map((e) => e.id),
        D = A.map((e) => e.id),
        R = [...F, ...D];
      function T(e) {
        let { enabled: t, onToggle: n, label: o } = e;
        return (0, r.jsx)("button", {
          type: "button",
          role: "switch",
          "aria-checked": t,
          "aria-label": "Toggle ".concat(o),
          onClick: n,
          style: {
            width: 36,
            height: 18,
            borderRadius: 9,
            border: "none",
            background: t ? "#10b981" : "#1e293b",
            position: "relative",
            cursor: "pointer",
            transition: "background 0.2s",
            flexShrink: 0,
          },
          children: (0, r.jsx)("span", {
            style: {
              position: "absolute",
              top: 2,
              left: t ? 18 : 2,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: t ? "#fff" : "#64748b",
              transition: "left 0.2s",
            },
          }),
        });
      }
      function W(e) {
        let { layer: t, onToggle: n } = e;
        return (0, r.jsxs)("div", {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 0",
          },
          children: [
            (0, r.jsxs)("div", {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
              },
              children: [
                (0, r.jsx)("span", {
                  style: {
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: t.enabled ? "#10b981" : "#475569",
                    flexShrink: 0,
                  },
                }),
                (0, r.jsx)("span", {
                  style: {
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: t.enabled ? "#e2e8f0" : "#64748b",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                  children: t.label,
                }),
                (0, r.jsx)("span", {
                  style: {
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: "#c9a84c",
                    opacity: 0.7,
                  },
                  children: t.count,
                }),
              ],
            }),
            (0, r.jsx)(T, {
              enabled: t.enabled,
              onToggle: () => n(t.id),
              label: t.label,
            }),
          ],
        });
      }
      let O = () =>
          (0, r.jsxs)("svg", {
            width: "14",
            height: "14",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              (0, r.jsx)("circle", { cx: "12", cy: "12", r: "3" }),
              (0, r.jsx)("path", {
                d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
              }),
            ],
          }),
        B = () =>
          (0, r.jsxs)("svg", {
            width: "14",
            height: "14",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              (0, r.jsx)("polyline", { points: "23 4 23 10 17 10" }),
              (0, r.jsx)("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" }),
            ],
          }),
        N = () =>
          (0, r.jsx)("svg", {
            width: "14",
            height: "14",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: (0, r.jsx)("path", {
              d: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
            }),
          }),
        P = () =>
          (0, r.jsxs)("svg", {
            width: "14",
            height: "14",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              (0, r.jsx)("circle", { cx: "12", cy: "12", r: "10" }),
              (0, r.jsx)("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
              (0, r.jsx)("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" }),
            ],
          }),
        J = () =>
          (0, r.jsxs)("svg", {
            width: "12",
            height: "12",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              (0, r.jsx)("path", {
                d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
              }),
              (0, r.jsx)("circle", { cx: "12", cy: "12", r: "3" }),
            ],
          });
      function q(e) {
        let { layers: t, onLayerToggle: n, children: i } = e,
          [l, a] = (0, o.useState)({}),
          [s, c] = (0, o.useState)(!1),
          { metrics: d } = j(),
          { isMobile: u } = E();
        (0, o.useEffect)(() => {
          let e = (function () {
              try {
                let e = localStorage.getItem(L);
                return e ? JSON.parse(e) : {};
              } catch (e) {
                return {};
              }
            })(),
            t = {};
          ([..._, ...A].forEach((n) => {
            t[n.id] = void 0 !== e[n.id] ? e[n.id] : n.enabled;
          }),
            a(t));
        }, []);
        let p = t ? { ...l, ...t } : l,
          g = F.every((e) => !1 !== p[e]),
          f = D.every((e) => !1 !== p[e]);
        (0, o.useEffect)(() => {
          c(!u);
        }, [u]);
        let y = (0, o.useCallback)(
            (e) => {
              a((t) => {
                let r = { ...t, [e]: !t[e] };
                return (z(r), null == n || n(e, r[e]), r);
              });
            },
            [n],
          ),
          x = (0, o.useCallback)(
            (e, t) => {
              a((r) => {
                let o = { ...r };
                return (
                  e.forEach((e) => {
                    ((o[e] = t), null == n || n(e, t));
                  }),
                  z(o),
                  o
                );
              });
            },
            [n],
          ),
          h = (0, o.useCallback)(() => {
            x(F, !g);
          }, [g, x]),
          m = (0, o.useCallback)(() => {
            x(D, !f);
          }, [f, x]),
          b = (0, o.useCallback)(() => {
            let e = !(g && f);
            a((t) => {
              let r = { ...t };
              return (
                R.forEach((t) => {
                  ((r[t] = e), null == n || n(t, e));
                }),
                z(r),
                r
              );
            });
          }, [g, f, n]),
          v = _.map((e) => {
            var t, n;
            return {
              ...e,
              enabled: null != (t = p[e.id]) ? t : e.enabled,
              count: null != (n = d.intelLayers[e.id]) ? n : e.count,
            };
          }),
          S = A.map((e) => {
            var t, n;
            return {
              ...e,
              enabled: null != (t = p[e.id]) ? t : e.enabled,
              count: null != (n = d.equipmentCounts[e.id]) ? n : e.count,
            };
          }),
          k = u
            ? {
                position: "fixed",
                top: 8,
                left: 12,
                right: 12,
                background: "rgba(8,14,26,0.9)",
                border: "1px solid var(--border-primary)",
                borderRadius: 8,
                zIndex: 110,
                maxHeight: s ? "70vh" : 48,
                overflowY: "auto",
                transition: "max-height 0.2s ease",
              }
            : {
                position: "fixed",
                top: 0,
                left: 0,
                width: 220,
                height: "100vh",
                background: "var(--bg-secondary)",
                borderRight: "1px solid var(--border-primary)",
                display: "flex",
                flexDirection: "column",
                zIndex: 100,
                overflowY: "auto",
                overflowX: "hidden",
              },
          w = (0, r.jsxs)("div", {
            style: { display: "flex", flexDirection: "column", height: "100%" },
            children: [
              (0, r.jsxs)("div", {
                style: {
                  padding: "16px 14px 8px",
                  borderBottom: "1px solid var(--border-primary)",
                },
                children: [
                  (0, r.jsxs)("div", {
                    style: {
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 18,
                      fontWeight: 500,
                      letterSpacing: 2,
                    },
                    children: [
                      (0, r.jsx)("span", {
                        style: { color: "#ffffff" },
                        children: "CAPEX",
                      }),
                      (0, r.jsx)("span", {
                        style: { color: "#c9a84c" },
                        children: "LAYER",
                      }),
                    ],
                  }),
                  (0, r.jsx)("div", {
                    style: {
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      color: "#64748b",
                      letterSpacing: 1.5,
                      marginTop: 2,
                    },
                    children: "Industrial Intelligence Platform",
                  }),
                  (0, r.jsx)("div", {
                    style: {
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      color: "#475569",
                      marginTop: 6,
                    },
                    children: "CAPEX LAYER v1.0",
                  }),
                ],
              }),
              (0, r.jsx)("div", {
                style: {
                  display: "flex",
                  gap: 6,
                  padding: "8px 14px",
                  borderBottom: "1px solid var(--border-primary)",
                  color: "#64748b",
                },
                children: [O, B, N, P].map((e, t) =>
                  (0, r.jsx)(
                    "button",
                    {
                      style: {
                        background: "transparent",
                        border: "1px solid rgba(201,168,76,0.12)",
                        borderRadius: 4,
                        padding: "4px 6px",
                        cursor: "pointer",
                        color: "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      children: (0, r.jsx)(e, {}),
                    },
                    t,
                  ),
                ),
              }),
              (0, r.jsxs)("div", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px 4px",
                },
                children: [
                  (0, r.jsx)("span", {
                    style: {
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: 1.5,
                      color: "#c9a84c",
                    },
                    children: "DATA LAYERS",
                  }),
                  (0, r.jsxs)("div", {
                    style: { display: "flex", gap: 6 },
                    children: [
                      (0, r.jsx)("button", {
                        onClick: h,
                        style: {
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: g ? "#10b981" : "#475569",
                          display: "flex",
                          alignItems: "center",
                          padding: 2,
                        },
                        title: g
                          ? "Hide Crane + Industrial layers"
                          : "Show Crane + Industrial layers",
                        children: (0, r.jsx)(J, {}),
                      }),
                      (0, r.jsx)("button", {
                        onClick: b,
                        style: {
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: g && f ? "#c9a84c" : "#475569",
                          display: "flex",
                          alignItems: "center",
                          padding: 2,
                        },
                        title: "Toggle all layers",
                        children: (0, r.jsx)(O, {}),
                      }),
                    ],
                  }),
                ],
              }),
              (0, r.jsxs)("div", {
                style: { padding: "6px 14px 0" },
                children: [
                  (0, r.jsx)("div", {
                    style: {
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      letterSpacing: 1.2,
                      color: "#475569",
                      marginBottom: 4,
                    },
                    children: "CAPEX INTELLIGENCE",
                  }),
                  v.map((e) => (0, r.jsx)(W, { layer: e, onToggle: y }, e.id)),
                ],
              }),
              (0, r.jsxs)("div", {
                style: { padding: "12px 14px 0" },
                children: [
                  (0, r.jsxs)("div", {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      letterSpacing: 1.2,
                      color: "#475569",
                      marginBottom: 4,
                    },
                    children: [
                      "EQUIPMENT VERTICALS",
                      (0, r.jsx)("button", {
                        onClick: m,
                        style: {
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: f ? "#10b981" : "#475569",
                          display: "flex",
                          alignItems: "center",
                          padding: 2,
                        },
                        title: f
                          ? "Hide equipment overlays"
                          : "Show equipment overlays",
                        children: (0, r.jsx)(J, {}),
                      }),
                    ],
                  }),
                  S.map((e) => (0, r.jsx)(W, { layer: e, onToggle: y }, e.id)),
                ],
              }),
              i &&
                (0, r.jsx)("div", {
                  style: { padding: "8px 14px 0" },
                  children: i,
                }),
              (0, r.jsx)("div", { style: { flex: 1 } }),
              (0, r.jsx)("div", {
                style: {
                  padding: "8px 14px",
                  borderTop: "1px solid var(--border-primary)",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  color: "#334155",
                  textAlign: "center",
                },
                children: "CRANEGENIUS INC.",
              }),
            ],
          });
        return (0, r.jsxs)("aside", {
          style: k,
          children: [
            u &&
              (0, r.jsx)("button", {
                type: "button",
                onClick: () => c((e) => !e),
                style: {
                  width: "100%",
                  padding: "10px 12px",
                  background: "transparent",
                  border: "none",
                  color: "#c9a84c",
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: 1,
                  textAlign: "left",
                },
                "aria-expanded": s,
                children: s ? "Hide layers" : "Show layers",
              }),
            (s || !u) && w,
          ],
        });
      }
      let H = "cg_feed_toggles",
        U = {
          earthquake: !0,
          fire: !0,
          gdelt: !1,
          aviation: !1,
          maritime: !1,
          ukraine: !0,
          conflict: !1,
        },
        X = [
          {
            key: "earthquake",
            label: "Earthquakes",
            color: "#f97316",
            description: "USGS M2.5+ (24h)",
          },
          {
            key: "fire",
            label: "Wildfires",
            color: "#ef4444",
            description: "NASA EONET (7d)",
          },
          {
            key: "gdelt",
            label: "GDELT News",
            color: "#c9a84c",
            description: "Global news feed",
          },
          {
            key: "aviation",
            label: "Aviation",
            color: "#22d3ee",
            description: "ADS-B live",
          },
          {
            key: "maritime",
            label: "Maritime AIS",
            color: "#3b82f6",
            description: "AISStream live",
          },
          {
            key: "ukraine",
            label: "Ukraine Front",
            color: "#facc15",
            description: "Frontline data",
          },
          {
            key: "conflict",
            label: "Conflict Events",
            color: "#ef4444",
            description: "GDELT conflict",
          },
        ];
      function Y(e) {
        let { onChange: t, counts: n = {} } = e,
          [i, l] = (0, o.useState)(() => {
            try {
              let e = localStorage.getItem(H);
              if (e) return { ...U, ...JSON.parse(e) };
            } catch (e) {}
            return U;
          });
        (0, o.useEffect)(() => {
          try {
            localStorage.setItem(H, JSON.stringify(i));
          } catch (e) {}
          t(i);
        }, [i, t]);
        let a = (0, o.useCallback)((e) => {
          l((t) => ({ ...t, [e]: !t[e] }));
        }, []);
        return (0, r.jsxs)("div", {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "8px 0",
            fontFamily: "'DM Sans', system-ui, sans-serif",
          },
          children: [
            (0, r.jsx)("div", {
              style: {
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.2em",
                color: "var(--text-muted, #8899aa)",
                padding: "0 0 6px",
                textTransform: "uppercase",
                fontFamily: "'DM Mono', monospace",
              },
              children: "LIVE INTELLIGENCE FEEDS",
            }),
            X.map((e) => {
              let t = i[e.key],
                o = n[e.key];
              return (0, r.jsxs)(
                "button",
                {
                  type: "button",
                  "aria-pressed": t,
                  onClick: () => a(e.key),
                  style: {
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    cursor: "pointer",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                  },
                  children: [
                    (0, r.jsxs)("div", {
                      style: { display: "flex", alignItems: "center", gap: 10 },
                      children: [
                        (0, r.jsx)("div", {
                          style: {
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: t ? e.color : "transparent",
                            border: "1.5px solid ".concat(
                              t ? e.color : "rgba(255,255,255,0.15)",
                            ),
                            boxShadow: t
                              ? "0 0 8px ".concat(e.color, "44")
                              : "none",
                            transition: "all 0.2s",
                          },
                        }),
                        (0, r.jsxs)("div", {
                          children: [
                            (0, r.jsx)("div", {
                              style: {
                                fontSize: 13,
                                fontWeight: 500,
                                color: t
                                  ? "var(--text-primary, #e8f0ff)"
                                  : "var(--text-muted, #8899aa)",
                                transition: "color 0.2s",
                              },
                              children: e.label,
                            }),
                            (0, r.jsx)("div", {
                              style: {
                                fontSize: 9,
                                color: "var(--text-muted, #8899aa)",
                                fontFamily: "'DM Mono', monospace",
                                letterSpacing: "0.1em",
                                marginTop: 1,
                              },
                              children: e.description,
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, r.jsxs)("div", {
                      style: { display: "flex", alignItems: "center", gap: 8 },
                      children: [
                        null != o &&
                          o > 0 &&
                          (0, r.jsx)("span", {
                            style: {
                              fontSize: 9,
                              fontFamily: "'DM Mono', monospace",
                              color: t ? e.color : "#8899aa",
                              background: t
                                ? "".concat(e.color, "15")
                                : "transparent",
                              padding: "2px 6px",
                              borderRadius: 10,
                              letterSpacing: "0.05em",
                              transition: "all 0.2s",
                            },
                            children: o.toLocaleString(),
                          }),
                        (0, r.jsx)("div", {
                          style: {
                            fontSize: 9,
                            fontFamily: "'DM Mono', monospace",
                            fontWeight: 600,
                            letterSpacing: "0.15em",
                            padding: "2px 8px",
                            borderRadius: 20,
                            border: "1px solid ".concat(
                              t ? e.color : "rgba(255,255,255,0.15)",
                            ),
                            color: t
                              ? e.color
                              : "var(--text-muted, rgba(255,255,255,0.4))",
                            background: t ? "rgba(0,0,0,0.3)" : "transparent",
                            boxShadow: t
                              ? "0 0 10px ".concat(e.color, "33")
                              : "none",
                            transition: "all 0.2s",
                            userSelect: "none",
                          },
                          children: t ? "ON" : "OFF",
                        }),
                      ],
                    }),
                  ],
                },
                e.key,
              );
            }),
          ],
        });
      }
      let V = [
        { name: "New York", value: 34, maxValue: 40 },
        { name: "Los Angeles", value: 28, maxValue: 40 },
        { name: "North Carolina", value: 19, maxValue: 40 },
        { name: "Hartford", value: 14, maxValue: 40 },
      ];
      function G() {
        let [e, t] = (0, o.useState)("BRIEF"),
          { metrics: n, loading: i } = j(),
          { isMobile: l } = E(),
          a = (function (e) {
            let t =
                arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
              [n, r] = (0, o.useState)(e),
              i = (0, o.useRef)(!1),
              l = (0, o.useRef)({ x: 0, y: 0 }),
              a = (0, o.useCallback)(
                (e) => {
                  t ||
                    ((i.current = !0),
                    (l.current = { x: e.clientX - n.x, y: e.clientY - n.y }),
                    e.preventDefault());
                },
                [n, t],
              );
            return ((0, o.useEffect)(() => {
              let e = (e) => {
                  i.current &&
                    r({
                      x: e.clientX - l.current.x,
                      y: e.clientY - l.current.y,
                    });
                },
                t = () => {
                  i.current = !1;
                };
              return (
                window.addEventListener("mousemove", e),
                window.addEventListener("mouseup", t),
                () => {
                  (window.removeEventListener("mousemove", e),
                    window.removeEventListener("mouseup", t));
                }
              );
            }, []),
            t)
              ? { pos: e, onMouseDown: void 0 }
              : { pos: n, onMouseDown: a };
          })({ x: 10, y: 12 }, l),
          s = l ? { x: 0, y: 0 } : a.pos,
          c = l ? void 0 : a.onMouseDown,
          d = n.hotOpportunities || 0,
          u = n.signalCount || 0,
          p = n.averageSignalScore || 0,
          g = n.totalOpportunities || 0,
          f = n.marketLeaders.length ? n.marketLeaders : V,
          y =
            Object.values(n.intelLayers || {}).filter((e) => (e || 0) > 0)
              .length ||
            Object.keys(n.intelLayers || {}).length ||
            0;
        return (0, r.jsxs)("div", {
          style: {
            position: l ? "relative" : "absolute",
            left: s.x,
            top: s.y,
            width: l ? "calc(100% - 24px)" : 380,
            margin: l ? "12px auto" : 0,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            zIndex: 90,
            overflow: "hidden",
          },
          children: [
            (0, r.jsxs)("div", {
              onMouseDown: c,
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderBottom: "1px solid var(--border-primary)",
                cursor: c ? "grab" : "default",
                userSelect: "none",
              },
              children: [
                (0, r.jsxs)("div", {
                  style: { display: "flex", alignItems: "center", gap: 6 },
                  children: [
                    (0, r.jsx)("span", {
                      style: {
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#c9a84c",
                      },
                    }),
                    (0, r.jsx)("span", {
                      style: {
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: 1.5,
                        color: "#c9a84c",
                      },
                      children: "INDUSTRIAL INTELLIGENCE",
                    }),
                  ],
                }),
                (0, r.jsxs)("div", {
                  style: { display: "flex", gap: 4 },
                  children: [
                    (0, r.jsx)("span", {
                      style: {
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#334155",
                      },
                    }),
                    (0, r.jsx)("span", {
                      style: {
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#334155",
                      },
                    }),
                  ],
                }),
              ],
            }),
            (0, r.jsx)("div", {
              style: {
                display: "flex",
                borderBottom: "1px solid var(--border-primary)",
              },
              children: ["BRIEF", "SIGNALS", "HEATMAP"].map((n) =>
                (0, r.jsx)(
                  "button",
                  {
                    onClick: () => t(n),
                    style: {
                      flex: 1,
                      padding: "6px 0",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      letterSpacing: 1,
                      color: e === n ? "#c9a84c" : "#475569",
                      background:
                        e === n ? "rgba(201,168,76,0.08)" : "transparent",
                      border: "none",
                      borderBottom:
                        e === n ? "2px solid #c9a84c" : "2px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    },
                    children: n,
                  },
                  n,
                ),
              ),
            }),
            (0, r.jsxs)("div", {
              style: {
                padding: "10px 12px",
                maxHeight: 340,
                overflowY: "auto",
              },
              children: [
                "BRIEF" === e &&
                  (0, r.jsxs)(r.Fragment, {
                    children: [
                      (0, r.jsx)("div", {
                        style: {
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 9,
                          letterSpacing: 1.5,
                          color: "#475569",
                          marginBottom: 6,
                        },
                        children: "MARKET BRIEF",
                      }),
                      (0, r.jsx)("p", {
                        style: {
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 12,
                          color: "#94a3b8",
                          lineHeight: 1.5,
                          marginBottom: 12,
                        },
                        children: i
                          ? "Loading live intelligence metrics…"
                          : (0, r.jsxs)(r.Fragment, {
                              children: [
                                "Tracking ",
                                (0, r.jsx)("span", {
                                  style: { color: "#10b981", fontWeight: 500 },
                                  children: g.toLocaleString(),
                                }),
                                " ",
                                "active opportunities across",
                                " ",
                                (0, r.jsx)("span", {
                                  style: { color: "#c9a84c", fontWeight: 500 },
                                  children: y,
                                }),
                                " signal sources",
                              ],
                            }),
                      }),
                      (0, r.jsxs)("div", {
                        style: { display: "flex", gap: 8, marginBottom: 14 },
                        children: [
                          (0, r.jsxs)("div", {
                            style: {
                              flex: 1,
                              padding: "8px 10px",
                              background: "rgba(239,68,68,0.08)",
                              border: "1px solid rgba(239,68,68,0.2)",
                              borderRadius: 6,
                              textAlign: "center",
                            },
                            children: [
                              (0, r.jsx)("div", {
                                style: {
                                  fontFamily: "'DM Mono', monospace",
                                  fontSize: 20,
                                  fontWeight: 500,
                                  color: "#ef4444",
                                },
                                children: d.toLocaleString(),
                              }),
                              (0, r.jsx)("div", {
                                style: {
                                  fontFamily: "'DM Mono', monospace",
                                  fontSize: 8,
                                  color: "#64748b",
                                  letterSpacing: 0.8,
                                  marginTop: 2,
                                },
                                children: "HOT OPPS",
                              }),
                            ],
                          }),
                          (0, r.jsxs)("div", {
                            style: {
                              flex: 1,
                              padding: "8px 10px",
                              background: "rgba(234,179,8,0.08)",
                              border: "1px solid rgba(234,179,8,0.2)",
                              borderRadius: 6,
                              textAlign: "center",
                            },
                            children: [
                              (0, r.jsx)("div", {
                                style: {
                                  fontFamily: "'DM Mono', monospace",
                                  fontSize: 20,
                                  fontWeight: 500,
                                  color: "#eab308",
                                },
                                children: u.toLocaleString(),
                              }),
                              (0, r.jsx)("div", {
                                style: {
                                  fontFamily: "'DM Mono', monospace",
                                  fontSize: 8,
                                  color: "#64748b",
                                  letterSpacing: 0.8,
                                  marginTop: 2,
                                },
                                children: "SIGNALS",
                              }),
                            ],
                          }),
                          (0, r.jsxs)("div", {
                            style: {
                              flex: 1,
                              padding: "8px 10px",
                              background: "rgba(16,185,129,0.08)",
                              border: "1px solid rgba(16,185,129,0.2)",
                              borderRadius: 6,
                              textAlign: "center",
                            },
                            children: [
                              (0, r.jsx)("div", {
                                style: {
                                  fontFamily: "'DM Mono', monospace",
                                  fontSize: 20,
                                  fontWeight: 500,
                                  color: "#10b981",
                                },
                                children: p.toFixed(1),
                              }),
                              (0, r.jsx)("div", {
                                style: {
                                  fontFamily: "'DM Mono', monospace",
                                  fontSize: 8,
                                  color: "#64748b",
                                  letterSpacing: 0.8,
                                  marginTop: 2,
                                },
                                children: "AVG SCORE",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, r.jsx)("div", {
                        style: {
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 9,
                          letterSpacing: 1.5,
                          color: "#475569",
                          marginBottom: 8,
                        },
                        children: "TOP MARKETS",
                      }),
                      f.map((e) =>
                        (0, r.jsxs)(
                          "div",
                          {
                            style: { marginBottom: 8 },
                            children: [
                              (0, r.jsxs)("div", {
                                style: {
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom: 3,
                                },
                                children: [
                                  (0, r.jsx)("span", {
                                    style: {
                                      fontFamily: "'DM Sans', sans-serif",
                                      fontSize: 11,
                                      color: "#cbd5e1",
                                    },
                                    children: e.name,
                                  }),
                                  (0, r.jsx)("span", {
                                    style: {
                                      fontFamily: "'DM Mono', monospace",
                                      fontSize: 10,
                                      color: "#c9a84c",
                                    },
                                    children: e.value,
                                  }),
                                ],
                              }),
                              (0, r.jsx)("div", {
                                style: {
                                  width: "100%",
                                  height: 4,
                                  background: "#1e293b",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                },
                                children: (0, r.jsx)("div", {
                                  style: {
                                    width: "".concat(
                                      (e.value / e.maxValue) * 100,
                                      "%",
                                    ),
                                    height: "100%",
                                    background:
                                      "linear-gradient(90deg, #c9a84c, #10b981)",
                                    borderRadius: 2,
                                    transition: "width 0.5s ease",
                                  },
                                }),
                              }),
                            ],
                          },
                          e.name,
                        ),
                      ),
                    ],
                  }),
                "SIGNALS" === e &&
                  (0, r.jsx)("div", {
                    style: {
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      color: "#475569",
                      padding: "20px 0",
                      textAlign: "center",
                    },
                    children: "Signal feed loading...",
                  }),
                "HEATMAP" === e &&
                  (0, r.jsx)("div", {
                    style: {
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      color: "#475569",
                      padding: "20px 0",
                      textAlign: "center",
                    },
                    children: "Heatmap overlay loading...",
                  }),
              ],
            }),
          ],
        });
      }
      function K(e) {
        let {
            videoId: t,
            title: n,
            aspectRatio: i = "16/9",
            autoPlay: l = !0,
          } = e,
          [a, s] = (0, o.useState)(!1),
          c = "https://www.youtube.com/embed/"
            .concat(t, "?autoplay=")
            .concat(
              a && l ? 1 : 0,
              "&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1",
            );
        return (0, r.jsx)("div", {
          style: {
            position: "relative",
            width: "100%",
            aspectRatio: i,
            background: "#000",
            overflow: "hidden",
          },
          children: a
            ? (0, r.jsx)("iframe", {
                src: c,
                title: n,
                style: { border: "none", width: "100%", height: "100%" },
                allow: "autoplay; encrypted-media",
                loading: "lazy",
              })
            : (0, r.jsx)("button", {
                type: "button",
                onClick: () => s(!0),
                style: {
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                  cursor: "pointer",
                  backgroundImage:
                    "linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(".concat(
                      "https://img.youtube.com/vi/".concat(t, "/hqdefault.jpg"),
                      ")",
                    ),
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  letterSpacing: 0.1,
                },
                "aria-label": "Play ".concat(n, " stream"),
                children: (0, r.jsxs)("span", {
                  style: {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(0,0,0,0.6)",
                    padding: "8px 16px",
                    borderRadius: 999,
                  },
                  children: [
                    (0, r.jsx)("svg", {
                      width: "16",
                      height: "16",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "#c9a84c",
                      strokeWidth: "1.8",
                      children: (0, r.jsx)("polygon", {
                        points: "8 5 19 12 8 19 8 5",
                        fill: "#c9a84c",
                      }),
                    }),
                    "Tap to play",
                  ],
                }),
              }),
        });
      }
      let Z = [
        {
          id: "bloomberg",
          name: "BLOOMBERG",
          color: "#22d3ee",
          ytId: "f39oHo6vFLg",
        },
        {
          id: "bloomberg247",
          name: "BLOOMBERG 24/7",
          color: "#22d3ee",
          ytId: "iEpJwprxDdk",
        },
        {
          id: "france24",
          name: "FRANCE 24",
          color: "#3b82f6",
          ytId: "Ap-UM1O9RBU",
        },
        { id: "dw", name: "DW NEWS", color: "#f97316", ytId: "LuKwFajn37U" },
        {
          id: "aljazeera",
          name: "AL JAZEERA",
          color: "#c9a84c",
          ytId: "gCNeDWCI0vo",
        },
      ];
      function Q() {
        let [e, t] = (0, o.useState)(Z[0]),
          { isMobile: n } = E(),
          { pos: i, onMouseDown: l } = (function (e) {
            let t =
                arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
              [n, r] = (0, o.useState)(e),
              i = (0, o.useRef)(!1),
              l = (0, o.useRef)({ x: 0, y: 0 }),
              a = (0, o.useCallback)(
                (e) => {
                  t ||
                    ((i.current = !0),
                    (l.current = { x: e.clientX - n.x, y: e.clientY - n.y }),
                    e.preventDefault());
                },
                [n, t],
              );
            return ((0, o.useEffect)(() => {
              let e = (e) => {
                  i.current &&
                    r({
                      x: e.clientX - l.current.x,
                      y: e.clientY - l.current.y,
                    });
                },
                t = () => {
                  i.current = !1;
                };
              return (
                window.addEventListener("mousemove", e),
                window.addEventListener("mouseup", t),
                () => {
                  (window.removeEventListener("mousemove", e),
                    window.removeEventListener("mouseup", t));
                }
              );
            }, []),
            t)
              ? { pos: e, onMouseDown: void 0 }
              : { pos: n, onMouseDown: a };
          })({ x: 400, y: 12 }, n),
          a = n ? { x: 0, y: 0 } : i;
        return (0, r.jsxs)("div", {
          style: {
            position: n ? "relative" : "absolute",
            left: a.x,
            top: a.y,
            width: n ? "calc(100% - 24px)" : 300,
            margin: n ? "12px auto" : 0,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            zIndex: 80,
            overflow: "hidden",
          },
          children: [
            (0, r.jsxs)("div", {
              onMouseDown: l,
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderBottom: "1px solid var(--border-primary)",
                cursor: n ? "default" : "grab",
                userSelect: "none",
              },
              children: [
                (0, r.jsxs)("div", {
                  style: { display: "flex", alignItems: "center", gap: 6 },
                  children: [
                    (0, r.jsx)("span", {
                      style: {
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#ef4444",
                        animation: "pulse 2s infinite",
                      },
                    }),
                    (0, r.jsx)("span", {
                      style: {
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: 1.5,
                        color: "#c9a84c",
                      },
                      children: "LIVE NEWS",
                    }),
                  ],
                }),
                (0, r.jsx)("span", {
                  style: {
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    color: "#ef4444",
                    letterSpacing: 1,
                  },
                  children: "LIVE",
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              style: { position: "relative", width: "100%" },
              children: [
                (0, r.jsx)(K, { videoId: e.ytId, title: e.name }),
                (0, r.jsx)("div", {
                  style: {
                    position: "absolute",
                    top: 4,
                    left: 4,
                    background: "rgba(0,0,0,0.7)",
                    padding: "2px 6px",
                    borderRadius: 2,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 8,
                    color: e.color,
                    letterSpacing: 1,
                  },
                  children: e.name,
                }),
              ],
            }),
            (0, r.jsx)("div", {
              style: { maxHeight: 140, overflowY: "auto" },
              children: Z.map((n) =>
                (0, r.jsxs)(
                  "button",
                  {
                    onClick: () => t(n),
                    style: {
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 12px",
                      background:
                        e.id === n.id ? "rgba(0,255,255,0.05)" : "transparent",
                      borderLeft:
                        e.id === n.id
                          ? "2px solid #22d3ee"
                          : "2px solid transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(201,168,76,0.06)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s",
                    },
                    children: [
                      (0, r.jsx)("span", {
                        style: {
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: e.id === n.id ? "#ef4444" : n.color,
                          flexShrink: 0,
                          animation:
                            e.id === n.id ? "pulse 2s infinite" : "none",
                        },
                      }),
                      (0, r.jsx)("span", {
                        style: {
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 9,
                          letterSpacing: 1,
                          color: e.id === n.id ? "#22d3ee" : "#8a9bb5",
                        },
                        children: n.name,
                      }),
                      e.id === n.id &&
                        (0, r.jsx)("span", {
                          style: {
                            marginLeft: "auto",
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 7,
                            color: "#ef4444",
                          },
                          children: "LIVE",
                        }),
                    ],
                  },
                  n.id,
                ),
              ),
            }),
          ],
        });
      }
      let $ = [
          {
            label: "SpaceX Starbase",
            region: ["ALL", "AMERICAS", "SPACE"],
            src: "mhJRzQsLZGg",
          },
          {
            label: "Bills Stadium Build",
            region: ["ALL", "AMERICAS"],
            src: "23honLDP9IA",
          },
          {
            label: "Hotel Construction",
            region: ["ALL", "AMERICAS"],
            src: "dmEq_ddk0kw",
          },
          {
            label: "NC State Construct.",
            region: ["ALL", "AMERICAS"],
            src: "JjleB3PFJXA",
          },
          {
            label: "NYC Live",
            region: ["ALL", "AMERICAS", "MARKET"],
            src: "VGnFLdQW39A",
          },
          {
            label: "Vancouver Port",
            region: ["ALL", "AMERICAS", "MARKET"],
            src: "GHEmhcWjiTE",
          },
          {
            label: "Sydney Harbour",
            region: ["ALL", "ASIA"],
            src: "5uZa3-RMFos",
          },
          {
            label: "USU Construction",
            region: ["ALL", "AMERICAS"],
            src: "BjGl8raVRN0",
          },
        ],
        ee = ["ALL", "AMERICAS", "EUROPE", "MARKET", "ASIA", "SPACE"];
      function et() {
        let [e, t] = (0, o.useState)("ALL"),
          [n, i] = (0, o.useState)({}),
          { isMobile: l } = E(),
          { pos: a, onMouseDown: s } = (function (e) {
            let t =
                arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
              [n, r] = (0, o.useState)(e),
              i = (0, o.useRef)(!1),
              l = (0, o.useRef)({ x: 0, y: 0 }),
              a = (0, o.useCallback)(
                (e) => {
                  t ||
                    ((i.current = !0),
                    (l.current = { x: e.clientX - n.x, y: e.clientY - n.y }),
                    e.preventDefault());
                },
                [n, t],
              );
            return ((0, o.useEffect)(() => {
              let e = (e) => {
                  i.current &&
                    r({
                      x: e.clientX - l.current.x,
                      y: e.clientY - l.current.y,
                    });
                },
                t = () => {
                  i.current = !1;
                };
              return (
                window.addEventListener("mousemove", e),
                window.addEventListener("mouseup", t),
                () => {
                  (window.removeEventListener("mousemove", e),
                    window.removeEventListener("mouseup", t));
                }
              );
            }, []),
            t)
              ? { pos: e, onMouseDown: void 0 }
              : { pos: n, onMouseDown: a };
          })({ x: 710, y: 12 }, l),
          c = l ? { x: 0, y: 0 } : a,
          d = $.filter((t) => t.region.includes(e));
        return (0, r.jsxs)("div", {
          style: {
            position: l ? "relative" : "absolute",
            left: c.x,
            top: c.y,
            width: l ? "calc(100% - 24px)" : 360,
            margin: l ? "12px auto" : 0,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            zIndex: 80,
            overflow: "hidden",
          },
          children: [
            (0, r.jsxs)("div", {
              onMouseDown: s,
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderBottom: "1px solid var(--border-primary)",
                cursor: l ? "default" : "grab",
                userSelect: "none",
              },
              children: [
                (0, r.jsxs)("div", {
                  style: { display: "flex", alignItems: "center", gap: 6 },
                  children: [
                    (0, r.jsx)("span", {
                      style: {
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#10b981",
                      },
                    }),
                    (0, r.jsx)("span", {
                      style: {
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: 1.5,
                        color: "#c9a84c",
                      },
                      children: "LIVE WEBCAMS",
                    }),
                  ],
                }),
                (0, r.jsxs)("span", {
                  style: {
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    color: "#475569",
                  },
                  children: [d.length, " feeds"],
                }),
              ],
            }),
            (0, r.jsx)("div", {
              style: {
                display: "flex",
                borderBottom: "1px solid var(--border-primary)",
                overflowX: "auto",
              },
              children: ee.map((n) =>
                (0, r.jsx)(
                  "button",
                  {
                    onClick: () => t(n),
                    style: {
                      padding: "5px 8px",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      letterSpacing: 0.8,
                      color: e === n ? "#c9a84c" : "#475569",
                      background:
                        e === n ? "rgba(201,168,76,0.08)" : "transparent",
                      border: "none",
                      borderBottom:
                        e === n ? "2px solid #c9a84c" : "2px solid transparent",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s",
                    },
                    children: n,
                  },
                  n,
                ),
              ),
            }),
            (0, r.jsx)("div", {
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 6,
                padding: 10,
                maxHeight: 280,
                overflowY: "auto",
              },
              children: d.map((e) => {
                let t = n[e.label];
                return (0, r.jsxs)(
                  "button",
                  {
                    type: "button",
                    "aria-pressed": t,
                    onClick: () => i((n) => ({ ...n, [e.label]: !t })),
                    style: {
                      background: "#0a1020",
                      border: "1px solid rgba(201,168,76,0.1)",
                      borderRadius: 4,
                      overflow: "hidden",
                      cursor: "pointer",
                      padding: 0,
                      textAlign: "left",
                    },
                    children: [
                      (0, r.jsxs)("div", {
                        style: {
                          width: "100%",
                          aspectRatio: "16/10",
                          position: "relative",
                        },
                        children: [
                          t
                            ? (0, r.jsx)(K, {
                                videoId: e.src,
                                title: e.label,
                                aspectRatio: "16/10",
                              })
                            : (0, r.jsx)("div", {
                                style: {
                                  position: "absolute",
                                  inset: 0,
                                  background: "#000",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#c9a84c",
                                  fontFamily: "'DM Mono', monospace",
                                  fontSize: 10,
                                },
                                children: "Tap to play",
                              }),
                          (0, r.jsx)("span", {
                            style: {
                              position: "absolute",
                              top: 3,
                              left: 3,
                              padding: "1px 4px",
                              background: "#ef4444",
                              borderRadius: 2,
                              fontFamily: "'DM Mono', monospace",
                              fontSize: 6,
                              fontWeight: 700,
                              color: "#fff",
                              letterSpacing: 1,
                              zIndex: 2,
                            },
                            children: "LIVE",
                          }),
                          (0, r.jsx)("span", {
                            style: {
                              position: "absolute",
                              top: 3,
                              right: 3,
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: t ? "#10b981" : "#475569",
                              zIndex: 2,
                            },
                          }),
                        ],
                      }),
                      (0, r.jsx)("div", {
                        style: {
                          padding: "4px 5px",
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 8,
                          color: "#94a3b8",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          letterSpacing: 0.3,
                        },
                        children: e.label,
                      }),
                    ],
                  },
                  e.label,
                );
              }),
            }),
          ],
        });
      }
      function en(e) {
        let { leftOffset: t = 220 } = e,
          [n, i] = (0, o.useState)({ lat: "39.8000", lng: "-98.5000" }),
          [l, a] = (0, o.useState)("United States"),
          { isMobile: s } = E();
        return (
          (0, o.useEffect)(() => {
            let e = window.__cg_map;
            if (!e) return;
            let t = (e) => {
              i({ lat: e.lngLat.lat.toFixed(4), lng: e.lngLat.lng.toFixed(4) });
            };
            return (
              e.on("mousemove", t),
              () => {
                e.off("mousemove", t);
              }
            );
          }, []),
          (0, r.jsxs)("div", {
            style: {
              position: "fixed",
              bottom: 0,
              left: s ? 0 : t,
              right: 0,
              minHeight: s ? 36 : 28,
              background: "var(--bg-secondary)",
              borderTop: "1px solid var(--border-primary)",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 16px",
              zIndex: 100,
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: "#64748b",
            },
            children: [
              (0, r.jsxs)("div", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                },
                children: [
                  (0, r.jsx)(er, {
                    label: "COORDINATES",
                    value: "".concat(n.lat, ", ").concat(n.lng),
                  }),
                  (0, r.jsx)(ei, {}),
                  (0, r.jsx)(er, { label: "LOCATION", value: l }),
                  (0, r.jsx)(ei, {}),
                  (0, r.jsx)(er, { label: "STYLE", value: "DEFAULT" }),
                  (0, r.jsx)(ei, {}),
                  (0, r.jsx)(er, { label: "SOLAR", value: "N/A" }),
                ],
              }),
              (0, r.jsxs)("div", {
                style: { display: "flex", alignItems: "center", gap: 10 },
                children: [
                  (0, r.jsx)(eo, { label: "LOCATE" }),
                  (0, r.jsx)(eo, { label: "MEASURE" }),
                  (0, r.jsx)(ei, {}),
                  (0, r.jsx)(el, {}),
                ],
              }),
            ],
          })
        );
      }
      function er(e) {
        let { label: t, value: n } = e;
        return (0, r.jsxs)("div", {
          style: { display: "flex", alignItems: "center", gap: 6 },
          children: [
            (0, r.jsx)("span", {
              style: { color: "#475569", fontSize: 9, letterSpacing: 1 },
              children: t,
            }),
            (0, r.jsx)("span", { style: { color: "#94a3b8" }, children: n }),
          ],
        });
      }
      function eo(e) {
        let { label: t } = e;
        return (0, r.jsx)("button", {
          style: {
            fontFamily: "'DM Mono', monospace",
            fontSize: 9,
            letterSpacing: 1,
            color: "#c9a84c",
            background: "rgba(201,168,76,0.08)",
            border: "1px solid rgba(201,168,76,0.15)",
            borderRadius: 3,
            padding: "2px 8px",
            cursor: "pointer",
            transition: "background 0.15s",
          },
          children: t,
        });
      }
      function ei() {
        return (0, r.jsx)("span", {
          style: { width: 1, height: 14, background: "var(--border-primary)" },
        });
      }
      function el() {
        return (0, r.jsxs)("div", {
          style: { display: "flex", alignItems: "center", gap: 4 },
          children: [
            (0, r.jsx)("div", {
              style: {
                width: 50,
                height: 3,
                background: "linear-gradient(90deg, #475569, #c9a84c)",
                borderRadius: 1,
              },
            }),
            (0, r.jsx)("span", {
              style: { fontSize: 9, color: "#475569" },
              children: "100 mi",
            }),
          ],
        });
      }
      function ea() {
        let [e, t] = (0, o.useState)(""),
          [n, i] = (0, o.useState)(!1),
          { isMobile: l } = E(),
          a = "dashboard-search",
          s = (0, o.useCallback)((e) => {
            e.preventDefault();
          }, []);
        return (0, r.jsx)("div", {
          style: {
            position: l ? "fixed" : "absolute",
            top: l ? 8 : 12,
            right: 16,
            left: l ? 16 : "auto",
            zIndex: 90,
            width: l ? "auto" : 280,
          },
          children: (0, r.jsxs)("form", {
            onSubmit: s,
            children: [
              (0, r.jsx)("label", {
                htmlFor: a,
                className: "sr-only",
                children: "Search projects, permits, and signals",
              }),
              (0, r.jsxs)("div", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  background: "var(--bg-secondary)",
                  border: "1px solid ".concat(
                    n ? "rgba(201,168,76,0.4)" : "var(--border-primary)",
                  ),
                  borderRadius: 6,
                  padding: "0 10px",
                  transition: "border-color 0.2s",
                },
                children: [
                  (0, r.jsxs)("svg", {
                    width: "14",
                    height: "14",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: n ? "#c9a84c" : "#475569",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    style: { flexShrink: 0 },
                    children: [
                      (0, r.jsx)("circle", { cx: "11", cy: "11", r: "8" }),
                      (0, r.jsx)("path", { d: "m21 21-4.3-4.3" }),
                    ],
                  }),
                  (0, r.jsx)("input", {
                    type: "text",
                    value: e,
                    onChange: (e) => t(e.target.value),
                    onFocus: () => i(!0),
                    onBlur: () => i(!1),
                    placeholder: "Search projects, permits, signals...",
                    id: a,
                    style: {
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      color: "#e2e8f0",
                      padding: "8px 8px",
                      letterSpacing: 0.3,
                    },
                  }),
                  e &&
                    (0, r.jsx)("button", {
                      type: "button",
                      onClick: () => t(""),
                      style: {
                        background: "none",
                        border: "none",
                        color: "#475569",
                        cursor: "pointer",
                        padding: 2,
                        fontSize: 14,
                        lineHeight: 1,
                        display: "flex",
                      },
                      "aria-label": "Clear search query",
                      children: "\xd7",
                    }),
                ],
              }),
            ],
          }),
        });
      }
      let es = {
          id: "cg-earthquake-circles",
          type: "circle",
          paint: {
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "mag"],
              2.5,
              "#facc15",
              4,
              "#f97316",
              5,
              "#ef4444",
            ],
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", "mag"],
              2.5,
              4,
              5,
              8,
              7,
              14,
            ],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "rgba(0,0,0,0.4)",
            "circle-opacity": 0.85,
          },
        },
        ec = { type: "FeatureCollection", features: [] };
      function ed(e) {
        var t;
        let { visible: n } = e,
          [l, a] = (0, o.useState)(ec),
          [s, c] = (0, o.useState)(null),
          d = (0, o.useRef)(null),
          { current: u } = (0, i.ko)(),
          p = (0, o.useCallback)(async () => {
            try {
              let e = await fetch(
                "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
                { signal: AbortSignal.timeout(1e4) },
              );
              if (!e.ok) return;
              let t = await e.json();
              (null == t ? void 0 : t.type) === "FeatureCollection" && a(t);
            } catch (e) {}
          }, []);
        return ((0, o.useEffect)(() => {
          if (n)
            return (
              p(),
              (d.current = setInterval(p, 3e5)),
              () => {
                d.current && clearInterval(d.current);
              }
            );
        }, [n, p]),
        (0, o.useEffect)(() => {
          if (!n) return void c(null);
          let e = null == u ? void 0 : u.getMap();
          if (!e) return;
          let t = (e) => {
            var t;
            let n = null == (t = e.features) ? void 0 : t[0];
            n &&
              c({
                lng: e.lngLat.lng,
                lat: e.lngLat.lat,
                properties: n.properties,
              });
          };
          return (
            e.on("click", "cg-earthquake-circles", t),
            () => {
              e.off("click", "cg-earthquake-circles", t);
            }
          );
        }, [u, n]),
        n)
          ? (0, r.jsxs)(r.Fragment, {
              children: [
                (0, r.jsx)(i.kL, {
                  id: "cg-earthquake",
                  type: "geojson",
                  data: l,
                  children: (0, r.jsx)(i.Wd, { ...es }),
                }),
                s &&
                  (0, r.jsx)(i.zD, {
                    longitude: s.lng,
                    latitude: s.lat,
                    onClose: () => c(null),
                    closeOnClick: !1,
                    maxWidth: "280px",
                    children: (0, r.jsxs)("div", {
                      style: {
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        padding: 2,
                      },
                      children: [
                        (0, r.jsxs)("div", {
                          style: {
                            fontSize: 10,
                            color:
                              s.properties.mag >= 5 ? "#ef4444" : "#f97316",
                            fontWeight: 700,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            marginBottom: 4,
                          },
                          children: [
                            "M",
                            null == (t = s.properties.mag)
                              ? void 0
                              : t.toFixed(1),
                            " EARTHQUAKE",
                          ],
                        }),
                        (0, r.jsx)("div", {
                          style: {
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#e8f0ff",
                            marginBottom: 4,
                            lineHeight: 1.3,
                          },
                          children: s.properties.place || "Unknown location",
                        }),
                        (0, r.jsx)("div", {
                          style: { fontSize: 11, color: "#8899aa" },
                          children: s.properties.time
                            ? new Date(s.properties.time).toLocaleString()
                            : "",
                        }),
                      ],
                    }),
                  }),
              ],
            })
          : null;
      }
      ed.interactiveLayerIds = ["cg-earthquake-circles"];
      let eu = {
          id: "cg-fire-hotspots",
          type: "circle",
          paint: {
            "circle-color": "rgba(249, 115, 22, 0.85)",
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              2,
              4,
              6,
              6,
              10,
              8,
            ],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "rgba(220, 38, 38, 0.9)",
            "circle-opacity": 0.85,
          },
        },
        ep = { type: "FeatureCollection", features: [] };
      function eg(e) {
        let { visible: t } = e,
          [n, l] = (0, o.useState)(ep),
          [a, s] = (0, o.useState)(null),
          c = (0, o.useRef)(null),
          { current: d } = (0, i.ko)(),
          u = (0, o.useCallback)(async () => {
            try {
              let e = await fetch(
                "https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&days=7&status=open",
                { signal: AbortSignal.timeout(15e3) },
              );
              if (!e.ok) return;
              let t = await e.json();
              l(
                (function (e) {
                  let t = null == e ? void 0 : e.events;
                  return Array.isArray(t)
                    ? {
                        type: "FeatureCollection",
                        features: t.flatMap((e) =>
                          (e.geometry || [])
                            .filter(
                              (e) => e.coordinates && e.coordinates.length >= 2,
                            )
                            .map((t, n) => ({
                              type: "Feature",
                              properties: {
                                id: e.id || "fire-".concat(n),
                                title: e.title || "Wildfire",
                                date: t.date || "",
                              },
                              geometry: {
                                type: "Point",
                                coordinates: [
                                  t.coordinates[0],
                                  t.coordinates[1],
                                ],
                              },
                            })),
                        ),
                      }
                    : ep;
                })(t),
              );
            } catch (e) {}
          }, []);
        return ((0, o.useEffect)(() => {
          if (t)
            return (
              u(),
              (c.current = setInterval(u, 3e5)),
              () => {
                c.current && clearInterval(c.current);
              }
            );
        }, [t, u]),
        (0, o.useEffect)(() => {
          if (!t) return void s(null);
          let e = null == d ? void 0 : d.getMap();
          if (!e) return;
          let n = (e) => {
            var t;
            let n = null == (t = e.features) ? void 0 : t[0];
            n &&
              s({
                lng: e.lngLat.lng,
                lat: e.lngLat.lat,
                properties: n.properties,
              });
          };
          return (
            e.on("click", "cg-fire-hotspots", n),
            () => {
              e.off("click", "cg-fire-hotspots", n);
            }
          );
        }, [d, t]),
        t)
          ? (0, r.jsxs)(r.Fragment, {
              children: [
                (0, r.jsx)(i.kL, {
                  id: "cg-fire-hotspots",
                  type: "geojson",
                  data: n,
                  children: (0, r.jsx)(i.Wd, { ...eu }),
                }),
                a &&
                  (0, r.jsx)(i.zD, {
                    longitude: a.lng,
                    latitude: a.lat,
                    onClose: () => s(null),
                    closeOnClick: !1,
                    maxWidth: "280px",
                    children: (0, r.jsxs)("div", {
                      style: {
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        padding: 2,
                      },
                      children: [
                        (0, r.jsx)("div", {
                          style: {
                            fontSize: 10,
                            color: "#f97316",
                            fontWeight: 700,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            marginBottom: 4,
                          },
                          children: "WILDFIRE EVENT",
                        }),
                        (0, r.jsx)("div", {
                          style: {
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#e8f0ff",
                            marginBottom: 4,
                            lineHeight: 1.3,
                          },
                          children: a.properties.title,
                        }),
                        (0, r.jsx)("div", {
                          style: { fontSize: 11, color: "#8899aa" },
                          children: a.properties.date
                            ? new Date(a.properties.date).toLocaleString()
                            : "",
                        }),
                      ],
                    }),
                  }),
              ],
            })
          : null;
      }
      eg.interactiveLayerIds = ["cg-fire-hotspots"];
      let ef =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbmFnbGhhaWx1Zmx5bmlycXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwOTc0MjIsImV4cCI6MjA5MDY3MzQyMn0.-d_IxHBAEXa_DoahB7pqzNp7hEWyh5lNXa7gVxYMvCU",
        gdeltLanguageOptions = [
          { id: "en", label: "English" },
          { id: "es", label: "Spanish" },
          { id: "pt", label: "Portuguese" },
          { id: "fr", label: "French" },
          { id: "de", label: "German" },
          { id: "original", label: "Original" },
        ],
        gdeltTranslationCache = new Map();
      async function translateGdeltTitle(e, t) {
        if (!e || "original" === t) return e;
        let n = "".concat(t, ":").concat(e);
        if (gdeltTranslationCache.has(n)) return gdeltTranslationCache.get(n);
        let r = await fetch(
          "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl="
            .concat(t, "&dt=t&q=")
            .concat(encodeURIComponent(e)),
        );
        if (!r.ok) throw Error("Translation failed");
        let o = await r.json(),
          i = Array.isArray(null == o ? void 0 : o[0])
            ? o[0].map((e) => e[0]).join("")
            : e;
        return gdeltTranslationCache.set(n, i), i;
      }
      function ey(e) {
        let { visible: t } = e,
          [n, i] = (0, o.useState)([]),
          [l, a] = (0, o.useState)(!1),
          s = (0, o.useRef)(null),
          c = (0, o.useCallback)(async () => {
            a(!0);
            try {
              let e = await fetch(
                "https://qdnaglhailuflynirqtt.supabase.co/functions/v1/live-feeds?feed=gdelt",
                {
                  headers: { apikey: ef, Authorization: "Bearer ".concat(ef) },
                  signal: AbortSignal.timeout(1e4),
                },
              );
              if (!e.ok) return;
              let t = await e.json(),
                n =
                  (null == t ? void 0 : t.articles) ||
                  (null == t ? void 0 : t.data) ||
                  [];
              Array.isArray(n) && i(n.slice(0, 50));
            } catch (e) {
            } finally {
              a(!1);
            }
          }, []),
          [language, setLanguage] = (0, o.useState)("en"),
          [translatedTitles, setTranslatedTitles] = (0, o.useState)({}),
          [isTranslating, setIsTranslating] = (0, o.useState)(!1),
          [translationError, setTranslationError] = (0, o.useState)(null);
        return ((0, o.useEffect)(() => {
          if (t)
            return (
              c(),
              (s.current = setInterval(c, 3e5)),
              () => {
                s.current && clearInterval(s.current);
              }
            );
        }, [t, c]),
        (0, o.useEffect)(() => {
          if (!n.length || "original" === language)
            return (
              setIsTranslating(!1),
              void setTranslationError(null)
            );
          let e = !1;
          setIsTranslating(!0), setTranslationError(null);
          let t = async () => {
            try {
              let t = {},
                r = n.slice(0, 40);
              for (let o of r) {
                let r = await translateGdeltTitle(o.title || "", language);
                if (e) return;
                t[o.url] = r;
              }
              e ||
                (setTranslatedTitles((e) => {
                  let n = { ...e };
                  return (
                    Object.entries(t).forEach(([e, t]) => {
                      n[e] = { ...(n[e] || {}), [language]: t };
                    }),
                    n
                  );
                }),
                setIsTranslating(!1));
            } catch (t) {
              e ||
                (console.error("GDELT translation error", t),
                setTranslationError(
                  "Translation temporarily unavailable. Showing original titles.",
                ),
                setIsTranslating(!1));
            }
          };
          return (
            t(),
            () => {
              e = !0;
            }
          );
        }, [n, language]),
        t)
          ? (0, r.jsxs)("div", {
              style: {
                position: "absolute",
                top: 80,
                right: 16,
                width: 340,
                maxHeight: "calc(100vh - 120px)",
                overflowY: "auto",
                background: "rgba(13, 21, 37, 0.95)",
                border: "1px solid rgba(201, 168, 76, 0.2)",
                borderRadius: 8,
                zIndex: 20,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                padding: "12px 0",
              },
              children: [
                (() => {
                  let e =
                    gdeltLanguageOptions.find((e) => e.id === language) ||
                    gdeltLanguageOptions[0];
                  return (0, r.jsxs)("div", {
                    style: {
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      color: "#c9a84c",
                      padding: "0 14px 8px",
                      borderBottom: "1px solid rgba(201, 168, 76, 0.15)",
                      textTransform: "uppercase",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 12,
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                    children: [
                      (0, r.jsxs)("div", {
                        style: { display: "flex", alignItems: "center", gap: 8 },
                        children: [
                          "GDELT NEWS FEED",
                          (0, r.jsx)("span", {
                            style: {
                              fontSize: 9,
                              color: "#8899aa",
                              fontWeight: 400,
                              letterSpacing: "0.1em",
                            },
                            children: l
                              ? "loading..."
                              : "".concat(n.length, " articles"),
                          }),
                        ],
                      }),
                      (0, r.jsxs)("div", {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontFamily: "'DM Sans', sans-serif",
                          textTransform: "none",
                          letterSpacing: 0,
                        },
                        children: [
                          (0, r.jsx)("span", {
                            style: {
                              fontSize: 9,
                              color: "#94a3b8",
                              letterSpacing: "0.1em",
                            },
                            children: "Language",
                          }),
                          (0, r.jsx)("select", {
                            value: language,
                            onChange: (t) => setLanguage(t.target.value),
                            style: {
                              background: "rgba(15,23,42,0.8)",
                              border: "1px solid rgba(148,163,184,0.3)",
                              color: "#e2e8f0",
                              fontSize: 10,
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontFamily: "'DM Mono', monospace",
                              letterSpacing: "0.1em",
                            },
                            children: gdeltLanguageOptions.map((t) =>
                              (0, r.jsx)("option", { value: t.id, children: t.label }, t.id),
                            ),
                          }),
                        ],
                      }),
                    ],
                  });
                })(),
                "original" !== language &&
                  (0, r.jsx)("div", {
                    style: {
                      padding: "6px 14px 0",
                      fontSize: 10,
                      color: "#94a3b8",
                      fontFamily: "'DM Sans', sans-serif",
                    },
                    children: isTranslating
                      ? "Translating latest headlines\u2026"
                      : "Showing articles in ".concat(
                          (
                            gdeltLanguageOptions.find(
                              (e) => e.id === language,
                            ) || gdeltLanguageOptions[0]
                          ).label,
                        ),
                  }),
                translationError &&
                  (0, r.jsx)("div", {
                    style: {
                      padding: "4px 14px",
                      fontSize: 10,
                      color: "#fecdd3",
                      fontFamily: "'DM Sans', sans-serif",
                    },
                    children: translationError,
                  }),
                0 === n.length &&
                  !l &&
                  (0, r.jsx)("div", {
                    style: {
                      padding: "20px 14px",
                      color: "#8899aa",
                      fontSize: 12,
                      textAlign: "center",
                    },
                    children: "No articles available",
                  }),
                n.map((e, t) =>
                  (0, r.jsxs)(
                    "a",
                    {
                      href: e.url,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      style: {
                        display: "block",
                        padding: "10px 14px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        textDecoration: "none",
                      },
                      children: [
                        (() => {
                          let t =
                              (translatedTitles[e.url] || {})[language],
                            o =
                              "original" === language || !t
                                ? e.title || "Untitled"
                                : t;
                          return (0, r.jsxs)("div", {
                            children: [
                              (0, r.jsx)("div", {
                                style: {
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: "#e8f0ff",
                                  lineHeight: 1.4,
                                },
                                children: o,
                              }),
                              "original" !== language &&
                                (0, r.jsxs)("div", {
                                  style: {
                                    fontSize: 9,
                                    color: "#94a3b8",
                                    marginTop: 4,
                                  },
                                  children: [
                                    t
                                      ? "Translated from ".concat(
                                          (e.language || "auto").toUpperCase(),
                                        )
                                      : "Translating headline\u2026",
                                    t &&
                                      (0, r.jsx)("span", {
                                        style: {
                                          display: "block",
                                          marginTop: 2,
                                          color: "#64748b",
                                          fontStyle: "italic",
                                        },
                                        children: "Original: ".concat(
                                          e.title || "Untitled",
                                        ),
                                      }),
                                  ],
                                }),
                            ],
                          });
                        })(),
                        (0, r.jsxs)("div", {
                          style: { fontSize: 10, color: "#8899aa" },
                          children: [
                            e.domain || "",
                            " \xb7 ",
                            e.sourcecountry || "",
                            e.seendate
                              ? " \xb7 ".concat(
                                  new Date(e.seendate).toLocaleDateString(),
                                )
                              : "",
                          ],
                        }),
                      ],
                    },
                    "".concat(e.url, "-").concat(t),
                  ),
                ),
              ],
            })
          : null;
      }
      let ex =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbmFnbGhhaWx1Zmx5bmlycXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwOTc0MjIsImV4cCI6MjA5MDY3MzQyMn0.-d_IxHBAEXa_DoahB7pqzNp7hEWyh5lNXa7gVxYMvCU",
        eh = {
          id: "cg-aviation-dots",
          type: "circle",
          paint: {
            "circle-color": "rgba(34, 211, 238, 0.7)",
            "circle-radius": 2.5,
            "circle-stroke-width": 0.5,
            "circle-stroke-color": "rgba(6, 182, 212, 0.9)",
          },
        },
        em = { type: "FeatureCollection", features: [] };
      function eb(e) {
        var t;
        let { visible: n } = e,
          [l, a] = (0, o.useState)(em),
          [s, c] = (0, o.useState)(null),
          d = (0, o.useRef)(null),
          { current: u } = (0, i.ko)(),
          p = (0, o.useCallback)(async () => {
            try {
              let e = await fetch(
                "https://qdnaglhailuflynirqtt.supabase.co/functions/v1/live-feeds?feed=adsb",
                {
                  headers: { apikey: ex, Authorization: "Bearer ".concat(ex) },
                  signal: AbortSignal.timeout(1e4),
                },
              );
              if (!e.ok) return;
              let t = await e.json();
              a(
                (function (e) {
                  let t = null == e ? void 0 : e.ac;
                  return Array.isArray(t)
                    ? {
                        type: "FeatureCollection",
                        features: t
                          .filter((e) => null != e.lat && null != e.lon)
                          .map((e) => ({
                            type: "Feature",
                            properties: {
                              flight: (e.flight || e.t || "").trim(),
                              alt_baro: e.alt_baro || 0,
                              gs: e.gs || 0,
                              type: e.type || "",
                            },
                            geometry: {
                              type: "Point",
                              coordinates: [e.lon, e.lat],
                            },
                          })),
                      }
                    : em;
                })(t),
              );
            } catch (e) {}
          }, []);
        return ((0, o.useEffect)(() => {
          if (n)
            return (
              p(),
              (d.current = setInterval(p, 6e4)),
              () => {
                d.current && clearInterval(d.current);
              }
            );
        }, [n, p]),
        (0, o.useEffect)(() => {
          if (!n) return void c(null);
          let e = null == u ? void 0 : u.getMap();
          if (!e) return;
          let t = (e) => {
            var t;
            let n = null == (t = e.features) ? void 0 : t[0];
            n &&
              c({
                lng: e.lngLat.lng,
                lat: e.lngLat.lat,
                properties: n.properties,
              });
          };
          return (
            e.on("click", "cg-aviation-dots", t),
            () => {
              e.off("click", "cg-aviation-dots", t);
            }
          );
        }, [u, n]),
        n)
          ? (0, r.jsxs)(r.Fragment, {
              children: [
                (0, r.jsx)(i.kL, {
                  id: "cg-aviation",
                  type: "geojson",
                  data: l,
                  children: (0, r.jsx)(i.Wd, { ...eh }),
                }),
                s &&
                  (0, r.jsx)(i.zD, {
                    longitude: s.lng,
                    latitude: s.lat,
                    onClose: () => c(null),
                    closeOnClick: !1,
                    maxWidth: "260px",
                    children: (0, r.jsxs)("div", {
                      style: {
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        padding: 2,
                      },
                      children: [
                        (0, r.jsx)("div", {
                          style: {
                            fontSize: 10,
                            color: "#22d3ee",
                            fontWeight: 700,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            marginBottom: 4,
                          },
                          children: "AIRCRAFT",
                        }),
                        (0, r.jsx)("div", {
                          style: {
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#e8f0ff",
                            marginBottom: 4,
                          },
                          children: s.properties.flight || "Unknown",
                        }),
                        (0, r.jsxs)("div", {
                          style: {
                            fontSize: 11,
                            color: "#8899aa",
                            lineHeight: 1.6,
                          },
                          children: [
                            "Altitude: ",
                            (null == (t = s.properties.alt_baro)
                              ? void 0
                              : t.toLocaleString()) || "?",
                            " ft",
                            (0, r.jsx)("br", {}),
                            "Speed: ",
                            s.properties.gs || "?",
                            " kn",
                            (0, r.jsx)("br", {}),
                            s.properties.type
                              ? "Type: ".concat(s.properties.type)
                              : "",
                          ],
                        }),
                      ],
                    }),
                  }),
              ],
            })
          : null;
      }
      eb.interactiveLayerIds = ["cg-aviation-dots"];
      let ev = {
          id: "cg-maritime-vessels",
          type: "circle",
          paint: {
            "circle-color": "rgba(59, 130, 246, 0.75)",
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", "speed"],
              0,
              3,
              10,
              5,
              20,
              8,
            ],
            "circle-stroke-width": 1,
            "circle-stroke-color": "rgba(30, 64, 175, 0.9)",
          },
        },
        ej = { type: "FeatureCollection", features: [] };
      function eS(e) {
        let { visible: t } = e,
          [n, l] = (0, o.useState)(ej),
          [a, s] = (0, o.useState)(null),
          c = (0, o.useRef)(new Map()),
          d = (0, o.useRef)(null),
          u = (0, o.useRef)(null),
          { current: p } = (0, i.ko)(),
          g = (0, o.useCallback)(() => {
            if (d.current)
              try {
                d.current.close();
              } catch (e) {}
            try {
              let e = new WebSocket("wss://stream.aisstream.io/v0/stream");
              ((d.current = e),
                (e.onopen = () => {
                  e.send(
                    JSON.stringify({
                      APIKey: "be13c88e5869660929896d4410fee47d37e46276",
                      BoundingBoxes: [
                        [
                          [-90, -180],
                          [90, 180],
                        ],
                      ],
                      FilterMessageTypes: ["PositionReport"],
                    }),
                  );
                }),
                (e.onmessage = (e) => {
                  try {
                    var t;
                    let n = JSON.parse(e.data),
                      r =
                        null == n || null == (t = n.Message)
                          ? void 0
                          : t.PositionReport,
                      o = null == n ? void 0 : n.MetaData;
                    if (!r || null == r.Latitude || null == r.Longitude) return;
                    let i = (null == o ? void 0 : o.MMSI) || 0;
                    if (
                      (c.current.set(i, {
                        lat: r.Latitude,
                        lng: r.Longitude,
                        name: ((null == o ? void 0 : o.ShipName) || "").trim(),
                        speed: r.Sog || 0,
                        heading: r.TrueHeading || r.Cog || 0,
                        mmsi: i,
                      }),
                      c.current.size > 5e3)
                    ) {
                      let e = Array.from(c.current.keys());
                      for (let t = 0; t < 500; t++) c.current.delete(e[t]);
                    }
                  } catch (e) {}
                }),
                (e.onerror = () => {}),
                (e.onclose = () => {
                  setTimeout(() => {
                    t &&
                      (!d.current ||
                        d.current.readyState === WebSocket.CLOSED) &&
                      g();
                  }, 5e3);
                }));
            } catch (e) {}
          }, [t]);
        return ((0, o.useEffect)(() => {
          if (!t) {
            if (d.current) {
              try {
                d.current.close();
              } catch (e) {}
              d.current = null;
            }
            u.current && clearInterval(u.current);
            return;
          }
          return (
            g(),
            (u.current = setInterval(() => {
              l({
                type: "FeatureCollection",
                features: Array.from(c.current.values()).map((e) => ({
                  type: "Feature",
                  properties: {
                    name: e.name,
                    mmsi: e.mmsi,
                    speed: e.speed,
                    heading: e.heading,
                  },
                  geometry: { type: "Point", coordinates: [e.lng, e.lat] },
                })),
              });
            }, 1e4)),
            () => {
              if (d.current) {
                try {
                  d.current.close();
                } catch (e) {}
                d.current = null;
              }
              u.current && clearInterval(u.current);
            }
          );
        }, [t, g]),
        (0, o.useEffect)(() => {
          if (!t) return void s(null);
          let e = null == p ? void 0 : p.getMap();
          if (!e) return;
          let n = (e) => {
            var t;
            let n = null == (t = e.features) ? void 0 : t[0];
            n &&
              s({
                lng: e.lngLat.lng,
                lat: e.lngLat.lat,
                properties: n.properties,
              });
          };
          return (
            e.on("click", "cg-maritime-vessels", n),
            () => {
              e.off("click", "cg-maritime-vessels", n);
            }
          );
        }, [p, t]),
        t)
          ? (0, r.jsxs)(r.Fragment, {
              children: [
                (0, r.jsx)(i.kL, {
                  id: "cg-maritime",
                  type: "geojson",
                  data: n,
                  children: (0, r.jsx)(i.Wd, { ...ev }),
                }),
                a &&
                  (0, r.jsx)(i.zD, {
                    longitude: a.lng,
                    latitude: a.lat,
                    onClose: () => s(null),
                    closeOnClick: !1,
                    maxWidth: "260px",
                    children: (0, r.jsxs)("div", {
                      style: {
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        padding: 2,
                      },
                      children: [
                        (0, r.jsx)("div", {
                          style: {
                            fontSize: 10,
                            color: "#3b82f6",
                            fontWeight: 700,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            marginBottom: 4,
                          },
                          children: "VESSEL",
                        }),
                        (0, r.jsx)("div", {
                          style: {
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#e8f0ff",
                            marginBottom: 4,
                          },
                          children: a.properties.name || "Unknown",
                        }),
                        (0, r.jsxs)("div", {
                          style: {
                            fontSize: 11,
                            color: "#8899aa",
                            lineHeight: 1.6,
                          },
                          children: [
                            "MMSI: ",
                            a.properties.mmsi,
                            (0, r.jsx)("br", {}),
                            "Speed: ",
                            a.properties.speed,
                            " kn",
                            (0, r.jsx)("br", {}),
                            "Heading: ",
                            a.properties.heading,
                            "\xb0",
                          ],
                        }),
                      ],
                    }),
                  }),
              ],
            })
          : null;
      }
      eS.interactiveLayerIds = ["cg-maritime-vessels"];
      let ek =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbmFnbGhhaWx1Zmx5bmlycXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwOTc0MjIsImV4cCI6MjA5MDY3MzQyMn0.-d_IxHBAEXa_DoahB7pqzNp7hEWyh5lNXa7gVxYMvCU",
        ew = { type: "FeatureCollection", features: [] },
        eI = {
          id: "cg-ukraine-fill-contested",
          type: "fill",
          filter: [
            "any",
            ["==", ["get", "control"], "contested"],
            ["==", ["get", "control"], "gray"],
            ["==", ["get", "control"], "grey"],
            ["==", ["get", "control"], "russian"],
            ["==", ["get", "control"], "russia"],
            ["==", ["get", "control"], "occupied"],
          ],
          paint: {
            "fill-color": [
              "match",
              ["get", "control"],
              "russian",
              "rgba(239, 68, 68, 0.35)",
              "russia",
              "rgba(239, 68, 68, 0.35)",
              "occupied",
              "rgba(239, 68, 68, 0.35)",
              "contested",
              "rgba(250, 204, 21, 0.35)",
              "gray",
              "rgba(250, 204, 21, 0.35)",
              "grey",
              "rgba(250, 204, 21, 0.35)",
              "rgba(250, 204, 21, 0.25)",
            ],
            "fill-outline-color": "rgba(239, 68, 68, 0.7)",
          },
        },
        eM = {
          id: "cg-ukraine-frontline",
          type: "line",
          paint: {
            "line-color": "#facc15",
            "line-width": 2,
            "line-opacity": 0.8,
          },
        };
      function eC(e) {
        let { visible: t } = e,
          [n, l] = (0, o.useState)(ew),
          a = (0, o.useRef)(null),
          s = (0, o.useCallback)(async () => {
            try {
              let e = await fetch(
                "https://qdnaglhailuflynirqtt.supabase.co/functions/v1/live-feeds?feed=ukraine",
                {
                  headers: { apikey: ek, Authorization: "Bearer ".concat(ek) },
                  signal: AbortSignal.timeout(1e4),
                },
              );
              if (!e.ok) return;
              let t = await e.json();
              l(
                (function e(t) {
                  return t
                    ? "FeatureCollection" === t.type
                      ? t
                      : t.features
                        ? { type: "FeatureCollection", features: t.features }
                        : t.geojson
                          ? e(t.geojson)
                          : Array.isArray(t)
                            ? {
                                type: "FeatureCollection",
                                features: t
                                  .filter(
                                    (e) =>
                                      e.geometry ||
                                      e.coordinates ||
                                      (e.lat && e.lng),
                                  )
                                  .map((e, t) => {
                                    let n = e.geometry;
                                    return (
                                      !n &&
                                        e.coordinates &&
                                        (n = {
                                          type: "Polygon",
                                          coordinates: e.coordinates,
                                        }),
                                      !n &&
                                        e.lat &&
                                        e.lng &&
                                        (n = {
                                          type: "Point",
                                          coordinates: [e.lng, e.lat],
                                        }),
                                      {
                                        type: "Feature",
                                        properties: {
                                          id: e.id || "ukr-".concat(t),
                                          control: (
                                            e.control ||
                                            e.status ||
                                            ""
                                          ).toLowerCase(),
                                          label: e.label || e.name || "",
                                        },
                                        geometry: n,
                                      }
                                    );
                                  })
                                  .filter((e) => e.geometry),
                              }
                            : ew
                    : ew;
                })(t),
              );
            } catch (e) {}
          }, []);
        return ((0, o.useEffect)(() => {
          if (t)
            return (
              s(),
              (a.current = setInterval(s, 6e5)),
              () => {
                a.current && clearInterval(a.current);
              }
            );
        }, [t, s]),
        t)
          ? (0, r.jsxs)(i.kL, {
              id: "cg-ukraine",
              type: "geojson",
              data: n,
              children: [
                (0, r.jsx)(i.Wd, { ...eI }),
                (0, r.jsx)(i.Wd, { ...eM }),
              ],
            })
          : null;
      }
      let eE =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbmFnbGhhaWx1Zmx5bmlycXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwOTc0MjIsImV4cCI6MjA5MDY3MzQyMn0.-d_IxHBAEXa_DoahB7pqzNp7hEWyh5lNXa7gVxYMvCU";
      function eL(e) {
        let { visible: t } = e,
          [n, i] = (0, o.useState)([]),
          [l, a] = (0, o.useState)(!1),
          s = (0, o.useRef)(null),
          c = (0, o.useCallback)(async () => {
            a(!0);
            try {
              let e = await fetch(
                "https://qdnaglhailuflynirqtt.supabase.co/functions/v1/live-feeds?feed=gdelt-conflict",
                {
                  headers: { apikey: eE, Authorization: "Bearer ".concat(eE) },
                  signal: AbortSignal.timeout(1e4),
                },
              );
              if (!e.ok) return;
              let t = await e.json(),
                n =
                  (null == t ? void 0 : t.articles) ||
                  (null == t ? void 0 : t.data) ||
                  (null == t ? void 0 : t.features) ||
                  [];
              Array.isArray(n) && i(n.slice(0, 50));
            } catch (e) {
            } finally {
              a(!1);
            }
          }, []);
        return ((0, o.useEffect)(() => {
          if (t)
            return (
              c(),
              (s.current = setInterval(c, 3e5)),
              () => {
                s.current && clearInterval(s.current);
              }
            );
        }, [t, c]),
        t)
          ? (0, r.jsxs)("div", {
              style: {
                position: "absolute",
                top: 80,
                left: 16,
                width: 340,
                maxHeight: "calc(100vh - 120px)",
                overflowY: "auto",
                background: "rgba(13, 21, 37, 0.95)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: 8,
                zIndex: 20,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                padding: "12px 0",
              },
              children: [
                (0, r.jsxs)("div", {
                  style: {
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    color: "#ef4444",
                    padding: "0 14px 8px",
                    borderBottom: "1px solid rgba(239, 68, 68, 0.15)",
                    textTransform: "uppercase",
                  },
                  children: [
                    "CONFLICT EVENTS",
                    (0, r.jsx)("span", {
                      style: {
                        marginLeft: 8,
                        fontSize: 9,
                        color: "#8899aa",
                        fontWeight: 400,
                        letterSpacing: "0.1em",
                      },
                      children: l
                        ? "loading..."
                        : "".concat(n.length, " events"),
                    }),
                  ],
                }),
                0 === n.length &&
                  !l &&
                  (0, r.jsx)("div", {
                    style: {
                      padding: "20px 14px",
                      color: "#8899aa",
                      fontSize: 12,
                      textAlign: "center",
                    },
                    children: "No conflict events available",
                  }),
                n.map((e, t) =>
                  (0, r.jsxs)(
                    "a",
                    {
                      href: e.url,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      style: {
                        display: "block",
                        padding: "10px 14px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        textDecoration: "none",
                      },
                      children: [
                        (0, r.jsx)("div", {
                          style: {
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#e8f0ff",
                            lineHeight: 1.4,
                            marginBottom: 4,
                          },
                          children: e.title || "Untitled",
                        }),
                        (0, r.jsxs)("div", {
                          style: { fontSize: 10, color: "#8899aa" },
                          children: [
                            e.domain || "",
                            " \xb7 ",
                            e.sourcecountry || "",
                            e.seendate
                              ? " \xb7 ".concat(
                                  new Date(e.seendate).toLocaleDateString(),
                                )
                              : "",
                          ],
                        }),
                      ],
                    },
                    "".concat(e.url, "-").concat(t),
                  ),
                ),
              ],
            })
          : null;
      }
      let ez = [
          { text: "", delay: 100 },
          { text: "CAPEXLAYER v1.0", delay: 150, color: "#c9a84c" },
          {
            text: "INDUSTRIAL INTELLIGENCE PLATFORM",
            delay: 200,
            color: "#c9a84c",
          },
          { text: "", delay: 100 },
          {
            text: "> Signal acquisition engine",
            delay: 150,
            status: "OK",
            statusDelay: 100,
          },
          {
            text: "> 26 metro permit feeds",
            delay: 120,
            status: "OK",
            statusDelay: 100,
          },
        ],
        e_ = [
          {
            text: "> Equipment vertical classifiers",
            delay: 100,
            status: "OK",
            statusDelay: 80,
          },
          {
            text: "> USGS seismic feed",
            delay: 100,
            status: "OK",
            statusDelay: 80,
          },
          {
            text: "> NASA EONET wildfire",
            delay: 100,
            status: "OK",
            statusDelay: 80,
          },
          {
            text: "> AISStream maritime",
            delay: 100,
            status: "OK",
            statusDelay: 80,
          },
          {
            text: "> ADS-B aviation",
            delay: 100,
            status: "OK",
            statusDelay: 80,
          },
          {
            text: "> GDELT global events",
            delay: 100,
            status: "OK",
            statusDelay: 80,
          },
          {
            text: "> Predictive scoring engine",
            delay: 100,
            status: "OK",
            statusDelay: 100,
          },
        ],
        eA = [
          { text: "", delay: 150 },
          {
            text: "  SYSTEM ONLINE — ALL FEEDS NOMINAL",
            delay: 0,
            color: "#10b981",
          },
        ];
      function eF(e) {
        let {
            ready: t,
            diagnostics: n,
            error: i,
            retry: l,
            onDismiss: a,
            metrics: s,
          } = e,
          [c, d] = (0, o.useState)([]),
          [u, p] = (0, o.useState)(0),
          [g, f] = (0, o.useState)(new Set()),
          [y, x] = (0, o.useState)(!1),
          [h, m] = (0, o.useState)(!1),
          [b, v] = (0, o.useState)(!1),
          j = (0, o.useRef)(null),
          S = (s.totalOpportunities || 0) > 0 || (s.signalCount || 0) > 0;
        ((0, o.useEffect)(() => {
          var e;
          (null == (e = window.localStorage)
            ? void 0
            : e.getItem("cg_skip_boot")) === "1" && (v(!0), a());
        }, [a]),
          (0, o.useEffect)(() => {
            S &&
              !c.length &&
              d(
                (function (e) {
                  let t = Object.values(e.equipmentCounts || {}).filter(
                    (e) => (e || 0) > 0,
                  ).length;
                  return [
                    ...ez,
                    {
                      text: "> ".concat(
                        e.totalOpportunities.toLocaleString(),
                        " scored opportunities",
                      ),
                      delay: 120,
                      status: "OK",
                      statusDelay: 100,
                    },
                    {
                      text: "> ".concat(
                        e.hotOpportunities.toLocaleString(),
                        " hot lift windows",
                      ),
                      delay: 120,
                      status: "OK",
                      statusDelay: 100,
                    },
                    {
                      text: "> ".concat(
                        e.signalCount.toLocaleString(),
                        " industrial signals",
                      ),
                      delay: 120,
                      status: "OK",
                      statusDelay: 100,
                    },
                    {
                      text: "> ".concat(
                        t || Object.keys(e.equipmentCounts).length,
                        " equipment vertical classifiers",
                      ),
                      delay: 100,
                      status: "OK",
                      statusDelay: 80,
                    },
                    ...e_,
                    ...eA,
                  ];
                })(s),
              );
          }, [s, S, c.length]),
          (0, o.useEffect)(() => {
            if (!c.length) return;
            (p(0), f(new Set()), m(!1));
            let e = 0,
              t = !1,
              n = [],
              r = (o) => {
                let i = window.setTimeout(() => {
                  if (t || e >= c.length) {
                    t || m(!0);
                    return;
                  }
                  let o = c[e],
                    i = e;
                  if (
                    (p(i + 1),
                    j.current && (j.current.scrollTop = j.current.scrollHeight),
                    o.status && o.statusDelay)
                  ) {
                    let e = window.setTimeout(() => {
                      t || f((e) => new Set(e).add(i));
                    }, o.statusDelay);
                    n.push(e);
                  }
                  ((e += 1), r(o.delay + (o.statusDelay || 0)));
                }, o);
                n.push(i);
              };
            return (
              r(200),
              () => {
                ((t = !0), n.forEach((e) => window.clearTimeout(e)));
              }
            );
          }, [c]),
          (0, o.useEffect)(() => {
            if (h && t && !i) {
              let e = window.setTimeout(() => {
                (x(!0), window.setTimeout(() => a(), 600));
              }, 250);
              return () => window.clearTimeout(e);
            }
          }, [h, t, i, a]));
        let k = !!i;
        return b
          ? null
          : (0, r.jsxs)("div", {
              style: {
                position: "fixed",
                inset: 0,
                zIndex: 200,
                background: "rgba(8,14,26,0.88)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: +!y,
                transition: "opacity 1s ease-out",
                pointerEvents: y ? "none" : "auto",
              },
              children: [
                (0, r.jsx)("div", {
                  style: {
                    position: "absolute",
                    inset: 0,
                    background:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
                    pointerEvents: "none",
                  },
                }),
                (0, r.jsxs)("div", {
                  ref: j,
                  style: {
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    lineHeight: 1.8,
                    color: "#10b981",
                    maxWidth: 620,
                    width: "90%",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    padding: "40px 0",
                  },
                  children: [
                    (0, r.jsx)("div", {
                      style: {
                        marginBottom: 8,
                        opacity: 0.4,
                        fontSize: 11,
                        color: "#8a9bb5",
                      },
                      children: "root@capexlayer:~$",
                    }),
                    0 === c.length &&
                      (0, r.jsx)("div", {
                        style: {
                          color: "#8a9bb5",
                          fontSize: 13,
                          marginTop: 20,
                        },
                        children: "Initializing live telemetry…",
                      }),
                    c.slice(0, u).map((e, t) => {
                      if (!e.text)
                        return (0, r.jsx)("div", { style: { height: 8 } }, t);
                      let n = "#c9a84c" === e.color,
                        o = "#10b981" === e.color && !e.text.startsWith(">");
                      return (0, r.jsxs)(
                        "div",
                        {
                          style: {
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            color: e.color || "#10b981",
                            fontSize: n ? 15 : o ? 14 : 13,
                            fontWeight: n || o ? 700 : 400,
                            letterSpacing: n
                              ? "0.15em"
                              : o
                                ? "0.08em"
                                : "0.02em",
                            opacity: n ? 0.9 : 1,
                          },
                          children: [
                            (0, r.jsxs)("span", {
                              children: [
                                e.text,
                                e.status &&
                                  !g.has(t) &&
                                  (0, r.jsx)("span", {
                                    style: { color: "#8a9bb5", opacity: 0.5 },
                                    children: "..........".substring(
                                      0,
                                      Math.floor(5 * Math.random()) + 5,
                                    ),
                                  }),
                              ],
                            }),
                            e.status &&
                              g.has(t) &&
                              (0, r.jsx)("span", {
                                style: {
                                  color: "#10b981",
                                  fontWeight: 700,
                                  fontSize: 11,
                                  letterSpacing: "0.1em",
                                  marginLeft: 12,
                                  flexShrink: 0,
                                },
                                children: e.status,
                              }),
                          ],
                        },
                        t,
                      );
                    }),
                    c.length > 0 &&
                      u < c.length &&
                      (0, r.jsx)("span", {
                        style: {
                          display: "inline-block",
                          width: 8,
                          height: 14,
                          background: "#10b981",
                          animation: "blink 1s step-end infinite",
                          marginTop: 4,
                        },
                      }),
                  ],
                }),
                (0, r.jsxs)("div", {
                  style: {
                    position: "absolute",
                    bottom: 40,
                    width: "90%",
                    maxWidth: 520,
                    padding: 16,
                    border: "1px solid rgba(201,168,76,0.25)",
                    borderRadius: 8,
                    background: "rgba(8,14,26,0.85)",
                    fontFamily: "'DM Sans', sans-serif",
                  },
                  children: [
                    (0, r.jsx)("div", {
                      style: {
                        fontSize: 11,
                        letterSpacing: 2,
                        color: "#c9a84c",
                        marginBottom: 8,
                      },
                      children: "SYSTEM DIAGNOSTICS",
                    }),
                    (0, r.jsx)("ul", {
                      style: {
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      },
                      children: n.map((e) =>
                        (0, r.jsxs)(
                          "li",
                          {
                            style: {
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 12,
                              color: "#e2e8f0",
                            },
                            children: [
                              (0, r.jsx)("span", { children: e.label }),
                              (0, r.jsxs)("span", {
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                },
                                children: [
                                  e.detail &&
                                    (0, r.jsx)("span", {
                                      style: {
                                        fontSize: 11,
                                        color: "rgba(226,232,240,0.6)",
                                      },
                                      children: e.detail,
                                    }),
                                  (0, r.jsx)(eD, { status: e.status }),
                                ],
                              }),
                            ],
                          },
                          e.id,
                        ),
                      ),
                    }),
                    i &&
                      (0, r.jsx)("div", {
                        style: {
                          marginTop: 12,
                          color: "#fecdd3",
                          fontSize: 12,
                        },
                        children: i,
                      }),
                    k &&
                      (0, r.jsxs)("div", {
                        style: {
                          marginTop: 12,
                          display: "flex",
                          gap: 12,
                          flexWrap: "wrap",
                        },
                        children: [
                          (0, r.jsx)("button", {
                            type: "button",
                            onClick: () => (null == l ? void 0 : l()),
                            disabled: !l,
                            style: {
                              border: "1px solid rgba(201,168,76,0.4)",
                              background: "rgba(201,168,76,0.1)",
                              color: "#c9a84c",
                              padding: "6px 16px",
                              borderRadius: 4,
                              cursor: l ? "pointer" : "not-allowed",
                              opacity: l ? 1 : 0.5,
                              fontFamily: "'DM Mono', monospace",
                              letterSpacing: 1,
                            },
                            children: "Retry",
                          }),
                          (0, r.jsx)("button", {
                            type: "button",
                            onClick: () => {
                              (x(!0), setTimeout(() => a(), 250));
                            },
                            style: {
                              border: "1px solid rgba(148,163,184,0.5)",
                              background: "transparent",
                              color: "#e2e8f0",
                              padding: "6px 16px",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontFamily: "'DM Mono', monospace",
                              letterSpacing: 1,
                            },
                            children: "Continue offline",
                          }),
                        ],
                      }),
                  ],
                }),
                (0, r.jsx)("style", {
                  children:
                    "\n        @keyframes blink {\n          0%, 100% { opacity: 1; }\n          50% { opacity: 0; }\n        }\n      ",
                }),
              ],
            });
      }
      function eD(e) {
        let { status: t } = e,
          n = { pending: "#fcd34d", ok: "#10b981", error: "#ef4444" };
        return (0, r.jsx)("span", {
          style: {
            padding: "2px 8px",
            borderRadius: 999,
            border: "1px solid ".concat(n[t], "55"),
            color: n[t],
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          },
          children: { pending: "Pending", ok: "Ready", error: "Error" }[t],
        });
      }
      var eR = n(8209);
      function eT() {
        return (0, eR.zK)()
          ? (0, r.jsx)(v, { children: (0, r.jsx)(eW, {}) })
          : (0, r.jsx)("div", {
              style: { width: "100vw", height: "100vh", background: "#080e1a" },
            });
      }
      function eW() {
        let [e, t] = (0, o.useState)(!1),
          [n, i] = (0, o.useState)({}),
          [l, a] = (0, o.useState)({
            earthquake: !0,
            fire: !0,
            gdelt: !1,
            aviation: !1,
            maritime: !1,
            ukraine: !0,
            conflict: !1,
          }),
          {
            loading: s,
            error: c,
            diagnostics: d,
            refresh: u,
            metrics: p,
          } = j(),
          { isMobile: g } = E(),
          f = (0, o.useCallback)((e, t) => {
            i((n) => ({ ...n, [e]: t }));
          }, []),
          y = (0, o.useCallback)((e) => {
            a(e);
          }, []);
        return (0, r.jsxs)("div", {
          style: {
            width: "100vw",
            height: "100vh",
            background: "var(--bg-primary)",
            overflow: "hidden",
            position: "relative",
          },
          children: [
            !e &&
              (0, r.jsx)(eF, {
                ready: !s && !c,
                diagnostics: d,
                error: c,
                retry: u,
                onDismiss: () => t(!0),
                metrics: p,
              }),
            (0, r.jsx)(q, {
              layers: n,
              onLayerToggle: f,
              children: (0, r.jsx)(Y, { onChange: y }),
            }),
            (0, r.jsxs)("div", {
              style: {
                position: "absolute",
                top: 0,
                left: 220 * !g,
                right: 0,
                bottom: g ? 36 : 28,
                filter: e ? "brightness(1)" : "brightness(0.3)",
                transition: "filter 0.8s ease-out",
              },
              children: [
                (0, r.jsxs)(M, {
                  layers: {
                    opportunities: !1 !== n.crane_opportunities,
                    signals: !1 !== n.industrial_signals,
                    ...n,
                  },
                  children: [
                    (0, r.jsx)(ed, { visible: l.earthquake }),
                    (0, r.jsx)(eg, { visible: l.fire }),
                    (0, r.jsx)(ey, { visible: l.gdelt }),
                    (0, r.jsx)(eb, { visible: l.aviation }),
                    (0, r.jsx)(eS, { visible: l.maritime }),
                    (0, r.jsx)(eC, { visible: l.ukraine }),
                    (0, r.jsx)(eL, { visible: l.conflict }),
                  ],
                }),
                (0, r.jsx)(ea, {}),
                (0, r.jsx)(G, {}),
                (0, r.jsx)(Q, {}),
                (0, r.jsx)(et, {}),
              ],
            }),
            (0, r.jsx)(en, { leftOffset: 220 * !g }),
          ],
        });
      }
    },
    8209: (e, t, n) => {
      "use strict";
      n.d(t, {
        Dd: () => d,
        PX: () => c,
        TV: () => s,
        mM: () => l,
        wR: () => a,
        zK: () => u,
      });
      var r = n(2115),
        o = n(63);
      let i = { email: "cg_auth_email", name: "cg_auth_name" },
        l =
          "285355624600-cp8f95023sal1udlftnmuk993nma08f8.apps.googleusercontent.com";
      function a() {
        try {
          return !!localStorage.getItem(i.email);
        } catch (e) {
          return !1;
        }
      }
      function s(e, t) {
        try {
          (localStorage.setItem(i.email, t), localStorage.setItem(i.name, e));
        } catch (e) {}
      }
      function c(e) {
        try {
          let t = (e.split(".")[1] || "").replace(/-/g, "+").replace(/_/g, "/"),
            n = atob(t),
            r = decodeURIComponent(
              n
                .split("")
                .map(
                  (e) => "%" + ("00" + e.charCodeAt(0).toString(16)).slice(-2),
                )
                .join(""),
            );
          return JSON.parse(r);
        } catch (e) {
          return {};
        }
      }
      async function d(e) {
        try {
          await fetch("https://formspree.io/f/mgoldjjb", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(e),
          });
        } catch (e) {}
      }
      function u() {
        let e = (0, o.useRouter)(),
          [t, n] = (0, r.useState)(!1);
        return (
          (0, r.useEffect)(() => {
            a() ? n(!0) : e.replace("/");
          }, [e]),
          t
        );
      }
    },
    8914: (e, t, n) => {
      Promise.resolve().then(n.bind(n, 2471));
    },
  },
  (e) => {
    (e.O(0, [122, 784, 600, 362, 441, 255, 358], () => e((e.s = 8914))),
      (_N_E = e.O()));
  },
]);
