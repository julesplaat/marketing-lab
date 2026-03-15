import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  PageHeader, Card, Badge, Select, EmptyState, ConfirmDialog,
  FormField, Input, Textarea, MultiSelect, Modal,
} from '../components/Shared';
import {
  FUNNEL_OPTIONS, DEFAULT_CHANNEL_OPTIONS, DEFAULT_TEST_TYPE_OPTIONS, DEFAULT_BUYER_ROLE_OPTIONS,
  DEFAULT_PROBLEM_TAG_OPTIONS, APPLY_TO_OPTIONS, CONFIDENCE_OPTIONS,
} from '../data/defaults';
import { formatDate, generateId } from '../lib/helpers';
import { BookOpen, Search, X, Plus, Edit, Trash2, ExternalLink, Filter } from 'lucide-react';

const QUICK_VIEWS = [
  { value: 'all', label: 'Alle learnings' },
  { value: 'hooks', label: 'Beste hooks' },
  { value: 'ctas', label: 'Beste CTA\'s' },
  { value: 'formats', label: 'Beste formats' },
  { value: 'roles', label: 'Buyer role matches' },
  { value: 'objections', label: 'Bezwaren' },
  { value: 'homepage', label: 'Voor homepage' },
  { value: 'linkedin', label: 'Voor LinkedIn' },
  { value: 'sales', label: 'Voor sales' },
];

export default function Learnings() {
  const { state, addLearning, updateLearning, deleteLearning } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [quickView, setQuickView] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ funnel: '', channel: '', testType: '', buyerRole: '', problemTag: '', applyTo: '', confidence: '' });
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = useMemo(() => {
    let items = [...state.learnings];
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((l) => [l.title, l.body, l.funnel, l.channel, ...(l.buyerRoles || []), ...(l.problemTags || []), ...(l.applyTo || [])].join(' ').toLowerCase().includes(q));
    }
    switch (quickView) {
      case 'hooks': items = items.filter((l) => l.testType === 'Hook'); break;
      case 'ctas': items = items.filter((l) => l.testType === 'CTA'); break;
      case 'formats': items = items.filter((l) => l.testType === 'Format'); break;
      case 'roles': items = items.filter((l) => (l.buyerRoles || []).length > 0); break;
      case 'objections': items = items.filter((l) => { const exp = state.experiments.find((e) => e.id === l.experimentId); return exp?.evaluation?.objectionsSeen; }); break;
      case 'homepage': items = items.filter((l) => (l.applyTo || []).includes('Homepage')); break;
      case 'linkedin': items = items.filter((l) => (l.applyTo || []).includes('LinkedIn')); break;
      case 'sales': items = items.filter((l) => (l.applyTo || []).includes('Salesmateriaal')); break;
    }
    if (filters.funnel) items = items.filter((l) => l.funnel === filters.funnel);
    if (filters.channel) items = items.filter((l) => l.channel === filters.channel);
    if (filters.testType) items = items.filter((l) => l.testType === filters.testType);
    if (filters.buyerRole) items = items.filter((l) => (l.buyerRoles || []).includes(filters.buyerRole));
    if (filters.problemTag) items = items.filter((l) => (l.problemTags || []).includes(filters.problemTag));
    if (filters.applyTo) items = items.filter((l) => (l.applyTo || []).includes(filters.applyTo));
    if (filters.confidence) items = items.filter((l) => l.confidence === filters.confidence);
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return items;
  }, [state.learnings, state.experiments, search, quickView, filters]);

  const handleSaveLearning = (learning) => {
    if (learning.id && state.learnings.find((l) => l.id === learning.id)) {
      updateLearning(learning);
    } else {
      addLearning({ ...learning, id: generateId('learn'), createdAt: new Date().toISOString() });
    }
    setEditModal(null);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="page">
      <PageHeader title="Learnings" subtitle={`${state.learnings.length} learnings opgeslagen`}
        actions={<button className="btn btn-primary" onClick={() => setEditModal({ title: '', body: '', experimentId: '', funnel: '', channel: '', buyerRoles: [], problemTags: [], testType: '', applyTo: [], confidence: 'medium' })}><Plus size={16} /> Nieuwe learning</button>} />

      <div className="quick-view-bar">
        {QUICK_VIEWS.map((qv) => (
          <button key={qv.value} className={`quick-view-btn ${quickView === qv.value ? 'active' : ''}`} onClick={() => setQuickView(qv.value)}>{qv.label}</button>
        ))}
      </div>

      <div className="filter-bar">
        <div className="search-box"><Search size={16} /><input placeholder="Zoek in learnings..." value={search} onChange={(e) => setSearch(e.target.value)} />{search && <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>}</div>
        <button className={`btn btn-ghost filter-toggle ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}><Filter size={16} /> Filters{activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}</button>
      </div>

      {showFilters && (
        <div className="filters-panel"><div className="filters-grid">
          <div className="filter-item"><label>Funnel</label><Select value={filters.funnel} onChange={(v) => setFilters({ ...filters, funnel: v })} options={FUNNEL_OPTIONS} placeholder="Alle" /></div>
          <div className="filter-item"><label>Kanaal</label><Select value={filters.channel} onChange={(v) => setFilters({ ...filters, channel: v })} options={DEFAULT_CHANNEL_OPTIONS} placeholder="Alle" /></div>
          <div className="filter-item"><label>Testtype</label><Select value={filters.testType} onChange={(v) => setFilters({ ...filters, testType: v })} options={DEFAULT_TEST_TYPE_OPTIONS} placeholder="Alle" /></div>
          <div className="filter-item"><label>Buyer role</label><Select value={filters.buyerRole} onChange={(v) => setFilters({ ...filters, buyerRole: v })} options={DEFAULT_BUYER_ROLE_OPTIONS} placeholder="Alle" /></div>
          <div className="filter-item"><label>Vertrouwen</label><Select value={filters.confidence} onChange={(v) => setFilters({ ...filters, confidence: v })} options={CONFIDENCE_OPTIONS} placeholder="Alle" /></div>
          <div className="filter-item"><label>Toepassing</label><Select value={filters.applyTo} onChange={(v) => setFilters({ ...filters, applyTo: v })} options={APPLY_TO_OPTIONS} placeholder="Alle" /></div>
        </div></div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="Geen learnings gevonden" description="Evalueer experimenten om learnings vast te leggen." />
      ) : (
        <div className="learnings-list">
          {filtered.map((l) => {
            const exp = state.experiments.find((e) => e.id === l.experimentId);
            return (
              <Card key={l.id}>
                <div className="learning-header">
                  <h3 className="learning-title">{l.title}</h3>
                  <div className="learning-actions">
                    <button className="btn-icon" onClick={() => setEditModal(l)}><Edit size={14} /></button>
                    <button className="btn-icon btn-danger-text" onClick={() => setDeleteConfirm(l.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="learning-body">{l.body}</p>
                <div className="learning-meta">
                  {l.funnel && <Badge small>{l.funnel}</Badge>}
                  {l.channel && <Badge small>{l.channel}</Badge>}
                  {l.testType && <Badge small>{l.testType}</Badge>}
                  {(l.buyerRoles || []).map((r) => <Badge key={r} small color="blue">{r}</Badge>)}
                  {l.confidence && <Badge small color={l.confidence === 'high' ? 'green' : l.confidence === 'medium' ? 'yellow' : 'gray'}>{l.confidence === 'high' ? 'Hoog' : l.confidence === 'medium' ? 'Middel' : 'Laag'} vertrouwen</Badge>}
                </div>
                <div className="learning-footer">
                  {(l.applyTo || []).length > 0 && <span className="learning-apply">Toepassen op: {l.applyTo.join(', ')}</span>}
                  <span className="learning-date">{formatDate(l.createdAt)}</span>
                  {exp && <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/experiments/${exp.id}`)}><ExternalLink size={12} /> {exp.title}</button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editModal && <LearningModal learning={editModal} experiments={state.experiments} onSave={handleSaveLearning} onClose={() => setEditModal(null)} />}
      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => { deleteLearning(deleteConfirm); setDeleteConfirm(null); }} title="Learning verwijderen" message="Weet je het zeker?" confirmLabel="Verwijder" danger />
    </div>
  );
}

