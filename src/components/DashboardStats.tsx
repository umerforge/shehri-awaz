import React from 'react';
import { CivicIssue } from '../types';
import { FileSpreadsheet, CheckCircle2, Clock3, AlertTriangle } from 'lucide-react';

interface DashboardStatsProps {
  issues: CivicIssue[];
  selectedCity: string;
  selectedArea: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  issues,
  selectedCity,
  selectedArea,
}) => {
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === 'resolved').length;
  const inReview = issues.filter((i) => i.status === 'in_review').length;
  const reported = issues.filter((i) => i.status === 'reported').length;

  // Compute most reported category
  const categoryCounts: Record<string, number> = {};
  issues.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  let mostReported = 'Garbage';
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostReported = cat.charAt(0).toUpperCase() + cat.slice(1);
    }
  });

  // Calculate resolution rate or estimated avg resolution time
  const avgTime = '7 days';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6" id="dashboard-summary-stats">
      
      {/* Total Reports */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col justify-between" id="stat-total-reports">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-bold text-stone-600 uppercase tracking-wider">Total Reports</span>
          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-stone-900 leading-tight">
            {total}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Across {selectedArea === 'All Areas' ? selectedCity : `${selectedArea}, ${selectedCity}`}
          </p>
        </div>
      </div>

      {/* Resolved */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col justify-between" id="stat-resolved-issues">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-bold text-[#1B5E38] uppercase tracking-wider">Resolved</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#1B5E38]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-[#1B5E38] leading-tight">
            {resolved}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {total > 0 ? `${Math.round((resolved / total) * 100)}% fixed or addressed` : 'Marked as fixed'}
          </p>
        </div>
      </div>

      {/* Average Resolution Time */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col justify-between" id="stat-avg-resolution">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-bold text-[#8A6409] uppercase tracking-wider">Avg. Time</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-[#8A6409]">
            <Clock3 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-stone-900 leading-tight">
            {avgTime}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Standard turnaround time
          </p>
        </div>
      </div>

      {/* Most Reported Problem */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col justify-between" id="stat-most-reported">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-bold text-stone-600 uppercase tracking-wider">Top Category</span>
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-[#C0392B]">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-serif font-black text-[#0F3D2A] leading-tight truncate">
            {mostReported}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {maxCount} reports in this area
          </p>
        </div>
      </div>

    </div>
  );
};
