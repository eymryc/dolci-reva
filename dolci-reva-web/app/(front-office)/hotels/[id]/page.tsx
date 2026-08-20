"use client"

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { fr } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { usePublicHotel } from '@/hooks/use-hotels';
import { useBookingQuote } from '@/hooks/use-booking-quote';
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
import type { HotelRoom } from '@/types/entities/hotel.types';
import { FeatureCategoriesDisplay } from '@/components/establishments/FeatureCategoriesDisplay';
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
import {
  MapPin, Star, Users, Check, Loader2,
  Phone, Mail, Globe, Calendar, ChevronLeft, Wifi
} from 'lucide-react';
import { HotelRoomAvailabilityBadge } from '@/components/front-office/HotelRoomAvailabilityBadge';

registerLocale('fr', fr);

const STANDING_LABELS: Record<string, string> = {
  STANDARD: 'Standard',
  SUPERIEUR: 'Supérieur',
  DELUXE: 'Deluxe',
  EXECUTIVE: 'Executive',
  SUITE: 'Suite',
  SUITE_JUNIOR: 'Suite Junior',
  SUITE_EXECUTIVE: 'Suite Executive',
  SUITE_PRESIDENTIELLE: 'Suite Présidentielle',
};

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Simple',
  DOUBLE: 'Double',
  TWIN: 'Twin',
  TRIPLE: 'Triple',
  QUAD: 'Quadruple',
  FAMILY: 'Familiale',
};

