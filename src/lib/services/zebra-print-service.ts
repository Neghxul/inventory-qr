// src/lib/services/zebra-print-service.ts
/* global Zebra:true */ // Le dice a TypeScript que "Zebra" existirá en el scope global.
import { toast } from 'react-hot-toast';

declare const Zebra: any; // Declaración más explícita para el objeto Zebra

let selectedPrinter: any = null;

// 1. Configurar y seleccionar la impresora por defecto
export const setupZebraPrinter = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      Zebra.Browser.getAvailableDevices((devices: any[]) => {
        if (!devices || devices.length === 0) {
          toast.error("No Zebra printers found. Please check connection and Zebra Browser Print app.");
          return reject("No printers found");
        }
        // Selecciona la primera impresora disponible como la por defecto
        selectedPrinter = devices[0];
        const printerName = selectedPrinter.name;
        toast.success(`Printer selected: ${printerName}`);
        resolve(printerName);
      }, 
      (error: string) => {
        toast.error("Error finding printers: " + error);
        reject(error);
      });
    } catch (e) {
        toast.error("Zebra Browser Print app is not running or not installed.");
        reject("Zebra Browser Print not available");
    }
  });
};

// 2. Enviar el código ZPL a la impresora seleccionada
export const sendZplToPrinter = (zplData: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!selectedPrinter) {
      toast.error("No printer selected. Please set up a printer first.");
      return reject("No printer selected");
    }

    selectedPrinter.send(zplData, 
      () => {
        toast.success("Print job sent successfully!");
        resolve();
      }, 
      (error: string) => {
        toast.error("Error sending print job: " + error);
        reject(error);
      }
    );
  });
};