function LearningModal({ learning, experiments, onSave, onClose }) {
  const [form, setForm] = useState({ ...learning });
  const u = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  return (
    <Modal open onClose={onClose} title={form.id ? 'Learning bewerken' : 'Nieuwe learning'} wide>
      <div className="form-grid form-grid-single">
        <FormField label="Titel" required><Input value={form.title} onChange={(v) => u('title', v)} /></FormField>
        <FormField label="Learning"><Textarea value={form.body} onChange={(v) => u('body', v)} rows={4} /></FormField>
      </div>
      <div className="form-grid">
        <FormField label="Bron-experiment"><Select value={form.experimentId} onChange={(v) => u('experimentId', v)} options={experiments.map((e) => ({ value: e.id, label: e.title }))} placeholder="Geen" /></FormField>
        <FormField label="Funnel"><Select value={form.funnel} onChange={(v) => u('funnel', v)} options={FUNNEL_OPTIONS} /></FormField>
        <FormField label="Kanaal"><Select value={form.channel} onChange={(v) => u('channel', v)} options={DEFAULT_CHANNEL_OPTIONS} /></FormField>
        <FormField label="Testtype"><Select value={form.testType} onChange={(v) => u('testType', v)} options={DEFAULT_TEST_TYPE_OPTIONS} /></FormField>
        <FormField label="Vertrouwen"><Select value={form.confidence} onChange={(v) => u('confidence', v)} options={CONFIDENCE_OPTIONS} /></FormField>
      </div>
      <div className="form-grid form-grid-single">
        <FormField label="Buyer roles"><MultiSelect value={form.buyerRoles || []} onChange={(v) => u('buyerRoles', v)} options={DEFAULT_BUYER_ROLE_OPTIONS} /></FormField>
        <FormField label="Toepassen op"><MultiSelect value={form.applyTo || []} onChange={(v) => u('applyTo', v)} options={APPLY_TO_OPTIONS} /></FormField>
      </div>
      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={onClose}>Annuleren</button>
        <button className="btn btn-primary" onClick={() => onSave(form)} disabled={!form.title?.trim()}>Opslaan</button>
      </div>
    </Modal>
  );
}
