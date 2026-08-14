import React, { useState } from 'react';
import { IssueCluster, IssueStatus } from '../types';
import { StatusStamp } from './StatusStamp';
import { IssueCard } from './IssueCard';
import { 
  Users, 
  Clock, 
  Building2, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  AlertCircle,
  Calendar
} from 'lucide-react';

interface IssueClusterCardProps {
  cluster: IssueCluster;
  onUpdateStatus?: (issueId: string, newStatus: IssueStatus) => void;
  isLoggedIn?: boolean;
}

export const IssueClusterCard: React.FC<IssueClusterCardProps> = ({
  cluster,
  onUpdateStatus,
  isLoggedIn = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'garbage':
        return 'Garbage & Waste Reports';
      case 'water':
        return 'Water Supply & Sewerage Reports';
      case 'road':
        return 'Road & Pothole Damage Reports';
      case 'electricity':
        return 'Electrical & Utility Wire Reports';
      default:
        return 'Civic Reports';
    }
  };

  const earliestFormatted = new Date(cluster.earliestDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  const latestFormatted = new Date(cluster.latestDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div 
      className="bg-white rounded-xl border-2 border-stone-300/90 shadow-sm overflow-hidden transition"
      id={`issue-cluster-${cluster.id}`}
    >
      {/* Top Banner Cluster Bar */}
      <div className="bg-amber-50/70 border-b border-amber-200/80 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <Layers className="w-4 h-4 text-amber-700" />
          <span>Similar Civic Problem Cluster (عوامی مسائل کلسٹر)</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-600 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          <span>Active between {earliestFormatted} – {latestFormatted}</span>
        </div>
      </div>

      {/* Main Cluster Overview Box */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          
          {/* Representative Photo */}
          <div className="w-full lg:w-48 h-36 relative bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200">
            <img
              src={cluster.representativePhoto}
              alt={cluster.category}
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute top-2 left-2 bg-[#0F3D2A] text-white text-xs font-black px-2 py-0.5 rounded shadow-xs">
              {cluster.count} Photos
            </div>
          </div>

          {/* Details & Department */}
          <div className="flex-1 space-y-3">
            
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    {cluster.count} Citizen Reports
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-stone-700">
                    <MapPin className="w-3.5 h-3.5 text-[#0F3D2A]" />
                    <span>{cluster.area_text}, {cluster.city}</span>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
                  {cluster.count} {getCategoryTitle(cluster.category)}
                </h2>
              </div>

              <StatusStamp status={cluster.currentStatus} size="md" showSubtitle />
            </div>

            {/* Inactive or Open Notice */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
              <span className="flex items-center gap-1 font-semibold text-stone-800">
                <Users className="w-4 h-4 text-stone-600" />
                Reported by {cluster.count} citizens in {cluster.area_text}
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Open for {cluster.daysOpen} days
              </span>
            </div>

            {/* Department Box */}
            <div className="bg-[#F3F5F2] border border-stone-300 rounded-lg p-3 flex items-start gap-2.5">
              <Building2 className="w-5 h-5 text-[#0F3D2A] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Responsible Department (ذمہ دار ادارہ)
                </span>
                <span className="text-sm font-bold text-[#0F3D2A]">
                  {cluster.department}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Action Toggle to View all individual citizen reports */}
        <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-between">
          <p className="text-xs text-stone-500">
            {isExpanded ? 'Showing individual citizen submissions:' : `Multiple citizens reported the same ${cluster.category} issue at this location.`}
          </p>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-[#0F3D2A] text-white hover:bg-emerald-900 transition shadow-xs cursor-pointer"
            id={`btn-toggle-cluster-${cluster.id}`}
          >
            <span>{isExpanded ? 'Hide Individual Reports' : `View all ${cluster.count} reports`}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Individual Reports */}
        {isExpanded && (
          <div className="mt-5 space-y-4 pt-4 border-t border-dashed border-stone-300 animate-in fade-in duration-150">
            <h4 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
              Individual Submissions in this cluster:
            </h4>
            <div className="space-y-3">
              {cluster.issues.map((iss) => (
                <IssueCard
                  key={iss.id}
                  issue={iss}
                  similarCount={cluster.count}
                  onUpdateStatus={onUpdateStatus}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
