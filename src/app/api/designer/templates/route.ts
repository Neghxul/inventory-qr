// src/app/api/designer/templates/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import PreviewTable from "@/components/generator/PreviewTable";


export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, width, height, elements, previewImageUrl } = body;

    if (!name || !width || !height) {
      return new NextResponse("Name and dimensions are required", { status: 400 });
    }

    const newTemplate = await prisma.labelTemplate.create({
      data: {
        name,
        width,
        height,
        elements,
        previewImageUrl: previewImageUrl, // Prisma maneja la serialización del JSON automáticamente
      },
    });

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error: any) {
    // Manejar error de nombre único
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        return new NextResponse("A template with this name already exists.", { status: 409 });
    }
    console.error("TEMPLATE_CREATE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

//  --- FUNCION PARA CARGAR TEMPLATE DE ETIQUETA GUARDADAS --- 
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const templates = await prisma.labelTemplate.findMany({
      orderBy: {
        updatedAt: 'desc', // Mostrar las más recientes primero
      },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("GET_TEMPLATES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}