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
  const headerHeight = 20;
  const footerHeight = 20;
  const contentWidth = pageWidth - (margin * 2);
  const contentStartY = margin + headerHeight;
  const contentEndY = pageHeight - footerHeight - margin;
  let yPosition = contentStartY;

  // Couleurs
  const primaryColor: [number, number, number] = [255, 140, 0]; // Orange
  const darkColor: [number, number, number] = [33, 33, 33];
  const lightGray: [number, number, number] = [248, 249, 250];
  const borderColor: [number, number, number] = [230, 230, 230];
  const successGreen: [number, number, number] = [34, 197, 94];

  // ============================================
  // EN-TÊTE FIXE
  // ============================================
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DOLCI RÊVA', margin, 12);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Reçu de paiement officiel', margin, 17);

  // Badge de statut
  const statusX = pageWidth - margin - 30;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(statusX, 5, 30, 10, 2, 2, 'F');
  doc.setTextColor(successGreen[0], successGreen[1], successGreen[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ PAYÉ', statusX + 15, 11.5, { align: 'center' });

  // ============================================
  // RÉSUMÉ DE TRANSACTION (avec prix)
  // ============================================
  const summaryBoxHeight = 30;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPosition, contentWidth, summaryBoxHeight, 2, 2, 'FD');
  
  yPosition += 8;
  
  // Ligne 1: Référence et Montant
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉFÉRENCE:', margin + 5, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(receipt.receipt_info.booking_reference, margin + 30, yPosition);
  
  // Montant à droite
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(
    `${formatPrice(receipt.payment.total_price)} ${receipt.payment.payment_currency}`,
    pageWidth - margin - 5,
    yPosition,
    { align: 'right' }
  );
  
  yPosition += 7;
  
  // Ligne 2: Transaction et Date
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Transaction: ${receipt.receipt_info.payment_reference}`, margin + 5, yPosition);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Date:', pageWidth - margin - 50, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(formatDateShort(receipt.receipt_info.payment_date), pageWidth - margin - 5, yPosition, { align: 'right' });
  
  yPosition += 6;
  
  // Ligne 3: Méthode de paiement
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`Méthode: ${receipt.payment.payment_method}`, margin + 5, yPosition);
  if (receipt.payment.authorization_code) {
    doc.text(`Code: ${receipt.payment.authorization_code}`, margin + 80, yPosition);
  }

  yPosition += summaryBoxHeight - 20 + 8;

  // ============================================
  // SECTION: CLIENT ET RÉSERVATION (2 colonnes compactes)
  // ============================================
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('DÉTAILS DE LA RÉSERVATION', margin, yPosition);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
  yPosition += 7;

  // Colonne gauche - Informations client
  const leftColWidth = contentWidth / 2 - 5;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.roundedRect(margin, yPosition, leftColWidth, 28, 2, 2, 'FD');
  
  let clientY = yPosition + 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('CLIENT', margin + 4, clientY);
  clientY += 5;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Nom:', margin + 4, clientY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(receipt.customer.name.substring(0, 25), margin + 15, clientY);
  clientY += 4;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Email:', margin + 4, clientY);
  doc.setFontSize(7);
  doc.text(receipt.customer.email.substring(0, 28), margin + 15, clientY);
  clientY += 4;
  
  doc.setFontSize(8);
  doc.text('Tél:', margin + 4, clientY);
  doc.text(receipt.customer.phone, margin + 15, clientY);

  // Colonne droite - Informations réservation
  const rightColXBooking = margin + leftColWidth + 10;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(rightColXBooking, yPosition, leftColWidth, 28, 2, 2, 'FD');
  
  let bookingY = yPosition + 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('RÉSERVATION', rightColXBooking + 4, bookingY);
  bookingY += 5;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Type:', rightColXBooking + 4, bookingY);
  doc.setFont('helvetica', 'bold');
  doc.text(receipt.booking.booking_type, rightColXBooking + 15, bookingY);
  bookingY += 4;
  
  doc.setFont('helvetica', 'normal');
  doc.text('Arrivée:', rightColXBooking + 4, bookingY);
  doc.setFontSize(7);
  doc.text(formatDateShort(receipt.booking.start_date), rightColXBooking + 15, bookingY);
  bookingY += 4;
  
  doc.setFontSize(8);
  doc.text('Départ:', rightColXBooking + 4, bookingY);
  doc.setFontSize(7);
  doc.text(formatDateShort(receipt.booking.end_date), rightColXBooking + 15, bookingY);
  bookingY += 4;
  
  doc.setFontSize(8);
  doc.text('Voyageurs:', rightColXBooking + 4, bookingY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${receipt.booking.guests}`, rightColXBooking + 20, bookingY);

  yPosition += 35;

  // ============================================
  // SECTION: ÉTABLISSEMENT (compacte)
  // ============================================
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('ÉTABLISSEMENT', margin, yPosition);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
  yPosition += 7;

  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.roundedRect(margin, yPosition, contentWidth, 25, 2, 2, 'FD');
  
  let propertyY = yPosition + 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(receipt.property.details.name, margin + 4, propertyY);
  propertyY += 5;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(receipt.property.details.address.address.substring(0, 60), margin + 4, propertyY);
  propertyY += 4;
  doc.text(`${receipt.property.details.address.city}, ${receipt.property.details.address.country}`, margin + 4, propertyY);
  propertyY += 5;
  
  // Caractéristiques sur une ligne
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`Type: ${receipt.property.details.residence.type}`, margin + 4, propertyY);
  doc.text(`Standing: ${receipt.property.details.residence.standing}`, margin + 40, propertyY);
  doc.text(`Capacité: ${receipt.property.details.residence.max_guests}`, margin + 80, propertyY);

  yPosition += 32;

  // ============================================
  // SECTION: QR CODE (compacte)
  // ============================================
  if (receipt.qr_code?.token && yPosition < contentEndY - 40) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(receipt.qr_code.token, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Box pour QR Code compacte
      const qrBoxHeight = 35;
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.roundedRect(margin, yPosition, contentWidth, qrBoxHeight, 2, 2, 'FD');
      
      // QR Code à gauche
      const qrSize = 25;
      doc.addImage(qrCodeDataUrl, 'PNG', margin + 5, yPosition + 5, qrSize, qrSize);
      
      // Texte à droite du QR
      let qrTextY = yPosition + 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('CODE DE VÉRIFICATION', margin + 35, qrTextY);
      qrTextY += 5;
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Scannez ce code pour', margin + 35, qrTextY);
      qrTextY += 4;
      doc.text('vérifier votre réservation', margin + 35, qrTextY);
      
      yPosition += qrBoxHeight + 5;
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  }

  // Propriétaire (très compact)
  if (yPosition < contentEndY - 10) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('Propriétaire:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.owner.name, margin + 25, yPosition);
  }

  // ============================================
  // PIED DE PAGE FIXE
  // ============================================
  const footerY = pageHeight - footerHeight;
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  let footerTextY = footerY + 5;
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'italic');
  doc.text('Ce document est un reçu officiel de votre transaction.', margin, footerTextY, { align: 'center', maxWidth: contentWidth });
  footerTextY += 4;
  doc.text('Pour toute question, contactez notre service client.', margin, footerTextY, { align: 'center', maxWidth: contentWidth });
  footerTextY += 4;
  
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.text('Dolci Rêva - Kiffer l\'instant | www.dolcireva.com | support@dolcireva.com', margin, footerTextY, { align: 'center', maxWidth: contentWidth });

  // Télécharger le PDF
  const fileName = `receipt-${receipt.receipt_info.booking_reference}.pdf`;
  doc.save(fileName);
}
