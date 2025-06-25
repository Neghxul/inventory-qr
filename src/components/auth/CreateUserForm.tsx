// src/components/auth/CreateUserForm.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Role } from "@prisma/client";

export default function CreateUserForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: Role.USER, // Rol por defecto
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to create user");
      }

      toast.success("User created successfully!");
      router.push("/admin/users"); // Redirigir a una futura lista de usuarios
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campo para el Nombre */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
        <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white p-2"/>
      </div>

      {/* Campo para el Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
        <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white p-2"/>
      </div>

      {/* Campo para la Contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Initial Password</label>
        <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white p-2"/>
      </div>

      {/* Selector de Rol */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-300">Role</label>
        <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md bg-gray-800 border-gray-600 text-white p-2">
          {Object.values(Role).map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500">
        {isLoading ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}