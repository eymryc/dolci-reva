"use client"

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { fr } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

// Enregistrer la locale française
registerLocale('fr', fr);
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UnitAvailabilityBadge } from '@/components/front-office/UnitAvailabilityBadge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from "next/link";
import { usePublicResidence, useBookResidence } from '@/hooks/use-residences';
import { useBookingQuote } from '@/hooks/use-booking-quote';
import { usePublicOpinions, useCreateOpinion } from '@/hooks/use-opinions';
import { useAuth } from '@/context/AuthContext';
import { CustomerSignUpModal } from '@/components/auth/CustomerSignUpModal';
import {
  BookingSidebarShell,
  BookingTotalRow,
} from '@/components/front-office/booking/BookingSidebarShell';
import {
  formatQuoteAmount,
  getBookingIdFromResponse,
  getPaymentUrlFromResponse,
  redirectAfterBooking,
} from '@/lib/booking-checkout';
import { toast } from 'sonner';
import { Calendar, Home, MapPin, Droplet, Users, Star, Check, X, Loader2 } from 'lucide-react';
import { ResidenceCarousel } from '@/components/front-office/residences/detail/ResidenceCarousel';
import { flattenFeatureOptions } from '@/lib/features';

// Formater les labels
const formatLabel = (value: string) => {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function ResidenceDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { data: residence, isLoading, error } = usePublicResidence(id);
  const { data: opinions, isLoading: isLoadingOpinions } = usePublicOpinions(id);
  const createOpinion = useCreateOpinion();
  const bookResidence = useBookResidence();
  const { user } = useAuth();
  
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    note: 0,
    comment: ''
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number>(1);

  // Derived nights count — stable for hooks deps (no recreated function each render)
  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diffDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays > 0 ? diffDays : 0;
  }, [startDate, endDate]);

  // Format date to YYYY-MM-DD string
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Normalize date string to YYYY-MM-DD format
  const normalizeDateString = (dateStr: string | null | undefined): string | null => {
    if (!dateStr || typeof dateStr !== 'string') {
      return null;
    }
    return dateStr.trim().split('T')[0].split(' ')[0];
  };

  // Check if a date is unavailable (API returns {start,end,status} ranges)
  const isDateUnavailable = (date: Date): boolean => {
    if (!date || isNaN(date.getTime())) {
      return false;
    }
    
    if (!residence?.unavailable_dates || !Array.isArray(residence.unavailable_dates) || residence.unavailable_dates.length === 0) {
      return false;
    }
    
    const dateStr = formatDateString(date);
    
    return residence.unavailable_dates.some((unavailableDate) => {
      if (!unavailableDate) return false;

      // Legacy: plain date string
      if (typeof unavailableDate === "string") {
        const normalizedUnavailable = normalizeDateString(unavailableDate);
        if (!normalizedUnavailable) return false;
        return normalizedUnavailable === dateStr;
      }

      // Current API: { start, end, status }
      if (typeof unavailableDate === "object" && unavailableDate.start && unavailableDate.end) {
        const start = normalizeDateString(unavailableDate.start);
        const end = normalizeDateString(unavailableDate.end);
        if (!start || !end) return false;
        return dateStr >= start && dateStr <= end;
      }

      return false;
    });
  };

  // Check if any date in the selected range is unavailable
  const isDateRangeUnavailable = (start: Date | null, end: Date | null): boolean => {
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }
    
    const currentDate = new Date(start);
    currentDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= endDate) {
      if (isDateUnavailable(currentDate)) {
        return true;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return false;
  };

  // Filter function for react-datepicker
  const filterDate = (date: Date | null): boolean => {
    if (!date || isNaN(date.getTime())) {
      return false;
    }
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkDate < today) {
      return false;
    }
    
    if (residence?.next_available_date) {
      try {
        const nextAvailable = new Date(residence.next_available_date);
        nextAvailable.setHours(0, 0, 0, 0);
        if (checkDate < nextAvailable) {
          return false;
        }
      } catch (error) {
        console.warn('Error parsing next_available_date:', residence.next_available_date, error);
      }
    }
    
    return !isDateUnavailable(checkDate);
  };

  const quotePayload = useMemo(() => {
    if (!startDate || !endDate || guests < 1 || nights < 1) return null;
    return {
      start_date: formatDateString(startDate),
      end_date: formatDateString(endDate),
      guests,
    };
  }, [startDate, endDate, guests, nights]);

  const quoteEnabled = Boolean(
    quotePayload &&
      startDate &&
      endDate &&
      !isDateRangeUnavailable(startDate, endDate)
  );

  const { data: quote } = useBookingQuote("residence", id, quotePayload, quoteEnabled);

  // Handle booking
  const handleBooking = () => {
    if (!user) {
      setShowSignUpModal(true);
      return;
    }
    if (!residence) {
      toast.error("Erreur : résidence introuvable");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Veuillez sélectionner les dates d'arrivée et de départ");
      return;
    }

    if (guests < 1) {
      toast.error("Veuillez sélectionner le nombre de Personnes");
      return;
    }

    if (guests > residence.max_guests) {
      toast.error(`Le nombre maximum de Personnes est ${residence.max_guests}`);
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

    bookResidence.mutate({
      residenceId: id,
      data: {
        start_date: formatDateString(startDate),
        end_date: formatDateString(endDate),
        guests: guests,
      },
    }, {
      onSuccess: (response) => {
        const bookingId = getBookingIdFromResponse(response);
        if (bookingId) {
          redirectAfterBooking(bookingId, getPaymentUrlFromResponse(response));
          return;
        }
        toast.success("Réservation effectuée avec succès !");
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-theme-primary mx-auto mb-4" />
          <p className="text-gray-600">Chargement des détails de la résidence...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !residence) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Une erreur s&apos;est produite lors du chargement de la résidence.</p>
          <Link href="/residences">
            <Button>Retour aux résidences</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get images from residence data
  const images = residence.gallery_images && residence.gallery_images.length > 0
    ? residence.gallery_images.map(img => img.url || img.medium_url || img.large_url || img.thumb_url)
    : residence.main_image_url
    ? [residence.main_image_url]
    : [];

  // Map amenities to display format
  const amenities = flattenFeatureOptions(residence.feature_categories).map((amenity) => ({
    name: amenity.name,
    available: true
  }));

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      if (diffMinutes < 1) return "À l'instant";
      if (diffMinutes === 1) return "Il y a 1 minute";
      if (diffMinutes < 60) return `Il y a ${diffMinutes} minutes`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours === 1) return "Il y a 1 heure";
      return `Il y a ${diffHours} heures`;
    }
    
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Il y a ${months} mois`;
    }
    const years = Math.floor(diffDays / 365);
    return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  };

  // Format opinions for display
  const formattedOpinions = opinions?.map((opinion) => {
    const date = new Date(opinion.created_at);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    const isToday = diffDays === 0;
    
    const formattedDate = formatDate(opinion.created_at);
    
    return {
      name: `${opinion.user?.first_name || ''} ${opinion.user?.last_name || ''}`.trim(),
      firstName: opinion.user?.first_name || '',
      lastName: opinion.user?.last_name || '',
      email: opinion.user?.email || '',
      rating: opinion.note,
      date: formattedDate,
      isToday: isToday,
      comment: opinion.comment,
      fullUser: opinion.user
    };
  }) || [];

  return (
    <div className="min-h-screen bg-[#faf8f5]">
     

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Galerie d'images */}
        <section className="mb-6">
          <ResidenceCarousel images={images} />
        </section>

        {/* Titre, localisation, note amélioré */}
        <section className="mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight flex-1">{residence.name}</h1>
                {residence.piece_number && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-none shadow-sm border border-gray-100">
                    <Home className="w-4 h-4 text-theme-primary" />
                    <span className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                      {residence.piece_number} pièce{residence.piece_number > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                {!residence.piece_number && residence.max_guests && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-none shadow-sm border border-gray-100">
                    <Users className="w-4 h-4 text-theme-primary" />
                    <span className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                      {residence.max_guests} voyageur{residence.max_guests > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {residence.type && (
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1 text-xs font-medium bg-theme-primary/10 text-theme-primary border border-theme-primary/20"
                  >
                    {formatLabel(residence.type)}
                  </Badge>
                )}
                {residence.standing && (
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    {formatLabel(residence.standing)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-4 text-base">
                <MapPin className="w-4 h-4 text-theme-primary flex-shrink-0" />
                <span className="truncate">
                  {residence.address && `${residence.address}, `}
                  {residence.city && `${residence.city}, `}
                  {residence.country}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-none shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(parseFloat(residence.average_rating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="font-semibold text-base text-gray-900">{parseFloat(residence.average_rating).toFixed(1)}</span>
                  <span className="text-gray-500 text-xs">({residence.rating_count} avis)</span>
                </div>
                <UnitAvailabilityBadge
                  availability={
                    residence.availability ||
                    residence.availability_status ||
                    (residence.is_available
                      ? { status: "available", label: "Disponible" }
                      : { status: "blocked", label: "Indisponible" })
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Colonne principale */}
          <div className="flex-1 space-y-6">
            {/* Description améliorée */}
            <Card className="p-4 lg:p-6 shadow-md border border-gray-100 bg-white">
              <h2 className="text-xl lg:text-2xl font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3">À propos de cette résidence</h2>
              {residence.description ? (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                    {residence.description}
                  </p>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed text-base">
                  Découvrez cette résidence exceptionnelle située à {residence.city}, {residence.country}. 
                  Une expérience de séjour unique vous attend dans cette résidence de type {residence.type ? formatLabel(residence.type).toLowerCase() : 'premium'} avec un standing {residence.standing ? formatLabel(residence.standing).toLowerCase() : 'exceptionnel'}.
                </p>
              )}
            </Card>

            {/* Informations détaillées */}
            <Card className="p-4 lg:p-6 shadow-md border border-gray-100 bg-white">
              <h2 className="text-xl lg:text-2xl font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3">Informations détaillées</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {residence.piece_number != null && (
                  <div className="flex items-center gap-3 p-4 rounded-none bg-[#faf8f5] border border-gray-100">
                    <div className="w-10 h-10 bg-theme-primary/10 rounded-none flex items-center justify-center">
                      <Home className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Nombre de pièces</p>
                      <p className="font-semibold text-gray-900">{residence.piece_number}</p>
                    </div>
                  </div>
                )}
                {residence.bedrooms != null && (
                  <div className="flex items-center gap-3 p-4 rounded-none bg-[#faf8f5] border border-gray-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-none flex items-center justify-center">
                      <Home className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Chambres</p>
                      <p className="font-semibold text-gray-900">{residence.bedrooms}</p>
                    </div>
                  </div>
                )}
                {residence.bathrooms != null && (
                  <div className="flex items-center gap-3 p-4 rounded-none bg-[#faf8f5] border border-gray-100">
                    <div className="w-10 h-10 bg-cyan-100 rounded-none flex items-center justify-center">
                      <Droplet className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Salles de bain</p>
                      <p className="font-semibold text-gray-900">{residence.bathrooms}</p>
                    </div>
                  </div>
                )}
                {residence.max_guests != null && (
                  <div className="flex items-center gap-3 p-4 rounded-none bg-[#faf8f5] border border-gray-100">
                    <div className="w-10 h-10 bg-purple-100 rounded-none flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Personnes max</p>
                      <p className="font-semibold text-gray-900">{residence.max_guests}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Équipements améliorés */}
            <Card className="p-4 lg:p-6 shadow-md border border-gray-100 bg-white">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Équipements et services</h2>
                {amenities.length > 6 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="hover:bg-theme-primary/5 hover:border-theme-primary/30 transition-all"
                  >
                    {showAllAmenities ? 'Voir moins' : 'Voir tout'}
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {amenities.slice(0, showAllAmenities ? amenities.length : 6).map((amenity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-4 rounded-none bg-[#faf8f5] hover:bg-[#fff4e8] border border-gray-100 hover:border-theme-primary/20 transition-all duration-300 group"
                  >
                    <span className={`flex-1 font-medium ${amenity.available ? 'text-gray-900 group-hover:text-theme-primary' : 'text-gray-400'}`}>
                      {amenity.name}
                    </span>
                    {amenity.available ? (
                      <div className="w-6 h-6 rounded-none bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-none bg-gray-100 flex items-center justify-center">
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Avis améliorés */}
            <Card className="p-4 lg:p-6 shadow-md border border-gray-100 bg-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-3 border-b border-gray-100 gap-4">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Avis clients</h2>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-none shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(parseFloat(residence.average_rating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="font-bold text-lg text-gray-900">{parseFloat(residence.average_rating).toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">({residence.rating_count} avis)</span>
                </div>
              </div>
              
              {/* Formulaire pour laisser un avis */}
              {!user ? (
                <div className="mb-6 p-4 bg-gray-50 rounded-none border border-gray-200 text-center">
                  <p className="text-gray-600 mb-3">Vous devez être connecté pour laisser un avis</p>
                  <Link href="/auth/sign-in">
                    <Button className="bg-theme-primary hover:bg-theme-primary/90 text-white">
                      Se connecter
                    </Button>
                  </Link>
                </div>
              ) : !showReviewForm ? (
                <Button 
                  onClick={() => setShowReviewForm(true)}
                  className="w-full mb-6 bg-theme-primary hover:bg-theme-primary/90 text-white"
                >
                  Laisser un avis
                </Button>
              ) : (
                <Card className="p-4 lg:p-6 mb-6 border-2 border-theme-primary/20 bg-gradient-to-br from-theme-primary/5 to-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-accent text-white rounded-none flex items-center justify-center font-bold text-sm shadow-md">
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Laisser votre avis</h3>
                      <p className="text-sm text-gray-600">{user.first_name} {user.last_name}</p>
                    </div>
                  </div>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      createOpinion.mutate({
                        residence_id: id,
                        note: reviewForm.note,
                        comment: reviewForm.comment
                      }, {
                        onSuccess: () => {
                          setReviewForm({ note: 0, comment: '' });
                          setShowReviewForm(false);
                        }
                      });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Votre note
                      </Label>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, note: i + 1 })}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                i < reviewForm.note
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                        {reviewForm.note > 0 && (
                          <span className="text-sm text-gray-600 ml-2">
                            {reviewForm.note} / 5
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="review-comment" className="text-sm font-medium text-gray-700 mb-2 block">
                        Votre commentaire
                      </Label>
                      <Textarea
                        id="review-comment"
                        placeholder="Partagez votre expérience..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        required
                        rows={4}
                        className="w-full resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        className="flex-1 bg-theme-primary hover:bg-theme-primary/90 text-white"
                        disabled={reviewForm.note === 0 || !reviewForm.comment || createOpinion.isPending}
                      >
                        {createOpinion.isPending ? 'Publication...' : "Publier l'avis"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewForm({ note: 0, comment: '' });
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
              
              {isLoadingOpinions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-theme-primary" />
                </div>
              ) : formattedOpinions.length > 0 ? (
                <div className="space-y-6">
                  {formattedOpinions.map((opinion, index) => (
                    <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-accent text-white rounded-none flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                          {opinion.firstName.charAt(0)}{opinion.lastName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="mb-3">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                              <span className="font-bold text-gray-900 text-base">{opinion.name}</span>
                              <div className="flex flex-col items-end gap-1">
                                {opinion.isToday && (
                                  <Badge className="bg-gradient-to-r from-theme-primary to-theme-accent text-white text-xs font-semibold px-2.5 py-0.5 shadow-sm">
                                    ✨ {opinion.date}
                                  </Badge>
                                )}
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(opinion.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                            {!opinion.isToday && (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-gray-500 text-sm">{opinion.date}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700 leading-relaxed text-base">{opinion.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun avis pour le moment. Soyez le premier à laisser un avis !</p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full mt-6 hover:bg-theme-primary/5 hover:border-theme-primary/30 transition-all"
              >
                Voir tous les avis
              </Button>
            </Card>

            {/* Localisation */}
            <Card className="p-4 lg:p-6 shadow-md border border-gray-100 bg-white overflow-hidden">
              <h2 className="text-xl lg:text-2xl font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3">Localisation</h2>
              
              {/* Informations de localisation */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-theme-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">{residence.city || 'Localisation'}</p>
                    <p className="text-sm text-gray-600">{residence.country}</p>
                  </div>
                </div>
                {residence.address && (
                  <p className="text-sm text-gray-600 pl-7">{residence.address}</p>
                )}
              </div>

              {/* Carte */}
              {residence.latitude && residence.longitude ? (
                <div className="w-full h-96 rounded-none overflow-hidden border border-gray-200 shadow-lg relative">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${residence.latitude},${residence.longitude}&hl=fr&z=15&output=embed`}
                    className="w-full h-full"
                  />
                  <a
                    href={`https://www.google.com/maps?q=${residence.latitude},${residence.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-white px-3 py-2 rounded-none shadow-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Ouvrir dans Google Maps
                  </a>
                </div>
              ) : residence.address ? (
                <div className="w-full h-96 rounded-none overflow-hidden border border-gray-200 shadow-lg relative">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(residence.address + ', ' + residence.city + ', ' + residence.country)}&hl=fr&z=15&output=embed`}
                    className="w-full h-full"
                  />
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(residence.address + ', ' + residence.city + ', ' + residence.country)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-white px-3 py-2 rounded-none shadow-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Ouvrir dans Google Maps
                  </a>
                </div>
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 rounded-none flex items-center justify-center relative overflow-hidden border border-gray-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/10 via-theme-primary/5 to-theme-accent/10" />
                  <div className="text-center z-10 p-6 bg-white/80 backdrop-blur-sm rounded-none shadow-lg border border-white/50">
                    <MapPin className="w-14 h-14 text-theme-primary mx-auto mb-3 drop-shadow-lg" />
                    <p className="text-gray-800 font-bold text-lg mb-1">{residence.city || 'Localisation'}</p>
                    <p className="text-sm text-gray-600 mb-2">{residence.country}</p>
                    <p className="text-xs text-gray-500 mt-2">Carte non disponible</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Encadré de réservation */}
          <aside className="w-full lg:w-96 sticky top-24 self-start">
            <BookingSidebarShell
              price={residence.price}
              priceUnit="/ nuit"
              total={
                quote && startDate && endDate && nights > 0 ? (
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
              totalPlaceholder="Sélectionnez les dates pour voir le prix total"
              onSubmit={handleBooking}
              submitLabel={
                startDate && endDate && isDateRangeUnavailable(startDate, endDate)
                  ? "Dates non disponibles"
                  : "Réserver maintenant"
              }
              submitDisabled={
                !startDate ||
                !endDate ||
                nights < 1 ||
                bookResidence.isPending ||
                Boolean(startDate && endDate && isDateRangeUnavailable(startDate, endDate))
              }
              isSubmitting={bookResidence.isPending}
              cancellationSummary={quote?.cancellation?.summary}
            >
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
                        if (date && endDate && date > endDate) {
                          setEndDate(null);
                        }
                      }}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      minDate={new Date()}
                      filterDate={filterDate}
                      placeholderText="Date d'arrivée"
                      dateFormat="dd/MM/yyyy"
                      locale="fr"
                      className="w-full"
                      wrapperClassName="w-full"
                      isClearable
                      highlightDates={[]}
                    />
                    <p className="mt-2 text-xs font-medium text-gray-500">Arrivée</p>
                  </div>
                  <div>
                    <DatePicker
                      selected={endDate}
                      onChange={(date: Date | null) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate || new Date()}
                      filterDate={filterDate}
                      placeholderText="Date de départ"
                      dateFormat="dd/MM/yyyy"
                      locale="fr"
                      className="w-full"
                      wrapperClassName="w-full"
                      isClearable
                      disabled={!startDate}
                      highlightDates={[]}
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
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full rounded-none border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium shadow-sm transition-all hover:shadow-md focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/30"
                  required
                >
                  {Array.from({ length: residence.max_guests }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} voyageur{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </BookingSidebarShell>
          </aside>
        </div>
      </div>

      {/* Modal d'inscription Customer */}
      <CustomerSignUpModal open={showSignUpModal} onOpenChange={setShowSignUpModal} />
    </div>
  );
}
