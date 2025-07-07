// src/app/crm/companies/[id]/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"; // [CORRECCIÓN] Usar el cliente de Prisma centralizado
import { FiBriefcase, FiUser, FiPhone, FiGlobe, FiMapPin } from "react-icons/fi";
import { ContactsPanel } from "@/components/crm/ContactsPanel";
import { ActivityFeed } from "@/components/crm/ActivityFeed";

// [CORRECCIÓN] Simplificada para obtener todos los datos necesarios en una sola pasada
async function getCompanyData(id: string) {
  // Obtener la compañía con todas sus relaciones
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { firstName: 'asc' } },
      owner: true,
      notes: { orderBy: { createdAt: 'desc' }, include: { author: true } },
      tasks: { orderBy: { createdAt: 'desc' }, include: { assignee: true } },
      orders: { orderBy: { orderDate: 'desc' } }
    },
  });

  // Obtener todos los usuarios para la lista de asignados en las tareas
  const users = await prisma.user.findMany({ orderBy: { name: 'asc' }});
  const allCompanies = await prisma.company.findMany({ orderBy: { name: 'asc' }});
  return { company, users, allCompanies };
}

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  // [CORRECCIÓN] Destructurar correctamente los datos obtenidos
  const { company, users, allCompanies } = await getCompanyData(params.id);

  if (!company) {
    return <div className="p-8 text-center text-gray-400">Company not found.</div>;
  }

  // Lógica para formatear la dirección (sin cambios)
  const formattedAddress = [
    company.street,
    company.exteriorNumber,
    company.interiorNumber ? `Int. ${company.interiorNumber}` : null,
    company.neighborhood,
    company.municipality,
    company.state,
    company.country,
    company.postalCode,
  ].filter(Boolean).join(', ');

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header de la Compañía (sin cambios) */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="bg-blue-600 p-4 rounded-lg">
                <FiBriefcase size={32} className="text-white"/>
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white">{company.name}</h1>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
                    {company.owner && <p className="flex items-center gap-2"><FiUser/> {company.owner.name}</p>}
                    {company.phone && <p className="flex items-center gap-2"><FiPhone/> {company.phone}</p>}
                    {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400"><FiGlobe/> {company.website}</a>}
                </div>
                {formattedAddress && <p className="flex items-start gap-2 mt-3 text-sm text-gray-400"><FiMapPin className="mt-1 flex-shrink-0"/> {formattedAddress}</p>}
            </div>
        </div>
      </div>

      {/* --- [NUEVO] Layout de 2 Columnas --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Columna Principal (Actividad) */}
        <div className="lg:col-span-2">
          <ActivityFeed
            company={company}
            users={users}
          />
        </div>

        {/* Columna Derecha (Contactos) */}
        <div className="lg:col-span-1">
            <ContactsPanel 
                companyId={company.id}
                initialContacts={company.contacts}
                allCompanies={allCompanies}
            />
        </div>
      </div>

    </div>
  );
}