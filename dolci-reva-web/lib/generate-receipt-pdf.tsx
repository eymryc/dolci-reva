import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import type { ReceiptData } from '@/hooks/use-bookings';
import { ReceiptDocument } from '@/components/receipt/ReceiptDocument';

export async function generateReceiptPDF(receipt: ReceiptData): Promise<void> {
  try {
    // Générer le QR code
    let qrCodeDataUrl: string | undefined;
    if (receipt.qr_code?.token) {
      try {
        qrCodeDataUrl = await QRCode.toDataURL(receipt.qr_code.token, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
      } catch (error) {
        console.error('Erreur lors de la génération du QR code:', error);
      }
    }

    // Générer le PDF avec @react-pdf/renderer
    const blob = await pdf(
      <ReceiptDocument receipt={receipt} qrCodeDataUrl={qrCodeDataUrl} />
    ).toBlob();

    // Télécharger le PDF
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${receipt.receipt_info.booking_reference}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
}