export default function HotelDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { data: hotel, isLoading, error } = usePublicHotel(id);
  const { user } = useAuth();

  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState('');
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const formatPrice = (price: string | number) => {
    const n = typeof price === 'string' ? parseFloat(price) : price;
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const diff = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const normalizeDateString = (dateStr: string | null | undefined): string | null => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    return dateStr.trim().split('T')[0].split(' ')[0];
  };

  const isDateUnavailable = (date: Date): boolean => {
    if (!date || isNaN(date.getTime()) || !selectedRoom?.unavailable_dates?.length) {
      return false;
    }
    const dateStr = formatDate(date);
    return selectedRoom.unavailable_dates.some((unavailableDate) => {
      if (!unavailableDate) return false;
      if (typeof unavailableDate === 'string') {
        const normalized = normalizeDateString(unavailableDate);
        return normalized === dateStr;
      }
      if (typeof unavailableDate === 'object' && unavailableDate.start && unavailableDate.end) {
        const start = normalizeDateString(unavailableDate.start);
        const end = normalizeDateString(unavailableDate.end);
        if (!start || !end) return false;
        return dateStr >= start && dateStr <= end;
      }
      return false;
    });
  };

  const isDateRangeUnavailable = (start: Date | null, end: Date | null): boolean => {
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return false;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const endCopy = new Date(end);
    endCopy.setHours(0, 0, 0, 0);
    while (current <= endCopy) {
      if (isDateUnavailable(current)) return true;
      current.setDate(current.getDate() + 1);
    }
    return false;
  };

  const filterDate = (date: Date | null): boolean => {
    if (!date || isNaN(date.getTime())) return false;
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkDate < today) return false;
    return !isDateUnavailable(checkDate);
  };

  const nights = calculateNights();

  const quotePayload = useMemo(() => {
    if (!selectedRoom || !startDate || !endDate || guests < 1 || nights < 1) return null;
    return {
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      guests,
      hotel_room_id: selectedRoom.id,
    };
  }, [selectedRoom, startDate, endDate, guests, nights]);

  const quoteEnabled = Boolean(
    quotePayload &&
      selectedRoom &&
      startDate &&
      endDate &&
      !isDateRangeUnavailable(startDate, endDate)
  );

  const { data: quote } = useBookingQuote('hotel', id, quotePayload, quoteEnabled);

  const bookHotelMutation = useMutation({
    mutationFn: async (data: { hotel_room_id: number; start_date: string; end_date: string; guests: number; notes?: string }) => {
      const response = await api.post(`/hotels/${id}/book`, data);
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
    if (!selectedRoom) {
      toast.error("Veuillez sélectionner une chambre");
      return;
    }
    if (selectedRoom.is_available === false) {
      toast.error("Cette chambre n'est pas disponible");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Veuillez sélectionner les dates d'arrivée et de départ");
      return;
    }
    if (nights < 1) {
      toast.error("La date de départ doit être après la date d'arrivée");
      return;
    }
    if (isDateRangeUnavailable(startDate, endDate)) {
      toast.error("Certaines dates sélectionnées ne sont pas disponibles. Veuillez choisir d'autres dates.");
      return;
    }
    bookHotelMutation.mutate({
      hotel_room_id: selectedRoom.id,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      guests,
      notes: notes || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-theme-primary mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l&apos;hôtel...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Hôtel introuvable.</p>
          <Link href="/hotels"><Button>Retour aux hôtels</Button></Link>
        </div>
      </div>
    );
  }

  const rooms: HotelRoom[] =
    hotel.rooms || hotel.hotel_rooms || [];
  const images = collectEstablishmentImages(hotel);
  const hasMap = hotel.latitude != null && hotel.longitude != null;

  return (
    <>
      <DetailPageLayout
        gallery={<EstablishmentCarousel images={images} />}
        header={
          <div>
            <Link href="/hotels" className="inline-flex items-center text-sm text-gray-500 hover:text-[#f08400] mb-3">
              <ChevronLeft className="w-4 h-4 mr-1" />Retour aux hôtels
            </Link>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {hotel.star_rating ? (
                <div className="flex items-center gap-1 bg-white px-3 py-1.5 border border-gray-100 shadow-sm">
                  {Array.from({ length: hotel.star_rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-gray-600 mt-3">
              <MapPin className="w-4 h-4 text-theme-primary flex-shrink-0" />
              <span>
                {hotel.address ? `${hotel.address}, ` : ''}
                {hotel.city}{hotel.country ? `, ${hotel.country}` : ''}
              </span>
            </div>
          </div>
        }
        sidebar={
          <BookingSidebarShell
            price={selectedRoom?.price}
            priceUnit="/ nuit"
            priceCaption={
              selectedRoom
                ? selectedRoom.display_name || ROOM_TYPE_LABELS[selectedRoom.type]
                : "Sélectionnez une chambre"
            }
            total={
              quote && selectedRoom && nights > 0 ? (
                <>
                  {quote.lines.map((line, i) => (
                    <BookingTotalRow
                      key={`${line.label}-${i}`}
                      label={line.label}
                      value={
                        line.amount <= 0
                          ? "Gratuit"
                          : `${formatQuoteAmount(line.amount)} FCFA`
                      }
                      valueClassName={
                        line.amount <= 0 ? "font-medium text-green-600" : undefined
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
            totalPlaceholder={
              !selectedRoom && rooms.length > 0
                ? "Sélectionnez une chambre et des dates pour voir le prix total"
                : "Sélectionnez les dates pour voir le prix total"
            }
            onSubmit={handleBooking}
            submitDisabled={
              bookHotelMutation.isPending ||
              (!selectedRoom && rooms.length > 0) ||
              selectedRoom?.is_available === false ||
              selectedRoom?.availability?.status === 'blocked' ||
              !startDate ||
              !endDate ||
              nights < 1 ||
              Boolean(startDate && endDate && isDateRangeUnavailable(startDate, endDate))
            }
            isSubmitting={bookHotelMutation.isPending}
            cancellationSummary={quote?.cancellation?.summary}
          >
            {!selectedRoom && rooms.length > 0 && (
              <div className="rounded-none border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Veuillez sélectionner une chambre dans la liste ci-contre.
              </div>
            )}

            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="h-4 w-4 text-theme-primary" />
                Dates de séjour <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => {
                      setStartDate(date);
                      if (date && endDate && date >= endDate) setEndDate(null);
                    }}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    filterDate={filterDate}
                    locale="fr"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Date d'arrivée"
                    className="w-full border-2 border-gray-200 bg-white px-3 py-3 text-sm shadow-sm focus:border-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                    wrapperClassName="w-full"
                  />
                  <p className="mt-2 text-xs font-medium text-gray-500">Arrivée</p>
                </div>
                <div>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={
                      startDate
                        ? new Date(startDate.getTime() + 86400000)
                        : new Date()
                    }
                    filterDate={filterDate}
                    locale="fr"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Date de départ"
                    className="w-full border-2 border-gray-200 bg-white px-3 py-3 text-sm shadow-sm focus:border-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-primary/30"
                    wrapperClassName="w-full"
                    disabled={!startDate}
                  />
                  <p className="mt-2 text-xs font-medium text-gray-500">Départ</p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                Personnes <span className="text-red-500">*</span>
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                className="w-full rounded-none border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium shadow-sm transition-all hover:shadow-md focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/30"
              >
                {Array.from(
                  { length: selectedRoom?.max_guests || 10 },
                  (_, i) => i + 1
                ).map((num) => (
                  <option key={num} value={num}>
                    {num} voyageur{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-1.5 text-sm font-semibold text-gray-700">
                Notes (optionnel)
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Demandes spéciales, heure d'arrivée prévue..."
                className="resize-none rounded-none border-2 border-gray-200 text-sm focus:border-theme-primary"
                rows={3}
              />
            </div>
          </BookingSidebarShell>
        }
      >
        {hotel.description && (
          <DetailSection title="À propos">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{hotel.description}</p>
          </DetailSection>
        )}

        <DetailSection title="Informations">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hotel.address && (
              <DetailInfoTile
                icon={<MapPin className="w-5 h-5" />}
                label="Adresse"
                value={hotel.address}
              />
            )}
            {hotel.phone && (
              <DetailInfoTile
                icon={<Phone className="w-5 h-5" />}
                label="Téléphone"
                value={<a href={`tel:${hotel.phone}`} className="hover:text-theme-primary transition-colors">{hotel.phone}</a>}
              />
            )}
            {hotel.email && (
              <DetailInfoTile
                icon={<Mail className="w-5 h-5" />}
                label="Email"
                value={<a href={`mailto:${hotel.email}`} className="hover:text-theme-primary transition-colors">{hotel.email}</a>}
              />
            )}
            {hotel.website && (
              <DetailInfoTile
                icon={<Globe className="w-5 h-5" />}
                label="Site web"
                value={(() => {
                  try {
                    const u = new URL(hotel.website, "https://dolci-reva.com");
                    if (u.protocol !== "http:" && u.protocol !== "https:") {
                      return <span className="truncate">{hotel.website}</span>;
                    }
                    return (
                      <a
                        href={u.toString()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-theme-primary transition-colors truncate"
                      >
                        {hotel.website}
                      </a>
                    );
                  } catch {
                    return <span className="truncate">{hotel.website}</span>;
                  }
                })()}
              />
            )}
          </div>
        </DetailSection>

        <FeatureCategoriesDisplay categories={hotel.feature_categories} />

        {rooms.length > 0 && (
          <DetailSection title="Chambres disponibles">
            <div className="space-y-4">
              {rooms.filter(r => r.is_active).map((room) => {
                const blocked = room.is_available === false || room.availability?.status === 'blocked';
                const reservedNow = room.availability?.status === 'reserved';
                return (
                  <Card
                    key={room.id}
                    onClick={() => {
                      if (blocked) return;
                      setSelectedRoom(room.id === selectedRoom?.id ? null : room);
                      setStartDate(null);
                      setEndDate(null);
                    }}
                    className={`p-5 border-2 rounded-none transition-all duration-200 ${
                      blocked
                        ? 'cursor-not-allowed border-gray-100 opacity-60'
                        : selectedRoom?.id === room.id
                          ? 'cursor-pointer border-theme-primary bg-theme-primary/5'
                          : 'cursor-pointer border-gray-100 hover:border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative w-full sm:w-40 h-32 rounded-none overflow-hidden bg-gray-100 flex-shrink-0">
                        {room.main_image_url ? (
                          <Image src={room.main_image_url} alt={room.display_name || room.type} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Wifi className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                        {blocked && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">Indisponible</span>
                          </div>
                        )}
                        {reservedNow && !blocked && (
                          <div className="absolute left-2 top-2 bg-[#c45f00] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                            Réservée
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {room.display_name || ROOM_TYPE_LABELS[room.type] || room.type}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{STANDING_LABELS[room.standing] || room.standing}</Badge>
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Users className="w-3 h-3" />{room.max_guests} pers. max
                              </Badge>
                              {room.room_number && (
                                <Badge variant="outline" className="text-xs">N° {room.room_number}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-theme-primary">
                              {formatPrice(room.price)} <span className="text-xs font-normal text-gray-500">FCFA/nuit</span>
                            </p>
                          </div>
                        </div>
                        {room.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{room.description}</p>
                        )}
                        <div className="mt-3">
                          <HotelRoomAvailabilityBadge room={room} />
                        </div>
                        {selectedRoom?.id === room.id && !blocked && (
                          <div className="mt-2 flex items-center gap-1 text-theme-primary text-sm font-medium">
                            <Check className="w-4 h-4" />Chambre sélectionnée
                            {reservedNow ? (
                              <span className="ml-1 font-normal text-[#12100c]/45">
                                — choisissez des dates hors occupation
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </DetailSection>
        )}

        {hasMap && (
          <DetailSection title="Localisation">
            <div className="aspect-video w-full overflow-hidden border border-gray-100">
              <iframe
                title={`Carte — ${hotel.name}`}
                src={`https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}&hl=fr&z=15&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </DetailSection>
        )}
      </DetailPageLayout>

      {showSignUpModal && (
        <CustomerSignUpModal
          open={showSignUpModal}
          onOpenChange={setShowSignUpModal}
        />
      )}
    </>
  );
}
