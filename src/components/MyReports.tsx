import React from 'react';
import { CivicIssue, IssueStatus, UserProfile } from '../types';
import { IssueCard } from './IssueCard';
import { FileText, PlusCircle, User, LogIn, MapPin } from 'lucide-react';

interface MyReportsProps {
  issues: CivicIssue[];
  user: UserProfile | null;
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
  onUpdateStatus?: (issueId: string, newStatus: IssueStatus) => void;
}

export const MyReports: React.FC<MyReportsProps> = ({
  issues,
  user,
  onOpenReportModal,
  onOpenAuthModal,
  onUpdateStatus,
}) => {
  // If user is logged in, filter by user_id or reporter_name; otherwise show demo user's reports
  const userIssues = issues.filter((iss) => {
    if (user) {
      return iss.user_id === user.id || iss.reporter_name === user.full_name;
    }
    return iss.is_demo; // show sample reports if not logged in
  });

  return (
    <div className="max-w-5xl mx-auto my-8 px-4" id="my-reports-view">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-300 p-6 sm:p-8 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F3D2A] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Citizen Activity Tracker
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
            My Reports (میری درج کردہ رپورٹیں)
          </h1>
          <p className="text-sm text-stone-600 max-w-xl mt-1">
            Track all civic issues you have reported, monitor department actions, and verify status updates.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0F3D2A] hover:bg-emerald-900 text-white text-sm font-bold shadow-xs transition cursor-pointer self-start md:self-center"
          id="btn-my-reports-new"
        >
          <PlusCircle className="w-4 h-4 text-amber-300" />
          <span>Report a Problem</span>
        </button>
      </div>

      {/* Guest Notice if not logged in */}
      {!user && (
        <div className="bg-stone-50 border border-stone-300 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-800">You are browsing in guest mode</p>
              <p className="text-xs text-stone-500">Sign in to automatically sync your reports across all devices.</p>
            </div>
          </div>
          <button
            onClick={onOpenAuthModal}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[#0F3D2A] text-white hover:bg-emerald-900 transition flex items-center gap-1.5 self-start sm:self-auto"
            id="btn-login-from-my-reports"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login / Sign Up</span>
          </button>
        </div>
      )}

      {/* Issues List or Empty State */}
      {userIssues.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              You haven't reported a problem yet.
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
              Notice overflowing garbage, broken water pipes, or damaged roads in your area? Submit a report with a photo.
            </p>
          </div>
          <button
            onClick={onOpenReportModal}
            className="px-6 py-3 rounded-xl bg-[#0F3D2A] text-white font-bold text-sm hover:bg-emerald-900 transition inline-flex items-center gap-2 shadow-xs"
            id="btn-empty-state-report"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report a Problem Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold px-1">
            <span>Showing {userIssues.length} submitted report{userIssues.length === 1 ? '' : 's'}</span>
          </div>

          <div className="space-y-4">
            {userIssues.map((iss) => (
              <IssueCard
                key={iss.id}
                issue={iss}
                onUpdateStatus={onUpdateStatus}
                isLoggedIn={Boolean(user)}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
