// src/app/crm/contacts/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import ContactActions from "@/components/crm/ContactActions";


const prisma = new PrismaClient();

// Obtenemos tanto los contactos como las compañías para pasarlos al cliente
async function getData() {
    const contacts = await prisma.contact.findMany({
        orderBy: { firstName: 'asc' },
        include: { company: true },
    });
    const companies = await prisma.company.findMany({
        orderBy: { name: 'asc' },
    });
    return { contacts, companies };
}

export default async function ContactsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  const { contacts, companies } = await getData();

  return <ContactActions initialContacts={contacts} companies={companies} />;
}