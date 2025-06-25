// src/app/api/users/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Obtener un solo usuario por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT: Actualizar un usuario por ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, role } = body;

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name,
        email,
        role,
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// ... al final de src/app/api/users/[id]/route.ts

// DELETE: Eliminar un usuario por ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Prevenir que un admin se elimine a sí mismo
  if (session.user.id === params.id) {
    return new NextResponse("Admins cannot delete themselves", { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 }); // 204 No Content es estándar para un DELETE exitoso
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}