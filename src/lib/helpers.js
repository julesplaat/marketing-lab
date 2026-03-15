// Date helpers
export function daysBetween(start, end) {
  if (!start) return 0;
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  return Math.max(0, Math.round((e - s) / 86400000));
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function todayStr() { return new Date().toISOString().split('T')[0]; }

let counter = Date.now();
export function generateId(prefix = 'exp') {
  counter++;
  return `${prefix}_${counter.toString(36)}`;
}

export function calcCTR(impressions, clicks) {
  if (!impressions || impressions === 0) return 0;
  return Math.round((clicks / impressions) * 10000) / 100;
}

export function calcCPC(spend, clicks) {
  if (!clicks || clicks === 0) return 0;
  return Math.round((spend / clicks) * 100) / 100;
}

// Cost per result calculations
export function calcCostPerResult(result) {
  const spend = Number(result.spend) || 0;
  if (spend === 0) return {};
  const calc = (val) => val > 0 ? Math.round((spend / val) * 100) / 100 : null;
  return {
    costPerMeeting: calc(result.meetings),
    costPerDemo: calc(result.demoRequests),
    costPerPilot: calc(result.pilotRequests),
    costPerLead: calc(result.leads),
    costPerClick: calc(result.clicks),
    costPerDownload: calc(result.checklistDownloads),
  };
}

// Winner suggestion
export function suggestWinner(results, variants) {
  if (!results || results.length < 2) return null;
  const scored = results.map((r) => {
    const primaryScore = (r.meetings || 0) * 10 + (r.pilotRequests || 0) * 8 + (r.demoRequests || 0) * 6 + (r.seriousInteractions || 0) * 4 + (r.salesFitScore || 0) * 3;
    const secondaryScore = (r.leads || 0) * 3 + (r.checklistDownloads || 0) * 2 + (r.ctr || 0) * 2;
    const tertiaryScore = (r.cpc ? Math.max(0, 5 - r.cpc) : 0) * 1;
    return {
      variantId: r.variantId,
      primaryScore, secondaryScore, tertiaryScore,
      totalScore: primaryScore * 3 + secondaryScore * 2 + tertiaryScore,
      hasPrimaryData: primaryScore > 0,
      hasAnyData: (r.impressions || 0) > 0,
    };
  });
  const sorted = [...scored].sort((a, b) => b.totalScore - a.totalScore);
  const best = sorted[0], second = sorted[1];
  if (!best.hasAnyData) return { variantId: null, type: 'Geen duidelijke winnaar', reason: 'Onvoldoende data beschikbaar' };
  const gap = best.totalScore - second.totalScore;
  const relativeGap = second.totalScore > 0 ? gap / second.totalScore : gap > 0 ? 1 : 0;
  if (!best.hasPrimaryData && !second.hasPrimaryData) {
    const br = results.find((r) => r.variantId === best.variantId);
    const sr = results.find((r) => r.variantId === second.variantId);
    if ((br?.ctr || 0) > (sr?.ctr || 0)) return { variantId: best.variantId, type: 'Beste CTR', reason: 'Beste CTR, maar geen duidelijke business-winnaar.' };
    return { variantId: null, type: 'Geen duidelijke winnaar', reason: 'Onvoldoende primaire business-metrics.' };
  }
  if (relativeGap > 0.3) return { variantId: best.variantId, type: 'Overall winnaar', reason: 'Duidelijk betere score op engagement én business-impact.' };
  if (relativeGap > 0.1) return { variantId: best.variantId, type: 'Beste business-impact', reason: 'Betere business-impact, verschil is beperkt.' };
  return { variantId: null, type: 'Geen duidelijke winnaar', reason: 'Resultaten liggen dicht bij elkaar. Overweeg opnieuw testen.' };
}

// Experiment warnings
export function getExperimentWarnings(exp) {
  const w = [];
  if (exp.status === 'live' && exp.startDate && daysBetween(exp.startDate, null) < 7)
    w.push({ type: 'info', message: `Test loopt nog maar ${daysBetween(exp.startDate, null)} dag(en). Minimaal 7 aanbevolen.` });
  if (exp.variants?.length >= 2) {
    const v = exp.variants; let diffs = 0;
    if (v[0].hook !== v[1].hook) diffs++;
    if (v[0].cta !== v[1].cta) diffs++;
    if (v[0].format !== v[1].format) diffs++;
    if (v[0].creativeType !== v[1].creativeType) diffs++;
    if (v[0].message !== v[1].message) diffs++;
    if (diffs > 1) w.push({ type: 'warning', message: 'Meerdere variabelen tegelijk veranderd. Learnings minder betrouwbaar.' });
  }
  if (['review', 'completed'].includes(exp.status) && (!exp.results || exp.results.length === 0))
    w.push({ type: 'warning', message: 'Nog geen resultaten ingevoerd.' });
  if (exp.evaluation && Object.keys(exp.evaluation).length > 0 && !exp.evaluation.decision)
    w.push({ type: 'warning', message: 'Nog geen besluit vastgelegd.' });
  if (exp.status === 'completed' && (!exp.evaluation || !exp.evaluation.winnerVariantId))
    w.push({ type: 'info', message: 'Afgerond maar nog geen evaluatie.' });
  if (exp.status === 'live' && !exp.endDate)
    w.push({ type: 'info', message: 'Geen einddatum ingesteld.' });
  if (exp.status === 'live' && exp.endDate && new Date(exp.endDate) < new Date())
    w.push({ type: 'warning', message: 'Einddatum verstreken maar status nog live.' });
  return w;
}

export function getFunnelCtaWarning(funnel, cta) {
  const bofu = ['Plan demo', 'Vraag pilot aan', 'Ontvang advies', 'Doe de quickscan'];
  const tofu = ['Meer informatie', 'Bekijk hoe dit werkt', 'Ontdek hoe BYOC wél werkt', 'Lees case', 'Download checklist'];
  if (funnel === 'TOFU' && bofu.includes(cta)) return 'Deze CTA is vrij direct voor TOFU. Overweeg awareness-gerichte CTA.';
  if (funnel === 'BOFU' && tofu.includes(cta)) return 'Deze CTA is vrijblijvend voor BOFU. Overweeg actiegerichte CTA.';
  return null;
}

export function getResultBadges(result, allResults) {
  const badges = [];
  if (!result || !allResults || allResults.length < 2) return badges;
  const isMax = (f) => { const v = result[f] || 0; return v > 0 && allResults.every((r) => (r[f] || 0) <= v); };
  const isMin = (f) => { const v = result[f] || 0; return v > 0 && allResults.every((r) => (r[f] || 0) >= v || (r[f] || 0) === 0); };
  if (isMax('ctr')) badges.push({ label: 'Hoogste CTR', color: 'green' });
  if (isMax('meetings')) badges.push({ label: 'Meeste afspraken', color: 'green' });
  if (isMax('salesFitScore')) badges.push({ label: 'Beste leadkwaliteit', color: 'green' });
  if (isMax('demoRequests')) badges.push({ label: 'Meeste demo\'s', color: 'blue' });
  if (isMax('pilotRequests')) badges.push({ label: 'Meeste pilots', color: 'blue' });
  if (isMin('cpc') && result.cpc > 0) badges.push({ label: 'Laagste CPC', color: 'green' });
  return badges;
}

export function aggregateTopPerformers(experiments) {
  const hookCounts = {}, ctaCounts = {}, funnelCounts = {}, roleCounts = {};
  experiments.filter((e) => e.status === 'completed' && e.evaluation?.winnerVariantId).forEach((exp) => {
    const winner = exp.variants.find((v) => v.id === exp.evaluation.winnerVariantId);
    if (!winner) return;
    if (winner.hook) { const h = winner.hook.substring(0, 60); hookCounts[h] = (hookCounts[h] || 0) + 1; }
    if (winner.cta) ctaCounts[winner.cta] = (ctaCounts[winner.cta] || 0) + 1;
    if (exp.funnel) funnelCounts[exp.funnel] = (funnelCounts[exp.funnel] || 0) + 1;
    (exp.buyerRoles || []).forEach((r) => { roleCounts[r] = (roleCounts[r] || 0) + 1; });
  });
  const topN = (obj, n = 3) => Object.entries(obj).sort(([, a], [, b]) => b - a).slice(0, n).map(([name, count]) => ({ name, count }));
  return { topHooks: topN(hookCounts), topCTAs: topN(ctaCounts), topFunnels: topN(funnelCounts), topRoles: topN(roleCounts) };
}

// Duplicate experiment helper
export function duplicateExperiment(exp) {
  const newId = generateId('exp');
  const now = new Date().toISOString();
  return {
    ...exp,
    id: newId,
    title: `${exp.title} (kopie)`,
    status: 'idea',
    results: [],
    evaluation: {},
    startDate: '',
    endDate: '',
    durationDaysActual: 0,
    createdAt: now,
    updatedAt: now,
    variants: exp.variants.map((v, i) => ({ ...v, id: `var_${String.fromCharCode(97 + i)}` })),
  };
}
