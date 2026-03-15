import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, Badge, StatusBadge, EmptyState } from '../components/Shared';
import { daysBetween } from '../lib/helpers';
import { Layers, ArrowRight, AlertTriangle } from 'lucide-react';

const FUNNELS = [
  { key: 'TOFU', label: 'TOFU', sub: 'Awareness', color: '#8b5cf6' },
  { key: 'MOFU', label: 'MOFU', sub: 'Consideration', color: '#3b82f6' },
  { key: 'BOFU', label: 'BOFU', sub: 'Decision', color: '#10b981' },
];

export default function FunnelOverview() {
  const { state } = useApp();
  const navigate = useNavigate();
  const exps = state.experiments;

  const byFunnel = {};
  FUNNELS.forEach(({ key }) => { byFunnel[key] = exps.filter((e) => e.funnel === key); });
  const noFunnel = exps.filter((e) => !e.funnel);

  // Detect gaps
  const gaps = [];
  FUNNELS.forEach(({ key, label }) => {
    const active = byFunnel[key].filter((e) => ['live', 'idea'].includes(e.status));
    if (active.length === 0) gaps.push(`Geen actieve experimenten in ${label}`);
  });

  // Cost per result per funnel
  const costByFunnel = {};
  FUNNELS.forEach(({ key }) => {
    let totalSpend = 0, totalMeetings = 0, totalDemos = 0;
    byFunnel[key].forEach((e) => {
      (e.results || []).forEach((r) => {
        totalSpend += Number(r.spend) || 0;
        totalMeetings += Number(r.meetings) || 0;
        totalDemos += Number(r.demoRequests) || 0;
      });
    });
    costByFunnel[key] = {
      spend: totalSpend,
      costPerMeeting: totalMeetings > 0 ? Math.round(totalSpend / totalMeetings) : null,
      costPerDemo: totalDemos > 0 ? Math.round(totalSpend / totalDemos) : null,
    };
  });

  return (
    <div className="page">
      <PageHeader title="Funnel-overzicht" subtitle="Experimenten per funnelfase" />

      {gaps.length > 0 && (
        <div className="warnings-container">
          {gaps.map((g, i) => (
            <div key={i} className="warning-item warning-warning">
              <AlertTriangle size={16} /> <span>{g}</span>
            </div>
          ))}
        </div>
      )}

      <div className="funnel-grid">
        {FUNNELS.map(({ key, label, sub, color }) => {
          const items = byFunnel[key];
          const live = items.filter((e) => e.status === 'live');
          const review = items.filter((e) => e.status === 'review');
          const completed = items.filter((e) => e.status === 'completed');
          const ideas = items.filter((e) => e.status === 'idea');
          const cost = costByFunnel[key];

          return (
            <div key={key} className="funnel-column">
              <div className="funnel-header" style={{ borderTopColor: color }}>
                <div>
                  <h3 className="funnel-title">{label}</h3>
                  <span className="funnel-sub">{sub}</span>
                </div>
                <span className="funnel-count">{items.length}</span>
              </div>

              {cost.spend > 0 && (
                <div className="funnel-costs">
                  <span>Totaal spend: €{cost.spend}</span>
                  {cost.costPerMeeting && <span>€{cost.costPerMeeting}/afspraak</span>}
                  {cost.costPerDemo && <span>€{cost.costPerDemo}/demo</span>}
                </div>
              )}

              <div className="funnel-section">
                {live.length > 0 && <div className="funnel-section-label">Live ({live.length})</div>}
                {live.map((e) => <FunnelCard key={e.id} exp={e} onClick={() => navigate(`/experiments/${e.id}`)} />)}

                {review.length > 0 && <div className="funnel-section-label">Review ({review.length})</div>}
                {review.map((e) => <FunnelCard key={e.id} exp={e} onClick={() => navigate(`/experiments/${e.id}`)} />)}

                {completed.length > 0 && <div className="funnel-section-label">Afgerond ({completed.length})</div>}
                {completed.map((e) => <FunnelCard key={e.id} exp={e} onClick={() => navigate(`/experiments/${e.id}`)} />)}

                {ideas.length > 0 && <div className="funnel-section-label">Ideeën ({ideas.length})</div>}
                {ideas.map((e) => <FunnelCard key={e.id} exp={e} onClick={() => navigate(`/experiments/${e.id}`)} />)}

                {items.length === 0 && <p className="text-muted" style={{ padding: '12px 0' }}>Geen experimenten</p>}
              </div>
            </div>
          );
        })}
      </div>

      {noFunnel.length > 0 && (
        <Card style={{ marginTop: '20px' }}>
          <h3 className="card-title">Zonder funnel ({noFunnel.length})</h3>
          <div className="mini-list">
            {noFunnel.map((e) => (
              <div key={e.id} className="mini-list-item" onClick={() => navigate(`/experiments/${e.id}`)}>
                <div>
                  <span className="mini-list-title">{e.title}</span>
                  <span className="mini-list-meta"><StatusBadge status={e.status} small /> · {e.channel}</span>
                </div>
                <ArrowRight size={16} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function FunnelCard({ exp, onClick }) {
  const winner = exp.evaluation?.winnerVariantId ? exp.variants.find((v) => v.id === exp.evaluation.winnerVariantId) : null;
  return (
    <div className="funnel-card" onClick={onClick}>
      <div className="funnel-card-top">
        <StatusBadge status={exp.status} small />
        {exp.channel && <Badge small>{exp.channel}</Badge>}
      </div>
      <div className="funnel-card-title">{exp.title}</div>
      {winner && <Badge small color="green">Winnaar: {winner.name}</Badge>}
      {exp.evaluation?.decision && <Badge small color="blue">{exp.evaluation.decision}</Badge>}
    </div>
  );
}
