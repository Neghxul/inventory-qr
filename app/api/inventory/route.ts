// app/api/inventory/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: "Error fetching inventory" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      sessionId,
      key,
      year,
      pedimento,
      description,
      line,
      shelf,
      position,
      quantity,
      encoded,
      type: itemType,
    } = await req.json();

    // Validaciones mínimas
    if (!sessionId || !key || !year || !pedimento) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Evitar duplicados por sesión+clave
    const existing = await prisma.inventoryItem.findUnique({
      where: { sessionId_key: { sessionId, key } },
    });
    if (existing) {
      return NextResponse.json({ error: "Duplicate item" }, { status: 409 });
    }

    // Crear nuevo registro
    const created = await prisma.inventoryItem.create({
      data: {
        sessionId,
        key,
        year,
        pedimento,
        description: description || "",
        line: line || "",
        shelf: shelf || "",
        position: position || "",
        quantity: quantity ?? 0,
        encoded: encoded ?? false,
        stock: null,
        type: itemType || "",
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("Error saving inventory item:", error);
    return NextResponse.json({ error: "Failed to save scan" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    await prisma.inventoryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
