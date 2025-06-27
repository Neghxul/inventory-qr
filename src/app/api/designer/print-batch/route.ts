// src/app/api/designer/print-batch/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DesignerElement } from '@/components/designer/Designer'; // Reutilizaremos el tipo

async function generateBatchZpl(templateId: string, data: any[], mapping: Record<string, string>): Promise<string> {
    const template = await prisma.labelTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new Error("Template not found");

    const elements = template.elements as any as DesignerElement[];
    let fullZpl = "";

    for (const row of data) {
        let labelZpl = `^XA^PW${template.width * 8}^LL${template.height * 8}`; // Conversión simple mm a dots

        for (const el of elements) {
            let content = (el.props as any).placeholder || (el.props as any).content || '';

            // Reemplazar placeholders
            for (const appField in mapping) {
                const excelHeader = mapping[appField];
                const placeholder = `{${appField.toLowerCase()}}`;
                if (content.includes(placeholder)) {
                    content = content.replace(new RegExp(placeholder, 'g'), row[excelHeader] || '');
                }
            }

            // Aquí iría la lógica compleja para convertir cada tipo de elemento a ZPL
            // Por ahora, solo añadiremos texto como demostración
            if (el.type === 'text') {
                const textProps = el.props as any;
                labelZpl += `^FO${el.x},${el.y}^A0N,${textProps.fontSize * 1.5},${textProps.fontSize * 1.5}^FD${content}^FS`;
            }
        }

        labelZpl += "^XZ";
        fullZpl += labelZpl;
    }

    return fullZpl;
}

export async function POST(request: Request) {
    try {
        const { templateId, data, mapping } = await request.json();
        if (!templateId || !data || !mapping) {
            return new NextResponse("Missing data", { status: 400 });
        }

        const zplData = await generateBatchZpl(templateId, data, mapping);

        return new Response(zplData, { headers: { 'Content-Type': 'text/plain' } });

    } catch (error: any) {
        return new NextResponse(error.message, { status: 500 });
    }
}