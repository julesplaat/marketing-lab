import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  PageHeader, Card, Badge, StatusBadge, WarningBox, FormField, Input, Textarea,
  Select, MultiSelect, Tabs, ConfirmDialog, ScoreStars, EmptyState,
} from '../components/Shared';
import { STATUS_OPTIONS, WINNER_TYPE_OPTIONS, CONFIDENCE_OPTIONS, DECISION_OPTIONS, APPLY_TO_OPTIONS } from '../data/defaults';
import {
  formatDate, daysBetween, calcCTR, calcCPC, calcCostPerResult, suggestWinner,
  getExperimentWarnings, getResultBadges, generateId, duplicateExperiment,
} from '../lib/helpers';
import { ArrowLeft, Edit, Trash2, BarChart3, Trophy, BookOpen, Save, AlertTriangle, Sparkles, Copy } from 'lucide-react';

export default function ExperimentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, updateExperiment, deleteExperiment, addExperiment, addLearning } = useApp();
  const exp = state.experiments.find((e) => e.id === id);
  const [activeTab, setActiveTab] = useState('summary');
  const [showDelete, setShowDelete] = useState(false);

  if (!exp) return <div className="page"><EmptyState title="Niet gevonden" action={<button className="btn btn-primary" onClick={() => navigate('/experiments')}>Terug</button>} /></div>;

  const warnings = getExperimentWarnings(exp);
  const daysLive = exp.startDate ? daysBetween(exp.startDate, exp.status === 'completed' ? exp.endDate : null) : 0;
  const tabs = [
    { value: 'summary', label: 'Samenvatting' },
    { value: 'variants', label: `Varianten (${exp.variants.length})` },
    { value: 'results', label: 'Resultaten', count: exp.results.length || undefined },
    { value: 'evaluation', label: 'Evaluatie' },
  ];

  const handleDuplicate = () => {
    const dup = duplicateExperiment(exp);
    addExperiment(dup);
    navigate(`/experiments/${dup.id}/edit`);
  };

  return (
    <div className="page">
      <PageHeader title={exp.title} subtitle={exp.description || exp.hypothesis}
        actions={
          <div className="page-actions">
            <button className="btn btn-ghost" onClick={() => navigate('/experiments')}><ArrowLeft size={16} /> Terug</button>
            <button className="btn btn-outline" onClick={handleDuplicate}><Copy size={16} /> Dupliceer</button>
            <button className="btn btn-outline" onClick={() => navigate(`/experiments/${id}/edit`)}><Edit size={16} /> Bewerken</button>
            <button className="btn btn-ghost btn-danger-text" onClick={() => setShowDelete(true)}><Trash2 size={16} /></button>
          </div>
        }
      />
      <div className="detail-status-bar">
        <StatusBadge status={exp.status} />
        {exp.funnel && <Badge>{exp.funnel}</Badge>}
        {exp.channel && <Badge>{exp.channel}</Badge>}
        {exp.testType && <Badge>{exp.testType}</Badge>}
        {daysLive > 0 && <span className="detail-meta">{daysLive} dagen live</span>}
        {exp.owner && <span className="detail-meta">Door: {exp.owner}</span>}
        {exp.budget > 0 && <span className="detail-meta">€{exp.budget}</span>}
      </div>
      <WarningBox warnings={warnings} />
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      {activeTab === 'summary' && <SummaryTab exp={exp} />}
      {activeTab === 'variants' && <VariantsTab exp={exp} />}
      {activeTab === 'results' && <ResultsTab exp={exp} updateExperiment={updateExperiment} />}
      {activeTab === 'evaluation' && <EvaluationTab exp={exp} updateExperiment={updateExperiment} addLearning={addLearning} navigate={navigate} />}
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)}
        onConfirm={() => { deleteExperiment(exp.id); navigate('/experiments'); }}
        title="Verwijderen" message={`"${exp.title}" en gekoppelde learnings verwijderen?`} confirmLabel="Verwijder" danger />
    </div>
  );
}

