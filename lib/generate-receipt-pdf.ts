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
  const margin = 25; // Marges augmentées
  const contentWidth = pageWidth - (margin * 2);
  
  // Couleurs Dolci Rêva
  const primaryOrange: [number, number, number] = [240, 132, 0]; // #f08400
  const white: [number, number, number] = [255, 255, 255];
  const textDark: [number, number, number] = [33, 33, 33];
  const textLight: [number, number, number] = [120, 120, 120];

  let yPosition = margin;

  // ============================================
  // EN-TÊTE ORANGE
  // ============================================
  const headerHeight = 25;
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
  // Logo
  doc.setFillColor(white[0], white[1], white[2]);
  doc.roundedRect(margin, 8, 12, 12, 2, 2, 'F');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DR', margin + 2, 16.5);
  
  // Nom de l'entreprise
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Dolci Rêva', margin + 22, 16);

  yPosition = headerHeight + 15;

  // ============================================
  // QR CODE EN HAUT À GAUCHE (1/4 de la page)
  // ============================================
  const qrSectionWidth = contentWidth * 0.25; // 1/4 de la largeur
  const qrSectionX = margin;
  const detailsSectionX = margin + qrSectionWidth + 15; // Espacement entre QR et détails

  // QR Code
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

      const qrSize = qrSectionWidth - 5; // QR code occupe presque toute la largeur de la section
      const qrX = qrSectionX;
      const qrY = yPosition;
      
      // Fond blanc pour le QR
      doc.setFillColor(white[0], white[1], white[2]);
      doc.roundedRect(qrX, qrY, qrSize, qrSize, 2, 2, 'F');
      
      doc.addImage(qrCodeDataUrl, 'PNG', qrX + 2, qrY + 2, qrSize - 4, qrSize - 4);
      
      // Texte sous le QR
      const qrTextY = qrY + qrSize + 5;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      doc.text('Code de vérification', qrX + qrSize / 2, qrTextY, { align: 'center', maxWidth: qrSize });
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  }

  // ============================================
  // DÉTAILS DE LA RÉSERVATION ET CLIENT (à droite du QR)
  // ============================================
  let detailsY = yPosition;

  // Titre "REÇU"
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('REÇU', detailsSectionX, detailsY);
  detailsY += 8;

  // Informations du reçu
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Référence: ${receipt.receipt_info.booking_reference}`, detailsSectionX, detailsY);
  detailsY += 5;
  doc.text(`Date: ${formatDateShort(receipt.receipt_info.payment_date)}`, detailsSectionX, detailsY);
  detailsY += 5;
  doc.text(`Transaction: ${receipt.receipt_info.payment_reference}`, detailsSectionX, detailsY);
  detailsY += 10;

  // Détails de la réservation
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('DÉTAILS DE LA RÉSERVATION', detailsSectionX, detailsY);
  detailsY += 7;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Type: ${receipt.booking.booking_type}`, detailsSectionX, detailsY);
  detailsY += 5;
  doc.text(`Référence: ${receipt.booking.booking_reference}`, detailsSectionX, detailsY);
  detailsY += 5;
  doc.text(`Arrivée: ${formatDateShort(receipt.booking.start_date)}`, detailsSectionX, detailsY);
  detailsY += 5;
  doc.text(`Départ: ${formatDateShort(receipt.booking.end_date)}`, detailsSectionX, detailsY);
  detailsY += 5;
  doc.text(`Voyageurs: ${receipt.booking.guests}`, detailsSectionX, detailsY);
  detailsY += 10;

  // Informations du client (celui qui a passé la réservation)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('CLIENT', detailsSectionX, detailsY);
  detailsY += 7;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  
  // Séparer nom et prénom
  const nameParts = receipt.customer.name.trim().split(/\s+/);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';
  const lastName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : receipt.customer.name;
  
  if (firstName) {
    doc.text(`Prénom: ${firstName}`, detailsSectionX, detailsY);
    detailsY += 5;
    doc.text(`Nom: ${lastName}`, detailsSectionX, detailsY);
  } else {
    doc.text(`Nom: ${lastName}`, detailsSectionX, detailsY);
  }
  detailsY += 5;
  doc.setFontSize(8);
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text(`Email: ${receipt.customer.email}`, detailsSectionX, detailsY);
  detailsY += 4;
  doc.text(`Téléphone: ${receipt.customer.phone}`, detailsSectionX, detailsY);

  // Calculer la position Y après le QR code et les détails
  const qrEndY = yPosition + (contentWidth * 0.25) + 20; // Hauteur du QR + texte
  yPosition = Math.max(qrEndY, detailsY) + 15;

  // ============================================
  // ÉTABLISSEMENT
  // ============================================
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('ÉTABLISSEMENT', margin, yPosition);
  yPosition += 7;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receipt.property.details.name, margin, yPosition);
  yPosition += 5;
  doc.setFontSize(8);
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text(receipt.property.details.address.address, margin, yPosition);
  yPosition += 4;
  doc.text(`${receipt.property.details.address.city}, ${receipt.property.details.address.country}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Type: ${receipt.property.details.residence.type} | Standing: ${receipt.property.details.residence.standing}`, margin, yPosition);
  yPosition += 4;
  doc.text(`Capacité: ${receipt.property.details.residence.max_guests} personnes`, margin, yPosition);

  yPosition += 10;

  // ============================================
  // PROPRIÉTAIRE
  // ============================================
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('PROPRIÉTAIRE', margin, yPosition);
  yPosition += 7;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receipt.owner.name, margin, yPosition);
  if (receipt.owner.email) {
    yPosition += 5;
    doc.setFontSize(8);
    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
    doc.text(`Email: ${receipt.owner.email}`, margin, yPosition);
  }
  if (receipt.owner.phone) {
    yPosition += 4;
    doc.text(`Téléphone: ${receipt.owner.phone}`, margin, yPosition);
  }

  yPosition += 15;

  // ============================================
  // SECTION PAIEMENT (centrée) avec Total
  // ============================================
  const paymentSectionWidth = contentWidth * 0.7;
  const paymentSectionX = (pageWidth - paymentSectionWidth) / 2;
  const totalBoxHeight = 30;
  
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.roundedRect(paymentSectionX, yPosition, paymentSectionWidth, totalBoxHeight, 3, 3, 'F');
  
  const totalTextY = yPosition + 10;
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MONTANT TOTAL', paymentSectionX + 10, totalTextY);
  
  doc.setFontSize(20);
  doc.text(
    `${formatPrice(receipt.payment.total_price)} ${receipt.payment.payment_currency}`,
    paymentSectionX + paymentSectionWidth - 10,
    totalTextY + 10,
    { align: 'right' }
  );
  
  // Détails de paiement sous le total
  const paymentDetailY = yPosition + totalBoxHeight + 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Méthode: ${receipt.payment.payment_method}`, paymentSectionX, paymentDetailY);
  if (receipt.payment.authorization_code) {
    doc.text(`Code: ${receipt.payment.authorization_code}`, paymentSectionX + 70, paymentDetailY);
  }

  // ============================================
  // PIED DE PAGE ORANGE
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
