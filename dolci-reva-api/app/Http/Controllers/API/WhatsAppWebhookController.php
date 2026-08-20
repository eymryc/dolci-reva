<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\WhatsAppConversationService;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class WhatsAppWebhookController extends Controller
{
    public function __construct(
        private WhatsAppService $whatsAppService,
        private WhatsAppConversationService $conversationService,
    ) {
    }

    /**
     * Handshake de vérification exigé par Meta lors de la configuration du
     * webhook dans le tableau de bord de l'app WhatsApp Business.
     */
    public function verify(Request $request)
    {
        $mode = $request->query('hub_mode', $request->query('hub.mode'));
        $token = $request->query('hub_verify_token', $request->query('hub.verify_token'));
        $challenge = $request->query('hub_challenge', $request->query('hub.challenge'));

        $expectedToken = config('services.whatsapp.verify_token');

        if ($mode === 'subscribe' && $expectedToken && hash_equals($expectedToken, (string) $token)) {
            return response($challenge, Response::HTTP_OK);
        }

        return response('Forbidden', Response::HTTP_FORBIDDEN);
    }

    /**
     * Réception des messages entrants WhatsApp.
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('X-Hub-Signature-256');

        if (!$this->whatsAppService->verifySignature($payload, $signature)) {
            Log::warning('Invalid WhatsApp webhook signature');
            return response()->json(['success' => false], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($payload, true) ?? [];

        foreach ($data['entry'] ?? [] as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                foreach ($change['value']['messages'] ?? [] as $message) {
                    $this->processMessage($message);
                }
            }
        }

        // Meta exige un 200 rapide, sans quoi il retente/désactive le webhook.
        return response()->json(['success' => true]);
    }

    private function processMessage(array $message): void
    {
        $from = $message['from'] ?? null;
        $text = $message['text']['body'] ?? null;

        if (!$from || $text === null) {
            // Type de message non supporté pour l'instant (image, audio, bouton...).
            return;
        }

        $this->conversationService->handleIncomingMessage($from, $text);
    }
}
