<?php

namespace App\Services;

use App\Models\Hotel;
use App\Models\HotelRoom;
use App\Models\Lounge;
use App\Models\NightClub;
use App\Models\Residence;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\WhatsAppSession;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Moteur conversationnel de réservation par WhatsApp. Ne réimplémente aucune
 * règle métier : il pilote un petit automate d'états et délègue toute la
 * logique de réservation (prix, disponibilité, paiement) à BookingService,
 * exactement comme le fait le front-office web.
 */
class WhatsAppConversationService
{
    private const STATE_IDLE = 'IDLE';
    private const STATE_CHOOSING_TYPE = 'CHOOSING_TYPE';
    private const STATE_CHOOSING_ESTABLISHMENT = 'CHOOSING_ESTABLISHMENT';
    private const STATE_CHOOSING_ROOM = 'CHOOSING_ROOM';
    private const STATE_ASK_START_DATE = 'ASK_START_DATE';
    private const STATE_ASK_END_DATE = 'ASK_END_DATE';
    private const STATE_ASK_GUESTS = 'ASK_GUESTS';

    /**
     * Types d'établissements proposés, avec le modèle à parcourir et la
     * méthode de BookingService à appeler pour créer la réservation.
     */
    private const ESTABLISHMENT_TYPES = [
        '1' => ['label' => 'Résidences', 'model' => Residence::class, 'book_method' => 'saveResidenceBooking'],
        '2' => ['label' => 'Hôtels', 'model' => Hotel::class, 'book_method' => 'saveHotelBooking'],
        '3' => ['label' => 'Restaurants', 'model' => Restaurant::class, 'book_method' => 'saveRestaurantBooking'],
        '4' => ['label' => 'Bars & Lounges', 'model' => Lounge::class, 'book_method' => 'saveLoungeBooking'],
        '5' => ['label' => 'Night-Clubs', 'model' => NightClub::class, 'book_method' => 'saveNightClubBooking'],
    ];

    public function __construct(
        private WhatsAppService $whatsAppService,
        private BookingService $bookingService,
    ) {
    }

    /**
     * Point d'entrée : traite un message texte entrant d'un numéro donné.
     */
    public function handleIncomingMessage(string $phoneNumber, string $text): void
    {
        $session = WhatsAppSession::firstOrCreate(
            ['phone_number' => $phoneNumber],
            ['state' => self::STATE_IDLE, 'context' => []]
        );
        $session->update(['last_message_at' => now()]);

        $text = trim($text);

        // "annuler"/"stop" réinitialise la conversation à tout moment.
        if (in_array(mb_strtolower($text), ['annuler', 'stop', 'menu'], true)) {
            $session->update(['state' => self::STATE_IDLE, 'context' => []]);
            $this->sendMainMenu($phoneNumber);
            return;
        }

        try {
            match ($session->state) {
                self::STATE_IDLE => $this->sendMainMenu($phoneNumber, $session),
                self::STATE_CHOOSING_TYPE => $this->handleChoosingType($session, $text),
                self::STATE_CHOOSING_ESTABLISHMENT => $this->handleChoosingEstablishment($session, $text),
                self::STATE_CHOOSING_ROOM => $this->handleChoosingRoom($session, $text),
                self::STATE_ASK_START_DATE => $this->handleStartDate($session, $text),
                self::STATE_ASK_END_DATE => $this->handleEndDate($session, $text),
                self::STATE_ASK_GUESTS => $this->handleGuests($session, $text),
                default => $this->sendMainMenu($phoneNumber, $session),
            };
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('WhatsApp conversation error: ' . $e->getMessage());
            $this->whatsAppService->sendText($phoneNumber, "Désolé, une erreur est survenue. Tapez \"menu\" pour recommencer.");
        }
    }

    private function sendMainMenu(string $phoneNumber, ?WhatsAppSession $session = null): void
    {
        $session ??= WhatsAppSession::where('phone_number', $phoneNumber)->first();
        $session?->update(['state' => self::STATE_CHOOSING_TYPE, 'context' => []]);

        $items = array_map(fn ($t) => $t['label'], self::ESTABLISHMENT_TYPES);
        $this->whatsAppService->sendNumberedList(
            $phoneNumber,
            'Bienvenue chez Dolci Rêva ! Que souhaitez-vous réserver ?',
            $items,
            'Répondez avec le numéro de votre choix.'
        );
    }

