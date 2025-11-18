import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import type { ReceiptData } from '@/hooks/use-bookings';

// Format date courte
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Calculer la durée du séjour
const calculateDuration = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
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
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);
  
  // Couleurs Dolci Rêva
  const primaryOrange: [number, number, number] = [240, 132, 0]; // #f08400
  const white: [number, number, number] = [255, 255, 255];
  const lightGray: [number, number, number] = [248, 249, 250];
  const lightOrange: [number, number, number] = [255, 245, 230];
  const textDark: [number, number, number] = [33, 33, 33];
  const textLight: [number, number, number] = [120, 120, 120];
  const borderColor: [number, number, number] = [230, 230, 230];
  const successGreen: [number, number, number] = [34, 197, 94];

  let yPosition = margin;

  // ============================================
  // EN-TÊTE ORANGE
  // ============================================
  const headerHeight = 22;
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
  // Logo
  doc.setFillColor(white[0], white[1], white[2]);
  doc.roundedRect(margin, 6, 10, 10, 2, 2, 'F');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DR', margin + 2.5, 13);
  
  // Nom de l'entreprise
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Dolci Rêva', margin + 14, 13);

  // Badge statut à droite
  const statusX = pageWidth - margin - 30;
  doc.setFillColor(white[0], white[1], white[2]);
  doc.roundedRect(statusX, 7, 28, 8, 2, 2, 'F');
  doc.setTextColor(successGreen[0], successGreen[1], successGreen[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ PAYÉ', statusX + 14, 12.5, { align: 'center' });

  yPosition = headerHeight + 12;

  // ============================================
  // RÉSUMÉ PRINCIPAL (Box mis en évidence)
  // ============================================
  const summaryBoxHeight = 28;
  doc.setFillColor(lightOrange[0], lightOrange[1], lightOrange[2]);
  doc.setDrawColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPosition, contentWidth, summaryBoxHeight, 3, 3, 'FD');
  
  yPosition += 8;
  
  // Référence à gauche
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('RÉFÉRENCE', margin + 5, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receipt.receipt_info.booking_reference, margin + 5, yPosition + 5);
  
  // Montant au centre
  const centerX = pageWidth / 2;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('MONTANT TOTAL', centerX, yPosition, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(
    `${formatPrice(receipt.payment.total_price)} ${receipt.payment.payment_currency}`,
    centerX,
    yPosition + 6,
    { align: 'center' }
  );
  
  // Date à droite
  const rightX = pageWidth - margin - 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('DATE DE PAIEMENT', rightX, yPosition, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(formatDateShort(receipt.receipt_info.payment_date), rightX, yPosition + 5, { align: 'right' });

  yPosition += summaryBoxHeight + 10;

  // ============================================
  // GRID 2 COLONNES: CLIENT & RÉSERVATION
  // ============================================
  const colWidth = (contentWidth - 10) / 2;
  const leftColX = margin;
  const rightColX = margin + colWidth + 10;

  // Colonne gauche - CLIENT (Box avec fond)
  const clientBoxHeight = 50;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftColX, yPosition, colWidth, clientBoxHeight, 2, 2, 'FD');
  
  let clientY = yPosition + 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('CLIENT', leftColX + 5, clientY);
  clientY += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  
  // Séparer nom et prénom
  const nameParts = receipt.customer.name.trim().split(/\s+/);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';
  const lastName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : receipt.customer.name;
  
  if (firstName) {
    doc.text(`Prénom: ${firstName}`, leftColX + 5, clientY);
    clientY += 4;
    doc.text(`Nom: ${lastName}`, leftColX + 5, clientY);
  } else {
    doc.text(`Nom: ${lastName}`, leftColX + 5, clientY);
  }
  clientY += 5;
  doc.setFontSize(8);
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text(`📧 ${receipt.customer.email}`, leftColX + 5, clientY);
  clientY += 4;
  doc.text(`📞 ${receipt.customer.phone}`, leftColX + 5, clientY);

  // Colonne droite - RÉSERVATION (Box avec fond)
  const bookingBoxHeight = 50;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(rightColX, yPosition, colWidth, bookingBoxHeight, 2, 2, 'FD');
  
  let bookingY = yPosition + 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('RÉSERVATION', rightColX + 5, bookingY);
  bookingY += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Type: ${receipt.booking.booking_type}`, rightColX + 5, bookingY);
  bookingY += 4;
  doc.text(`Réf: ${receipt.booking.booking_reference}`, rightColX + 5, bookingY);
  bookingY += 4;
  
  // Calculer durée
  const duration = calculateDuration(receipt.booking.start_date, receipt.booking.end_date);
  doc.text(`Durée: ${duration} jour${duration > 1 ? 's' : ''}`, rightColX + 5, bookingY);
  bookingY += 4;
  doc.text(`Voyageurs: ${receipt.booking.guests}`, rightColX + 5, bookingY);

  yPosition += Math.max(clientBoxHeight, bookingBoxHeight) + 10;

  // ============================================
  // TIMELINE DES DATES (Calendrier visuel)
  // ============================================
  const timelineHeight = 35;
  doc.setFillColor(lightOrange[0], lightOrange[1], lightOrange[2]);
  doc.setDrawColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPosition, contentWidth, timelineHeight, 3, 3, 'FD');
  
  let timelineY = yPosition + 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('CALENDRIER DU SÉJOUR', margin + 5, timelineY);
  timelineY += 8;
  
  // Ligne de timeline
  const timelineStartX = margin + 15;
  const timelineEndX = pageWidth - margin - 15;
  const timelineLineY = timelineY;
  doc.setDrawColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setLineWidth(1);
  doc.line(timelineStartX, timelineLineY, timelineEndX, timelineLineY);
  
  // Point d'arrivée
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.circle(timelineStartX, timelineLineY, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('ARRIVÉE', timelineStartX, timelineLineY - 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(formatDateShort(receipt.booking.start_date), timelineStartX, timelineLineY + 4, { align: 'center' });
  
  // Point de départ
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.circle(timelineEndX, timelineLineY, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('DÉPART', timelineEndX, timelineLineY - 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(formatDateShort(receipt.booking.end_date), timelineEndX, timelineLineY + 4, { align: 'center' });
  
  // Durée au centre
  const timelineCenterX = (timelineStartX + timelineEndX) / 2;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${duration} jour${duration > 1 ? 's' : ''}`, timelineCenterX, timelineLineY - 3, { align: 'center' });

  yPosition += timelineHeight + 10;

  // ============================================
  // GRID 2 COLONNES: ÉTABLISSEMENT & PROPRIÉTAIRE
  // ============================================
  // Colonne gauche - ÉTABLISSEMENT
  const propertyBoxHeight = 60;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftColX, yPosition, colWidth, propertyBoxHeight, 2, 2, 'FD');
  
  let propertyY = yPosition + 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('ÉTABLISSEMENT', leftColX + 5, propertyY);
  propertyY += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receipt.property.details.name, leftColX + 5, propertyY);
  propertyY += 5;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text(`📍 ${receipt.property.details.address.address.substring(0, 30)}`, leftColX + 5, propertyY);
  propertyY += 4;
  doc.text(`${receipt.property.details.address.city}, ${receipt.property.details.address.country}`, leftColX + 5, propertyY);
  propertyY += 5;
  doc.text(`Type: ${receipt.property.details.residence.type}`, leftColX + 5, propertyY);
  propertyY += 4;
  doc.text(`Standing: ${receipt.property.details.residence.standing}`, leftColX + 5, propertyY);
  propertyY += 4;
  doc.text(`Capacité: ${receipt.property.details.residence.max_guests} personnes`, leftColX + 5, propertyY);

  // Colonne droite - PROPRIÉTAIRE
  const ownerBoxHeight = 60;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(rightColX, yPosition, colWidth, ownerBoxHeight, 2, 2, 'FD');
  
  let ownerY = yPosition + 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('PROPRIÉTAIRE', rightColX + 5, ownerY);
  ownerY += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receipt.owner.name, rightColX + 5, ownerY);
  ownerY += 5;
  
  if (receipt.owner.email) {
    doc.setFontSize(8);
    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
    doc.text(`📧 ${receipt.owner.email}`, rightColX + 5, ownerY);
    ownerY += 4;
  }
  if (receipt.owner.phone) {
    doc.text(`📞 ${receipt.owner.phone}`, rightColX + 5, ownerY);
    ownerY += 4;
  }
  
  // Informations transaction
  ownerY += 3;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('INFORMATIONS TRANSACTION', rightColX + 5, ownerY);
  ownerY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text(`Transaction: ${receipt.receipt_info.payment_reference}`, rightColX + 5, ownerY);
  ownerY += 4;
  doc.text(`Méthode: ${receipt.payment.payment_method}`, rightColX + 5, ownerY);
  if (receipt.payment.authorization_code) {
    ownerY += 4;
    doc.text(`Code: ${receipt.payment.authorization_code}`, rightColX + 5, ownerY);
  }

  yPosition += Math.max(propertyBoxHeight, ownerBoxHeight) + 10;

  // ============================================
  // SECTION PAIEMENT (centrée) avec QR Code et Total
  // ============================================
  const paymentSectionWidth = contentWidth * 0.7;
  const paymentSectionX = (pageWidth - paymentSectionWidth) / 2;

  // QR Code à gauche (plus grand)
  const qrY = yPosition;
  if (receipt.qr_code?.token) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(receipt.qr_code.token, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      const qrSize = 45;
      const qrX = paymentSectionX;
      
      // Fond blanc pour le QR
      doc.setFillColor(white[0], white[1], white[2]);
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 2, 'FD');
      
      doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      
      // Texte sous le QR
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      doc.text('Code de vérification', qrX + qrSize / 2, qrY + qrSize + 5, { align: 'center', maxWidth: qrSize });
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  }

  // Total à droite du QR (box orange plus grande)
  const totalX = paymentSectionX + 55;
  const totalY = yPosition;
  const totalBoxWidth = paymentSectionWidth - 55;
  const totalBoxHeight = 30;
  
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setDrawColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setLineWidth(1);
  doc.roundedRect(totalX, totalY, totalBoxWidth, totalBoxHeight, 3, 3, 'FD');
  
  const totalTextY = totalY + 10;
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MONTANT TOTAL', totalX + 10, totalTextY);
  
  doc.setFontSize(22);
  doc.text(
    `${formatPrice(receipt.payment.total_price)} ${receipt.payment.payment_currency}`,
    totalX + totalBoxWidth - 10,
    totalTextY + 10,
    { align: 'right' }
  );

  // ============================================
  // PIED DE PAGE ORANGE
  // ============================================
  const footerY = pageHeight - 18;
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.rect(0, footerY, pageWidth, 18, 'F');
  
  let footerTextY = footerY + 5;
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
  doc.roundedRect(pageWidth - margin - 8, footerY + 5, 7, 7, 2, 2, 'F');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DR', pageWidth - margin - 4.5, footerY + 9.5);

  // Télécharger le PDF
  const fileName = `receipt-${receipt.receipt_info.booking_reference}.pdf`;
  doc.save(fileName);
}
