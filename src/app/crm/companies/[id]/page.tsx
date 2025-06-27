// src/app/crm/companies/[id]/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { FiBriefcase, FiMail, FiPhone, FiGlobe, FiMapPin, FiUsers } from "react-icons/fi";
import CompanyDetailActions from '@/components/crm/CompanyDetailActions';
import Link from "next/link";

const prisma = new PrismaClient();

async function getCompanyDetails(id: string) {
  const company = await prisma.company.findUnique({
    where: { id },
    // La magia está aquí: incluimos los contactos relacionados
    include: {
      contacts: {
        orderBy: {
          firstName: 'asc'
        }
      },
    },
  });
  const allCompanies = await prisma.company.findMany({ orderBy: { name: 'asc' }});
  return {company, allCompanies};
}

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  const { company, allCompanies } = await getCompanyDetails(params.id);

  if (!company) {
    return <div className="p-8 text-center text-gray-400">Company not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header de la Compañía */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="bg-blue-600 p-4 rounded-lg">
                <FiBriefcase size={32} className="text-white"/>
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white">{company.name}</h1>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
                    {company.phone && <p className="flex items-center gap-2"><FiPhone/> {company.phone}</p>}
                    {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400"><FiGlobe/> {company.website}</a>}
                    {company.address && <p className="flex items-center gap-2"><FiMapPin/> {company.address}</p>}
                </div>
            </div>
        </div>
      </div>

      {/* Panel de Contactos Asociados */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
        <CompanyDetailActions company={company} companies={allCompanies} />
        
      </div>
    </div>
  );
}