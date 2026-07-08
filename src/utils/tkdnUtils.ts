import { type RABItem } from '../store/useStore';

/**
 * Heuristik Tingkat Komponen Dalam Negeri (TKDN) berdasarkan nama material
 * Return persentase TKDN (0 - 100)
 */
export const getMaterialTKDN = (materialName: string): number => {
  if (!materialName) return 75;
  const name = materialName.toLowerCase();
  
  // 1. Material Alam & Lokal 100%
  if (
    name.includes('pasir') || 
    name.includes('batu') || 
    name.includes('tanah') || 
    name.includes('air') ||
    name.includes('kayu') ||
    name.includes('bambu')
  ) {
    return 100;
  }

  // 2. Material Olahan Pabrik Lokal (80% - 95%)
  if (
    name.includes('semen') ||
    name.includes('bata') ||
    name.includes('genteng') ||
    name.includes('paku') ||
    name.includes('cat') ||
    name.includes('multiplek') ||
    name.includes('keramik') ||
    name.includes('beton')
  ) {
    return 85;
  }

  // 3. Material Teknologi Tinggi / Pabrikasi Impor / Baja Khusus (30% - 60%)
  if (
    name.includes('baja wf') ||
    name.includes('girder') ||
    name.includes('lift') ||
    name.includes('ac ') ||
    name.includes('vinyl') ||
    name.includes('timbal') ||
    name.includes('gas medis') ||
    name.includes('bearing') ||
    name.includes('htb')
  ) {
    return 45;
  }

  // 4. Default untuk material lain (Asumsi 75% lokalisasi umum)
  return 75;
};

/**
 * Menghitung rekapitulasi TKDN untuk seluruh proyek berdasarkan RABItems
 */
export const calculateProjectTKDN = (rabItems: RABItem[]) => {
  let totalDomesticValue = 0;
  let totalProjectValue = 0;

  rabItems.forEach(item => {
    // Jika tidak ada analisa AHSP rinci, kita asumsi TKDN item ini 80% rata-rata
    if (!item.analysis) {
      totalProjectValue += item.total;
      totalDomesticValue += item.total * 0.8;
      return;
    }

    const { materials, labor } = item.analysis;

    // Hitung komponen material (Domestic vs Total)
    materials?.forEach(mat => {
      const matTotalCost = mat.price * mat.coeff * item.volume;
      const tkdnPercent = getMaterialTKDN(mat.name) / 100;
      
      totalProjectValue += matTotalCost;
      totalDomesticValue += (matTotalCost * tkdnPercent);
    });

    // Hitung komponen upah tenaga kerja (Selalu 100% lokal karena menggunakan tenaga kerja dalam negeri)
    labor?.forEach(lab => {
      const labTotalCost = lab.wage * lab.coeff * item.volume;
      totalProjectValue += labTotalCost;
      totalDomesticValue += labTotalCost; // 100% TKDN
    });
  });

  const overallTKDN = totalProjectValue > 0 ? (totalDomesticValue / totalProjectValue) * 100 : 0;

  return {
    overallTKDN,
    totalDomesticValue,
    totalProjectValue
  };
};
