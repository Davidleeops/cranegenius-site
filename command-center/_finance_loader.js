// Shared CraneGenius financial data loader
// Populates any element with a data-fin attribute using data/financials.json
(function () {
  if (window.__craneFinanceLoaderInitialized) return;
  window.__craneFinanceLoaderInitialized = true;

  const fmt = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '--';
    return '$' + num.toLocaleString();
  };

  const pct = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '--';
    return Math.round(num) + '%';
  };

  function computeTotals(data) {
    const sum = (arr = []) =>
      arr.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);
    const cogs = sum(data?.costs?.cogs);
    const opex = sum(data?.costs?.opex);
    const burn = cogs + opex;
    const mrr = Number(data?.revenue?.current_mrr) || 0;
    const gross = mrr - cogs;
    const net = mrr - burn;
    const grossMargin = mrr > 0 ? (gross / mrr) * 100 : 0;
    const netMargin = mrr > 0 ? (net / mrr) * 100 : 0;
    return { cogs, opex, burn, gross, net, grossMargin, netMargin };
  }

  function updateDom(financials) {
    const totals = computeTotals(financials);
    const clients = Array.isArray(financials?.revenue?.clients)
      ? financials.revenue.clients
      : [];
    const liveClients = clients.filter((c) => c.status === 'live').length;
    const pendingClients = clients.filter((c) => c.status === 'pending').length;
    const pipelineOpps = Array.isArray(financials?.revenue?.pipeline_opportunities)
      ? financials.revenue.pipeline_opportunities
      : [];
    const oppUnweighted = pipelineOpps.reduce(
      (sum, opp) => sum + (Number(opp?.mrr) || 0),
      0
    );
    const oppWeighted = pipelineOpps.reduce((sum, opp) => {
      if (Number.isFinite(Number(opp?.weighted_mrr))) {
        return sum + Number(opp.weighted_mrr);
      }
      const mrr = Number(opp?.mrr) || 0;
      const prob = Number(opp?.probability_pct);
      return sum + (Number.isFinite(prob) ? mrr * (prob / 100) : 0);
    }, 0);
    const pipelineUnweighted = Number.isFinite(
      Number(financials?.revenue?.pipeline_mrr)
    )
      ? Number(financials.revenue.pipeline_mrr)
      : oppUnweighted;
    const pipelineWeighted = Number.isFinite(
      Number(financials?.revenue?.pipeline_mrr_weighted)
    )
      ? Number(financials.revenue.pipeline_mrr_weighted)
      : (oppWeighted || pipelineUnweighted);
    const pipelineProbability =
      Number(financials?.revenue?.pipeline_probability_pct) ||
      (pipelineUnweighted > 0
        ? Math.round((pipelineWeighted / pipelineUnweighted) * 100)
        : null);

    const map = {
      mrr: fmt(financials?.revenue?.current_mrr),
      pipeline_mrr: fmt(pipelineUnweighted),
      pipeline_mrr_weighted: fmt(pipelineWeighted),
      target_mrr: fmt(financials?.revenue?.target_mrr_90d),
      burn: fmt(totals.burn),
      net: fmt(totals.net),
      clients_live: String(liveClients),
      clients_pending: String(pendingClients),
      gross_margin: pct(totals.grossMargin),
      net_margin: pct(totals.netMargin),
      period: financials?.period?.current_month || '',
      pipeline_probability:
        pipelineProbability != null ? pipelineProbability + '%' : '',
    };

    document.querySelectorAll('[data-fin]').forEach((el) => {
      const key = el.getAttribute('data-fin');
      if (!key || !(key in map)) return;
      const text = map[key];
      if (el.dataset && el.dataset.finPrefix) {
        el.textContent = el.dataset.finPrefix + text;
      } else if (el.dataset && el.dataset.finSuffix) {
        el.textContent = text + el.dataset.finSuffix;
      } else {
        el.textContent = text;
      }
    });

    const eventDetail = {
      financials,
      totals,
      liveClients,
      pendingClients,
      pipelineOpps,
      pipelineUnweighted,
      pipelineWeighted,
      pipelineProbability,
      formatted: map,
    };
    document.dispatchEvent(
      new CustomEvent('financialsLoaded', { detail: eventDetail })
    );
  }

  function loadFinancials() {
    fetch('/data/financials.json?v=' + Date.now(), { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(updateDom)
      .catch((err) =>
        console.warn('[CraneGenius] financials.json load failed:', err)
      );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFinancials, {
      once: true,
    });
  } else {
    loadFinancials();
  }
})();
