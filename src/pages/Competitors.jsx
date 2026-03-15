import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, Badge, FormField, Input, Textarea, Select, Modal, ConfirmDialog, EmptyState } from '../components/Shared';
import { generateId, formatDate } from '../lib/helpers';
import { Eye, Plus, Edit, Trash2, Search, X } from 'lucide-react';

export default function Competitors() {
  const { state, addCompetitor, updateCompetitor, deleteCompetitor } = useApp();
  const competitors = state.competitors || [];
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = competitors
    .filter((c) => !search || [c.name, c.notes, c.hook, c.channel, c.source].join(' ').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleSave = (item) => {
    if (item.id && competitors.find((c) => c.id === item.id)) {
      updateCompetitor(item);
    } else {
      addCompetitor({ ...item, id: generateId('comp'), createdAt: new Date().toISOString() });
    }
    setEditModal(null);
  };

  return (
    <div className="page">
      <PageHeader title="Competitor-logboek" subtitle="Noteer wat concurrenten doen"
        actions={<button className="btn btn-primary" onClick={() => setEditModal({ name: '', channel: '', hook: '', cta: '', format: '', source: '', notes: '', seenDate: new Date().toISOString().split('T')[0] })}><Plus size={16} /> Nieuw</button>} />

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Zoek in logboek..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Eye} title="Geen notities" description="Voeg toe wat je ziet van concurrenten."
          action={<button className="btn btn-primary" onClick={() => setEditModal({ name: '', channel: '', hook: '', cta: '', format: '', source: '', notes: '', seenDate: new Date().toISOString().split('T')[0] })}><Plus size={16} /> Eerste notitie</button>} />
      ) : (
        <div className="learnings-list">
          {filtered.map((c) => (
            <Card key={c.id}>
              <div className="learning-header">
                <h3 className="learning-title">{c.name || 'Onbekend'}</h3>
                <div className="learning-actions">
                  <button className="btn-icon" onClick={() => setEditModal(c)}><Edit size={14} /></button>
                  <button className="btn-icon btn-danger-text" onClick={() => setDeleteConfirm(c.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              {c.hook && <p className="learning-body"><strong>Hook:</strong> {c.hook}</p>}
              {c.notes && <p className="learning-body">{c.notes}</p>}
              <div className="learning-meta">
                {c.channel && <Badge small>{c.channel}</Badge>}
                {c.format && <Badge small>{c.format}</Badge>}
                {c.cta && <Badge small color="blue">CTA: {c.cta}</Badge>}
              </div>
              <div className="learning-footer">
                {c.source && <span className="learning-apply">Bron: {c.source}</span>}
                <span className="learning-date">{formatDate(c.seenDate || c.createdAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editModal && (
        <CompetitorModal item={editModal} onSave={handleSave} onClose={() => setEditModal(null)} />
      )}

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { deleteCompetitor(deleteConfirm); setDeleteConfirm(null); }}
        title="Verwijderen" message="Weet je het zeker?" confirmLabel="Verwijder" danger />
    </div>
  );
}

function CompetitorModal({ item, onSave, onClose }) {
  const [form, setForm] = useState({ ...item });
  const u = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  return (
    <Modal open onClose={onClose} title={form.id ? 'Bewerken' : 'Nieuwe observatie'} wide>
      <div className="form-grid">
        <FormField label="Bedrijf / concurrent"><Input value={form.name} onChange={(v) => u('name', v)} placeholder="Bijv. CupClean, Cirkular..." /></FormField>
        <FormField label="Kanaal"><Select value={form.channel} onChange={(v) => u('channel', v)} options={['Meta', 'LinkedIn', 'Google', 'Website', 'E-mail', 'Beurs', 'Anders']} /></FormField>
        <FormField label="Datum gezien"><Input type="date" value={form.seenDate} onChange={(v) => u('seenDate', v)} /></FormField>
        <FormField label="Format"><Input value={form.format} onChange={(v) => u('format', v)} placeholder="Bijv. Video, Carousel, Story..." /></FormField>
      </div>
      <div className="form-grid form-grid-single" style={{ marginTop: '1rem' }}>
        <FormField label="Hook / boodschap"><Textarea value={form.hook} onChange={(v) => u('hook', v)} placeholder="Wat was hun hook?" rows={2} /></FormField>
        <FormField label="CTA"><Input value={form.cta} onChange={(v) => u('cta', v)} placeholder="Wat was hun call-to-action?" /></FormField>
        <FormField label="Bron / URL"><Input value={form.source} onChange={(v) => u('source', v)} placeholder="Link of waar je het zag" /></FormField>
        <FormField label="Notities"><Textarea value={form.notes} onChange={(v) => u('notes', v)} placeholder="Wat viel op? Wat kunnen we hiervan leren?" rows={3} /></FormField>
      </div>
      <div className="form-actions" style={{ marginTop: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={onClose}>Annuleren</button>
        <button className="btn btn-primary" onClick={() => onSave(form)}>Opslaan</button>
      </div>
    </Modal>
  );
}
