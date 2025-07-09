"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiSave, FiTruck } from 'react-icons/fi';

interface Props {
    orderId: string;
    initialCarrier: string | null;
    initialTracking: string | null;
}

export function FulfillmentPanel({ orderId, initialCarrier, initialTracking }: Props) {
    const [carrier, setCarrier] = useState(initialCarrier || '');
    const [tracking, setTracking] = useState(initialTracking || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`/api/crm/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shippingCarrier: carrier, trackingNumber: tracking }),
            });

            if (!res.ok) throw new Error('Failed to save shipping info');
            
            toast.success('Shipping information saved!');
        } catch (error) {
            toast.error('Could not save shipping info.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 p-4 rounded-lg mt-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><FiTruck/> Shipping Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Shipping Carrier (e.g., FedEx)"
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        className="w-full bg-gray-800 p-2 rounded text-white"
                    />
                    <input
                        type="text"
                        placeholder="Tracking Number"
                        value={tracking}
                        onChange={(e) => setTracking(e.target.value)}
                        className="w-full bg-gray-800 p-2 rounded text-white"
                    />
                </div>
                <div className="text-right">
                    <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:bg-gray-500">
                        <FiSave/>
                        {isLoading ? 'Saving...' : 'Save Shipping Info'}
                    </button>
                </div>
            </form>
        </div>
    );
}