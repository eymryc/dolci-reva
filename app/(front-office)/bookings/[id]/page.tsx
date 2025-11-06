"use client";

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useBooking } from '@/hooks/use-bookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { CheckCircle2, Calendar, Users, MapPin, CreditCard, ArrowLeft, FileText } from 'lucide-react';

function BookingDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingId = params?.id ? parseInt(params.id as string) : null;
  
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { data: booking, isLoading, error } = useBooking(bookingId || 0);

  useEffect(() => {
    // Lire les paramètres de l'URL
    const payment = searchParams.get('payment');
    const ref = searchParams.get('reference');

    if (payment === 'success' && ref) {
      setPaymentStatus('success');
      setReference(ref);
      setShowSuccessMessage(true);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Message Banner */}
        {showSuccessMessage && paymentStatus === 'success' && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Paiement effectué avec succès !
                  </h3>
                  <p className="text-green-700 mb-2">
                    Votre réservation a été confirmée. Vous recevrez un email de confirmation sous peu.
                  </p>
                  {reference && (
                    <p className="text-sm text-green-600 font-mono">
                      Référence de transaction: {reference}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-6">
          <Link href="/bookings">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux réservations
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Détails de la réservation</h1>
          <p className="text-gray-600 mt-2">
            Référence: <span className="font-mono font-semibold">{booking.booking_reference}</span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informations de réservation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-theme-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Dates</p>
                  <p className="font-semibold">
                    {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-theme-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nombre de voyageurs</p>
                  <p className="font-semibold">{booking.guests} {booking.guests > 1 ? 'personnes' : 'personne'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-theme-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Lieu</p>
                  <p className="font-semibold">{booking.bookable.name}</p>
                  <p className="text-sm text-gray-500">
                    {booking.bookable.address}, {booking.bookable.city}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Statut</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    booking.status === 'CONFIRME' 
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'EN_ATTENTE'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status === 'CONFIRME' ? 'Confirmée' : 
                     booking.status === 'EN_ATTENTE' ? 'En attente' : 
                     booking.status === 'ANNULE' ? 'Annulée' : 'Terminée'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paiement</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    booking.payment_status === 'PAYE' 
                      ? 'bg-green-100 text-green-800'
                      : booking.payment_status === 'EN_ATTENTE'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.payment_status === 'PAYE' ? 'Payé' : 
                     booking.payment_status === 'EN_ATTENTE' ? 'En attente' : 
                     booking.payment_status === 'REFUSE' ? 'Refusé' : 'Remboursé'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Détails de paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix total</span>
                  <span className="font-semibold text-lg">{formatPrice(booking.total_price)} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Commission</span>
                  <span className="text-gray-700">{formatPrice(booking.commission_amount)} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Montant propriétaire</span>
                  <span className="text-gray-700">{formatPrice(booking.owner_amount)} FCFA</span>
                </div>
              </div>

              {reference && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-1">Référence de transaction</p>
                  <p className="font-mono text-sm font-semibold">{reference}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Réservé le</p>
                <p className="text-sm font-semibold">{formatDate(booking.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Link href="/residences" className="flex-1">
            <Button variant="outline" className="w-full">
              Explorer d&apos;autres lieux
            </Button>
          </Link>
          <Link href="/bookings" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-theme-primary to-orange-500 hover:from-orange-500 hover:to-theme-primary">
              Voir toutes mes réservations
            </Button>
          </Link>
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

