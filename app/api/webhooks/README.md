# Webhooks API

Ce dossier contient les routes API pour recevoir et traiter les webhooks externes.

## Structure

- `/api/webhooks` - Route principale pour recevoir tous les webhooks
- `/api/webhooks/[provider]` - Route dynamique pour recevoir des webhooks de providers spécifiques

## Utilisation

### Route principale

**Endpoint:** `POST /api/webhooks`

Cette route reçoit les webhooks et les transmet à votre API backend à l'endpoint `webhooks/process`.

**Exemple de requête:**

```bash
curl -X POST https://votre-domaine.com/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.completed",
    "data": {
      "transaction_id": "12345",
      "amount": 10000,
      "status": "success"
    }
  }'
```

### Route avec provider

**Endpoint:** `POST /api/webhooks/[provider]`

Cette route permet de recevoir des webhooks de différents providers (paiement, notifications, etc.).

**Exemples:**

```bash
# Webhook de paiement
curl -X POST https://votre-domaine.com/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "12345",
    "amount": 10000,
    "status": "success"
  }'

# Webhook Stripe
curl -X POST https://votre-domaine.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: ..." \
  -d '{...}'
```

## Configuration

### Variables d'environnement

Ajoutez dans votre fichier `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://dolci-reva.achalivre-afrique.ci/api/
API_TOKEN=your-api-token-if-needed
```

### Endpoints API backend

Les webhooks sont transmis aux endpoints suivants de votre API backend:

- Route principale: `POST /api/webhooks/process`
- Route provider: `POST /api/webhooks/{provider}`

Assurez-vous que ces endpoints existent dans votre API backend.

## Sécurité

### Vérification de signature (recommandé)

Pour sécuriser vos webhooks, vous pouvez ajouter une vérification de signature. Décommentez et implémentez la fonction de vérification dans les routes:

```typescript
// Exemple pour Stripe
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function verifyStripeSignature(body: any, signature: string): boolean {
  try {
    stripe.webhooks.constructEvent(
      JSON.stringify(body),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    return true;
  } catch (err) {
    return false;
  }
}
```

## Format de réponse

### Succès

```json
{
  "success": true,
  "message": "Webhook traité avec succès",
  "data": {
    // Données retournées par votre API backend
  }
}
```

### Erreur

```json
{
  "success": false,
  "error": "Erreur lors du traitement du webhook",
  "message": "Description de l'erreur"
}
```

## Test

Vous pouvez tester les endpoints avec:

```bash
# Test de la route principale
curl -X GET https://votre-domaine.com/api/webhooks

# Test de la route provider
curl -X GET https://votre-domaine.com/api/webhooks/payment
```

Ces requêtes GET retournent un message de confirmation que l'endpoint est actif.




