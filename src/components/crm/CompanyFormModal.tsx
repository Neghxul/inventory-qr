// src/components/crm/CompanyFormModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { Company } from "@prisma/client";
import { toast } from "react-hot-toast";
import { FiX } from "react-icons/fi";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  companyToEdit?: Company | null;
  onCompanySaved: (company: Company) => void;
}

const initialState = { name: "", address: "", phone: "", website: "" };

export default function CompanyFormModal({ isOpen, setIsOpen, companyToEdit, onCompanySaved }: Props) {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!companyToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          name: companyToEdit.name || "",
          address: companyToEdit.address || "",
          phone: companyToEdit.phone || "",
          website: companyToEdit.website || "",
        });
      } else {
        setFormData(initialState);
      }
    }
  }, [companyToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const url = isEditing ? `/api/crm/companies/${companyToEdit!.id}` : "/api/crm/companies";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(await res.text());
      const savedCompany = await res.json();

      toast.success(`Company ${isEditing ? 'updated' : 'created'} successfully!`);
      onCompanySaved(savedCompany);
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
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white flex justify-between items-center">
                  <span>{isEditing ? "Edit Company" : "Create New Company"}</span>
                  <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-700"><FiX/></button>
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-400">Company Name*</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 p-2"/>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 p-2"/>
                  </div>
                   <div>
                    <label className="text-sm text-gray-400">Website</label>
                    <input type="text" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 p-2"/>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-400">Address</label>
                    <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 p-2" rows={3}/>
                  </div>
                  <div className="md:col-span-2 mt-6 flex justify-end gap-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
                      {isLoading ? "Saving..." : "Save Company"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}