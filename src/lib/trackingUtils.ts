// src/lib/trackingUtils.ts

export function getTrackingUrl(carrier: string, trackingNumber: string): string | null {
    if (!carrier || !trackingNumber) return null;

    const formattedCarrier = carrier.toLowerCase();

    if (formattedCarrier.includes('fedex')) {
        return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
    }
    if (formattedCarrier.includes('ups')) {
        return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    }
    if (formattedCarrier.includes('dhl')) {
        return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
    }
    if (formattedCarrier.includes('estafeta')) {
        return `https://www.estafeta.com/Herramientas/Rastreo?search_type=reference&waybill_list=${trackingNumber}`;
    }
    if (formattedCarrier.includes('paquetexpress')) {
        return `https://www.paquetexpress.com.mx/rastreo/${trackingNumber}`;
    }
    if (formattedCarrier.includes('castores')) {
        // Castores usa un portal que requiere más que solo el número de guía,
        // pero este es el enlace general a su página de rastreo.
        return `https://www.castores.com.mx/rastreo`;
    }
    
    return null; // Si no se encuentra una paquetería conocida
}