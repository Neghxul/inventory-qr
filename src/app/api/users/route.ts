// src/app/api/users/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // 1. Proteger el endpoint
  if (!session || session.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. Obtener todos los usuarios de la base de datos
    const users = await prisma.user.findMany({
      // Opcional: ordenar por fecha de creación
      orderBy: {
        createdAt: 'desc'
      },
      // Opcional: no devolver el hash de la contraseña
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET_USERS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}