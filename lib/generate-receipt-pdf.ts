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
  const textDark: [number, number, number] = [33, 33, 33];
  const textLight: [number, number, number] = [120, 120, 120];

  let yPosition = margin;

  // ============================================
  // EN-TÊTE ORANGE (comme OlistaDental)
  // ============================================
  const headerHeight = 25;
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  
  // Logo Dolci Rêva - Essayer de charger depuis public/logo
  try {
    // En production, le logo sera accessible via l'URL publique
    const logoUrl = typeof window !== 'undefined' 
      ? '/logo/logo-custom.png' 
      : null;
    
    if (logoUrl && typeof window !== 'undefined') {
      // En client-side, on peut essayer de charger l'image
      // Mais pour jsPDF, on doit passer par une URL complète ou base64
      // Pour l'instant, on garde le logo simplifié amélioré
      doc.setFillColor(white[0], white[1], white[2]);
      doc.roundedRect(margin, 8, 12, 12, 2, 2, 'F');
      doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DR', margin + 2, 16.5);
    } else {
      // Logo simplifié amélioré
      doc.setFillColor(white[0], white[1], white[2]);
      doc.roundedRect(margin, 8, 12, 12, 2, 2, 'F');
      doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DR', margin + 2, 16.5);
    }
  } catch {
    // Fallback au logo simplifié
    doc.setFillColor(white[0], white[1], white[2]);
    doc.roundedRect(margin, 8, 12, 12, 2, 2, 'F');
    doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DR', margin + 2, 16.5);
  }
  
  // Nom de l'entreprise
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Dolci Rêva', margin + 22, 16);

  yPosition = headerHeight + 15;

  // ============================================
  // SECTION "FACTURÉ À" (gauche) et "REÇU" (droite)
  // ============================================
  const leftColWidth = contentWidth * 0.5;

  // "Facturé à" - Gauche
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Facturé à:', margin, yPosition);
  
  yPosition += 6;
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Séparer nom et prénom
  const nameParts = receipt.customer.name.trim().split(/\s+/);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';
  const lastName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : receipt.customer.name;
  
  if (firstName) {
    doc.text(`Prénom: ${firstName}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Nom: ${lastName}`, margin, yPosition);
  } else {
    doc.text(`Nom: ${lastName}`, margin, yPosition);
  }
  yPosition += 5;
  doc.setFontSize(9);
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text(receipt.customer.email, margin, yPosition);
  yPosition += 4;
  doc.text(receipt.customer.phone, margin, yPosition);
  yPosition += 8;

  // Détails de la réservation (juste en dessous de "Facturé à") - SANS fond gris
  let bookingDetailY = yPosition;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('Détails de la réservation', margin, bookingDetailY);
  bookingDetailY += 6;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Type: ${receipt.booking.booking_type}`, margin, bookingDetailY);
  bookingDetailY += 4;
  doc.text(`Référence: ${receipt.booking.booking_reference}`, margin, bookingDetailY);
  bookingDetailY += 4;
  doc.text(`Arrivée: ${formatDateShort(receipt.booking.start_date)}`, margin, bookingDetailY);
  bookingDetailY += 4;
  doc.text(`Départ: ${formatDateShort(receipt.booking.end_date)}`, margin, bookingDetailY);
  bookingDetailY += 4;
  doc.text(`Voyageurs: ${receipt.booking.guests}`, margin, bookingDetailY);

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
  
  receiptY += 10;
  
  // ÉTABLISSEMENT en face de "Détails de la réservation"
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('ÉTABLISSEMENT', receiptX, receiptY);
  receiptY += 6;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receipt.property.details.name, receiptX, receiptY);
  receiptY += 4;
  doc.setFontSize(7);
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text(receipt.property.details.address.address.substring(0, 35), receiptX, receiptY);
  receiptY += 4;
  doc.text(`${receipt.property.details.address.city}, ${receipt.property.details.address.country}`, receiptX, receiptY);
  receiptY += 4;
  doc.text(`Type: ${receipt.property.details.residence.type}`, receiptX, receiptY);
  receiptY += 4;
  doc.text(`Standing: ${receipt.property.details.residence.standing}`, receiptX, receiptY);
  
  receiptY += 6;
  
  // Détails du customer (propriétaire)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('PROPRIÉTAIRE', receiptX, receiptY);
  receiptY += 6;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receipt.owner.name, receiptX, receiptY);
  if (receipt.owner.email) {
    receiptY += 4;
    doc.setFontSize(7);
    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
    doc.text(receipt.owner.email, receiptX, receiptY);
  }
  if (receipt.owner.phone) {
    receiptY += 4;
    doc.text(receipt.owner.phone, receiptX, receiptY);
  }

  // Calculer la position Y après les sections gauche/droite
  const maxY = Math.max(bookingDetailY + 10, receiptY + 20);
  yPosition = maxY + 15;

  // ============================================
  // SECTION PAIEMENT (centrée) avec QR Code et Total
  // ============================================
  const paymentSectionWidth = contentWidth * 0.6;
  const paymentSectionX = (pageWidth - paymentSectionWidth) / 2;

  // QR Code à gauche
  const qrY = yPosition;
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

      const qrSize = 40;
      const qrX = paymentSectionX;
      doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      
      // Texte sous le QR
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      doc.text('Code de vérification', qrX, qrY + qrSize + 4, { align: 'center', maxWidth: qrSize });
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  }

  // Total à droite du QR
  const totalX = paymentSectionX + 50;
  const totalY = yPosition;
  const totalBoxWidth = paymentSectionWidth - 50;
  const totalBoxHeight = 25;
  
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.roundedRect(totalX, totalY, totalBoxWidth, totalBoxHeight, 3, 3, 'F');
  
  const totalTextY = totalY + 8;
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MONTANT TOTAL', totalX + 8, totalTextY);
  
  doc.setFontSize(18);
  doc.text(
    `${formatPrice(receipt.payment.total_price)} ${receipt.payment.payment_currency}`,
    totalX + totalBoxWidth - 8,
    totalTextY + 8,
    { align: 'right' }
  );
  
  // Détails de paiement sous le total
  const paymentDetailY = totalY + totalBoxHeight + 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Méthode: ${receipt.payment.payment_method}`, totalX, paymentDetailY);
  if (receipt.payment.authorization_code) {
    doc.text(`Code: ${receipt.payment.authorization_code}`, totalX + 60, paymentDetailY);
  }


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
