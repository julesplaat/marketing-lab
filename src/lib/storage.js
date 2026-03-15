import { SCHEMA_VERSION, STORAGE_KEY } from '../data/defaults';

const EMPTY_STATE = {
  schemaVersion: SCHEMA_VERSION,
  appMeta: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastExportAt: null,
    lastImportAt: null,
  },
  experiments: [],
  learnings: [],
  competitors: [],
  contentPlan: [],
  settings: {
    customOptions: {
      cta: [],
      creativeType: [],
      channel: [],
      testType: [],
      buyerRole: [],
      problemTag: [],
    },
  },
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.schemaVersion < SCHEMA_VERSION) {
      return migrateData(data);
    }
    return data;
  } catch (e) {
    console.error('Failed to load data:', e);
    return null;
  }
}

export function saveData(data) {
  try {
    const updated = {
      ...data,
      appMeta: { ...data.appMeta, updatedAt: new Date().toISOString() },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Failed to save data:', e);
    return false;
  }
}

export function clearData() { localStorage.removeItem(STORAGE_KEY); }

export function getEmptyState() { return JSON.parse(JSON.stringify(EMPTY_STATE)); }

export function exportData(data) {
  const payload = { ...data, appMeta: { ...data.appMeta, lastExportAt: new Date().toISOString() } };
  saveData(payload);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rinsego-lab-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return payload;
}

export function validateImport(data) {
  if (!data || typeof data !== 'object') return { valid: false, error: 'Ongeldig bestand.' };
  if (!Array.isArray(data.experiments)) return { valid: false, error: 'Geen experiments array.' };
  if (!Array.isArray(data.learnings)) return { valid: false, error: 'Geen learnings array.' };
  return { valid: true, stats: { experiments: data.experiments.length, learnings: data.learnings.length, schemaVersion: data.schemaVersion || 1 } };
}

function migrateData(data) {
  const migrated = { ...data };
  if (!migrated.competitors) migrated.competitors = [];
  if (!migrated.contentPlan) migrated.contentPlan = [];
  if (!migrated.settings) migrated.settings = {};
  if (!migrated.settings.customOptions) {
    migrated.settings.customOptions = { cta: [], creativeType: [], channel: [], testType: [], buyerRole: [], problemTag: [] };
  }
  migrated.schemaVersion = SCHEMA_VERSION;
  return migrated;
}
