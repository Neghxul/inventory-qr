import { Order } from "@prisma/client";
import Link from "next/link";

interface Props {
    order: Order;
}

export function OrderCard({ order }: Props) {
    return (
        <div className="bg-gray-800 rounded-md p-4 shadow-md hover:bg-gray-700 transition-colors cursor-pointer">
            <h3 className="font-semibold text-white mb-2">Order #{order.orderNumber}</h3>
            <p className="text-gray-400 text-sm">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
            <p className="text-gray-400 text-sm">Total: ${order.totalAmount.toFixed(2)}</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                order.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-300' :
                order.status === 'SHIPPED' ? 'bg-green-500/20 text-green-300' :
                order.status === 'DELIVERED' ? 'bg-green-600/20 text-green-200' :
                'bg-red-500/20 text-red-300'
            }`}>{order.status}</span>
        </div>
    );
}