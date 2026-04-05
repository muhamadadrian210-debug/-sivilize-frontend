// FAQ Database - EN + ID
export interface FAQItem {
  id: string;
  category: string;
  question: { en: string; id: string };
  answer: { en: string; id: string };
  keywords: { en: string[]; id: string[] };
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
}

export const faqDatabase: FAQItem[] = [
  {
    id: 'faq_rab_definition',
    category: 'RAB Basics',
    question: {
      en: 'What is RAB?',
      id: 'Apa itu RAB?'
    },
    answer: {
      en: 'RAB stands for Rencana Anggaran Biaya (Building Cost Plan). It\'s a detailed breakdown of construction costs based on materials, labor, and national standards (AHSP/SNI).',
      id: 'RAB adalah Rencana Anggaran Biaya yang merupakan rincian detail biaya konstruksi berdasarkan material, tenaga kerja, dan standar nasional (AHSP/SNI).'
    },
    keywords: {
      en: ['rab', 'cost plan', 'budget', 'building cost', 'what is rab'],
      id: ['rab', 'rencana anggaran', 'biaya', 'anggaran bangunan', 'apa itu rab']
    }
  },
  {
    id: 'faq_rab_creation',
    category: 'RAB Creation',
    question: {
      en: 'How do I create a RAB?',
      id: 'Bagaimana cara membuat RAB?'
    },
    answer: {
      en: 'Step 1: Click "New Project". Step 2: Fill project details (name, location, area). Step 3: Select house type and materials. Step 4: Click "Generate Automatic RAB". Step 5: Review and edit items if needed. Step 6: Export to Excel or PDF.',
      id: 'Langkah 1: Klik "Proyek Baru". Langkah 2: Isi detail proyek (nama, lokasi, luas). Langkah 3: Pilih tipe rumah dan material. Langkah 4: Klik "Hasilkan RAB Otomatis". Langkah 5: Review dan edit item jika perlu. Langkah 6: Unduh ke Excel atau PDF.'
    },
    keywords: {
      en: ['create rab', 'new project', 'how to make rab', 'generate rab', 'make rab'],
      id: ['buat rab', 'proyek baru', 'cara membuat rab', 'hasilkan rab', 'membuat rab']
    }
  },
  {
    id: 'faq_house_types',
    category: 'House Types',
    question: {
      en: 'What are the house types available?',
      id: 'Apa saja tipe rumah yang tersedia?'
    },
    answer: {
      en: 'We have 3 main types: 1) Simple (36-70m²) - Basic construction with essential rooms. 2) Medium (70-120m²) - Standard rooms with better finishing. 3) Luxury (120-250m²) - Premium construction with advanced features. Choose based on your needs and budget.',
      id: 'Ada 3 tipe utama: 1) Sederhana (36-70m²) - Konstruksi dasar dengan ruangan esensial. 2) Menengah (70-120m²) - Ruangan standar dengan finishing lebih baik. 3) Mewah (120-250m²) - Konstruksi premium dengan fitur canggih. Pilih sesuai kebutuhan dan budget Anda.'
    },
    keywords: {
      en: ['house types', 'simple', 'medium', 'luxury', 'tipe rumah', 'house size'],
      id: ['tipe rumah', 'sederhana', 'menengah', 'mewah', 'simple', 'medium']
    }
  },
  {
    id: 'faq_export',
    category: 'Export',
    question: {
      en: 'How do I export the RAB?',
      id: 'Bagaimana cara export RAB?'
    },
    answer: {
      en: 'After generating RAB, you\'ll see export buttons: 1) "Export to Excel" - Downloads professional formatted spreadsheet with cost breakdown. 2) "Export to PDF" - Downloads formatted document. Both include detailed item listings, costs, and summary.',
      id: 'Setelah generate RAB, Anda akan melihat tombol export: 1) "Unduh ke Excel" - Download spreadsheet terformat profesional dengan rincian biaya. 2) "Unduh ke PDF" - Download dokumen terformat. Keduanya include rincian item detail, biaya, dan ringkasan.'
    },
    keywords: {
      en: ['export', 'download', 'excel', 'pdf', 'save', 'export rab'],
      id: ['export', 'unduh', 'excel', 'pdf', 'simpan', 'export rab']
    }
  },
  {
    id: 'faq_materials',
    category: 'Materials',
    question: {
      en: 'Are material prices regional?',
      id: 'Apakah harga material berbeda di setiap wilayah?'
    },
    answer: {
      en: 'Yes! We have regional pricing based on provincial data. Select your province when creating a project, and the system automatically adjusts material costs. This ensures accurate budgeting for your specific location.',
      id: 'Ya! Kami memiliki harga berbeda berdasarkan data regional. Pilih provinsi saat membuat proyek, dan sistem otomatis menyesuaikan harga material. Ini memastikan penganggaran akurat untuk lokasi spesifik Anda.'
    },
    keywords: {
      en: ['material prices', 'regional', 'province', 'prices', 'cost'],
      id: ['harga material', 'regional', 'provinsi', 'harga', 'biaya']
    }
  },
  {
    id: 'faq_ahsp',
    category: 'Standards',
    question: {
      en: 'What is AHSP/SNI?',
      id: 'Apa itu AHSP/SNI?'
    },
    answer: {
      en: 'AHSP = Analisis Harga Satuan Pekerjaan (Unit Price Analysis). SNI = Standar Nasional Indonesia (Indonesian National Standards). These are government-approved standards for construction costs and quality. Our system uses these to ensure accurate and standard calculations.',
      id: 'AHSP = Analisis Harga Satuan Pekerjaan. SNI = Standar Nasional Indonesia. Ini adalah standar yang disetujui pemerintah untuk biaya dan kualitas konstruksi. Sistem kami menggunakan ini untuk memastikan perhitungan akurat dan sesuai standar.'
    },
    keywords: {
      en: ['ahsp', 'sni', 'standard', 'national standard', 'construction standard'],
      id: ['ahsp', 'sni', 'standar', 'standar nasional', 'standar konstruksi']
    }
  },
  {
    id: 'faq_errors',
    category: 'Troubleshooting',
    question: {
      en: 'Why am I getting an error?',
      id: 'Mengapa saya mendapat error?'
    },
    answer: {
      en: 'Common causes: 1) Missing fields - Fill all required fields. 2) Invalid numbers - Use positive numbers only. 3) No province selected - Choose your province. 4) File too large - Keep files under 10MB. 5) Browser cache - Clear cookies and try again.',
      id: 'Penyebab umum: 1) Field kosong - Isi semua field yang diperlukan. 2) Angka tidak valid - Gunakan angka positif saja. 3) Provinsi tidak dipilih - Pilih provinsi Anda. 4) File terlalu besar - Simpan file di bawah 10MB. 5) Cache browser - Hapus cookies dan coba lagi.'
    },
    keywords: {
      en: ['error', 'problem', 'issue', 'not working', 'help', 'troubleshoot'],
      id: ['error', 'masalah', 'problem', 'tidak bisa', 'bantuan', 'troubleshoot']
    }
  },
  {
    id: 'faq_remember_me',
    category: 'Account',
    question: {
      en: 'What does "Remember Me" do?',
      id: 'Apa fungsi "Ingat Saya"?'
    },
    answer: {
      en: 'When you check "Remember Me" during login, your email and password are saved securely in your browser. Next time you visit, your credentials will auto-fill on the login page. You can uncheck this box for security on shared computers.',
      id: 'Ketika Anda centang "Ingat Saya" saat login, email dan password Anda disimpan aman di browser Anda. Lain kali Anda berkunjung, kredensial akan auto-fill di halaman login. Anda bisa uncek ini untuk keamanan di komputer bersama.'
    },
    keywords: {
      en: ['remember me', 'auto fill', 'login', 'credentials', 'remember password'],
      id: ['ingat saya', 'auto fill', 'login', 'kredensial', 'ingat password']
    }
  },
  {
    id: 'faq_account_security',
    category: 'Security',
    question: {
      en: 'Is my account secure?',
      id: 'Apakah akun saya aman?'
    },
    answer: {
      en: 'Yes! We use industry-standard security: 1) Password encryption (bcryptjs). 2) JWT tokens (30-day expiry). 3) CORS protection. 4) Input validation. 5) Rate limiting to prevent attacks. 6) HTTPS in production. Your data is safe with us.',
      id: 'Ya! Kami menggunakan keamanan standar industri: 1) Enkripsi password (bcryptjs). 2) Token JWT (30 hari kadaluarsa). 3) Proteksi CORS. 4) Validasi input. 5) Rate limiting untuk cegah serangan. 6) HTTPS di production. Data Anda aman bersama kami.'
    },
    keywords: {
      en: ['security', 'safe', 'password', 'encryption', 'secure'],
      id: ['keamanan', 'aman', 'password', 'enkripsi', 'secure']
    }
  },
  {
    id: 'faq_team_members',
    category: 'Projects',
    question: {
      en: 'How do I assign team members?',
      id: 'Bagaimana cara assign anggota tim?'
    },
    answer: {
      en: 'In the RAB items list, each item has a "Team" section. Click on it to assign workers for that task. You can add multiple team members per item. Estimated hours and costs are calculated automatically based on team size.',
      id: 'Di daftar item RAB, setiap item memiliki bagian "Tim". Klik untuk assign pekerja untuk tugas itu. Anda bisa tambah banyak anggota tim per item. Jam estimasi dan biaya dihitung otomatis berdasarkan ukuran tim.'
    },
    keywords: {
      en: ['team', 'assign', 'workers', 'members', 'team members', 'workforce'],
      id: ['tim', 'assign', 'pekerja', 'anggota', 'anggota tim', 'tim kerja']
    }
  }
];

