// src/app/admin/users/new/page.tsx - (Debería funcionar ahora)

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CreateUserForm from "@/components/auth/CreateUserForm";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function CreateUserPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    redirect("/?error=unauthorized");
  }

  return (
    <div className="max-w-xl mx-auto bg-gray-900 p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Create New User</h1>
      <CreateUserForm />
    </div>
  );
}