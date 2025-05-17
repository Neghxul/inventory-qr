"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, CameraDevice } from "html5-qrcode";
import { FiZap, FiCamera } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { parseScannedCode } from "@/lib/scannerUtils";
import { ScanData } from "@/types";

interface Props {
  onScanSuccess: (data: ScanData, raw: string) => void;
}

export default function ScannerCore({ onScanSuccess }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraIndex, setCameraIndex] = useState(0);
  const [devices, setDevices] = useState<CameraDevice[]>([]);

  const startScanner = async () => {
    try {
      // Inicializar o reutilizar el escáner
      const scanner = scannerRef.current ?? new Html5Qrcode("reader");
      scannerRef.current = scanner;

      // Obtener cámaras
      const cams = devices.length ? devices : await Html5Qrcode.getCameras();
      if (!devices.length) setDevices(cams as CameraDevice[]);
      const device = cams[cameraIndex];
      if (!device) throw new Error("No camera found");

      // Configuración casteada a any para incluir experimentalFeatures
      const config: any = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        videoConstraints: {
          facingMode: "environment",
          ...(torchOn ? { advanced: [{ torch: true }] } : {}),
        },
      };

      await scanner.start(
        { deviceId: { exact: device.id } },
        config,
        async (decodedText: string) => {
          const parsed = await parseScannedCode(decodedText);
          if (!parsed) return;
          try {
            const res = await fetch("/api/inventory", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(parsed),
            });
            if (res.status === 409) {
              toast("Already scanned", { icon: "⚠️" });
            } else if (!res.ok) {
              throw new Error();
            } else {
              const saved = await res.json();
              onScanSuccess(saved, decodedText);
              toast.success("Scan saved");
            }
          } catch {
            toast.error("Error saving scan");
          }
        },
        (_error) => {
          // scan failure callback opcional
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to start scanner");
    }
  };

  const stopScanner = async () => {
    try {
      await scannerRef.current?.stop();
      await scannerRef.current?.clear();
    } catch (e) {
      console.warn("Error stopping scanner", e);
    }
    setIsScanning(false);
  };

  const toggleTorch = () => {
    setTorchOn((prev) => !prev);
  };

  const switchCamera = () => {
    setCameraIndex((prev) =>
      devices.length ? (prev + 1) % devices.length : 0
    );
  };

  // Reinicia el escáner cuando cambian cámara o flash
  useEffect(() => {
    if (isScanning) {
      stopScanner().then(startScanner);
    } else {
      startScanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraIndex, torchOn]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-xl">
      <div id="reader" className="w-full h-64 bg-black" />
      <div className="flex justify-center gap-6 mt-4">
        <button
          onClick={toggleTorch}
          className="text-yellow-400 text-2xl"
          title={torchOn ? "Turn off flash" : "Turn on flash"}
        >
          <FiZap />
        </button>
        <button
          onClick={switchCamera}
          className="text-blue-400 text-2xl"
          title="Switch Camera"
        >
          <FiCamera />
        </button>
      </div>
    </div>
  );
}
