"use client"

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePublicNightClub, useNightClubAvailableAreas } from '@/hooks/use-nightlife-venues';
import type { NightClubArea } from '@/hooks/use-nightlife-venues';
import { NIGHT_CLUB_AREA_LABELS } from '@/types/entities/nightlife-venue.types';
import { useAuth } from '@/context/AuthContext';
import { CustomerSignUpModal } from '@/components/auth/CustomerSignUpModal';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { handleError } from '@/lib/error-handler';
import {
  formatQuoteAmount,
  getBookingIdFromResponse,
  getPaymentUrlFromResponse,
  redirectAfterBooking,
} from '@/lib/booking-checkout';
import {
  formatBookingDateTime,
  formatSlotDate,
  formatSlotTime,
  slotEndFor,
} from '@/lib/hospitality-booking';
import { useBookingQuote } from '@/hooks/use-booking-quote';
import { FeatureCategoriesDisplay } from '@/components/establishments/FeatureCategoriesDisplay';
import { UnitAvailabilityBadge } from '@/components/front-office/UnitAvailabilityBadge';
import { VenueUnitsAvailabilityList } from '@/components/front-office/VenueUnitsAvailabilityList';
import {
  MapPin, Users, Check, Loader2,
  Phone, Clock, ChevronLeft, Wind, Car, AlertTriangle,
  Star, Banknote,
} from 'lucide-react';
import {
  DetailPageLayout,
  EstablishmentCarousel,
  DetailSection,
  DetailInfoTile,
  collectEstablishmentImages,
} from '@/components/front-office/detail/DetailLayout';
import {
  BookingSidebarShell,
  BookingTotalRow,
} from '@/components/front-office/booking/BookingSidebarShell';
import { NightClubEveningField } from '@/components/front-office/booking/NightClubEveningField';

const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
  thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche',
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);

const AREA_TYPE_COLORS: Record<string, string> = {
  dance_floor: 'bg-purple-50 border-purple-200 hover:border-purple-400',
  vip_booth: 'bg-amber-50 border-amber-200 hover:border-amber-400',
  bar_area: 'bg-blue-50 border-blue-200 hover:border-blue-400',
  terrace: 'bg-green-50 border-green-200 hover:border-green-400',
  private_room: 'bg-rose-50 border-rose-200 hover:border-rose-400',
  bottle_service: 'bg-orange-50 border-orange-200 hover:border-orange-400',
};

const AREA_TYPE_SELECTED: Record<string, string> = {
  dance_floor: 'ring-2 ring-purple-500 border-purple-500',
  vip_booth: 'ring-2 ring-amber-500 border-amber-500',
  bar_area: 'ring-2 ring-blue-500 border-blue-500',
  terrace: 'ring-2 ring-green-500 border-green-500',
  private_room: 'ring-2 ring-rose-500 border-rose-500',
  bottle_service: 'ring-2 ring-orange-500 border-orange-500',
};

