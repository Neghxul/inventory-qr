// src/components/crm/CompanyDetailActions.tsx
"use client";

import { useState } from 'react';
import { Company, Contact } from "@prisma/client";
import { FiPlusCircle } from "react-icons/fi";
import ContactFormModal from "./ContactFormModal";
import { toast } from 'react-hot-toast';

type ContactWithCompany = Contact & { company: Company | null };

interface Props {
    company: Company & { contacts: Contact[] };
    companies: Company[]; // Pasamos la lista completa para el modal
}

export default function CompanyDetailActions({ company, companies }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactsList, setContactsList] = useState(company.contacts);

    const onContactSaved = (newContact: ContactWithCompany) => {
        // Actualizamos la lista de contactos en la página de detalle al instante
        setContactsList(current => [newContact, ...current]);
    };

    return (
        <>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Associated Contacts ({contactsList.length})</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium">
                    <FiPlusCircle />
                    Add Contact
                </button>
            </div>
            <div className="mt-4 divide-y divide-gray-700/50">
                {contactsList.length > 0 ? (
                    contactsList.map(contact => (
                        <div key={contact.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{contact.firstName} {contact.lastName}</p>
                                <p className="text-sm text-gray-400">{contact.email}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 py-4">No contacts associated with this company yet.</p>
                )}
            </div>

            <ContactFormModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                companies={companies}
                onContactSaved={onContactSaved}
                defaultCompanyId={company.id} // <-- Pasamos el ID de la compañía actual
            />
        </>
    )
}