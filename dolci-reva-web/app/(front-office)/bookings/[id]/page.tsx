"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

/**
 * Cette page a déménagé sous /customer/bookings/[id] (espace client unifié,
 * cf. redesign du 10/07/2026). Conservée ici uniquement pour ne pas casser
 * d'anciens liens/favoris (et le fallback de PaymentController::callback()
 * pour d'éventuels anciens clients).
 */
export default function LegacyBookingDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(`/customer/bookings/${params?.id}${query ? `?${query}` : ""}`);
  }, [router, params, searchParams]);

  return null;
}
