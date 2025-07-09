// src/app/crm/orders/[id]/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { FiShoppingCart, FiUser, FiBriefcase} from "react-icons/fi";
import { Role } from "@prisma/client";
import { FulfillmentPanel } from "@/components/crm/tracking/FulfillmentPanel";
import { TrackingInfoPanel } from "@/components/crm/tracking/TrackingInfoPanel";

async function getOrderDetails(id: string) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            company: true,
            contact: true,
            seller: true, // Vendedor
            lineItems: true, // Artículos de la orden
        },
    });
    return order;
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
     const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");

    const order = await getOrderDetails(params.id);
    if (!order) {
        return <div className="p-8 text-center text-gray-400">Company not found.</div>;
    }

    const userRole = session.user.role;
    const canFulfillOrders = userRole === Role.ADMIN || userRole === Role.WAREHOUSE;


    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8 text-white">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FiShoppingCart />
                        Order #{order.orderNumber}
                    </h1>
                    <p className="text-gray-400">
                        Order Date: {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Status</p>
                     <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                        order.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-green-500/20 text-green-300'
                    }`}>{order.status}</span>
                </div>
            </div>

            {/* Paneles de Información */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><FiBriefcase/> Company</h3>
                    <p>{order.company.name}</p>
                    <p className="text-sm text-gray-400">{order.company.phone}</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><FiUser/> Contact</h3>
                    <p>{order.contact.firstName} {order.contact.lastName}</p>
                    <p className="text-sm text-gray-400">{order.contact.email}</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><FiUser/> Seller</h3>
                    <p>{order.seller?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-400">REV: {order.rev || '-'}</p>
                </div>
            </div>

            {/* Si el usuario tiene permisos, muestra el formulario de envío */}
            {canFulfillOrders && (
                <FulfillmentPanel 
                    orderId={order.id}
                    initialCarrier={order.shippingCarrier}
                    initialTracking={order.trackingNumber}
                />
            )}

            {/* Si NO tiene permisos PERO la orden ya tiene datos, muestra el panel de rastreo */}
            {!canFulfillOrders && order.trackingNumber && (
                 <TrackingInfoPanel 
                    carrier={order.shippingCarrier}
                    trackingNumber={order.trackingNumber}
                />
            )}

            {/* Si SÍ tiene permisos Y la orden ya tiene datos, muestra también el panel de rastreo */}
            {canFulfillOrders && order.trackingNumber && (
                 <TrackingInfoPanel 
                    carrier={order.shippingCarrier}
                    trackingNumber={order.trackingNumber}
                />
            )}


            {/* Tabla de Artículos */}
            <div className="bg-gray-900 rounded-lg">
                <h3 className="font-semibold text-lg p-4">Order Items</h3>
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="p-3">SKU</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">OC</th>
                            <th className="p-3 text-center">Quantity</th>
                            <th className="p-3 text-right">Unit Cost (USD)</th>
                            <th className="p-3 text-right">Line Total (USD)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {order.lineItems.map(item => (
                            <tr key={item.id}>
                                <td className="p-3">{item.sku}</td>
                                <td className="p-3">{item.description}</td>
                                <td className="p-3">{item.purchaseOrder}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right font-mono">${item.unitCost.toFixed(2)}</td>
                                <td className="p-3 text-right font-mono">${(item.quantity * item.unitCost).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 text-right bg-gray-800/50 rounded-b-lg">
                    <p className="text-gray-400">Grand Total</p>
                    <p className="text-2xl font-bold font-mono">${order.totalAmount.toFixed(2)} USD</p>
                </div>
            </div>
        </div>
    );
}