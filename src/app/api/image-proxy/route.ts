// src/app/api/image-proxy/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new NextResponse('Image URL is required', { status: 400 });
    }

    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/png';

        // Convertir a Data URL
        const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;

        return NextResponse.json({ dataUrl });
    } catch (error) {
        console.error("IMAGE_PROXY_ERROR", error);
        return new NextResponse('Could not process image', { status: 500 });
    }
}