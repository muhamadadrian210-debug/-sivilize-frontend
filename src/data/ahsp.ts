export interface AHSPTemplate {
  id: string;
  category: 'Persiapan' | 'Tanah & Pondasi' | 'Struktur' | 'Dinding & Plesteran' | 'Kusen, Pintu & Jendela' | 'Atap & Plafon' | 'Lantai & Keramik' | 'Instalasi Listrik' | 'Instalasi Air & Sanitasi' | 'Finishing & Pengecatan' | 'Lain-lain';
  name: string;
  unit: string;
  desc?: string; // Penjelasan bahasa SD kelas 1 untuk orang awam
  materials: { name: string; coeff: number; unit: string }[];
  laborCoefficients: { name: string; coeff: number; unit: string }[];
  productivity?: number;
}

export const AHSP_TEMPLATES: AHSPTemplate[] = [
  // ══════════════════════════════════════════════════════════
  // PEKERJAAN PERSIAPAN — wajib ada di setiap RAB kontraktor
  // ══════════════════════════════════════════════════════════
  {
    id: 'per-001',
    category: 'Persiapan',
    name: 'Pembersihan Lokasi & Perataan Tanah',
    unit: 'm2',
    materials: [],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.1, unit: 'OH' },
      { name: 'Mandor', coeff: 0.005, unit: 'OH' },
    ],
    productivity: 50,
  },
  {
    id: 'per-002',
    category: 'Persiapan',
    name: 'Pemasangan Bouwplank (Bowplank)',
    unit: 'm1',
    materials: [
      { name: 'Kayu Kaso 5/7', coeff: 0.012, unit: 'm3' },
      { name: 'Papan Kayu 2/20', coeff: 0.007, unit: 'm3' },
      { name: 'Paku', coeff: 0.1, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.1, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.1, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.01, unit: 'OH' },
      { name: 'Mandor', coeff: 0.005, unit: 'OH' },
    ],
    productivity: 20,
  },
  {
    id: 'per-003',
    category: 'Persiapan',
    name: 'Pembuatan Gudang Bahan & Alat',
    unit: 'm2',
    materials: [
      { name: 'Kayu Kaso 5/7', coeff: 0.02, unit: 'm3' },
      { name: 'Papan Kayu 2/20', coeff: 0.015, unit: 'm3' },
      { name: 'Seng Gelombang', coeff: 1.1, unit: 'm2' },
      { name: 'Paku', coeff: 0.3, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.5, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.5, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.05, unit: 'OH' },
      { name: 'Mandor', coeff: 0.025, unit: 'OH' },
    ],
    productivity: 4,
  },
  {
    id: 'per-004',
    category: 'Persiapan',
    name: 'Pembuatan Direksi Keet (Kantor Lapangan)',
    unit: 'm2',
    materials: [
      { name: 'Kayu Kaso 5/7', coeff: 0.025, unit: 'm3' },
      { name: 'Papan Kayu 2/20', coeff: 0.02, unit: 'm3' },
      { name: 'Seng Gelombang', coeff: 1.1, unit: 'm2' },
      { name: 'Paku', coeff: 0.4, unit: 'kg' },
      { name: 'Kaca Polos 5mm', coeff: 0.1, unit: 'm2' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.6, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.6, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.06, unit: 'OH' },
      { name: 'Mandor', coeff: 0.03, unit: 'OH' },
    ],
    productivity: 3,
  },
  {
    id: 'per-005',
    category: 'Persiapan',
    name: 'Pengukuran & Pemasangan Patok',
    unit: 'ls',
    materials: [
      { name: 'Kayu Kaso 5/7', coeff: 0.005, unit: 'm3' },
      { name: 'Paku', coeff: 0.05, unit: 'kg' },
      { name: 'Cat Kayu', coeff: 0.1, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 2.0, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 1.0, unit: 'OH' },
      { name: 'Mandor', coeff: 0.2, unit: 'OH' },
    ],
    productivity: 1,
  },
  {
    id: 'per-006',
    category: 'Persiapan',
    name: 'Mobilisasi & Demobilisasi Alat',
    unit: 'ls',
    materials: [],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 4.0, unit: 'OH' },
      { name: 'Mandor', coeff: 0.5, unit: 'OH' },
    ],
    productivity: 1,
  },
  {
    id: 'per-007',
    category: 'Persiapan',
    name: 'Pemasangan Papan Nama Proyek',
    unit: 'bh',
    materials: [
      { name: 'Papan Kayu 2/20', coeff: 0.01, unit: 'm3' },
      { name: 'Kayu Kaso 5/7', coeff: 0.008, unit: 'm3' },
      { name: 'Cat Kayu', coeff: 0.5, unit: 'kg' },
      { name: 'Paku', coeff: 0.1, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.5, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.5, unit: 'OH' },
      { name: 'Mandor', coeff: 0.05, unit: 'OH' },
    ],
    productivity: 1,
  },
  {
    id: 'per-008',
    category: 'Persiapan',
    name: 'Penyediaan Air Kerja (Selama Pelaksanaan)',
    unit: 'ls',
    materials: [
      { name: 'Pipa PVC 1/2"', coeff: 10, unit: 'm' },
      { name: 'Fitting PVC', coeff: 5, unit: 'buah' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 1.0, unit: 'OH' },
      { name: 'Tukang Pipa', coeff: 1.0, unit: 'OH' },
      { name: 'Mandor', coeff: 0.1, unit: 'OH' },
    ],
    productivity: 1,
  },
  {
    id: 'per-009',
    category: 'Persiapan',
    name: 'Penyediaan Listrik Kerja (Selama Pelaksanaan)',
    unit: 'ls',
    materials: [
      { name: 'Kabel NYM 2x1.5mm', coeff: 20, unit: 'm' },
      { name: 'Stop Kontak', coeff: 3, unit: 'buah' },
      { name: 'MCB 1 Phase', coeff: 1, unit: 'buah' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 1.0, unit: 'OH' },
      { name: 'Tukang Listrik', coeff: 1.0, unit: 'OH' },
      { name: 'Mandor', coeff: 0.1, unit: 'OH' },
    ],
    productivity: 1,
  },
  // ══════════════════════════════════════════════════════════
  // SMKK — Sistem Manajemen Keselamatan Konstruksi
  // Wajib sesuai SE 47/SE/Dk/2026 (menggantikan SE 182/2025 & Permen 8/2023)
  // SMKK harus terintegrasi dalam perhitungan biaya RAB
  // ══════════════════════════════════════════════════════════
  {
    id: 'k3-001',
    category: 'Persiapan',
    name: 'APD Pekerja - SMKK (Helm, Rompi, Sepatu Safety)',
    unit: 'set',
    materials: [
      { name: 'Helm Proyek', coeff: 1, unit: 'buah' },
      { name: 'Rompi Safety', coeff: 1, unit: 'buah' },
      { name: 'Sepatu Safety', coeff: 1, unit: 'pasang' },
      { name: 'Sarung Tangan', coeff: 1, unit: 'pasang' },
      { name: 'Kacamata Safety', coeff: 1, unit: 'buah' },
    ],
    laborCoefficients: [],
    productivity: 1,
  },
  {
    id: 'k3-002',
    category: 'Persiapan',
    name: 'Pagar Pengaman Proyek - SMKK',
    unit: 'm1',
    materials: [
      { name: 'Seng Gelombang', coeff: 0.9, unit: 'm2' },
      { name: 'Kayu Kaso 5/7', coeff: 0.005, unit: 'm3' },
      { name: 'Paku', coeff: 0.1, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.15, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.1, unit: 'OH' },
      { name: 'Mandor', coeff: 0.01, unit: 'OH' },
    ],
    productivity: 15,
  },
  {
    id: 'k3-003',
    category: 'Persiapan',
    name: 'P3K, APAR & Rambu K3 - SMKK',
    unit: 'ls',
    materials: [
      { name: 'Kotak P3K', coeff: 1, unit: 'set' },
      { name: 'APAR (Alat Pemadam)', coeff: 1, unit: 'buah' },
    ],
    laborCoefficients: [],
    productivity: 1,
  },
  {
    id: 'k3-004',
    category: 'Persiapan',
    name: 'Rencana Keselamatan Konstruksi (RKK) - SMKK',
    unit: 'ls',
    materials: [],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 1.0, unit: 'OH' },
      { name: 'Mandor', coeff: 0.5, unit: 'OH' },
    ],
    productivity: 1,
  },
  {
    id: 'k3-005',
    category: 'Persiapan',
    name: 'Petugas K3 / Safety Officer - SMKK',
    unit: 'bulan',
    materials: [],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 26, unit: 'OH' }, // 26 hari kerja/bulan
    ],
    productivity: 1,
  },
  // STRUKTUR
  {
    id: 'str-001',
    category: 'Tanah & Pondasi',
    name: 'Galian Tanah Pondasi',
    unit: 'm3',
    materials: [],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.75, unit: 'OH' },
      { name: 'Mandor', coeff: 0.025, unit: 'OH' },
    ],
    productivity: 1.5,
  },
  {
    id: 'str-000',
    category: 'Tanah & Pondasi',
    name: 'Pondasi Batu Kali 1:4',
    unit: 'm3',
    materials: [
      { name: 'Batu Kali', coeff: 1.2, unit: 'm3' },
      { name: 'Semen PC', coeff: 136, unit: 'kg' },
      { name: 'Pasir Pasang', coeff: 0.544, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 1.5, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.6, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.06, unit: 'OH' },
      { name: 'Mandor', coeff: 0.075, unit: 'OH' },
    ],
    productivity: 0.8,
  },
  {
    id: 'str-004',
    category: 'Struktur',
    name: 'Bekisting Kolom/Balok/Plat',
    unit: 'm2',
    materials: [
      { name: 'Kayu Bekisting', coeff: 0.04, unit: 'm3' },
      { name: 'Paku', coeff: 0.4, unit: 'kg' },
      { name: 'Minyak Bekisting', coeff: 0.2, unit: 'liter' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.33, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.33, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.033, unit: 'OH' },
      { name: 'Mandor', coeff: 0.017, unit: 'OH' },
    ],
    productivity: 6,
  },
  {
    id: 'str-005',
    category: 'Tanah & Pondasi',
    name: 'Urugan Pasir Bawah Pondasi (t=10cm)',
    unit: 'm2',
    materials: [
      { name: 'Pasir Urug', coeff: 0.12, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.1, unit: 'OH' },
      { name: 'Mandor', coeff: 0.005, unit: 'OH' },
    ],
    productivity: 20,
  },
  {
    id: 'str-002',
    category: 'Struktur',
    name: 'Beton K-225 (Site Mix)',
    unit: 'm3',
    materials: [
      { name: 'Semen PC', coeff: 371, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.498, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.776, unit: 'm3' },
      { name: 'Air', coeff: 215, unit: 'liter' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 1.65, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.275, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.028, unit: 'OH' },
      { name: 'Mandor', coeff: 0.083, unit: 'OH' },
    ],
    productivity: 0.6,
  },
  {
    id: 'str-003',
    category: 'Struktur',
    name: 'Pembesian dengan Besi Polos/Ulir',
    unit: 'kg',
    materials: [
      { name: 'Besi Beton', coeff: 1.05, unit: 'kg' },
      { name: 'Kawat Beton', coeff: 0.015, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.007, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.007, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.0007, unit: 'OH' },
      { name: 'Mandor', coeff: 0.0004, unit: 'OH' },
    ],
    productivity: 150,
  },
  // ARSITEKTUR
  {
    id: 'ars-001',
    category: 'Dinding & Plesteran',
    name: 'Pasangan Bata Merah 1:4',
    unit: 'm2',
    materials: [
      { name: 'Bata Merah', coeff: 70, unit: 'bh' },
      { name: 'Semen PC', coeff: 11.5, unit: 'kg' },
      { name: 'Pasir Pasang', coeff: 0.043, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.3, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.1, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.01, unit: 'OH' },
      { name: 'Mandor', coeff: 0.015, unit: 'OH' },
    ],
    productivity: 10,
  },
  {
    id: 'ars-002',
    category: 'Dinding & Plesteran',
    name: 'Plesteran 1:4 Tebal 15mm',
    unit: 'm2',
    materials: [
      { name: 'Semen PC', coeff: 6.24, unit: 'kg' },
      { name: 'Pasir Pasang', coeff: 0.024, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.2, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.15, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.015, unit: 'OH' },
      { name: 'Mandor', coeff: 0.01, unit: 'OH' },
    ],
    productivity: 8,
  },
  {
    id: 'ars-003',
    category: 'Atap & Plafon',
    name: 'Pemasangan Rangka Atap Baja Ringan',
    unit: 'm2',
    materials: [
      { name: 'Baja Ringan C75', coeff: 5.2, unit: 'kg' },
      { name: 'Sekrup Roofing', coeff: 12, unit: 'buah' },
      { name: 'Reng Baja Ringan', coeff: 3.5, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.12, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.08, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.008, unit: 'OH' },
      { name: 'Mandor', coeff: 0.006, unit: 'OH' },
    ],
    productivity: 12,
  },
  {
    id: 'ars-004',
    category: 'Atap & Plafon',
    name: 'Penutup Atap Genteng Beton',
    unit: 'm2',
    materials: [
      { name: 'Genteng Beton', coeff: 14, unit: 'bh' },
      { name: 'Semen PC', coeff: 1.5, unit: 'kg' },
      { name: 'Pasir Pasang', coeff: 0.006, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.08, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.06, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.006, unit: 'OH' },
      { name: 'Mandor', coeff: 0.004, unit: 'OH' },
    ],
    productivity: 18,
  },
  {
    id: 'ars-005',
    category: 'Atap & Plafon',
    name: 'Penutup Atap Spandek/Galvalum',
    unit: 'm2',
    materials: [
      { name: 'Spandek/Galvalum', coeff: 1.05, unit: 'm2' },
      { name: 'Sekrup Roofing', coeff: 8, unit: 'buah' },
      { name: 'Sealant', coeff: 0.05, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.06, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.05, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.004, unit: 'OH' },
      { name: 'Mandor', coeff: 0.003, unit: 'OH' },
    ],
    productivity: 24,
  },
  // FINISHING
  {
    id: 'fin-001',
    category: 'Finishing & Pengecatan',
    name: 'Pengecatan Tembok Baru (1 Lapis Plamir, 1 Lapis Dasar, 2 Lapis Penutup)',
    unit: 'm2',
    materials: [
      { name: 'Plamir', coeff: 0.1, unit: 'kg' },
      { name: 'Cat Dasar', coeff: 0.1, unit: 'kg' },
      { name: 'Cat Penutup', coeff: 0.26, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.02, unit: 'OH' },
      { name: 'Tukang Cat', coeff: 0.063, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.006, unit: 'OH' },
      { name: 'Mandor', coeff: 0.003, unit: 'OH' },
    ],
    productivity: 25,
  },
  // BUKAAN
  {
    id: 'buk-001',
    category: 'Kusen, Pintu & Jendela',
    name: 'Kusen + Daun Pintu Kayu (Per Unit)',
    unit: 'unit',
    materials: [
      { name: 'Kayu Kusen', coeff: 0.12, unit: 'm3' },
      { name: 'Daun Pintu Panel', coeff: 1, unit: 'unit' },
      { name: 'Engsel Pintu', coeff: 3, unit: 'buah' },
      { name: 'Kunci Tanam', coeff: 1, unit: 'buah' },
      { name: 'Cat Kayu', coeff: 0.5, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.6, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 1.2, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.12, unit: 'OH' },
      { name: 'Mandor', coeff: 0.06, unit: 'OH' },
    ],
    productivity: 1,
  },
  {
    id: 'buk-002',
    category: 'Kusen, Pintu & Jendela',
    name: 'Kusen + Daun Jendela Kayu (Per Unit)',
    unit: 'unit',
    materials: [
      { name: 'Kayu Kusen', coeff: 0.07, unit: 'm3' },
      { name: 'Daun Jendela', coeff: 1, unit: 'unit' },
      { name: 'Engsel Jendela', coeff: 2, unit: 'buah' },
      { name: 'Grendel', coeff: 1, unit: 'buah' },
      { name: 'Kaca Polos 5mm', coeff: 0.6, unit: 'm2' },
      { name: 'Cat Kayu', coeff: 0.3, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.4, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.8, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.08, unit: 'OH' },
      { name: 'Mandor', coeff: 0.04, unit: 'OH' },
    ],
    productivity: 1,
  },
  {
    id: 'buk-003',
    category: 'Kusen, Pintu & Jendela',
    name: 'Pintu Kamar Mandi (PVC/Aluminium)',
    unit: 'unit',
    materials: [
      { name: 'Kusen Aluminium', coeff: 1, unit: 'set' },
      { name: 'Daun Pintu PVC', coeff: 1, unit: 'unit' },
      { name: 'Engsel', coeff: 2, unit: 'buah' },
      { name: 'Kunci Kamar Mandi', coeff: 1, unit: 'buah' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.4, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.8, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.08, unit: 'OH' },
      { name: 'Mandor', coeff: 0.04, unit: 'OH' },
    ],
    productivity: 1,
  },
  // MEKANIKAL - PLUMBING
  {
    id: 'mek-001',
    category: 'Instalasi Air & Sanitasi',
    name: 'Instalasi Pipa Air Bersih PVC (Per Titik)',
    unit: 'titik',
    materials: [
      { name: 'Pipa PVC 1/2"', coeff: 6, unit: 'm' },
      { name: 'Fitting PVC', coeff: 4, unit: 'buah' },
      { name: 'Lem PVC', coeff: 0.1, unit: 'kaleng' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.5, unit: 'OH' },
      { name: 'Tukang Pipa', coeff: 1.0, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.1, unit: 'OH' },
      { name: 'Mandor', coeff: 0.05, unit: 'OH' },
    ],
    productivity: 3,
  },
  {
    id: 'mek-002',
    category: 'Instalasi Air & Sanitasi',
    name: 'Instalasi Pipa Air Kotor PVC (Per Titik)',
    unit: 'titik',
    materials: [
      { name: 'Pipa PVC 3"', coeff: 4, unit: 'm' },
      { name: 'Pipa PVC 4"', coeff: 2, unit: 'm' },
      { name: 'Fitting PVC', coeff: 5, unit: 'buah' },
      { name: 'Lem PVC', coeff: 0.15, unit: 'kaleng' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.6, unit: 'OH' },
      { name: 'Tukang Pipa', coeff: 1.2, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.12, unit: 'OH' },
      { name: 'Mandor', coeff: 0.06, unit: 'OH' },
    ],
    productivity: 2,
  },
  {
    id: 'mek-003',
    category: 'Instalasi Air & Sanitasi',
    name: 'Instalasi Pipa Air Konsumsi/Minum (Per Titik)',
    unit: 'titik',
    materials: [
      { name: 'Pipa PPR 1/2"', coeff: 5, unit: 'm' },
      { name: 'Fitting PPR', coeff: 4, unit: 'buah' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.4, unit: 'OH' },
      { name: 'Tukang Pipa', coeff: 0.8, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.08, unit: 'OH' },
      { name: 'Mandor', coeff: 0.04, unit: 'OH' },
    ],
    productivity: 3,
  },
  // SANITASI
  {
    id: 'san-001',
    category: 'Instalasi Air & Sanitasi',
    name: 'Pemasangan Kloset Duduk (Per Unit)',
    unit: 'unit',
    materials: [
      { name: 'Kloset Duduk', coeff: 1, unit: 'unit' },
      { name: 'Stop Kran', coeff: 1, unit: 'buah' },
      { name: 'Selang Fleksibel', coeff: 1, unit: 'buah' },
      { name: 'Semen PC', coeff: 2, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.5, unit: 'OH' },
      { name: 'Tukang Pipa', coeff: 1.0, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.1, unit: 'OH' },
      { name: 'Mandor', coeff: 0.05, unit: 'OH' },
    ],
    productivity: 2,
  },
  {
    id: 'san-002',
    category: 'Instalasi Air & Sanitasi',
    name: 'Pemasangan Kloset Jongkok (Per Unit)',
    unit: 'unit',
    materials: [
      { name: 'Kloset Jongkok', coeff: 1, unit: 'unit' },
      { name: 'Semen PC', coeff: 3, unit: 'kg' },
      { name: 'Pasir', coeff: 0.005, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.4, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.8, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.08, unit: 'OH' },
      { name: 'Mandor', coeff: 0.04, unit: 'OH' },
    ],
    productivity: 2,
  },
  // ELEKTRIKAL
  {
    id: 'elk-001',
    category: 'Instalasi Listrik',
    name: 'Instalasi Titik Lampu (Per Titik)',
    unit: 'titik',
    materials: [
      { name: 'Kabel NYM 2x1.5mm', coeff: 8, unit: 'm' },
      { name: 'Pipa Conduit', coeff: 4, unit: 'm' },
      { name: 'Fitting Lampu', coeff: 1, unit: 'buah' },
      { name: 'Saklar', coeff: 1, unit: 'buah' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.3, unit: 'OH' },
      { name: 'Tukang Listrik', coeff: 0.6, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.06, unit: 'OH' },
      { name: 'Mandor', coeff: 0.03, unit: 'OH' },
    ],
    productivity: 4,
  },
  {
    id: 'elk-002',
    category: 'Instalasi Listrik',
    name: 'Instalasi Stop Kontak (Per Titik)',
    unit: 'titik',
    materials: [
      { name: 'Kabel NYM 3x2.5mm', coeff: 8, unit: 'm' },
      { name: 'Pipa Conduit', coeff: 4, unit: 'm' },
      { name: 'Stop Kontak', coeff: 1, unit: 'buah' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.3, unit: 'OH' },
      { name: 'Tukang Listrik', coeff: 0.6, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.06, unit: 'OH' },
      { name: 'Mandor', coeff: 0.03, unit: 'OH' },
    ],
    productivity: 4,
  },
  {
    id: 'elk-003',
    category: 'Instalasi Listrik',
    name: 'Pemasangan Panel MCB + Instalasi Utama',
    unit: 'unit',
    materials: [
      { name: 'Box Panel MCB', coeff: 1, unit: 'unit' },
      { name: 'MCB 1 Phase', coeff: 6, unit: 'buah' },
      { name: 'Kabel NYY 4x6mm', coeff: 10, unit: 'm' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 1.0, unit: 'OH' },
      { name: 'Tukang Listrik', coeff: 2.0, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.2, unit: 'OH' },
      { name: 'Mandor', coeff: 0.1, unit: 'OH' },
    ],
    productivity: 1,
  },

  // ══════════════════════════════════════════════════════════
  // LANTAI — Keramik, Granit, Screed
  // ══════════════════════════════════════════════════════════
  {
    id: 'lan-001',
    category: 'Lantai & Keramik',
    name: 'Pasang Keramik Lantai 40x40 cm',
    unit: 'm2',
    materials: [
      { name: 'Keramik 40x40', coeff: 1.08, unit: 'm2' },
      { name: 'Semen PC', coeff: 9.0, unit: 'kg' },
      { name: 'Pasir Pasang', coeff: 0.045, unit: 'm3' },
      { name: 'Semen Warna', coeff: 0.3, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.25, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.25, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.025, unit: 'OH' },
      { name: 'Mandor', coeff: 0.013, unit: 'OH' },
    ],
    productivity: 8,
  },
  {
    id: 'lan-002',
    category: 'Lantai & Keramik',
    name: 'Pasang Keramik Lantai 60x60 cm',
    unit: 'm2',
    materials: [
      { name: 'Keramik 60x60', coeff: 1.05, unit: 'm2' },
      { name: 'Semen PC', coeff: 8.5, unit: 'kg' },
      { name: 'Pasir Pasang', coeff: 0.04, unit: 'm3' },
      { name: 'Semen Warna', coeff: 0.25, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.22, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.22, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.022, unit: 'OH' },
      { name: 'Mandor', coeff: 0.011, unit: 'OH' },
    ],
    productivity: 10,
  },
  {
    id: 'lan-003',
    category: 'Lantai & Keramik',
    name: 'Pasang Granit Lantai 60x60 cm',
    unit: 'm2',
    materials: [
      { name: 'Granit 60x60', coeff: 1.05, unit: 'm2' },
      { name: 'Semen PC', coeff: 8.5, unit: 'kg' },
      { name: 'Pasir Pasang', coeff: 0.04, unit: 'm3' },
      { name: 'Semen Warna', coeff: 0.2, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.20, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.30, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.030, unit: 'OH' },
      { name: 'Mandor', coeff: 0.015, unit: 'OH' },
    ],
    productivity: 8,
  },
  {
    id: 'lan-004',
    category: 'Lantai & Keramik',
    name: 'Screed Lantai (Rabat Beton) t=5cm',
    unit: 'm2',
    materials: [
      { name: 'Semen PC', coeff: 8.32, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.046, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.023, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.20, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.10, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.010, unit: 'OH' },
      { name: 'Mandor', coeff: 0.010, unit: 'OH' },
    ],
    productivity: 15,
  },
  {
    id: 'lan-005',
    category: 'Lantai & Keramik',
    name: 'Pasang Keramik Dinding KM/WC 25x40 cm',
    unit: 'm2',
    materials: [
      { name: 'Keramik Dinding 25x40', coeff: 1.10, unit: 'm2' },
      { name: 'Semen PC', coeff: 10.0, unit: 'kg' },
      { name: 'Pasir Pasang', coeff: 0.048, unit: 'm3' },
      { name: 'Semen Warna', coeff: 0.35, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.30, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.30, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.030, unit: 'OH' },
      { name: 'Mandor', coeff: 0.015, unit: 'OH' },
    ],
    productivity: 6,
  },

  // ══════════════════════════════════════════════════════════
  // FINISHING TAMBAHAN — Acian, Waterproofing, Plafon
  // ══════════════════════════════════════════════════════════
  {
    id: 'fin-002',
    category: 'Finishing & Pengecatan',
    name: 'Acian Dinding (Finishing Halus)',
    unit: 'm2',
    materials: [
      { name: 'Semen PC', coeff: 3.25, unit: 'kg' },
      { name: 'Air', coeff: 1.0, unit: 'liter' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.10, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.20, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.020, unit: 'OH' },
      { name: 'Mandor', coeff: 0.010, unit: 'OH' },
    ],
    productivity: 12,
  },
  {
    id: 'fin-003',
    category: 'Finishing & Pengecatan',
    name: 'Waterproofing Coating (KM/WC/Atap Dak)',
    unit: 'm2',
    materials: [
      { name: 'Waterproofing Coating', coeff: 1.5, unit: 'kg' },
      { name: 'Semen PC', coeff: 1.0, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.10, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.15, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.015, unit: 'OH' },
      { name: 'Mandor', coeff: 0.008, unit: 'OH' },
    ],
    productivity: 15,
  },
  {
    id: 'fin-004',
    category: 'Atap & Plafon',
    name: 'Plafon Gypsum Board 9mm + Rangka Metal Furing',
    unit: 'm2',
    materials: [
      { name: 'Gypsum Board 9mm', coeff: 1.05, unit: 'm2' },
      { name: 'Rangka Metal Furing', coeff: 1.2, unit: 'm2' },
      { name: 'Sekrup Gypsum', coeff: 12, unit: 'buah' },
      { name: 'Compound Gypsum', coeff: 0.5, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.15, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.20, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.020, unit: 'OH' },
      { name: 'Mandor', coeff: 0.010, unit: 'OH' },
    ],
    productivity: 10,
  },
  {
    id: 'fin-005',
    category: 'Atap & Plafon',
    name: 'Plafon GRC Board 4mm + Rangka Kayu',
    unit: 'm2',
    materials: [
      { name: 'GRC Board 4mm', coeff: 1.05, unit: 'm2' },
      { name: 'Kayu Kaso 5/7', coeff: 0.008, unit: 'm3' },
      { name: 'Paku', coeff: 0.15, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.15, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.20, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.020, unit: 'OH' },
      { name: 'Mandor', coeff: 0.010, unit: 'OH' },
    ],
    productivity: 10,
  },
  {
    id: 'fin-006',
    category: 'Finishing & Pengecatan',
    name: 'Pengecatan Ulang (Cat Lama, 2 Lapis)',
    unit: 'm2',
    materials: [
      { name: 'Cat Penutup', coeff: 0.20, unit: 'kg' },
      { name: 'Amplas', coeff: 0.1, unit: 'lembar' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.015, unit: 'OH' },
      { name: 'Tukang Cat', coeff: 0.050, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.005, unit: 'OH' },
      { name: 'Mandor', coeff: 0.003, unit: 'OH' },
    ],
    productivity: 30,
  },

  // ══════════════════════════════════════════════════════════
  // DINDING TAMBAHAN — Bata Ringan (Hebel), Partisi
  // ══════════════════════════════════════════════════════════
  {
    id: 'din-001',
    category: 'Dinding & Plesteran',
    name: 'Pasangan Bata Ringan (Hebel/AAC) 10cm',
    unit: 'm2',
    materials: [
      { name: 'Bata Ringan AAC 10cm', coeff: 8.33, unit: 'buah' },
      { name: 'Mortar Perekat Bata Ringan', coeff: 11.5, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.20, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.10, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.010, unit: 'OH' },
      { name: 'Mandor', coeff: 0.010, unit: 'OH' },
    ],
    productivity: 12,
  },
  {
    id: 'din-002',
    category: 'Dinding & Plesteran',
    name: 'Pasangan Bata Ringan (Hebel/AAC) 7.5cm',
    unit: 'm2',
    materials: [
      { name: 'Bata Ringan AAC 7.5cm', coeff: 11.11, unit: 'buah' },
      { name: 'Mortar Perekat Bata Ringan', coeff: 9.0, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.18, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.09, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.009, unit: 'OH' },
      { name: 'Mandor', coeff: 0.009, unit: 'OH' },
    ],
    productivity: 14,
  },

  // ══════════════════════════════════════════════════════════
  // SANITASI TAMBAHAN — Wastafel, Shower, Floor Drain
  // ══════════════════════════════════════════════════════════
  {
    id: 'san-003',
    category: 'Instalasi Air & Sanitasi',
    name: 'Pemasangan Wastafel (Per Unit)',
    unit: 'unit',
    materials: [
      { name: 'Wastafel', coeff: 1, unit: 'unit' },
      { name: 'Kran Air', coeff: 1, unit: 'buah' },
      { name: 'Sifon Wastafel', coeff: 1, unit: 'buah' },
      { name: 'Semen PC', coeff: 1.5, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.4, unit: 'OH' },
      { name: 'Tukang Pipa', coeff: 0.8, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.08, unit: 'OH' },
      { name: 'Mandor', coeff: 0.04, unit: 'OH' },
    ],
    productivity: 2,
  },
  {
    id: 'san-004',
    category: 'Instalasi Air & Sanitasi',
    name: 'Pemasangan Shower + Kran (Per Unit)',
    unit: 'unit',
    materials: [
      { name: 'Shower Set', coeff: 1, unit: 'unit' },
      { name: 'Kran Shower', coeff: 1, unit: 'buah' },
      { name: 'Pipa PVC 1/2"', coeff: 2, unit: 'm' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.3, unit: 'OH' },
      { name: 'Tukang Pipa', coeff: 0.6, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.06, unit: 'OH' },
      { name: 'Mandor', coeff: 0.03, unit: 'OH' },
    ],
    productivity: 3,
  },
  {
    id: 'san-005',
    category: 'Instalasi Air & Sanitasi',
    name: 'Pemasangan Floor Drain (Per Titik)',
    unit: 'titik',
    materials: [
      { name: 'Floor Drain Stainless', coeff: 1, unit: 'buah' },
      { name: 'Pipa PVC 3"', coeff: 1, unit: 'm' },
      { name: 'Semen PC', coeff: 0.5, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.2, unit: 'OH' },
      { name: 'Tukang Pipa', coeff: 0.4, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.04, unit: 'OH' },
      { name: 'Mandor', coeff: 0.02, unit: 'OH' },
    ],
    productivity: 5,
  },
  {
    id: 'san-006',
    category: 'Instalasi Air & Sanitasi',
    name: 'Pembuatan Septic Tank (Bata, 2m³)',
    unit: 'unit',
    materials: [
      { name: 'Bata Merah', coeff: 500, unit: 'bh' },
      { name: 'Semen PC', coeff: 100, unit: 'kg' },
      { name: 'Pasir Pasang', coeff: 0.4, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.2, unit: 'm3' },
      { name: 'Pipa PVC 4"', coeff: 3, unit: 'm' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 6.0, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 3.0, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.3, unit: 'OH' },
      { name: 'Mandor', coeff: 0.3, unit: 'OH' },
    ],
    productivity: 0.2,
  },

  // ══════════════════════════════════════════════════════════
  // ELEKTRIKAL TAMBAHAN — AC, Pompa Air
  // ══════════════════════════════════════════════════════════
  {
    id: 'elk-004',
    category: 'Instalasi Listrik',
    name: 'Instalasi AC Split (Per Unit, Termasuk Kabel & Pipa)',
    unit: 'unit',
    materials: [
      { name: 'Kabel NYM 3x2.5mm', coeff: 6, unit: 'm' },
      { name: 'Pipa AC 1/4"', coeff: 4, unit: 'm' },
      { name: 'MCB 1 Phase', coeff: 1, unit: 'buah' },
      { name: 'Bracket AC', coeff: 1, unit: 'set' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.5, unit: 'OH' },
      { name: 'Tukang Listrik', coeff: 1.0, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.1, unit: 'OH' },
      { name: 'Mandor', coeff: 0.05, unit: 'OH' },
    ],
    productivity: 2,
  },
  {
    id: 'elk-005',
    category: 'Instalasi Listrik',
    name: 'Instalasi Pompa Air + Tangki (Per Unit)',
    unit: 'unit',
    materials: [
      { name: 'Kabel NYM 3x2.5mm', coeff: 8, unit: 'm' },
      { name: 'Pipa PVC 1/2"', coeff: 6, unit: 'm' },
      { name: 'Fitting PVC', coeff: 6, unit: 'buah' },
      { name: 'MCB 1 Phase', coeff: 1, unit: 'buah' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.5, unit: 'OH' },
      { name: 'Tukang Listrik', coeff: 0.5, unit: 'OH' },
      { name: 'Tukang Pipa', coeff: 0.5, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.1, unit: 'OH' },
      { name: 'Mandor', coeff: 0.05, unit: 'OH' },
    ],
    productivity: 1,
  },

  // ══════════════════════════════════════════════════════════
  // TANAH & PONDASI TAMBAHAN
  // ══════════════════════════════════════════════════════════
  {
    id: 'tan-001',
    category: 'Tanah & Pondasi',
    name: 'Urugan Tanah Kembali (Pemadatan Manual)',
    unit: 'm3',
    materials: [],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.5, unit: 'OH' },
      { name: 'Mandor', coeff: 0.025, unit: 'OH' },
    ],
    productivity: 3,
  },
  {
    id: 'tan-002',
    category: 'Tanah & Pondasi',
    name: 'Urugan Pasir Bawah Lantai (t=10cm)',
    unit: 'm2',
    materials: [
      { name: 'Pasir Urug', coeff: 0.12, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.08, unit: 'OH' },
      { name: 'Mandor', coeff: 0.004, unit: 'OH' },
    ],
    productivity: 25,
  },
  {
    id: 'tan-003',
    category: 'Tanah & Pondasi',
    name: 'Pembuatan Drainase/Saluran Air (Per Meter)',
    unit: 'm1',
    materials: [
      { name: 'Bata Merah', coeff: 35, unit: 'bh' },
      { name: 'Semen PC', coeff: 8.0, unit: 'kg' },
      { name: 'Pasir Pasang', coeff: 0.03, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.4, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.2, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.02, unit: 'OH' },
      { name: 'Mandor', coeff: 0.02, unit: 'OH' },
    ],
    productivity: 5,
  },

  // ══════════════════════════════════════════════════════════
  // FINISHING EKSTERIOR — Cat luar, Plesteran luar, Waterproofing dinding
  // ══════════════════════════════════════════════════════════
  {
    id: 'fin-007',
    category: 'Finishing & Pengecatan',
    name: 'Pengecatan Eksterior (Weathershield, 2 Lapis)',
    unit: 'm2',
    materials: [
      { name: 'Cat Eksterior', coeff: 0.30, unit: 'kg' },
      { name: 'Cat Dasar Eksterior', coeff: 0.12, unit: 'kg' },
      { name: 'Plamir Eksterior', coeff: 0.08, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.025, unit: 'OH' },
      { name: 'Tukang Cat', coeff: 0.070, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.007, unit: 'OH' },
      { name: 'Mandor', coeff: 0.004, unit: 'OH' },
    ],
    productivity: 20,
  },
  {
    id: 'fin-008',
    category: 'Finishing & Pengecatan',
    name: 'Waterproofing Dinding Eksterior (Coating)',
    unit: 'm2',
    materials: [
      { name: 'Waterproofing Coating', coeff: 1.2, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.08, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.12, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.012, unit: 'OH' },
      { name: 'Mandor', coeff: 0.006, unit: 'OH' },
    ],
    productivity: 18,
  },

  // ══════════════════════════════════════════════════════════
  // TULANGAN DETAIL — per diameter besi
  // ══════════════════════════════════════════════════════════
  {
    id: 'str-006',
    category: 'Struktur',
    name: 'Pembesian Kolom D13-150 (Tulangan Utama + Sengkang)',
    unit: 'm1',
    materials: [
      { name: 'Besi Beton', coeff: 7.8, unit: 'kg' },   // 4D13 + sengkang D8-150
      { name: 'Kawat Beton', coeff: 0.12, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.05, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.05, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.005, unit: 'OH' },
      { name: 'Mandor', coeff: 0.003, unit: 'OH' },
    ],
    productivity: 20,
  },
  {
    id: 'str-007',
    category: 'Struktur',
    name: 'Pembesian Balok D13-200 (Tulangan Atas+Bawah + Sengkang)',
    unit: 'm1',
    materials: [
      { name: 'Besi Beton', coeff: 9.2, unit: 'kg' },   // 3D13 atas + 3D13 bawah + sengkang D8-200
      { name: 'Kawat Beton', coeff: 0.14, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.06, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.06, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.006, unit: 'OH' },
      { name: 'Mandor', coeff: 0.003, unit: 'OH' },
    ],
    productivity: 16,
  },
  {
    id: 'str-008',
    category: 'Struktur',
    name: 'Pembesian Plat Lantai D10-150 (2 Arah)',
    unit: 'm2',
    materials: [
      { name: 'Besi Beton', coeff: 8.5, unit: 'kg' },   // D10-150 dua arah
      { name: 'Kawat Beton', coeff: 0.13, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.04, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.04, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.004, unit: 'OH' },
      { name: 'Mandor', coeff: 0.002, unit: 'OH' },
    ],
    productivity: 25,
  },

  // ══════════════════════════════════════════════════════════
  // URUGAN PENINGGIAN LANTAI
  // ══════════════════════════════════════════════════════════
  {
    id: 'tan-004',
    category: 'Tanah & Pondasi',
    name: 'Urugan Tanah Peninggian Lantai (Per 10cm)',
    unit: 'm2',
    materials: [
      { name: 'Tanah Urug', coeff: 0.12, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.10, unit: 'OH' },
      { name: 'Mandor', coeff: 0.005, unit: 'OH' },
    ],
    productivity: 20,
  },
];

