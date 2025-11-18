import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ReceiptData } from '@/hooks/use-bookings';

// Couleurs Dolci Rêva
const colors = {
  primaryOrange: '#f08400',
  white: '#ffffff',
  textDark: '#212121',
  textLight: '#787878',
};

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: colors.primaryOrange,
    height: 70,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoText: {
    color: colors.primaryOrange,
    fontSize: 16,
    fontWeight: 'bold',
  },
  companyName: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 25,
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  qrSection: {
    width: '25%',
    marginRight: 20,
  },
  qrContainer: {
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    border: `1px solid ${colors.textLight}`,
  },
  qrCode: {
    width: '100%',
    height: 'auto',
  },
  qrLabel: {
    fontSize: 8,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 5,
  },
  detailsSection: {
    width: '65%',
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryOrange,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primaryOrange,
    marginTop: 12,
    marginBottom: 6,
  },
  text: {
    fontSize: 9,
    color: colors.textDark,
    marginBottom: 4,
  },
  textSmall: {
    fontSize: 8,
    color: colors.textLight,
    marginBottom: 3,
  },
  twoColumns: {
    flexDirection: 'row',
    marginTop: 15,
  },
  column: {
    width: '48%',
    marginRight: 20,
  },
  paymentSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  totalBox: {
    backgroundColor: colors.primaryOrange,
    padding: 15,
    borderRadius: 6,
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalAmount: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentDetails: {
    marginTop: 10,
    fontSize: 8,
    color: colors.textDark,
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    backgroundColor: colors.primaryOrange,
    padding: 15,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'column',
  },
  footerText: {
    color: colors.white,
    fontSize: 8,
    marginBottom: 3,
  },
  footerTextSmall: {
    color: colors.white,
    fontSize: 7,
    marginBottom: 2,
  },
  footerLogo: {
    width: 30,
    height: 30,
    backgroundColor: colors.white,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLogoText: {
    color: colors.primaryOrange,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

// Format date courte
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format price
const formatPrice = (price: number | null) => {
  if (price === null) return 'N/A';
  return price.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

interface ReceiptDocumentProps {
  receipt: ReceiptData;
  qrCodeDataUrl?: string;
}

export const ReceiptDocument: React.FC<ReceiptDocumentProps> = ({
  receipt,
  qrCodeDataUrl,
}) => {
  const paymentStatus =
    receipt.receipt_info.payment_status === 'PAYE' ? 'Payé' : 'En attente';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>DR</Text>
          </View>
          <Text style={styles.companyName}>Dolci Rêva</Text>
        </View>

        {/* Contenu principal */}
        <View style={styles.content}>
          {/* Section QR Code et Détails */}
          <View style={styles.topSection}>
            {/* QR Code */}
            <View style={styles.qrSection}>
              {qrCodeDataUrl && (
                <View style={styles.qrContainer}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image src={qrCodeDataUrl} style={styles.qrCode} />
                </View>
              )}
              <Text style={styles.qrLabel}>Code de vérification</Text>
            </View>

            {/* Détails du reçu */}
            <View style={styles.detailsSection}>
              <Text style={styles.receiptTitle}>REÇU</Text>

              <Text style={styles.text}>
                Référence: {receipt.receipt_info.booking_reference}
              </Text>
              <Text style={styles.text}>
                Date: {formatDateShort(receipt.receipt_info.payment_date)}
              </Text>
              <Text style={styles.text}>
                Transaction: {receipt.receipt_info.payment_reference}
              </Text>
              <Text style={styles.text}>Statut: {paymentStatus}</Text>

              <Text style={styles.sectionTitle}>DÉTAILS DE LA RÉSERVATION</Text>
              <Text style={styles.text}>Type: {receipt.booking.booking_type}</Text>
              <Text style={styles.text}>
                Référence: {receipt.booking.booking_reference}
              </Text>
              <Text style={styles.text}>
                Arrivée: {formatDateShort(receipt.booking.start_date)}
              </Text>
              <Text style={styles.text}>
                Départ: {formatDateShort(receipt.booking.end_date)}
              </Text>
              <Text style={styles.text}>Voyageurs: {receipt.booking.guests}</Text>

              <Text style={styles.sectionTitle}>CLIENT</Text>
              <Text style={styles.text}>
                Prénom: {receipt.customer.first_name}
              </Text>
              <Text style={styles.text}>Nom: {receipt.customer.last_name}</Text>
              <Text style={styles.textSmall}>Numéro: {receipt.customer.id}</Text>
              <Text style={styles.textSmall}>Email: {receipt.customer.email}</Text>
              <Text style={styles.textSmall}>
                Téléphone: {receipt.customer.phone}
              </Text>
            </View>
          </View>

          {/* Établissement et Propriétaire en deux colonnes */}
          <View style={styles.twoColumns}>
            {/* Établissement */}
            <View style={styles.column}>
              <Text style={styles.sectionTitle}>ÉTABLISSEMENT</Text>
              <Text style={styles.text}>{receipt.property.details.name}</Text>
              <Text style={styles.textSmall}>
                {receipt.property.details.address.address}
              </Text>
              <Text style={styles.textSmall}>
                {receipt.property.details.address.city},{' '}
                {receipt.property.details.address.country}
              </Text>
              <Text style={styles.textSmall}>
                Type: {receipt.property.details.residence.type}
              </Text>
              <Text style={styles.textSmall}>
                Standing: {receipt.property.details.residence.standing}
              </Text>
              <Text style={styles.textSmall}>
                Capacité: {receipt.property.details.residence.max_guests} personnes
              </Text>
            </View>

            {/* Propriétaire */}
            <View style={styles.column}>
              <Text style={styles.sectionTitle}>PROPRIÉTAIRE</Text>
              <Text style={styles.text}>Numéro: {receipt.owner.id}</Text>
              {receipt.owner.first_name && receipt.owner.last_name ? (
                <>
                  <Text style={styles.text}>
                    Prénom: {receipt.owner.first_name}
                  </Text>
                  <Text style={styles.text}>Nom: {receipt.owner.last_name}</Text>
                </>
              ) : receipt.owner.full_name ? (
                <Text style={styles.text}>Nom: {receipt.owner.full_name}</Text>
              ) : (
                <Text style={styles.text}>Nom: N/A</Text>
              )}
              {receipt.owner.email && (
                <Text style={styles.textSmall}>Email: {receipt.owner.email}</Text>
              )}
              {receipt.owner.phone && (
                <Text style={styles.textSmall}>
                  Téléphone: {receipt.owner.phone}
                </Text>
              )}
            </View>
          </View>

          {/* Section Paiement */}
          <View style={styles.paymentSection}>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>MONTANT TOTAL</Text>
              <Text style={styles.totalAmount}>
                {formatPrice(receipt.payment.total_price)}{' '}
                {receipt.payment.payment_currency}
              </Text>
            </View>
            <View style={styles.paymentDetails}>
              <Text>Méthode: {receipt.payment.payment_method}</Text>
              {receipt.payment.authorization_code && (
                <Text>Code: {receipt.payment.authorization_code}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Pied de page */}
        <View style={styles.footer} fixed>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>Dolci Rêva - Kiffer l&apos;instant</Text>
            <Text style={styles.footerTextSmall}>www.dolcireva.com</Text>
            <Text style={styles.footerTextSmall}>support@dolcireva.com</Text>
          </View>
          <View style={styles.footerLogo}>
            <Text style={styles.footerLogoText}>D</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

