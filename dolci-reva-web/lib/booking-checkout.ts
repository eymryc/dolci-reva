/**
 * Après création d'une réservation : envoie vers Paystack si possible,
 * sinon vers la fiche client qui déclenche le checkout automatiquement.
 */

const ALLOWED_PAYMENT_HOSTS = new Set([
  "checkout.paystack.com",
  "paystack.com",
  "standard.paystack.co",
]);

function isAllowedPaymentUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (ALLOWED_PAYMENT_HOSTS.has(host)) return true;
    // allow subdomains of paystack.com
    return host.endsWith(".paystack.com") || host.endsWith(".paystack.co");
  } catch {
    return false;
  }
}

export function redirectAfterBooking(
  bookingId: number,
  paymentUrl?: string | null
) {
  const url = typeof paymentUrl === "string" ? paymentUrl.trim() : "";

  if (url.startsWith("http") && isAllowedPaymentUrl(url)) {
    try {
      sessionStorage.setItem(`booking_pay_${bookingId}`, url);
    } catch {
      /* ignore */
    }
    window.location.assign(url);
    return;
  }

  window.location.assign(`/customer/bookings/${bookingId}?checkout=1`);
}

/** Extrait l'id booking depuis la réponse API book (data.id ou id). */
export function getBookingIdFromResponse(response: unknown): number | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  const data = r.data;
  if (data && typeof data === "object" && data !== null && "id" in data) {
    const id = Number((data as { id: unknown }).id);
    return Number.isFinite(id) ? id : null;
  }
  if ("id" in r) {
    const id = Number(r.id);
    return Number.isFinite(id) ? id : null;
  }
  return null;
}

/** Extrait payment_url (racine ou nested) depuis la réponse book. */
export function getPaymentUrlFromResponse(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  for (const key of ["payment_url", "authorization_url"] as const) {
    const v = r[key];
    if (typeof v === "string" && v.startsWith("http") && isAllowedPaymentUrl(v))
      return v;
  }
  const data = r.data;
  if (data && typeof data === "object" && data !== null) {
    const d = data as Record<string, unknown>;
    for (const key of ["payment_url", "authorization_url"] as const) {
      const v = d[key];
      if (typeof v === "string" && v.startsWith("http") && isAllowedPaymentUrl(v))
        return v;
    }
  }
  return null;
}

export function formatQuoteAmount(amount: number): string {
  return Math.round(amount).toLocaleString("fr-FR");
}

export { isAllowedPaymentUrl };