// ══════════════════════════════════════════════════════════
// TAMBAHAN STANDAR PUPR/PRKP — item yang wajib ada di RAB dinas
// ══════════════════════════════════════════════════════════

// BETON BERBAGAI MUTU
export const AHSP_EXTRA: AHSPTemplate[] = [
  {
    id: 'str-009',
    category: 'Struktur',
    name: 'Beton K-175 (Site Mix) - Lantai Kerja',
    desc: 'Beton mutu rendah untuk alas/lantai kerja di bawah pondasi. Seperti alas kaki sebelum pakai sepatu - bukan struktur utama, tapi wajib ada.',
    unit: 'm3',
    materials: [
      { name: 'Semen PC', coeff: 326, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.520, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.760, unit: 'm3' },
      { name: 'Air', coeff: 215, unit: 'liter' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 1.65, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.275, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.028, unit: 'OH' },
      { name: 'Mandor', coeff: 0.083, unit: 'OH' },
    ],
    productivity: 0.6,
  },
  {
    id: 'str-010',
    category: 'Struktur',
    name: 'Beton K-250 (Site Mix) - Struktur Utama',
    desc: 'Beton lebih kuat dari K-225, cocok untuk kolom dan balok rumah 2 lantai ke atas. Makin besar angkanya, makin kuat betonnya.',
    unit: 'm3',
    materials: [
      { name: 'Semen PC', coeff: 406, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.480, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.760, unit: 'm3' },
      { name: 'Air', coeff: 215, unit: 'liter' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 1.65, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.275, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.028, unit: 'OH' },
      { name: 'Mandor', coeff: 0.083, unit: 'OH' },
    ],
    productivity: 0.6,
  },
  {
    id: 'str-011',
    category: 'Struktur',
    name: 'Beton K-300 (Ready Mix) - Struktur Khusus',
    desc: 'Beton paling kuat, dipesan jadi dari pabrik (truk molen). Dipakai untuk gedung atau rumah dengan beban sangat berat.',
    unit: 'm3',
    materials: [
      { name: 'Beton Ready Mix K-300', coeff: 1.0, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 1.0, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.2, unit: 'OH' },
      { name: 'Mandor', coeff: 0.05, unit: 'OH' },
    ],
    productivity: 1.0,
  },
  // BEKISTING TERPISAH PER ELEMEN
  {
    id: 'str-012',
    category: 'Struktur',
    name: 'Bekisting Kolom (Kayu Multiplex)',
    desc: 'Cetakan kayu untuk membentuk tiang beton (kolom). Seperti cetakan es batu - kayu dipasang dulu, beton dituang, setelah keras kayu dilepas.',
    unit: 'm2',
    materials: [
      { name: 'Multiplex 12mm', coeff: 0.35, unit: 'lembar' },
      { name: 'Kayu Kaso 5/7', coeff: 0.015, unit: 'm3' },
      { name: 'Paku', coeff: 0.5, unit: 'kg' },
      { name: 'Minyak Bekisting', coeff: 0.2, unit: 'liter' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.35, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.35, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.035, unit: 'OH' },
      { name: 'Mandor', coeff: 0.018, unit: 'OH' },
    ],
    productivity: 5,
  },
  {
    id: 'str-013',
    category: 'Struktur',
    name: 'Bekisting Balok (Kayu Multiplex)',
    desc: 'Cetakan kayu untuk membentuk balok beton (penghubung antar kolom). Dipasang di atas, beton dituang, setelah keras kayu dilepas.',
    unit: 'm2',
    materials: [
      { name: 'Multiplex 12mm', coeff: 0.35, unit: 'lembar' },
      { name: 'Kayu Kaso 5/7', coeff: 0.018, unit: 'm3' },
      { name: 'Paku', coeff: 0.5, unit: 'kg' },
      { name: 'Minyak Bekisting', coeff: 0.2, unit: 'liter' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.40, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.40, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.040, unit: 'OH' },
      { name: 'Mandor', coeff: 0.020, unit: 'OH' },
    ],
    productivity: 5,
  },
  {
    id: 'str-014',
    category: 'Struktur',
    name: 'Bekisting Plat Lantai (Kayu Multiplex)',
    desc: 'Cetakan kayu untuk membuat lantai beton di atas (lantai 2 dst). Kayu dipasang sebagai alas, beton dituang di atasnya.',
    unit: 'm2',
    materials: [
      { name: 'Multiplex 12mm', coeff: 0.35, unit: 'lembar' },
      { name: 'Kayu Kaso 5/7', coeff: 0.020, unit: 'm3' },
      { name: 'Paku', coeff: 0.4, unit: 'kg' },
      { name: 'Minyak Bekisting', coeff: 0.15, unit: 'liter' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.30, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.30, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.030, unit: 'OH' },
      { name: 'Mandor', coeff: 0.015, unit: 'OH' },
    ],
    productivity: 6,
  },
  {
    id: 'str-015',
    category: 'Struktur',
    name: 'Bekisting Pondasi/Sloof',
    desc: 'Cetakan kayu untuk membentuk pondasi dan sloof (balok di bawah tanah). Lebih sederhana dari bekisting kolom.',
    unit: 'm2',
    materials: [
      { name: 'Papan Kayu 2/20', coeff: 0.02, unit: 'm3' },
      { name: 'Kayu Kaso 5/7', coeff: 0.01, unit: 'm3' },
      { name: 'Paku', coeff: 0.3, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.25, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.25, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.025, unit: 'OH' },
      { name: 'Mandor', coeff: 0.013, unit: 'OH' },
    ],
    productivity: 7,
  },
  // PONDASI TAMBAHAN
  {
    id: 'pon-001',
    category: 'Tanah & Pondasi',
    name: 'Pondasi Footplate/Telapak Beton Bertulang',
    desc: 'Pondasi berbentuk kotak beton di bawah setiap tiang. Seperti telapak kaki yang menopang tubuh. Cocok untuk tanah sedang.',
    unit: 'buah',
    materials: [
      { name: 'Semen PC', coeff: 120, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.16, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.25, unit: 'm3' },
      { name: 'Besi Beton', coeff: 45, unit: 'kg' },
      { name: 'Kawat Beton', coeff: 0.7, unit: 'kg' },
      { name: 'Multiplex 12mm', coeff: 0.5, unit: 'lembar' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 3.0, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 1.5, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 1.5, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.3, unit: 'OH' },
      { name: 'Mandor', coeff: 0.15, unit: 'OH' },
    ],
    productivity: 0.5,
  },
  {
    id: 'pon-002',
    category: 'Tanah & Pondasi',
    name: 'Sloof Beton Bertulang 15x20cm',
    desc: 'Balok beton yang ada di bawah tanah, menghubungkan semua pondasi. Seperti sabuk yang mengikat semua pondasi agar tidak bergerak sendiri-sendiri.',
    unit: 'm1',
    materials: [
      { name: 'Semen PC', coeff: 18.6, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.025, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.039, unit: 'm3' },
      { name: 'Besi Beton', coeff: 5.5, unit: 'kg' },
      { name: 'Kawat Beton', coeff: 0.08, unit: 'kg' },
      { name: 'Papan Kayu 2/20', coeff: 0.008, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.40, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.20, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.20, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.04, unit: 'OH' },
      { name: 'Mandor', coeff: 0.02, unit: 'OH' },
    ],
    productivity: 4,
  },
  {
    id: 'pon-003',
    category: 'Tanah & Pondasi',
    name: 'Strauss Pile D30cm (Manual)',
    desc: 'Tiang beton yang ditanam dalam ke tanah lunak/gambut. Seperti pasak yang ditancapkan ke tanah agar rumah tidak ambles.',
    unit: 'm1',
    materials: [
      { name: 'Semen PC', coeff: 40, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.054, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.084, unit: 'm3' },
      { name: 'Besi Beton', coeff: 8.0, unit: 'kg' },
      { name: 'Kawat Beton', coeff: 0.12, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 1.5, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.5, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.5, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.1, unit: 'OH' },
      { name: 'Mandor', coeff: 0.05, unit: 'OH' },
    ],
    productivity: 1.5,
  },
  // KOLOM & BALOK BETON BERTULANG
  {
    id: 'str-016',
    category: 'Struktur',
    name: 'Kolom Beton Bertulang 20x20cm',
    desc: 'Tiang beton ukuran 20x20cm. Ini tulang punggung rumah - menopang semua beban dari atas ke bawah. Wajib ada di setiap sudut dan pertemuan dinding.',
    unit: 'm1',
    materials: [
      { name: 'Semen PC', coeff: 22.3, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.030, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.047, unit: 'm3' },
      { name: 'Besi Beton', coeff: 9.5, unit: 'kg' },
      { name: 'Kawat Beton', coeff: 0.14, unit: 'kg' },
      { name: 'Multiplex 12mm', coeff: 0.15, unit: 'lembar' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.50, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.25, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.25, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.05, unit: 'OH' },
      { name: 'Mandor', coeff: 0.025, unit: 'OH' },
    ],
    productivity: 3,
  },
  {
    id: 'str-017',
    category: 'Struktur',
    name: 'Balok Beton Bertulang 15x25cm',
    desc: 'Balok beton yang menghubungkan antar tiang (kolom). Seperti tulang rusuk yang menguatkan rangka rumah.',
    unit: 'm1',
    materials: [
      { name: 'Semen PC', coeff: 27.9, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.037, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.058, unit: 'm3' },
      { name: 'Besi Beton', coeff: 11.5, unit: 'kg' },
      { name: 'Kawat Beton', coeff: 0.17, unit: 'kg' },
      { name: 'Multiplex 12mm', coeff: 0.18, unit: 'lembar' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.60, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.30, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.30, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.06, unit: 'OH' },
      { name: 'Mandor', coeff: 0.03, unit: 'OH' },
    ],
    productivity: 2.5,
  },
  {
    id: 'str-018',
    category: 'Struktur',
    name: 'Plat Lantai Beton Bertulang t=12cm',
    desc: 'Lantai beton setebal 12cm untuk lantai 2 ke atas. Ini yang kamu injak di lantai atas rumah. Harus kuat menahan beban orang dan perabot.',
    unit: 'm2',
    materials: [
      { name: 'Semen PC', coeff: 44.5, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.060, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.093, unit: 'm3' },
      { name: 'Besi Beton', coeff: 8.5, unit: 'kg' },
      { name: 'Kawat Beton', coeff: 0.13, unit: 'kg' },
      { name: 'Multiplex 12mm', coeff: 0.35, unit: 'lembar' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.40, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.20, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.20, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.04, unit: 'OH' },
      { name: 'Mandor', coeff: 0.02, unit: 'OH' },
    ],
    productivity: 4,
  },
  // RING BALOK & KOLOM PRAKTIS
  {
    id: 'str-019',
    category: 'Struktur',
    name: 'Ring Balok Beton Bertulang 12x15cm',
    desc: 'Balok beton di bagian atas dinding, tepat di bawah atap. Seperti mahkota yang mengikat semua dinding agar tidak roboh ke samping.',
    unit: 'm1',
    materials: [
      { name: 'Semen PC', coeff: 16.3, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.022, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.034, unit: 'm3' },
      { name: 'Besi Beton', coeff: 6.5, unit: 'kg' },
      { name: 'Kawat Beton', coeff: 0.10, unit: 'kg' },
      { name: 'Papan Kayu 2/20', coeff: 0.006, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.35, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.18, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.18, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.035, unit: 'OH' },
      { name: 'Mandor', coeff: 0.018, unit: 'OH' },
    ],
    productivity: 5,
  },
  {
    id: 'str-020',
    category: 'Struktur',
    name: 'Kolom Praktis Beton Bertulang 11x11cm',
    desc: 'Tiang beton kecil di dalam dinding bata. Bukan tiang utama, tapi membantu dinding agar tidak retak atau roboh. Dipasang setiap 3-4 meter.',
    unit: 'm1',
    materials: [
      { name: 'Semen PC', coeff: 9.2, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.012, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.019, unit: 'm3' },
      { name: 'Besi Beton', coeff: 3.5, unit: 'kg' },
      { name: 'Kawat Beton', coeff: 0.05, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.25, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.12, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.12, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.025, unit: 'OH' },
      { name: 'Mandor', coeff: 0.013, unit: 'OH' },
    ],
    productivity: 8,
  },
  // TANGGA
  {
    id: 'str-021',
    category: 'Struktur',
    name: 'Tangga Beton Bertulang (Per Anak Tangga)',
    desc: 'Satu anak tangga dari beton. Dihitung per buah. Rumah 2 lantai biasanya butuh 15-18 anak tangga.',
    unit: 'buah',
    materials: [
      { name: 'Semen PC', coeff: 15, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.020, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.031, unit: 'm3' },
      { name: 'Besi Beton', coeff: 4.5, unit: 'kg' },
      { name: 'Kawat Beton', coeff: 0.07, unit: 'kg' },
      { name: 'Multiplex 12mm', coeff: 0.1, unit: 'lembar' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.5, unit: 'OH' },
      { name: 'Tukang Batu', coeff: 0.25, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.25, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.05, unit: 'OH' },
      { name: 'Mandor', coeff: 0.025, unit: 'OH' },
    ],
    productivity: 3,
  },
  // PAGAR & KANOPI
  {
    id: 'lain-001',
    category: 'Lain-lain',
    name: 'Pagar Besi Hollow + Tiang Beton',
    desc: 'Pagar dari besi kotak (hollow) dengan tiang dari beton. Lebih kuat dan tahan lama dari pagar kayu.',
    unit: 'm1',
    materials: [
      { name: 'Besi Hollow 40x40', coeff: 3.5, unit: 'kg' },
      { name: 'Cat Besi', coeff: 0.15, unit: 'kg' },
      { name: 'Semen PC', coeff: 8, unit: 'kg' },
      { name: 'Pasir Beton', coeff: 0.01, unit: 'm3' },
      { name: 'Krikil (Split)', coeff: 0.016, unit: 'm3' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.4, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.4, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.04, unit: 'OH' },
      { name: 'Mandor', coeff: 0.02, unit: 'OH' },
    ],
    productivity: 4,
  },
  {
    id: 'lain-002',
    category: 'Lain-lain',
    name: 'Kanopi Baja Ringan + Atap Polycarbonate',
    desc: 'Atap pelindung di depan pintu/garasi dari rangka baja ringan + atap plastik bening (polycarbonate). Melindungi dari hujan dan panas.',
    unit: 'm2',
    materials: [
      { name: 'Baja Ringan C75', coeff: 4.5, unit: 'kg' },
      { name: 'Polycarbonate 6mm', coeff: 1.05, unit: 'm2' },
      { name: 'Sekrup Roofing', coeff: 8, unit: 'buah' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.15, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.15, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.015, unit: 'OH' },
      { name: 'Mandor', coeff: 0.008, unit: 'OH' },
    ],
    productivity: 8,
  },
  // PEKERJAAN LAIN-LAIN STANDAR PUPR
  {
    id: 'lain-003',
    category: 'Lain-lain',
    name: 'Pemasangan Railing Tangga Besi',
    desc: 'Pegangan tangan di sisi tangga dari besi. Wajib ada untuk keselamatan, terutama untuk anak-anak dan lansia.',
    unit: 'm1',
    materials: [
      { name: 'Besi Hollow 40x40', coeff: 2.5, unit: 'kg' },
      { name: 'Besi Pipa 1"', coeff: 1.2, unit: 'kg' },
      { name: 'Cat Besi', coeff: 0.1, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.3, unit: 'OH' },
      { name: 'Tukang Besi', coeff: 0.5, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.05, unit: 'OH' },
      { name: 'Mandor', coeff: 0.025, unit: 'OH' },
    ],
    productivity: 3,
  },
  {
    id: 'lain-004',
    category: 'Lain-lain',
    name: 'Pemasangan Kusen Aluminium (Per Unit)',
    desc: 'Bingkai pintu/jendela dari aluminium. Lebih tahan karat dan rayap dibanding kayu. Dipasang sebelum daun pintu/jendela.',
    unit: 'unit',
    materials: [
      { name: 'Kusen Aluminium', coeff: 1, unit: 'set' },
      { name: 'Sealant', coeff: 0.1, unit: 'kg' },
      { name: 'Sekrup', coeff: 8, unit: 'buah' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.3, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.6, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.06, unit: 'OH' },
      { name: 'Mandor', coeff: 0.03, unit: 'OH' },
    ],
    productivity: 3,
  },
  {
    id: 'lain-005',
    category: 'Lain-lain',
    name: 'Pemasangan Kaca Tempered 8mm',
    desc: 'Kaca tebal 8mm yang sudah diperkuat (tempered). Kalau pecah, hancur jadi butiran kecil tidak tajam - lebih aman. Biasa untuk pintu kaca atau jendela besar.',
    unit: 'm2',
    materials: [
      { name: 'Kaca Tempered 8mm', coeff: 1.02, unit: 'm2' },
      { name: 'Sealant', coeff: 0.15, unit: 'kg' },
    ],
    laborCoefficients: [
      { name: 'Pekerja', coeff: 0.2, unit: 'OH' },
      { name: 'Tukang Kayu', coeff: 0.3, unit: 'OH' },
      { name: 'Kepala Tukang', coeff: 0.03, unit: 'OH' },
      { name: 'Mandor', coeff: 0.015, unit: 'OH' },
    ],
    productivity: 5,
  },
];

// Gabungkan semua template
AHSP_TEMPLATES.push(...AHSP_EXTRA);
