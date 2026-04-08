import { type RABItem } from '../store/useStore';

/**
 * RAB Item Auto-Classifier
 * Automatically categorizes work items based on keywords
 */

export type RABCategory = 
  | 'Pekerjaan Struktur'
  | 'Pekerjaan Persiapan'
  | 'Pekerjaan Tanah'
  | 'Pekerjaan Dinding'
  | 'Pekerjaan Lantai'
  | 'Pekerjaan Finishing'
  | 'Pekerjaan Atap'
  | 'Lain-lain';

// RABItem category values (from store)
type ItemCategory = 'Struktur' | 'Persiapan' | 'Tanah' | 'Dinding' | 'Lantai' | 'Finishing' | 'Atap' | 'Arsitektur' | 'Mekanikal' | 'Elektrikal' | 'Sanitasi' | 'Lain-lain';

// Map item category to RABCategory
const mapToRABCategory = (cat: ItemCategory | string): RABCategory => {
  const map: Record<string, RABCategory> = {
    'Struktur': 'Pekerjaan Struktur',
    'Persiapan': 'Pekerjaan Persiapan',
    'Tanah': 'Pekerjaan Tanah',
    'Dinding': 'Pekerjaan Dinding',
    'Lantai': 'Pekerjaan Lantai',
    'Finishing': 'Pekerjaan Finishing',
    'Atap': 'Pekerjaan Atap',
    'Arsitektur': 'Pekerjaan Finishing',
    'Mekanikal': 'Pekerjaan Finishing',
    'Elektrikal': 'Pekerjaan Finishing',
    'Sanitasi': 'Pekerjaan Finishing',
  };
  return map[cat] || 'Lain-lain';
};

interface ClassificationRule {
  category: RABCategory;
  keywords: string[];
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    category: 'Pekerjaan Struktur',
    keywords: [
      'galian', 'penggalian', 'pondasi', 'caisson', 'tiang', 'pasak',
      'beton', 'pengecoran', 'bekisting', 'pembesian', 'baja', 'tulangan',
      'kolom', 'balok', 'plat', 'dek', 'struktur'
    ]
  },
  {
    category: 'Pekerjaan Persiapan',
    keywords: [
      'persiapan', 'pembersihan', 'survey', 'marking', 'pemasangan', 'mobilisasi',
      'akses', 'jalan kerja', 'gudang', 'kantor', 'pagar', 'signage'
    ]
  },
  {
    category: 'Pekerjaan Tanah',
    keywords: [
      'urugan', 'timbunan', 'tanah', 'lempung', 'pasir', 'batu',
      'pemadatan', 'grading', 'drainase', 'saluran', 'sump pit'
    ]
  },
  {
    category: 'Pekerjaan Dinding',
    keywords: [
      'pasangan', 'bata', 'bak', 'plesteran', 'plester', 'adukan',
      'dinding', 'tembok', 'mor', 'spesi', 'mortar'
    ]
  },
  {
    category: 'Pekerjaan Lantai',
    keywords: [
      'keramik', 'granit', 'marmer', 'ubin', 'lantai', 'penutup lantai',
      'quarry tile', 'homogenous', 'vinyl', 'wooden', 'kayu'
    ]
  },
  {
    category: 'Pekerjaan Finishing',
    keywords: [
      'pengecatan', 'cat', 'finishing', 'polish', 'coating', 'waterproof',
      'membrane', 'sealant', 'kaca', 'pintu', 'jendela', 'kusen',
      'saniter', 'fixture', 'lampu', 'elektrik', 'pipa', 'instalasi'
    ]
  },
  {
    category: 'Pekerjaan Atap',
    keywords: [
      'atap', 'genteng', 'roofing', 'rangka atap', 'talang', 'gutter',
      'downspout', 'shingles', 'aspal', 'membran', 'metal'
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
    'Pekerjaan Persiapan',
    'Pekerjaan Tanah',
    'Pekerjaan Struktur',
    'Pekerjaan Dinding',
    'Pekerjaan Lantai',
    'Pekerjaan Finishing',
    'Pekerjaan Atap',
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
