import React, { useState, useMemo } from 'react';
import { CivicIssue, IssueCategory, IssueStatus, IssueCluster, UserProfile } from '../types';
import { IssueCard } from '../components/IssueCard';
import { IssueClusterCard } from '../components/IssueClusterCard';
import { DashboardStats } from '../components/DashboardStats';
import { 
  Filter, 
  Layers, 
  MapPin, 
  Search, 
  PlusCircle, 
  Check, 
  SlidersHorizontal,
  Grid,
  ListFilter
} from 'lucide-react';

interface CivicIssuesProps {
  issues: CivicIssue[];
  selectedCity: string;
  selectedArea: string;
  onOpenLocationModal: () => void;
  onOpenReportModal: () => void;
  initialCategory?: string;
  onUpdateStatus?: (issueId: string, newStatus: IssueStatus) => void;
  user: UserProfile | null;
}

export const CivicIssues: React.FC<CivicIssuesProps> = ({
  issues,
  selectedCity,
  selectedArea,
  onOpenLocationModal,
  onOpenReportModal,
  initialCategory = 'all',
  onUpdateStatus,
  user,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'clustered' | 'individual'>('clustered');

  // Filter issues based on city, area, category, status, search
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // City check
      if (selectedCity && issue.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      // Area check
      if (selectedArea && selectedArea !== 'All Areas') {
        if (issue.area_text.toLowerCase() !== selectedArea.toLowerCase()) {
          return false;
        }
      }
      // Category check
      if (categoryFilter !== 'all' && issue.category !== categoryFilter) {
        return false;
      }
      // Status check
      if (statusFilter !== 'all' && issue.status !== statusFilter) {
        return false;
      }
      // Search check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSummary = issue.summary.toLowerCase().includes(q);
        const matchesDesc = issue.description?.toLowerCase().includes(q) || false;
        const matchesDept = issue.department.toLowerCase().includes(q);
        const matchesLandmark = issue.street_landmark?.toLowerCase().includes(q) || false;
        if (!matchesSummary && !matchesDesc && !matchesDept && !matchesLandmark) {
          return false;
        }
      }
      return true;
    });
  }, [issues, selectedCity, selectedArea, categoryFilter, statusFilter, searchQuery]);

  // Compute Clusters for Duplicate Detection (grouped by city + area + category)
  const clusters = useMemo(() => {
    const map = new Map<string, CivicIssue[]>();

    filteredIssues.forEach((issue) => {
      const key = `${issue.city}__${issue.area_text}__${issue.category}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(issue);
    });

    const result: { isCluster: boolean; cluster?: IssueCluster; issue?: CivicIssue }[] = [];

    map.forEach((items, key) => {
      if (items.length > 1 && viewMode === 'clustered') {
        // Build Cluster
        const dates = items.map((i) => new Date(i.created_at).getTime());
        const minDate = new Date(Math.min(...dates)).toISOString();
        const maxDate = new Date(Math.max(...dates)).toISOString();
        const daysOpen = Math.max(1, Math.floor((Date.now() - Math.min(...dates)) / (1000 * 60 * 60 * 24)));

        // Determine current overall status
        let currentStatus: IssueStatus = 'reported';
        if (items.every((i) => i.status === 'resolved')) {
          currentStatus = 'resolved';
        } else if (items.some((i) => i.status === 'in_review')) {
          currentStatus = 'in_review';
        }

        const clusterObj: IssueCluster = {
          id: `cluster-${key.replace(/[^a-zA-Z0-9]/g, '-')}`,
          category: items[0].category,
          area_text: items[0].area_text,
          city: items[0].city,
          count: items.length,
          daysOpen,
          department: items[0].department,
          currentStatus,
          earliestDate: minDate,
          latestDate: maxDate,
          representativePhoto: items[0].image_url,
          issues: items,
        };

        result.push({ isCluster: true, cluster: clusterObj });
      } else {
        // Individual issues
        items.forEach((single) => {
          result.push({ isCluster: false, issue: single });
        });
      }
    });

    return result;
  }, [filteredIssues, viewMode]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="civic-issues-page">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-stone-300 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F3D2A] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                Civic Ledger
              </span>
              <button
                onClick={onOpenLocationModal}
                className="flex items-center gap-1 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md border border-stone-200 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0F3D2A]" />
                <span>{selectedCity} • {selectedArea}</span>
                <span className="text-[10px] text-stone-500 ml-1">Change</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
              Public Civic Issues (عوامی مسائل)
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
              Transparent log of reported problems in {selectedCity}. Similar reports in the same neighborhood are clustered to highlight chronic civic needs.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0F3D2A] hover:bg-emerald-900 text-white font-bold text-sm shadow-xs transition self-start lg:self-center shrink-0 cursor-pointer"
            id="btn-issues-report-new"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Report a Problem</span>
          </button>

        </div>

        {/* Dashboard Stats */}
        <DashboardStats
          issues={filteredIssues}
          selectedCity={selectedCity}
          selectedArea={selectedArea}
        />

        {/* Filters and Controls */}
        <div className="pt-6 border-t border-stone-200 space-y-4">
          
          {/* Search bar & View Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues by keyword, department, or landmark..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 text-sm bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F3D2A]"
                id="input-filter-search"
              />
            </div>

            {/* View Mode Toggle: Clustered vs Individual */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-300 text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('clustered')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
                  viewMode === 'clustered'
                    ? 'bg-[#0F3D2A] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="Group similar duplicate reports together"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Grouped Clusters</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('individual')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
                  viewMode === 'individual'
                    ? 'bg-[#0F3D2A] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="Show all individual citizen cards"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>All Records</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-stone-600 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Category:
            </span>
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'garbage', label: 'Garbage & Waste' },
              { id: 'water', label: 'Water & Sewage' },
              { id: 'road', label: 'Roads & Potholes' },
              { id: 'electricity', label: 'Electricity' },
              { id: 'other', label: 'Other' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-md text-xs font-bold border transition ${
                  categoryFilter === cat.id
                    ? 'bg-[#0F3D2A] text-white border-[#0F3D2A]'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
                id={`filter-cat-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-stone-600 mr-1 flex items-center gap-1">
              <ListFilter className="w-3 h-3" />
              Status:
            </span>
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'reported', label: 'Reported' },
              { id: 'in_review', label: 'In Review' },
              { id: 'resolved', label: 'Resolved' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-md text-xs font-bold border transition ${
                  statusFilter === st.id
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
                id={`filter-status-${st.id}`}
              >
                {st.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Main Ledger Feed */}
      <div className="space-y-4" id="civic-issues-feed">
        {clusters.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                No matching civic issues found.
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                Try selecting "All Areas", clearing your search query, or submitting the first report for this location.
              </p>
            </div>
            <button
              onClick={onOpenReportModal}
              className="px-6 py-2.5 rounded-lg bg-[#0F3D2A] text-white text-xs font-bold hover:bg-emerald-900 transition"
            >
              Report a Problem in {selectedArea}
            </button>
          </div>
        ) : (
          clusters.map((item, idx) => {
            if (item.isCluster && item.cluster) {
              return (
                <IssueClusterCard
                  key={item.cluster.id}
                  cluster={item.cluster}
                  onUpdateStatus={onUpdateStatus}
                  isLoggedIn={Boolean(user)}
                />
              );
            } else if (item.issue) {
              return (
                <IssueCard
                  key={item.issue.id}
                  issue={item.issue}
                  onUpdateStatus={onUpdateStatus}
                  isLoggedIn={Boolean(user)}
                />
              );
            }
            return null;
          })
        )}
      </div>

    </div>
  );
};
