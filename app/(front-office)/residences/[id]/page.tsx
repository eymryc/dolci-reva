"use client"

import { useState } from 'react';
import { useParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Image from "next/image";
import Link from "next/link";
import { usePublicResidence, useBookResidence } from '@/hooks/use-residences';
import { usePublicOpinions, useCreateOpinion } from '@/hooks/use-opinions';
import { useAuth } from '@/context/AuthContext';
import { CustomerSignUpModal } from '@/components/auth/CustomerSignUpModal';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';
import { 
  MapPin, 
  Star, 
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2
} from "lucide-react";

// Carousel amélioré avec disposition moderne
function Carousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const total = images.length;
  const hasMultipleImages = total > 1;

  const goTo = (idx: number) => setCurrent((idx + total) % total);
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[16/10] rounded-3xl overflow-hidden bg-gray-100 shadow-2xl flex items-center justify-center">
        <p className="text-gray-400">Aucune image disponible</p>
      </div>
    );
  }

  // Si une seule image, affichage simple
  if (!hasMultipleImages) {
  return (
    <div className="relative w-full group">
      <div className="w-full aspect-[16/10] rounded-3xl overflow-hidden bg-gray-100 shadow-2xl">
        <Image
            src={images[0]}
            alt="Photo principale"
          fill
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </div>
      </div>
    );
  }

  // Disposition avec miniatures - affichage de toutes les images
  const maxVisibleThumbnails = 6;
  const shouldShowAll = images.length <= maxVisibleThumbnails;
  const visibleThumbnails = shouldShowAll ? images : images.slice(0, maxVisibleThumbnails - 1);
  const hasMoreThanMax = images.length > maxVisibleThumbnails;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-3">
      {/* Image principale - 50% */}
      <div className="w-full lg:w-1/2 relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 shadow-md group">
        <Image
          src={images[current] || images[0]}
          alt={`Photo ${current + 1} sur ${total}`}
          fill
          className="w-full h-full object-cover transition-all duration-700"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={current === 0}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        
        {/* Compteur d'images */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium z-10">
          {current + 1} / {total}
      </div>
      
        {/* Flèches de navigation */}
      <button
        onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-theme-primary hover:text-white transition-all duration-300 p-1.5 rounded-full shadow-md border border-gray-200 z-10 opacity-100 hover:scale-110"
          aria-label="Photo précédente"
      >
          <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-theme-primary hover:text-white transition-all duration-300 p-1.5 rounded-full shadow-md border border-gray-200 z-10 opacity-100 hover:scale-110"
          aria-label="Photo suivante"
      >
          <ChevronRight className="w-4 h-4" />
      </button>
      </div>
      
      {/* Miniatures en grille 3 colonnes - 50% */}
      <div className="w-full lg:w-1/2">
        <div className="grid grid-cols-3 gap-2">
          {visibleThumbnails.map((image, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
              className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
              idx === current 
                  ? 'ring-2 ring-theme-primary shadow-md'
                  : 'ring-1 ring-gray-200 hover:ring-theme-primary/50 opacity-70 hover:opacity-100'
              }`}
              aria-label={`Voir la photo ${idx + 1}`}
            >
              <Image
                src={image}
                alt={`Miniature ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 16vw"
              />
              {idx === current && (
                <div className="absolute inset-0 bg-theme-primary/15 border-2 border-theme-primary" />
              )}
              {/* Overlay pour meilleure visibilité */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            </button>
          ))}
          
          {/* Indicateur s'il y a plus d'images */}
          {hasMoreThanMax && (
            <button
              onClick={() => {
                // Aller à la prochaine image non visible
                const nextIndex = visibleThumbnails.length;
                goTo(nextIndex);
              }}
              className="relative aspect-square rounded-lg bg-gradient-to-br from-theme-primary/10 to-theme-accent/10 flex items-center justify-center border-2 border-theme-primary/30 hover:border-theme-primary transition-all duration-300 cursor-pointer"
              aria-label={`Voir les ${images.length - maxVisibleThumbnails + 1} images restantes`}
            >
              <div className="text-center">
                <span className="text-lg font-bold text-theme-primary">+{images.length - maxVisibleThumbnails + 1}</span>
                <p className="text-xs text-gray-600 mt-0.5 font-medium">plus</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DetailPage() {
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
  
  // Format price with space separator
  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };

  // Calculate number of nights
  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

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
    // Remove time part if present (handles formats like "2024-01-15T00:00:00" or "2024-01-15 00:00:00")
    return dateStr.trim().split('T')[0].split(' ')[0];
  };

  // Check if a date is unavailable
  const isDateUnavailable = (date: Date): boolean => {
    if (!date || isNaN(date.getTime())) {
      return false;
    }
    
    // Check if unavailable_dates exists and is an array
    if (!residence?.unavailable_dates || !Array.isArray(residence.unavailable_dates) || residence.unavailable_dates.length === 0) {
      return false;
    }
    
    const dateStr = formatDateString(date);
    
    // Check against string array directly
    return residence.unavailable_dates.some(unavailableDate => {
      // Skip null/undefined values
      if (!unavailableDate) return false;
      
      // Ensure it's a string
      if (typeof unavailableDate !== 'string') {
        return false;
      }
      
      // Normalize the date string (remove time if present)
      const normalizedUnavailable = normalizeDateString(unavailableDate);
      if (!normalizedUnavailable) return false;
      
      return normalizedUnavailable === dateStr;
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
    
    // Don't allow past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkDate < today) {
      return false;
    }
    
    // If residence has next_available_date, don't allow dates before it
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
    
    // Don't allow unavailable dates
    return !isDateUnavailable(checkDate);
  };

  // Handle booking
  const handleBooking = () => {
    // Vérifier si l'utilisateur est connecté
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
      toast.error("Veuillez sélectionner le nombre de voyageurs");
      return;
    }

    if (guests > residence.max_guests) {
      toast.error(`Le nombre maximum de voyageurs est ${residence.max_guests}`);
      return;
    }

    const nights = calculateNights();
    if (nights < 1) {
      toast.error("La date de départ doit être après la date d'arrivée");
      return;
    }

    // Vérifier si les dates sélectionnées sont disponibles
    if (isDateRangeUnavailable(startDate, endDate)) {
      toast.error("Certaines dates sélectionnées ne sont pas disponibles. Veuillez choisir d'autres dates.");
      return;
    }

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    bookResidence.mutate({
      residenceId: id,
      data: {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        guests: guests,
      },
    }, {
      onSuccess: (response) => {
        if (response?.payment_url) {
          // Afficher un message de succès avec compte à rebours
          toast.success("Redirection vers la page de paiement dans 3 secondes...", {
            duration: 3000,
          });
          
          // Redirection après 3 secondes
          setTimeout(() => {
            if (response.payment_url) {
              window.location.href = response.payment_url;
            }
          }, 3000);
        } else {
          toast.success("Réservation effectuée avec succès !");
        }
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    : ['/media/hotels/hotel1.jpg'];

  // Map amenities to display format
  const amenities = residence.amenities?.map((amenity) => ({
    name: amenity.name,
    available: true
  })) || [];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Normaliser les dates pour comparer seulement les jours (sans heures/minutes/secondes)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Calculer la différence en jours
    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Si c'est aujourd'hui, calculer la différence en minutes
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header avec navigation amélioré */}
  

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 lg:pt-12 lg:pb-8">
        {/* Galerie d'images */}
        <section className="mb-6">
          <Carousel images={images} />
        </section>

        {/* Titre, localisation, note amélioré */}
        <section className="mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight flex-1">{residence.name}</h1>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                  <Users className="w-4 h-4 text-theme-primary" />
                  <span className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                    {residence.max_guests} voyageur{residence.max_guests > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {residence.type && (
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1 text-xs font-medium bg-theme-primary/10 text-theme-primary border border-theme-primary/20"
                  >
                    {residence.type}
                  </Badge>
                )}
                {residence.standing && (
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    {residence.standing}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-4 text-base">
                <MapPin className="w-4 h-4 text-theme-primary flex-shrink-0" />
                <span className="truncate">{residence.address}, {residence.city}, {residence.country}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(parseFloat(residence.average_rating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="font-semibold text-base text-gray-900">{parseFloat(residence.average_rating).toFixed(1)}</span>
                  <span className="text-gray-500 text-xs">({residence.rating_count} avis)</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`px-3 py-1 text-xs font-medium ${
                    residence.is_available 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {residence.is_available ? (
                    <>
                  <Check className="w-3 h-3 mr-1" />
                  Disponible
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 mr-1" />
                      Indisponible
                    </>
                  )}
                </Badge>
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
                  Une expérience de séjour unique vous attend dans cette résidence de type {residence.type.toLowerCase()} avec un standing {residence.standing.toLowerCase()}.
                </p>
              )}
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
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-theme-primary/5 hover:to-theme-primary/10 border border-gray-100 hover:border-theme-primary/20 transition-all duration-300 group"
                  >
                    <span className={`flex-1 font-medium ${amenity.available ? 'text-gray-900 group-hover:text-theme-primary' : 'text-gray-400'}`}>
                      {amenity.name}
                    </span>
                    {amenity.available ? (
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
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
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
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
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
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
                    <div className="w-10 h-10 bg-gradient-to-br from-theme-primary to-theme-accent text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
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
                          // Réinitialiser le formulaire
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
                        <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-accent text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
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
                <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-200 shadow-lg relative">
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
                    className="absolute bottom-2 right-2 bg-white px-3 py-2 rounded-lg shadow-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Ouvrir dans Google Maps
                  </a>
                </div>
              ) : residence.address ? (
                <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-200 shadow-lg relative">
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
                    className="absolute bottom-2 right-2 bg-white px-3 py-2 rounded-lg shadow-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Ouvrir dans Google Maps
                  </a>
                </div>
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden border border-gray-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/10 via-theme-primary/5 to-theme-accent/10" />
                  <div className="text-center z-10 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
                    <MapPin className="w-14 h-14 text-theme-primary mx-auto mb-3 drop-shadow-lg" />
                    <p className="text-gray-800 font-bold text-lg mb-1">{residence.city || 'Localisation'}</p>
                    <p className="text-sm text-gray-600 mb-2">{residence.country}</p>
                    <p className="text-xs text-gray-500 mt-2">Carte non disponible</p>
                  </div>
                </div>
              )}

              {/* Informations supplémentaires */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-theme-primary/20 transition-all">
                  <div className="w-10 h-10 bg-theme-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Ville</p>
                    <p className="font-semibold text-gray-900">{residence.city}</p>
                  </div>
                </div>
                {residence.type && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-theme-primary/20 transition-all">
                    <div className="w-10 h-10 bg-theme-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
                      <p className="font-semibold text-gray-900">{residence.type}</p>
                    </div>
                  </div>
                )}
                {residence.standing && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-theme-primary/20 transition-all">
                    <div className="w-10 h-10 bg-theme-primary/10 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Standing</p>
                      <p className="font-semibold text-gray-900">{residence.standing}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Encadré de réservation amélioré */}
          <aside className="w-full lg:w-96">
            <Card className="p-6 lg:p-8 sticky top-24 shadow-2xl border-0 rounded-3xl bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
              <div className="text-center mb-8">
                <div className="flex items-end justify-center gap-1 mb-3">
                  <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-theme-primary to-theme-accent">
                    {formatPrice(residence.price)}
                  </span>
                  <span className="text-gray-600 text-xl mb-1">FCFA</span>
                </div>
                <p className="text-gray-500 text-sm mb-4">/ nuit</p>
                <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 shadow-sm">
                  <Check className="w-4 h-4 mr-1.5" />
                  Meilleur prix garanti
                </Badge>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="w-4 h-4 text-theme-primary" />
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
                        className="w-full"
                        wrapperClassName="w-full"
                        isClearable
                      />
                      <p className="text-xs text-gray-500 mt-2 font-medium">Arrivée</p>
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
                        className="w-full"
                        wrapperClassName="w-full"
                        isClearable
                        disabled={!startDate}
                      />
                      <p className="text-xs text-gray-500 mt-2 font-medium">Départ</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Voyageurs <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-theme-primary/30 focus:border-theme-primary transition-all shadow-sm hover:shadow-md bg-white"
                    required
                  >
                    {Array.from({ length: residence.max_guests }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} voyageur{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {startDate && endDate && calculateNights() > 0 ? (
                <div className="space-y-3 mb-8 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                  <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                    <span className="text-gray-600">
                      {formatPrice(residence.price)} FCFA × {calculateNights()} nuit{calculateNights() > 1 ? "s" : ""}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice((parseFloat(residence.price) * calculateNights()).toString())} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                    <span className="text-gray-600">Frais de service</span>
                    <span className="text-green-600 font-medium">Gratuit</span>
                  </div>
                  <div className="flex justify-between text-sm py-2">
                    <span className="text-gray-600">Taxes</span>
                    <span className="text-green-600 font-medium">Incluses</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-900">Total</span>
                      <span className="text-2xl font-extrabold text-theme-primary">
                        {formatPrice((parseFloat(residence.price) * calculateNights()).toString())} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 text-center">
                  <p className="text-gray-500 text-sm">Sélectionnez les dates pour voir le prix total</p>
                </div>
              )}

              <Button 
                onClick={handleBooking}
                disabled={!startDate || !endDate || calculateNights() < 1 || bookResidence.isPending || (startDate && endDate && isDateRangeUnavailable(startDate, endDate))}
                className="w-full bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-primary/90 hover:to-theme-accent/90 text-white py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {bookResidence.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin inline-block" />
                    Réservation en cours...
                  </>
                ) : startDate && endDate && isDateRangeUnavailable(startDate, endDate) ? (
                  "Dates non disponibles"
                ) : (
                  "Réserver maintenant"
                )}
              </Button>
              
              <div className="text-center mt-6 space-y-3">
                <p className="text-gray-500 text-sm font-medium">Vous ne serez pas encore débité</p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4 text-theme-primary" />
                  <span className="font-medium">Paiement sécurisé</span>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      {/* Modal d'inscription Customer */}
      <CustomerSignUpModal open={showSignUpModal} onOpenChange={setShowSignUpModal} />
    </div>
  );
} 