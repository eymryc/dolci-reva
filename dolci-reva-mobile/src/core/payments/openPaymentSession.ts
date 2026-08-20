import * as WebBrowser from 'expo-web-browser';

/**
 * Doit correspondre au deep link construit par PaymentController::callback()
 * côté API (dolci-reva-api) quand platform=mobile, cf.
 * BookingService::initializePaymentForBooking().
 */
const PAYMENT_CALLBACK_URL = 'dolcireva://payment/callback';

/**
 * Ouvre l'URL de paiement Paystack dans une session d'authentification (pas
 * un simple navigateur in-app) : elle se ferme automatiquement dès que
 * Paystack redirige vers PAYMENT_CALLBACK_URL, sans que l'utilisateur ait à
 * fermer l'onglet lui-même — avant ce correctif (openBrowserAsync), rien ne
 * détectait la fin du paiement, l'utilisateur devait fermer manuellement et
 * l'app n'avait aucune certitude que le paiement avait abouti.
 *
 * @returns true si Paystack a bien redirigé vers PAYMENT_CALLBACK_URL
 * (paiement traité, succès ou échec confirmé côté serveur), false si
 * l'utilisateur a fermé la session lui-même sans aller au bout.
 */
export async function openPaymentSession(paymentUrl: string): Promise<boolean> {
  const result = await WebBrowser.openAuthSessionAsync(paymentUrl, PAYMENT_CALLBACK_URL);
  return result.type === 'success';
}
