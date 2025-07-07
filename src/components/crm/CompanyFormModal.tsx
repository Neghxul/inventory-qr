// src/components/crm/CompanyFormModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { Company, User } from "@prisma/client";
import { toast } from "react-hot-toast";
import { FiX } from "react-icons/fi";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  companyToEdit?: CompanyWithOwner | null;
  onCompanySaved: (company: CompanyWithOwner) => void;
  sellers: User[];
}

type CompanyWithOwner = Company & { owner?: User | null }

const initialState = {
    name: "", phone: "", website: "", street: "", exteriorNumber: "",
    interiorNumber: "", neighborhood: "", municipality: "", state: "",
    country: "", postalCode: "", ownerId: "",
};

export default function CompanyFormModal({ isOpen, setIsOpen, companyToEdit, onCompanySaved, sellers }: Props) {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!companyToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          name: companyToEdit.name || "",
          phone: companyToEdit.phone || "",
          website: companyToEdit.website || "",
          street: companyToEdit.street || "",
          exteriorNumber: companyToEdit.exteriorNumber || "",
          interiorNumber: companyToEdit.interiorNumber || "",
          neighborhood: companyToEdit.neighborhood || "",
          municipality: companyToEdit.municipality || "",
          state: companyToEdit.state || "",
          country: companyToEdit.country || "",
          postalCode: companyToEdit.postalCode || "",
          ownerId: companyToEdit.ownerId || "",
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

      const owner = sellers.find(s => s.id === savedCompany.ownerId)

      toast.success(`Company ${isEditing ? 'updated' : 'created'} successfully!`);
      onCompanySaved({ ...savedCompany, owner });
      closeModal();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => setIsOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value}))
  }

  return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                <div className="fixed inset-0 bg-black/50" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl">
                        <Dialog.Title as="h3" className="text-lg font-medium text-white flex justify-between items-center">
                            <span>{isEditing ? "Edit Company" : "Create New Company"}</span>
                            <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-700"><FiX/></button>
                        </Dialog.Title>
                        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-4 gap-4">
                            {/* --- Fila 1: Nombre y Dueño --- */}
                            <div className="col-span-4 md:col-span-2">
                                <label className="text-sm text-gray-400">Company Name*</label>
                                <input name="name" type="text" required value={formData.name} onChange={handleChange} className="mt-1 w-full rounded-md bg-gray-800 p-2"/>
                            </div>
                            <div className="col-span-4 md:col-span-2">
                                <label className="text-sm text-gray-400">Company Owner (Seller)</label>
                                <select name="ownerId" value={formData.ownerId} onChange={handleChange} className="mt-1 w-full rounded-md bg-gray-800 p-2">
                                    <option value="">-- No Owner --</option>
                                    {sellers.map(seller => <option key={seller.id} value={seller.id}>{seller.name}</option>)}
                                </select>
                            </div>
                            {/* --- Fila 1.1: Website y Telefono --- */}
                            <div className="col-span-4 md:col-span-2">
                                <label className="text-sm text-gray-400">Website</label>
                                <input name="website" type="text" required value={formData.website} onChange={handleChange} className="mt-1 w-full rounded-md bg-gray-800 p-2"/>
                            </div>
                            <div className="col-span-4 md:col-span-2">
                                <label className="text-sm text-gray-400">Phone Number</label>
                                <input name="phone" type="text" required value={formData.phone} onChange={handleChange} className="mt-1 w-full rounded-md bg-gray-800 p-2"/>
                            </div>
                            {/* --- Fila 2: Dirección Principal --- */}
                            <div className="col-span-4">
                                <label className="text-sm text-gray-400">Street</label>
                                <input name="street" value={formData.street} onChange={handleChange} className="mt-1 w-full rounded-md bg-gray-800 p-2"/>
                            </div>
                            {/* --- Fila 3: Números y Colonia --- */}
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-sm text-gray-400">Ext. Num.</label>
                                <input name="exteriorNumber" value={formData.exteriorNumber} onChange={handleChange} className="mt-1 w-full rounded-md bg-gray-800 p-2"/>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-sm text-gray-400">Int. Num.</label>
                                <input name="interiorNumber" value={formData.interiorNumber} onChange={handleChange} className="mt-1 w-full rounded-md bg-gray-800 p-2"/>
                            </div>
                            <div className="col-span-4 md:col-span-2">
                                <label className="text-sm text-gray-400">Neighborhood</label>
                                <input name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="mt-1 w-full rounded-md bg-gray-800 p-2"/>
                            </div>
                            {/* --- Fila 4: Municipio, Estado, CP --- */}
                             <div className="col-span-4 md:col-span-2">
                                <label className="text-sm text-gray-400">Municipality</label>
                                <input name="municipality" value={formData.municipality} onChange={handleChange} className="mt-1 w-full rounded-md bg-gray-800 p-2"/>
                            </div>
                             <div className="col-span-2 md:col-span-1">
                                <label className="text-sm text-gray-400">State</label>
                                <input name="state" value={formData.state} onChange={handleChange} className="mt-1 w-full rounded-md bg-gray-800 p-2"/>
                            </div>
                             <div className="col-span-2 md:col-span-1">
                                <label className="text-sm text-gray-400">Postal Code</label>
                                <input name="postalCode" value={formData.postalCode} onChange={handleChange} className="mt-1 w-full rounded-md bg-gray-800 p-2"/>
                            </div>
                            {/* --- Botones --- */}
                            <div className="col-span-4 mt-6 flex justify-end gap-4">
                                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600">Cancel</button>
                                <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500">
                                {isLoading ? "Saving..." : "Save Company"}
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