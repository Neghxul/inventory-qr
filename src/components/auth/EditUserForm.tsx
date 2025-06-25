// src/components/auth/EditUserForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Role, User } from "@prisma/client";

interface EditUserFormProps {
  user: User;
}

export default function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
    role: user.role,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update user");

      toast.success("User updated successfully!");
      router.push("/admin/users");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campos pre-rellenados */}
      <div>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white p-2"/>
      </div>
      <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white p-2"/>
      </div>
      <div>
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white p-2">
              {Object.values(Role).map((role) => (
                  <option key={role} value={role}>{role}</option>
              ))}
          </select>
      </div>
      <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500">
          {isLoading ? "Updating..." : "Update User"}
      </button>
    </form>
  );
}