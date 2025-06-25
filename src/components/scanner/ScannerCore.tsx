// src/components/scanner/ScannerCore.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, CameraDevice, Html5QrcodeScannerState } from "html5-qrcode";
import { FiZap, FiCamera } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { parseScannedCode } from "@/lib/scannerUtils";
import { ScanData } from "@/types";

interface Props {
  onScanSuccess: (data: ScanData, raw: string) => void;
  sessionId: string;
}

export default function ScannerCore({ onScanSuccess, sessionId }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [cameraIndex, setCameraIndex] = useState(0);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    // Inicializar el escáner una sola vez
    const scanner = new Html5Qrcode("reader", { verbose: false });
    scannerRef.current = scanner;

    Html5Qrcode.getCameras()
      .then(setDevices)
      .catch(err => toast.error("Could not get cameras."));

    return () => {
      // Limpiar al desmontar
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);
  
  useEffect(() => {
    // Función para (re)iniciar el escaneo cuando cambian las dependencias
    const startScan = async () => {
        if (!scannerRef.current || devices.length === 0) return;
        
        // Detener cualquier escaneo previo
        if (scannerRef.current.isScanning) {
            await scannerRef.current.stop().catch(console.error);
        }

        const deviceId = devices[cameraIndex].id;
        
        // CORRECCIÓN FINAL: La configuración de video correcta
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            videoConstraints: {
                deviceId: { exact: deviceId },
                facingMode: 'environment',
                torch: torchOn, // <-- La forma correcta de pasar la linterna
            },
        };

        const successCallback = async (decodedText: string) => {
            if (!scannerRef.current) return;
            scannerRef.current.pause(true);

            const parsed = await parseScannedCode(decodedText);
            if (!parsed) {
                toast.error("Invalid code format");
                setTimeout(() => scannerRef.current?.resume(), 1000);
                return;
            }

            const dataToSend = { ...parsed, sessionId };
            
            try {
                const res = await fetch("/api/inventory", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataToSend),
                });
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(errorText || "Failed to save scan");
                }
                const saved = await res.json();
                onScanSuccess(saved, decodedText);
            } catch (error: any) {
                const errorMessage = error.message.includes("409") ? "Already scanned" : error.message;
                toast.error(errorMessage);
            } finally {
                setTimeout(() => scannerRef.current?.resume(), 1500);
            }
        };

        scannerRef.current.start(
            { deviceId: { exact: deviceId } },
            config,
            successCallback,
            (errorMessage) => { /* Ignorar errores */ }
        ).catch(err => {
            // A veces el torch no es soportado, intentamos de nuevo sin él
            if (String(err).includes('torch')) {
                toast.error("Flashlight not available on this camera.");
                setTorchOn(false); // Desactivamos para el próximo re-render
            } else {
                toast.error("Failed to start camera.");
            }
        });
    };

    startScan();
  }, [cameraIndex, torchOn, devices, sessionId, onScanSuccess]);

  const switchCamera = () => {
    setCameraIndex(prev => (prev + 1) % devices.length);
  };
  
  return (
    <div className="bg-gray-800 p-4 rounded-xl">
      <div id="reader" className="w-full h-64 bg-black rounded" />
      <div className="flex justify-center gap-6 mt-4">
        <button
          onClick={() => setTorchOn(prev => !prev)}
          className={`text-2xl p-2 rounded-full transition-colors ${torchOn ? 'bg-yellow-400 text-gray-900' : 'text-yellow-400 hover:bg-gray-700'}`}
          title={torchOn ? "Turn off flash" : "Turn on flash"}
        >
          <FiZap />
        </button>
        <button
          onClick={switchCamera}
          disabled={devices.length < 2}
          className="text-blue-400 text-2xl p-2 rounded-full hover:bg-gray-700 disabled:text-gray-600 disabled:cursor-not-allowed"
          title="Switch Camera"
        >
          <FiCamera />
        </button>
      </div>
    </div>
  );
}