export type IssueCategory = 'garbage' | 'water' | 'road' | 'electricity' | 'other';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'urgent';
export type IssueStatus = 'reported' | 'in_review' | 'resolved';

export interface CivicIssue {
  id: string;
  user_id?: string;
  reporter_name?: string;
  image_url: string;
  category: IssueCategory;
  severity: IssueSeverity;
  department: string;
  summary: string;
  description?: string;
  city: string;
  area_text: string;
  street_landmark?: string;
  status: IssueStatus;
  created_at: string;
  resolved_at?: string;
  is_demo?: boolean;
}

export interface IssueCluster {
  id: string;
  city: string;
  area_text: string;
  category: IssueCategory;
  department: string;
  count: number;
  earliestDate: string;
  latestDate: string;
  currentStatus: IssueStatus;
  representativePhoto: string;
  issues: CivicIssue[];
  daysOpen: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  city: string;
  area: string;
  phone?: string;
  created_at?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  published_at?: string;
  city: string;
  source?: string;
  sourceName?: string;
  sourceUrl?: string;
  url?: string;
  urgency?: 'normal' | 'advisory' | 'important';
}

export interface CityOption {
  name: string;
  urduName: string;
  province: string;
  popularAreas: string[];
  departments: {
    garbage: string;
    water: string;
    electricity: string;
    road: string;
    other: string;
  };
}

export interface FilterState {
  category: IssueCategory | 'all';
  status: IssueStatus | 'all';
  searchQuery: string;
  city: string;
  area: string; // 'all' or specific area
}
