// src/components/scanner/ScannerCore.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, CameraDevice } from "html5-qrcode";
import { toast } from "react-hot-toast";
import { parseScannedCode } from "@/lib/scannerUtils";
import { ScanData } from "@/types";

interface Props {
  onScanSuccess: (data: ScanData, raw: string) => void;
  sessionId: string;
  torchOn: boolean;
  cameraIndex: number; // Recibe el índice de la cámara a usar
}

export default function ScannerCore({ onScanSuccess, sessionId, torchOn, cameraIndex }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader-core", { verbose: false });
    scannerRef.current = scanner;
    
    Html5Qrcode.getCameras()
      .then(cameras => {
        if (cameras && cameras.length) {
          setDevices(cameras);
        }
      })
      .catch(err => toast.error("Could not get cameras."));

    return () => {
      scannerRef.current?.stop().catch(console.error);
    };
  }, []);

  useEffect(() => {
    const startScan = async () => {
      if (!scannerRef.current || devices.length === 0) return;
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop().catch(console.error);
      }
      
      const deviceId = devices[cameraIndex % devices.length].id;
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        videoConstraints: { deviceId, facingMode: 'environment', torch: torchOn },
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
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to save scan");
            }
            const saved = await res.json();
            onScanSuccess(saved, decodedText);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setTimeout(() => scannerRef.current?.resume(), 1500);
        }
      };

      scannerRef.current.start({ deviceId: { exact: deviceId } }, config, successCallback, undefined)
        .catch(err => {
            if (String(err).includes('torch')) {
                toast.error("Flashlight not available on this camera.");
            }
        });
    };

    startScan();
  }, [cameraIndex, torchOn, devices, sessionId, onScanSuccess]);

  // Este componente ahora renderiza solo el contenedor para la cámara
  return <div id="reader-core" className="w-full h-full" />;
}