export interface CityPrices {
  id: string;
  name: string;
  provinceId: string;
  provinceName: string;
  region: string;
  materials: { [key: string]: number };
  labor: { [key: string]: number };
}

export interface ProvinceOption {
  id: string;
  name: string;
  region: string;
  cities: string[];
}

export type MaterialGrade = 'A' | 'B' | 'C';

export interface MaterialTransparency {
  materialName: string;
  brand: string;
  spec: string;
  standardRef: string;
}

export interface RegionalPriceOverride {
  materials?: Record<string, number>;
  labor?: Record<string, number>;
}

const defaultMaterials = {
  'Semen PC': 1250,
  'Pasir Pasang': 325000,
  'Pasir Beton': 350000,
  'Krikil (Split)': 340000,
  'Bata Merah': 1200,
  'Besi Beton': 12500,
  'Kawat Beton': 22000,
  'Plamir': 18000,
  'Cat Dasar': 45000,
  'Cat Penutup': 65000,
  'Air': 500,
};

const defaultLabor = {
  'Pekerja': 120000,
  'Tukang Batu': 150000,
  'Tukang Besi': 150000,
  'Tukang Cat': 140000,
  'Kepala Tukang': 175000,
  'Mandor': 200000,
};

export const PROVINCES: ProvinceOption[] = [
  { id: 'aceh', name: 'Aceh', region: 'Sumatera', cities: ['Banda Aceh', 'Lhokseumawe', 'Meulaboh'] },
  { id: 'sumut', name: 'Sumatera Utara', region: 'Sumatera', cities: ['Medan', 'Pematangsiantar', 'Binjai'] },
  { id: 'sumbar', name: 'Sumatera Barat', region: 'Sumatera', cities: ['Padang', 'Bukittinggi', 'Payakumbuh'] },
  { id: 'riau', name: 'Riau', region: 'Sumatera', cities: ['Pekanbaru', 'Dumai', 'Bagansiapiapi'] },
  { id: 'jambi', name: 'Jambi', region: 'Sumatera', cities: ['Jambi', 'Sungai Penuh', 'Muara Bungo'] },
  { id: 'sumsel', name: 'Sumatera Selatan', region: 'Sumatera', cities: ['Palembang', 'Prabumulih', 'Lubuklinggau'] },
  { id: 'bengkulu', name: 'Bengkulu', region: 'Sumatera', cities: ['Bengkulu', 'Curup', 'Manna'] },
  { id: 'lampung', name: 'Lampung', region: 'Sumatera', cities: ['Bandar Lampung', 'Metro', 'Kotabumi'] },
  { id: 'babel', name: 'Kepulauan Bangka Belitung', region: 'Sumatera', cities: ['Pangkalpinang', 'Tanjung Pandan', 'Sungailiat'] },
  { id: 'kepri', name: 'Kepulauan Riau', region: 'Sumatera', cities: ['Tanjungpinang', 'Batam', 'Ranai'] },
  { id: 'jakarta', name: 'DKI Jakarta', region: 'Jawa', cities: ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat'] },
  { id: 'jabar', name: 'Jawa Barat', region: 'Jawa', cities: ['Bandung', 'Bekasi', 'Bogor'] },
  { id: 'jateng', name: 'Jawa Tengah', region: 'Jawa', cities: ['Semarang', 'Surakarta', 'Tegal'] },
  { id: 'yogyakarta', name: 'DI Yogyakarta', region: 'Jawa', cities: ['Yogyakarta', 'Sleman', 'Bantul'] },
  { id: 'jatim', name: 'Jawa Timur', region: 'Jawa', cities: ['Surabaya', 'Malang', 'Madiun'] },
  { id: 'banten', name: 'Banten', region: 'Jawa', cities: ['Serang', 'Tangerang', 'Cilegon'] },
  { id: 'bali', name: 'Bali', region: 'Nusa Tenggara', cities: ['Denpasar', 'Singaraja', 'Tabanan'] },
  { id: 'ntb', name: 'Nusa Tenggara Barat', region: 'Nusa Tenggara', cities: ['Mataram', 'Bima', 'Sumbawa Besar'] },
  { id: 'ntt', name: 'Nusa Tenggara Timur', region: 'Nusa Tenggara', cities: ['Kupang', 'Soe', 'Maumere'] },
  { id: 'kalbar', name: 'Kalimantan Barat', region: 'Kalimantan', cities: ['Pontianak', 'Singkawang', 'Ketapang'] },
  { id: 'kalteng', name: 'Kalimantan Tengah', region: 'Kalimantan', cities: ['Palangka Raya', 'Sampit', 'Pangkalan Bun'] },
  { id: 'kalsel', name: 'Kalimantan Selatan', region: 'Kalimantan', cities: ['Banjarmasin', 'Banjarbaru', 'Kotabaru'] },
  { id: 'kaltim', name: 'Kalimantan Timur', region: 'Kalimantan', cities: ['Samarinda', 'Balikpapan', 'Bontang'] },
  { id: 'kalut', name: 'Kalimantan Utara', region: 'Kalimantan', cities: ['Tanjung Selor', 'Tarakan', 'Nunukan'] },
  { id: 'sulut', name: 'Sulawesi Utara', region: 'Sulawesi', cities: ['Manado', 'Bitung', 'Tomohon'] },
  { id: 'gorontalo', name: 'Gorontalo', region: 'Sulawesi', cities: ['Gorontalo', 'Limboto', 'Marisa'] },
  { id: 'sulteng', name: 'Sulawesi Tengah', region: 'Sulawesi', cities: ['Palu', 'Poso', 'Luwuk'] },
  { id: 'sulbar', name: 'Sulawesi Barat', region: 'Sulawesi', cities: ['Mamuju', 'Majene', 'Polewali'] },
  { id: 'sulsel', name: 'Sulawesi Selatan', region: 'Sulawesi', cities: ['Makassar', 'Parepare', 'Palopo'] },
  { id: 'sultra', name: 'Sulawesi Tenggara', region: 'Sulawesi', cities: ['Kendari', 'Baubau', 'Raha'] },
  { id: 'maluku', name: 'Maluku', region: 'Maluku', cities: ['Ambon', 'Tual', 'Masohi'] },
  { id: 'malut', name: 'Maluku Utara', region: 'Maluku', cities: ['Sofifi', 'Ternate', 'Tidore'] },
  { id: 'papua', name: 'Papua', region: 'Papua', cities: ['Jayapura', 'Sentani', 'Sarmi'] },
  { id: 'papua-barat', name: 'Papua Barat', region: 'Papua', cities: ['Manokwari', 'Fakfak', 'Kaimana'] },
  { id: 'papua-barat-daya', name: 'Papua Barat Daya', region: 'Papua', cities: ['Sorong', 'Aimas', 'Teminabuan'] },
  { id: 'papua-tengah', name: 'Papua Tengah', region: 'Papua', cities: ['Nabire', 'Enarotali', 'Timika'] },
  { id: 'papua-pegunungan', name: 'Papua Pegunungan', region: 'Papua', cities: ['Wamena', 'Oksibil', 'Karubaga'] },
  { id: 'papua-selatan', name: 'Papua Selatan', region: 'Papua', cities: ['Merauke', 'Agats', 'Tanah Merah'] },
];

export const CITIES: CityPrices[] = PROVINCES.flatMap((province) =>
  province.cities.map((cityName, index) => ({
    id: `${province.id}-${index + 1}`,
    name: cityName,
    provinceId: province.id,
    provinceName: province.name,
    region: province.region,
    materials: { ...defaultMaterials },
    labor: { ...defaultLabor },
  }))
);

export const DEFAULT_PROVINCE_ID = PROVINCES[0]?.id ?? '';
export const DEFAULT_CITY_ID = CITIES[0]?.id ?? '';
export const DEFAULT_MATERIAL_GRADE: MaterialGrade = 'B';

export const MATERIAL_GRADE_OPTIONS: Array<{
  id: MaterialGrade;
  label: string;
  description: string;
}> = [
  { id: 'A', label: 'Grade A (Mewah)', description: 'Material premium, finishing superior, tetap sesuai kaidah struktur.' },
  { id: 'B', label: 'Grade B (Standar)', description: 'Material standar konstruksi harian dengan performa seimbang.' },
  { id: 'C', label: 'Grade C (Super Irit)', description: 'Efisien biaya namun tetap mengutamakan keselamatan dan kekuatan.' },
];

const GRADE_MULTIPLIER: Record<MaterialGrade, number> = {
  A: 1.25,
  B: 1,
  C: 0.9,
};

const MATERIAL_BRANDS_BY_GRADE: Record<MaterialGrade, Record<string, { brand: string; spec: string }>> = {
  A: {
    'Semen PC': { brand: 'Bosowa / Tiga Roda Premium', spec: 'Portland Composite Cement, mutu premium' },
    'Pasir Pasang': { brand: 'Pasir Cilegon Pilihan', spec: 'Ayak halus, kadar lumpur terkontrol' },
    'Pasir Beton': { brand: 'Pasir Beton Lumajang', spec: 'Gradasi baik untuk beton struktural' },
    'Krikil (Split)': { brand: 'Split Andesit 1/2', spec: 'Keras, bersih, sesuai spesifikasi campuran' },
    'Bata Merah': { brand: 'Bata Merah Oven Super', spec: 'Dimensi stabil, serapan air terkendali' },
    'Besi Beton': { brand: 'Krakatau Steel / Master Steel', spec: 'BJTS 420, SNI tulangan beton' },
    'Kawat Beton': { brand: 'Kawat Ikat Premium', spec: 'Diameter konsisten, anti rapuh' },
    'Plamir': { brand: 'Avian / Jotun Plamur', spec: 'Daya rekat tinggi, minim retak rambut' },
    'Cat Dasar': { brand: 'Nippon Vinilex Primer', spec: 'Daya tutup baik, tahan alkali' },
    'Cat Penutup': { brand: 'Dulux / Jotun Premium', spec: 'Ketahanan cuaca dan warna tinggi' },
    Air: { brand: 'Air Bersih PDAM/Sumur Uji', spec: 'Tidak mengandung minyak/garam merusak' },
  },
  B: {
    'Semen PC': { brand: 'Bosowa / Dynamix', spec: 'Portland Composite Cement, mutu standar proyek' },
    'Pasir Pasang': { brand: 'Pasir Pasang Lokal', spec: 'Kadar lumpur dikontrol lapangan' },
    'Pasir Beton': { brand: 'Pasir Beton Lokal', spec: 'Layak untuk campuran beton normal' },
    'Krikil (Split)': { brand: 'Split Lokal 1/2', spec: 'Ukuran seragam, cukup bersih' },
    'Bata Merah': { brand: 'Bata Merah Press', spec: 'Mutu standar pasangan dinding' },
    'Besi Beton': { brand: 'Besi Beton SNI Lokal', spec: 'BJTS 280/420 sesuai kebutuhan desain' },
    'Kawat Beton': { brand: 'Kawat Ikat Galvanis', spec: 'Lentur dan mudah dibentuk' },
    'Plamir': { brand: 'No Drop / Avitex Putty', spec: 'Plamir standar interior-eksterior' },
    'Cat Dasar': { brand: 'Avitex Primer', spec: 'Primer standar dinding' },
    'Cat Penutup': { brand: 'Avitex / Mowilex', spec: 'Finishing standar kualitas baik' },
    Air: { brand: 'Air Bersih Lokal', spec: 'Sumber air bersih terkontrol' },
  },
  C: {
    'Semen PC': { brand: 'Bosowa Ekonomis / Lokal SNI', spec: 'PCC ekonomis tetap bersertifikat' },
    'Pasir Pasang': { brand: 'Pasir Lokal Ekonomis', spec: 'Disaring ulang sebelum pemakaian' },
    'Pasir Beton': { brand: 'Pasir Beton Lokal Ekonomis', spec: 'Gradasi minimum layak campuran' },
    'Krikil (Split)': { brand: 'Split Lokal Ekonomis', spec: 'Dipilih untuk efisiensi biaya' },
    'Bata Merah': { brand: 'Bata Lokal Pilihan', spec: 'Dipilih yang tidak mudah pecah' },
    'Besi Beton': { brand: 'Besi Beton SNI Ekonomis', spec: 'Tetap wajib standar SNI tulangan' },
    'Kawat Beton': { brand: 'Kawat Ikat Standar', spec: 'Kualitas standar pekerjaan umum' },
    'Plamir': { brand: 'Plamir Lokal', spec: 'Ekonomis dengan kontrol aplikasi' },
    'Cat Dasar': { brand: 'Primer Lokal', spec: 'Primer ekonomis' },
    'Cat Penutup': { brand: 'Cat Ekonomis SNI', spec: 'Daya sebar menengah' },
    Air: { brand: 'Air Bersih Lokal', spec: 'Tetap harus air bersih' },
  },
};

export const getCitiesByProvince = (provinceId: string) =>
  CITIES.filter((city) => city.provinceId === provinceId);

export const getCityById = (cityId: string) => CITIES.find((city) => city.id === cityId);

export const getCityDisplayName = (cityId: string) => {
  const city = getCityById(cityId);
  if (!city) return cityId;
  return `${city.name}, ${city.provinceName}`;
};

export const getMaterialPricesByGrade = (cityId: string, grade: MaterialGrade) => {
  const city = getCityById(cityId) || CITIES[0];
  if (!city) return { ...defaultMaterials };
  const multiplier = GRADE_MULTIPLIER[grade] || 1;

  return Object.fromEntries(
    Object.entries(city.materials).map(([materialName, basePrice]) => [
      materialName,
      Math.round(basePrice * multiplier),
    ])
  ) as Record<string, number>;
};

export const getMaterialTransparency = (
  materialName: string,
  cityId: string,
  grade: MaterialGrade
): MaterialTransparency => {
  const city = getCityById(cityId);
  const defaultProfile = MATERIAL_BRANDS_BY_GRADE[grade][materialName] || {
    brand: 'Material Lokal Tersertifikasi',
    spec: 'Mengikuti standar teknis yang berlaku',
  };

  return {
    materialName,
    brand: defaultProfile.brand,
    spec: defaultProfile.spec,
    standardRef: `SNI/AHSP referensi setempat - ${city ? `${city.name}, ${city.provinceName}` : 'Indonesia'}`,
  };
};

const REGIONAL_PRICE_OVERRIDE_KEY = 'regional-price-overrides-v1';

let regionalPriceOverrides: Record<string, RegionalPriceOverride> = (() => {
  try {
    const raw = localStorage.getItem(REGIONAL_PRICE_OVERRIDE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, RegionalPriceOverride>) : {};
  } catch {
    return {};
  }
})();

export const getRegionalPriceOverride = (cityId: string): RegionalPriceOverride | undefined =>
  regionalPriceOverrides[cityId];

export const setRegionalPriceOverrides = (overrides: Record<string, RegionalPriceOverride>) => {
  regionalPriceOverrides = overrides;
  localStorage.setItem(REGIONAL_PRICE_OVERRIDE_KEY, JSON.stringify(overrides));
};

export const mergeRegionalPriceOverride = (cityId: string, patch: RegionalPriceOverride) => {
  regionalPriceOverrides[cityId] = {
    materials: {
      ...(regionalPriceOverrides[cityId]?.materials || {}),
      ...(patch.materials || {}),
    },
    labor: {
      ...(regionalPriceOverrides[cityId]?.labor || {}),
      ...(patch.labor || {}),
    },
  };
  localStorage.setItem(REGIONAL_PRICE_OVERRIDE_KEY, JSON.stringify(regionalPriceOverrides));
};

export const clearRegionalPriceOverrides = () => {
  regionalPriceOverrides = {};
  localStorage.removeItem(REGIONAL_PRICE_OVERRIDE_KEY);
};
