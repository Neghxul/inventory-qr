"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { FiZap, FiZapOff, FiCamera } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { parseScannedCode } from "@/lib/scannerUtils";
import { ScanData } from "@/types";

interface Props {
  onScanSuccess: (data: ScanData, raw: string) => void;
}

type ExtendedConstraints = MediaTrackConstraints & {
  advanced: { torch: boolean }[];
};


export default function ScannerCore({ onScanSuccess }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [cameraIndex, setCameraIndex] = useState(0);

  const startScanner = async () => {
    if (scannerRef.current) return;
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;
    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices.length) throw new Error("No cameras found");
      setCameras(devices);

      await scanner.start(
        { deviceId: { exact: devices[cameraIndex].id } },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          videoConstraints: {
            facingMode: "environment",
            advanced: torchOn ? [{ torch: true }] : [],
          } as ExtendedConstraints,
        },
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
              return;
            }
            if (!res.ok) throw new Error();
            const saved = await res.json();
            onScanSuccess(saved, decodedText);
            toast.success("Scan saved");
            stopScanner();
          } catch {
            toast.error("Error saving scan");
          }
        },
        () => {}
      );

      setIsScanning(true);
    } catch (err) {
      toast.error("Failed to start scanner");
    }
  };

  const stopScanner = async () => {
    try {
      await scannerRef.current?.stop();
      await scannerRef.current?.clear();
      setIsScanning(false);
    } catch (e) {
      toast.error("Error stopping scanner");
    }
  };

  const toggleTorch = async () => {
    if (scannerRef.current) return;
    try {
      const stream = (document.querySelector("video") as HTMLVideoElement)?.srcObject as MediaStream;
      const track = stream?.getVideoTracks?.()[0];
      if (!track) return toast.error("No video track found");
      const capabilities = track.getCapabilities?.();
      if (!(capabilities as any)?.torch) return toast.error("Torch not supported");

      await track.applyConstraints({ advanced: [{ torch: !torchOn }]  } as ExtendedConstraints) ;
      setTorchOn(!torchOn);
    } catch {
      toast.error("Torch not available on this device");
    }
  };
  /*const toggleTorch = async () => {
    try {
      type ExtendedConstraints = MediaTrackConstraints & {
  advanced: { torch: boolean }[];
};

      setTorchOn((prev) => !prev);
    } catch {
      toast.error("Torch not supported");
    }
  };*/

  const switchCamera = () => {
    const next = (cameraIndex + 1) % cameras.length;
    setCameraIndex(next);
    stopScanner().then(() => setTimeout(startScanner, 300));
  };

  useEffect(() => {
    startScanner();
    return () => { stopScanner(); };
  }, [cameraIndex]);

  return (
    <div className="bg-gray-800 p-4 rounded-xl">
      <div className="w-full h-[300px]" id="reader" />

      <div className="flex justify-center gap-6 mt-4">
        <button
          onClick={toggleTorch}
          className="text-yellow-400 text-2xl"
          title="Toggle Flash"
        >
          {torchOn ? <FiZap /> : <FiZapOff />}
        </button>
        <button
          onClick={switchCamera}
          className="text-blue-400 text-2xl"
          title="Switch Camera"
        >
          <FiCamera />
        </button>
        {isScanning && (
          <button
            onClick={stopScanner}
            className="text-red-400 bg-red-900 px-3 py-1 rounded text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
