// src/app/api/dashboard/sales-by-seller/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfMonth, startOfWeek } from 'date-fns'; // Librería para manejar fechas


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const period = searchParams.get('period') || 'last30days'; // Por defecto, últimos 30 días

        // --- [NUEVO] Lógica para determinar el rango de fechas ---
        let startDate: Date;
        const now = new Date();

        switch (period) {
            case 'thisWeek':
                startDate = startOfWeek(now, { weekStartsOn: 1 }); // Lunes
                break;
            case 'lastWeek':
                startDate = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
                break;
            case 'thisMonth':
                startDate = startOfMonth(now);
                break;
            case 'lastMonth':
                startDate = startOfMonth(subDays(now, 30));
                break;
            case 'last60days':
                startDate = subDays(now, 60);
                break;
            case 'last90days':
                startDate = subDays(now, 90);
                break;
            case 'last180days':
                startDate = subDays(now, 180);
                break;
            default: // last30days
                startDate = subDays(now, 30);
                break;
        }
        
        const salesData = await prisma.order.groupBy({
            by: ['sellerId', 'orderDate'],
            _sum: {
                totalAmount: true,
            },
            where: {
                sellerId: {
                    not: null, // Solo órdenes con vendedor asignado
                },
            },
        });

        const sellers = await prisma.user.findMany({
            where: {
                id: {
                    in: salesData.map(d => d.sellerId!)
                }
            },
            select: { id: true, name: true }
        });
        const sellerMap = new Map(sellers.map(s => [s.id, s.name || 'Unknown']));

        // Agrupar por mes y formato para la gráfica
        const monthlySales: { [date: string]: { [seller: string]: number } } = {};

        salesData.forEach(item => {
            const date = new Date(item.orderDate);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const sellerName = sellerMap.get(item.sellerId!)!;

            if (!monthlySales[month]) {
                monthlySales[month] = {};
            }
            if (!monthlySales[month][sellerName]) {
                monthlySales[month][sellerName] = 0;
            }
            monthlySales[month][sellerName] += item._sum.totalAmount || 0;
        });
        
        // Convertir a un array de objetos que Recharts puede usar
        const chartData = Object.entries(monthlySales).map(([date, sellers]) => ({
            date,
            ...sellers
        })).sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json({ chartData, sellerNames: Array.from(sellerMap.values()) });

    } catch (error) {
        console.error("DASHBOARD_DATA_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}