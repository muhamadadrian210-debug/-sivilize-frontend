import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';
import { type RABItem, type FinancialSettings, type Project, type LaborPayment } from '../store/useStore';
import { calculateTotalRAB, getGroupedRABItems } from './calculations';
import { calculateProjectTKDN } from './tkdnUtils';
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
    let y = 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    safeText('PEMERINTAH REPUBLIK INDONESIA', pageW / 2, y, { align: 'center' });
    y += 6;
    safeText('KEMENTERIAN PEKERJAAN UMUM DAN PERUMAHAN RAKYAT', pageW / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    safeText('DIREKTORAT JENDERAL BINA KONSTRUKSI', pageW / 2, y, { align: 'center' });
    y += 4;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 2;
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    safeText('RENCANA ANGGARAN BIAYA (RAB)', pageW / 2, y, { align: 'center' });
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const leftColX = margin;
    const rightColX = pageW / 2 + 10;
    
    safeText(`Nama Proyek    : ${project.name || '-'}`, leftColX, y);
    safeText(`No. Dokumen    : ${projectNo}`, rightColX, y);
    y += 5;
    safeText(`Lokasi              : ${getCityDisplayName(project.location || '-')}`, leftColX, y);
    safeText(`Tanggal Cetak   : ${new Date().toLocaleDateString('id-ID')}`, rightColX, y);
    y += 5;
    safeText(`Pelaksana        : ${company}`, leftColX, y);
    safeText(`Tahun Anggaran : 2026`, rightColX, y);
    y += 10;

    // TABEL RAB
    let itemNo = 1;
    grouped.forEach((group) => {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, contentW, 7, 'F');
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
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
      y = ((doc as any).lastAutoTable?.finalY || y) + 4;
    });

    // TKDN & SUMMARY
    const tkdn = calculateProjectTKDN(items);
    if (y > 220) { doc.addPage(); y = 20; }
    y += 4;
    
    doc.setDrawColor(200, 200, 200); doc.rect(margin, y, 70, 25, 'S');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(30, 30, 30);
    safeText('TINGKAT KOMPONEN DALAM NEGERI', margin + 3, y + 5);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
    safeText(`Total Nilai Lokal: ${toRp(tkdn.totalDomesticValue)}`, margin + 3, y + 12);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 150, 0); doc.setFontSize(10);
    safeText(`Estimasi TKDN: ${tkdn.overallTKDN.toFixed(1)}%`, margin + 3, y + 20);

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
    doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.8);
    doc.line(summaryX, y, pageW - margin, y); y += 2;
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
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

    const pageCount = (doc as any).internal.getNumberOfPages();
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
// EXPORT EXCEL PROFESIONAL (STANDAR PU B2G)
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
  const wb = utils.book_new();
  const company = options?.companyName || 'SIVILIZE HUB PRO';
  const approvedBy = options?.approvedBy || '-';
  const projectNo = options?.projectNo || `SIV-${Date.now().toString().slice(-6)}`;
  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const kopSurat = [
    ['PEMERINTAH REPUBLIK INDONESIA'],
    ['KEMENTERIAN PEKERJAAN UMUM DAN PERUMAHAN RAKYAT (PUPR)'],
    ['DIREKTORAT JENDERAL BINA KONSTRUKSI'],
    ['===================================================================================================='],
    ['KONSULTAN / KONTRAKTOR PELAKSANA : ' + company.toUpperCase()],
    ['===================================================================================================='],
    ['']
  ];

  // SHEET 1: REKAPITULASI
  const rekapData: any[][] = [
    ...kopSurat,
    ['REKAPITULASI RENCANA ANGGARAN BIAYA (RAB)'], ['Format Standar Dinas Pekerjaan Umum (PU)'], [''],
    ['Nama Proyek', ':', project.name || '-', '', 'No. Dokumen', ':', projectNo],
    ['Lokasi', ':', getCityDisplayName(project.location || '-'), '', 'Tanggal', ':', today],
    ['Status', ':', project.status || 'draft', '', 'Disetujui', ':', approvedBy],
    [''],
    ['No', 'Uraian Pekerjaan', 'Jumlah Harga (Rp)']
  ];

  grouped.forEach((g, idx) => {
    rekapData.push([idx + 1, g.kategori.toUpperCase(), g.subtotal]);
  });
  
  rekapData.push(['']);
  rekapData.push(['', 'A. JUMLAH HARGA PEKERJAAN (SUBTOTAL)', summary.subtotal]);
  rekapData.push(['', `B. OVERHEAD (${financials.overhead}%)`, summary.overheadAmount]);
  rekapData.push(['', `C. PROFIT (${financials.profit}%)`, summary.profitAmount]);
  if (financials.contingency > 0) rekapData.push(['', `D. BIAYA TAK TERDUGA (${financials.contingency}%)`, summary.contingencyAmount]);
  rekapData.push(['', `E. PPN (${financials.tax}%)`, summary.taxAmount]);
  rekapData.push(['', 'F. TOTAL HARGA (A+B+C+D+E)', summary.grandTotal]);
  rekapData.push(['', 'DIBULATKAN', Math.floor(summary.grandTotal / 1000) * 1000]);

  const wsRekap = utils.aoa_to_sheet(rekapData);
  wsRekap['!cols'] = [{ wch: 5 }, { wch: 45 }, { wch: 20 }];
  utils.book_append_sheet(wb, wsRekap, '1. Rekapitulasi');

  // SHEET 2: DAFTAR KUANTITAS DAN HARGA (BoQ)
  const boqData: any[][] = [
    ...kopSurat,
    ['DAFTAR KUANTITAS DAN HARGA'], [''],
    ['No', 'Uraian Pekerjaan', 'Satuan', 'Volume', 'Harga Satuan (Rp)', 'Jumlah Harga (Rp)']
  ];

  let itemNo = 1;
  grouped.forEach(g => {
    boqData.push([g.kategori.toUpperCase(), '', '', '', '', g.subtotal]);
    g.items.forEach(item => {
      boqData.push([itemNo++, item.name, item.unit, Number(item.volume.toFixed(3)), item.unitPrice, item.total]);
    });
    boqData.push(['']);
  });

  const wsBoQ = utils.aoa_to_sheet(boqData);
  wsBoQ['!cols'] = [{ wch: 5 }, { wch: 45 }, { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 20 }];
  utils.book_append_sheet(wb, wsBoQ, '2. Daftar Kuantitas');

  // SHEET 3: ANALISA HARGA SATUAN (Detail AHSP)
  // Simplified detail representation to avoid massive code logic here
  // Real PU AHS requires deep fetching of ahsp templates, for now we list the prices per item
  const ahspData: any[][] = [
    ...kopSurat,
    ['ANALISA HARGA SATUAN PEKERJAAN (AHSP)'], ['Referensi: Permen PUPR'], [''],
    ['No', 'Item Pekerjaan / Komponen', 'Satuan', 'Koefisien', 'Harga Satuan (Rp)', 'Jumlah Harga (Rp)']
  ];
  itemNo = 1;
  grouped.forEach(g => {
    g.items.forEach(item => {
      ahspData.push([itemNo++, `Analisa: ${item.name}`, '1.00', item.unit, item.unitPrice, item.unitPrice]);
      ahspData.push(['', 'Catatan: Rincian komponen material, upah, & alat tersedia di database Sivilize Hub', '', '', '', '']);
      ahspData.push(['']);
    });
  });

  const wsAhsp = utils.aoa_to_sheet(ahspData);
  wsAhsp['!cols'] = [{ wch: 5 }, { wch: 55 }, { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 20 }];
  utils.book_append_sheet(wb, wsAhsp, '3. AHSP');

  writeFile(wb, `RAB_PU_${(project.name || 'Proyek').replace(/\s+/g, '_')}.xlsx`);
};

