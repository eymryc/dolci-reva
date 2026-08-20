"use client";

import { useParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useReceipt } from '@/hooks/use-bookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Printer, QrCode, Building2, User, Calendar, CreditCard, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { generateReceiptPDF } from '@/lib/generate-receipt-pdf';

function ReceiptContent() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id ? parseInt(params.id as string) : null;
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { data: receiptResponse, isLoading, error } = useReceipt(bookingId || 0);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format price
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return price.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Télécharger le reçu en PDF (génération locale)
  const handleDownloadPDF = async () => {
    if (!receiptResponse?.data) {
      toast.error('Reçu indisponible pour le téléchargement');
      return;
    }

    try {
      setIsDownloading(true);
      await generateReceiptPDF(receiptResponse.data);
      toast.success('Reçu téléchargé avec succès');
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors du téléchargement du reçu');
    } finally {
      setIsDownloading(false);
    }
  };

  // Imprimer le reçu
  const handlePrint = () => {
    window.print();
  };

  // Générer le QR code
  useEffect(() => {
    const generateQRCode = async () => {
      if (receiptResponse?.data?.qr_code?.token) {
        try {
          if (qrCodeRef.current) {
            // Générer directement sur le canvas
            await QRCode.toCanvas(qrCodeRef.current, receiptResponse.data.qr_code.token, {
              width: 200,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF',
              },
            });
          }
        } catch (error) {
          console.error('Erreur lors de la génération du QR code:', error);
        }
      }
    };

    generateQRCode();
  }, [receiptResponse?.data?.qr_code?.token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du reçu...</p>
        </div>
      </div>
    );
  }

  if (error || !receiptResponse?.data) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-red-600 mb-4">Erreur lors du chargement du reçu.</p>
            <Button onClick={() => router.back()} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: receipt } = receiptResponse;

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4 print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Actions - Masquées à l'impression */}
        <div className="mb-6 print:hidden flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Button onClick={handleDownloadPDF} disabled={isDownloading || !receiptResponse?.data} className="flex-1 sm:flex-initial">
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            <span className="hidden sm:inline">{isDownloading ? 'Génération…' : 'Télécharger PDF'}</span>
            <span className="sm:hidden">{isDownloading ? '…' : 'PDF'}</span>
          </Button>
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
        </div>

        {/* Reçu */}
        <Card className="rounded-none border border-[#12100c]/10 bg-white shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)] print:shadow-none">
          <CardContent className="p-4 sm:p-6 md:p-8 print:p-12">
            {/* En-tête brand */}
            <div className="mb-4 border-b border-[#12100c]/10 pb-4 sm:mb-6 sm:pb-6">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f08400]">
                    Dolci Rêva
                  </p>
                  <div className="mt-2 h-px w-14 bg-gradient-to-r from-[#f08400] to-transparent" />
                  <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#12100c] sm:text-3xl">
                    Reçu de paiement
                  </h1>
                </div>
                <div className="w-full text-left sm:w-auto sm:text-right">
                  <p className="text-xs text-[#12100c]/50 sm:text-sm">Référence</p>
                  <p className="break-all font-mono text-base font-bold text-[#12100c] sm:break-normal sm:text-lg">
                    {receipt.receipt_info.booking_reference}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations du reçu */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-gray-600">Date de paiement</p>
                <p className="text-sm sm:text-base font-semibold break-words">{formatDate(receipt.receipt_info.payment_date)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-gray-600">Référence de transaction</p>
                <p className="text-xs sm:text-sm font-mono font-semibold break-all">{receipt.receipt_info.payment_reference}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-gray-600">Statut du paiement</p>
                <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-none text-xs sm:text-sm font-semibold ${
                  receipt.receipt_info.payment_status === 'PAYE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {receipt.receipt_info.payment_status === 'PAYE' ? 'Payé' : 'En attente'}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-gray-600">Reçu généré le</p>
                <p className="text-sm sm:text-base font-semibold break-words">{formatDate(receipt.receipt_info.generated_at)}</p>
              </div>
              {receipt.receipt_info.escrow_status && (
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-gray-600">Sécurité du paiement</p>
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-none text-xs sm:text-sm font-semibold ${
                    receipt.receipt_info.escrow_status === 'LIBERE'
                      ? 'bg-green-100 text-green-800'
                      : receipt.receipt_info.escrow_status === 'SECURISE'
                      ? 'bg-blue-100 text-blue-800'
                      : receipt.receipt_info.escrow_status === 'REMBOURSE'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {receipt.receipt_info.escrow_status === 'LIBERE' && 'Fonds versés à l\'établissement'}
                    {receipt.receipt_info.escrow_status === 'SECURISE' && 'Fonds sécurisés jusqu\'à votre arrivée'}
                    {receipt.receipt_info.escrow_status === 'REMBOURSE' && 'Remboursé'}
                    {receipt.receipt_info.escrow_status === 'EN_ATTENTE_PAIEMENT' && 'En attente de paiement'}
                  </span>
                </div>
              )}
            </div>

            {/* Informations client */}
            <div className="bg-gray-50 rounded-none p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                Informations client
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Prénom</p>
                  <p className="text-sm sm:text-base font-semibold break-words">{receipt.customer.first_name}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Nom</p>
                  <p className="text-sm sm:text-base font-semibold break-words">{receipt.customer.last_name}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Email</p>
                  <p className="text-xs sm:text-sm font-semibold break-all">{receipt.customer.email}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Téléphone</p>
                  <p className="text-sm sm:text-base font-semibold break-words">{receipt.customer.phone}</p>
                </div>
              </div>
            </div>

            {/* Informations de réservation */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Détails de la réservation
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Type</p>
                  <p className="text-sm sm:text-base font-semibold break-words">{receipt.booking.booking_type}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Référence</p>
                  <p className="text-xs sm:text-sm font-mono font-semibold break-all">{receipt.booking.booking_reference}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Date d&apos;arrivée</p>
                  <p className="text-sm sm:text-base font-semibold break-words">{formatDate(receipt.booking.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Date de départ</p>
                  <p className="text-sm sm:text-base font-semibold break-words">{formatDate(receipt.booking.end_date)}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Nombre de Personnes</p>
                  <p className="text-sm sm:text-base font-semibold">{receipt.booking.guests}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Statut</p>
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-none text-xs sm:text-sm font-semibold ${
                    receipt.booking.status === 'CONFIRME' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {receipt.booking.status === 'CONFIRME' ? 'Confirmée' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Informations de l'établissement */}
            <div className="bg-gray-50 rounded-none p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Établissement
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Nom</p>
                  <p className="text-base sm:text-lg font-semibold break-words">{receipt.property.details.name}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Adresse</p>
                    <p className="text-sm sm:text-base font-semibold break-words">
                      {[
                        receipt.property.details.address?.address,
                        receipt.property.details.address?.city,
                        receipt.property.details.address?.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Adresse non renseignée"}
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Type</p>
                    <p className="text-sm sm:text-base font-semibold break-words capitalize">
                      {receipt.property.details.residence?.type ||
                        receipt.property.details.type ||
                        receipt.property.type ||
                        receipt.booking.booking_type ||
                        "N/A"}
                    </p>
                  </div>
                  {(receipt.property.details.residence?.standing ||
                    receipt.property.details.standing) && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Standing</p>
                      <p className="text-sm sm:text-base font-semibold break-words">
                        {receipt.property.details.residence?.standing ||
                          receipt.property.details.standing}
                      </p>
                    </div>
                  )}
                  {(receipt.property.details.residence?.max_guests != null ||
                    receipt.property.details.max_guests != null) && (
                    <div className="sm:col-span-2 md:col-span-1">
                      <p className="text-xs sm:text-sm text-gray-600">Capacité max</p>
                      <p className="text-sm sm:text-base font-semibold">
                        {receipt.property.details.residence?.max_guests ??
                          receipt.property.details.max_guests}{" "}
                        personnes
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Informations de paiement */}
            <div className="border-t-2 border-gray-200 pt-4 sm:pt-6 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                Détails de paiement
              </h2>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b gap-2">
                  <span className="text-xs sm:text-sm text-gray-600">Montant total</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#f08400]">
                    {formatPrice(receipt.payment.total_price)} {receipt.payment.payment_currency}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 gap-2">
                  <span className="text-xs sm:text-sm text-gray-600">Méthode de paiement</span>
                  <span className="text-sm sm:text-base font-semibold break-words">{receipt.payment.payment_method}</span>
                </div>
                {receipt.payment.authorization_code && (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 gap-2">
                    <span className="text-xs sm:text-sm text-gray-600">Code d&apos;autorisation</span>
                    <span className="text-xs sm:text-sm font-mono break-all">{receipt.payment.authorization_code}</span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code */}
            {receipt.qr_code && (
              <div className="border-t-2 border-gray-200 pt-4 sm:pt-6 mb-4 sm:mb-6 text-center">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center justify-center gap-2">
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                  Code de vérification
                </h2>
                <div className="bg-gray-50 rounded-none p-4 sm:p-6 inline-block max-w-full">
                  <p className="text-xs text-gray-600 mb-3 sm:mb-4">Scannez ce code pour vérifier votre réservation</p>
                  <div className="bg-white p-3 sm:p-4 rounded-none inline-block shadow-md">
                    <canvas 
                      ref={qrCodeRef} 
                      className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 max-w-full"
                      style={{ display: 'block' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3 sm:mt-4 px-2">
                    URL: <a href={receipt.qr_code.qr_code_url} className="text-theme-primary hover:underline break-all" target="_blank" rel="noopener noreferrer">
                      {receipt.qr_code.qr_code_url}
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Propriétaire */}
            {receipt.owner ? (
              <div className="border-t-2 border-gray-200 pt-4 sm:pt-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Propriétaire</h2>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  {receipt.owner.first_name && receipt.owner.last_name ? (
                    <>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Prénom</p>
                        <p className="text-sm sm:text-base font-semibold break-words">{receipt.owner.first_name}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Nom</p>
                        <p className="text-sm sm:text-base font-semibold break-words">{receipt.owner.last_name}</p>
                      </div>
                    </>
                  ) : receipt.owner.full_name ? (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Nom</p>
                      <p className="text-sm sm:text-base font-semibold break-words">{receipt.owner.full_name}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Nom</p>
                      <p className="text-sm sm:text-base font-semibold">N/A</p>
                    </div>
                  )}
                  {receipt.owner.email && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Email</p>
                      <p className="text-xs sm:text-sm font-semibold break-all">{receipt.owner.email}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Pied de page */}
            <div className="border-t-2 border-gray-200 pt-4 sm:pt-6 mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-600 px-2">
              <p>Ce document est un reçu officiel de votre transaction.</p>
              <p className="mt-2">Pour toute question, contactez notre service client.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <ReceiptContent />
    </Suspense>
  );
}

