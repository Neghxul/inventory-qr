// src/app/designer/templates/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FiPlusCircle, FiEdit, FiPrinter, FiTrash2 } from "react-icons/fi";
import { LabelTemplate } from "@prisma/client";
import TemplateGallery from '@/components/designer/TemplateGallery';

async function getTemplates() {
  // Por ahora, obtenemos los datos directamente en el servidor.
  // Más adelante podríamos hacerlo en un componente cliente.
  const templates = await prisma.labelTemplate.findMany({
    orderBy: { updatedAt: 'desc' },
  });
  return templates;
}

export default async function TemplatesListPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  const templates = await getTemplates();

  return (
    <div className="max-w-6xl mx-auto">
      <TemplateGallery initialTemplates={templates} />
    </div>
  );
}