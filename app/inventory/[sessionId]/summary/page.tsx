import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const all = await prisma.inventoryItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(all);
  } catch {
    return NextResponse.json({ error: "Error fetching inventory" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      code,
      clave,
      pedimento,
      descripcion,
      linea,
      estante,
      posicion,
      codificado,
      tipo,
    } = body;

    if (!clave || !pedimento) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const existing = await prisma.inventoryItem.findFirst({
      where: { clave, pedimento },
    });

    if (existing) {
      return NextResponse.json({ error: "Duplicate" }, { status: 409 });
    }

    const created = await prisma.inventoryItem.create({
      data: {
        code,
        clave,
        pedimento,
        descripcion: descripcion || "",
        linea: linea || "",
        estante: estante || "",
        posicion: posicion || "",
        codificado: codificado || "",
        tipo: tipo || "",
      },
    });

    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "Failed to save scan" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const deleted = await prisma.inventoryItem.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json(deleted);
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
