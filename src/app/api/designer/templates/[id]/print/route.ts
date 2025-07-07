// src/app/api/designer/templates/[id]/print/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DesignerElement } from '@/components/designer/Designer';

const mmToDots = (mm: number) => Math.round((mm / 25.4) * 203);

async function generateSingleZpl(templateId: string, data: Record<string, string>): Promise<string> {
    const template = await prisma.labelTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new Error("Template not found");

    const elements = template.elements as any as DesignerElement[];
    const templateWidthDots = mmToDots(template.width);
    const templateHeightDots = mmToDots(template.height);

    let labelZpl = `^XA^PW${templateWidthDots}^LL${templateHeightDots}`;

    for (const el of elements) {
        const replacePlaceholders = (content: string) => {
            let result = content;
            for (const key in data) {
                result = result.replace(new RegExp(`{${key}}`, 'gi'), data[key]);
            }
            return result;
        };

        const xPos = el.x;
        const yPos = el.y;

        switch (el.type) {
            case 'text':
                const textProps = el.props as any;
                const textContent = replacePlaceholders(textProps.dataField || '');
                const fontSize = textProps.fontSize || 14;
                labelZpl += `^FO${xPos},${yPos}^A0N,${Math.round(fontSize * 1.5)},${Math.round(fontSize * 1.5)}^FD${textContent}^FS`;
                break;

            case 'qr':
                const qrProps = el.props as any;
                const qrContent = replacePlaceholders(qrProps.formatString || '');
                const finalQrContent = qrProps.isEncoded ? Buffer.from(qrContent).toString('base64') : qrContent;
                labelZpl += `^FO${xPos},${yPos}^BQN,2,5^FDLA,${finalQrContent}^FS`;
                break;

            case 'barcode':
                const barcodeProps = el.props as any;
                const barcodeContent = replacePlaceholders(barcodeProps.dataFieldString || '');
                const barcodeHeight = el.height > 10 ? el.height - 10 : 50;
                labelZpl += `^FO${xPos},${yPos}^BCN,${barcodeHeight},Y,N,N^FD${barcodeContent}^FS`;
                break;
        }
    }

    labelZpl += "^XZ";
    return labelZpl;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { data } = body;

        if (!params.id || !data) {
            return new NextResponse("Missing template ID or test data", { status: 400 });
        }

        const zplData = await generateSingleZpl(params.id, data);

        return new Response(zplData, {
            status: 200,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error: any) {
        console.error("ZPL Generation Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}