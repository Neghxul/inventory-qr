// src/app/api/crm/companies/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Obtener una compañía por su ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
    // ... (lógica similar para obtener una compañía, si fuera necesario)
}

// PUT: Actualizar una compañía
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, address, phone, website } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: { name, address, phone, website },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE: Eliminar una compañía
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.company.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}