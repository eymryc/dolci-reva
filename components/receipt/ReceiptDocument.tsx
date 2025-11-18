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
    margin: 0,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  header: {
    backgroundColor: colors.primaryOrange,
    height: 70,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  logoBox: {
    width: 50,
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    padding: 5,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  companyName: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 25,
    paddingTop: 95, // Espace pour le header (70 + 25)
    paddingBottom: 70, // Espace pour le footer (60 + 10)
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
  table: {
    marginTop: 15,
    border: `1px solid ${colors.textLight}`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: `1px solid ${colors.textLight}`,
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    borderRight: `1px solid ${colors.textLight}`,
  },
  tableCellLast: {
    flex: 1,
    padding: 8,
  },
  tableHeader: {
    backgroundColor: colors.primaryOrange,
  },
  tableHeaderText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCellText: {
    fontSize: 9,
    color: colors.textDark,
  },
  tableCellTextSmall: {
    fontSize: 8,
    color: colors.textLight,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primaryOrange,
    padding: 15,
    paddingBottom: 15,
    margin: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 60,
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
    width: 35,
    height: 35,
    backgroundColor: colors.white,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  footerLogoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
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
        {/* En-tête fixe */}
        <View style={styles.header} fixed>
          <View style={styles.logoBox}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/logo/logo-custom.png" style={styles.logoImage} />
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
              <Text style={styles.text}>Nom: {receipt.customer.full_name}</Text>
              <Text style={styles.textSmall}>Email: {receipt.customer.email}</Text>
              <Text style={styles.textSmall}>
                Téléphone: {receipt.customer.phone}
              </Text>

              <Text style={styles.sectionTitle}>PROPRIÉTAIRE</Text>
              {receipt.owner.full_name ? (
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

          {/* Tableau Établissement et Réservation */}
          <View style={styles.table}>
            {/* En-tête du tableau */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCell}>
                <Text style={styles.tableHeaderText}>ÉTABLISSEMENT</Text>
              </View>
              <View style={styles.tableCellLast}>
                <Text style={styles.tableHeaderText}>RÉSERVATION</Text>
              </View>
            </View>

            {/* Nom */}
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellText}>{receipt.property.details.name}</Text>
              </View>
              <View style={styles.tableCellLast}>
                <Text style={styles.tableCellText}>Type: {receipt.booking.booking_type}</Text>
              </View>
            </View>

            {/* Adresse / Référence */}
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellTextSmall}>
                  {receipt.property.details.address.address}
                </Text>
                <Text style={styles.tableCellTextSmall}>
                  {receipt.property.details.address.city},{' '}
                  {receipt.property.details.address.country}
                </Text>
              </View>
              <View style={styles.tableCellLast}>
                <Text style={styles.tableCellTextSmall}>
                  Référence: {receipt.booking.booking_reference}
                </Text>
              </View>
            </View>

            {/* Type / Dates */}
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellTextSmall}>
                  Type: {receipt.property.details.residence.type}
                </Text>
              </View>
              <View style={styles.tableCellLast}>
                <Text style={styles.tableCellTextSmall}>
                  Arrivée: {formatDateShort(receipt.booking.start_date)}
                </Text>
                <Text style={styles.tableCellTextSmall}>
                  Départ: {formatDateShort(receipt.booking.end_date)}
                </Text>
              </View>
            </View>

            {/* Standing / Voyageurs */}
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellTextSmall}>
                  Standing: {receipt.property.details.residence.standing}
                </Text>
              </View>
              <View style={styles.tableCellLast}>
                <Text style={styles.tableCellTextSmall}>
                  Voyageurs: {receipt.booking.guests}
                </Text>
              </View>
            </View>

            {/* Capacité */}
            <View style={styles.tableRowLast}>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellTextSmall}>
                  Capacité: {receipt.property.details.residence.max_guests} personnes
                </Text>
              </View>
              <View style={styles.tableCellLast}>
                <Text style={styles.tableCellTextSmall}>
                  Statut: {receipt.booking.status}
                </Text>
              </View>
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
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/logo/logo-custom.png" style={styles.footerLogoImage} />
          </View>
        </View>
      </Page>
    </Document>
  );
};

