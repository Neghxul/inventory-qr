import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  try {
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const items = await prisma.inventoryItem.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { sessionId, key } = data;

    // Validar si ya existe ese key dentro de la sesión
    const exists = await prisma.inventoryItem.findUnique({
      where: {
        sessionId_key: {
          sessionId,
          key,
        },
      },
    });

    if (exists) {
      return NextResponse.json({ error: "Item already exists in session" }, { status: 409 });
    }

    // Buscar stock si existe
    const stockRecord = await prisma.stockItem.findUnique({
      where: { key },
    });

    const created = await prisma.inventoryItem.create({
      data: {
        ...data,
        stock: stockRecord?.stock ?? null,
      },
    });

    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, quantity } = await req.json();
    if (!id || quantity === undefined) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: { quantity },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update quantity" }, { status: 500 });
  }
}
