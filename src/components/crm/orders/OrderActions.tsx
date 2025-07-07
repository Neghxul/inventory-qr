// src/app/components/crm/orders/OrderActions.tsx
"use client";

import { useState, Fragment } from 'react';
import { Order, Company, Contact, User, OrderStatus } from '@prisma/client';
import { FiPlusCircle } from 'react-icons/fi';
import OrderFormModal from './OrderFormModal';
import Link from 'next/link';
import { CompanyWithOwner, OrderWithRelations } from '@/types/index';
import toast from 'react-hot-toast';
import { Menu, Transition } from '@headlessui/react'


interface Props {
    initialOrders: OrderWithRelations[];
    companies: CompanyWithOwner[];
    contacts: Contact[];
    sellers: User[];
}

export function OrderActions({ initialOrders, companies, contacts, sellers }: Props) {
    const [orders, setOrders] = useState(initialOrders);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const onOrderSaved = () => {
        // Lógica para recargar las órdenes después de guardar
        // (se puede implementar más adelante)
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        // Optimistic UI update
        const originalOrders = [...orders];
        setOrders(currentOrders => 
            currentOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        );

        try {
            const res = await fetch(`/api/crm/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to update status.");
            toast.success("Order status updated!");
        } catch (error) {
            // Rollback on error
            setOrders(originalOrders);
            toast.error("Could not update order status.");
        }
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/20 text-yellow-300';
            case 'PROCESSING': return 'bg-blue-500/20 text-blue-300';
            case 'SHIPPED': return 'bg-green-500/20 text-green-300';
            case 'DELIVERED': return 'bg-green-600/20 text-green-200';
            case 'CANCELLED': return 'bg-red-500/20 text-red-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Orders ({orders.length})</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
                >
                    <FiPlusCircle />
                    Create Order
                </button>
            </div>
            <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="p-4">Order #</th>
                            <th className="p-4">Company</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td className="p-4 font-medium text-blue-400">
                                     <Link href={`/crm/orders/${order.id}`} className="text-blue-400 hover:underline">
                                        {order.orderNumber}
                                    </Link>
                                </td>
                                <td className="p-4">{order.company.name}</td>
                                <td className="p-4">{order.contact.firstName} {order.contact.lastName}</td>
                                <td className="p-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                                <td className="p-4">${order.totalAmount.toFixed(2)}</td>
                                <td className="p-4">
                                    {/* --- [NUEVO] Menú desplegable para el estado --- */}
                                    <Menu as="div" className="relative inline-block text-left">
                                        <Menu.Button className={`px-2 py-1 text-xs rounded-full font-semibold transition-transform duration-150 hover:scale-105 ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </Menu.Button>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-left divide-y divide-gray-600 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                <div className="p-1">
                                                    {Object.values(OrderStatus).map((status) => (
                                                        <Menu.Item key={status}>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() => handleStatusChange(order.id, status)}
                                                                    className={`${
                                                                        active ? 'bg-blue-600 text-white' : 'text-gray-300'
                                                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                                >
                                                                    <span className={`h-2 w-2 mr-3 rounded-full ${getStatusColor(status)}`}/>
                                                                    {status}
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    ))}
                                                </div>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                               </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <OrderFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                companies={companies}
                sellers={sellers}
                onOrderSaved={onOrderSaved}
            />
        </div>
    );
}