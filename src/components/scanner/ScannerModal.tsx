// src/components/scanner/ScannerModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { FiZap, FiCamera, FiX } from "react-icons/fi";
import ScannerCore from "./ScannerCore";
import { ScanData } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sessionId: string;
  onScanSuccess: (data: ScanData, raw: string) => void;
}

export default function ScannerModal({ isOpen, setIsOpen, sessionId, onScanSuccess }: Props) {
  const [torchOn, setTorchOn] = useState(false);
  const [cameraIndex, setCameraIndex] = useState(0);
  const [scanSuccess, setScanSuccess] = useState(false);

  const handleSuccess = (data: ScanData, raw: string) => {
    onScanSuccess(data, raw);
    // Activa el feedback visual
    setScanSuccess(true);
    setTimeout(() => setScanSuccess(false), 500); // Resetea después de 500ms
  };

  const closeModal = () => setIsOpen(false);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        {/* Overlay del fondo */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        {/* Contenido del Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-0">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full h-screen transform overflow-hidden bg-gray-900 text-left align-middle shadow-xl transition-all flex flex-col">
                {/* Header con botón de cerrar */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/50 to-transparent">
                  <h3 className="text-white font-bold">Scanning in session...</h3>
                  <button onClick={closeModal} className="p-2 bg-black/30 rounded-full text-white hover:bg-black/60">
                    <FiX />
                  </button>
                </div>

                {/* Contenedor del Scanner y Overlay */}
                <div className="relative flex-1">
                  <ScannerCore
                    onScanSuccess={handleSuccess}
                    sessionId={sessionId}
                    torchOn={torchOn} // Controlado desde aquí
                    cameraIndex={cameraIndex} // Controlado desde aquí
                  />
                   {/* Overlay de éxito */}
                   <AnimatePresence>
                      {scanSuccess && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 border-8 border-green-500 rounded-lg pointer-events-none"
                        />
                      )}
                   </AnimatePresence>
                </div>

                {/* Footer con controles */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center gap-8 z-20 bg-gradient-to-t from-black/50 to-transparent">
                    <button onClick={() => setTorchOn(prev => !prev)} className={`p-4 rounded-full transition-colors ${torchOn ? 'bg-yellow-400 text-gray-900' : 'bg-black/30 text-yellow-400 hover:bg-black/60'}`}>
                        <FiZap size={24}/>
                    </button>
                    <button onClick={() => setCameraIndex(prev => prev + 1)} className="p-4 bg-black/30 text-blue-400 hover:bg-black/60 rounded-full">
                        <FiCamera size={24}/>
                    </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}