function SummaryTab({ exp }) {
  return (
    <div className="detail-content">
      <div className="detail-grid">
        <Card>
          <h4 className="card-subtitle">Testopzet</h4>
          <div className="detail-fields">
            <DR label="Hypothese" value={exp.hypothesis} />
            <DR label="Wat testen we?" value={exp.goal} />
            <DR label="Variabele" value={exp.variableChanged} />
            <DR label="Gelijk gehouden" value={exp.controlsKeptConstant} />
          </div>
        </Card>
        <Card>
          <h4 className="card-subtitle">Context</h4>
          <div className="detail-fields">
            <DR label="Funnel" value={exp.funnel} />
            <DR label="Kanaal" value={exp.channel} />
            <DR label="Campagneniveau" value={exp.campaignLevel} />
            <DR label="Testtype" value={exp.testType} />
            <DR label="CTA-categorie" value={exp.ctaCategory} />
          </div>
        </Card>
        <Card>
          <h4 className="card-subtitle">Doelgroep</h4>
          <div className="detail-fields">
            <DR label="Buyer roles" value={(exp.buyerRoles || []).join(', ')} />
            <DR label="Kernproblemen" value={(exp.problemTags || []).join(', ')} />
          </div>
        </Card>
        <Card>
          <h4 className="card-subtitle">Planning</h4>
          <div className="detail-fields">
            <DR label="Start" value={formatDate(exp.startDate)} />
            <DR label="Eind" value={formatDate(exp.endDate)} />
            <DR label="Gepland" value={exp.durationDaysPlanned ? `${exp.durationDaysPlanned} dagen` : null} />
            <DR label="Budget" value={exp.budget ? `€${exp.budget}` : null} />
          </div>
        </Card>
      </div>
      {exp.notes && <Card><h4 className="card-subtitle">Notities</h4><p className="detail-text">{exp.notes}</p></Card>}
    </div>
  );
}

