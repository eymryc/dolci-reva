"use client";

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useBooking, useReceipt } from '@/hooks/use-bookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import { generateReceiptPDF } from '@/lib/generate-receipt-pdf';
import { 
  CheckCircle2, 
  Calendar, 
  Users, 
  MapPin, 
  CreditCard, 
  ArrowLeft, 
  FileText, 
  Download
} from 'lucide-react';

function BookingDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingId = params?.id ? parseInt(params.id as string) : null;
  
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: booking, isLoading, error } = useBooking(bookingId || 0);
  const { data: receiptResponse } = useReceipt(bookingId || 0);

  useEffect(() => {
    // Lire les paramètres de l'URL
    const payment = searchParams.get('payment');
    const ref = searchParams.get('reference');

    if (payment === 'success' && ref) {
      toast.success('Paiement effectué avec succès !', {
        description: `Référence: ${ref}`,
      });
    }
  }, [searchParams]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format price
  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Générer et télécharger le PDF du reçu
  const handleViewReceipt = async () => {
    if (!receiptResponse?.data) {
      toast.error('Impossible de générer le reçu. Veuillez réessayer.');
      return;
    }

    try {
      setIsGeneratingPDF(true);
      await generateReceiptPDF(receiptResponse.data);
      toast.success('Reçu généré et téléchargé avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du reçu');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des détails de la réservation...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
            <CardDescription>
              Impossible de charger les détails de la réservation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/bookings">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux réservations
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/bookings">
            <Button variant="ghost" className="mb-4 hover:bg-white/80 transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux réservations
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Détails de la réservation
              </h1>
              <p className="text-gray-600">
                Référence: <span className="font-mono font-semibold">{booking.booking_reference}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {booking.payment_status === 'PAYE' && (
                <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Paiement validé
                </Badge>
              )}
              <Link href="/residences">
                <Button variant="outline" className="px-4 py-2 text-sm font-semibold">
                  Explorer d&apos;autres lieux
                </Button>
              </Link>
              <Link href="/bookings">
                <Button className="px-4 py-2 text-sm font-semibold bg-theme-primary hover:bg-theme-primary/90">
                  Mes réservations
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Informations de réservation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informations de réservation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dates */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-theme-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Dates de séjour</p>
                  <p className="font-semibold">
                    {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                  </p>
                </div>
              </div>

              {/* Voyageurs */}
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-theme-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nombre de voyageurs</p>
                  <p className="font-semibold">{booking.guests} {booking.guests > 1 ? 'personnes' : 'personne'}</p>
                </div>
              </div>

              {/* Lieu */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-theme-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Établissement</p>
                  <p className="font-semibold">{booking.bookable.name}</p>
                  <p className="text-sm text-gray-500">
                    {booking.bookable.address}, {booking.bookable.city}
                  </p>
                </div>
              </div>

              {/* Statuts */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Statut de la réservation</span>
                  <Badge className={`${
                    booking.status === 'CONFIRME' 
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'EN_ATTENTE'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status === 'CONFIRME' ? 'Confirmée' : 
                     booking.status === 'EN_ATTENTE' ? 'En attente' : 
                     booking.status === 'ANNULE' ? 'Annulée' : 'Terminée'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Statut du paiement</span>
                  <Badge className={`${
                    booking.payment_status === 'PAYE' 
                      ? 'bg-green-100 text-green-800'
                      : booking.payment_status === 'EN_ATTENTE'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.payment_status === 'PAYE' ? 'Payé' : 
                     booking.payment_status === 'EN_ATTENTE' ? 'En attente' : 
                     booking.payment_status === 'REFUSE' ? 'Refusé' : 'Remboursé'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détails de paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Détails de paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Montant total */}
              <div className="text-center p-4 rounded-lg bg-theme-primary/5 border border-theme-primary/20">
                <p className="text-sm text-gray-600 mb-1">Montant total</p>
                <p className="text-2xl font-bold text-theme-primary">
                  {formatPrice(booking.total_price)} FCFA
                </p>
              </div>

              {/* Date de réservation */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-1">Réservé le</p>
                <p className="text-sm font-semibold">{formatDate(booking.created_at)}</p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t flex items-center gap-4">
                <Button 
                  variant="link" 
                  className="p-0 h-auto justify-start"
                  onClick={handleViewReceipt}
                  disabled={!bookingId || isGeneratingPDF || !receiptResponse?.data}
                >
                  <Download className={`w-4 h-4 mr-2 ${isGeneratingPDF ? 'animate-spin' : ''}`} />
                  {isGeneratingPDF ? 'Génération...' : 'Télécharger le reçu'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <BookingDetailContent />
    </Suspense>
  );
}

