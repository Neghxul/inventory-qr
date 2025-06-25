// src/components/admin/UserFormModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { Role, User } from "@prisma/client";
import { toast } from "react-hot-toast";
import { FiX } from "react-icons/fi";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userToEdit?: Partial<User> | null;
  onUserSaved: (user: User) => void;
}

// Definimos el tipo para nuestro estado del formulario
interface FormData {
    name: string;
    email: string;
    password?: string; // La contraseña es opcional al editar
    role: Role;
}

export default function UserFormModal({ isOpen, setIsOpen, userToEdit, onUserSaved }: Props) {
  // Usamos nuestro tipo explícito en el estado
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", password: "", role: Role.USER });
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!userToEdit;

  useEffect(() => {
    if (isOpen) {
        if (isEditing && userToEdit) {
          setFormData({
            name: userToEdit.name || "",
            email: userToEdit.email || "",
            password: "", // La contraseña no se pre-rellena por seguridad
            role: userToEdit.role || Role.USER,
          });
        } else {
          setFormData({ name: "", email: "", password: "", role: Role.USER });
        }
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const url = isEditing ? `/api/users/${userToEdit!.id}` : "/api/auth/register";
    const method = isEditing ? "PUT" : "POST";

    const body: Partial<FormData> = { ...formData };
    if (isEditing && !body.password) {
      delete body.password;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "An error occurred");
      }

      const savedUser = await res.json();
      toast.success(`User ${isEditing ? 'updated' : 'created'} successfully!`);
      onUserSaved(savedUser);
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white flex justify-between items-center">
                  <span>{isEditing ? "Edit User" : "Create New User"}</span>
                  <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-700"><FiX/></button>
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {/* Formulario */}
                  <div>
                    <label htmlFor="name" className="text-sm text-gray-400">Name</label>
                    <input id="name" name="name" type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"/>
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm text-gray-400">Email</label>
                    <input id="email" name="email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"/>
                  </div>
                  <div>
                    <label htmlFor="password"  className="text-sm text-gray-400">{isEditing ? "New Password (optional)" : "Password"}</label>
                    <input id="password" name="password" type="password" required={!isEditing} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"/>
                  </div>
                  <div>
                    <label htmlFor="role" className="text-sm text-gray-400">Role</label>
                    <select id="role" name="role" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as Role})} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white p-2">
                      {Object.values(Role).map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>
                  <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
                      {isLoading ? "Saving..." : "Save"}
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