    private function handleChoosingType(WhatsAppSession $session, string $text): void
    {
        $choice = self::ESTABLISHMENT_TYPES[$text] ?? null;

        if (!$choice) {
            $this->whatsAppService->sendText($session->phone_number, "Choix invalide. Répondez avec un numéro entre 1 et " . count(self::ESTABLISHMENT_TYPES) . ".");
            return;
        }

        /** @var \Illuminate\Database\Eloquent\Model $modelClass */
        $modelClass = $choice['model'];
        $establishments = $modelClass::where('is_active', true)->orderBy('created_at', 'desc')->limit(5)->get(['id', 'name', 'city']);

        if ($establishments->isEmpty()) {
            $this->whatsAppService->sendText($session->phone_number, "Aucun établissement disponible pour le moment dans cette catégorie. Tapez \"menu\" pour revenir en arrière.");
            return;
        }

        $session->update([
            'state' => self::STATE_CHOOSING_ESTABLISHMENT,
            'context' => ['type_key' => $text, 'establishment_ids' => $establishments->pluck('id')->all()],
        ]);

        $items = $establishments->map(fn ($e) => $e->name . ($e->city ? " ({$e->city})" : ''))->all();
        $this->whatsAppService->sendNumberedList($session->phone_number, "Voici les {$choice['label']} disponibles :", $items, 'Répondez avec le numéro de votre choix.');
    }

    private function handleChoosingEstablishment(WhatsAppSession $session, string $text): void
    {
        $context = $session->context ?? [];
        $index = ((int) $text) - 1;
        $ids = $context['establishment_ids'] ?? [];

        if (!isset($ids[$index])) {
            $this->whatsAppService->sendText($session->phone_number, "Choix invalide. Répondez avec un des numéros proposés.");
            return;
        }

        $context['establishment_id'] = $ids[$index];
        $typeChoice = self::ESTABLISHMENT_TYPES[$context['type_key']];

        // Cas hôtel : il faut choisir une chambre précise (prix réel dessus).
        if ($typeChoice['model'] === Hotel::class) {
            $rooms = HotelRoom::where('hotel_id', $context['establishment_id'])
                ->where('is_active', true)
                ->where('is_available', true)
                ->limit(5)
                ->get(['id', 'name', 'type', 'price']);

            if ($rooms->isEmpty()) {
                $this->whatsAppService->sendText($session->phone_number, "Aucune chambre disponible dans cet hôtel actuellement. Tapez \"menu\" pour recommencer.");
                return;
            }

            $context['room_ids'] = $rooms->pluck('id')->all();
            $session->update(['state' => self::STATE_CHOOSING_ROOM, 'context' => $context]);

            $items = $rooms->map(fn ($r) => ($r->name ?: $r->type) . ' - ' . number_format((float) $r->price, 0, ',', ' ') . ' FCFA/nuit')->all();
            $this->whatsAppService->sendNumberedList($session->phone_number, 'Voici les chambres disponibles :', $items, 'Répondez avec le numéro de votre choix.');
            return;
        }

        $session->update(['state' => self::STATE_ASK_START_DATE, 'context' => $context]);
        $this->whatsAppService->sendText($session->phone_number, "Quelle est la date d'arrivée souhaitée ? (format JJ/MM/AAAA)");
    }

    private function handleChoosingRoom(WhatsAppSession $session, string $text): void
    {
        $context = $session->context ?? [];
        $index = ((int) $text) - 1;
        $ids = $context['room_ids'] ?? [];

        if (!isset($ids[$index])) {
            $this->whatsAppService->sendText($session->phone_number, "Choix invalide. Répondez avec un des numéros proposés.");
            return;
        }

        $context['hotel_room_id'] = $ids[$index];
        $session->update(['state' => self::STATE_ASK_START_DATE, 'context' => $context]);
        $this->whatsAppService->sendText($session->phone_number, "Quelle est la date d'arrivée souhaitée ? (format JJ/MM/AAAA)");
    }

