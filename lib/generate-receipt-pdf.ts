import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import type { ReceiptData } from '@/hooks/use-bookings';

// Format date pour le PDF
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

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

export async function generateReceiptPDF(receipt: ReceiptData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Couleurs Dolci Rêva
  const primaryOrange: [number, number, number] = [240, 132, 0]; // #f08400
  const white: [number, number, number] = [255, 255, 255];
  const lightGray: [number, number, number] = [245, 245, 245];
  const textDark: [number, number, number] = [33, 33, 33];
  const textLight: [number, number, number] = [120, 120, 120];
  const borderColor: [number, number, number] = [230, 230, 230];

  let yPosition = margin;

  // ============================================
  // EN-TÊTE ORANGE (comme OlistaDental)
  // ============================================
  const headerHeight = 25;
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
  // Logo simplifié (carré avec "D")
  doc.setFillColor(white[0], white[1], white[2]);
  doc.roundedRect(margin, 8, 10, 10, 2, 2, 'F');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('D', margin + 3.5, 15);
  
  // Nom de l'entreprise
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Dolci Rêva', margin + 15, 16);

  yPosition = headerHeight + 15;

  // ============================================
  // SECTION "FACTURÉ À" (gauche) et "REÇU" (droite)
  // ============================================
  const leftColWidth = contentWidth * 0.5;
  const rightColWidth = contentWidth * 0.5;

  // "Facturé à" - Gauche
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Facturé à:', margin, yPosition);
  
  yPosition += 6;
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.customer.name, margin, yPosition);
  yPosition += 5;
  doc.setFontSize(9);
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text(receipt.customer.email, margin, yPosition);
  yPosition += 4;
  doc.text(receipt.customer.phone, margin, yPosition);
  yPosition += 8;

  // Détails de la réservation (juste en dessous de "Facturé à")
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(margin, yPosition, leftColWidth, 35, 3, 3, 'F');
  
  let bookingDetailY = yPosition + 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('Détails de la réservation', margin + 5, bookingDetailY);
  bookingDetailY += 6;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Type: ${receipt.booking.booking_type}`, margin + 5, bookingDetailY);
  bookingDetailY += 4;
  doc.text(`Référence: ${receipt.booking.booking_reference}`, margin + 5, bookingDetailY);
  bookingDetailY += 4;
  doc.text(`Arrivée: ${formatDateShort(receipt.booking.start_date)}`, margin + 5, bookingDetailY);
  bookingDetailY += 4;
  doc.text(`Départ: ${formatDateShort(receipt.booking.end_date)}`, margin + 5, bookingDetailY);
  bookingDetailY += 4;
  doc.text(`Voyageurs: ${receipt.booking.guests}`, margin + 5, bookingDetailY);

  // "Reçu" - Droite
  const receiptX = margin + leftColWidth + 10;
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('REÇU', receiptX, headerHeight + 15);
  
  let receiptY = headerHeight + 25;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Référence: ${receipt.receipt_info.booking_reference}`, receiptX, receiptY);
  receiptY += 5;
  doc.text(`Date: ${formatDate(receipt.receipt_info.payment_date)}`, receiptX, receiptY);
  receiptY += 5;
  doc.text(`Transaction: ${receipt.receipt_info.payment_reference}`, receiptX, receiptY);

  yPosition += 45;

  // ============================================
  // TABLEAU DES DÉTAILS (comme OlistaDental)
  // ============================================
  // En-tête du tableau
  const tableHeaderY = yPosition;
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.rect(margin, tableHeaderY, contentWidth, 8, 'F');
  
  let headerX = margin + 5;
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICE', headerX, tableHeaderY + 6);
  headerX += 80;
  doc.text('PRIX', headerX, tableHeaderY + 6, { align: 'right' });
  headerX += 30;
  doc.text('QTY', headerX, tableHeaderY + 6, { align: 'center' });
  headerX += 20;
  doc.text('TOTAL', headerX, tableHeaderY + 6, { align: 'right' });

  yPosition += 8;

  // Ligne de service - Réservation
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.2);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;
  
  let serviceX = margin + 5;
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Réservation', serviceX, yPosition);
  serviceX += 80;
  doc.text(formatPrice(receipt.payment.total_price), serviceX, yPosition, { align: 'right' });
  serviceX += 30;
  doc.text('1', serviceX, yPosition, { align: 'center' });
  serviceX += 20;
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatPrice(receipt.payment.total_price)} ${receipt.payment.payment_currency}`, serviceX, yPosition, { align: 'right' });

  yPosition += 8;

  // Ligne de séparation
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // ============================================
  // SECTION PAIEMENT (droite) avec QR Code et Total
  // ============================================
  const paymentSectionX = margin + leftColWidth + 10;
  const paymentSectionWidth = rightColWidth;

  // QR Code
  if (receipt.qr_code?.token) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(receipt.qr_code.token, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      const qrSize = 35;
      doc.addImage(qrCodeDataUrl, 'PNG', paymentSectionX, yPosition, qrSize, qrSize);
      
      // Texte sous le QR
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      doc.text('Code de vérification', paymentSectionX, yPosition + qrSize + 4, { align: 'center', maxWidth: qrSize });
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  }

  // Total à droite du QR ou en dessous
  const totalY = yPosition + 40;
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.roundedRect(paymentSectionX, totalY, paymentSectionWidth, 20, 3, 3, 'F');
  
  const totalTextY = totalY + 7;
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', paymentSectionX + 5, totalTextY);
  
  doc.setFontSize(14);
  doc.text(
    `${formatPrice(receipt.payment.total_price)} ${receipt.payment.payment_currency}`,
    paymentSectionX + paymentSectionWidth - 5,
    totalTextY + 5,
    { align: 'right' }
  );

  yPosition = totalY + 30;

  // ============================================
  // MÉTHODES DE PAIEMENT (bas gauche)
  // ============================================
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('MÉTHODE DE PAIEMENT', margin, yPosition);
  yPosition += 6;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Mobile Money', margin, yPosition);
  yPosition += 4;
  doc.text('Carte Bancaire', margin, yPosition);
  yPosition += 4;
  doc.text('Virement Bancaire', margin, yPosition);
  yPosition += 4;
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text('Méthode utilisée: ' + receipt.payment.payment_method, margin, yPosition);
  if (receipt.payment.authorization_code) {
    yPosition += 4;
    doc.setFontSize(7);
    doc.text(`Code: ${receipt.payment.authorization_code}`, margin, yPosition);
  }

  // ============================================
  // ÉTABLISSEMENT (bas centre)
  // ============================================
  const propertyX = margin + leftColWidth / 2;
  yPosition = totalY + 30;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('ÉTABLISSEMENT', propertyX, yPosition);
  yPosition += 6;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receipt.property.details.name, propertyX, yPosition);
  yPosition += 4;
  doc.setFontSize(7);
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text(receipt.property.details.address.address.substring(0, 40), propertyX, yPosition);
  yPosition += 4;
  doc.text(`${receipt.property.details.address.city}, ${receipt.property.details.address.country}`, propertyX, yPosition);

  // ============================================
  // PIED DE PAGE ORANGE (comme OlistaDental)
  // ============================================
  const footerY = pageHeight - 20;
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.rect(0, footerY, pageWidth, 20, 'F');
  
  let footerTextY = footerY + 6;
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Dolci Rêva - Kiffer l\'instant', margin, footerTextY);
  footerTextY += 4;
  doc.setFontSize(7);
  doc.text('www.dolcireva.com', margin, footerTextY);
  footerTextY += 4;
  doc.text('support@dolcireva.com', margin, footerTextY);
  
  // Logo en bas à droite
  doc.setFillColor(white[0], white[1], white[2]);
  doc.roundedRect(pageWidth - margin - 10, footerY + 5, 8, 8, 2, 2, 'F');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('D', pageWidth - margin - 6.5, footerY + 10.5);

  // Télécharger le PDF
  const fileName = `receipt-${receipt.receipt_info.booking_reference}.pdf`;
  doc.save(fileName);
}
