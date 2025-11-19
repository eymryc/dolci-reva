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
  lightGray: '#f5f5f5',
  borderLight: '#e0e0e0',
  successGreen: '#4caf50',
  warningOrange: '#ff9800',
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
  },
  content: {
    padding: 25,
    paddingTop: 30, // Espace pour le header (réduit)
    paddingBottom: 70, // Espace pour le footer (60 + 10)
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
  },
  qrSection: {
    width: '50%',
    marginRight: 10,
    flexShrink: 0,
  },
  qrContainer: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    border: `2px solid ${colors.primaryOrange}`,
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
    width: '50%',
    flexShrink: 0,
  },
  receiptTitle: {
    fontSize: 24,
    color: colors.primaryOrange,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 13,
    color: colors.primaryOrange,
    marginTop: 5,
    marginBottom: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBox: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 12,
    border: `1px solid ${colors.borderLight}`,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  text: {
    fontSize: 9,
    color: colors.textDark,
    marginBottom: 5,
    lineHeight: 1.4,
  },
  textSmall: {
    fontSize: 8,
    color: colors.textLight,
    marginBottom: 4,
    lineHeight: 1.4,
  },
  labelText: {
    fontSize: 8,
    color: colors.textLight,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  valueText: {
    fontSize: 9,
    color: colors.textDark,
    marginBottom: 5,
  },
  statusBadge: {
    padding: 4,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusPaid: {
    backgroundColor: colors.successGreen,
    color: colors.white,
  },
  statusPending: {
    backgroundColor: colors.warningOrange,
    color: colors.white,
  },
  totalBox: {
    backgroundColor: colors.primaryOrange,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalAmount: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  generatedDate: {
    fontSize: 7,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  table: {
    marginTop: 0,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: `1px solid ${colors.borderLight}`,
  },
  tableRowEven: {
    flexDirection: 'row',
    borderBottom: `1px solid ${colors.borderLight}`,
    backgroundColor: colors.lightGray,
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    padding: 12,
    borderRight: `1px solid ${colors.borderLight}`,
  },
  tableCellLast: {
    flex: 1,
    padding: 12,
  },
  tableHeader: {
    backgroundColor: colors.primaryOrange,
  },
  tableHeaderText: {
    color: colors.white,
    fontSize: 11,
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

// Format date complète
const formatDateFull = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
            {/* Colonne gauche - QR Code et Propriétaire */}
            <View style={styles.qrSection}>
              {qrCodeDataUrl && (
                <View style={styles.qrContainer}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image src={qrCodeDataUrl} style={styles.qrCode} />
                </View>
              )}
              <Text style={styles.qrLabel}>Code de vérification</Text>

              <View style={styles.separator} />

              <Text style={styles.sectionTitle}>PROPRIÉTAIRE</Text>
              <View>
                <Text style={styles.labelText}>Nom complet</Text>
                {receipt.owner.full_name ? (
                  <Text style={styles.valueText}>{receipt.owner.full_name}</Text>
                ) : (
                  <Text style={styles.valueText}>N/A</Text>
                )}
                
                {receipt.owner.email && (
                  <>
                    <Text style={styles.labelText}>Email</Text>
                    <Text style={styles.textSmall}>{receipt.owner.email}</Text>
                  </>
                )}
                
                {receipt.owner.phone && (
                  <>
                    <Text style={styles.labelText}>Téléphone</Text>
                    <Text style={styles.textSmall}>{receipt.owner.phone}</Text>
                  </>
                )}
              </View>
              <View style={styles.separator} />
            </View>

            {/* Colonne droite - Détails du reçu */}
            <View style={styles.detailsSection}>
              <Text style={styles.receiptTitle}>REÇU</Text>

              <View style={styles.separator} />
              
              <Text style={styles.labelText}>Référence</Text>
              <Text style={styles.valueText}>{receipt.receipt_info.booking_reference}</Text>
              
              <Text style={styles.labelText}>Date de paiement</Text>
              <Text style={styles.valueText}>{formatDateShort(receipt.receipt_info.payment_date)}</Text>
              
              <Text style={styles.labelText}>Transaction</Text>
              <Text style={styles.valueText}>{receipt.receipt_info.payment_reference}</Text>
              
              <Text style={styles.labelText}>Statut</Text>
              <View style={[
                styles.statusBadge,
                paymentStatus === 'Payé' ? styles.statusPaid : styles.statusPending
              ]}>
                <Text>{paymentStatus}</Text>
              </View>

              <View style={styles.separator} />

              <Text style={styles.sectionTitle}>CLIENT</Text>
              <View>
                <Text style={styles.labelText}>Nom complet</Text>
                <Text style={styles.valueText}>{receipt.customer.full_name}</Text>
                
                <Text style={styles.labelText}>Email</Text>
                <Text style={styles.textSmall}>{receipt.customer.email}</Text>
                
                <Text style={styles.labelText}>Téléphone</Text>
                <Text style={styles.textSmall}>{receipt.customer.phone}</Text>
              </View>
              <View style={styles.separator} />
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
            <View style={styles.tableRowEven}>
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
            <View style={styles.tableRowEven}>
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

          {/* Montant Total */}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>MONTANT TOTAL</Text>
            <Text style={styles.totalAmount}>
              {formatPrice(receipt.payment.total_price)} {receipt.payment.payment_currency}
            </Text>
          </View>

          {/* Date de génération */}
          <Text style={styles.generatedDate}>
            Reçu généré le {formatDateFull(receipt.receipt_info.generated_at)}
          </Text>
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

