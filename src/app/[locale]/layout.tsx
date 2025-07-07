// src/app/layout.tsx

import "@/app/globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import AppLayout from "@/components/layout/AppLayout";
import Script from "next/script";
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "QR & Inventory App",
  description: "Professional code scanner and inventory sessions",
};

type Props = {
  children: ReactNode
  params: Promise<{ locale: string}>
}

export default async function RootLayout({ children, params}: Props) {
  const {locale} = await params

  return (
    <html lang={locale}>
      <body className="bg-gray-900 text-white">
        <NextIntlClientProvider locale={locale}>
          <Providers>
            <AppLayout>{children}</AppLayout>
          </Providers>
          {/* SDK de Zebra Browser Print con la URL corregida */}
          <Script 
            src="http://127.0.0.1:9100/js/BrowserPrint-3.1.250.min.js" 
            strategy="beforeInteractive"
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}