// src/app/crm/orders/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { OrderActions } from "@/components/crm/orders/OrderActions";
import { Role } from "@prisma/client";


async function getData() {
    const orders = await prisma.order.findMany({
        include: {
            company: { select: { name: true } },
            contact: { select: { firstName: true, lastName: true } },
        },
        orderBy: { orderDate: 'desc' },
    });
    // Necesitamos compañías y contactos para el formulario de nueva orden
    const companies = await prisma.company.findMany({ 
        orderBy: { name: 'asc' },
        include: { owner: true }
    });
    const contacts = await prisma.contact.findMany({ orderBy: { lastName: 'asc' }});
    const sellers = await prisma.user.findMany({ where: { role: Role.SELLER}})

    return { orders, companies, contacts, sellers };
}

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");

    const { orders, companies, contacts, sellers } = await getData();

    return <OrderActions initialOrders={orders} companies={companies} contacts={contacts} sellers={sellers} />;
}