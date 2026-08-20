"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Cette page a déménagé sous /customer/bookings (espace client unifié,
 * cf. redesign du 10/07/2026). Conservée ici uniquement pour ne pas casser
 * d'anciens liens/favoris.
 */
export default function LegacyBookingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/customer/bookings");
  }, [router]);

  return null;
}
