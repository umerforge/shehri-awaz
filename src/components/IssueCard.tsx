import React, { useState } from 'react';
import { CivicIssue, IssueStatus } from '../types';
import { StatusStamp } from './StatusStamp';
import { 
  Trash2, 
  Droplet, 
  Car, 
  Zap, 
  HelpCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  Building2, 
  Users, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface IssueCardProps {
  issue: CivicIssue;
  similarCount?: number;
  onUpdateStatus?: (issueId: string, newStatus: IssueStatus) => void;
  isLoggedIn?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  similarCount = 1,
  onUpdateStatus,
  isLoggedIn = false,
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Category Icon & Color
  const getCategoryInfo = (cat: string) => {
    switch (cat) {
      case 'garbage':
        return {
          label: 'GARBAGE',
          urdu: 'کوڑا کرکٹ',
          icon: Trash2,
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'water':
        return {
          label: 'WATER & SEWAGE',
          urdu: 'پانی اور سیوریج',
          icon: Droplet,
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
        };
      case 'road':
        return {
          label: 'ROADS & POTHOLES',
          urdu: 'سڑک اور گڑھے',
          icon: Car,
          bg: 'bg-stone-200 text-stone-900 border-stone-400',
        };
      case 'electricity':
        return {
          label: 'ELECTRICITY',
          urdu: 'بجلی و تاریں',
          icon: Zap,
          bg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
        };
      default:
        return {
          label: 'OTHER CIVIC',
          urdu: 'دیگر مسئلہ',
          icon: HelpCircle,
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
        };
    }
  };

  const catInfo = getCategoryInfo(issue.category);
  const CategoryIcon = catInfo.icon;

  // Days open calculation
  const createdDate = new Date(issue.created_at);
  const diffDays = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
  const formattedDate = createdDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleStatusChange = async (newStatus: IssueStatus) => {
    if (!onUpdateStatus) return;
    setUpdating(true);
    await onUpdateStatus(issue.id, newStatus);
    setUpdating(false);
    setShowStatusModal(false);
  };

  return (
    <div 
      className="bg-white rounded-xl border border-stone-200 shadow-xs hover:shadow-md transition duration-200 overflow-hidden flex flex-col md:flex-row"
      id={`issue-card-${issue.id}`}
    >
      {/* Left / Top Photo Section */}
      <div className="md:w-64 lg:w-72 relative bg-stone-100 shrink-0 min-h-[190px] md:min-h-[220px] overflow-hidden">
        <img
          src={issue.image_url || 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=800&q=80'}
          alt={issue.summary}
          className="w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback photo if URL breaks
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* Severity Badge overlay */}
        <div className="absolute top-3 left-3">
          {issue.severity === 'urgent' && (
            <span className="bg-[#C0392B] text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-xs border border-red-800">
              URGENT SEVERITY
            </span>
          )}
          {issue.severity === 'high' && (
            <span className="bg-amber-600 text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
              HIGH PRIORITY
            </span>
          )}
          {issue.severity === 'medium' && (
            <span className="bg-stone-700 text-white text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
              MEDIUM
            </span>
          )}
        </div>

        {/* Days open counter badge */}
        <div className="absolute bottom-3 left-3 bg-stone-900/85 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-stone-700/50">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {issue.status === 'resolved' ? 'Resolved' : `${diffDays} days open`}
          </span>
        </div>
      </div>

      {/* Main Ledger Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Header Row: Category Badge & Location & Status Stamp */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-bold ${catInfo.bg}`}>
                <CategoryIcon className="w-3.5 h-3.5" />
                <span>{catInfo.label}</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                <MapPin className="w-3.5 h-3.5 text-[#0F3D2A]" />
                <span>{issue.city} • <strong className="text-stone-900">{issue.area_text}</strong></span>
              </div>
            </div>

            {/* Signature Status Stamp */}
            <StatusStamp status={issue.status} size="md" showSubtitle />
          </div>

          {/* Issue Summary Heading */}
          <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 leading-snug mb-2">
            {issue.summary}
          </h3>

          {/* Description */}
          {issue.description && (
            <p className="text-sm text-stone-600 leading-relaxed mb-3 line-clamp-2">
              {issue.description}
            </p>
          )}

          {/* Landmark if provided */}
          {issue.street_landmark && (
            <p className="text-xs text-stone-500 flex items-center gap-1 mb-3">
              <span className="font-semibold text-stone-700">Landmark:</span> {issue.street_landmark}
            </p>
          )}

          {/* Responsible Department Box */}
          <div className="bg-[#F3F5F2] border border-stone-300/80 rounded-lg p-3 flex items-start gap-2.5">
            <Building2 className="w-5 h-5 text-[#0F3D2A] shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Responsible Department (ذمہ دار محکمہ)
              </span>
              <span className="text-sm font-bold text-[#0F3D2A]">
                {issue.department}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Meta Row */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Reported: {formattedDate}
            </span>

            {similarCount > 1 && (
              <span className="flex items-center gap-1 font-semibold text-stone-800 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                {similarCount} similar reports in this area
              </span>
            )}
          </div>

          {/* Demo status toggle button */}
          <div className="relative">
            <button
              onClick={() => setShowStatusModal(!showStatusModal)}
              className="text-xs font-semibold text-stone-700 hover:text-[#0F3D2A] bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-md border border-stone-300 transition flex items-center gap-1"
              id={`btn-change-status-${issue.id}`}
            >
              <span>Update Status (Demo)</span>
              <ChevronRight className="w-3 h-3" />
            </button>

            {/* Quick status dropdown */}
            {showStatusModal && (
              <div className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-lg shadow-xl border border-stone-300 p-3 z-30 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                  <span className="font-bold text-stone-800 text-xs">Change Status (Demo Mode)</span>
                  <button 
                    onClick={() => setShowStatusModal(false)}
                    className="text-stone-400 hover:text-stone-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
                
                <p className="text-[10px] text-stone-500 mb-2 leading-tight">
                  Demo feature: In a real deployment, status updates would be restricted to authorized government/department accounts.
                </p>

                <div className="space-y-1.5">
                  {(['reported', 'in_review', 'resolved'] as IssueStatus[]).map((st) => (
                    <button
                      key={st}
                      disabled={updating || issue.status === st}
                      onClick={() => handleStatusChange(st)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-bold transition flex items-center justify-between ${
                        issue.status === st
                          ? 'bg-stone-100 text-stone-400 cursor-default'
                          : 'hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <span className="capitalize">{st.replace('_', ' ')}</span>
                      {issue.status === st && <span className="text-[10px] text-stone-400 font-normal">Current</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
