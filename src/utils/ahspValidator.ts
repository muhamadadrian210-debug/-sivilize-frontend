/**
 * AHSP Validator - SE 47/SE/Dk/2026
 * Validasi koefisien dan harga satuan pekerjaan
 */

export interface AHSPWarning {
  level: 'info' | 'warning' | 'error';
  message: string;
}

// Rentang harga satuan wajar per kategori (Rp/satuan) - referensi PUPR 2022
const PRICE_RANGES: Record<string, { min: number; max: number; unit: string }> = {
  // Struktur
  'Galian Tanah':         { min: 40000,    max: 150000,   unit: 'm³' },
  'Beton K-225':          { min: 800000,   max: 2000000,  unit: 'm³' },
  'Beton K-300':          { min: 900000,   max: 2500000,  unit: 'm³' },
  'Besi Tulangan':        { min: 14000,    max: 25000,    unit: 'kg' },
  'Bekisting':            { min: 150000,   max: 400000,   unit: 'm²' },
  // Dinding
  'Pasangan Bata':        { min: 80000,    max: 200000,   unit: 'm²' },
  'Plesteran':            { min: 40000,    max: 100000,   unit: 'm²' },
  'Acian':                { min: 30000,    max: 80000,    unit: 'm²' },
  'Lantai Kerja':         { min: 500000,   max: 1200000,  unit: 'm³' },
  // Lantai
  'Keramik':              { min: 80000,    max: 300000,   unit: 'm²' },
  'Granit':               { min: 200000,   max: 800000,   unit: 'm²' },
  // Finishing
  'Cat Dinding':          { min: 25000,    max: 80000,    unit: 'm²' },
  'Plafon':               { min: 80000,    max: 250000,   unit: 'm²' },
  // Atap
  'Rangka Atap Baja':     { min: 150000,   max: 400000,   unit: 'm²' },
  'Genteng':              { min: 80000,    max: 300000,   unit: 'm²' },
  // MEP
  'Instalasi Listrik':    { min: 300000,   max: 1500000,  unit: 'titik' },
  'Instalasi Air':        { min: 200000,   max: 800000,   unit: 'titik' },
};

// Koefisien tenaga kerja standar PUPR (OH per satuan)
const LABOR_COEFF_RANGES: Record<string, { pekerja: [number, number]; tukang: [number, number] }> = {
  'Beton K-225':   { pekerja: [1.65, 2.10], tukang: [0.275, 0.350] },
  'Pasangan Bata': { pekerja: [0.30, 0.50], tukang: [0.10, 0.20]  },
  'Plesteran':     { pekerja: [0.15, 0.30], tukang: [0.10, 0.20]  },
  'Keramik':       { pekerja: [0.25, 0.45], tukang: [0.12, 0.25]  },
  'Cat Dinding':   { pekerja: [0.02, 0.06], tukang: [0.06, 0.12]  },
};

/**
 * Validasi harga satuan item RAB terhadap standar PUPR
 */
export const validateUnitPrice = (itemName: string, unitPrice: number): AHSPWarning | null => {
  const key = Object.keys(PRICE_RANGES).find(k =>
    itemName.toLowerCase().includes(k.toLowerCase())
  );
  if (!key) return null;

  const range = PRICE_RANGES[key];
  if (unitPrice < range.min) {
    return {
      level: 'warning',
      message: `Harga satuan terlalu rendah (min. ${new Intl.NumberFormat('id-ID').format(range.min)}/${range.unit} sesuai PUPR 2022)`
    };
  }
  if (unitPrice > range.max * 2) {
    return {
      level: 'warning',
      message: `Harga satuan sangat tinggi (maks. wajar ${new Intl.NumberFormat('id-ID').format(range.max)}/${range.unit})`
    };
  }
  if (unitPrice > range.max) {
    return {
      level: 'info',
      message: `Harga satuan di atas rata-rata pasar (ref. PUPR: ${new Intl.NumberFormat('id-ID').format(range.max)}/${range.unit})`
    };
  }
  return null;
};

/**
 * Validasi koefisien tenaga kerja
 */
export const validateLaborCoeff = (
  itemName: string,
  pekerjaCoeff: number,
  tukangCoeff: number
): AHSPWarning | null => {
  const key = Object.keys(LABOR_COEFF_RANGES).find(k =>
    itemName.toLowerCase().includes(k.toLowerCase())
  );
  if (!key) return null;

  const range = LABOR_COEFF_RANGES[key];
  const [pMin, pMax] = range.pekerja;
  const [tMin, tMax] = range.tukang;

  if (pekerjaCoeff < pMin || pekerjaCoeff > pMax) {
    return {
      level: 'warning',
      message: `Koefisien pekerja ${pekerjaCoeff} OH di luar standar PUPR (${pMin}"“${pMax} OH)`
    };
  }
  if (tukangCoeff < tMin || tukangCoeff > tMax) {
    return {
      level: 'warning',
      message: `Koefisien tukang ${tukangCoeff} OH di luar standar PUPR (${tMin}"“${tMax} OH)`
    };
  }
  return null;
};

/**
 * Validasi seluruh RAB items sekaligus
 */
export const validateRABItems = (items: { id: string; name: string; unitPrice: number }[]) => {
  return items.map(item => ({
    id: item.id,
    warning: validateUnitPrice(item.name, item.unitPrice),
  })).filter(r => r.warning !== null);
};
