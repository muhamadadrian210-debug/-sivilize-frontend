/**
 * Faktor waste/susut material konstruksi
 * Referensi: SNI, pengalaman lapangan, AHSP PUPR 2022
 * 
 * Waste factor = berapa persen material terbuang/rusak saat pelaksanaan
 * Volume yang dibeli = volume terpasang × (1 + waste factor)
 */

export const WASTE_FACTORS: Record<string, number> = {
  // === STRUKTUR ===
  'Semen PC':           0.05,  // 5% — tumpah, mengeras di ember
  'Pasir Pasang':       0.10,  // 10% — tercecer, terbawa air
  'Pasir Beton':        0.08,  // 8%
  'Krikil (Split)':     0.05,  // 5%
  'Bata Merah':         0.10,  // 10% — pecah saat angkut & pasang
  'Besi Beton':         0.05,  // 5% — potongan sisa
  'Kawat Beton':        0.10,  // 10%
  'Air':                0.00,  // tidak dihitung waste

  // === KAYU & BEKISTING ===
  'Kayu Bekisting':     0.15,  // 15% — potongan, rusak saat bongkar
  'Kayu Kaso 5/7':      0.15,
  'Papan Kayu 2/20':    0.15,
  'Kayu Kusen':         0.10,
  'Kayu Rangka Atap':   0.12,
  'Paku':               0.10,
  'Minyak Bekisting':   0.05,

  // === LANTAI & KERAMIK ===
  'Keramik 40x40':      0.08,  // 8% — potongan sudut, pecah
  'Keramik 60x60':      0.10,  // 10% — lebih banyak potongan
  'Granit 60x60':       0.10,
  'Keramik Dinding 25x40': 0.12, // 12% — banyak potongan di sudut KM
  'Semen Warna':        0.10,

  // === FINISHING ===
  'Plamir':             0.10,
  'Cat Dasar':          0.10,
  'Cat Penutup':        0.10,
  'Cat Kayu':           0.10,
  'Waterproofing Coating': 0.10,
  'Amplas':             0.20,

  // === PLAFON ===
  'Gypsum Board 9mm':   0.10,  // 10% — potongan
  'Rangka Metal Furing':0.08,
  'Sekrup Gypsum':      0.10,
  'Compound Gypsum':    0.15,
  'GRC Board 4mm':      0.10,

  // === ATAP ===
  'Genteng Beton':      0.05,  // 5% — pecah saat angkut
  'Genteng Keramik':    0.05,
  'Spandek/Galvalum':   0.08,  // 8% — potongan overlap
  'Baja Ringan C75':    0.08,
  'Reng Baja Ringan':   0.08,
  'Sekrup Roofing':     0.10,
  'Sealant':            0.10,

  // === BATA RINGAN ===
  'Bata Ringan AAC 10cm': 0.05,
  'Bata Ringan AAC 7.5cm': 0.05,
  'Mortar Perekat Bata Ringan': 0.10,

  // === PLUMBING ===
  'Pipa PVC 1/2"':      0.10,  // 10% — potongan
  'Pipa PVC 3"':        0.10,
  'Pipa PVC 4"':        0.10,
  'Pipa PPR 1/2"':      0.10,
  'Fitting PVC':        0.05,
  'Fitting PPR':        0.05,
  'Lem PVC':            0.10,

  // === ELEKTRIKAL ===
  'Kabel NYM 2x1.5mm':  0.10,
  'Kabel NYM 3x2.5mm':  0.10,
  'Kabel NYY 4x6mm':    0.08,
  'Pipa Conduit':       0.10,

  // === SANITASI ===
  // Barang jadi (kloset, wastafel) tidak ada waste
  'Kloset Duduk':       0.00,
  'Kloset Jongkok':     0.00,
  'Wastafel':           0.00,
  'Shower Set':         0.00,
  'Floor Drain Stainless': 0.02,
  // === EKSTERIOR ===
  'Cat Eksterior':      0.12,  // 12% — lebih boros karena permukaan kasar
  'Cat Dasar Eksterior':0.10,
  'Plamir Eksterior':   0.10,
  // === TANAH URUG ===
  'Tanah Urug':         0.15,  // 15% — penyusutan setelah pemadatan
};

/**
 * Hitung volume material yang harus dibeli (sudah termasuk waste)
 */
export const applyWaste = (materialName: string, volumeTerpasang: number): number => {
  const waste = WASTE_FACTORS[materialName] ?? 0.05; // default 5%
  return volumeTerpasang * (1 + waste);
};

/**
 * Hitung total kebutuhan material dari RAB items dengan faktor waste
 */
export interface MaterialNeed {
  nama: string;
  satuan: string;
  volumeBersih: number;   // volume terpasang
  wasteFactor: number;    // persentase waste
  volumeBeli: number;     // volume yang harus dibeli
  hargaSatuan: number;
  totalHarga: number;
}

export const calculateMaterialNeeds = (
  items: Array<{
    name: string;
    volume: number;
    materials: Array<{ name: string; coeff: number; unit: string }>;
  }>,
  materialPrices: Record<string, number>
): MaterialNeed[] => {
  const needs = new Map<string, MaterialNeed>();

  items.forEach(item => {
    item.materials.forEach(mat => {
      const volumeBersih = mat.coeff * item.volume;
      const waste = WASTE_FACTORS[mat.name] ?? 0.05;
      const volumeBeli = volumeBersih * (1 + waste);
      const hargaSatuan = materialPrices[mat.name] || 0;

      if (needs.has(mat.name)) {
        const existing = needs.get(mat.name)!;
        existing.volumeBersih += volumeBersih;
        existing.volumeBeli += volumeBeli;
        existing.totalHarga += volumeBeli * hargaSatuan;
      } else {
        needs.set(mat.name, {
          nama: mat.name,
          satuan: mat.unit,
          volumeBersih,
          wasteFactor: waste,
          volumeBeli,
          hargaSatuan,
          totalHarga: volumeBeli * hargaSatuan,
        });
      }
    });
  });

  return Array.from(needs.values()).sort((a, b) => b.totalHarga - a.totalHarga);
};
