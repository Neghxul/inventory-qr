// src/app/api/crm/contacts/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Obtener todos los contactos
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { firstName: 'asc' },
      // Incluimos la información de la compañía a la que pertenecen
      include: {
        company: true, 
      },
    });
    return NextResponse.json(contacts);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST: Crear un nuevo contacto
export async function POST(request: Request) {
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

    const contact = await prisma.contact.create({
      data: { 
        firstName, 
        lastName, 
        email, 
        phone,
        // Si se proporciona un companyId, se conecta la relación
        companyId: companyId || null,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("CONTACT_CREATE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}