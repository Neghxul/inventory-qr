import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json();
        const { content, companyId } = body;

        if (!content || !companyId) {
            return new NextResponse("Missing content or company ID", { status: 400 });
        }

        const note = await prisma.note.create({
            data: {
                content,
                companyId,
                authorId: session.user.id,
            },
            include: { 
                author: true, 
            }
        });

        return NextResponse.json(note);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}