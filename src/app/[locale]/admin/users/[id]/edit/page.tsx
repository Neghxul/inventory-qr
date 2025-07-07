// src/app/admin/users/[id]/edit/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient, User } from "@prisma/client";
import EditUserForm from "@/components/auth/EditUserForm";

const prisma = new PrismaClient();

async function getUser(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
  } catch (error) {
    return null;
  }
}

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    redirect("/?error=unauthorized");
  }

  const user = await getUser(params.id);

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-xl mx-auto bg-gray-900 p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Edit User</h1>
      {/* Pasamos el usuario al formulario para pre-rellenar los campos */}
      <EditUserForm user={user} />
    </div>
  );
}