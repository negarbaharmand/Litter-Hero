import type { Report } from '../api';

export type ReportStatus = Report['status'];
export type ReportStatusFilter = 'all' | ReportStatus;

type StatusPresentation = {
  label: string;
  className: string;
};

const STATUS_PRESENTATION: Record<ReportStatus, StatusPresentation> = {
  open: {
    label: 'Open',
    className: 'bg-emerald-100 text-emerald-800',
  },
  cleanup_pending_vote: {
    label: 'Needs votes',
    className: 'bg-amber-100 text-amber-800',
  },
  cleaned: {
    label: 'Cleaned',
    className: 'bg-sky-100 text-sky-800',
  },
  pending: {
    label: 'Pending',
    className: 'bg-slate-100 text-slate-800',
  },
  verified: {
    label: 'Verified',
    className: 'bg-indigo-100 text-indigo-800',
  },
  disputed: {
    label: 'Disputed',
    className: 'bg-rose-100 text-rose-800',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800',
  },
};

export const STATUS_FILTER_OPTIONS: Array<{ value: ReportStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'cleanup_pending_vote', label: 'Needs votes' },
  { value: 'cleaned', label: 'Cleaned' },
];

export function getStatusPresentation(status: ReportStatus): StatusPresentation {
  return STATUS_PRESENTATION[status];
}
