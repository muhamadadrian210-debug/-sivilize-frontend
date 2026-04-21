import { type AHSPTemplate } from '../data/ahsp';
import { CITIES, getMaterialPricesByGrade, getRegionalPriceOverride, type MaterialGrade } from '../data/prices';
import { type RABItem, type FinancialSettings } from '../store/useStore';
import { groupRABItems } from './rabClassifier';

export const calculateVolumeFromDimensions = (
  _type: string,
  _floors: number,
  dimensions: { length: number; width: number; height: number }[]
) => {
  let totalArea = 0;
  let totalVolume = 0;

  dimensions.forEach((dim) => {
    const area = dim.length * dim.width;
    totalArea += area;
    totalVolume += area * dim.height;
  });

  return { totalArea, totalVolume };
};

export const calculateAHSPItem = (
  template: AHSPTemplate,
  cityId: string,
  grade: MaterialGrade = 'B',
  customPrices?: { materials: { [key: string]: number }; labor: { [key: string]: number } }
): number => {
  const city = CITIES.find((c) => c.id === cityId) || CITIES[0];
  const officialOverride = getRegionalPriceOverride(cityId);
  const materialPrices = customPrices?.materials || officialOverride?.materials || getMaterialPricesByGrade(cityId, grade);
  const laborPrices = customPrices?.labor || officialOverride?.labor || city.labor;

  const materialCost = template.materials.reduce((acc, mat) => {
    const price = materialPrices[mat.name] || 0;
    return acc + mat.coeff * price;
  }, 0);

  const laborCost = template.laborCoefficients.reduce((acc, lab) => {
    const wage = laborPrices[lab.name] || 0;
    return acc + lab.coeff * wage;
  }, 0);

  return materialCost + laborCost;
};

/**
 * Hitung harga satuan AHSP dengan breakdown material vs upah
 */
export const calculateAHSPItemDetailed = (
  template: AHSPTemplate,
  cityId: string,
  grade: MaterialGrade = 'B',
  customPrices?: { materials: { [key: string]: number }; labor: { [key: string]: number } }
): { materialCost: number; laborCost: number; totalCost: number } => {
  const city = CITIES.find((c) => c.id === cityId) || CITIES[0];
  const officialOverride = getRegionalPriceOverride(cityId);
  const materialPrices = customPrices?.materials || officialOverride?.materials || getMaterialPricesByGrade(cityId, grade);
  const laborPrices = customPrices?.labor || officialOverride?.labor || city.labor;

  const materialCost = template.materials.reduce((acc, mat) => {
    const price = materialPrices[mat.name] || 0;
    return acc + mat.coeff * price;
  }, 0);

  const laborCost = template.laborCoefficients.reduce((acc, lab) => {
    const wage = laborPrices[lab.name] || 0;
    return acc + lab.coeff * wage;
  }, 0);

  return { materialCost, laborCost, totalCost: materialCost + laborCost };
};

export const calculateTotalRAB = (
  items: RABItem[],
  settings: FinancialSettings
) => {
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const overheadAmount = (subtotal * settings.overhead) / 100;
  const profitAmount = (subtotal * settings.profit) / 100;
  const contingencyAmount = (subtotal * (settings.contingency || 0)) / 100;
  
  const totalBeforeTax = subtotal + overheadAmount + profitAmount + contingencyAmount;
  const taxAmount = (totalBeforeTax * settings.tax) / 100;
  
  const grandTotal = totalBeforeTax + taxAmount;

  return {
    subtotal,
    overheadAmount,
    profitAmount,
    contingencyAmount,
    taxAmount,
    grandTotal,
  };
};

/**
 * Hitung breakdown material vs upah dari semua RAB items
 * Estimasi: rata-rata konstruksi Indonesia ~60% material, ~40% upah
 */
export const calculateRABBreakdown = (items: RABItem[]) => {
  let totalMaterial = 0;
  let totalLabor = 0;

  items.forEach(item => {
    // Gunakan data breakdown jika tersedia di item
    if (item.analysis) {
      const matCost = item.analysis.materials.reduce((s, m) => s + (m.coeff * m.price), 0) * item.volume;
      const labCost = item.analysis.labor.reduce((s, l) => s + (l.coeff * l.wage), 0) * item.volume;
      totalMaterial += matCost;
      totalLabor += labCost;
    } else {
      // Estimasi berdasarkan kategori jika tidak ada data detail
      const LABOR_RATIO: Record<string, number> = {
        'Persiapan': 0.70,   // 70% upah (banyak tenaga kerja)
        'Struktur': 0.35,    // 35% upah
        'Tanah': 0.80,       // 80% upah (galian manual)
        'Dinding': 0.40,     // 40% upah
        'Lantai': 0.35,      // 35% upah
        'Finishing': 0.50,   // 50% upah
        'Atap': 0.30,        // 30% upah
        'Arsitektur': 0.40,  // 40% upah
        'Mekanikal': 0.45,   // 45% upah
        'Elektrikal': 0.50,  // 50% upah
        'Sanitasi': 0.40,    // 40% upah
        'Lain-lain': 0.40,   // 40% upah
      };
      const laborRatio = LABOR_RATIO[item.category] || 0.40;
      totalLabor += item.total * laborRatio;
      totalMaterial += item.total * (1 - laborRatio);
    }
  });

  const total = totalMaterial + totalLabor;
  return {
    totalMaterial,
    totalLabor,
    materialPercent: total > 0 ? (totalMaterial / total) * 100 : 0,
    laborPercent: total > 0 ? (totalLabor / total) * 100 : 0,
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getCostCategory = (costPerM2: number) => {
  if (costPerM2 < 4000000) return { label: 'Low Cost', color: 'text-success' };
  if (costPerM2 < 7000000) return { label: 'Medium Cost', color: 'text-primary' };
  return { label: 'High Cost', color: 'text-red-500' };
};

/**
 * Get grouped RAB items for display and export
 */
export const getGroupedRABItems = (items: RABItem[]) => {
  return groupRABItems(items);
};

/**
 * Calculate totals from grouped RAB
 */
export const calculateTotalFromGrouped = (grouped: { items: RABItem[] }[], settings: FinancialSettings) => {
  const flatItems = grouped.flatMap(g => g.items);
  return calculateTotalRAB(flatItems, settings);
};
