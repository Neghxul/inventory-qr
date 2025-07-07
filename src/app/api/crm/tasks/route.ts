import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";

// POST para crear una tarea
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, dueDate, companyId, assigneeId } = body;

        const task = await prisma.task.create({
            data: {
                title,
                dueDate: dueDate ? new Date(dueDate) : null,
                companyId,
                assigneeId,
            },
            include: { assignee: true }
        });
        return NextResponse.json(task);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// PUT para actualizar una tarea (marcar como completada)
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        const updatedTask = await prisma.task.update({
            where: { id },
            data: { status: status as TaskStatus },
            include: { assignee: true }
        });
        return NextResponse.json(updatedTask);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}