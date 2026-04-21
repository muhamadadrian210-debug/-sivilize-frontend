import { type RABItem } from '../store/useStore';

/**
 * RAB Item Auto-Classifier
 * Automatically categorizes work items based on keywords
 */

export type RABCategory = 
  | 'Persiapan'
  | 'Tanah & Pondasi'
  | 'Struktur'
  | 'Dinding & Plesteran'
  | 'Kusen, Pintu & Jendela'
  | 'Atap & Plafon'
  | 'Lantai & Keramik'
  | 'Instalasi Listrik'
  | 'Instalasi Air & Sanitasi'
  | 'Finishing & Pengecatan'
  | 'Lain-lain';

// RABItem category values (from store)
type ItemCategory = 'Persiapan' | 'Tanah & Pondasi' | 'Struktur' | 'Dinding & Plesteran' | 'Kusen, Pintu & Jendela' | 'Atap & Plafon' | 'Lantai & Keramik' | 'Instalasi Listrik' | 'Instalasi Air & Sanitasi' | 'Finishing & Pengecatan' | 'Lain-lain';

// Map item category to RABCategory
const mapToRABCategory = (cat: ItemCategory | string): RABCategory => {
  const map: Record<string, RABCategory> = {
    'Persiapan':                'Persiapan',
    'Tanah & Pondasi':          'Tanah & Pondasi',
    'Struktur':                 'Struktur',
    'Dinding & Plesteran':      'Dinding & Plesteran',
    'Kusen, Pintu & Jendela':   'Kusen, Pintu & Jendela',
    'Atap & Plafon':            'Atap & Plafon',
    'Lantai & Keramik':         'Lantai & Keramik',
    'Instalasi Listrik':        'Instalasi Listrik',
    'Instalasi Air & Sanitasi': 'Instalasi Air & Sanitasi',
    'Finishing & Pengecatan':   'Finishing & Pengecatan',
    // Legacy mappings for backward compatibility
    'Tanah':       'Tanah & Pondasi',
    'Dinding':     'Dinding & Plesteran',
    'Arsitektur':  'Dinding & Plesteran',
    'Atap':        'Atap & Plafon',
    'Lantai':      'Lantai & Keramik',
    'Mekanikal':   'Instalasi Air & Sanitasi',
    'Elektrikal':  'Instalasi Listrik',
    'Sanitasi':    'Instalasi Air & Sanitasi',
    'Finishing':   'Finishing & Pengecatan',
  };
  return map[cat] || 'Lain-lain';
};

