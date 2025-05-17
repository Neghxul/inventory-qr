import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const created = await prisma.scanLog.create({ data });
    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const logs = await prisma.scanLog.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(logs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
