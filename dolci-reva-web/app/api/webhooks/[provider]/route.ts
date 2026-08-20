import { NextResponse } from "next/server";

/** Proxy webhook désactivé — Paystack → API Laravel directe. */
export async function POST() {
  return NextResponse.json(
    {
      error: "Webhook relay disabled. Configure Paystack to call the API directly.",
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json({ error: "Webhook relay disabled." }, { status: 410 });
}