export default function NightClubDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { data: club, isLoading, error } = usePublicNightClub(id);
  const { user } = useAuth();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const endDate = useMemo(
    () => (startDate ? slotEndFor(startDate, 'night_club') : null),
    [startDate]
  );

  const areaDate = startDate ? formatSlotDate(startDate) : null;
  const areaTime = startDate ? formatSlotTime(startDate) : null;

  const { data: availableAreas = [], isLoading: isLoadingAreas } = useNightClubAvailableAreas(
    id,
    areaDate,
    areaTime,
    guests
  );

  const requiresAreaSelection = availableAreas.some(
    (a) => Boolean(a.reservation_required)
  );

  const toggleArea = (areaId: number) => {
    setSelectedAreaIds((prev) =>
      prev.includes(areaId) ? prev.filter((a) => a !== areaId) : [...prev, areaId]
    );
  };

  const quotePayload = useMemo(() => {
    if (!startDate || !endDate || guests < 1) return null;
    return {
      start_date: formatBookingDateTime(startDate),
      end_date: formatBookingDateTime(endDate),
      guests,
      night_club_area_ids: selectedAreaIds.length > 0 ? selectedAreaIds : undefined,
    };
  }, [startDate, endDate, guests, selectedAreaIds]);

  const { data: quote } = useBookingQuote(
    'night_club',
    id,
    quotePayload,
    Boolean(quotePayload)
  );

  const bookMutation = useMutation({
    mutationFn: async (data: {
      start_date: string;
      end_date: string;
      guests: number;
      notes?: string;
      night_club_area_ids?: number[];
    }) => {
      const response = await api.post(`/night-clubs/${id}/book`, data);
      return response.data;
    },
    onSuccess: (data) => {
      const bookingId = getBookingIdFromResponse(data);
      if (bookingId) {
        redirectAfterBooking(bookingId, getPaymentUrlFromResponse(data));
        return;
      }
      toast.success('Réservation effectuée avec succès !');
    },
    onError: (error) => {
      handleError(error, { defaultMessage: 'Erreur lors de la réservation' });
    },
  });


  const handleBooking = () => {
    if (!user) { setShowSignUpModal(true); return; }
    if (!startDate || !endDate) {
      toast.error("Veuillez sélectionner la soirée (date et heure d'arrivée)");
      return;
    }
    if (requiresAreaSelection && selectedAreaIds.length === 0) {
      toast.error("Veuillez sélectionner au moins un salon / zone");
      return;
    }
    bookMutation.mutate({
      start_date: formatBookingDateTime(startDate),
      end_date: formatBookingDateTime(endDate),
      guests,
      notes: notes || undefined,
      night_club_area_ids: selectedAreaIds.length > 0 ? selectedAreaIds : undefined,
    });
  };

  const parseOpeningHours = () => {
    if (!club?.opening_hours) return null;
    if (typeof club.opening_hours === 'string') {
      try { return JSON.parse(club.opening_hours); } catch { return null; }
    }
    return club.opening_hours;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-theme-primary" />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Night-club introuvable.</p>
          <Link href="/night-clubs"><Button>Retour aux night-clubs</Button></Link>
        </div>
      </div>
    );
  }

  const openingHours = parseOpeningHours();
  const images = collectEstablishmentImages(club);

  return (
    <>
      <DetailPageLayout
        gallery={<EstablishmentCarousel images={images} />}
        header={
          <div>
            <Link href="/night-clubs" className="inline-flex items-center text-sm text-gray-500 hover:text-[#f08400] mb-3">
              <ChevronLeft className="w-4 h-4 mr-1" />Retour aux night-clubs
            </Link>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{club.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {club.age_restriction && (
                <Badge className="text-xs bg-red-50 text-red-700 border border-red-200">
                  {club.age_restriction}+ ans requis
                </Badge>
              )}
              {club.outdoor_seating && (
                <Badge variant="secondary" className="text-xs bg-theme-primary/10 text-theme-primary border border-theme-primary/20">
                  Terrasse
                </Badge>
              )}
              {club.parking && (
                <Badge variant="secondary" className="text-xs bg-theme-primary/10 text-theme-primary border border-theme-primary/20">
                  Parking
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600 mt-3">
              <MapPin className="w-4 h-4 text-theme-primary flex-shrink-0" />
              <span>
                {club.address ? `${club.address}, ` : ''}
                {club.city}{club.country ? `, ${club.country}` : ''}
              </span>
            </div>
          </div>
        }
        sidebar={
          <BookingSidebarShell
            total={
              quote && startDate && endDate ? (
                <>
                  {quote.lines.map((line, i) => (
                    <BookingTotalRow
                      key={`${line.label}-${i}`}
                      label={line.label}
                      value={
                        line.amount <= 0
                          ? 'Gratuit'
                          : `${formatQuoteAmount(line.amount)} FCFA`
                      }
                      valueClassName={
                        line.amount <= 0 ? 'font-medium text-green-600' : undefined
                      }
                    />
                  ))}
                  <BookingTotalRow
                    label="Total"
                    value={`${formatQuoteAmount(quote.total)} FCFA`}
                    emphasize
                  />
                </>
              ) : null
            }
            totalPlaceholder="Sélectionnez la soirée pour voir le détail"
            onSubmit={handleBooking}
            submitDisabled={
              bookMutation.isPending ||
              !startDate ||
              !endDate ||
              (requiresAreaSelection && selectedAreaIds.length === 0)
            }
            isSubmitting={bookMutation.isPending}
            submitLabel="Réserver maintenant"
            cancellationSummary={quote?.cancellation?.summary}
          >
            <NightClubEveningField
              value={startDate}
              onChange={(date) => {
                setStartDate(date);
                setSelectedAreaIds([]);
              }}
            />

            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Users className="h-4 w-4 text-theme-primary" />
                Convives <span className="text-red-500">*</span>
              </label>
              <select
                value={guests}
                onChange={(e) => {
                  setGuests(parseInt(e.target.value, 10));
                  setSelectedAreaIds([]);
                }}
                className="w-full rounded-none border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium shadow-sm transition-all hover:shadow-md focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/30"
              >
                {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} convive{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {requiresAreaSelection ? (
              <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Ce club exige la réservation d&apos;un salon / zone. Sélectionnez-en un ci-dessous.
              </p>
            ) : null}

            <div>
              <Label className="mb-1.5 text-sm font-semibold text-gray-700">Notes (optionnel)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Demandes spéciales, anniversaire..."
                className="resize-none rounded-none border-2 border-gray-200 text-sm focus:border-theme-primary"
                rows={3}
              />
            </div>
          </BookingSidebarShell>
        }
      >
        {club.age_restriction && (
          <div className="bg-amber-50 border border-amber-200 rounded-none p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              L&apos;entrée est réservée aux personnes de <strong>{club.age_restriction} ans et plus</strong>. Une pièce d&apos;identité sera exigée.
            </p>
          </div>
        )}

        {club.description && (
          <DetailSection title="À propos">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{club.description}</p>
          </DetailSection>
        )}

        <DetailSection title="Informations">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {club.outdoor_seating && (
              <DetailInfoTile icon={<Wind className="w-5 h-5" />} label="Terrasse" value="Disponible" />
            )}
            {club.smoking_area && (
              <DetailInfoTile icon={<Check className="w-5 h-5" />} label="Espace fumeurs" value="Disponible" />
            )}
            {club.parking && (
              <DetailInfoTile icon={<Car className="w-5 h-5" />} label="Parking" value="Disponible" />
            )}
            {club.address && (
              <DetailInfoTile icon={<MapPin className="w-5 h-5" />} label="Adresse" value={club.address} />
            )}
            {club.phone && (
              <DetailInfoTile
                icon={<Phone className="w-5 h-5" />}
                label="Téléphone"
                value={<a href={`tel:${club.phone}`} className="hover:text-theme-primary">{club.phone}</a>}
              />
            )}
          </div>
        </DetailSection>

        {openingHours && (
          <DetailSection title="Horaires">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {Object.entries(openingHours).map(([day, hours]) => {
                const h = hours as { open: string; close: string } | undefined;
                return (
                  <div key={day} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                    <span className="font-medium text-gray-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-theme-primary" />
                      {DAY_LABELS[day] || day}
                    </span>
                    {h ? <span className="text-gray-600">{h.open} – {h.close}</span> : <span className="text-red-500 text-xs">Fermé</span>}
                  </div>
                );
              })}
            </div>
          </DetailSection>
        )}

        {startDate && (
          <DetailSection title="Zones disponibles">
            <p className="text-sm text-gray-500 mb-4 -mt-1">
              Sélectionnez une ou plusieurs zones pour cette soirée (optionnel)
            </p>

            {isLoadingAreas ? (
              <div className="flex items-center gap-2 text-gray-500 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Chargement des zones...</span>
              </div>
            ) : availableAreas.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                Aucune zone disponible pour cette date et ce nombre de personnes
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableAreas.map((area: NightClubArea) => {
                  const isSelected = selectedAreaIds.includes(area.id);
                  const baseColor = AREA_TYPE_COLORS[area.area_type] || 'bg-gray-50 border-gray-200 hover:border-gray-400';
                  const selectedColor = AREA_TYPE_SELECTED[area.area_type] || 'ring-2 ring-gray-500 border-gray-500';
                  return (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => toggleArea(area.id)}
                      className={`text-left p-4 rounded-none border-2 transition-all duration-200 ${baseColor} ${isSelected ? selectedColor : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-theme-primary" />
                            {area.area_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {NIGHT_CLUB_AREA_LABELS[area.area_type] || area.area_type}
                            {area.location_description && ` · ${area.location_description}`}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-none bg-theme-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {area.capacity && (
                          <span className="flex items-center gap-1 text-gray-600">
                            <Users className="w-3 h-3" />{area.capacity} pers. max
                          </span>
                        )}
                        {area.minimum_spend && area.minimum_spend > 0 && (
                          <span className="flex items-center gap-1 text-gray-700 font-medium">
                            <Banknote className="w-3 h-3" />Min. {formatPrice(area.minimum_spend)}
                          </span>
                        )}
                        {area.table_fee && area.table_fee > 0 && (
                          <span className="text-gray-600">Frais: {formatPrice(area.table_fee)}</span>
                        )}
                        {area.reservation_required && (
                          <Badge className="text-xs bg-red-100 text-red-700 border-red-200 py-0">Réservation obligatoire</Badge>
                        )}
                      </div>
                      {area.availability ? (
                        <div className="mt-2">
                          <UnitAvailabilityBadge availability={area.availability} compact />
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </DetailSection>
        )}

        <FeatureCategoriesDisplay categories={club.feature_categories} />

        {Array.isArray(club.areas) && club.areas.length > 0 ? (
          <DetailSection title="Toutes les zones">
            <VenueUnitsAvailabilityList
              title="État des zones"
              units={club.areas
                .filter((a) => a.is_active !== false)
                .map((a) => ({
                  id: a.id,
                  title: a.display_name || a.area_name || `Zone ${a.id}`,
                  capacity: a.capacity ?? undefined,
                  meta: [a.location_description, a.area_type].filter(Boolean).join(" · ") || null,
                  availability: a.availability ?? undefined,
                }))}
            />
          </DetailSection>
        ) : null}
      </DetailPageLayout>

      {showSignUpModal && (
        <CustomerSignUpModal open={showSignUpModal} onOpenChange={setShowSignUpModal} />
      )}
    </>
  );
}
