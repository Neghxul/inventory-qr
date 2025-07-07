// src/app/api/crm/companies/[id]/contacts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contacts = await prisma.contact.findMany({
      where: { companyId: params.id },
      orderBy: { firstName: 'asc' },
    });
    return NextResponse.json(contacts);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}