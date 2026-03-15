export const SCHEMA_VERSION = 2;
export const STORAGE_KEY = 'rinsego_marketing_lab_v1';

export const STATUS_OPTIONS = [
  { value: 'idea', label: 'Idee', color: '#8b5cf6' },
  { value: 'live', label: 'Live', color: '#3b82f6' },
  { value: 'review', label: 'Review nodig', color: '#f59e0b' },
  { value: 'completed', label: 'Afgerond', color: '#10b981' },
  { value: 'archived', label: 'Gearchiveerd', color: '#94a3b8' },
];

export const FUNNEL_OPTIONS = ['TOFU', 'MOFU', 'BOFU'];

export const DEFAULT_CHANNEL_OPTIONS = [
  'Meta', 'Google Search', 'Google Display', 'LinkedIn organisch', 'LinkedIn paid',
  'Website', 'E-mail', 'Sales outreach', 'Overig',
];

export const CAMPAIGN_LEVEL_OPTIONS = [
  'Campagne', 'Ad set', 'Ad', 'Landingspagina', 'Asset', 'Contentpost', 'Anders',
];

export const DEFAULT_TEST_TYPE_OPTIONS = [
  'Hook', 'CTA', 'Visual', 'Format', 'Doelgroep', 'Buyer role',
  'Landingspagina', 'Aanbod', 'Copy angle', 'Bewijsvorm', 'Anders',
];

export const DEFAULT_BUYER_ROLE_OPTIONS = [
  'Facility', 'Workplace', 'Real Estate / Huisvesting', 'Procurement',
  'Duurzaamheid', 'FM partner', 'Catering partner', 'Operations',
  'Hospitality', 'Meerdere rollen',
];

export const DEFAULT_PROBLEM_TAG_OPTIONS = [
  'Werkdruk facilitair', 'Waterverbruik', 'Rommelige pantry',
  'Herbruikbaar werkt niet in praktijk', 'Gedrag & frictie', 'Hygiëneperceptie',
  'Procurement / risico', 'Pilot / bewijs', 'Duurzaamheid',
  'Kosten & beheer', 'Installatie & haalbaarheid', 'BYOC-routine', 'Anders',
];

export const DEFAULT_CTA_OPTIONS = [
  'Meer informatie', 'Bekijk hoe dit werkt', 'Ontdek hoe BYOC wél werkt',
  'Doe de quickscan', 'Ontvang advies', 'Plan demo', 'Vraag pilot aan',
  'Download checklist', 'Lees case', 'Anders',
];

export const DEFAULT_CREATIVE_TYPE_OPTIONS = [
  'Pratend persoon', 'Product demo', 'Voor/na vergelijking', 'Statisch beeld',
  'Carousel', 'Case / testimonial', 'Thought leadership post',
  'Checklist / guide', 'Anders',
];

export const DECISION_OPTIONS = [
  'Opschalen', 'Stoppen', 'Opnieuw testen', 'Doorvertalen naar website',
  'Doorvertalen naar LinkedIn', 'Doorvertalen naar Meta',
  'Doorvertalen naar Google Search', 'Doorvertalen naar salesmateriaal',
  'Bewaren als insight', 'Nog open',
];

export const WINNER_TYPE_OPTIONS = [
  'Overall winnaar', 'Beste CTR', 'Beste business-impact',
  'Beste leadkwaliteit', 'Geen duidelijke winnaar',
];

export const CONFIDENCE_OPTIONS = [
  { value: 'low', label: 'Laag' },
  { value: 'medium', label: 'Middel' },
  { value: 'high', label: 'Hoog' },
];

export const APPLY_TO_OPTIONS = [
  'Homepage', 'LinkedIn', 'Meta', 'Google Search', 'Google Display',
  'E-mail', 'Salesmateriaal', 'Pitch deck', 'Thought leadership',
];

export const TOFU_CTAS = [
  'Meer informatie', 'Bekijk hoe dit werkt', 'Ontdek hoe BYOC wél werkt',
  'Lees case', 'Download checklist',
];

export const BOFU_CTAS = [
  'Plan demo', 'Vraag pilot aan', 'Ontvang advies', 'Doe de quickscan',
];

export const CONTENT_STATUS_OPTIONS = [
  { value: 'idea', label: 'Idee' },
  { value: 'planned', label: 'Gepland' },
  { value: 'creating', label: 'In productie' },
  { value: 'review', label: 'Review' },
  { value: 'scheduled', label: 'Ingepland' },
  { value: 'published', label: 'Gepubliceerd' },
];

export const CONTENT_CHANNEL_OPTIONS = [
  'LinkedIn organisch', 'LinkedIn paid', 'Meta organisch', 'Meta paid',
  'Google Search', 'Google Display', 'Website/blog', 'E-mail', 'Sales materiaal',
];

// Helper to merge default + custom options
export function getOptions(defaults, customKey, settings) {
  const custom = settings?.customOptions?.[customKey] || [];
  const merged = [...defaults];
  custom.forEach((c) => { if (!merged.includes(c)) merged.push(c); });
  return merged;
}
