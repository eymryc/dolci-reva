import { NextRequest, NextResponse } from "next/server";
import { apiServerPublic } from "@/lib/axios-server";

/**
 * Route API dynamique pour recevoir des webhooks de différents providers
 * 
 * POST /api/webhooks/[provider]
 * 
 * Exemples:
 * - /api/webhooks/payment (pour les webhooks de paiement)
 * - /api/webhooks/stripe (pour Stripe)
 * - /api/webhooks/paypal (pour PayPal)
 * - etc.
 * 
 * URL autorisée: https://dolci-reva-x27q.vercel.app
 */
const ALLOWED_WEBHOOK_URL = 'https://dolci-reva-x27q.vercel.app';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    
    // Vérifier que la requête provient de l'URL autorisée
    const url = request.nextUrl;
    const origin = request.headers.get('origin') || request.headers.get('referer') || '';
    const host = request.headers.get('host') || url.host;
    
    // Construire l'URL complète de la requête
    const requestUrl = `${url.protocol}//${host}${url.pathname}`;
    
    // Vérifier l'origine ou l'URL de la requête
    const isAllowedOrigin = origin.includes(ALLOWED_WEBHOOK_URL) || 
                           requestUrl.includes(ALLOWED_WEBHOOK_URL) ||
                           host.includes('dolci-reva-x27q.vercel.app');
    
    // Récupérer les données du webhook
    const body = await request.json();
    
    // Récupérer les headers du webhook
    const headers = Object.fromEntries(request.headers.entries());
    
    // Logger l'origine pour le débogage
    console.log(`[WEBHOOK ${provider}] Requête reçue:`, {
      origin,
      host,
      requestUrl,
      isAllowedOrigin,
      timestamp: new Date().toISOString(),
    });
    
    // Optionnel : Vérifier la signature du webhook selon le provider
    // if (provider === 'stripe') {
    //   const signature = headers['stripe-signature'];
    //   if (!verifyStripeSignature(body, signature)) {
    //     return NextResponse.json(
    //       { error: "Signature Stripe invalide" },
    //       { status: 401 }
    //     );
    //   }
    // }
    
    // Préparer les données à envoyer à votre API
    const webhookData = {
      provider,
      ...body,
      received_at: new Date().toISOString(),
      source_url: ALLOWED_WEBHOOK_URL,
      headers: {
        'user-agent': headers['user-agent'],
        'x-forwarded-for': headers['x-forwarded-for'],
        'x-real-ip': headers['x-real-ip'],
        'origin': origin,
        'host': host,
      },
    };
    
    // Envoyer les données à votre API backend pour traitement
    // Endpoint backend: payments/webhook
    const response = await apiServerPublic.post('payments/webhook', webhookData, {
      headers: {
        'Content-Type': 'application/json',
        // Headers spécifiques au provider si nécessaire
        ...(headers['x-webhook-secret'] && {
          'X-Webhook-Secret': headers['x-webhook-secret'],
        }),
      },
    });
    
    // Retourner la réponse de votre API au webhook
    return NextResponse.json(
      {
        success: true,
        message: `Webhook ${provider} traité avec succès`,
        data: response.data,
      },
      { status: 200 }
    );
    
  } catch (error: unknown) {
    const { provider } = await params;
    console.error(`Erreur lors du traitement du webhook ${provider}:`, error);
    
    // Gérer les erreurs de l'API
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: unknown } };
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de l'envoi à l'API",
          details: axiosError.response?.data,
        },
        { status: axiosError.response?.status || 500 }
      );
    }
    
    // Erreur de parsing ou autre
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue s'est produite";
    const { provider: providerName } = await params;
    return NextResponse.json(
      {
        success: false,
        error: `Erreur lors du traitement du webhook ${providerName}`,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

