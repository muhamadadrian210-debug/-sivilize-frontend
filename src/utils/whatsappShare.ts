export interface WAShareOptions {
  projectName: string;
  location: string;
  grandTotal: number;
  categoryBreakdown: { category: string; subtotal: number }[];
  versionLabel?: string;
  companyName?: string;
  preparedBy?: string;
}

/**
 * Format angka ke format Rupiah untuk WhatsApp (tanpa simbol Rp agar lebih ringkas).
 */
export function formatCurrencyWA(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate teks RAB untuk dikirim via WhatsApp.
 */
export function generateWAText(options: WAShareOptions): string {
  const {
    projectName,
    location,
    grandTotal,
    categoryBreakdown,
    versionLabel,
    companyName = 'SIVILIZE HUB PRO',
    preparedBy,
  } = options;

  const lines: string[] = [];

  lines.push(`*RENCANA ANGGARAN BIAYA (RAB)*`);
  lines.push(`*${projectName}*`);
  lines.push(`📍 ${location}`);
  if (versionLabel) lines.push(`📋 ${versionLabel}`);
  lines.push('');
  lines.push('*Rincian per Kategori:*');

  for (const { category, subtotal } of categoryBreakdown) {
    lines.push(`• ${category}: ${formatCurrencyWA(subtotal)}`);
  }

  lines.push('');
  lines.push(`*GRAND TOTAL: ${formatCurrencyWA(grandTotal)}*`);
  lines.push('');

  if (preparedBy) {
    lines.push(`Dibuat oleh: ${preparedBy}`);
  }

  lines.push(`_Dibuat dengan ${companyName}_`);
  lines.push(`_Platform RAB Konstruksi Indonesia_`);

  return lines.join('\n');
}

/**
 * Buka WhatsApp dengan teks yang sudah di-encode.
 */
export function openWhatsApp(text: string, phoneNumber?: string): void {
  const encoded = encodeURIComponent(text);
  const url = phoneNumber
    ? `https://wa.me/${phoneNumber}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
