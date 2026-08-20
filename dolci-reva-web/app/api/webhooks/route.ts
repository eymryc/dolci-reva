import { NextResponse } from "next/server";

/**
 * Les webhooks Paystack doivent frapper l'API Laravel directement :
 * POST https://dolci-reva.com/api/payments/webhook
 *
 * Ce proxy Next.js est désactivé (surface d'attaque sans HMAC).
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Webhook relay disabled. Configure Paystack to call the API directly.",
      url: "https://dolci-reva.com/api/payments/webhook",
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Webhook relay disabled." },
    { status: 410 }
  );
}
