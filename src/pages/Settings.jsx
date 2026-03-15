import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, Card, ConfirmDialog, FormField, Input } from '../components/Shared';
import { SCHEMA_VERSION, DEFAULT_CTA_OPTIONS, DEFAULT_CREATIVE_TYPE_OPTIONS, DEFAULT_CHANNEL_OPTIONS, DEFAULT_TEST_TYPE_OPTIONS, DEFAULT_BUYER_ROLE_OPTIONS, DEFAULT_PROBLEM_TAG_OPTIONS } from '../data/defaults';
import { exportData, validateImport, clearData, getEmptyState } from '../lib/storage';
import { formatDate } from '../lib/helpers';
import { Download, Upload, Trash2, Database, RefreshCw, Info, Plus, X } from 'lucide-react';

const CUSTOM_OPTION_GROUPS = [
  { key: 'cta', label: 'CTA opties', defaults: DEFAULT_CTA_OPTIONS },
  { key: 'creativeType', label: 'Creative types', defaults: DEFAULT_CREATIVE_TYPE_OPTIONS },
  { key: 'channel', label: 'Kanalen', defaults: DEFAULT_CHANNEL_OPTIONS },
  { key: 'testType', label: 'Testtypes', defaults: DEFAULT_TEST_TYPE_OPTIONS },
  { key: 'buyerRole', label: 'Buyer roles', defaults: DEFAULT_BUYER_ROLE_OPTIONS },
  { key: 'problemTag', label: 'Kernproblemen', defaults: DEFAULT_PROBLEM_TAG_OPTIONS },
];

export default function Settings() {
  const { state, setData, updateMeta, updateSettings } = useApp();
  const fileRef = useRef(null);
  const [result, setResult] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);
  const [newOption, setNewOption] = useState({});

  const handleExport = () => { exportData(state); updateMeta({ lastExportAt: new Date().toISOString() }); setResult({ type: 'success', message: 'Back-up gedownload.' }); };

  const handleFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const v = validateImport(data);
        if (!v.valid) { setResult({ type: 'error', message: v.error }); return; }
        setPendingImport(data);
        setResult({ type: 'info', message: `${v.stats.experiments} experimenten, ${v.stats.learnings} learnings.` });
        setShowImport(true);
      } catch { setResult({ type: 'error', message: 'Ongeldig JSON.' }); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  const confirmImport = () => {
    if (pendingImport) {
      setData({ ...pendingImport, appMeta: { ...pendingImport.appMeta, lastImportAt: new Date().toISOString() } });
      setResult({ type: 'success', message: 'Data geïmporteerd!' });
    }
    setShowImport(false); setPendingImport(null);
  };

  const handleReset = () => { clearData(); setData(getEmptyState()); setShowReset(false); setResult({ type: 'success', message: 'Alle data gewist.' }); };

  const addCustom = (key) => {
    const val = newOption[key]?.trim(); if (!val) return;
    const custom = { ...(state.settings?.customOptions || {}) };
    if (!custom[key]) custom[key] = [];
    if (!custom[key].includes(val)) { custom[key] = [...custom[key], val]; updateSettings({ customOptions: custom }); }
    setNewOption((p) => ({ ...p, [key]: '' }));
  };

  const removeCustom = (key, val) => {
    const custom = { ...(state.settings?.customOptions || {}) };
    custom[key] = (custom[key] || []).filter((v) => v !== val);
    updateSettings({ customOptions: custom });
  };

  return (
    <div className="page">
      <PageHeader title="Instellingen" subtitle="Back-up, opties en databeheer" />

      {result && <div className={`toast toast-${result.type}`}>{result.message}<button className="toast-close" onClick={() => setResult(null)}>×</button></div>}

      {/* Custom options */}
      <Card className="form-section" style={{ marginBottom: '24px' }}>
        <h3 className="card-title">Aanpasbare opties</h3>
        <p className="text-muted" style={{ marginBottom: '16px' }}>Voeg eigen opties toe aan de dropdowns in het experiment-formulier. Je kunt ze ook direct in het formulier toevoegen.</p>
        <div className="custom-options-grid">
          {CUSTOM_OPTION_GROUPS.map(({ key, label, defaults }) => {
            const custom = state.settings?.customOptions?.[key] || [];
            return (
              <div key={key} className="custom-option-group">
                <h4 className="custom-option-label">{label}</h4>
                <div className="custom-option-tags">
                  {defaults.map((d) => <span key={d} className="custom-tag default">{d}</span>)}
                  {custom.map((c) => (
                    <span key={c} className="custom-tag custom">
                      {c} <button onClick={() => removeCustom(key, c)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="custom-option-add">
                  <input className="form-input form-input-sm" value={newOption[key] || ''} onChange={(e) => setNewOption((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder="Nieuwe optie..." onKeyDown={(e) => { if (e.key === 'Enter') addCustom(key); }} />
                  <button className="btn btn-sm btn-outline" onClick={() => addCustom(key)}><Plus size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="settings-grid">
        <Card className="settings-card">
          <div className="settings-icon"><Database size={24} /></div>
          <h3>Data-overzicht</h3>
          <div className="settings-info">
            <div className="info-row"><span>Schema</span><span className="info-value">v{SCHEMA_VERSION}</span></div>
            <div className="info-row"><span>Experimenten</span><span className="info-value">{state.experiments.length}</span></div>
            <div className="info-row"><span>Learnings</span><span className="info-value">{state.learnings.length}</span></div>
            <div className="info-row"><span>Content items</span><span className="info-value">{(state.contentPlan || []).length}</span></div>
            <div className="info-row"><span>Competitor notities</span><span className="info-value">{(state.competitors || []).length}</span></div>
            <div className="info-row"><span>Laatste export</span><span className="info-value">{formatDate(state.appMeta?.lastExportAt)}</span></div>
          </div>
        </Card>

        <Card className="settings-card">
          <div className="settings-icon"><Download size={24} /></div>
          <h3>Exporteer back-up</h3>
          <p className="settings-desc">Download al je data als JSON.</p>
          <button className="btn btn-primary" onClick={handleExport}><Download size={16} /> Download back-up</button>
        </Card>

        <Card className="settings-card">
          <div className="settings-icon"><Upload size={24} /></div>
          <h3>Importeer back-up</h3>
          <p className="settings-desc">Laad een eerder geëxporteerd bestand. Vervangt alle data.</p>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFile} />
          <button className="btn btn-outline" onClick={() => fileRef.current?.click()}><Upload size={16} /> Selecteer bestand</button>
        </Card>

        <Card className="settings-card settings-danger">
          <div className="settings-icon"><Trash2 size={24} /></div>
          <h3>Reset alle data</h3>
          <p className="settings-desc">Wis alles. Maak eerst een back-up.</p>
          <button className="btn btn-danger" onClick={() => setShowReset(true)}><Trash2 size={16} /> Wis alles</button>
        </Card>
      </div>

      <ConfirmDialog open={showImport} onClose={() => { setShowImport(false); setPendingImport(null); }} onConfirm={confirmImport} title="Importeren" message="Dit vervangt alle data. Zeker weten?" confirmLabel="Importeer" />
      <ConfirmDialog open={showReset} onClose={() => setShowReset(false)} onConfirm={handleReset} title="Alles wissen" message="Dit kan niet ongedaan worden." confirmLabel="Wis alles" danger />
    </div>
  );
}