export const exportBoQBlank = (
  project: Partial<Project>,
  items: RABItem[],
  options?: ExportOptions
) => {
  const grouped = groupAndExportRAB(items);
  const wb = utils.book_new();
  const company = options?.companyName || 'SIVILIZE HUB PRO';
  const projectNo = options?.projectNo || `SIV-${Date.now().toString().slice(-6)}`;
  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const kopSurat = [
    [company.toUpperCase()],
    ['Alamat: Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan'],
    ['Telp: (021) 1234567 | Email: info@' + company.toLowerCase().replace(/\s+/g, '') + '.com'],
    ['===================================================================================================='],
    ['']
  ];

  const data: any[][] = [
    ...kopSurat,
    ['BILL OF QUANTITIES (BoQ) - BLANK FORM'], ['Dokumen Penawaran Subkon / Vendor'], [''],
    ['Nama Proyek', ':', project.name || '-', '', 'No. Dokumen', ':', projectNo],
    ['Lokasi', ':', getCityDisplayName(project.location || '-'), '', 'Tanggal', ':', today],
    [''],
    ['No', 'Uraian Pekerjaan', 'Satuan', 'Volume', 'Harga Satuan (Rp)', 'Jumlah Harga (Rp)']
  ];

  let itemNo = 1;
  grouped.forEach(g => {
    data.push([g.kategori.toUpperCase(), '', '', '', '', '']);
    g.items.forEach(item => {
      data.push([itemNo++, item.name, item.unit, Number(item.volume.toFixed(3)), '', '']);
    });
    data.push(['', `SUBTOTAL ${g.kategori.toUpperCase()}`, '', '', '', '']);
    data.push(['']);
  });

  const ws = utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 5 }, { wch: 45 }, { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 20 }];
  utils.book_append_sheet(wb, ws, 'BoQ Kosong');
  writeFile(wb, `BoQ_Kosong_${(project.name || 'Proyek').replace(/\s+/g, '_')}.xlsx`);
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
    y = ((doc as any).lastAutoTable?.finalY || y) + 10;
  });

  doc.save(`Upah_${options.projectName.replace(/\s+/g, '_')}.pdf`);
};

export const exportLaborToExcel = (payments: LaborPayment[], options: { projectName: string; companyName?: string }) => {
  const wb = utils.book_new();
  const data: any[][] = [['DAFTAR UPAH TENAGA KERJA'], [`Proyek: ${options.projectName}`], ['']];
  data.push(['Minggu', 'Nama', 'Jabatan', 'Hari Kerja', 'Upah/Hari', 'Total']);

  payments.forEach(p => {
    const week = `${new Date(p.weekStart).toLocaleDateString()} - ${new Date(p.weekEnd).toLocaleDateString()}`;
    p.workers.forEach(w => data.push([week, w.name, w.role, w.days, toRp(w.dailyWage), toRp(w.total)]));
    data.push(['', '', '', '', 'SUBTOTAL', toRp(p.totalAmount)], ['']);
  });

  const ws = utils.aoa_to_sheet(data);
  utils.book_append_sheet(wb, ws, 'Upah Tenaga Kerja');
  writeFile(wb, `Upah_${options.projectName.replace(/\s+/g, '_')}.xlsx`);
};

// Build trigger: 2026-05-14T22:40:22.689Z
