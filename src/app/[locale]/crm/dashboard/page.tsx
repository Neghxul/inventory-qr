// src/app/[locale]/dashboard/page.tsx
import { SalesChart } from '@/components/crm/dashboard/SalesChart';

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Sales Dashboard</h1>
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Monthly Sales by Seller</h2>
                {/* El componente ahora se encarga de obtener sus propios datos */}
                <SalesChart />
            </div>
        </div>
    );
}