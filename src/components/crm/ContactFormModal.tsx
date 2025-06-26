// src/components/crm/ContactFormModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { Company, Contact } from "@prisma/client";
import { toast } from "react-hot-toast";
import { FiX } from "react-icons/fi";

type ContactWithCompany = Contact & { company: Company | null };

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  contactToEdit?: ContactWithCompany | null;
  companies: Company[];
  onContactSaved: (contact: ContactWithCompany) => void;
}

const initialState = { firstName: "", lastName: "", email: "", phone: "", companyId: "" };

export default function ContactFormModal({ isOpen, setIsOpen, contactToEdit, companies, onContactSaved }: Props) {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!contactToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          firstName: contactToEdit.firstName || "",
          lastName: contactToEdit.lastName || "",
          email: contactToEdit.email || "",
          phone: contactToEdit.phone || "",
          companyId: contactToEdit.companyId || "",
        });
      } else {
        setFormData(initialState);
      }
    }
  }, [contactToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const url = isEditing ? `/api/crm/contacts/${contactToEdit!.id}` : "/api/crm/contacts";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(await res.text());

      // Como la API no devuelve la compañía, buscamos en la lista que ya tenemos
      const savedContact = await res.json();
      const company = companies.find(c => c.id === savedContact.companyId) || null;

      onContactSaved({ ...savedContact, company });
      toast.success(`Contact ${isEditing ? 'updated' : 'created'} successfully!`);
      closeModal();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => setIsOpen(false);

  return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          {/* ... Contenido del Dialog y Transition (similar al de Company) ... */}
          <div className="fixed inset-0 bg-black/50" />
          <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-lg transform rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl">
                <Dialog.Title as="h3" className="text-lg font-medium text-white flex justify-between items-center">
                  <span>{isEditing ? "Edit Contact" : "Create New Contact"}</span>
                  <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-700"><FiX/></button>
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campos del formulario */}
                  <div>
                    <label className="text-sm text-gray-400">First Name*</label>
                    <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 p-2"/>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Last Name*</label>
                    <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 p-2"/>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-400">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 p-2"/>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 p-2"/>
                  </div>
                  {/* CAMPO CLAVE: Selector de Compañía */}
                  <div>
                    <label className="text-sm text-gray-400">Company</label>
                    <select value={formData.companyId} onChange={(e) => setFormData({...formData, companyId: e.target.value})} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 p-2">
                      <option value="">-- No company --</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 mt-6 flex justify-end gap-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-700 hover:bg-gray-600">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500">
                      {isLoading ? "Saving..." : "Save Contact"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
          </div>
          </div>
        </Dialog>
      </Transition>
  );
}