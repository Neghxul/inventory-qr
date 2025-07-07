// src/app/api/crm/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Obtener todas las órdenes
export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                company: { select: { name: true } },
                contact: { select: { firstName: true, lastName: true } },
            },
            orderBy: { orderDate: 'desc' },
        });
        return NextResponse.json(orders);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// POST: Crear una nueva orden (simplificado)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { companyId, contactId, rev, invoiceNumber, lineItems } = body;

        // --- Validación de Datos Esenciales ---
        if (!companyId || !contactId || !Array.isArray(lineItems) || lineItems.length === 0) {
            return new NextResponse("Missing required fields: company, contact, or line items.", { status: 400 });
        }

        const company = await prisma.company.findUnique({ where: { id: companyId }});
        if (!company) {
            return new NextResponse("Company not found", { status: 404 })
        };

        const sellerId = company.ownerId;

        const totalAmount = lineItems.reduce((sum: number, item: any) => {
            return sum + (Number(item.quantity || 0) * Number(item.unitCost || 0));
        }, 0)

        // Generar un número de orden único
        const orderNumber = `ORD-${Date.now()}`;
        const orderDate = new Date();

        const order = await prisma.order.create({
            data: {
                orderNumber,
                orderDate,
                totalAmount,
                companyId,
                contactId,
                sellerId: sellerId || null,
                rev,
                invoiceNumber,
                lineItems: {
                    create: lineItems.map((item: any) => ({
                        sku: item.code,
                        description: item.description,
                        quantity: parseInt(item.quantity, 10) || 0,
                        unitCost: parseFloat(item.unitCost) || 0,
                        oc: item.purchaseOrder
                    }))
                } 
            }
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("ORDER_CREATE_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}