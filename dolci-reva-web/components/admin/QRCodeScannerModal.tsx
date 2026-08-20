"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, CheckCircle2, XCircle, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/axios";
import { toast } from "sonner";

interface ScanResultData {
  booking_reference?: string;
  [key: string]: unknown;
}

interface QRCodeScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRCodeScannerModal({ open, onOpenChange }: QRCodeScannerModalProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    data?: ScanResultData;
  } | null>(null);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Démarrer le scanner automatiquement quand le modal s'ouvre
  useEffect(() => {
    if (open && isMobile && scannerRef.current) {
      // Petit délai pour s'assurer que le DOM est prêt
      const timer = setTimeout(() => {
        startScanning();
      }, 300);
      return () => {
        clearTimeout(timer);
        if (open) {
          stopScanning();
        }
      };
    }
    return () => {
      if (open) {
        stopScanning();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isMobile]);

  // Nettoyer le scanner quand le modal se ferme
  useEffect(() => {
    if (!open) {
      stopScanning();
      setScanResult(null);
      setIsProcessing(false);
    }
  }, [open]);

  // Démarrer le scanner
  const startScanning = async () => {
    if (!scannerRef.current) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-reader-modal");
      html5QrCodeRef.current = html5QrCode;

      // Configuration pour mobile
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        videoConstraints: {
          facingMode: "environment", // Caméra arrière sur mobile
        },
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanError
      );

      setIsScanning(true);
      setScanResult(null);
    } catch (error) {
      console.error("Erreur lors du démarrage du scanner:", error);
      toast.error("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setIsScanning(false);
    }
  };

  // Arrêter le scanner
  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (error) {
        console.error("Erreur lors de l'arrêt du scanner:", error);
      } finally {
        setIsScanning(false);
      }
    } else {
      setIsScanning(false);
    }
  };

  // Callback de succès du scan
  const onScanSuccess = async (decodedText: string) => {
    // Arrêter le scanner immédiatement après avoir scanné
    setIsScanning(false);
    await stopScanning();

    // Extraire le token encodé du QR code
    let token = decodedText;

    // Si c'est une URL, extraire le token
    if (decodedText.includes("/verify-booking/")) {
      const parts = decodedText.split("/verify-booking/");
      if (parts.length > 1) {
        token = parts[1].split("?")[0];
      }
    } else if (decodedText.includes("verify-booking/")) {
      const parts = decodedText.split("verify-booking/");
      if (parts.length > 1) {
        token = parts[1].split("?")[0];
      }
    }

    // Envoyer le token à l'API
    await processQRCode(token);
  };

  // Callback d'erreur du scan
  const onScanError = (errorMessage: string) => {
    // Ignorer les erreurs de scan continu
    if (!errorMessage.includes("NotFoundException")) {
      // Erreur silencieuse pour les scans en cours
    }
  };

  // Traiter le QR code scanné
  const processQRCode = async (token: string) => {
    setIsProcessing(true);
    setScanResult(null);

    try {
      const response = await api.post("/payments/qr-code/scan", {
        token: token,
      });

      if (response.data.success) {
        setScanResult({
          success: true,
          message: "Fonds libérés avec succès !",
          data: response.data.data,
        });
        toast.success("Fonds libérés avec succès !");
        
        // Fermer le modal après 2 secondes en cas de succès
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      } else {
        setScanResult({
          success: false,
          message: response.data.message || "Erreur lors du traitement",
        });
        toast.error(response.data.message || "Erreur lors du traitement");
      }
    } catch (error: unknown) {
      const errorMessage =
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
         ? String(error.response.data.message)
         : null) ||
        (error && typeof error === 'object' && 'message' in error
         ? String(error.message)
         : null) ||
        "Erreur lors du traitement du QR code";
      setScanResult({
        success: false,
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#f08400]" />
              <DialogTitle>Scanner QR Code</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription>
            Scannez le QR code d&apos;une réservation pour libérer les fonds
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Zone de scan */}
          <div className="relative">
            <div
              id="qr-reader-modal"
              ref={scannerRef}
              className="w-full rounded-lg overflow-hidden bg-black"
              style={{ minHeight: "300px" }}
            ></div>

            {/* Message pour desktop */}
            {!isMobile && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg">
                <div className="text-center p-4 bg-white/95 backdrop-blur-sm rounded-lg mx-4">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Scanner non disponible sur desktop
                  </p>
                  <p className="text-xs text-gray-600">
                    Veuillez utiliser un appareil mobile
                  </p>
                </div>
              </div>
            )}

            {/* Instructions pour mobile */}
            {isMobile && !isScanning && !isProcessing && !scanResult && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg">
                <div className="text-center p-4 bg-white/95 backdrop-blur-sm rounded-lg mx-4">
                  <QrCode className="w-12 h-12 text-[#f08400] mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Prêt à scanner
                  </p>
                  <Button
                    onClick={startScanning}
                    className="bg-[#f08400] hover:bg-[#d87200] text-white mt-2"
                  >
                    Démarrer le scan
                  </Button>
                </div>
              </div>
            )}

            {/* Overlay de traitement */}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-lg">
                <div className="text-center p-6 bg-white/95 backdrop-blur-sm rounded-lg mx-4">
                  <Loader2 className="w-12 h-12 text-[#f08400] mx-auto mb-3 animate-spin" />
                  <p className="text-sm font-medium text-gray-900">
                    Traitement en cours...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Résultat du scan */}
          {scanResult && (
            <div
              className={`p-4 rounded-lg border-2 ${
                scanResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {scanResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      scanResult.success ? "text-green-900" : "text-red-900"
                    }`}
                  >
                    {scanResult.message}
                  </p>
                  {scanResult.data && (
                    <div className="mt-2 text-xs text-gray-600">
                      <p>
                        Réservation: {scanResult.data.booking_reference || "N/A"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          {isMobile && (
            <div className="flex gap-3">
              {isScanning && (
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="flex-1"
                >
                  Arrêter le scan
                </Button>
              )}
              {!isScanning && !isProcessing && scanResult && (
                <Button
                  onClick={() => {
                    setScanResult(null);
                    startScanning();
                  }}
                  className="flex-1 bg-[#f08400] hover:bg-[#d87200] text-white"
                >
                  Scanner à nouveau
                </Button>
              )}
            </div>
          )}

          {/* Informations */}
          {isMobile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                <strong>Astuce:</strong> Assurez-vous que le QR code est bien visible
                et que la caméra a les permissions nécessaires.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

