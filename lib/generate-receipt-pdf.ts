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
  
  // Couleurs Dolci Rêva
  const primaryOrange: [number, number, number] = [240, 132, 0]; // #f08400
  const secondaryDark: [number, number, number] = [18, 16, 12]; // #12100c
  const white: [number, number, number] = [255, 255, 255];
  const lightGray: [number, number, number] = [248, 249, 250];
  const textDark: [number, number, number] = [33, 33, 33];
  const textLight: [number, number, number] = [100, 100, 100];

  // ============================================
  // FOND SOMBRE (comme le poster)
  // ============================================
  doc.setFillColor(secondaryDark[0], secondaryDark[1], secondaryDark[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // ============================================
  // RECTANGLE BLANC PRINCIPAL (avec coins arrondis simulés)
  // ============================================
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - (margin * 2);
  const borderRadius = 8;
  
  // Fond blanc
  doc.setFillColor(white[0], white[1], white[2]);
  doc.roundedRect(margin, margin, contentWidth, contentHeight, borderRadius, borderRadius, 'F');
  
  let yPosition = margin + 15;

  // ============================================
  // LOGO EN HAUT À GAUCHE
  // ============================================
  // Carré avec "D" (logo simplifié)
  doc.setFillColor(secondaryDark[0], secondaryDark[1], secondaryDark[2]);
  doc.roundedRect(margin + 8, yPosition - 5, 8, 8, 1, 1, 'F');
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('D', margin + 11.5, yPosition);
  
  // Texte "Dolci Rêva"
  doc.setTextColor(secondaryDark[0], secondaryDark[1], secondaryDark[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Dolci Rêva', margin + 20, yPosition);

  yPosition += 20;

  // ============================================
  // SECTION PRINCIPALE (fond sombre comme le poster)
  // ============================================
  const mainSectionHeight = 80;
  doc.setFillColor(secondaryDark[0], secondaryDark[1], secondaryDark[2]);
  doc.roundedRect(margin + 8, yPosition, contentWidth - 16, mainSectionHeight, 6, 6, 'F');
  
  // Texte principal en orange (à droite)
  const textX = margin + 8 + (contentWidth - 16) - 100;
  let textY = yPosition + 15;
  
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Reçu de', textX, textY);
  textY += 8;
  doc.text('paiement', textX, textY);
  textY += 8;
  doc.text('officiel', textX, textY);

  // QR Code à gauche (comme le smartphone du poster)
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

      const qrSize = 50;
      const qrX = margin + 20;
      const qrY = yPosition + 15;
      
      // Fond blanc pour le QR code (simule l'écran du téléphone)
      doc.setFillColor(white[0], white[1], white[2]);
      doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 2, 'F');
      
      doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  }

  yPosition += mainSectionHeight + 15;

  // ============================================
  // BOX ORANGE (comme "Download our App")
  // ============================================
  const orangeBoxHeight = 25;
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.roundedRect(margin + 8, yPosition, (contentWidth - 16) * 0.55, orangeBoxHeight, 4, 4, 'F');
  
  let boxY = yPosition + 8;
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Montant payé', margin + 15, boxY);
  boxY += 7;
  doc.setFontSize(16);
  doc.text(
    `${formatPrice(receipt.payment.total_price)} ${receipt.payment.payment_currency}`,
    margin + 15,
    boxY
  );

  // ============================================
  // BOX BLANCHE (informations détaillées)
  // ============================================
  const infoBoxX = margin + 8 + (contentWidth - 16) * 0.58;
  const infoBoxWidth = (contentWidth - 16) * 0.42;
  const infoBoxHeight = 50;
  
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.roundedRect(infoBoxX, yPosition, infoBoxWidth, infoBoxHeight, 4, 4, 'FD');
  
  let infoY = yPosition + 8;
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Détails', infoBoxX + 5, infoY);
  infoY += 6;
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Réf: ${receipt.receipt_info.booking_reference}`, infoBoxX + 5, infoY);
  infoY += 4;
  doc.text(`Date: ${formatDateShort(receipt.receipt_info.payment_date)}`, infoBoxX + 5, infoY);
  infoY += 4;
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text(`Méthode: ${receipt.payment.payment_method}`, infoBoxX + 5, infoY);
  infoY += 4;
  if (receipt.payment.authorization_code) {
    doc.text(`Code: ${receipt.payment.authorization_code.substring(0, 15)}...`, infoBoxX + 5, infoY);
  }

  yPosition += Math.max(orangeBoxHeight, infoBoxHeight) + 12;

  // ============================================
  // INFORMATIONS CLIENT ET RÉSERVATION
  // ============================================
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryDark[0], secondaryDark[1], secondaryDark[2]);
  doc.text('Informations', margin + 8, yPosition);
  yPosition += 8;

  // Client
  const colWidth = (contentWidth - 24) / 2;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(margin + 8, yPosition, colWidth, 30, 3, 3, 'F');
  
  let clientY = yPosition + 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryDark[0], secondaryDark[1], secondaryDark[2]);
  doc.text('CLIENT', margin + 12, clientY);
  clientY += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Nom: ${receipt.customer.name.substring(0, 22)}`, margin + 12, clientY);
  clientY += 4;
  doc.setFontSize(7);
  doc.text(`Email: ${receipt.customer.email.substring(0, 25)}`, margin + 12, clientY);
  clientY += 4;
  doc.setFontSize(8);
  doc.text(`Tél: ${receipt.customer.phone}`, margin + 12, clientY);

  // Réservation
  const resX = margin + 8 + colWidth + 8;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(resX, yPosition, colWidth, 30, 3, 3, 'F');
  
  let resY = yPosition + 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryDark[0], secondaryDark[1], secondaryDark[2]);
  doc.text('RÉSERVATION', resX + 5, resY);
  resY += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Type: ${receipt.booking.booking_type}`, resX + 5, resY);
  resY += 4;
  doc.setFontSize(7);
  doc.text(`Arrivée: ${formatDateShort(receipt.booking.start_date)}`, resX + 5, resY);
  resY += 4;
  doc.text(`Départ: ${formatDateShort(receipt.booking.end_date)}`, resX + 5, resY);
  resY += 4;
  doc.setFontSize(8);
  doc.text(`Voyageurs: ${receipt.booking.guests}`, resX + 5, resY);

  yPosition += 38;

  // ============================================
  // ÉTABLISSEMENT
  // ============================================
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(margin + 8, yPosition, contentWidth - 16, 25, 3, 3, 'F');
  
  let propY = yPosition + 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryDark[0], secondaryDark[1], secondaryDark[2]);
  doc.text(receipt.property.details.name, margin + 12, propY);
  propY += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receipt.property.details.address.address.substring(0, 55), margin + 12, propY);
  propY += 4;
  doc.text(`${receipt.property.details.address.city}, ${receipt.property.details.address.country}`, margin + 12, propY);
  propY += 4;
  doc.setFontSize(7);
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text(`Type: ${receipt.property.details.residence.type} | Standing: ${receipt.property.details.residence.standing}`, margin + 12, propY);

  yPosition += 32;

  // ============================================
  // PROPRIÉTAIRE (petit en bas)
  // ============================================
  if (yPosition < pageHeight - margin - 15) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
    doc.text(`Propriétaire: ${receipt.owner.name}`, margin + 8, yPosition);
  }

  // ============================================
  // PIED DE PAGE (fond sombre)
  // ============================================
  const footerY = pageHeight - margin - 12;
  doc.setFillColor(secondaryDark[0], secondaryDark[1], secondaryDark[2]);
  doc.roundedRect(margin + 8, footerY, contentWidth - 16, 10, 0, 0, 'F');
  
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('Ce document est un reçu officiel de votre transaction.', margin + 8, footerY + 4, { align: 'center', maxWidth: contentWidth - 16 });
  doc.setFontSize(6);
  doc.text('Dolci Rêva - Kiffer l\'instant | www.dolcireva.com', margin + 8, footerY + 7.5, { align: 'center', maxWidth: contentWidth - 16 });

  // Télécharger le PDF
  const fileName = `receipt-${receipt.receipt_info.booking_reference}.pdf`;
  doc.save(fileName);
}