    private function handleStartDate(WhatsAppSession $session, string $text): void
    {
        $date = $this->parseDate($text);
        if (!$date) {
            $this->whatsAppService->sendText($session->phone_number, "Date invalide. Merci de répondre au format JJ/MM/AAAA (ex: 25/12/2026).");
            return;
        }

        $context = $session->context ?? [];
        $context['start_date'] = $date->format('Y-m-d');
        $session->update(['state' => self::STATE_ASK_END_DATE, 'context' => $context]);
        $this->whatsAppService->sendText($session->phone_number, "Et la date de départ ? (format JJ/MM/AAAA)");
    }

    private function handleEndDate(WhatsAppSession $session, string $text): void
    {
        $date = $this->parseDate($text);
        $context = $session->context ?? [];

        if (!$date || $date->format('Y-m-d') <= $context['start_date']) {
            $this->whatsAppService->sendText($session->phone_number, "Date invalide : elle doit être postérieure à la date d'arrivée. Merci de répondre au format JJ/MM/AAAA.");
            return;
        }

        $context['end_date'] = $date->format('Y-m-d');
        $session->update(['state' => self::STATE_ASK_GUESTS, 'context' => $context]);
        $this->whatsAppService->sendText($session->phone_number, "Pour combien de personnes ?");
    }

    private function handleGuests(WhatsAppSession $session, string $text): void
    {
        $guests = (int) $text;
        if ($guests < 1) {
            $this->whatsAppService->sendText($session->phone_number, "Merci d'indiquer un nombre de personnes valide (ex: 2).");
            return;
        }

        $context = $session->context ?? [];
        $context['guests'] = $guests;

        $this->createBooking($session, $context);
    }

    /**
     * Résout (ou crée) le compte client lié à ce numéro, puis délègue la
     * création de la réservation à BookingService — exactement la même
     * logique métier que celle utilisée par le front-office web.
     */
    private function createBooking(WhatsAppSession $session, array $context): void
    {
        $user = $this->resolveUser($session->phone_number);
        $session->update(['user_id' => $user->id]);

        $typeChoice = self::ESTABLISHMENT_TYPES[$context['type_key']];
        $bookMethod = $typeChoice['book_method'];

        $data = [
            'customer_id' => $user->id,
            'start_date' => $context['start_date'],
            'end_date' => $context['end_date'],
            'guests' => $context['guests'],
        ];

        if (isset($context['hotel_room_id'])) {
            $data['hotel_room_id'] = $context['hotel_room_id'];
        }

        $result = $this->bookingService->{$bookMethod}($data, $context['establishment_id']);
        $booking = $result['booking'];
        $paymentUrl = $result['payment_url'];

        $session->update(['state' => self::STATE_IDLE, 'context' => []]);

        $message = "Réservation créée ! Référence : {$booking->booking_reference}\n"
            . 'Montant : ' . number_format((float) $booking->total_price, 0, ',', ' ') . " FCFA\n\n";

        $message .= $paymentUrl
            ? "Pour finaliser, payez ici (Wave, Orange Money, carte...) :\n{$paymentUrl}"
            : "Un problème est survenu lors de la génération du lien de paiement. Contactez le support.";

        $this->whatsAppService->sendText($session->phone_number, $message);
    }

    /**
     * Retrouve l'utilisateur lié à ce numéro WhatsApp, ou crée un compte
     * client minimal si c'est un premier contact.
     */
    private function resolveUser(string $phoneNumber): User
    {
        $existing = User::where('phone', $phoneNumber)->first();
        if ($existing) {
            return $existing;
        }

        return User::create([
            'first_name' => 'Client',
            'last_name' => 'WhatsApp',
            'phone' => $phoneNumber,
            'email' => "whatsapp+{$phoneNumber}@dolcireva.local",
            'type' => 'CUSTOMER',
            'password' => Hash::make(Str::random(32)),
            'email_verified_at' => now(),
        ]);
    }

    /**
     * Parse une date au format JJ/MM/AAAA ou AAAA-MM-JJ.
     */
    private function parseDate(string $text): ?\DateTime
    {
        $text = trim($text);

        foreach (['d/m/Y', 'Y-m-d'] as $format) {
            $date = \DateTime::createFromFormat($format, $text);
            if ($date instanceof \DateTime) {
                return $date;
            }
        }

        return null;
    }
}
