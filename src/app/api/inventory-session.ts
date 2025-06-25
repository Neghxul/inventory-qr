import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessions = await prisma.inventorySession.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    const session = await prisma.inventorySession.create({
      data: { name },
    });
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
