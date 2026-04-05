import { CITIES, mergeRegionalPriceOverride, setRegionalPriceOverrides, type RegionalPriceOverride } from '../data/prices';

type CsvRow = {
  cityId: string;
  type: 'material' | 'labor';
  name: string;
  price: number;
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '');
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(normalizeHeader);
  const idxCityId = headers.findIndex((h) => h === 'cityid');
  const idxType = headers.findIndex((h) => h === 'type');
  const idxName = headers.findIndex((h) => h === 'name');
  const idxPrice = headers.findIndex((h) => h === 'price');
  if (idxCityId < 0 || idxType < 0 || idxName < 0 || idxPrice < 0) return [];

  return lines.slice(1).flatMap((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const cityId = cols[idxCityId];
    const type = cols[idxType] as 'material' | 'labor';
    const name = cols[idxName];
    const price = Number(cols[idxPrice]);
    if (!cityId || !name || Number.isNaN(price)) return [];
    if (type !== 'material' && type !== 'labor') return [];
    return [{ cityId, type, name, price }];
  });
}

export async function importRegionalPriceCsv(file: File): Promise<{ updatedCities: number; rows: number }> {
  const content = await file.text();
  const rows = parseCsv(content);
  const touched = new Set<string>();

  rows.forEach((row) => {
    const cityExists = CITIES.some((city) => city.id === row.cityId);
    if (!cityExists) return;
    touched.add(row.cityId);
    mergeRegionalPriceOverride(row.cityId, {
      materials: row.type === 'material' ? { [row.name]: row.price } : undefined,
      labor: row.type === 'labor' ? { [row.name]: row.price } : undefined,
    });
  });

  return { updatedCities: touched.size, rows: rows.length };
}

export async function importRegionalPriceFromApi(url: string): Promise<{ updatedCities: number }> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Gagal fetch dataset: ${response.status}`);
  const payload = (await response.json()) as Record<string, RegionalPriceOverride>;

  const filtered = Object.fromEntries(
    Object.entries(payload).filter(([cityId]) => CITIES.some((c) => c.id === cityId))
  );
  setRegionalPriceOverrides(filtered);
  return { updatedCities: Object.keys(filtered).length };
}

