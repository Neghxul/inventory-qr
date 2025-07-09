// src/app/api/crm/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

// PUT: Actualizar el estado de una orden
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  const userRole = session?.user?.role;
  const canFulfillOrders = userRole === Role.ADMIN || userRole === Role.WAREHOUSE;

  try {
    const body = await request.json();
    const { status, shippingCarrier, trackingNumber } = body;
    
    let dataToUpdate: any = {};

    if (status && Object.values(OrderStatus).includes(status)) {
        dataToUpdate.status = status;
    }

    if (shippingCarrier !== undefined && trackingNumber !== undefined) {
      if (!canFulfillOrders) {
        return new NextResponse("Forbidden: You don't have permission to update shipping info.", { status: 403 });
      }
      dataToUpdate.shippingCarrier = shippingCarrier;
      dataToUpdate.trackingNumber = trackingNumber;
      // --- [CAMBIO CLAVE] ---
      // Si se está guardando una guía, se cambia el estado a SHIPPED automáticamente.
      dataToUpdate.status = OrderStatus.SHIPPED;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return new NextResponse("No valid fields to update.", { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`ORDER_UPDATE_ERROR (ID: ${params.id})`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}