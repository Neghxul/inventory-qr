// src/app/api/labels/print/route.ts

import { NextResponse } from "next/server";
import QRCode from 'qrcode';

// Función para generar una plantilla de etiqueta ZPL
async function generateZpl(item: { key: string, description: string, pedimento: string, year: string }) {
    const { key, description, pedimento, year } = item;

    // 1. Generar el código de barras (CODE-128)
    // ^BY3,2,100: Ancho del módulo, ratio, altura de la barra (100 dots)
    // ^BCN,,Y,N: Código de barras CODE-128, orientación Normal, sí mostrar texto, no usar check digit
    const barcodeZpl = `^FO50,50^BY3,2,100^BCN,,Y,N^FD${key}-<span class="math-inline">\{year\}</span>{pedimento}^FS`;

    // 2. Generar el QR Code como una imagen hexadecimal (formato GRF)
    // `toBuffer` es más eficiente para esto que toDataURL
    const qrBuffer = await QRCode.toBuffer(
        `<span class="math-inline">\{key\}/</span>{year}<span class="math-inline">\{pedimento\}/</span>{description}`, 
        { errorCorrectionLevel: 'M', width: 200 }
    );
    const qrHex = qrBuffer.toString('hex');
    const bytesPerRow = Math.ceil(200 / 8); // 200 es el ancho del QR
    const totalBytes = qrHex.length / 2;

    const qrImageZpl = `^FO350,180^GFA,<span class="math-inline">\{totalBytes\},</span>{totalBytes},<span class="math-inline">\{bytesPerRow\},</span>{qrHex}^FS`;

    // 3. Textos adicionales
    const descriptionText = `^FO50,180^A0N,28,28^FDDescription: ${description.substring(0, 30)}^FS`;
    const pedimentoText = `^FO50,220^A0N,28,28^FDPedimento: <span class="math-inline">\{year\}</span>{pedimento}^FS`;
    const keyText = `^FO50,260^A0N,28,28^FDKey: ${key}^FS`;

    // 4. Ensamblar la etiqueta completa (ejemplo para una etiqueta de 4x2 pulgadas a 203dpi)
    // ^XA: Inicio de la etiqueta
    // ^PW812: Ancho de la etiqueta en dots (4 pulgadas * 203 dpi)
    // ^LL406: Largo de la etiqueta en dots (2 pulgadas * 203 dpi)
    // ^XZ: Fin de la etiqueta
    const fullZpl = `
    ^XA
    ^PW812
    ^LL406
    ${barcodeZpl}
    ${descriptionText}
    ${pedimentoText}
    ${keyText}
    ${qrImageZpl}
    ^XZ
    `;

    return fullZpl.replace(/\s+/g, ''); // Limpiar espacios en blanco
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { item } = body;

    if (!item || !item.key || !item.description || !item.pedimento || !item.year) {
      return new NextResponse("Missing required item data", { status: 400 });
    }

    const zplData = await generateZpl(item);

    return new Response(zplData, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error("ZPL_GENERATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}