// src/app/admin/users/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import UserActions from "@/components/admin/UserActions";

const prisma = new PrismaClient();

async function getUsers() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    return users;
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    redirect("/?error=unauthorized");
  }
  const users = await getUsers();

  return <UserActions users={users} />;
}