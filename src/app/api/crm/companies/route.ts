// src/app/api/crm/companies/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Obtener todas las compañías
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(companies);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST: Crear una nueva compañía
export async function POST(request: Request) {
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

    const company = await prisma.company.create({
      data: {
        name, phone, website,
        street, exteriorNumber, interiorNumber, neighborhood,
        municipality, state, country, postalCode,
        ownerId: ownerId || null, 
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}