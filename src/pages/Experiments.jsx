import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, StatusBadge, Badge, Card, EmptyState, Select } from '../components/Shared';
import { STATUS_OPTIONS, FUNNEL_OPTIONS, DEFAULT_CHANNEL_OPTIONS, DEFAULT_TEST_TYPE_OPTIONS, DEFAULT_BUYER_ROLE_OPTIONS, DECISION_OPTIONS, getOptions } from '../data/defaults';
import { formatDate, daysBetween } from '../lib/helpers';
import { FlaskConical, PlusCircle, Search, X, Filter } from 'lucide-react';

export default function Experiments() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: searchParams.get('status') || '', funnel: '', channel: '', testType: '', buyerRole: '', decision: '' });
  const [showFilters, setShowFilters] = useState(!!searchParams.get('status'));

  const channelOpts = getOptions(DEFAULT_CHANNEL_OPTIONS, 'channel', state.settings);
  const testTypeOpts = getOptions(DEFAULT_TEST_TYPE_OPTIONS, 'testType', state.settings);
  const buyerRoleOpts = getOptions(DEFAULT_BUYER_ROLE_OPTIONS, 'buyerRole', state.settings);

  const filtered = useMemo(() => {
    let exps = [...state.experiments];
    if (search.trim()) {
      const q = search.toLowerCase();
      exps = exps.filter((e) => [e.title, e.hypothesis, e.description, e.channel, ...(e.buyerRoles || []), ...(e.problemTags || []), ...(e.variants || []).map((v) => [v.hook, v.cta, v.message].join(' '))].join(' ').toLowerCase().includes(q));
    }
    if (filters.status) exps = exps.filter((e) => e.status === filters.status);
    if (filters.funnel) exps = exps.filter((e) => e.funnel === filters.funnel);
    if (filters.channel) exps = exps.filter((e) => e.channel === filters.channel);
    if (filters.testType) exps = exps.filter((e) => e.testType === filters.testType);
    if (filters.buyerRole) exps = exps.filter((e) => (e.buyerRoles || []).includes(filters.buyerRole));
    if (filters.decision) exps = exps.filter((e) => e.evaluation?.decision === filters.decision);
    exps.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    return exps;
  }, [state.experiments, search, filters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="page">
      <PageHeader title="Experimenten" subtitle={`${state.experiments.length} totaal`}
        actions={<button className="btn btn-primary" onClick={() => navigate('/experiments/new')}><PlusCircle size={16} /> Nieuw experiment</button>} />

      <div className="filter-bar">
        <div className="search-box"><Search size={16} /><input placeholder="Zoek op titel, hook, kanaal..." value={search} onChange={(e) => setSearch(e.target.value)} />{search && <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>}</div>
        <button className={`btn btn-ghost filter-toggle ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}><Filter size={16} /> Filters{activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}</button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-item"><label>Status</label><Select value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} options={STATUS_OPTIONS} placeholder="Alle" /></div>
            <div className="filter-item"><label>Funnel</label><Select value={filters.funnel} onChange={(v) => setFilters({ ...filters, funnel: v })} options={FUNNEL_OPTIONS} placeholder="Alle" /></div>
            <div className="filter-item"><label>Kanaal</label><Select value={filters.channel} onChange={(v) => setFilters({ ...filters, channel: v })} options={channelOpts} placeholder="Alle" /></div>
            <div className="filter-item"><label>Testtype</label><Select value={filters.testType} onChange={(v) => setFilters({ ...filters, testType: v })} options={testTypeOpts} placeholder="Alle" /></div>
            <div className="filter-item"><label>Buyer role</label><Select value={filters.buyerRole} onChange={(v) => setFilters({ ...filters, buyerRole: v })} options={buyerRoleOpts} placeholder="Alle" /></div>
            <div className="filter-item"><label>Besluit</label><Select value={filters.decision} onChange={(v) => setFilters({ ...filters, decision: v })} options={DECISION_OPTIONS} placeholder="Alle" /></div>
          </div>
          {activeFilterCount > 0 && <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: '', funnel: '', channel: '', testType: '', buyerRole: '', decision: '' })}>Wis filters</button>}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={FlaskConical} title="Geen experimenten" description={search || activeFilterCount > 0 ? 'Pas zoekopdracht aan' : 'Start je eerste experiment'}
          action={<button className="btn btn-primary" onClick={() => navigate('/experiments/new')}><PlusCircle size={16} /> Nieuw experiment</button>} />
      ) : (
        <div className="experiments-list">{filtered.map((exp) => {
          const daysLive = exp.startDate ? daysBetween(exp.startDate, exp.endDate || null) : 0;
          const winner = exp.evaluation?.winnerVariantId ? exp.variants.find((v) => v.id === exp.evaluation.winnerVariantId) : null;
          return (
            <Card key={exp.id} className="experiment-card" onClick={() => navigate(`/experiments/${exp.id}`)}>
              <div className="exp-card-top">
                <div className="exp-card-header">
                  <StatusBadge status={exp.status} />
                  <span className="exp-card-meta">{exp.funnel && <Badge small>{exp.funnel}</Badge>}{exp.channel && <Badge small>{exp.channel}</Badge>}{exp.testType && <Badge small>{exp.testType}</Badge>}</span>
                </div>
                <h3 className="exp-card-title">{exp.title}</h3>
                {exp.hypothesis && <p className="exp-card-desc">{exp.hypothesis}</p>}
              </div>
              <div className="exp-card-bottom">
                <div className="exp-card-stats">
                  {exp.startDate && <span>{formatDate(exp.startDate)}</span>}
                  {daysLive > 0 && <span>{daysLive} dagen</span>}
                  {exp.variants.length > 0 && <span>{exp.variants.length} varianten</span>}
                  {winner && <Badge color="green" small>Winnaar: {winner.name}</Badge>}
                  {exp.evaluation?.decision && <Badge color="blue" small>{exp.evaluation.decision}</Badge>}
                </div>
              </div>
            </Card>
          );
        })}</div>
      )}
    </div>
  );
}
