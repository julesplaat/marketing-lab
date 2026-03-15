import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, FormField, Input, Textarea, Select, MultiSelect, Card, WarningBox } from '../components/Shared';
import {
  STATUS_OPTIONS, FUNNEL_OPTIONS, CAMPAIGN_LEVEL_OPTIONS,
  DEFAULT_CHANNEL_OPTIONS, DEFAULT_TEST_TYPE_OPTIONS, DEFAULT_BUYER_ROLE_OPTIONS,
  DEFAULT_PROBLEM_TAG_OPTIONS, DEFAULT_CTA_OPTIONS, DEFAULT_CREATIVE_TYPE_OPTIONS, getOptions,
} from '../data/defaults';
import { generateId, daysBetween, getFunnelCtaWarning } from '../lib/helpers';
import { Save, PlusCircle, Trash2, ArrowLeft, Plus } from 'lucide-react';

const EMPTY_VARIANT = { id: '', name: '', hook: '', message: '', cta: '', format: '', creativeType: '', assetName: '', landingPageUrl: '', notes: '' };

export default function ExperimentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addExperiment, updateExperiment, updateSettings } = useApp();
  const isEdit = !!id;
  const settings = state.settings || {};

  // Get merged options (default + custom)
  const ctaOpts = getOptions(DEFAULT_CTA_OPTIONS, 'cta', settings);
  const creativeOpts = getOptions(DEFAULT_CREATIVE_TYPE_OPTIONS, 'creativeType', settings);
  const channelOpts = getOptions(DEFAULT_CHANNEL_OPTIONS, 'channel', settings);
  const testTypeOpts = getOptions(DEFAULT_TEST_TYPE_OPTIONS, 'testType', settings);
  const buyerRoleOpts = getOptions(DEFAULT_BUYER_ROLE_OPTIONS, 'buyerRole', settings);
  const problemOpts = getOptions(DEFAULT_PROBLEM_TAG_OPTIONS, 'problemTag', settings);

  const [form, setForm] = useState({
    title: '', description: '', status: 'idea', funnel: '', channel: '', campaignLevel: '',
    testType: '', hypothesis: '', variableChanged: '', controlsKeptConstant: '', goal: '',
    buyerRoles: [], problemTags: [], ctaCategory: '', owner: '', budget: '', startDate: '',
    endDate: '', durationDaysPlanned: '', priority: 'medium', notes: '',
    variants: [
      { ...EMPTY_VARIANT, id: 'var_a', name: 'A' },
      { ...EMPTY_VARIANT, id: 'var_b', name: 'B' },
    ],
  });
  const [formWarnings, setFormWarnings] = useState([]);

  useEffect(() => {
    if (isEdit) {
      const exp = state.experiments.find((e) => e.id === id);
      if (exp) setForm({ ...form, ...exp, budget: exp.budget || '', durationDaysPlanned: exp.durationDaysPlanned || '' });
      else navigate('/experiments');
    }
  }, [id]);

  useEffect(() => {
    const w = [];
    if (form.funnel && form.ctaCategory) { const fw = getFunnelCtaWarning(form.funnel, form.ctaCategory); if (fw) w.push({ type: 'info', message: fw }); }
    if (form.hypothesis && !form.variableChanged && !form.controlsKeptConstant) w.push({ type: 'info', message: 'Vul in wat er verandert en wat gelijk blijft.' });
    if (form.variants.length >= 2) {
      const v = form.variants; let d = 0;
      if (v[0].hook && v[1].hook && v[0].hook !== v[1].hook) d++;
      if (v[0].cta && v[1].cta && v[0].cta !== v[1].cta) d++;
      if (v[0].format && v[1].format && v[0].format !== v[1].format) d++;
      if (v[0].creativeType && v[1].creativeType && v[0].creativeType !== v[1].creativeType) d++;
      if (d > 1) w.push({ type: 'warning', message: 'Varianten verschillen op meerdere vlakken.' });
    }
    setFormWarnings(w);
  }, [form]);

  const u = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const uv = (i, f, v) => setForm((p) => { const vs = [...p.variants]; vs[i] = { ...vs[i], [f]: v }; return { ...p, variants: vs }; });

  const addVariant = () => {
    if (form.variants.length >= 3) return;
    const n = String.fromCharCode(65 + form.variants.length);
    setForm((p) => ({ ...p, variants: [...p.variants, { ...EMPTY_VARIANT, id: `var_${n.toLowerCase()}`, name: n }] }));
  };
  const removeVariant = (i) => { if (form.variants.length <= 2) return; setForm((p) => ({ ...p, variants: p.variants.filter((_, j) => j !== i) })); };

  const calcDuration = () => form.startDate && form.endDate ? daysBetween(form.startDate, form.endDate) : form.durationDaysPlanned || 0;

  // Add custom option inline
  const addCustomOption = (key, value) => {
    if (!value.trim()) return;
    const custom = { ...settings.customOptions };
    if (!custom[key]) custom[key] = [];
    if (!custom[key].includes(value) && !getDefaults(key).includes(value)) {
      custom[key] = [...custom[key], value];
      updateSettings({ customOptions: custom });
    }
  };

  function getDefaults(key) {
    const map = { cta: DEFAULT_CTA_OPTIONS, creativeType: DEFAULT_CREATIVE_TYPE_OPTIONS, channel: DEFAULT_CHANNEL_OPTIONS, testType: DEFAULT_TEST_TYPE_OPTIONS, buyerRole: DEFAULT_BUYER_ROLE_OPTIONS, problemTag: DEFAULT_PROBLEM_TAG_OPTIONS };
    return map[key] || [];
  }

  const handleSave = () => {
    if (!form.title.trim()) { alert('Vul een naam in.'); return; }
    const now = new Date().toISOString();
    if (isEdit) {
      updateExperiment({ ...form, budget: Number(form.budget) || 0, durationDaysPlanned: Number(form.durationDaysPlanned) || calcDuration(), updatedAt: now });
      navigate(`/experiments/${id}`);
    } else {
      const newId = generateId('exp');
      addExperiment({ ...form, id: newId, budget: Number(form.budget) || 0, durationDaysPlanned: Number(form.durationDaysPlanned) || calcDuration(), durationDaysActual: 0, results: [], evaluation: {}, createdAt: now, updatedAt: now });
      navigate(`/experiments/${newId}`);
    }
  };

  return (
    <div className="page">
      <PageHeader title={isEdit ? 'Experiment bewerken' : 'Nieuw experiment'} subtitle={isEdit ? form.title : 'Registreer een nieuwe test'}
        actions={<div className="page-actions">
          <button className="btn btn-ghost" onClick={() => navigate(isEdit ? `/experiments/${id}` : '/experiments')}><ArrowLeft size={16} /> Terug</button>
          <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Opslaan</button>
        </div>} />

      <WarningBox warnings={formWarnings} />

      <Card className="form-section">
        <h3 className="card-title">Algemeen</h3>
        <div className="form-grid">
          <FormField label="Experimentnaam" required><Input value={form.title} onChange={(v) => u('title', v)} placeholder="Bijv. Hook test werkdruk vs. water" /></FormField>
          <FormField label="Korte omschrijving"><Input value={form.description} onChange={(v) => u('description', v)} /></FormField>
          <FormField label="Status"><Select value={form.status} onChange={(v) => u('status', v)} options={STATUS_OPTIONS} /></FormField>
          <FormField label="Prioriteit"><Select value={form.priority} onChange={(v) => u('priority', v)} options={[{ value: 'low', label: 'Laag' }, { value: 'medium', label: 'Middel' }, { value: 'high', label: 'Hoog' }]} /></FormField>
          <FormField label="Funnel"><Select value={form.funnel} onChange={(v) => u('funnel', v)} options={FUNNEL_OPTIONS} /></FormField>
          <FormField label="Kanaal"><SelectWithAdd value={form.channel} onChange={(v) => u('channel', v)} options={channelOpts} onAdd={(v) => addCustomOption('channel', v)} /></FormField>
          <FormField label="Campagneniveau"><Select value={form.campaignLevel} onChange={(v) => u('campaignLevel', v)} options={CAMPAIGN_LEVEL_OPTIONS} /></FormField>
          <FormField label="Testtype"><SelectWithAdd value={form.testType} onChange={(v) => u('testType', v)} options={testTypeOpts} onAdd={(v) => addCustomOption('testType', v)} /></FormField>
          <FormField label="Verantwoordelijke"><Input value={form.owner} onChange={(v) => u('owner', v)} /></FormField>
          <FormField label="Budget (€)"><Input type="number" value={form.budget} onChange={(v) => u('budget', v)} /></FormField>
        </div>
      </Card>

      <Card className="form-section">
        <h3 className="card-title">Doelgroep & context</h3>
        <div className="form-grid">
          <FormField label="Buyer roles"><MultiSelect value={form.buyerRoles} onChange={(v) => u('buyerRoles', v)} options={buyerRoleOpts} /></FormField>
          <FormField label="Kernprobleem / angle"><MultiSelect value={form.problemTags} onChange={(v) => u('problemTags', v)} options={problemOpts} /></FormField>
          <FormField label="CTA-categorie"><SelectWithAdd value={form.ctaCategory} onChange={(v) => u('ctaCategory', v)} options={ctaOpts} onAdd={(v) => addCustomOption('cta', v)} /></FormField>
        </div>
      </Card>

      <Card className="form-section">
        <h3 className="card-title">Testopzet</h3>
        <div className="form-grid form-grid-single">
          <FormField label="Hypothese"><Textarea value={form.hypothesis} onChange={(v) => u('hypothesis', v)} placeholder="Wat verwacht je en waarom?" /></FormField>
          <FormField label="Wat testen we precies?"><Input value={form.goal} onChange={(v) => u('goal', v)} /></FormField>
          <FormField label="Welke variabele verandert?"><Input value={form.variableChanged} onChange={(v) => u('variableChanged', v)} /></FormField>
          <FormField label="Wat blijft bewust gelijk?"><Input value={form.controlsKeptConstant} onChange={(v) => u('controlsKeptConstant', v)} /></FormField>
        </div>
      </Card>

      <Card className="form-section">
        <h3 className="card-title">Planning</h3>
        <div className="form-grid">
          <FormField label="Startdatum"><Input type="date" value={form.startDate} onChange={(v) => u('startDate', v)} /></FormField>
          <FormField label="Einddatum"><Input type="date" value={form.endDate} onChange={(v) => u('endDate', v)} /></FormField>
          <FormField label="Testduur (dagen)">
            <Input type="number" value={form.startDate && form.endDate ? calcDuration() : form.durationDaysPlanned} onChange={(v) => u('durationDaysPlanned', v)} disabled={!!form.startDate && !!form.endDate} />
          </FormField>
        </div>
      </Card>

      <Card className="form-section">
        <div className="section-header-inline">
          <h3 className="card-title">Varianten</h3>
          {form.variants.length < 3 && <button className="btn btn-ghost btn-sm" onClick={addVariant}><PlusCircle size={14} /> Variant toevoegen</button>}
        </div>
        {form.variants.map((v, i) => (
          <div key={v.id} className="variant-block">
            <div className="variant-header">
              <span className="variant-label">Variant {v.name}</span>
              {form.variants.length > 2 && <button className="btn btn-ghost btn-sm btn-danger-text" onClick={() => removeVariant(i)}><Trash2 size={14} /></button>}
            </div>
            <div className="form-grid">
              <FormField label="Hook"><Textarea rows={2} value={v.hook} onChange={(val) => uv(i, 'hook', val)} /></FormField>
              <FormField label="Subkop / boodschap"><Input value={v.message} onChange={(val) => uv(i, 'message', val)} /></FormField>
              <FormField label="CTA"><SelectWithAdd value={v.cta} onChange={(val) => uv(i, 'cta', val)} options={ctaOpts} onAdd={(val) => addCustomOption('cta', val)} /></FormField>
              <FormField label="Format"><Input value={v.format} onChange={(val) => uv(i, 'format', val)} placeholder="Bijv. Story, Carousel, Video 30s" /></FormField>
              <FormField label="Creative type"><SelectWithAdd value={v.creativeType} onChange={(val) => uv(i, 'creativeType', val)} options={creativeOpts} onAdd={(val) => addCustomOption('creativeType', val)} /></FormField>
              <FormField label="Assetnaam"><Input value={v.assetName} onChange={(val) => uv(i, 'assetName', val)} /></FormField>
              <FormField label="LP URL"><Input value={v.landingPageUrl} onChange={(val) => uv(i, 'landingPageUrl', val)} /></FormField>
              <FormField label="Opmerkingen"><Input value={v.notes} onChange={(val) => uv(i, 'notes', val)} /></FormField>
            </div>
          </div>
        ))}
      </Card>

      <Card className="form-section">
        <h3 className="card-title">Notities</h3>
        <Textarea value={form.notes} onChange={(v) => u('notes', v)} rows={4} />
      </Card>

      <div className="form-actions-bar">
        <button className="btn btn-ghost" onClick={() => navigate(isEdit ? `/experiments/${id}` : '/experiments')}>Annuleren</button>
        <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> {isEdit ? 'Opslaan' : 'Aanmaken'}</button>
      </div>
    </div>
  );
}

// Select with inline "add new" option
function SelectWithAdd({ value, onChange, options, onAdd, placeholder = 'Selecteer...' }) {
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState('');

  const handleAdd = () => {
    if (newVal.trim()) {
      onAdd(newVal.trim());
      onChange(newVal.trim());
      setNewVal('');
      setAdding(false);
    }
  };

  if (adding) {
    return (
      <div className="select-add-inline">
        <input className="form-input form-input-sm" value={newVal} onChange={(e) => setNewVal(e.target.value)}
          placeholder="Typ nieuwe optie..." autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }} />
        <button className="btn btn-sm btn-primary" onClick={handleAdd}>+</button>
        <button className="btn btn-sm btn-ghost" onClick={() => setAdding(false)}>×</button>
      </div>
    );
  }

  return (
    <div className="select-add-wrapper">
      <select className="form-input form-select" value={value || ''} onChange={(e) => { if (e.target.value === '__add__') setAdding(true); else onChange(e.target.value); }}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
        <option value="__add__">+ Nieuwe optie toevoegen...</option>
      </select>
    </div>
  );
}
