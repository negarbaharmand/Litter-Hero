import { Popup } from 'react-leaflet';

type MarkerPopupProps = {
	lat: number;
	lng: number;
	title?: string;
	description?: string | null;
	size?: string | null;
};

export default function MarkerPopup({
	lat,
	lng,
	title = 'Trash report',
	description,
	size,
}: MarkerPopupProps) {
	return (
		<Popup>
			<div className="min-w-44 text-sm text-slate-800">
				<p className="font-semibold">{title}</p>
				<p className="mt-1 text-slate-600">
					{description && description.trim().length > 0 ? description : 'No description'}
				</p>
				<p className="mt-2 text-xs text-slate-500">Size: {size ?? 'Unknown'}</p>
				<p className="mt-1 text-xs text-slate-500">
					{lat.toFixed(5)}, {lng.toFixed(5)}
				</p>
			</div>
		</Popup>
	);
}
