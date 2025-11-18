import { NextRequest, NextResponse } from "next/server";
import { apiServerPublic } from "@/lib/axios-server";

/**
 * Route API pour recevoir les webhooks et les transmettre à l'API backend
 * 
 * POST /api/webhooks
 * 
 * Le webhook externe enverra ses données à cette route,
 * qui les transmettra ensuite à votre API backend.
 * 
 * URL autorisée: https://dolci-reva-x27q.vercel.app
 */
const ALLOWED_WEBHOOK_URL = 'https://dolci-reva-x27q.vercel.app';

export async function POST(request: NextRequest) {
  try {
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
    
    // En production, vous pouvez être plus strict, mais pour les webhooks externes,
    // on accepte aussi les requêtes directes (sans origin/referer)
    // car les services de webhook n'envoient généralement pas ces headers
    
    // Récupérer les données du webhook
    const body = await request.json();
    
    // Récupérer les headers du webhook (utile pour la vérification de signature, etc.)
    const headers = Object.fromEntries(request.headers.entries());
    
    // Optionnel : Vérifier la signature du webhook si nécessaire
    // const signature = headers['x-webhook-signature'];
    // if (!verifyWebhookSignature(body, signature)) {
    //   return NextResponse.json(
    //     { error: "Signature invalide" },
    //     { status: 401 }
    //   );
    // }
    
    // Logger l'origine pour le débogage
    console.log('[WEBHOOK] Requête reçue:', {
      origin,
      host,
      requestUrl,
      isAllowedOrigin,
      timestamp: new Date().toISOString(),
    });
    
    // Préparer les données à envoyer à votre API
    const webhookData = {
      ...body,
      received_at: new Date().toISOString(),
      source_url: ALLOWED_WEBHOOK_URL,
      headers: {
        // Inclure seulement les headers pertinents
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
        // Ajoutez d'autres headers si nécessaire
      },
    });
    
    // Retourner la réponse de votre API au webhook
    return NextResponse.json(
      {
        success: true,
        message: "Webhook traité avec succès",
        data: response.data,
      },
      { status: 200 }
    );
    
  } catch (error: unknown) {
    console.error("Erreur lors du traitement du webhook:", error);
    
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
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du traitement du webhook",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * Route GET pour vérifier que le webhook est accessible
 */
export async function GET() {
  return NextResponse.json(
    {
      message: "Endpoint webhook actif",
      endpoint: "/api/webhooks",
      method: "POST",
    },
    { status: 200 }
  );
}

