"use client";
import { getTrackingUrl } from '@/lib/trackingUtils';
import { FiExternalLink } from 'react-icons/fi';

interface Props {
    carrier: string | null;
    trackingNumber: string | null;
}

export function TrackingInfoPanel({ carrier, trackingNumber }: Props) {
    if (!carrier || !trackingNumber) {
        return null; // No mostrar nada si no hay información
    }

    const trackingUrl = getTrackingUrl(carrier, trackingNumber);

    return (
        <div className="bg-blue-900/50 border border-blue-700 p-4 rounded-lg mt-6 text-center">
            <p className="font-semibold">This order has been shipped via {carrier}.</p>
            <p className="text-sm text-gray-300 mb-3">Tracking #: {trackingNumber}</p>
            {trackingUrl ? (
                <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium"
                >
                    <FiExternalLink />
                    Track Shipment
                </a>
            ) : (
                <p className="text-xs text-yellow-400">Tracking link not available for this carrier.</p>
            )}
        </div>
    );
}