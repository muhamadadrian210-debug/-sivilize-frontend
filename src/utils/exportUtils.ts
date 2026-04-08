import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { type RABItem, type FinancialSettings, type Project } from '../store/useStore';
import { formatCurrency, calculateTotalRAB, getGroupedRABItems } from './calculations';
import { getCityDisplayName, type MaterialGrade } from '../data/prices';

/**
 * Group RAB items by category for professional display
 */
const groupAndExportRAB = (items: RABItem[]) => {
  const grouped = getGroupedRABItems(items);
  return grouped.filter(g => g.items.length > 0);
};

export const exportToPDF = (project: Partial<Project>, items: RABItem[], financials: FinancialSettings, grade: MaterialGrade) => {
  type JsPDFWithAutoTable = jsPDF & {
    autoTable: (options: unknown) => void;
    lastAutoTable?: { finalY: number };
  };

  const doc = new jsPDF() as unknown as JsPDFWithAutoTable;
  const summary = calculateTotalRAB(items, financials);
  const grouped = groupAndExportRAB(items);

  // Header
  doc.setFontSize(22);
  doc.setTextColor(255, 122, 0); // Primary color
  doc.text('SIVILIZE HUB PRO', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Laporan Rencana Anggaran Biaya (RAB) Profesional', 105, 28, { align: 'center' });

  // Project Info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Proyek: ${project.name}`, 14, 45);
  doc.text(`Lokasi: ${getCityDisplayName(project.location || '-')}`, 14, 52);
  doc.text(`Tgl Laporan: ${new Date().toLocaleDateString('id-ID')}`, 14, 59);
  doc.text(`Grade Material: ${grade}`, 14, 66);

  // Build grouped table data
  let startY = 76;
  grouped.forEach((group) => {
    // Category title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(52, 73, 94);
    doc.text(group.kategori, 14, startY);
    startY += 8;

    // Items in this category
    const tableData = group.items.map((item: RABItem) => [
      item.id,
      item.name,
      item.volume.toFixed(2),
      item.unit,
      formatCurrency(item.unitPrice),
      formatCurrency(item.total)
    ]);

    // Add subtotal row
    tableData.push(['', `SUBTOTAL ${group.kategori.toUpperCase()}`, '', '', '', formatCurrency(group.subtotal)]);

    doc.autoTable({
      startY: startY,
      head: [['No', 'Pekerjaan', 'Vol', 'Sat', 'Harga Satuan', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [255, 122, 0] },
      footStyles: { fontStyle: 'bold' }
    });

    startY = (doc.lastAutoTable?.finalY ?? startY) + 10;
  });

  // Summary
  const finalY = startY + 5;
  doc.setFontSize(10);
  doc.text('Subtotal Pekerjaan:', 140, finalY);
  doc.text(formatCurrency(summary.subtotal), 170, finalY);
  
  doc.text('Overhead & Profit:', 140, finalY + 7);
  doc.text(formatCurrency(summary.overheadAmount + summary.profitAmount), 170, finalY + 7);
  
  doc.text(`PPN (${financials.tax}%):`, 140, finalY + 14);
  doc.text(formatCurrency(summary.taxAmount), 170, finalY + 14);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('GRAND TOTAL:', 140, finalY + 25);
  doc.text(formatCurrency(summary.grandTotal), 170, finalY + 25);

  doc.save(`RAB_${project.name?.replace(/\s+/g, '_')}.pdf`);
};

/**
 * Export to Excel with professional grouped RAB structure
 */
export const exportToExcel = (project: Partial<Project>, items: RABItem[], financials: FinancialSettings, grade: MaterialGrade) => {
  const summary = calculateTotalRAB(items, financials);
  const grouped = groupAndExportRAB(items);

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Main RAB sheet with grouping
  const rabData: (string | number | undefined)[][] = [];

  // Add title and project info
  rabData.push(['RENCANA ANGGARAN BIAYA (RAB)']);
  rabData.push([]);
  rabData.push(['Nama Kegiatan:', project.name]);
  rabData.push(['Lokasi:', getCityDisplayName(project.location || '-')]);
  rabData.push(['Tanggal:', new Date().toLocaleDateString('id-ID')]);
  rabData.push(['Grade Material:', grade]);
  rabData.push([]);
  rabData.push(['No', 'Uraian Pekerjaan', 'Volume', 'Satuan', 'Harga Satuan', 'Total']);

  let itemNo = 1;

  grouped.forEach((group) => {
    rabData.push([group.kategori]);
    
    group.items.forEach((item: RABItem) => {
      rabData.push([
        itemNo++,
        item.name,
        item.volume.toFixed(3),
        item.unit,
        item.unitPrice,
        item.total
      ]);
    });

    rabData.push([`SUBTOTAL ${group.kategori}`, '', '', '', '', group.subtotal]);
    rabData.push([]);
  });

  // Add financial summary
  rabData.push([]);
  rabData.push(['RINGKASAN KEUANGAN']);
  rabData.push(['Subtotal Pekerjaan', '', '', '', '', summary.subtotal]);
  rabData.push([`Overhead & Profit`, '', '', '', '', summary.overheadAmount + summary.profitAmount]);
  rabData.push([`PPN (${financials.tax}%)`, '', '', '', '', summary.taxAmount]);
  rabData.push(['TOTAL KESELURUHAN', '', '', '', '', summary.grandTotal]);

  const wsRAB = XLSX.utils.aoa_to_sheet(rabData);
  XLSX.utils.book_append_sheet(wb, wsRAB, 'RAB Profesional');

  // Summary sheet
  const summaryData = [
    ['RINGKASAN BIAYA PROYEK'],
    ['Nama Proyek', project.name],
    ['Lokasi', getCityDisplayName(project.location || '-')],
    ['Grade Material', grade],
    ['Tanggal', new Date().toLocaleDateString('id-ID')],
    [],
    ['Subtotal', summary.subtotal],
    ['Overhead & Profit', summary.overheadAmount + summary.profitAmount],
    ['PPN', summary.taxAmount],
    ['Grand Total', summary.grandTotal]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  XLSX.writeFile(wb, `RAB_${project.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
