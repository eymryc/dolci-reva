# Exemples d'utilisation des Webhooks

## Exemple 1: Webhook de paiement simple

### Configuration du webhook externe

Dans votre service de paiement (ex: Stripe, PayPal, etc.), configurez l'URL de webhook:

```
https://votre-domaine.com/api/webhooks/payment
```

### Données reçues du webhook

```json
{
  "event": "payment.completed",
  "transaction_id": "txn_123456789",
  "amount": 10000,
  "currency": "FCFA",
  "status": "success",
  "customer_id": "cust_123",
  "booking_id": "booking_456"
}
```

### Traitement dans votre API backend

Votre API backend recevra ces données à l'endpoint `POST /api/webhooks/payment` et pourra:

1. Vérifier le statut du paiement
2. Mettre à jour la réservation
3. Envoyer un email de confirmation
4. etc.

## Exemple 2: Webhook avec vérification de signature

### Route sécurisée avec Stripe

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import apiServer from "@/lib/axios-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    
    if (!signature) {
      return NextResponse.json(
        { error: "Signature manquante" },
        { status: 401 }
      );
    }
    
    // Vérifier la signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Envoyer à votre API backend
    const response = await apiServer.post("webhooks/stripe", {
      event_type: event.type,
      data: event.data.object,
      received_at: new Date().toISOString(),
    });
    
    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

## Exemple 3: Webhook pour notifications

### Configuration

```
https://votre-domaine.com/api/webhooks/notifications
```

### Données reçues

```json
{
  "type": "booking.reminder",
  "booking_id": "booking_456",
  "user_id": "user_123",
  "message": "Votre réservation commence demain",
  "scheduled_at": "2024-01-15T10:00:00Z"
}
```

## Exemple 4: Test local avec ngrok

Pour tester les webhooks en local:

1. Installez ngrok: `npm install -g ngrok`
2. Démarrez votre serveur Next.js: `npm run dev`
3. Exposez votre serveur: `ngrok http 3000`
4. Utilisez l'URL ngrok dans votre service de webhook:
   ```
   https://abc123.ngrok.io/api/webhooks/payment
   ```

## Exemple 5: Logging et monitoring

Ajoutez des logs pour suivre les webhooks:

```typescript
// Dans votre route webhook
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Logger le webhook reçu
  console.log("[WEBHOOK]", {
    timestamp: new Date().toISOString(),
    body,
    headers: Object.fromEntries(request.headers.entries()),
  });
  
  // Traitement...
}
```

## Exemple 6: Webhook avec retry

Si votre API backend est temporairement indisponible, vous pouvez implémenter un système de retry:

```typescript
async function sendToBackendWithRetry(data: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await apiServer.post("webhooks/process", data);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```




