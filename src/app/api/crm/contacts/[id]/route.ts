// src/app/api/crm/contacts/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// PUT: Actualizar un contacto
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
    const { firstName, lastName, email, phone, companyId } = body;

    if (!firstName || !lastName) {
      return new NextResponse("First name and last name are required", { status: 400 });
    }

    const updatedContact = await prisma.contact.update({
      where: { id: params.id },
      data: { 
        firstName, 
        lastName, 
        email, 
        phone,
        companyId: companyId || null,
      },
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE: Eliminar un contacto
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.contact.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}