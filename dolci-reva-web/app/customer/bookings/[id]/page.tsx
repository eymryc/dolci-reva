"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Download,
  FileText,
  Loader2,
  MapPin,
  QrCode,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useBooking,
  useCancelBooking,
  useReceipt,
} from "@/hooks/use-bookings";
import api from "@/lib/axios";
import { handleError } from "@/lib/error-handler";
import { isAllowedPaymentUrl } from "@/lib/booking-checkout";
import {
  DetailBookingCard,
  DetailInfoTile,
  DetailPageLayout,
  DetailSection,
} from "@/components/front-office/detail/DetailLayout";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/customer/BookingStatusBadge";
import { BookingCancelDeadline } from "@/components/customer/BookingCancelDeadline";
import { BookingCancelSettlementDialog } from "@/components/customer/BookingCancelSettlementDialog";
import { CustomerCreditBanner } from "@/components/customer/CustomerCreditBanner";
import { Button } from "@/components/ui/button";
import { generateReceiptPDF } from "@/lib/generate-receipt-pdf";
import {
  bookableBrowseHref,
  bookableTypeLabel,
  formatBookingDate,
  formatMoney,
  getBookableImage,
  getBookableLocation,
  getBookableTitle,
  getBookingUnitLabel,
  guestsLabel,
  isStayBooking,
} from "@/lib/customer-booking";

function BookingDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = params?.id ? parseInt(params.id as string) : null;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const autoCheckoutStarted = useRef(false);

  const { data: booking, isLoading, error } = useBooking(bookingId || 0);
  const { data: receiptResponse } = useReceipt(bookingId || 0);
  const cancelMutation = useCancelBooking();

  useEffect(() => {
    const payment = searchParams.get("payment");
    const ref = searchParams.get("reference");
    if (payment === "success" && ref) {
      toast.success("Paiement effectué avec succès !", {
        description: `Référence: ${ref}`,
      });
    }
  }, [searchParams]);

  const startPayment = useCallback(async (id: number) => {
    setIsPaying(true);
    try {
      const storageKey = `booking_pay_${id}`;
      let paymentUrl: string | null = null;
      let paidWithCredit = false;
      try {
        paymentUrl = sessionStorage.getItem(storageKey);
      } catch {
        paymentUrl = null;
      }

      if (!paymentUrl) {
        const response = await api.post(`/bookings/${id}/pay`);
        paymentUrl =
          response.data?.payment_url ??
          response.data?.authorization_url ??
          null;
        paidWithCredit = Boolean(response.data?.paid_with_credit);
      }

      if (!paymentUrl || typeof paymentUrl !== "string" || !isAllowedPaymentUrl(paymentUrl)) {
        if (paidWithCredit) {
          toast.success("Réservation payée avec votre avoir Dolci");
          router.refresh();
          return;
        }
        toast.error(
          "Impossible d'obtenir un lien de paiement Paystack valide."
        );
        return;
      }

      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }

      window.location.assign(paymentUrl);
    } catch (err) {
      handleError(err, {
        defaultMessage:
          "Erreur Paystack : impossible d'ouvrir la page de paiement",
      });
    } finally {
      setIsPaying(false);
    }
  }, [router]);

  // Après "Réserver maintenant" (?checkout=1) → ouvrir Paystack automatiquement
  useEffect(() => {
    if (!booking || isLoading) return;
    if (searchParams.get("checkout") !== "1") return;
    if (autoCheckoutStarted.current) return;

    const unpaid =
      booking.payment_status === "EN_ATTENTE" ||
      booking.payment_status === "ECHEC";
    if (!unpaid || booking.status === "ANNULE") {
      router.replace(`/customer/bookings/${booking.id}`);
      return;
    }

    autoCheckoutStarted.current = true;
    void startPayment(booking.id).finally(() => {
      router.replace(`/customer/bookings/${booking.id}`);
    });
  }, [booking, isLoading, searchParams, router, startPayment]);

  const handleViewReceipt = async () => {
    if (!receiptResponse?.data) {
      toast.error("Impossible de générer le reçu. Veuillez réessayer.");
      return;
    }
    try {
      setIsGeneratingPDF(true);
      await generateReceiptPDF(receiptResponse.data);
      toast.success("Reçu généré et téléchargé avec succès");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la génération du reçu");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePayNow = async () => {
    if (!booking) return;
    await startPayment(booking.id);
  };

  if (isLoading || (isPaying && searchParams.get("checkout") === "1")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#f08400]" />
          <p className="text-[#12100c]/60">
            {isPaying
              ? "Redirection vers le paiement…"
              : "Chargement du séjour…"}
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold text-[#12100c]">Introuvable</h1>
        <p className="mb-6 text-sm text-[#12100c]/60">
          Impossible de charger les détails de la réservation.
        </p>
        <Link href="/customer/bookings">
          <Button className="rounded-none bg-[#f08400] hover:bg-[#d97400]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux réservations
          </Button>
        </Link>
      </div>
    );
  }

  const title = getBookableTitle(booking);
  const location = getBookableLocation(booking);
  const image = getBookableImage(booking);
  const typeLabel = bookableTypeLabel(booking.bookable_type, booking.bookable);
  const unitLabel = getBookingUnitLabel(booking);
  const canCancel =
    booking.status !== "ANNULE" && booking.status !== "COMPLETE";
  const isUnpaid =
    booking.payment_status === "EN_ATTENTE" ||
    booking.payment_status === "ECHEC";
  const showPayCta = isUnpaid && booking.status !== "ANNULE";

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
        <Link
          href="/customer/bookings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#12100c]/60 hover:text-[#f08400]"
        >
          <ArrowLeft className="h-4 w-4" />
          Mes réservations
        </Link>
      </div>

      <DetailPageLayout
        gallery={
          <div className="relative aspect-[21/9] min-h-[200px] overflow-hidden bg-[#12100c]/05 sm:min-h-[280px]">
            {image ? (
              <Image
                src={image}
                alt={title}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1152px"
                priority
              />
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center bg-gradient-to-br from-[#fff4e8] to-[#faf8f5] sm:min-h-[280px]">
                <span className="text-lg font-semibold text-[#f08400]">
                  {typeLabel}
                </span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#12100c]/50 to-transparent" />
          </div>
        }
        header={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f08400]">
                {typeLabel}
              </p>
              <div className="mt-2 h-px w-14 bg-gradient-to-r from-[#f08400] to-transparent" />
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#12100c] sm:text-4xl">
                {title}
              </h1>
              {unitLabel ? (
                <p className="mt-2 text-sm font-semibold text-[#f08400]">
                  {unitLabel}
                </p>
              ) : null}
              {location ? (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-[#12100c]/55">
                  <MapPin className="h-4 w-4 text-[#f08400]" />
                  {location}
                </p>
              ) : null}
              <p className="mt-2 font-mono text-xs text-[#12100c]/40">
                {booking.booking_reference}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <BookingStatusBadge status={booking.status} />
              <PaymentStatusBadge status={booking.payment_status} />
            </div>
          </div>
        }
        sidebar={
          <DetailBookingCard className="rounded-none border border-[#12100c]/08 shadow-[0_20px_50px_-30px_rgba(18,16,12,0.45)]">
            <CustomerCreditBanner className="mb-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f08400]">
              Prochaines actions
            </p>
            <div className="mt-4 border border-[#f08400]/20 bg-[#fff4e8]/50 p-4 text-center">
              <p className="text-xs text-[#12100c]/55">Montant total</p>
              <p className="mt-1 text-2xl font-bold text-[#f08400]">
                {formatMoney(booking.total_price)}{" "}
                <span className="text-sm font-medium text-[#12100c]/50">
                  FCFA
                </span>
              </p>
              {Number(booking.credit_applied) > 0 ? (
                <p className="mt-2 text-xs text-emerald-700">
                  Avoir appliqué : {formatMoney(Number(booking.credit_applied))}
                  {Number(booking.amount_due) > 0
                    ? ` · reste ${formatMoney(Number(booking.amount_due))}`
                    : " · réservation couverte"}
                </p>
              ) : null}
            </div>

            {showPayCta ? (
              <div className="mt-4 border border-[#f08400] bg-[#f08400]/10 p-4">
                <p className="mb-3 text-center text-sm font-semibold text-[#12100c]">
                  Finalisez votre réservation en payant maintenant
                </p>
                <Button
                  type="button"
                  className="h-12 w-full rounded-none bg-[#f08400] text-base font-bold hover:bg-[#d97400]"
                  onClick={handlePayNow}
                  disabled={isPaying}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Redirection…
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Payer maintenant
                    </>
                  )}
                </Button>
              </div>
            ) : null}

            <div className="mt-4">
              <BookingCancelDeadline booking={booking} />
            </div>

            <div className="mt-4 space-y-2">
              {!showPayCta && isUnpaid ? (
                <Button
                  type="button"
                  className="h-11 w-full rounded-none bg-[#f08400] font-semibold hover:bg-[#d97400]"
                  onClick={handlePayNow}
                  disabled={isPaying}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirection…
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payer maintenant
                    </>
                  )}
                </Button>
              ) : null}
              <Button
                type="button"
                className="h-11 w-full rounded-none bg-[#f08400] font-semibold hover:bg-[#d97400]"
                onClick={handleViewReceipt}
                disabled={isGeneratingPDF || !receiptResponse?.data}
              >
                <Download
                  className={`mr-2 h-4 w-4 ${isGeneratingPDF ? "animate-spin" : ""}`}
                />
                {isGeneratingPDF ? "Génération…" : "Télécharger le reçu PDF"}
              </Button>
              {booking.payment_status === "PAYE" ? (
                <Link
                  href={`/customer/bookings/${booking.id}/receipt`}
                  className="block"
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full rounded-none border-[#12100c]/15"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Reçu &amp; QR check-in
                  </Button>
                </Link>
              ) : null}
              <Link
                href={bookableBrowseHref(booking.bookable_type, booking.bookable)}
                className="block"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-none border-[#12100c]/15"
                >
                  Explorer d&apos;autres lieux
                </Button>
              </Link>
              {canCancel ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-none border-[#d96b6b]/50 bg-[#fdf0f0] font-semibold text-[#b42318] hover:bg-[#f8d7d7] hover:text-[#8f1b12]"
                  onClick={() => setCancelOpen(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Annuler la réservation
                </Button>
              ) : null}
            </div>
          </DetailBookingCard>
        }
      >
        <DetailSection title={isStayBooking(booking) ? "Infos séjour" : "Infos réservation"} className="rounded-none">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailInfoTile
              icon={<Calendar className="h-5 w-5" />}
              label={isStayBooking(booking) ? "Arrivée" : "Début"}
              value={formatBookingDate(booking.start_date)}
            />
            <DetailInfoTile
              icon={<Calendar className="h-5 w-5" />}
              label={isStayBooking(booking) ? "Départ" : "Fin"}
              value={formatBookingDate(booking.end_date)}
            />
            <DetailInfoTile
              icon={<Users className="h-5 w-5" />}
              label={isStayBooking(booking) ? "Personnes" : "Convives"}
              value={guestsLabel(booking)}
            />
            {unitLabel ? (
              <DetailInfoTile
                icon={<FileText className="h-5 w-5" />}
                label={
                  booking.hotel_room
                    ? "Chambre"
                    : booking.night_club_areas?.length
                      ? "Salon / zone"
                      : "Table"
                }
                value={unitLabel}
              />
            ) : null}
            <DetailInfoTile
              icon={<FileText className="h-5 w-5" />}
              label="Réservé le"
              value={formatBookingDate(booking.created_at)}
            />
            <DetailInfoTile
              icon={<CreditCard className="h-5 w-5" />}
              label="Paiement"
              value={
                booking.payment_status === "PAYE"
                  ? "Payé"
                  : booking.payment_status === "EN_ATTENTE"
                    ? "En attente"
                    : booking.payment_status === "ECHEC"
                      ? "Échoué"
                      : "Remboursé"
              }
            />
            <DetailInfoTile
              icon={<MapPin className="h-5 w-5" />}
              label="Type"
              value={typeLabel}
            />
          </div>
          {booking.notes ? (
            <p className="mt-4 border-t border-gray-100 pt-4 text-sm text-[#12100c]/70">
              <span className="font-semibold text-[#12100c]">Notes : </span>
              {booking.notes}
            </p>
          ) : null}
          {booking.cancellation_policy?.summary ? (
            <p className="mt-4 border-t border-gray-100 pt-4 text-sm text-[#12100c]/60">
              <span className="font-semibold text-[#12100c]">
                Politique d&apos;annulation :{" "}
              </span>
              {booking.cancellation_policy.summary}
            </p>
          ) : null}
        </DetailSection>
      </DetailPageLayout>

      <BookingCancelSettlementDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        booking={booking}
        isLoading={cancelMutation.isPending}
        onConfirm={(settlement) => {
          cancelMutation.mutate(
            { id: booking.id, settlement },
            { onSuccess: () => setCancelOpen(false) }
          );
        }}
      />
    </>
  );
}

export default function BookingDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#f08400]" />
        </div>
      }
    >
      <BookingDetailContent />
    </Suspense>
  );
}
