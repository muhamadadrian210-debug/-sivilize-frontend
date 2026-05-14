import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { type RABItem, type FinancialSettings, type Project, type LaborPayment } from '../store/useStore';
import { calculateTotalRAB, getGroupedRABItems } from './calculations';
import { getCityDisplayName, type MaterialGrade } from '../data/prices';
import { type KurvaSChartPoint } from './kurvaSUtils';

// ============================================================
// TYPES & HELPERS
// ============================================================
type JsPDFWithAutoTable = jsPDF & {
  autoTable: (options: any) => void;
  lastAutoTable?: { finalY: number };
};

const groupAndExportRAB = (items: RABItem[]) =>
  getGroupedRABItems(items).filter(g => g.items.length > 0);

const toRp = (n: any): string => {
  try {
    const val = typeof n === 'number' ? n : parseFloat(n);
    if (isNaN(val)) return 'Rp 0';
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  } catch {
    return 'Rp 0';
  }
};

export interface ExportOptions {
  companyName?: string;
  preparedBy?: string;
  approvedBy?: string;
  projectNo?: string;
}

// ============================================================
// EXPORT PDF PROFESIONAL
// ============================================================
export const exportToPDF = (
  project: Partial<Project>,
  items: RABItem[],
  financials: FinancialSettings,
  grade: MaterialGrade,
  options?: ExportOptions
) => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }) as unknown as JsPDFWithAutoTable;
    
    if (!items || items.length === 0) {
      alert('Peringatan: Tidak ada data RAB untuk diunduh.');
      return;
    }

    const summary = calculateTotalRAB(items, financials);
    const grouped = groupAndExportRAB(items);
    const pageW = 210;
    const margin = 14;
    const contentW = pageW - margin * 2;
    const company = (options?.companyName || 'SIVILIZE HUB PRO').toUpperCase();
    const preparedBy = options?.preparedBy || '-';
    const approvedBy = options?.approvedBy || '-';
    const projectNo = options?.projectNo || `SIV-${Date.now().toString().slice(-6)}`;

    const safeText = (txt: string, x: number, y: number, opt?: any) => {
      doc.text(txt || '-', x, y, opt);
    };

    // KOP SURAT
    doc.setDrawColor(255, 122, 0); doc.setLineWidth(1.5);
    doc.line(margin, 12, pageW - margin, 12);
    doc.setFillColor(255, 122, 0);
    doc.roundedRect(margin, 15, 18, 18, 2, 2, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    safeText('SHP', margin + 9, 25, { align: 'center' });
    doc.setTextColor(30, 30, 30); doc.setFontSize(16);
    safeText(company, margin + 22, 21);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
    safeText('Platform Teknik Sipil Berbasis AI', margin + 22, 26);
    safeText('sivilize-hub-pro.vercel.app', margin + 22, 30);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 122, 0);
    safeText('RENCANA ANGGARAN BIAYA', pageW - margin, 19, { align: 'right' });
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100);
    safeText(`No. Dokumen: ${projectNo}`, pageW - margin, 24, { align: 'right' });
    safeText(`Tanggal: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageW - margin, 28, { align: 'right' });
    doc.setDrawColor(255, 122, 0); doc.setLineWidth(0.5);
    doc.line(margin, 36, pageW - margin, 36);

    // INFO PROYEK
    let y = 42;
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(margin, y, contentW, 22, 2, 2, 'F');
    doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, 22, 2, 2, 'S');
    const col1 = margin + 4, col2 = margin + contentW / 2 + 4;
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 80, 80);
    ['Nama Proyek', 'Lokasi', 'Grade Material'].forEach((l, i) => safeText(l, col1, y + 5 + i * 6));
    ['Estimator', 'Status', 'Tgl Laporan'].forEach((l, i) => safeText(l, col2, y + 5 + i * 6));
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    [`: ${project.name || '-'}`, `: ${getCityDisplayName(project.location || '-')}`, `: Grade ${grade}`].forEach((v, i) => safeText(v, col1 + 28, y + 5 + i * 6));
    [`: ${preparedBy}`, `: ${project.status || 'draft'}`, `: ${new Date().toLocaleDateString('id-ID')}`].forEach((v, i) => safeText(v, col2 + 28, y + 5 + i * 6));
    y += 28;

    // TABEL RAB
    let itemNo = 1;
    grouped.forEach((group) => {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFillColor(255, 122, 0); doc.setTextColor(255, 255, 255);
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.rect(margin, y, contentW, 7, 'F');
      safeText(group.kategori.toUpperCase(), margin + 3, y + 5);
      y += 7;
      
      const tableData = group.items.map((item: RABItem) => [
        itemNo++, 
        item.name || '-', 
        (item.volume || 0).toFixed(3), 
        item.unit || '-',
        toRp(item.unitPrice), 
        toRp(item.total),
      ]);
      tableData.push(['', `SUBTOTAL ${group.kategori.toUpperCase()}`, '', '', '', toRp(group.subtotal)]);
      
      autoTable(doc, {
        startY: y,
        head: [['No', 'Uraian Pekerjaan', 'Volume', 'Sat', 'Harga Satuan', 'Jumlah']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 30, 30] },
        headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 65 }, 2: { halign: 'right' }, 3: { halign: 'center' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
        didParseCell: (data: any) => {
          if (data.section === 'body' && data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 240, 240];
          }
        },
        margin: { left: margin, right: margin },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
    });

    // SUMMARY
    if (y > 230) { doc.addPage(); y = 20; }
    y += 4;
    const summaryX = pageW - margin - 80;
    doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.3);
    doc.line(summaryX, y, pageW - margin, y); y += 4;
    const addRow = (label: string, value: number, bold = false) => {
      doc.setFontSize(8.5); doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(bold ? 30 : 80, bold ? 30 : 80, bold ? 30 : 80);
      safeText(label, summaryX, y);
      safeText(toRp(value), pageW - margin, y, { align: 'right' });
      y += 5.5;
    };
    addRow('Subtotal Pekerjaan', summary.subtotal);
    addRow(`Overhead (${financials.overhead}%)`, summary.overheadAmount);
    addRow(`Profit (${financials.profit}%)`, summary.profitAmount);
    if (financials.contingency > 0) addRow(`Biaya Tak Terduga (${financials.contingency}%)`, summary.contingencyAmount);
    addRow(`PPN (${financials.tax}%)`, summary.taxAmount);
    doc.setDrawColor(255, 122, 0); doc.setLineWidth(0.8);
    doc.line(summaryX, y, pageW - margin, y); y += 2;
    doc.setFillColor(255, 122, 0); doc.rect(summaryX, y, 80, 8, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    safeText('GRAND TOTAL', summaryX + 2, y + 5.5);
    safeText(toRp(summary.grandTotal), pageW - margin, y + 5.5, { align: 'right' });
    y += 14;

    // TANDA TANGAN
    if (y > 240) { doc.addPage(); y = 20; }
    y += 6;
    const sigColW = (pageW - margin * 2) / 3;
    [{ t: 'Dibuat Oleh', n: preparedBy }, { t: 'Diperiksa Oleh', n: '-' }, { t: 'Disetujui Oleh', n: approvedBy }].forEach((box, i) => {
      const x = margin + i * sigColW;
      doc.setDrawColor(200, 200, 200); doc.rect(x, y, sigColW - 4, 30, 'S');
      doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30); doc.setFontSize(8);
      safeText(box.t, x + (sigColW - 4) / 2, y + 5, { align: 'center' });
      doc.line(x + 6, y + 22, x + sigColW - 10, y + 22);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
      safeText(box.n, x + (sigColW - 4) / 2, y + 26, { align: 'center' });
    });

    // FOOTER
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7); doc.setTextColor(150, 150, 150);
      safeText(`SIVILIZE HUB PRO | Halaman ${i} dari ${pageCount}`, pageW / 2, 290, { align: 'center' });
    }
    doc.save(`RAB_${(project.name || 'Proyek').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (err) {
    console.error('PDF Export Error:', err);
    alert('Gagal membuat PDF. Silakan coba lagi.');
  }
};

// ============================================================
// EXPORT EXCEL PROFESIONAL
// ============================================================
export const exportToExcel = (
  project: Partial<Project>,
  items: RABItem[],
  financials: FinancialSettings,
  grade: MaterialGrade,
  options?: ExportOptions
) => {
  const summary = calculateTotalRAB(items, financials);
  const grouped = groupAndExportRAB(items);
  const wb = XLSX.utils.book_new();
  const company = options?.companyName || 'SIVILIZE HUB PRO';
  const preparedBy = options?.preparedBy || '-';
  const approvedBy = options?.approvedBy || '-';
  const projectNo = options?.projectNo || `SIV-${Date.now().toString().slice(-6)}`;
  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const data: any[][] = [
    [company], ['RENCANA ANGGARAN BIAYA (RAB)'], ['Platform Teknik Sipil Berbasis AI | sivilize-hub-pro.vercel.app'], [''],
    ['Nama Proyek', ':', project.name || '-', '', 'No. Dokumen', ':', projectNo],
    ['Lokasi', ':', getCityDisplayName(project.location || '-'), '', 'Tanggal', ':', today],
    ['Grade Material', ':', `Grade ${grade}`, '', 'Dibuat Oleh', ':', preparedBy],
    ['Status', ':', project.status || 'draft', '', 'Disetujui', ':', approvedBy],
    [''],
    ['No', 'Uraian Pekerjaan', 'Volume', 'Satuan', 'Harga Satuan', 'Jumlah (Rp)']
  ];

  let itemNo = 1;
  grouped.forEach(g => {
    data.push([g.kategori.toUpperCase(), '', '', '', '', toRp(g.subtotal)]);
    g.items.forEach(item => {
      data.push([itemNo++, item.name, Number(item.volume.toFixed(3)), item.unit, toRp(item.unitPrice), toRp(item.total)]);
    });
    data.push(['', `SUBTOTAL ${g.kategori.toUpperCase()}`, '', '', '', toRp(g.subtotal)]);
    data.push(['']);
  });

  data.push([''], ['', '', '', '', 'Subtotal Pekerjaan', toRp(summary.subtotal)]);
  data.push(['', '', '', '', `Overhead (${financials.overhead}%)`, toRp(summary.overheadAmount)]);
  data.push(['', '', '', '', `Profit (${financials.profit}%)`, toRp(summary.profitAmount)]);
  if (financials.contingency > 0) data.push(['', '', '', '', `Biaya Tak Terduga (${financials.contingency}%)`, toRp(summary.contingencyAmount)]);
  data.push(['', '', '', '', `PPN (${financials.tax}%)`, toRp(summary.taxAmount)]);
  data.push(['', '', '', '', 'GRAND TOTAL', toRp(summary.grandTotal)]);

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 5 }, { wch: 45 }, { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws, 'RAB Detail');
  XLSX.writeFile(wb, `RAB_${(project.name || 'Proyek').replace(/\s+/g, '_')}.xlsx`);
};

