import { type AHSPTemplate } from '../data/ahsp';
import { CITIES, getMaterialPricesByGrade, getRegionalPriceOverride, type MaterialGrade } from '../data/prices';
import { type RABItem, type FinancialSettings } from '../store/useStore';
import { groupRABItems, calculateGroupedTotals } from './rabClassifier';

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
export const calculateTotalFromGrouped = (grouped: any[], settings: FinancialSettings) => {
  const flatItems = grouped.flatMap(g => g.items);
  return calculateTotalRAB(flatItems, settings);
};
