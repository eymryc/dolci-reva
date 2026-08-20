"use client"

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePublicLounge } from '@/hooks/use-lounges';
import { useVenueAvailableTables } from '@/hooks/use-venue-tables';
import { useBookingQuote } from '@/hooks/use-booking-quote';
import { VenueTablePicker } from '@/components/front-office/booking/VenueTablePicker';
import { VenueSlotDateTimeField } from '@/components/front-office/booking/VenueSlotDateTimeField';
import {
  BookingSidebarShell,
  BookingTotalRow,
} from '@/components/front-office/booking/BookingSidebarShell';
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
import { FeatureCategoriesDisplay } from '@/components/establishments/FeatureCategoriesDisplay';
import { VenueUnitsAvailabilityList } from '@/components/front-office/VenueUnitsAvailabilityList';
import {
  MapPin, Users, Check, Loader2,
  Phone, Clock, ChevronLeft, Wind, Car
} from 'lucide-react';
import {
  DetailPageLayout,
  EstablishmentCarousel,
  DetailSection,
  DetailInfoTile,
  collectEstablishmentImages,
} from '@/components/front-office/detail/DetailLayout';

const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
  thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche',
};

export default function LoungeDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { data: lounge, isLoading, error } = usePublicLounge(id);
  const { user } = useAuth();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>([]);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const endDate = useMemo(
    () => (startDate ? slotEndFor(startDate, 'lounge') : null),
    [startDate]
  );

  const tableDate = startDate ? formatSlotDate(startDate) : null;
  const tableTime = startDate ? formatSlotTime(startDate) : null;

  const {
    data: availableTables = [],
    isLoading: isLoadingTables,
    isError: isTablesError,
  } = useVenueAvailableTables(
    'lounges',
    id,
    tableDate,
    tableTime,
    guests
  );

  const toggleTable = (tableId: number) => {
    setSelectedTableIds((prev) =>
      prev.includes(tableId) ? prev.filter((t) => t !== tableId) : [...prev, tableId]
    );
  };

  const quotePayload = useMemo(() => {
    if (!startDate || !endDate || guests < 1) return null;
    return {
      start_date: formatBookingDateTime(startDate),
      end_date: formatBookingDateTime(endDate),
      guests,
      lounge_table_ids: selectedTableIds.length > 0 ? selectedTableIds : undefined,
    };
  }, [startDate, endDate, guests, selectedTableIds]);

  const { data: quote } = useBookingQuote(
    'lounge',
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
      lounge_table_ids: number[];
    }) => {
      const response = await api.post(`/lounges/${id}/book`, data);
      return response.data;
    },
    onSuccess: (data) => {
      const bookingId = getBookingIdFromResponse(data);
      if (bookingId) {
        redirectAfterBooking(bookingId, getPaymentUrlFromResponse(data));
        return;
      }
      toast.success("Réservation effectuée avec succès !");
    },
    onError: (error) => {
      handleError(error, { defaultMessage: "Erreur lors de la réservation" });
    },
  });


  const handleBooking = () => {
    if (!user) { setShowSignUpModal(true); return; }
    if (!startDate || !endDate) {
      toast.error("Veuillez sélectionner la date et l'heure d'arrivée");
      return;
    }
    if (selectedTableIds.length === 0) {
      toast.error("Veuillez sélectionner au moins une table");
      return;
    }
    bookMutation.mutate({
      start_date: formatBookingDateTime(startDate),
      end_date: formatBookingDateTime(endDate),
      guests,
      notes: notes || undefined,
      lounge_table_ids: selectedTableIds,
    });
  };

  const parseOpeningHours = () => {
    if (!lounge?.opening_hours) return null;
    if (typeof lounge.opening_hours === 'string') {
      try { return JSON.parse(lounge.opening_hours); } catch { return null; }
    }
    return lounge.opening_hours;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-theme-primary" />
      </div>
    );
  }

  if (error || !lounge) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Lounge introuvable.</p>
          <Link href="/lounges"><Button>Retour aux lounges</Button></Link>
        </div>
      </div>
    );
  }

  const openingHours = parseOpeningHours();
  const images = collectEstablishmentImages(lounge);

  return (
    <>
      <DetailPageLayout
        gallery={<EstablishmentCarousel images={images} />}
        header={
          <div>
            <Link href="/lounges" className="inline-flex items-center text-sm text-gray-500 hover:text-[#f08400] mb-3">
              <ChevronLeft className="w-4 h-4 mr-1" />Retour aux lounges
            </Link>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{lounge.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {lounge.outdoor_seating && (
                <Badge variant="secondary" className="text-xs bg-theme-primary/10 text-theme-primary border border-theme-primary/20">
                  Terrasse
                </Badge>
              )}
              {lounge.parking && (
                <Badge variant="secondary" className="text-xs bg-theme-primary/10 text-theme-primary border border-theme-primary/20">
                  Parking
                </Badge>
              )}
              {lounge.age_restriction && (
                <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700 border border-amber-200">
                  {lounge.age_restriction}+ ans
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600 mt-3">
              <MapPin className="w-4 h-4 text-theme-primary flex-shrink-0" />
              <span>
                {lounge.address ? `${lounge.address}, ` : ''}
                {lounge.city}{lounge.country ? `, ${lounge.country}` : ''}
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
            totalPlaceholder="Sélectionnez date et heure pour voir le détail"
            onSubmit={handleBooking}
            submitDisabled={
              bookMutation.isPending ||
              !startDate ||
              !endDate ||
              selectedTableIds.length === 0
            }
            isSubmitting={bookMutation.isPending}
            cancellationSummary={quote?.cancellation?.summary}
          >
            <VenueSlotDateTimeField
              vertical="lounge"
              value={startDate}
              onChange={(date) => {
                setStartDate(date);
                setSelectedTableIds([]);
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
                  setSelectedTableIds([]);
                }}
                className="w-full rounded-none border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium shadow-sm transition-all hover:shadow-md focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/30"
              >
                {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} convive{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {startDate ? (
              <VenueTablePicker
                tables={availableTables}
                selectedIds={selectedTableIds}
                onToggle={toggleTable}
                isLoading={isLoadingTables}
                isError={isTablesError}
                label="Choisir une table / salon"
              />
            ) : null}

            <div>
              <Label className="mb-1.5 text-sm font-semibold text-gray-700">Notes (optionnel)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Occasion spéciale, préférences de coin..."
                className="resize-none rounded-none border-2 border-gray-200 text-sm focus:border-theme-primary"
                rows={3}
              />
            </div>
          </BookingSidebarShell>
        }
      >
        {lounge.description && (
          <DetailSection title="À propos">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{lounge.description}</p>
          </DetailSection>
        )}

        <DetailSection title="Caractéristiques">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lounge.outdoor_seating && (
              <DetailInfoTile icon={<Wind className="w-5 h-5" />} label="Terrasse" value="Disponible" />
            )}
            {lounge.smoking_area && (
              <DetailInfoTile icon={<Check className="w-5 h-5" />} label="Espace fumeurs" value="Disponible" />
            )}
            {lounge.parking && (
              <DetailInfoTile icon={<Car className="w-5 h-5" />} label="Parking" value="Disponible" />
            )}
            {lounge.age_restriction && (
              <DetailInfoTile
                icon={<Users className="w-5 h-5" />}
                label="Âge minimum"
                value={`${lounge.age_restriction}+ ans requis`}
              />
            )}
            {lounge.address && (
              <DetailInfoTile icon={<MapPin className="w-5 h-5" />} label="Adresse" value={lounge.address} />
            )}
            {lounge.phone && (
              <DetailInfoTile
                icon={<Phone className="w-5 h-5" />}
                label="Téléphone"
                value={<a href={`tel:${lounge.phone}`} className="hover:text-theme-primary">{lounge.phone}</a>}
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

        <FeatureCategoriesDisplay categories={lounge.feature_categories} />

        {Array.isArray(lounge.tables) && lounge.tables.length > 0 ? (
          <DetailSection title="Tables">
            <VenueUnitsAvailabilityList
              title="État des tables"
              units={(lounge.tables as Array<{
                id: number;
                is_active?: boolean;
                display_name?: string;
                table_number?: string;
                capacity?: number;
                location_description?: string;
                table_type?: string;
                availability?: {
                  status: string;
                  label?: string;
                  free_from?: string | null;
                  message?: string | null;
                };
              }>)
                .filter((t) => t.is_active !== false)
                .map((t) => ({
                  id: t.id,
                  title: t.display_name || `Table ${t.table_number}`,
                  capacity: t.capacity,
                  meta: [t.location_description, t.table_type].filter(Boolean).join(" · ") || null,
                  availability: t.availability,
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
