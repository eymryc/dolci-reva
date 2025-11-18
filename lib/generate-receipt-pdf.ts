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

export async function generateReceiptPDF(receipt: ReceiptData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Couleurs
  const primaryColor: [number, number, number] = [255, 140, 0]; // Orange
  const darkColor: [number, number, number] = [33, 33, 33];
  const lightGray: [number, number, number] = [248, 249, 250];
  const borderColor: [number, number, number] = [230, 230, 230];
  const successGreen: [number, number, number] = [34, 197, 94];

  // ============================================
  // EN-TÊTE PRINCIPAL
  // ============================================
  // Bandeau orange en haut
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  // Logo et titre
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('DOLCI RÊVA', margin, 18);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Reçu de paiement officiel', margin, 23);

  // Badge de statut à droite
  const statusX = pageWidth - margin - 35;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(statusX, 10, 35, 12, 2, 2, 'F');
  doc.setTextColor(successGreen[0], successGreen[1], successGreen[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ PAYÉ', statusX + 17.5, 18, { align: 'center' });

  yPosition = 35;

  // ============================================
  // RÉSUMÉ DE TRANSACTION (Box mis en évidence)
  // ============================================
  const summaryBoxHeight = 35;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPosition, contentWidth, summaryBoxHeight, 3, 3, 'FD');
  
  yPosition += 10;
  
  // Colonne gauche - Informations transaction
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉFÉRENCE', margin + 5, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(receipt.receipt_info.booking_reference, margin + 5, yPosition + 6);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Transaction: ${receipt.receipt_info.payment_reference}`, margin + 5, yPosition + 11);
  
  // Colonne droite - Date et statut
  const rightColXSummary = pageWidth - margin - 50;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('DATE DE PAIEMENT', rightColXSummary, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(formatDate(receipt.receipt_info.payment_date), rightColXSummary, yPosition + 6);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Généré le: ${formatDate(receipt.receipt_info.generated_at)}`, rightColXSummary, yPosition + 11);

  yPosition += summaryBoxHeight + 10;

  // ============================================
  // SECTION: CLIENT ET RÉSERVATION (2 colonnes)
  // ============================================
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('DÉTAILS DE LA RÉSERVATION', margin, yPosition);
  
  // Ligne de séparation
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition + 3, pageWidth - margin, yPosition + 3);
  yPosition += 10;

  // Colonne gauche - Informations client
  const leftColWidth = contentWidth / 2 - 5;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.roundedRect(margin, yPosition, leftColWidth, 40, 2, 2, 'FD');
  
  let clientY = yPosition + 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('CLIENT', margin + 5, clientY);
  clientY += 7;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Nom:', margin + 5, clientY);
  doc.setFont('helvetica', 'bold');
  doc.text(receipt.customer.name, margin + 20, clientY);
  clientY += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Email:', margin + 5, clientY);
  doc.text(receipt.customer.email, margin + 20, clientY);
  clientY += 6;
  
  doc.text('Téléphone:', margin + 5, clientY);
  doc.text(receipt.customer.phone, margin + 20, clientY);

  // Colonne droite - Informations réservation
  const rightColXBooking = margin + leftColWidth + 10;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(rightColXBooking, yPosition, leftColWidth, 40, 2, 2, 'FD');
  
  let bookingY = yPosition + 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('RÉSERVATION', rightColXBooking + 5, bookingY);
  bookingY += 7;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Type:', rightColXBooking + 5, bookingY);
  doc.setFont('helvetica', 'bold');
  doc.text(receipt.booking.booking_type, rightColXBooking + 20, bookingY);
  bookingY += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Arrivée:', rightColXBooking + 5, bookingY);
  doc.text(formatDate(receipt.booking.start_date), rightColXBooking + 20, bookingY);
  bookingY += 6;
  
  doc.text('Départ:', rightColXBooking + 5, bookingY);
  doc.text(formatDate(receipt.booking.end_date), rightColXBooking + 20, bookingY);
  bookingY += 6;
  
  doc.text('Voyageurs:', rightColXBooking + 5, bookingY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${receipt.booking.guests}`, rightColXBooking + 20, bookingY);

  yPosition += 50;

  // ============================================
  // SECTION: ÉTABLISSEMENT
  // ============================================
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('ÉTABLISSEMENT', margin, yPosition);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(margin, yPosition + 3, pageWidth - margin, yPosition + 3);
  yPosition += 10;

  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.roundedRect(margin, yPosition, contentWidth, 35, 2, 2, 'FD');
  
  let propertyY = yPosition + 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(receipt.property.details.name, margin + 5, propertyY);
  propertyY += 7;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(receipt.property.details.address.address, margin + 5, propertyY);
  propertyY += 5;
  doc.text(`${receipt.property.details.address.city}, ${receipt.property.details.address.country}`, margin + 5, propertyY);
  propertyY += 7;
  
  // Caractéristiques
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Type: ${receipt.property.details.residence.type}`, margin + 5, propertyY);
  doc.text(`Standing: ${receipt.property.details.residence.standing}`, margin + 50, propertyY);
  doc.text(`Capacité: ${receipt.property.details.residence.max_guests} personnes`, margin + 90, propertyY);

  yPosition += 45;

  // ============================================
  // SECTION: PAIEMENT (Mise en évidence)
  // ============================================
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('DÉTAILS DE PAIEMENT', margin, yPosition);
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.line(margin, yPosition + 3, pageWidth - margin, yPosition + 3);
  yPosition += 10;

  // Box de paiement avec fond
  const paymentBoxHeight = 50;
  doc.setFillColor(255, 250, 240); // Fond crème léger
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPosition, contentWidth, paymentBoxHeight, 3, 3, 'FD');
  
  // Montant total - Mise en évidence
  let paymentY = yPosition + 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Montant total payé', margin + 10, paymentY);
  
  paymentY += 8;
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(
    `${formatPrice(receipt.payment.total_price)} ${receipt.payment.payment_currency}`,
    pageWidth - margin - 10,
    paymentY,
    { align: 'right' }
  );
  
  paymentY += 10;
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  doc.line(margin + 10, paymentY, pageWidth - margin - 10, paymentY);
  paymentY += 7;
  
  // Détails de paiement
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Méthode: ${receipt.payment.payment_method}`, margin + 10, paymentY);
  
  if (receipt.payment.authorization_code) {
    doc.text(`Code: ${receipt.payment.authorization_code}`, margin + 70, paymentY);
  }

  yPosition += paymentBoxHeight + 10;

  // ============================================
  // SECTION: QR CODE ET VÉRIFICATION
  // ============================================
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

      // Box pour QR Code
      const qrBoxHeight = 55;
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.roundedRect(margin, yPosition, contentWidth, qrBoxHeight, 2, 2, 'FD');
      
      // Titre
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('CODE DE VÉRIFICATION', margin + 10, yPosition + 8);
      
      // QR Code centré
      const qrSize = 35;
      const qrX = (pageWidth - qrSize) / 2;
      doc.addImage(qrCodeDataUrl, 'PNG', qrX, yPosition + 12, qrSize, qrSize);
      
      // Instructions
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Scannez ce code pour vérifier votre réservation', margin, yPosition + qrBoxHeight - 5, { align: 'center', maxWidth: contentWidth });
      
      yPosition += qrBoxHeight + 8;
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  }

  // ============================================
  // SECTION: INFORMATIONS SUPPLÉMENTAIRES
  // ============================================
  // Propriétaire (petite section en bas)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('Propriétaire:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.owner.name, margin + 30, yPosition);
  if (receipt.owner.email) {
    yPosition += 5;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(receipt.owner.email, margin + 30, yPosition);
  }

  yPosition += 12;

  // ============================================
  // PIED DE PAGE
  // ============================================
  // Ligne de séparation
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Texte de disclaimer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'italic');
  doc.text('Ce document est un reçu officiel de votre transaction.', margin, yPosition, { align: 'center', maxWidth: contentWidth });
  yPosition += 5;
  doc.text('Pour toute question, contactez notre service client.', margin, yPosition, { align: 'center', maxWidth: contentWidth });
  yPosition += 5;
  
  // Informations de contact
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Dolci Rêva - Kiffer l\'instant', margin, yPosition, { align: 'center', maxWidth: contentWidth });
  yPosition += 4;
  doc.text('www.dolcireva.com | support@dolcireva.com', margin, yPosition, { align: 'center', maxWidth: contentWidth });

  // Télécharger le PDF
  const fileName = `receipt-${receipt.receipt_info.booking_reference}.pdf`;
  doc.save(fileName);
}

