import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const all = await prisma.inventoryItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(all);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      key,
      year,
      pedimento,
      description,
      line,
      shelf,
      position,
      quantity,
      encoded,
      type,
    } = body;

    const exists = await prisma.inventoryItem.findFirst({
      where: { key, year, pedimento },
    });

    if (exists) {
      return NextResponse.json(exists, { status: 409 });
    }

    const saved = await prisma.inventoryItem.create({
      data: {
        key,
        year,
        pedimento,
        description,
        line,
        shelf,
        position,
        quantity,
        encoded,
        type,
      },
    });
    return NextResponse.json(saved);
  } catch (e) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split("/").pop());
    await prisma.inventoryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
