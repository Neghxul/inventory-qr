"use client";

import { useState } from 'react';
import { Note, Task, User, Company, Order, Contact } from '@prisma/client';
import { FiMessageSquare, FiCheckSquare, FiShoppingCart, FiPlusCircle } from 'react-icons/fi';
import { NotesSection } from './NoteSection';
import { TasksSection } from './TaskSection';
import OrderFormModal from './orders/OrderFormModal';
import { OrderCard } from './orders/OrderCard';
import Link from 'next/link';
import toast from 'react-hot-toast';


// Tipos extendidos para incluir relaciones
type NoteWithAuthor = Note & { author: User };
type TaskWithAssignee = Task & { assignee: User };

type CompanyWithDetails = Company & {
    contacts: Contact[];
    notes: NoteWithAuthor[];
    tasks: TaskWithAssignee[];
    orders: Order[];
};

interface Props {
  company: CompanyWithDetails;
  //initialNotes: NoteWithAuthor[];
  //initialTasks: TaskWithAssignee[];
  //initialOrders: Order[]
  users: User[]; // Para asignar tareas
}

export function ActivityFeed({ company, users }: Props) {
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'orders'>('orders');
  const [orders, setOrders] = useState(company.orders);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [notes, setNotes] = useState(company.notes);
  const [tasks, setTasks] = useState(company.tasks);

  const tabs = [
    { id: 'notes', label: 'Notes', icon: FiMessageSquare },
    { id: 'tasks', label: 'Tasks', icon: FiCheckSquare },
    { id: 'orders', label: 'Orders', icon: FiShoppingCart },
  ];

  const handleCreateOrder = () => {
    setIsOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
  };

  const handleOrderSaved = async () => {
        // Recargar las órdenes de la compañía
        // Esta es una forma simplificada; en una app grande se usaría una librería de estado

        try {
            const res = await fetch(`/api/crm/companies/${company.id}?include=orders`);
            if (res.ok) {
                const updatedCompany = await res.json();
                // Actualizar el estado con la nueva lista de órdenes
                setOrders(updatedCompany.orders || []);
            } else {
                 toast.error("Could not refresh orders list.");
            }
        } catch (error) {
            toast.error("Failed to connect to the server.");
        }
    };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <div className="border-b border-gray-700 mb-4">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'orders' && (
          <button onClick={handleCreateOrder} className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
            <FiPlusCircle size={14} />
            Add Order
          </button>
                )}
      </div>

      <div>
        {activeTab === 'notes' && <NotesSection companyId={company.id} notes={notes} setNotes={setNotes} />}
        {activeTab === 'tasks' && <TasksSection companyId={company.id} tasks={tasks} setTasks={setTasks} users={users} />}
        {activeTab === 'orders' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {orders.map(order => (
                            <Link key={order.id} href={`/crm/orders/${order.id}`}>
                                <OrderCard order={order} />
                            </Link>
                        ))}
                        {orders.length === 0 && <p className="text-gray-500 mt-4">No orders for this company yet.</p>}
                    </div>
                )}
      </div>
      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderModal}
        companies={[company]} // Solo permitir seleccionar la compañía actual
        contacts={company.contacts}
        companyId={company.id}
        onOrderSaved={handleOrderSaved}
      />
    </div>
  );
}