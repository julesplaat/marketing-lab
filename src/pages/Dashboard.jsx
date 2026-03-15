import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, StatCard, PageHeader, Badge, StatusBadge } from '../components/Shared';
import { getExperimentWarnings, aggregateTopPerformers, daysBetween } from '../lib/helpers';
import { PlusCircle, ClipboardCheck, Download, ArrowRight, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { experiments, learnings } = state;
  const live = experiments.filter((e) => e.status === 'live');
  const needsReview = experiments.filter((e) => e.status === 'review');
  const completed = experiments.filter((e) => e.status === 'completed');
  const recentLearnings = [...learnings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const top = aggregateTopPerformers(experiments);

  // Cost per result across all experiments
  let totalSpend = 0, totalMeetings = 0, totalDemos = 0, totalLeads = 0;
  experiments.forEach((e) => (e.results || []).forEach((r) => {
    totalSpend += Number(r.spend) || 0; totalMeetings += Number(r.meetings) || 0;
    totalDemos += Number(r.demoRequests) || 0; totalLeads += Number(r.leads) || 0;
  }));

  const warningExps = experiments.filter((e) => ['live', 'review'].includes(e.status))
    .map((e) => ({ ...e, warnings: getExperimentWarnings(e) })).filter((e) => e.warnings.some((w) => w.type === 'warning'));

  return (
    <div className="page">
      <PageHeader title="Dashboard" subtitle="Overzicht van je marketingexperimenten" />
      <div className="stat-grid">
        <StatCard label="Live tests" value={live.length} color="var(--status-live)" onClick={() => navigate('/experiments?status=live')} />
        <StatCard label="Review nodig" value={needsReview.length} color="var(--status-review)" onClick={() => navigate('/experiments?status=review')} />
        <StatCard label="Afgerond" value={completed.length} color="var(--status-done)" onClick={() => navigate('/experiments?status=completed')} />
        <StatCard label="Learnings" value={learnings.length} onClick={() => navigate('/learnings')} />
      </div>

      <div className="quick-actions">
        <button className="btn btn-primary" onClick={() => navigate('/experiments/new')}><PlusCircle size={16} /> Nieuw experiment</button>
        {needsReview.length > 0 && <button className="btn btn-outline" onClick={() => navigate(`/experiments/${needsReview[0].id}`)}><ClipboardCheck size={16} /> Resultaten invullen</button>}
        <button className="btn btn-ghost" onClick={() => navigate('/settings')}><Download size={16} /> Export back-up</button>
      </div>

      {/* Cost overview */}
      {totalSpend > 0 && (
        <Card className="dashboard-section" style={{ marginBottom: '16px', gridColumn: '1 / -1' }}>
          <h3 className="card-title">Kosten per resultaat (totaal)</h3>
          <div className="cost-per-result" style={{ justifyContent: 'flex-start', gap: '24px' }}>
            <div className="cost-item"><span className="cost-label">Totaal spend</span><span className="cost-value">€{totalSpend}</span></div>
            {totalMeetings > 0 && <div className="cost-item"><span className="cost-label">Per afspraak</span><span className="cost-value">€{Math.round(totalSpend / totalMeetings)}</span></div>}
            {totalDemos > 0 && <div className="cost-item"><span className="cost-label">Per demo</span><span className="cost-value">€{Math.round(totalSpend / totalDemos)}</span></div>}
            {totalLeads > 0 && <div className="cost-item"><span className="cost-label">Per lead</span><span className="cost-value">€{Math.round(totalSpend / totalLeads)}</span></div>}
          </div>
        </Card>
      )}

      <div className="dashboard-grid">
        <Card className="dashboard-section">
          <h3 className="card-title">Live tests</h3>
          {live.length === 0 ? <p className="text-muted">Geen live experimenten</p> : (
            <div className="mini-list">{live.map((e) => (
              <div key={e.id} className="mini-list-item" onClick={() => navigate(`/experiments/${e.id}`)}>
                <div><span className="mini-list-title">{e.title}</span><span className="mini-list-meta">{e.channel} · {e.funnel} · {daysBetween(e.startDate)} d</span></div>
                <ArrowRight size={16} />
              </div>
            ))}</div>
          )}
        </Card>

        <Card className="dashboard-section">
          <h3 className="card-title">Review nodig</h3>
          {needsReview.length === 0 ? <p className="text-muted">Alles bijgewerkt</p> : (
            <div className="mini-list">{needsReview.map((e) => (
              <div key={e.id} className="mini-list-item" onClick={() => navigate(`/experiments/${e.id}`)}>
                <div><span className="mini-list-title">{e.title}</span><span className="mini-list-meta">{e.channel} · {daysBetween(e.startDate)} d</span></div>
                <ArrowRight size={16} />
              </div>
            ))}</div>
          )}
        </Card>

        <Card className="dashboard-section">
          <h3 className="card-title">Recente learnings</h3>
          {recentLearnings.length === 0 ? <p className="text-muted">Nog geen learnings</p> : (
            <div className="mini-list">{recentLearnings.map((l) => (
              <div key={l.id} className="mini-list-item" onClick={() => navigate('/learnings')}>
                <div><span className="mini-list-title">{l.title}</span><span className="mini-list-meta">{l.funnel} · {l.channel}</span></div>
              </div>
            ))}</div>
          )}
        </Card>

        {warningExps.length > 0 && (
          <Card className="dashboard-section warning-section">
            <h3 className="card-title"><AlertTriangle size={16} /> Aandachtspunten</h3>
            <div className="mini-list">{warningExps.map((e) => (
              <div key={e.id} className="mini-list-item" onClick={() => navigate(`/experiments/${e.id}`)}>
                <div><span className="mini-list-title">{e.title}</span><span className="mini-list-meta warning-text">{e.warnings.filter((w) => w.type === 'warning').map((w) => w.message).join(' · ')}</span></div>
              </div>
            ))}</div>
          </Card>
        )}

        <Card className="dashboard-section">
          <h3 className="card-title">Top inzichten</h3>
          <div className="insights-grid">
            {top.topHooks.length > 0 && <div className="insight-block"><span className="insight-label">Beste hooks</span>{top.topHooks.map((h, i) => <div key={i} className="insight-item"><span className="insight-rank">{i + 1}.</span><span className="insight-text">{h.name}</span></div>)}</div>}
            {top.topCTAs.length > 0 && <div className="insight-block"><span className="insight-label">Beste CTA's</span>{top.topCTAs.map((c, i) => <div key={i} className="insight-item"><span className="insight-rank">{i + 1}.</span><span className="insight-text">{c.name}</span></div>)}</div>}
            {top.topHooks.length === 0 && top.topCTAs.length === 0 && <p className="text-muted">Rond experimenten af om inzichten te zien.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
