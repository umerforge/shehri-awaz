import { IssueSeverity, IssueCategory } from '../types';

export interface SeverityGuideline {
  level: IssueSeverity;
  label: string;
  labelUrdu: string;
  color: string;
  icon: string;
  description: string;
  responseTime: string;
  examples: Record<IssueCategory, string[]>;
}

export const SEVERITY_GUIDELINES: SeverityGuideline[] = [
  {
    level: 'low',
    label: 'Low Priority',
    labelUrdu: 'کم ترجیح',
    color: 'blue',
    icon: 'Info',
    description: 'Non-urgent civic maintenance issues that affect quality of life but do not pose safety risks. Can be scheduled for routine municipal attention.',
    responseTime: '7–30 days',
    examples: {
      garbage: [
        'Overflowing community bins on scheduled collection day',
        'Missed single household waste pickup',
        'Fallen leaves or garden waste blocking a drain',
      ],
      water: [
        'Low water pressure in upper floors during peak hours',
        'Minor leaky tap at a public facility',
        'Discolored water that remains safe but unappealing',
      ],
      road: [
        'Minor surface cracks without pothole formation',
        'Faded road markings at low-traffic intersections',
        'Damaged pavement tiles in a pedestrian walkway',
      ],
      electricity: [
        'Flickering streetlight in a low-traffic area',
        'Damaged but non-hazardous utility pole',
        'Scheduled maintenance notification from the DISCO',
      ],
      other: [
        'Overgrown public park vegetation blocking signage',
        'Damaged but stable public bench',
        'Non-functional public water fountain',
      ],
    },
  },
  {
    level: 'medium',
    label: 'Medium Priority',
    labelUrdu: 'درمیانی ترجیح',
    color: 'yellow',
    icon: 'AlertTriangle',
    description: 'Issues affecting daily life, local business, or community access. Should be addressed within 1–2 weeks by the responsible department.',
    responseTime: '3–14 days',
    examples: {
      garbage: [
        'Uncollected waste for more than 3 days in a residential area',
        'Open dumping spot attracting stray animals',
        'Overflowing commercial waste container on a main road',
      ],
      water: [
        'Intermittent water supply disruptions affecting multiple houses',
        'Slow-draining sewer line causing street puddling',
        'Contaminated taste or odor in household water supply',
      ],
      road: [
        'Visible pothole on a secondary residential street',
        'Damaged speed bump causing vehicle damage',
        'Broken pedestrian crossing markings at a school zone',
      ],
      electricity: [
        'Frequent brief power outages (load shedding beyond schedule)',
        'Non-functional streetlight at a busy intersection',
        'Exposed low-voltage wiring near a public area',
      ],
      other: [
        'Damaged public playground equipment',
        'Blocked stormwater drain causing localized flooding',
        'Graffiti or vandalism on public property',
      ],
    },
  },
  {
    level: 'high',
    label: 'High Priority',
    labelUrdu: 'زیادہ ترجیح',
    color: 'orange',
    icon: 'AlertCircle',
    description: 'Serious civic problems posing safety hazards or significantly disrupting public services. Requires urgent department attention within days.',
    responseTime: '1–7 days',
    examples: {
      garbage: [
        'Medical or hazardous waste mixed with regular garbage',
        'Large-scale illegal dumping in a residential neighborhood',
        'Blocked drainage from accumulated waste causing flooding',
      ],
      water: [
        'Burst water main causing road flooding and water loss',
        'Sewer overflow into residential properties',
        'No water supply for 48+ hours to a full neighborhood',
      ],
      road: [
        'Deep pothole on a main road causing vehicle damage',
        'Collapsed section of pavement or sidewalk',
        'Damaged guardrail on a busy road section',
      ],
      electricity: [
        'Spark or burn marks on a public utility pole',
        'Prolonged unplanned outage affecting hospitals or schools',
        'Downed power lines across a public thoroughfare',
      ],
      other: [
        'Structural damage to a public bridge or overpass',
        'Contaminated public water source',
        'Encroachment blocking emergency vehicle access',
      ],
    },
  },
  {
    level: 'urgent',
    label: 'Urgent / Emergency',
    labelUrdu: 'انتہائی ضروری',
    color: 'red',
    icon: 'Siren',
    description: 'Immediate safety threat to life, health, or critical infrastructure. Requires emergency response — call 1122 (Rescue) or 15 (Police) immediately.',
    responseTime: 'Immediate',
    examples: {
      garbage: [
        'Hazardous chemical or medical waste dumped near a school',
        'Large fire risk from waste accumulation in a populated area',
        'Contaminated water source from garbage leaching',
      ],
      water: [
        'Major pipe burst causing road collapse or flooding',
        'Sewage flood entering homes or a hospital',
        'Confirmed waterborne disease outbreak linked to supply',
      ],
      road: [
        'Collapsed road section or sinkhole',
        'Bridge structural failure or partial collapse',
        'Road obstruction preventing emergency vehicle access',
      ],
      electricity: [
        'Live downed power line in a public area — do NOT touch',
        'Electrical fire at a utility installation',
        'Transformer explosion or fire risk',
      ],
      other: [
        'Building structural failure threatening public safety',
        'Gas leak near public infrastructure',
        'Flooded underpass with trapped vehicles',
      ],
    },
  },
];

export function getSeverityGuideline(severity: IssueSeverity): SeverityGuideline | undefined {
  return SEVERITY_GUIDELINES.find((s) => s.level === severity);
}

export function getExamplesForSeverity(severity: IssueSeverity, category: IssueCategory): string[] {
  const guideline = getSeverityGuideline(severity);
  return guideline?.examples[category] ?? [];
}

export function getSeverityColor(level: IssueSeverity): string {
  const colors: Record<IssueSeverity, string> = {
    low: '#3b82f6',
    medium: '#eab308',
    high: '#f97316',
    urgent: '#ef4444',
  };
  return colors[level];
}
