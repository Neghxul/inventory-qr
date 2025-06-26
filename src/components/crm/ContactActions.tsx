// src/components/crm/ContactActions.tsx
"use client";

import { useState } from "react";
import { Company, Contact } from "@prisma/client";
import { FiPlusCircle, FiEdit, FiTrash2 } from "react-icons/fi";
import ContactFormModal from "./ContactFormModal";
import { toast } from "react-hot-toast";

// Extendemos el tipo Contact para incluir la compañía
type ContactWithCompany = Contact & { company: Company | null };

interface ContactActionsProps {
  initialContacts: ContactWithCompany[];
  companies: Company[];
}

export default function ContactActions({ initialContacts, companies }: ContactActionsProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactWithCompany | null>(null);

  const handleCreate = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contact: ContactWithCompany) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const res = await fetch(`/api/crm/contacts/${contactId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete contact");

      setContacts(current => current.filter(c => c.id !== contactId));
      toast.success("Contact deleted successfully.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const onContactSaved = (contact: ContactWithCompany) => {
    if (editingContact) {
      setContacts(current => current.map(c => c.id === contact.id ? contact : c));
    } else {
      setContacts(current => [contact, ...current]);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Contacts</h1>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium">
          <FiPlusCircle />
          Add Contact
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Company</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td className="p-4 font-medium">{contact.firstName} {contact.lastName}</td>
                <td className="p-4 text-gray-400">{contact.company?.name || '-'}</td>
                <td className="p-4 text-gray-400">{contact.email || '-'}</td>
                <td className="p-4 text-gray-400">{contact.phone || '-'}</td>
                <td className="p-4 flex items-center gap-4">
                  <button onClick={() => handleEdit(contact)} className="text-blue-400 hover:text-blue-300" title="Edit">
                    <FiEdit />
                  </button>
                  <button onClick={() => handleDelete(contact.id)} className="text-red-400 hover:text-red-300" title="Delete">
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ContactFormModal 
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        contactToEdit={editingContact}
        companies={companies}
        onContactSaved={onContactSaved}
      />
    </>
  );
}