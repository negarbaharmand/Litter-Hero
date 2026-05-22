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
			<div className="min-w-44 text-sm text-slate-800">
				<p className="font-semibold">{title}</p>
				{status && (
					<span
						className={`mt-2 inline-block rounded-full px-2 py-1 text-[11px] font-semibold ${getStatusPresentation(status).className}`}
					>
						{getStatusPresentation(status).label}
					</span>
				)}
				<p className="mt-1 text-slate-600">
					{description && description.trim().length > 0 ? description : 'No description'}
				</p>
				<p className="mt-2 text-xs text-slate-500">Size: {size ?? 'Unknown'}</p>
				<p className="mt-1 text-xs text-slate-500">
					{lat.toFixed(5)}, {lng.toFixed(5)}
				</p>
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
