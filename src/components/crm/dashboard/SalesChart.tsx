"use client";
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiLoader } from 'react-icons/fi';

interface SalesData {
    date: string;
    [seller: string]: string | number;
}

// [CORRECCIÓN] Añadir la definición de la constante que faltaba
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const FILTERS = [
    { label: 'This Week', value: 'thisWeek' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last 60 Days', value: 'last60days' },
    { label: 'Last 90 Days', value: 'last90days' },
];

export function SalesChart() {
    const [data, setData] = useState([]);
    const [sellerNames, setSellerNames] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('last30days');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/crm/dashboard/sales-by-seller?period=${activeFilter}`);
                if (res.ok) {
                    const { chartData, sellerNames } = await res.json();
                    setData(chartData);
                    setSellerNames(sellerNames);
                } else {
                    setData([]);
                    setSellerNames([]);
                }
            } catch (error) {
                setData([]);
                setSellerNames([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [activeFilter]);

    return (
        <div>
            <div className="flex gap-2 mb-4">
                {FILTERS.map(filter => (
                    <button
                        key={filter.value}
                        onClick={() => setActiveFilter(filter.value)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            activeFilter === filter.value 
                                ? 'bg-blue-600 text-white font-semibold' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                    <FiLoader className="animate-spin text-blue-500 h-12 w-12" />
                </div>
            ) : data.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                        <Legend />
                        {sellerNames.map((seller, index) => (
                            <Line 
                                key={seller} 
                                type="monotone" 
                                dataKey={seller} 
                                // Ahora COLORS está definido y se puede usar
                                stroke={COLORS[index % COLORS.length]} 
                                strokeWidth={2} 
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex justify-center items-center h-[400px]">
                    <p className="text-gray-400">No sales data available for the selected period.</p>
                </div>
            )}
        </div>
    );
}