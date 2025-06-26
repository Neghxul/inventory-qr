// src/components/crm/CompanyActions.tsx
"use client";

import { useState } from "react";
import { Company } from "@prisma/client";
import { FiPlusCircle, FiEdit, FiTrash2 } from "react-icons/fi";
import CompanyFormModal from "./CompanyFormModal";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface CompanyActionsProps {
  initialCompanies: Company[];
}

export default function CompanyActions({ initialCompanies }: CompanyActionsProps) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const handleCreate = () => {
    setEditingCompany(null);
    setIsModalOpen(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleDelete = async (companyId: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    try {
      const res = await fetch(`/api/crm/companies/${companyId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete company");

      setCompanies(current => current.filter(c => c.id !== companyId));
      toast.success("Company deleted successfully.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const onCompanySaved = (company: Company) => {
    if (editingCompany) {
      setCompanies(current => current.map(c => c.id === company.id ? company : c));
    } else {
      setCompanies(current => [company, ...current]);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Companies</h1>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium">
          <FiPlusCircle />
          Add Company
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Website</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {companies.map((company) => (
              <tr key={company.id}>
                <td className="p-4 font-medium">
                  <Link href={`/crm/companies/${company.id}`} className="hover:text-blue-400 hover:underline">
                    {company.name}
                  </Link>
                </td>
                <td className="p-4 text-gray-400">{company.phone || '-'}</td>
                <td className="p-4 text-gray-400">{company.website || '-'}</td>
                <td className="p-4 flex items-center gap-4">
                  <button onClick={() => handleEdit(company)} className="text-blue-400 hover:text-blue-300" title="Edit">
                    <FiEdit />
                  </button>
                  <button onClick={() => handleDelete(company.id)} className="text-red-400 hover:text-red-300" title="Delete">
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CompanyFormModal 
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        companyToEdit={editingCompany}
        onCompanySaved={onCompanySaved}
      />
    </>
  );
}