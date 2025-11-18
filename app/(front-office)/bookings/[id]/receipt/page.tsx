"use client";

import { useParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { useReceipt } from '@/hooks/use-bookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Printer, QrCode, Building2, User, Calendar, CreditCard, MapPin, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

function ReceiptContent() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id ? parseInt(params.id as string) : null;
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  
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

  // Télécharger le reçu en PDF
  const handleDownloadPDF = async () => {
    if (!bookingId) return;
    
    try {
      const response = await fetch(
        `https://dolci-reva.achalivre-afrique.ci/api/payments/bookings/${bookingId}/receipt?format=pdf`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Erreur lors du téléchargement');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${receiptResponse?.data.receipt_info.booking_reference || bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Reçu téléchargé avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du téléchargement du reçu');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du reçu...</p>
        </div>
      </div>
    );
  }

  if (error || !receiptResponse?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Actions - Masquées à l'impression */}
        <div className="mb-6 print:hidden flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Button onClick={handleDownloadPDF} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
        </div>

        {/* Reçu */}
        <Card className="bg-white shadow-lg print:shadow-none">
          <CardContent className="p-8 print:p-12">
            {/* En-tête */}
            <div className="border-b-2 border-gray-200 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Dolci Rêva</h1>
                  <p className="text-gray-600">Reçu de paiement</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Référence</p>
                  <p className="font-mono font-bold text-lg">{receipt.receipt_info.booking_reference}</p>
                </div>
              </div>
            </div>

            {/* Informations du reçu */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Date de paiement</p>
                <p className="font-semibold">{formatDate(receipt.receipt_info.payment_date)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Référence de transaction</p>
                <p className="font-mono font-semibold">{receipt.receipt_info.payment_reference}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Statut du paiement</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  receipt.receipt_info.payment_status === 'PAYE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  {receipt.receipt_info.payment_status === 'PAYE' ? 'Payé' : 'En attente'}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Reçu généré le</p>
                <p className="font-semibold">{formatDate(receipt.receipt_info.generated_at)}</p>
              </div>
            </div>

            {/* Informations client */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations client
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-semibold">{receipt.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{receipt.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-semibold">{receipt.customer.phone}</p>
                </div>
              </div>
            </div>

            {/* Informations de réservation */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Détails de la réservation
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold">{receipt.booking.booking_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Référence</p>
                  <p className="font-mono font-semibold">{receipt.booking.booking_reference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date d&apos;arrivée</p>
                  <p className="font-semibold">{formatDate(receipt.booking.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de départ</p>
                  <p className="font-semibold">{formatDate(receipt.booking.end_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre de voyageurs</p>
                  <p className="font-semibold">{receipt.booking.guests}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
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
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Établissement
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-semibold text-lg">{receipt.property.details.name}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Adresse</p>
                    <p className="font-semibold">
                      {receipt.property.details.address.address}, {receipt.property.details.address.city}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold">{receipt.property.details.residence.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Standing</p>
                    <p className="font-semibold">{receipt.property.details.residence.standing}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Capacité max</p>
                    <p className="font-semibold">{receipt.property.details.residence.max_guests} personnes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations de paiement */}
            <div className="border-t-2 border-gray-200 pt-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Détails de paiement
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Montant total</span>
                  <span className="text-2xl font-bold text-theme-primary">
                    {formatPrice(receipt.payment.total_price)} {receipt.payment.payment_currency}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Méthode de paiement</span>
                  <span className="font-semibold">{receipt.payment.payment_method}</span>
                </div>
                {receipt.payment.authorization_code && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Code d&apos;autorisation</span>
                    <span className="font-mono text-sm">{receipt.payment.authorization_code}</span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code */}
            {receipt.qr_code && (
              <div className="border-t-2 border-gray-200 pt-6 mb-6 text-center">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Code de vérification
                </h2>
                <div className="bg-gray-50 rounded-lg p-6 inline-block">
                  <p className="text-xs text-gray-600 mb-4">Scannez ce code pour vérifier votre réservation</p>
                  <div className="bg-white p-4 rounded-lg inline-block shadow-md">
                    <canvas 
                      ref={qrCodeRef} 
                      className="w-48 h-48"
                      style={{ display: 'block' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    URL: <a href={receipt.qr_code.qr_code_url} className="text-theme-primary hover:underline break-all" target="_blank" rel="noopener noreferrer">
                      {receipt.qr_code.qr_code_url}
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Propriétaire */}
            <div className="border-t-2 border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Propriétaire</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-semibold">{receipt.owner.name}</p>
                </div>
                {receipt.owner.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{receipt.owner.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pied de page */}
            <div className="border-t-2 border-gray-200 pt-6 mt-8 text-center text-sm text-gray-600">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

