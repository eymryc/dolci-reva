"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useBookings } from '@/hooks/use-bookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { XCircle, Calendar, Users, MapPin, CreditCard, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function BookingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [showFailedMessage, setShowFailedMessage] = useState(false);

  const { data: bookingsResponse, isLoading, error } = useBookings(page);
  const bookings = bookingsResponse?.data || [];

  useEffect(() => {
    // Lire les paramètres de l'URL
    const payment = searchParams.get('payment');
    const ref = searchParams.get('reference');
    const paymentStatus = searchParams.get('status');

    if (payment === 'failed' && ref) {
      setPaymentStatus('failed');
      setReference(ref);
      setStatus(paymentStatus || 'failed');
      setShowFailedMessage(true);
      toast.error('Le paiement a échoué', {
        description: `Référence: ${ref}`,
      });
    }
  }, [searchParams]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
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

  // Handle retry payment
  const handleRetryPayment = (bookingId: number) => {
    // TODO: Implement retry payment logic
    // This would typically redirect to a payment page with the booking ID
    router.push(`/bookings/${bookingId}/payment`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Connexion requise</CardTitle>
            <CardDescription>
              Vous devez être connecté pour voir vos réservations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/sign-in">
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Failed Payment Message Banner */}
        {showFailedMessage && paymentStatus === 'failed' && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Le paiement a échoué
                  </h3>
                  <p className="text-red-700 mb-4">
                    Votre paiement n&apos;a pas pu être traité. Veuillez réessayer ou contacter le support si le problème persiste.
                  </p>
                  {reference && (
                    <div className="mb-4">
                      <p className="text-sm text-red-600 font-mono mb-2">
                        Référence: {reference}
                      </p>
                      {status && (
                        <p className="text-sm text-red-600">
                          Statut: {status}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowFailedMessage(false)}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Fermer
                    </Button>
                    <Link href="/support">
                      <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                        Contacter le support
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes réservations</h1>
          <p className="text-gray-600">
            Gérez et suivez toutes vos réservations
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos réservations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Erreur</h3>
                  <p className="text-red-700">
                    Une erreur s&apos;est produite lors du chargement de vos réservations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bookings List */}
        {!isLoading && !error && (
          <>
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucune réservation
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Vous n&apos;avez pas encore de réservations.
                  </p>
                  <Link href="/residences">
                    <Button className="bg-gradient-to-r from-theme-primary to-orange-500 hover:from-orange-500 hover:to-theme-primary">
                      Explorer les lieux disponibles
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                {booking.bookable.name}
                              </h3>
                              <p className="text-sm text-gray-600 font-mono mb-2">
                                Réf: {booking.booking_reference}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
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

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-start gap-3">
                              <Calendar className="w-5 h-5 text-theme-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-600">Dates</p>
                                <p className="font-semibold text-sm">
                                  {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Users className="w-5 h-5 text-theme-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-600">Voyageurs</p>
                                <p className="font-semibold text-sm">{booking.guests} {booking.guests > 1 ? 'personnes' : 'personne'}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-theme-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-600">Lieu</p>
                                <p className="font-semibold text-sm">{booking.bookable.city}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 pt-4 border-t">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-theme-primary" />
                              <span className="text-lg font-bold text-gray-900">
                                {formatPrice(booking.total_price)} FCFA
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:w-auto w-full">
                          <Link href={`/bookings/${booking.id}`}>
                            <Button variant="outline" className="w-full md:w-auto">
                              Voir les détails
                            </Button>
                          </Link>
                          {booking.payment_status === 'EN_ATTENTE' && (
                            <Button
                              variant="outline"
                              onClick={() => handleRetryPayment(booking.id)}
                              className="w-full md:w-auto border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Réessayer le paiement
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {bookingsResponse && bookingsResponse.meta.last_page > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Page {bookingsResponse.meta.current_page} sur {bookingsResponse.meta.last_page}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(bookingsResponse.meta.last_page, p + 1))}
                  disabled={page === bookingsResponse.meta.last_page}
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <BookingsContent />
    </Suspense>
  );
}

