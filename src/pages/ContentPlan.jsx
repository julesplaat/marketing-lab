import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, Badge, FormField, Input, Textarea, Select, Modal, ConfirmDialog, EmptyState } from '../components/Shared';
import { CONTENT_STATUS_OPTIONS, CONTENT_CHANNEL_OPTIONS } from '../data/defaults';
import { generateId, formatDate } from '../lib/helpers';
import { FileText, Plus, Edit, Trash2, Search, X, Calendar, ArrowRight } from 'lucide-react';

export default function ContentPlan() {
  const { state, addContent, updateContent, deleteContent } = useApp();
  const items = state.contentPlan || [];
  const [view, setView] = useState('board');
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('');

  const filtered = items.filter((c) => {
    if (search && ![c.title, c.description, c.channel, c.hook, c.cta].join(' ').toLowerCase().includes(search.toLowerCase())) return false;
    if (channelFilter && c.channel !== channelFilter) return false;
    return true;
  });

  const handleSave = (item) => {
    if (item.id && items.find((c) => c.id === item.id)) {
      updateContent(item);
    } else {
      addContent({ ...item, id: generateId('content'), createdAt: new Date().toISOString() });
    }
    setEditModal(null);
  };

  const moveStatus = (id, newStatus) => {
    updateContent({ id, status: newStatus });
  };

  const emptyItem = { title: '', description: '', status: 'idea', channel: '', hook: '', cta: '', format: '', publishDate: '', experimentId: '', notes: '' };

  return (
    <div className="page">
      <PageHeader title="Content planning" subtitle="Plan en beheer je content per kanaal"
        actions={<button className="btn btn-primary" onClick={() => setEditModal(emptyItem)}><Plus size={16} /> Nieuw item</button>} />

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Zoek..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
        </div>
        <Select value={channelFilter} onChange={setChannelFilter} options={CONTENT_CHANNEL_OPTIONS} placeholder="Alle kanalen" />
        <div className="view-toggle">
          <button className={`btn btn-sm ${view === 'board' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('board')}>Board</button>
          <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('list')}>Lijst</button>
        </div>
      </div>

      {view === 'board' ? (
        <div className="content-board">
          {CONTENT_STATUS_OPTIONS.map(({ value, label }) => {
            const col = filtered.filter((c) => c.status === value);
            return (
              <div key={value} className="board-column">
                <div className="board-column-header">
                  <span>{label}</span>
                  <span className="board-count">{col.length}</span>
                </div>
                {col.sort((a, b) => new Date(a.publishDate || a.createdAt) - new Date(b.publishDate || b.createdAt)).map((item) => (
                  <Card key={item.id} className="board-card" onClick={() => setEditModal(item)}>
                    <div className="board-card-title">{item.title || 'Zonder titel'}</div>
                    <div className="learning-meta" style={{ marginTop: '6px' }}>
                      {item.channel && <Badge small>{item.channel}</Badge>}
                      {item.publishDate && <Badge small color="blue"><Calendar size={10} /> {formatDate(item.publishDate)}</Badge>}
                    </div>
                    {item.hook && <p className="board-card-hook">{item.hook}</p>}
                  </Card>
                ))}
                <button className="btn btn-ghost btn-sm board-add" onClick={() => setEditModal({ ...emptyItem, status: value })}>
                  <Plus size={14} /> Toevoegen
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        filtered.length === 0 ? (
          <EmptyState icon={FileText} title="Geen content gepland" action={<button className="btn btn-primary" onClick={() => setEditModal(emptyItem)}><Plus size={16} /> Eerste item</button>} />
        ) : (
          <div className="experiments-list">
            {filtered.sort((a, b) => new Date(a.publishDate || '9999') - new Date(b.publishDate || '9999')).map((item) => (
              <Card key={item.id} className="experiment-card" onClick={() => setEditModal(item)}>
                <div className="exp-card-header">
                  <Badge small color={item.status === 'published' ? 'green' : item.status === 'scheduled' ? 'blue' : 'gray'}>
                    {CONTENT_STATUS_OPTIONS.find((s) => s.value === item.status)?.label || item.status}
                  </Badge>
                  {item.channel && <Badge small>{item.channel}</Badge>}
                  {item.publishDate && <Badge small><Calendar size={10} /> {formatDate(item.publishDate)}</Badge>}
                </div>
                <h3 className="exp-card-title">{item.title || 'Zonder titel'}</h3>
                {item.hook && <p className="exp-card-desc">{item.hook}</p>}
              </Card>
            ))}
          </div>
        )
      )}

      {editModal && (
        <ContentModal item={editModal} experiments={state.experiments} onSave={handleSave}
          onDelete={editModal.id ? () => { setDeleteConfirm(editModal.id); setEditModal(null); } : null}
          onClose={() => setEditModal(null)} />
      )}

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { deleteContent(deleteConfirm); setDeleteConfirm(null); }}
        title="Verwijderen" message="Weet je het zeker?" confirmLabel="Verwijder" danger />
    </div>
  );
}

function ContentModal({ item, experiments, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ ...item });
  const u = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  return (
    <Modal open onClose={onClose} title={form.id ? 'Content bewerken' : 'Nieuw content item'} wide>
      <div className="form-grid">
        <FormField label="Titel" required><Input value={form.title} onChange={(v) => u('title', v)} placeholder="Bijv. LinkedIn post werkdruk" /></FormField>
        <FormField label="Kanaal"><Select value={form.channel} onChange={(v) => u('channel', v)} options={CONTENT_CHANNEL_OPTIONS} /></FormField>
        <FormField label="Status"><Select value={form.status} onChange={(v) => u('status', v)} options={CONTENT_STATUS_OPTIONS} /></FormField>
        <FormField label="Publicatiedatum"><Input type="date" value={form.publishDate} onChange={(v) => u('publishDate', v)} /></FormField>
        <FormField label="Format"><Input value={form.format} onChange={(v) => u('format', v)} placeholder="Bijv. Carousel, Video, Blog..." /></FormField>
        <FormField label="Gekoppeld experiment"><Select value={form.experimentId} onChange={(v) => u('experimentId', v)} options={experiments.map((e) => ({ value: e.id, label: e.title }))} placeholder="Geen" /></FormField>
      </div>
      <div className="form-grid form-grid-single" style={{ marginTop: '1rem' }}>
        <FormField label="Hook / boodschap"><Textarea value={form.hook} onChange={(v) => u('hook', v)} placeholder="Hook of hoofdboodschap" rows={2} /></FormField>
        <FormField label="CTA"><Input value={form.cta} onChange={(v) => u('cta', v)} placeholder="Call-to-action" /></FormField>
        <FormField label="Omschrijving"><Textarea value={form.description} onChange={(v) => u('description', v)} placeholder="Meer details, copy, woordgroepen..." rows={3} /></FormField>
        <FormField label="Notities"><Textarea value={form.notes} onChange={(v) => u('notes', v)} placeholder="Interne notities..." rows={2} /></FormField>
      </div>
      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        {onDelete && <button className="btn btn-ghost btn-danger-text" onClick={onDelete}><Trash2 size={14} /> Verwijder</button>}
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost" onClick={onClose}>Annuleren</button>
        <button className="btn btn-primary" onClick={() => onSave(form)} disabled={!form.title?.trim()}>Opslaan</button>
      </div>
    </Modal>
  );
}
