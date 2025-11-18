"use client";

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useBooking } from '@/hooks/use-bookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Calendar, 
  Users, 
  MapPin, 
  CreditCard, 
  ArrowLeft, 
  FileText, 
  Sparkles,
  Download,
  Mail,
  Shield
} from 'lucide-react';

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

  // Ouvrir la page de reçu
  const handleViewReceipt = () => {
    if (bookingId) {
      window.open(`/bookings/${bookingId}/receipt`, '_blank');
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
        {/* Success Message Banner - Amélioré */}
        {showSuccessMessage && paymentStatus === 'success' && (
          <div className="mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-teal-400/20 animate-pulse"></div>
            <Card className="relative border-2 border-green-300 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 shadow-xl">
              <CardContent className="pt-8 pb-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Icône animée */}
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                    <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-4 shadow-lg">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  {/* Contenu */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-green-600 animate-pulse" />
                      <h3 className="text-2xl font-bold text-green-900">
                        Paiement confirmé avec succès !
                      </h3>
                    </div>
                    <p className="text-green-800 mb-4 text-lg">
                      🎉 Félicitations ! Votre réservation a été confirmée et votre paiement a été traité.
                    </p>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-700 mb-2 font-medium">
                        📧 Un email de confirmation vous a été envoyé avec tous les détails de votre réservation.
                      </p>
                      {reference && (
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-3 pt-3 border-t border-green-200">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Référence:</span>
                          <span className="font-mono text-sm font-bold text-green-900 bg-white px-2 py-1 rounded">
                            {reference}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
            {booking.payment_status === 'PAYE' && (
              <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Paiement validé
              </Badge>
            )}
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

              {/* Référence transaction */}
              {reference && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Référence de transaction</p>
                  <p className="font-mono text-sm font-semibold bg-gray-50 px-3 py-2 rounded">
                    {reference}
                  </p>
                </div>
              )}

              {/* Date de réservation */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-1">Réservé le</p>
                <p className="text-sm font-semibold">{formatDate(booking.created_at)}</p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleViewReceipt}
                  disabled={!bookingId}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Voir le reçu
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="#">
                    <Mail className="w-4 h-4 mr-2" />
                    Renvoyer l&apos;email
                  </Link>
                </Button>
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
            <Button className="w-full bg-theme-primary hover:bg-theme-primary/90">
              Voir toutes mes réservations
            </Button>
          </Link>
        </div>

        {/* Message d'aide */}
        {showSuccessMessage && (
          <Card className="mt-6 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Besoin d&apos;aide ?</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Si vous avez des questions concernant votre réservation, n&apos;hésitez pas à nous contacter. 
                    Notre équipe est disponible 24/7 pour vous assister.
                  </p>
                  <Link href="/contact">
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      Nous contacter
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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