interface ClassificationRule {
  category: RABCategory;
  keywords: string[];
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    category: 'Persiapan',
    keywords: [
      'persiapan', 'pembersihan', 'survey', 'marking', 'mobilisasi',
      'akses', 'jalan kerja', 'gudang', 'kantor', 'pagar', 'signage',
      'bowplank', 'bouwplank', 'patok', 'k3', 'p3k', 'helm', 'rompi',
      'papan nama', 'direksi keet', 'listrik kerja', 'air kerja'
    ]
  },
  {
    category: 'Tanah & Pondasi',
    keywords: [
      'galian', 'penggalian', 'urugan', 'timbunan', 'tanah', 'lempung',
      'pemadatan', 'grading', 'drainase', 'saluran', 'sump pit',
      'pondasi', 'batu kali', 'footplat', 'footplate', 'strauss', 'tiang pancang',
      'pasir urug', 'pasir bawah'
    ]
  },
  {
    category: 'Struktur',
    keywords: [
      'beton', 'pengecoran', 'bekisting', 'pembesian', 'baja tulangan',
      'kolom', 'balok', 'plat lantai', 'sloof', 'ring balok',
      'k-225', 'k225', 'besi beton', 'kawat beton'
    ]
  },
  {
    category: 'Dinding & Plesteran',
    keywords: [
      'pasangan bata', 'bata merah', 'bata ringan', 'hebel', 'aac',
      'plesteran', 'plester', 'adukan', 'dinding', 'tembok', 'mortar', 'spesi'
    ]
  },
  {
    category: 'Kusen, Pintu & Jendela',
    keywords: [
      'kusen', 'pintu', 'jendela', 'daun pintu', 'daun jendela',
      'engsel', 'kunci', 'grendel', 'kaca', 'aluminium frame'
    ]
  },
  {
    category: 'Atap & Plafon',
    keywords: [
      'atap', 'genteng', 'roofing', 'rangka atap', 'talang', 'gutter',
      'spandek', 'galvalum', 'baja ringan', 'reng',
      'plafon', 'gypsum', 'grc board', 'metal furing', 'eternit'
    ]
  },
  {
    category: 'Lantai & Keramik',
    keywords: [
      'keramik', 'granit', 'marmer', 'ubin', 'lantai', 'penutup lantai',
      'homogenous', 'vinyl', 'screed', 'rabat beton'
    ]
  },
  {
    category: 'Instalasi Listrik',
    keywords: [
      'listrik', 'elektrikal', 'kabel', 'titik lampu', 'stop kontak',
      'panel mcb', 'mcb', 'saklar', 'fitting lampu', 'conduit',
      'ac split', 'pompa air', 'instalasi listrik'
    ]
  },
  {
    category: 'Instalasi Air & Sanitasi',
    keywords: [
      'pipa', 'plumbing', 'air bersih', 'air kotor', 'sanitasi',
      'kloset', 'wastafel', 'shower', 'floor drain', 'septic tank',
      'bak mandi', 'kran', 'fitting pvc', 'lem pvc'
    ]
  },
  {
    category: 'Finishing & Pengecatan',
    keywords: [
      'pengecatan', 'cat', 'finishing', 'polish', 'coating', 'waterproof',
      'membrane', 'sealant', 'acian', 'plamir', 'amplas'
    ]
  }
];

/**
 * Classify RAB item into category based on description
 * @param description - Item description/name
 * @returns Category name
 */
export const classifyRABItem = (description: string): RABCategory => {
  if (!description) return 'Lain-lain';

  const lowerDesc = description.toLowerCase().trim();

  for (const rule of CLASSIFICATION_RULES) {
    for (const keyword of rule.keywords) {
      if (lowerDesc.includes(keyword)) {
        return rule.category;
      }
    }
  }

  return 'Lain-lain';
};

/**
 * Group RAB items by category
 * @param items - Flat list of RAB items
 * @returns Grouped items with category summaries
 */
export const groupRABItems = (items: RABItem[]) => {
  const grouped = new Map<RABCategory, RABItem[]>();

  // Initialize all categories
  const allCategories: RABCategory[] = [
    'Persiapan',
    'Tanah & Pondasi',
    'Struktur',
    'Dinding & Plesteran',
    'Kusen, Pintu & Jendela',
    'Atap & Plafon',
    'Lantai & Keramik',
    'Instalasi Listrik',
    'Instalasi Air & Sanitasi',
    'Finishing & Pengecatan',
    'Lain-lain'
  ];

  allCategories.forEach(cat => grouped.set(cat, []));

  // Classify and group items
  items.forEach(item => {
    const rawCategory = item.category || classifyRABItem(item.name);
    const category = mapToRABCategory(rawCategory);
    const itemsInCategory = grouped.get(category) || [];
    itemsInCategory.push(item);
    grouped.set(category, itemsInCategory);
  });

  // Convert to array format with subtotals
  const groupedArray = Array.from(grouped.entries())
    .filter(([, items]) => items.length > 0) // Only include categories with items
    .map(([kategori, items]) => ({
      kategori,
      items: items.map((item, idx) => ({
        ...item,
        no: idx + 1
      })),
      subtotal: items.reduce((sum, item) => sum + (item.total || 0), 0),
      totalItems: items.length
    }));

  return groupedArray;
};

/**
 * Calculate totals from grouped RAB items
 */
export const calculateGroupedTotals = (grouped: { subtotal: number; totalItems: number }[]) => {
  const subtotal = grouped.reduce((sum, group) => sum + group.subtotal, 0);
  return {
    subtotal,
    totalItems: grouped.reduce((sum, group) => sum + group.totalItems, 0),
    totalCategories: grouped.length
  };
};
