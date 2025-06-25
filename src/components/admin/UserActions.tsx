// src/components/admin/UserActions.tsx
"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import { FiPlusCircle, FiEdit, FiTrash2 } from "react-icons/fi";
import UserFormModal from "../auth/UserFormModal"; // Lo crearemos en el siguiente paso
import { toast } from "react-hot-toast";

interface UserActionsProps {
  users: Partial<User>[];
}

export default function UserActions({ users: initialUsers }: UserActionsProps) {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: Partial<User>) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

   const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      // Actualizar el estado para reflejar la eliminación en la UI al instante
      setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const onUserSaved = (user: User) => {
    if (editingUser) { // Si estábamos editando
      setUsers(currentUsers => currentUsers.map(u => u.id === user.id ? user : u));
    } else { // Si estábamos creando
      setUsers(currentUsers => [user, ...currentUsers]);
    }
  }

  

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium">
          <FiPlusCircle />
          Create User
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-4">{user.name}</td>
                <td className="p-4 text-gray-400">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 flex items-center gap-4">
                  <button onClick={() => handleEdit(user)} className="text-blue-400 hover:text-blue-300" title="Edit">
                    <FiEdit />
                  </button>
                  <button onClick={() => handleDelete(user.id!)} className="text-red-400 hover:text-red-300" title="Delete">
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserFormModal 
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        userToEdit={editingUser}
        onUserSaved={onUserSaved}
      />
    </>
  );
}