export const getTutorials = () => ({
  en: [
    {
      id: 'tut_quick_start',
      title: 'Quick Start Guide',
      description: 'Learn the basics in 5 minutes',
      videoUrl: 'https://youtube.com/watch?v=quickstart',
      duration: '5:00'
    },
    {
      id: 'tut_rab_creation',
      title: 'Creating Your First RAB',
      description: 'Step-by-step guide to create a complete RAB',
      videoUrl: 'https://youtube.com/watch?v=rab_creation',
      duration: '12:30'
    },
    {
      id: 'tut_export',
      title: 'Export to Excel & PDF',
      description: 'How to export your RAB in different formats',
      videoUrl: 'https://youtube.com/watch?v=export',
      duration: '8:15'
    },
    {
      id: 'tut_materials',
      title: 'Understanding Material Costs',
      description: 'Regional pricing and material selection',
      videoUrl: 'https://youtube.com/watch?v=materials',
      duration: '10:00'
    }
  ],
  id: [
    {
      id: 'tut_quick_start',
      title: 'Panduan Mulai Cepat',
      description: 'Pelajari dasar-dasar dalam 5 menit',
      videoUrl: 'https://youtube.com/watch?v=quickstart_id',
      duration: '5:00'
    },
    {
      id: 'tut_rab_creation',
      title: 'Membuat RAB Pertama Anda',
      description: 'Panduan langkah demi langkah membuat RAB lengkap',
      videoUrl: 'https://youtube.com/watch?v=rab_creation_id',
      duration: '12:30'
    },
    {
      id: 'tut_export',
      title: 'Export ke Excel & PDF',
      description: 'Cara export RAB Anda dalam format berbeda',
      videoUrl: 'https://youtube.com/watch?v=export_id',
      duration: '8:15'
    },
    {
      id: 'tut_materials',
      title: 'Memahami Biaya Material',
      description: 'Harga regional dan pemilihan material',
      videoUrl: 'https://youtube.com/watch?v=materials_id',
      duration: '10:00'
    }
  ]
});

export default faqDatabase;
