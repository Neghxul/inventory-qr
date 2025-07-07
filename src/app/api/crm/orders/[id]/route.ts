// src/app/api/crm/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

// PUT: Actualizar el estado de una orden
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    // Validar que el estado sea uno de los valores permitidos por el enum
    if (!status || !Object.values(OrderStatus).includes(status)) {
        return new NextResponse("Invalid status value", { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`ORDER_UPDATE_ERROR (ID: ${params.id})`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}