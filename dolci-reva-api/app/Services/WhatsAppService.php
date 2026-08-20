<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected ?string $phoneNumberId;
    protected ?string $accessToken;
    protected ?string $appSecret;
    protected string $apiVersion;
    protected string $baseUrl;

    public function __construct()
    {
        $this->phoneNumberId = config('services.whatsapp.phone_number_id');
        $this->accessToken = config('services.whatsapp.access_token');
        $this->appSecret = config('services.whatsapp.app_secret');
        $this->apiVersion = config('services.whatsapp.api_version', 'v20.0');
        $this->baseUrl = rtrim(config('services.whatsapp.url', 'https://graph.facebook.com'), '/');
    }

    /**
     * Indique si les identifiants Meta sont configurés. Tant que ce n'est
     * pas le cas, sendText() se contente de journaliser le message au lieu
     * d'appeler l'API Graph — même logique de repli que MAIL_MAILER=log.
     */
    public function isConfigured(): bool
    {
        return !empty($this->phoneNumberId) && !empty($this->accessToken);
    }

    /**
     * Envoie un simple message texte au numéro donné (format international
     * sans "+", ex: "2250700000000").
     */
    public function sendText(string $to, string $message): bool
    {
        if (!$this->isConfigured()) {
            Log::info('[WhatsApp:log-mode] Message à envoyer', ['to' => $to, 'message' => $message]);
            return true;
        }

        try {
            $response = Http::withToken($this->accessToken)
                ->post("{$this->baseUrl}/{$this->apiVersion}/{$this->phoneNumberId}/messages", [
                    'messaging_product' => 'whatsapp',
                    'to' => $to,
                    'type' => 'text',
                    'text' => ['body' => $message],
                ]);

            if (!$response->successful()) {
                Log::error('WhatsApp sendText error', ['to' => $to, 'response' => $response->body()]);
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('WhatsApp sendText exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoie une liste numérotée sous forme de texte simple (les listes
     * interactives natives WhatsApp nécessitent des templates pré-approuvés ;
     * un message texte listant "1. ... 2. ..." reste universellement supporté
     * et fonctionne aussi bien sur feature phone via WhatsApp que sur smartphone).
     *
     * @param array<int, string> $items
     */
    public function sendNumberedList(string $to, string $header, array $items, ?string $footer = null): bool
    {
        $lines = [$header, ''];
        foreach (array_values($items) as $index => $item) {
            $lines[] = ($index + 1) . '. ' . $item;
        }
        if ($footer) {
            $lines[] = '';
            $lines[] = $footer;
        }

        return $this->sendText($to, implode("\n", $lines));
    }

    /**
     * Vérifie la signature X-Hub-Signature-256 envoyée par Meta sur chaque
     * webhook, pour s'assurer que la requête provient bien de WhatsApp.
     */
    public function verifySignature(string $payload, ?string $signatureHeader): bool
    {
        if (empty($this->appSecret)) {
            // Fail-closed hors local/testing : jamais accepter sans secret en prod
            return app()->environment(['local', 'testing']);
        }

        if (!$signatureHeader || !str_starts_with($signatureHeader, 'sha256=')) {
            return false;
        }

        $expected = 'sha256=' . hash_hmac('sha256', $payload, $this->appSecret);

        return hash_equals($expected, $signatureHeader);
    }
}
