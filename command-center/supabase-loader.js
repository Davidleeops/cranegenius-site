/**
 * CraneGenius Supabase Loader
 * Shared PostgREST client for command-center dashboards.
 * Reads config from window.__CG_SUPABASE_URL__ and window.__CG_SUPABASE_ANON_KEY__.
 * Exposes window.cgSupabase with query() method.
 * Returns null on any failure — dashboards fall back to static JSON.
 */
(function () {
  if (window.__cgSupabaseLoaderInit) return;
  window.__cgSupabaseLoaderInit = true;

  var url = window.__CG_SUPABASE_URL__;
  var key = window.__CG_SUPABASE_ANON_KEY__;

  window.cgSupabase = {
    isConfigured: function () {
      return !!(url && key);
    },

    /**
     * Query a Supabase table via PostgREST.
     * @param {string} table - Table name
     * @param {object} opts - Options:
     *   select: columns (default "*")
     *   eq: { column: value } filters
     *   order: "column.desc" or "column.asc"
     *   limit: number
     * @returns {Promise<Array|null>} rows or null on failure
     */
    query: function (table, opts) {
      if (!url || !key) return Promise.resolve(null);
      opts = opts || {};
      var params = [];
      params.push("select=" + encodeURIComponent(opts.select || "*"));
      if (opts.eq) {
        Object.keys(opts.eq).forEach(function (col) {
          params.push(col + "=eq." + encodeURIComponent(opts.eq[col]));
        });
      }
      if (opts.order) params.push("order=" + encodeURIComponent(opts.order));
      if (opts.limit) params.push("limit=" + opts.limit);

      var endpoint =
        url.replace(/\/$/, "") +
        "/rest/v1/" +
        table +
        "?" +
        params.join("&");

      var controller = new AbortController();
      var timeout = setTimeout(function () {
        controller.abort();
      }, 5000);

      return fetch(endpoint, {
        headers: {
          apikey: key,
          Authorization: "Bearer " + key,
        },
        signal: controller.signal,
      })
        .then(function (r) {
          clearTimeout(timeout);
          if (!r.ok) return null;
          return r.json();
        })
        .catch(function () {
          clearTimeout(timeout);
          return null;
        });
    },
  };
})();
