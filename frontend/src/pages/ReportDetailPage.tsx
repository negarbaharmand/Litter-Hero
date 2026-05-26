import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCleanupSubmission,
  fetchReportById,
  uploadReportImage,
  type ReportDetails,
} from '../api';
import { useAuthGate } from '../hooks/useAuthGate';
import { AuthGateModal } from '../components/AuthGateModal';
import { useAuth } from '../hooks/useAuth';
import { CleanupSubmissionCard } from '../components/CleanupSubmissionCard';
import { ReportVerificationCard } from '../components/ReportVerificationCard';

function formatStatus(status: ReportDetails['status']) {
  switch (status) {
    case 'open':
      return 'Open';
    case 'cleanup_pending_vote':
      return 'Cleanup pending vote';
    case 'cleaned':
      return 'Cleaned';
    case 'verified':
      return 'Verified';
    case 'rejected':
      return 'Rejected';
    case 'disputed':
      return 'Disputed';
    case 'pending':
      return 'Pending';
    default:
      return status;
  }
}

export function ReportDetailPage() {
  const { id } = useParams();
  const reportId = Number(id);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const { gate, dismiss, requireAuth } = useAuthGate();

  const {
    data: report,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => fetchReportById(reportId),
    enabled: Number.isInteger(reportId) && reportId > 0,
  });

  const submitCleanupMutation = useMutation({
    mutationFn: async () => {
      if (!proofFile) throw new Error('Please upload a cleanup photo.');
      const { imageUrl } = await uploadReportImage(proofFile);
      return createCleanupSubmission(reportId, {
        imageUrl,
        note: note.trim() || undefined,
      });
    },
    onSuccess: () => {
      setSubmitSuccess('Cleanup proof submitted and is now waiting for community votes.');
      setFormError(null);
      setNote('');
      setProofFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      refreshUser();
    },
    onError: (err) => {
      setSubmitSuccess(null);
      setFormError(err instanceof Error ? err.message : 'Failed to submit cleanup proof.');
    },
  });

  const canSubmitCleanup = useMemo(() => {
    if (!report) return false;
    return report.status !== 'cleaned' && report.status !== 'rejected';
  }, [report]);

  function handleSubmitCleanup() {
    setFormError(null);
    setSubmitSuccess(null);
    requireAuth('Create an account to submit cleanup proof', () => {
      if (!proofFile) {
        setFormError('Please upload a cleanup photo first.');
        return;
      }
      submitCleanupMutation.mutate();
    });
  }

  if (!Number.isInteger(reportId) || reportId < 1) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-page-bg)' }}>
        <p style={{ color: 'var(--color-danger)' }}>Invalid report id.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-page-bg)' }}>
        <p style={{ color: 'var(--color-text-body)' }}>Loading report...</p>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-page-bg)' }}>
        <p style={{ color: 'var(--color-danger)' }}>{(error as Error)?.message ?? 'Failed to load report.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: 'var(--color-page-bg)' }}>
      <div className="mx-auto w-full max-w-3xl px-4 pt-6">
        <Link
          to="/reports"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--color-green-dark)' }}
        >
          ← Back to reports
        </Link>

        <h1 className="mt-3 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Report #{report.id}
        </h1>
        <p
          className="mt-2 inline-flex rounded-full px-3 py-1 text-sm"
          style={{ backgroundColor: 'var(--color-green-normal)', color: '#ffffff' }}
        >
          {formatStatus(report.status)}
        </p>

        <div
          className="mt-4 overflow-hidden rounded-2xl shadow-sm"
          style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          {report.imageUrl && (
            <img src={report.imageUrl} alt="Reported trash spot" className="h-64 w-full object-cover" />
          )}
          <div className="p-4">
            <p className="text-lg font-semibold" style={{ color: 'var(--color-text-body)' }}>
              {report.description?.trim() || 'No description'}
            </p>
            <p className="mt-3" style={{ color: 'var(--color-text-body)' }}>
              <span className="font-semibold">Location:</span> {report.location}
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Size: {report.size ?? 'Unknown'}
            </p>
          </div>
        </div>

        {report.status === 'pending' && report.verificationVoteSummary && (
          <div className="mt-6">
            <ReportVerificationCard
              reportId={report.id}
              reportOwnerUserId={report.userId}
              voteSummary={report.verificationVoteSummary}
              requireAuth={requireAuth}
            />
          </div>
        )}

        {(report.cleanupSubmissions ?? []).length > 0 && (
          <div
            className="mt-6 rounded-2xl p-4 shadow-sm"
            style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-body)' }}>
              Cleanup verification
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Vote on cleanup proof submissions. Three votes with a majority decide the outcome.
            </p>
            <div className="mt-4 space-y-4">
              {[...(report.cleanupSubmissions ?? [])]
                .sort((a, b) => {
                  if (a.status === 'pending' && b.status !== 'pending') return -1;
                  if (b.status === 'pending' && a.status !== 'pending') return 1;
                  return b.id - a.id;
                })
                .map((submission) => (
                <CleanupSubmissionCard
                  key={submission.id}
                  reportId={report.id}
                  reportOwnerUserId={report.userId}
                  submission={submission}
                  requireAuth={requireAuth}
                />
              ))}
            </div>
          </div>
        )}

        <div
          className="mt-6 rounded-2xl p-4 shadow-sm"
          style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-body)' }}>
            Submit cleanup proof
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Upload a current photo from the cleaned spot so the community can verify it.
          </p>

          <div
            className="mt-4 rounded-xl border-2 border-dashed p-4"
            style={{ borderColor: 'var(--color-green-dark)', backgroundColor: 'var(--color-page-bg)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Cleanup proof photo (required)
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Take a clear after-photo of the cleaned spot.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canSubmitCleanup || submitCleanupMutation.isPending}
              className="mt-3 rounded-lg px-3 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-green-dark)' }}
            >
              {proofFile ? 'Change photo' : 'Upload cleanup photo'}
            </button>
            {proofFile && (
              <p className="mt-2 text-sm" style={{ color: 'var(--color-text-body)' }}>
                Selected file: <span className="font-medium">{proofFile.name}</span>
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
              disabled={!canSubmitCleanup || submitCleanupMutation.isPending}
              className="sr-only"
            />
          </div>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note about what was cleaned"
            rows={3}
            disabled={!canSubmitCleanup || submitCleanupMutation.isPending}
            className="mt-3 w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-page-bg)',
              color: 'var(--color-text-body)',
            }}
          />

          {formError && (
            <p className="mt-3 text-sm" style={{ color: 'var(--color-danger)' }}>{formError}</p>
          )}
          {submitSuccess && (
            <p className="mt-3 text-sm" style={{ color: 'var(--color-green-dark)' }}>{submitSuccess}</p>
          )}

          <button
            type="button"
            onClick={handleSubmitCleanup}
            disabled={!canSubmitCleanup || submitCleanupMutation.isPending}
            className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-green-dark)' }}
          >
            {submitCleanupMutation.isPending ? 'Submitting...' : 'Submit cleanup'}
          </button>

          {!canSubmitCleanup && (
            <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {report.status === 'rejected'
                ? 'This report was rejected and does not accept cleanup submissions.'
                : 'This report is already cleaned and no longer accepts cleanup submissions.'}
            </p>
          )}
        </div>
      </div>

      <AuthGateModal open={gate.open} message={gate.message} onDismiss={dismiss} />
    </div>
  );
}
