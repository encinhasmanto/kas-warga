import { terbilang } from './terbilang';

/**
 * Generates a Receipt PDF using jsPDF
 */
export async function generateReceiptPdf(receiptData: any) {
  if (!import.meta.client) {
    throw new Error('generateReceiptPdf can only be run on the client side.');
  }

  // Dynamic import jsPDF to keep bundle size small and avoid SSR issues
  const { jsPDF } = await import('jspdf');
  
  // A5 Landscape roughly 210 x 148 mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 15;

  // 1. Header & Logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(19, 127, 236); // Primary Color
  doc.text('PERMATA TAJUR TOWNHOUSE', margin, 20);
  
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('Jl. Raya Tajur, Bogor, Jawa Barat', margin, 25);
  doc.text('Neighborhood Financial Management System', margin, 29);

  // 2. Receipt Title & Number
  doc.setFontSize(22);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('KWITANSI', width - margin, 22, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`No: ${receiptData.receipt_number}`, width - margin, 28, { align: 'right' });

  // 3. Main Content Box
  const boxY = 40;
  doc.setDrawColor(230);
  doc.setFillColor(250);
  doc.roundedRect(margin, boxY, width - (margin * 2), 65, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setTextColor(50);
  
  // Labels
  doc.text('Sudah terima dari', margin + 5, boxY + 10);
  doc.text('Banyaknya uang', margin + 5, boxY + 22);
  doc.text('Untuk pembayaran', margin + 5, boxY + 34);

  // Values
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(`:  ${receiptData.owner_name} (Unit ${receiptData.unit_code})`, margin + 45, boxY + 10);
  
  // Terbilang box
  doc.setFont('helvetica', 'italic');
  const amountWords = terbilang(receiptData.amount);
  doc.text(`:  # ${amountWords} #`, margin + 45, boxY + 22, { maxWidth: 120 });
  
  doc.setFont('helvetica', 'bold');
  doc.text(`:  ${receiptData.payment_description}`, margin + 45, boxY + 34);

  // Amount
  doc.setFontSize(18);
  doc.setTextColor(19, 127, 236);
  doc.text(`Rp ${new Intl.NumberFormat('id-ID').format(receiptData.amount)},-`, margin + 45, boxY + 55);

  // 4. Footer & Signature
  const footerY = 115;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Bogor, ${new Date(receiptData.payment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, width - margin - 40, footerY);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(receiptData.issued_by || 'Bendahara', width - margin - 40, footerY + 20);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150);
  doc.text('Dokumen ini dihasilkan secara otomatis oleh sistem KasWarga', margin, height - 10);

  // 5. Signature & Stamp Placeholder Overlay
  // In a real scenario, we would use doc.addImage() here.
  // We'll add a colored rectangle to simulate a stamp.
  doc.setDrawColor(19, 127, 236);
  doc.setLineWidth(0.5);
  doc.circle(width - margin - 45, footerY + 12, 10, 'S');
  doc.setFontSize(6);
  doc.text('PAID', width - margin - 48, footerY + 13);

  return doc;
}
