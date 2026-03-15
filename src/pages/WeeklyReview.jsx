import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, Badge, StatusBadge, EmptyState } from '../components/Shared';
import { formatDate, daysBetween } from '../lib/helpers';
import { CalendarCheck, ArrowRight, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

export default function WeeklyReview() {
  const { state } = useApp();
  const navigate = useNavigate();
  const now = new Date();
  const weekAgo = new Date(now - 7 * 86400000);

  // Experiments that ran this week
  const activeThisWeek = state.experiments.filter((e) => {
    if (!e.startDate) return false;
    const start = new Date(e.startDate);
    const end = e.endDate ? new Date(e.endDate) : now;
    return start <= now && end >= weekAgo && ['live', 'review', 'completed'].includes(e.status);
  });

  const needsReview = state.experiments.filter((e) => e.status === 'review');

  const completedThisWeek = state.experiments.filter((e) => {
    if (e.status !== 'completed') return false;
    const updated = new Date(e.updatedAt || e.createdAt);
    return updated >= weekAgo;
  });

  const winners = completedThisWeek.filter((e) => e.evaluation?.winnerVariantId);
  const stopped = completedThisWeek.filter((e) => e.evaluation?.decision === 'Stoppen');
  const scaled = completedThisWeek.filter((e) => e.evaluation?.decision === 'Opschalen');
  const toTranslate = completedThisWeek.filter((e) =>
    e.evaluation?.decision?.startsWith('Doorvertalen')
  );

  const recentLearnings = state.learnings
    .filter((l) => new Date(l.createdAt) >= weekAgo)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Summary card data
  const worked = [];
  const didntWork = [];
  const actions = [];

  winners.forEach((e) => {
    const winner = e.variants.find((v) => v.id === e.evaluation.winnerVariantId);
    if (winner) worked.push(`${e.testType || 'Test'}: ${winner.hook?.substring(0, 50) || winner.name}`);
  });

  stopped.forEach((e) => {
    didntWork.push(`${e.title} (gestopt)`);
  });

  state.experiments.filter((e) => e.status === 'review').forEach((e) => {
    actions.push(`Review: ${e.title}`);
  });

  toTranslate.forEach((e) => {
    actions.push(`${e.evaluation.decision}: ${e.title}`);
  });

  scaled.forEach((e) => {
    actions.push(`Opschalen: ${e.title}`);
  });

  return (
    <div className="page">
      <PageHeader
        title="Weekreview"
        subtitle={`Week van ${formatDate(weekAgo.toISOString())} — ${formatDate(now.toISOString())}`}
      />

      {/* Summary card */}
      <Card className="review-summary">
        <h3 className="card-title">Samenvatting</h3>
        <div className="review-summary-grid">
          <div className="review-col">
            <div className="review-col-header">
              <CheckCircle size={16} className="text-green" />
              <span>Wat werkte</span>
            </div>
            {worked.length === 0 ? (
              <p className="text-muted">Geen winnaars deze week</p>
            ) : (
              worked.slice(0, 3).map((w, i) => <p key={i} className="review-item">{w}</p>)
            )}
          </div>
          <div className="review-col">
            <div className="review-col-header">
              <XCircle size={16} className="text-red" />
              <span>Wat niet werkte</span>
            </div>
            {didntWork.length === 0 ? (
              <p className="text-muted">Geen tests gestopt deze week</p>
            ) : (
              didntWork.slice(0, 3).map((w, i) => <p key={i} className="review-item">{w}</p>)
            )}
          </div>
          <div className="review-col">
            <div className="review-col-header">
              <Lightbulb size={16} className="text-yellow" />
              <span>Acties komende week</span>
            </div>
            {actions.length === 0 ? (
              <p className="text-muted">Geen openstaande acties</p>
            ) : (
              actions.slice(0, 3).map((a, i) => <p key={i} className="review-item">{a}</p>)
            )}
          </div>
        </div>
      </Card>

      <div className="dashboard-grid">
        {/* Active this week */}
        <Card className="dashboard-section">
          <h3 className="card-title">Experimenten deze week ({activeThisWeek.length})</h3>
          {activeThisWeek.length === 0 ? (
            <p className="text-muted">Geen experimenten liepen deze week</p>
          ) : (
            <div className="mini-list">
              {activeThisWeek.map((exp) => (
                <div key={exp.id} className="mini-list-item" onClick={() => navigate(`/experiments/${exp.id}`)}>
                  <div>
                    <span className="mini-list-title">{exp.title}</span>
                    <span className="mini-list-meta">
                      <StatusBadge status={exp.status} small /> · {exp.channel} · {daysBetween(exp.startDate)} dagen
                    </span>
                  </div>
                  <ArrowRight size={16} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Needs review */}
        <Card className="dashboard-section">
          <h3 className="card-title">Review nodig ({needsReview.length})</h3>
          {needsReview.length === 0 ? (
            <p className="text-muted">Alles is bijgewerkt</p>
          ) : (
            <div className="mini-list">
              {needsReview.map((exp) => (
                <div key={exp.id} className="mini-list-item" onClick={() => navigate(`/experiments/${exp.id}`)}>
                  <div>
                    <span className="mini-list-title">{exp.title}</span>
                    <span className="mini-list-meta">{exp.channel} · {daysBetween(exp.startDate)} dagen</span>
                  </div>
                  <ArrowRight size={16} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent learnings */}
        <Card className="dashboard-section">
          <h3 className="card-title">Learnings deze week ({recentLearnings.length})</h3>
          {recentLearnings.length === 0 ? (
            <p className="text-muted">Geen nieuwe learnings deze week</p>
          ) : (
            <div className="mini-list">
              {recentLearnings.map((l) => (
                <div key={l.id} className="mini-list-item" onClick={() => navigate('/learnings')}>
                  <div>
                    <span className="mini-list-title">{l.title}</span>
                    <span className="mini-list-meta">{l.funnel} · {l.channel}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
