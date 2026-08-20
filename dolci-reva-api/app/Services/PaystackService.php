<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;
use InvalidArgumentException;
use RuntimeException;

class PaystackService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.paystack.url', 'https://api.paystack.co'), '/');
    }

    protected function secretKey(): string
    {
        return (string) config('services.paystack.secret_key', '');
    }

    protected function publicKey(): string
    {
        return (string) config('services.paystack.public_key', '');
    }

    /**
     * Initialize a payment transaction (Redirect flow).
     *
     * @see https://paystack.com/docs/payments/accept-payments/#redirect
     * @see https://paystack.com/docs/api/#transaction-initialize
     *
     * @param array{email: string, amount: float|int|string, reference?: string, callback_url?: string|null, metadata?: array, currency?: string, channels?: array} $data
     * @return array
     */
    public function initializeTransaction(array $data): array
    {
        $this->assertConfigured();

        $email = trim((string) ($data['email'] ?? ''));
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Email client invalide pour Paystack.');
        }

        $currency = strtoupper((string) ($data['currency'] ?? 'XOF'));
        $amountMajor = (float) ($data['amount'] ?? 0);
        if ($amountMajor <= 0) {
            throw new InvalidArgumentException('Le montant Paystack doit être supérieur à 0.');
        }

        // Paystack exige le montant en subunit (×100), y compris pour XOF.
        // @see https://paystack.com/docs/api/#supported-currency
        $amountSubunit = (int) round($amountMajor * 100);

        $payload = array_filter([
            'email' => $email,
            'amount' => $amountSubunit,
            'reference' => $data['reference'] ?? $this->generateReference(),
            'callback_url' => $data['callback_url'] ?? null,
            'metadata' => $data['metadata'] ?? [],
            'currency' => $currency,
            'channels' => $data['channels'] ?? $this->defaultChannels($currency),
        ], fn ($value) => $value !== null && $value !== []);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey(),
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($this->baseUrl . '/transaction/initialize', $payload);

            $body = $response->json() ?? [];

            if ($response->successful() && ($body['status'] ?? false) === true) {
                return $body;
            }

            $message = $body['message']
                ?? ('Paystack API Error HTTP ' . $response->status() . ': ' . $response->body());

            Log::error('Paystack Initialize Transaction failed', [
                'status' => $response->status(),
                'body' => $body,
                'payload' => array_merge($payload, ['amount_major' => $amountMajor]),
            ]);

            throw new RuntimeException('Paystack: ' . $message);
        } catch (RuntimeException|InvalidArgumentException $e) {
            throw $e;
        } catch (Exception $e) {
            Log::error('Paystack Initialize Transaction Error: ' . $e->getMessage());
            throw new RuntimeException('Impossible de contacter Paystack: ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Verify a payment transaction
     *
     * @see https://paystack.com/docs/payments/verify-payments/
     */
    public function verifyTransaction(string $reference): array
    {
        $this->assertConfigured();

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey(),
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->get($this->baseUrl . '/transaction/verify/' . rawurlencode($reference));

            $body = $response->json() ?? [];

            if ($response->successful() && ($body['status'] ?? false) === true) {
                return $body;
            }

            throw new RuntimeException(
                'Paystack: ' . ($body['message'] ?? ('Verify failed HTTP ' . $response->status()))
            );
        } catch (RuntimeException $e) {
            throw $e;
        } catch (Exception $e) {
            Log::error('Paystack Verify Transaction Error: ' . $e->getMessage());
            throw new RuntimeException('Impossible de vérifier le paiement Paystack: ' . $e->getMessage(), 0, $e);
        }
    }

    public function getTransaction(string $reference): array
    {
        return $this->verifyTransaction($reference);
    }

    public function listTransactions(array $params = []): array
    {
        $this->assertConfigured();

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey(),
            'Accept' => 'application/json',
        ])->get($this->baseUrl . '/transaction', $params);

        if ($response->successful()) {
            return $response->json();
        }

        throw new RuntimeException('Paystack API Error: ' . $response->body());
    }

    /**
     * Refund a transaction (fully or partially).
     *
     * @see https://paystack.com/docs/refunds/
     */
    public function refundTransaction(string $reference, ?float $amount = null): array
    {
        $this->assertConfigured();

        $payload = ['transaction' => $reference];
        if ($amount !== null) {
            $payload['amount'] = (int) round($amount * 100);
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey(),
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->post($this->baseUrl . '/refund', $payload);

        $body = $response->json() ?? [];

        if ($response->successful() && ($body['status'] ?? false) === true) {
            return $body;
        }

        throw new RuntimeException(
            'Paystack: ' . ($body['message'] ?? ('Refund failed HTTP ' . $response->status()))
        );
    }

    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        if ($this->secretKey() === '') {
            return false;
        }

        $computedSignature = hash_hmac('sha512', $payload, $this->secretKey());

        return hash_equals($computedSignature, $signature);
    }

    public function generateReference(): string
    {
        return 'TXN_' . time() . '_' . uniqid();
    }

    public function getPublicKey(): string
    {
        return $this->publicKey();
    }

    public function isConfigured(): bool
    {
        return $this->secretKey() !== '';
    }

    /**
     * Liste des banques / opérateurs mobile money pour une devise.
     *
     * @see https://paystack.com/docs/api/miscellaneous/#bank
     */
    public function listBanks(?string $currency = 'XOF', ?string $type = null): array
    {
        $this->assertConfigured();

        $params = array_filter([
            'currency' => $currency ? strtoupper($currency) : null,
            'type' => $type,
        ], fn ($v) => $v !== null && $v !== '');

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey(),
            'Accept' => 'application/json',
        ])->get($this->baseUrl . '/bank', $params);

        $body = $response->json() ?? [];

        if ($response->successful() && ($body['status'] ?? false) === true) {
            return $body;
        }

        throw new RuntimeException(
            'Paystack: ' . ($body['message'] ?? ('List banks failed HTTP ' . $response->status()))
        );
    }

    /**
     * Crée un destinataire de transfert Paystack.
     *
     * @see https://paystack.com/docs/transfers/single-transfers/#create-a-transfer-recipient
     *
     * @param array{type: string, name: string, account_number: string, bank_code?: string, currency?: string, metadata?: array} $data
     */
    public function createTransferRecipient(array $data): array
    {
        $this->assertConfigured();

        $payload = array_filter([
            'type' => $data['type'] ?? null,
            'name' => $data['name'] ?? null,
            'account_number' => $data['account_number'] ?? null,
            'bank_code' => $data['bank_code'] ?? null,
            'currency' => strtoupper((string) ($data['currency'] ?? 'XOF')),
            'metadata' => $data['metadata'] ?? null,
        ], fn ($v) => $v !== null && $v !== []);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey(),
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->post($this->baseUrl . '/transferrecipient', $payload);

        $body = $response->json() ?? [];

        if ($response->successful() && ($body['status'] ?? false) === true) {
            return $body;
        }

        $message = $body['message']
            ?? ('Create transfer recipient failed HTTP ' . $response->status());

        Log::warning('Paystack createTransferRecipient failed', [
            'status' => $response->status(),
            'body' => $body,
            'payload' => $payload,
        ]);

        throw new RuntimeException('Paystack: ' . $message);
    }

    /**
     * Initie un transfert depuis le solde Paystack.
     *
     * @see https://paystack.com/docs/transfers/single-transfers/#send-money
     *
     * @param array{amount: float|int, recipient: string, reference?: string, reason?: string, currency?: string, source?: string} $data
     *        amount en unité majeure (converti en subunit ×100)
     */
    public function initiateTransfer(array $data): array
    {
        $this->assertConfigured();

        $amountMajor = (float) ($data['amount'] ?? 0);
        if ($amountMajor <= 0) {
            throw new InvalidArgumentException('Le montant du transfert doit être supérieur à 0.');
        }

        $payload = array_filter([
            'source' => $data['source'] ?? 'balance',
            'amount' => (int) round($amountMajor * 100),
            'recipient' => $data['recipient'] ?? null,
            'reference' => $data['reference'] ?? ('TRF_' . time() . '_' . uniqid()),
            'reason' => $data['reason'] ?? null,
            'currency' => strtoupper((string) ($data['currency'] ?? 'XOF')),
        ], fn ($v) => $v !== null && $v !== '');

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey(),
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->post($this->baseUrl . '/transfer', $payload);

        $body = $response->json() ?? [];

        if ($response->successful() && ($body['status'] ?? false) === true) {
            return $body;
        }

        $message = $body['message']
            ?? ('Initiate transfer failed HTTP ' . $response->status());

        Log::error('Paystack initiateTransfer failed', [
            'status' => $response->status(),
            'body' => $body,
            'payload' => array_merge($payload, ['amount_major' => $amountMajor]),
        ]);

        throw new RuntimeException('Paystack: ' . $message);
    }

    /**
     * Vérifie un transfert par référence.
     *
     * @see https://paystack.com/docs/transfers/single-transfers/#verify-a-transfer
     */
    public function verifyTransfer(string $reference): array
    {
        $this->assertConfigured();

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey(),
            'Accept' => 'application/json',
        ])->get($this->baseUrl . '/transfer/verify/' . rawurlencode($reference));

        $body = $response->json() ?? [];

        if ($response->successful() && ($body['status'] ?? false) === true) {
            return $body;
        }

        throw new RuntimeException(
            'Paystack: ' . ($body['message'] ?? ('Verify transfer failed HTTP ' . $response->status()))
        );
    }

    private function assertConfigured(): void
    {
        if (!$this->isConfigured()) {
            throw new RuntimeException(
                'Paystack n\'est pas configuré. Renseignez PAYSTACK_SECRET_KEY et PAYSTACK_PUBLIC_KEY dans le .env (clés sk_test_… / pk_test_… du dashboard Paystack).'
            );
        }
    }

    /**
     * Canaux utiles pour XOF (Côte d'Ivoire) et devises voisines.
     */
    private function defaultChannels(string $currency): array
    {
        return match ($currency) {
            'XOF' => ['card', 'mobile_money', 'bank', 'ussd'],
            'NGN' => ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
            'GHS' => ['card', 'mobile_money', 'bank'],
            default => ['card', 'mobile_money'],
        };
    }
}
