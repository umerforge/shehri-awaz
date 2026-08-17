import { IssueCategory } from '../types';

export interface CivicCategory {
  id: IssueCategory;
  label: string;
  labelUrdu: string;
  description: string;
  icon: string;
  color: string;
  exampleIssues: string[];
}

export const CIVIC_CATEGORIES: CivicCategory[] = [
  {
    id: 'garbage',
    label: 'Waste & Sanitation',
    labelUrdu: 'کوڑا و صفائی',
    description: 'Uncollected garbage, open dumping, overflowing bins, blocked drains from waste, hazardous waste in public areas, and general sanitation concerns.',
    icon: 'Trash2',
    color: '#84cc16',
    exampleIssues: [
      'Garbage not collected for several days',
      'Open illegal dumping site in the neighborhood',
      'Overflowing community waste bins attracting stray animals',
      'Medical or hazardous waste in public areas',
      'Blocked stormwater drain from accumulated waste',
    ],
  },
  {
    id: 'water',
    label: 'Water & Sewerage',
    labelUrdu: 'پانی و نکاسی آب',
    description: 'Water supply disruptions, sewage overflow, burst pipes, drainage flooding, contaminated water, and sewerage infrastructure failures.',
    icon: 'Droplets',
    color: '#0ea5e9',
    exampleIssues: [
      'No water supply to the neighborhood for 24+ hours',
      'Sewerage overflow flooding the street',
      'Burst water main wasting treated water',
      'Contaminated or discolored tap water',
      'Poorly maintained nullah causing urban flooding',
    ],
  },
  {
    id: 'road',
    label: 'Roads & Infrastructure',
    labelUrdu: 'سڑکیں و زیر بنیاد',
    description: 'Potholes, road damage, broken guardrails, damaged footpaths, failed traffic signals, collapsed road sections, and bridge maintenance issues.',
    icon: 'Construction',
    color: '#f59e0b',
    exampleIssues: [
      'Deep pothole damaging vehicles on a main road',
      'Broken guardrail on a busy highway section',
      'Collapsed section of footpath or pavement',
      'Non-functional traffic signal at a busy intersection',
      'Bridge showing signs of structural deterioration',
    ],
  },
  {
    id: 'electricity',
    label: 'Power Supply',
    labelUrdu: 'بجلی کی فراہمی',
    description: 'Power outages, load shedding beyond schedule, exposed wiring, damaged utility poles, transformer fires, and streetlight failures.',
    icon: 'Zap',
    color: '#f97316',
    exampleIssues: [
      'Prolonged unscheduled power outage',
      'Exposed live wires in a public area',
      'Damaged or leaning utility pole',
      'Non-functional streetlight at a busy road',
      'Transformer fire or burn marks',
    ],
  },
  {
    id: 'other',
    label: 'Other Civic Services',
    labelUrdu: 'دیگر خدمات',
    description: 'Park maintenance, public facility damage, encroachment on public land, traffic management issues, and other municipal concerns.',
    icon: 'Building2',
    color: '#8b5cf6',
    exampleIssues: [
      'Damaged playground equipment in a public park',
      'Encroachment blocking a public pathway',
      'Non-functional public water fountain',
      'Unauthorized construction in a green belt',
      'Missing or damaged road signage',
    ],
  },
];

export function getCategoryById(id: IssueCategory): CivicCategory | undefined {
  return CIVIC_CATEGORIES.find((c) => c.id === id);
}

export function getCategoryLabel(id: IssueCategory): string {
  return getCategoryById(id)?.label ?? id;
}

export function getCategoryLabelUrdu(id: IssueCategory): string {
  return getCategoryById(id)?.labelUrdu ?? id;
}

export function getCategoryColor(id: IssueCategory): string {
  return getCategoryById(id)?.color ?? '#6b7280';
}
