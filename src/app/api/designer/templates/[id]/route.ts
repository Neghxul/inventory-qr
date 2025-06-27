// src/app/api/designer/templates/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// PUT: Actualizar una plantilla existente
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await request.json();
        const { name, width, height, elements, previewImageUrl } = body;

        const updatedTemplate = await prisma.labelTemplate.update({
            where: { id: params.id },
            data: { name, width, height, elements, previewImageUrl }
        });

        return NextResponse.json(updatedTemplate);
    } catch (error: any) {
         if (error.code === 'P2002') {
            return new NextResponse("A template with this name already exists.", { status: 409 });
        }
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// DELETE: Eliminar una plantilla
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        await prisma.labelTemplate.delete({
            where: { id: params.id }
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}