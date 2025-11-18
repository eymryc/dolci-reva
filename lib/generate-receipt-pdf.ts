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
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Couleurs
  const primaryColor: [number, number, number] = [255, 140, 0]; // Orange
  const darkColor: [number, number, number] = [51, 51, 51];
  const lightGray: [number, number, number] = [245, 245, 245];

  // En-tête
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Dolci Rêva', margin, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Reçu de paiement', margin, 27);

  // Référence à droite
  doc.setFontSize(10);
  doc.text('Référence:', pageWidth - margin - 40, 20);
  doc.setFont('helvetica', 'bold');
  doc.text(receipt.receipt_info.booking_reference, pageWidth - margin - 40, 25);

  yPosition = 40;

  // Informations du reçu
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const receiptInfo = [
    ['Date de paiement', formatDate(receipt.receipt_info.payment_date)],
    ['Référence transaction', receipt.receipt_info.payment_reference],
    ['Statut', receipt.receipt_info.payment_status === 'PAYE' ? 'Payé' : 'En attente'],
    ['Reçu généré le', formatDate(receipt.receipt_info.generated_at)],
  ];

  receiptInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 50, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Informations client
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(margin, yPosition, contentWidth, 25, 'F');
  yPosition += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations client', margin + 2, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom: ${receipt.customer.name}`, margin + 2, yPosition);
  yPosition += 6;
  doc.text(`Email: ${receipt.customer.email}`, margin + 2, yPosition);
  yPosition += 6;
  doc.text(`Téléphone: ${receipt.customer.phone}`, margin + 2, yPosition);
  yPosition += 10;

  // Détails de réservation
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Détails de la réservation', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const bookingInfo = [
    ['Type', receipt.booking.booking_type],
    ['Référence', receipt.booking.booking_reference],
    ['Date d\'arrivée', formatDate(receipt.booking.start_date)],
    ['Date de départ', formatDate(receipt.booking.end_date)],
    ['Nombre de voyageurs', receipt.booking.guests],
    ['Statut', receipt.booking.status === 'CONFIRME' ? 'Confirmée' : 'En attente'],
  ];

  bookingInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 50, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Établissement
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(margin, yPosition, contentWidth, 30, 'F');
  yPosition += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Établissement', margin + 2, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom: ${receipt.property.details.name}`, margin + 2, yPosition);
  yPosition += 6;
  doc.text(`Adresse: ${receipt.property.details.address.address}`, margin + 2, yPosition);
  yPosition += 6;
  doc.text(`${receipt.property.details.address.city}, ${receipt.property.details.address.country}`, margin + 2, yPosition);
  yPosition += 6;
  doc.text(`Type: ${receipt.property.details.residence.type} | Standing: ${receipt.property.details.residence.standing}`, margin + 2, yPosition);
  yPosition += 10;

  // Détails de paiement
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Détails de paiement', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Ligne de montant total
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Montant total:', margin, yPosition);
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${formatPrice(receipt.payment.total_price)} ${receipt.payment.payment_currency}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`Méthode de paiement: ${receipt.payment.payment_method}`, margin, yPosition);
  yPosition += 6;

  if (receipt.payment.authorization_code) {
    doc.text(`Code d'autorisation: ${receipt.payment.authorization_code}`, margin, yPosition);
    yPosition += 6;
  }

  yPosition += 5;

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

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Code de vérification', margin, yPosition);
      yPosition += 8;

      doc.addImage(qrCodeDataUrl, 'PNG', margin, yPosition, 40, 40);
      yPosition += 45;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Scannez ce code pour vérifier votre réservation', margin, yPosition);
      yPosition += 4;
      doc.text(`URL: ${receipt.qr_code.qr_code_url}`, margin, yPosition, { maxWidth: contentWidth });
      yPosition += 8;
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  }

  // Propriétaire
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Propriétaire', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom: ${receipt.owner.name}`, margin, yPosition);
  if (receipt.owner.email) {
    yPosition += 6;
    doc.text(`Email: ${receipt.owner.email}`, margin, yPosition);
  }

  yPosition += 10;

  // Pied de page
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.text('Ce document est un reçu officiel de votre transaction.', margin, yPosition, { align: 'center', maxWidth: contentWidth });
  yPosition += 5;
  doc.text('Pour toute question, contactez notre service client.', margin, yPosition, { align: 'center', maxWidth: contentWidth });

  // Télécharger le PDF
  const fileName = `receipt-${receipt.receipt_info.booking_reference}.pdf`;
  doc.save(fileName);
}