// ============================================================
// EXPORT KURVA S PDF
// ============================================================
export const exportKurvaSPDF = (
  project: Partial<Project>,
  chartData: KurvaSChartPoint[],
  options?: ExportOptions
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 14;
  const pageW = 210;
  
  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text((options?.companyName || 'SIVILIZE HUB PRO').toUpperCase(), margin, 20);
  doc.setFontSize(11); doc.setTextColor(255, 122, 0);
  doc.text('KURVA S — PROGRESS PROYEK', margin, 26);
  
  const tableData = chartData.map(p => [p.label, `${p.rencana.toFixed(1)}%`, p.realisasi !== null ? `${p.realisasi.toFixed(1)}%` : '-']);
  autoTable(doc, {
    startY: 35,
    head: [['Periode', 'Rencana (%)', 'Realisasi (%)']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [255, 122, 0] }
  });
  
  doc.save(`KurvaS_${(project.name || 'Proyek').replace(/\s+/g, '_')}.pdf`);
};

// ============================================================
// EXPORT LABOR - FIXED VERSION
// ============================================================
export interface WorkerSummary {
  name: string;
  role: string;
  totalDays: number;
  totalAmount: number;
  weeksWorked: number;
}

export function aggregateLaborByWorker(payments: LaborPayment[]): WorkerSummary[] {
  const workerMap = new Map<string, WorkerSummary>();
  for (const payment of payments) {
    for (const worker of payment.workers) {
      const key = `${worker.name}__${worker.role}`;
      const existing = workerMap.get(key);
      if (existing) {
        existing.totalDays += worker.days;
        existing.totalAmount += worker.total;
        existing.weeksWorked += 1;
      } else {
        workerMap.set(key, {
          name: worker.name,
          role: worker.role,
          totalDays: worker.days,
          totalAmount: worker.total,
          weeksWorked: 1,
        });
      }
    }
  }
  return Array.from(workerMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
}

export const exportLaborToPDF = (payments: LaborPayment[], options: { projectName: string; companyName?: string }) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 14;
  
  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text((options.companyName || 'SIVILIZE HUB PRO').toUpperCase(), margin, 20);
  doc.setFontSize(11); doc.setTextColor(255, 122, 0);
  doc.text('DAFTAR UPAH TENAGA KERJA', margin, 26);
  doc.setFontSize(8); doc.setTextColor(100, 100, 100);
  doc.text(`Proyek: ${options.projectName}`, margin, 32);

  let y = 40;
  payments.forEach(p => {
    if (y > 250) { doc.addPage(); y = 20; }
    const tableData = p.workers.map(w => [w.name, w.role, w.days, toRp(w.dailyWage), toRp(w.total)]);
    tableData.push(['', 'TOTAL MINGGU INI', '', '', toRp(p.totalAmount)]);
    autoTable(doc, {
      startY: y,
      head: [['Nama', 'Jabatan', 'Hari', 'Upah/Hari', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [52, 73, 94] }
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  });

  doc.save(`Upah_${options.projectName.replace(/\s+/g, '_')}.pdf`);
};

export const exportLaborToExcel = (payments: LaborPayment[], options: { projectName: string; companyName?: string }) => {
  const wb = XLSX.utils.book_new();
  const data: any[][] = [['DAFTAR UPAH TENAGA KERJA'], [`Proyek: ${options.projectName}`], ['']];
  data.push(['Minggu', 'Nama', 'Jabatan', 'Hari Kerja', 'Upah/Hari', 'Total']);

  payments.forEach(p => {
    const week = `${new Date(p.weekStart).toLocaleDateString()} - ${new Date(p.weekEnd).toLocaleDateString()}`;
    p.workers.forEach(w => data.push([week, w.name, w.role, w.days, toRp(w.dailyWage), toRp(w.total)]));
    data.push(['', '', '', '', 'SUBTOTAL', toRp(p.totalAmount)], ['']);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Upah Tenaga Kerja');
  XLSX.writeFile(wb, `Upah_${options.projectName.replace(/\s+/g, '_')}.xlsx`);
};