function VariantsTab({ exp }) {
  return (
    <div className="detail-content">
      <div className="variants-grid">
        {exp.variants.map((v) => (
          <Card key={v.id} className="variant-detail-card">
            <div className="variant-detail-header">
              <span className="variant-badge">Variant {v.name}</span>
              {exp.evaluation?.winnerVariantId === v.id && <Badge color="green"><Trophy size={12} /> Winnaar</Badge>}
            </div>
            <div className="detail-fields">
              {v.hook && <DR label="Hook" value={v.hook} />}
              {v.message && <DR label="Boodschap" value={v.message} />}
              {v.cta && <DR label="CTA" value={v.cta} />}
              {v.format && <DR label="Format" value={v.format} />}
              {v.creativeType && <DR label="Creative" value={v.creativeType} />}
              {v.assetName && <DR label="Asset" value={v.assetName} />}
              {v.landingPageUrl && <DR label="LP" value={v.landingPageUrl} />}
              {v.notes && <DR label="Notities" value={v.notes} />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ResultsTab({ exp, updateExperiment }) {
  const [results, setResults] = useState(
    exp.variants.map((v) => (exp.results || []).find((r) => r.variantId === v.id) || {
      variantId: v.id, impressions: '', clicks: '', ctr: '', spend: '', cpc: '',
      leads: '', demoRequests: '', pilotRequests: '', checklistDownloads: '',
      meetings: '', seriousInteractions: '', salesFitScore: 0, qualitativeNotes: '',
    })
  );

  const upd = (idx, f, v) => {
    setResults((prev) => {
      const u = [...prev]; u[idx] = { ...u[idx], [f]: v };
      if ((f === 'impressions' || f === 'clicks') && !u[idx]._ctrM) {
        const imp = Number(u[idx].impressions) || 0, clk = Number(u[idx].clicks) || 0;
        if (imp > 0) u[idx].ctr = calcCTR(imp, clk);
      }
      if ((f === 'spend' || f === 'clicks') && !u[idx]._cpcM) {
        const sp = Number(u[idx].spend) || 0, clk = Number(u[idx].clicks) || 0;
        if (clk > 0) u[idx].cpc = calcCPC(sp, clk);
      }
      return u;
    });
  };

  const save = () => {
    const clean = results.map((r) => ({
      ...r,
      impressions: Number(r.impressions) || 0, clicks: Number(r.clicks) || 0,
      ctr: Number(r.ctr) || 0, spend: Number(r.spend) || 0, cpc: Number(r.cpc) || 0,
      leads: Number(r.leads) || 0, demoRequests: Number(r.demoRequests) || 0,
      pilotRequests: Number(r.pilotRequests) || 0, checklistDownloads: Number(r.checklistDownloads) || 0,
      meetings: Number(r.meetings) || 0, seriousInteractions: Number(r.seriousInteractions) || 0,
      salesFitScore: Number(r.salesFitScore) || 0,
    }));
    updateExperiment({ id: exp.id, results: clean });
  };

  return (
    <div className="detail-content">
      <div className="results-grid">
        {exp.variants.map((variant, idx) => {
          const r = results[idx];
          const numR = { ...r, impressions: Number(r.impressions), clicks: Number(r.clicks), ctr: Number(r.ctr), cpc: Number(r.cpc), meetings: Number(r.meetings), salesFitScore: Number(r.salesFitScore), demoRequests: Number(r.demoRequests), pilotRequests: Number(r.pilotRequests), spend: Number(r.spend) };
          const badges = getResultBadges(numR, results.map(res => ({ ...res, impressions: Number(res.impressions), clicks: Number(res.clicks), ctr: Number(res.ctr), cpc: Number(res.cpc), meetings: Number(res.meetings), salesFitScore: Number(res.salesFitScore), demoRequests: Number(res.demoRequests), pilotRequests: Number(res.pilotRequests) })));
          const costs = calcCostPerResult(numR);

          return (
            <Card key={variant.id} className="result-card">
              <div className="result-header">
                <span className="variant-badge">Variant {variant.name}</span>
                <div className="result-badges">{badges.map((b, i) => <Badge key={i} color={b.color} small>{b.label}</Badge>)}</div>
              </div>

              <h5 className="result-section-title">Primaire metrics</h5>
              <div className="result-fields">
                <RF label="Afspraken" value={r.meetings} onChange={(v) => upd(idx, 'meetings', v)} />
                <RF label="Pilot-aanvragen" value={r.pilotRequests} onChange={(v) => upd(idx, 'pilotRequests', v)} />
                <RF label="Demo-aanvragen" value={r.demoRequests} onChange={(v) => upd(idx, 'demoRequests', v)} />
                <RF label="Serieuze interacties" value={r.seriousInteractions} onChange={(v) => upd(idx, 'seriousInteractions', v)} />
                <div className="result-field"><label>Sales fit (1-5)</label><ScoreStars value={Number(r.salesFitScore) || 0} onChange={(v) => upd(idx, 'salesFitScore', v)} /></div>
              </div>

              <h5 className="result-section-title">Secundaire metrics</h5>
              <div className="result-fields">
                <RF label="Leads" value={r.leads} onChange={(v) => upd(idx, 'leads', v)} />
                <RF label="Downloads" value={r.checklistDownloads} onChange={(v) => upd(idx, 'checklistDownloads', v)} />
                <RF label="CTR (%)" value={r.ctr} onChange={(v) => { upd(idx, 'ctr', v); upd(idx, '_ctrM', true); }} />
              </div>

              <h5 className="result-section-title">Tertiaire metrics</h5>
              <div className="result-fields">
                <RF label="Impressies" value={r.impressions} onChange={(v) => upd(idx, 'impressions', v)} />
                <RF label="Klikken" value={r.clicks} onChange={(v) => upd(idx, 'clicks', v)} />
                <RF label="Spend (€)" value={r.spend} onChange={(v) => upd(idx, 'spend', v)} />
                <RF label="CPC (€)" value={r.cpc} onChange={(v) => { upd(idx, 'cpc', v); upd(idx, '_cpcM', true); }} />
              </div>

              {/* Cost per result */}
              {(costs.costPerMeeting || costs.costPerDemo || costs.costPerLead) && (
                <>
                  <h5 className="result-section-title">Kosten per resultaat</h5>
                  <div className="cost-per-result">
                    {costs.costPerMeeting && <div className="cost-item"><span className="cost-label">Per afspraak</span><span className="cost-value">€{costs.costPerMeeting}</span></div>}
                    {costs.costPerDemo && <div className="cost-item"><span className="cost-label">Per demo</span><span className="cost-value">€{costs.costPerDemo}</span></div>}
                    {costs.costPerPilot && <div className="cost-item"><span className="cost-label">Per pilot</span><span className="cost-value">€{costs.costPerPilot}</span></div>}
                    {costs.costPerLead && <div className="cost-item"><span className="cost-label">Per lead</span><span className="cost-value">€{costs.costPerLead}</span></div>}
                    {costs.costPerClick && <div className="cost-item"><span className="cost-label">Per klik</span><span className="cost-value">€{costs.costPerClick}</span></div>}
                  </div>
                </>
              )}

              <h5 className="result-section-title">Kwalitatief</h5>
              <Textarea value={r.qualitativeNotes} onChange={(v) => upd(idx, 'qualitativeNotes', v)} placeholder="Observaties, reacties, feedback..." rows={3} />
            </Card>
          );
        })}
      </div>
      <div className="form-actions-bar"><button className="btn btn-primary" onClick={save}><Save size={16} /> Resultaten opslaan</button></div>
    </div>
  );
}

function EvaluationTab({ exp, updateExperiment, addLearning, navigate }) {
  const suggestion = useMemo(() => {
    if (!exp.results || exp.results.length < 2) return null;
    return suggestWinner(exp.results, exp.variants);
  }, [exp.results, exp.variants]);

  const [ev, setEv] = useState({
    winnerVariantId: '', winnerType: '', confidence: 'medium', autoSuggestion: '',
    whyItWon: '', learningSummary: '', surprises: '', objectionsSeen: '',
    decision: '', applyTo: [], reviewedAt: '',
    ...(exp.evaluation || {}),
  });
  const u = (f, v) => setEv((p) => ({ ...p, [f]: v }));

  const save = () => {
    updateExperiment({
      id: exp.id,
      evaluation: { ...ev, autoSuggestion: suggestion?.variantId || '', reviewedAt: new Date().toISOString().split('T')[0] },
      status: ev.decision && ev.decision !== 'Nog open' ? 'completed' : exp.status,
    });
  };

  const createLearning = () => {
    if (!ev.learningSummary) { alert('Vul eerst "Wat hebben we geleerd?" in.'); return; }
    const w = exp.variants.find((v) => v.id === ev.winnerVariantId);
    addLearning({
      id: generateId('learn'),
      title: `${exp.testType || 'Test'}: ${w ? w.hook?.substring(0, 50) || w.name : exp.title}`,
      body: ev.learningSummary, experimentId: exp.id, funnel: exp.funnel,
      channel: exp.channel, buyerRoles: exp.buyerRoles || [], problemTags: exp.problemTags || [],
      testType: exp.testType, applyTo: ev.applyTo || [], confidence: ev.confidence,
      createdAt: new Date().toISOString(),
    });
    alert('Learning aangemaakt!');
  };

  return (
    <div className="detail-content">
      {suggestion && (
        <Card className={`suggestion-card ${suggestion.variantId ? 'has-winner' : 'no-winner'}`}>
          <div className="suggestion-header"><Sparkles size={18} /> Voorstel</div>
          <p className="suggestion-type">{suggestion.variantId ? `${suggestion.type}: Variant ${exp.variants.find((v) => v.id === suggestion.variantId)?.name}` : suggestion.type}</p>
          <p className="suggestion-reason">{suggestion.reason}</p>
          {exp.startDate && daysBetween(exp.startDate, exp.endDate) < 7 && <p className="suggestion-warning"><AlertTriangle size={14} /> Test liep minder dan 7 dagen.</p>}
        </Card>
      )}
      {(!exp.results || exp.results.length === 0) && <Card><EmptyState icon={BarChart3} title="Geen resultaten" description="Vul eerst resultaten in." /></Card>}
      <Card className="form-section">
        <h3 className="card-title">Evaluatie</h3>
        <div className="form-grid">
          <FormField label="Winnaar"><Select value={ev.winnerVariantId} onChange={(v) => u('winnerVariantId', v)} options={[{ value: '', label: 'Geen' }, ...exp.variants.map((v) => ({ value: v.id, label: `Variant ${v.name}` }))]} /></FormField>
          <FormField label="Type winnaar"><Select value={ev.winnerType} onChange={(v) => u('winnerType', v)} options={WINNER_TYPE_OPTIONS} /></FormField>
          <FormField label="Vertrouwen"><Select value={ev.confidence} onChange={(v) => u('confidence', v)} options={CONFIDENCE_OPTIONS} /></FormField>
          <FormField label="Besluit"><Select value={ev.decision} onChange={(v) => u('decision', v)} options={DECISION_OPTIONS} /></FormField>
        </div>
        <div className="form-grid form-grid-single" style={{ marginTop: '1rem' }}>
          <FormField label="Waarom won deze variant?"><Textarea value={ev.whyItWon} onChange={(v) => u('whyItWon', v)} /></FormField>
          <FormField label="Wat hebben we geleerd?"><Textarea value={ev.learningSummary} onChange={(v) => u('learningSummary', v)} /></FormField>
          <FormField label="Wat verraste ons?"><Textarea value={ev.surprises} onChange={(v) => u('surprises', v)} rows={2} /></FormField>
          <FormField label="Bezwaren?"><Textarea value={ev.objectionsSeen} onChange={(v) => u('objectionsSeen', v)} rows={2} /></FormField>
          <FormField label="Toepassen op"><MultiSelect value={ev.applyTo} onChange={(v) => u('applyTo', v)} options={APPLY_TO_OPTIONS} /></FormField>
        </div>
      </Card>
      <div className="form-actions-bar">
        <button className="btn btn-outline" onClick={createLearning}><BookOpen size={16} /> Maak learning</button>
        <button className="btn btn-primary" onClick={save}><Save size={16} /> Evaluatie opslaan</button>
      </div>
    </div>
  );
}

function DR({ label, value }) {
  if (!value) return null;
  return <div className="detail-row"><span className="detail-label">{label}</span><span className="detail-value">{value}</span></div>;
}

function RF({ label, value, onChange }) {
  return <div className="result-field"><label>{label}</label><input type="number" className="form-input form-input-sm" value={value || ''} onChange={(e) => onChange(e.target.value)} min="0" step="any" /></div>;
}
