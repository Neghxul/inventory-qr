// src/components/crm/CompanyActions.tsx
"use client";

import { useState, useEffect } from "react";
import { Company, User } from "@prisma/client";
import { FiPlusCircle, FiEdit, FiTrash2, FiSearch, FiUser } from "react-icons/fi";
import CompanyFormModal from "./CompanyFormModal";
import { toast } from "react-hot-toast";
import Link from "next/link";

type CompanyWithOwner = Company & { owner?: User | null };

interface CompanyActionsProps {
  initialCompanies: CompanyWithOwner[];
  sellers: User[];
}

export default function CompanyActions({ initialCompanies, sellers }: CompanyActionsProps) {
  const [masterCompanyList, setMasterCompanyList] = useState(initialCompanies);
  const [companies, setCompanies] = useState(initialCompanies);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyWithOwner | null>(null);

   // --- Estados para los filtros ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOwnerId, setSelectedOwnerId] = useState("all");

  // --- Efecto para aplicar los filtros cuando cambian ---
  useEffect(() => {
    let filteredCompanies = [...masterCompanyList];

    // 1. Filtrar por propietario (vendedor)
    if (selectedOwnerId === "none") {
      filteredCompanies = filteredCompanies.filter(c => !c.ownerId);
    } else if (selectedOwnerId !== "all") {
      filteredCompanies = filteredCompanies.filter(c => c.ownerId === selectedOwnerId);
    }

    // 2. Filtrar por nombre de compañía
    if (searchQuery.trim() !== "") {
      filteredCompanies = filteredCompanies.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setCompanies(filteredCompanies);
  }, [searchQuery, selectedOwnerId, masterCompanyList]);

  const handleCreate = () => {
    setEditingCompany(null);
    setIsModalOpen(true);
  };

  const handleEdit = (company: CompanyWithOwner) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleDelete = async (companyId: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    try {
      const res = await fetch(`/api/crm/companies/${companyId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete company");

      setMasterCompanyList(current => current.filter(c => c.id !== companyId));
      toast.success("Company deleted successfully.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const onCompanySaved = (company: CompanyWithOwner) => {
    if (editingCompany) {
      setMasterCompanyList(current => current.map(c => c.id === company.id ? company : c));
    } else {
      setMasterCompanyList(current => [company, ...current]);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Companies ({companies.length})</h1>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium">
          <FiPlusCircle />
          Add Company
        </button>
      </div>

      {/* --- Panel de Filtros --- */}
      <div className="mb-6 p-4 bg-gray-900 rounded-lg flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-1/2">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border-gray-700 rounded-md p-2 pl-10 text-white"
          />
        </div>
        <div className="relative w-full md:w-1/2">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={selectedOwnerId}
            onChange={(e) => setSelectedOwnerId(e.target.value)}
            className="w-full bg-gray-800 border-gray-700 rounded-md p-2 pl-10 text-white appearance-none"
          >
            <option value="all">All Owners</option>
            <option value="none">No Owner</option>
            {sellers.map(seller => (
              <option key={seller.id} value={seller.id}>{seller.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Owner</th>
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
                <td className="p-4 text-gray-400">{company.owner?.name || '-'}</td>
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
        sellers={sellers}
      />
    </>
  );
}