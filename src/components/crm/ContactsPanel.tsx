// src/components/crm/ContactsPanel.tsx
"use client";

import { useState } from 'react';
import { Company, Contact } from '@prisma/client';
import { FiPlusCircle, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import ContactFormModal from './ContactFormModal'; // Asegúrate de que la ruta es correcta

type ContactWithCompany = Contact & { company: Company | null };

interface Props {
  companyId: string;
  initialContacts: Contact[];
  // Necesitamos todas las compañías para el selector en el modal
  allCompanies: Company[]; 
}

export function ContactsPanel({ companyId, initialContacts, allCompanies }: Props) {
  const [contacts, setContacts] = useState(initialContacts);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onContactSaved = (newContact: ContactWithCompany) => {
    // Actualiza la lista de contactos al instante
    setContacts(current => [newContact, ...current]);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white">Contacts ({contacts.length})</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
        >
          <FiPlusCircle size={14} />
          Add
        </button>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {contacts.length > 0 ? (
            contacts.map(contact => (
                <div key={contact.id} className="p-3 bg-gray-800/50 rounded-md flex items-center gap-3">
                    <FiUser className="text-gray-400" />
                    <div>
                        <p className="font-semibold text-sm">{contact.firstName} {contact.lastName}</p>
                        <p className="text-xs text-gray-400">{contact.email}</p>
                        <p className="text-xs text-gray-400">{contact.phone}</p>

                    </div>
                </div>
            ))
        ) : (
            <p className="text-sm text-center text-gray-500 py-4">No contacts yet.</p>
        )}
      </div>

      <ContactFormModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        companies={allCompanies}
        onContactSaved={onContactSaved}
        defaultCompanyId={companyId} // Pre-selecciona la compañía actual
      />
    </div>
  );
}