import { Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import type { Report } from '../../api';
import { getStatusPresentation } from '../../utils/reportStatus';

type MarkerPopupProps = {
	lat: number;
	lng: number;
	title?: string;
	description?: string | null;
	size?: string | null;
	reportId?: number;
	status?: Report['status'];
};

export default function MarkerPopup({
	lat,
	lng,
	title = 'Trash report',
	description,
	size,
	reportId,
	status,
}: MarkerPopupProps) {
	return (
		<Popup>
			<div className="min-w-44 text-sm" style={{ color: 'var(--color-text-body)' }}>
				<p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</p>
				{status && (
					<span
						className={`mt-2 inline-block rounded-full px-2 py-1 text-[11px] font-semibold ${getStatusPresentation(status).className}`}
					>
						{getStatusPresentation(status).label}
					</span>
				)}
				<p className="mt-1" style={{ color: 'var(--color-text-body)' }}>
					{description && description.trim().length > 0 ? description : 'No description'}
				</p>
				<p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>Size: {size ?? 'Unknown'}</p>
				<p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
					{lat.toFixed(5)}, {lng.toFixed(5)}
				</p>
			{status === 'pending' && (
				<p className="mt-2 text-xs font-semibold text-amber-600">
					🗳 Needs verification — help the community vote
				</p>
			)}
			{status === 'cleanup_pending_vote' && (
				<p className="mt-2 text-xs font-semibold text-amber-600">
					⚠ Cleanup proof needs votes
				</p>
			)}
				{typeof reportId === 'number' && (
					<Link
						to={`/reports/${reportId}`}
						className="mt-3 inline-block text-xs font-semibold text-emerald-700 hover:underline"
					>
						Open report details
					</Link>
				)}
			</div>
		</Popup>
	);
}
