// src/app/crm/companies/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import  { Role, User } from "@prisma/client"
import CompanyActions from "@/components/crm/CompanyActions";

const prisma = new PrismaClient();

async function getCompanies() {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      include: { owner: true}
    });

    const sellers = await prisma.user.findMany({
      where: { role: Role.SELLER },
      orderBy: { name: 'asc' },
    })

    return { companies, sellers };
}

export default async function CompaniesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  const { companies, sellers } = await getCompanies();

  return <CompanyActions initialCompanies={companies} sellers={sellers} />;
}