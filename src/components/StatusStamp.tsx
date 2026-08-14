import React from 'react';
import { IssueStatus } from '../types';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface StatusStampProps {
  status: IssueStatus;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const StatusStamp: React.FC<StatusStampProps> = ({
  status,
  size = 'md',
  showSubtitle = false,
}) => {
  let stampClass = 'stamp-reported';
  let label = 'REPORTED';
  let subtitle = 'Citizens have reported this problem';
  let Icon = AlertCircle;

  if (status === 'in_review') {
    stampClass = 'stamp-in-review';
    label = 'IN REVIEW';
    subtitle = 'The issue is being looked into';
    Icon = Clock;
  } else if (status === 'resolved') {
    stampClass = 'stamp-resolved';
    label = 'RESOLVED';
    subtitle = 'The issue has been marked as fixed';
    Icon = CheckCircle2;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 border',
    md: 'text-sm px-3 py-1 border-2',
    lg: 'text-base px-4 py-1.5 border-2',
  };

  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      <div className={`stamp-badge ${stampClass} ${sizeClasses[size]} select-none`} id={`status-stamp-${status}`}>
        <Icon className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
        <span>{label}</span>
      </div>
      {showSubtitle && (
        <span className="text-xs text-stone-600 font-medium italic mt-0.5 pl-0.5">
          {subtitle}
        </span>
      )}
    </div>
  );
};
