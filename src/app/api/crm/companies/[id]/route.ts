// src/app/api/crm/companies/[id]/route.ts

import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Obtener una compañía por su ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Leer parametros de la URL, como '?include=orders'
  const searchParams = request.nextUrl.searchParams;
  const includeOrders = searchParams.get('include') === 'orders';

  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        orders: includeOrders,
      }
    });

    if (!company) {
      return new NextResponse("Company not found", { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
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
    const {
        name, phone, website,
        street, exteriorNumber, interiorNumber, neighborhood,
        municipality, state, country, postalCode, ownerId
    } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: {
        name, phone, website,
        street, exteriorNumber, interiorNumber, neighborhood,
        municipality, state, country, postalCode,
        ownerId: ownerId || null,
       },
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