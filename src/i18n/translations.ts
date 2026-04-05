// i18n Translation System - EN + ID
type Language = 'en' | 'id';

export const translations = {
  en: {
    // Navigation & Common
    nav: {
      dashboard: '📊 Dashboard',
      input: '📝 Input',
      profile: '👤 Profile',
      logout: '🚪 Logout',
      settings: '⚙️ Settings',
      language: 'Language'
    },
    
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome to SIVILIZE-HUB PRO',
      recentProjects: 'Recent Projects',
      noProjects: 'No projects yet',
      createNew: 'Create New Project',
      totalProjects: 'Total Projects',
      totalBudget: 'Total Budget',
      completedProjects: 'Completed Projects'
    },

    // RAB Calculator
    rab: {
      title: 'RAB Calculator',
      projectName: 'Project Name',
      projectLocation: 'Project Location',
      buildingArea: 'Building Area (m²)',
      province: 'Province',
      houseType: 'House Type',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      materialGrade: 'Material Grade',
      continue: 'Continue',
      calculate: 'Calculate RAB',
      generateAutomatic: 'Generate Automatic RAB',
      export: 'Export',
      exportExcel: 'Export to Excel',
      exportPDF: 'Export to PDF',
      simple: 'Simple (36-70m²)',
      medium: 'Medium (70-120m²)',
      luxury: 'Luxury (120-250m²)',
      standard: 'Standard',
      premium: 'Premium'
    },

    // RAB Categories
    categories: {
      struktur: 'Structural Work',
      persiapan: 'Preparation Work',
      tanah: 'Earthwork',
      dinding: 'Wall Work',
      lantai: 'Flooring Work',
      finishing: 'Finishing Work',
      atap: 'Roofing Work',
      lainnya: 'Other'
    },

    // Validation & Errors
    validation: {
      projectNameRequired: 'Project name is required',
      areaRequired: 'Building area must be greater than 0',
      provinceRequired: 'Province must be selected',
      bedroomRequired: 'At least 1 bedroom required',
      bathroomRequired: 'At least 1 bathroom required',
      error: 'Error',
      success: 'Success',
      invalidInput: 'Invalid input',
      tryAgain: 'Try again'
    },

    // AI Assistant
    ai: {
      title: 'AI Assistant',
      support24: '24/7 Support',
      askAnything: 'Ask anything...',
      send: 'Send',
      close: 'Close',
      hello: 'Hello! I\'m SIVILIZE-HUB AI Assistant. What can I help you with?',
      greeting: 'Hello! I\'m ready to help you use SIVILIZE-HUB PRO. To create RAB: 1) Click "New Project" 2) Fill data 3) Click "Calculate RAB"',
      rabExplain: 'RAB is Building Cost Plan. This app calculates based on AHSP/SNI national standards with material prices according to your region.',
      exportGuide: 'After calculating RAB, you can export to Excel or PDF using the available buttons in the calculation results.',
      houseTypes: 'Available 3 types: Simple (36-70m²), Medium (70-120m²), Luxury (120-250m²). Choose according to your needs and budget.',
      errorHelp: 'If there\'s an error, make sure: 1) All inputs are filled 2) Numbers are positive 3) Province is selected. Need step-by-step help?',
      defaultResponse: 'I can help about: RAB, AHSP, export, house types, or errors you encounter. Ask specifically!'
    },

    // Auth
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      rememberMe: 'Remember me',
      noAccount: 'Don\'t have account?',
      haveAccount: 'Have account?',
      forgotPassword: 'Forgot password?',
      signIn: 'Sign In',
      signUp: 'Sign Up'
    },

    // Buttons
    buttons: {
      next: 'Next',
      previous: 'Previous',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      submit: 'Submit',
      cancel: 'Cancel'
    }
  },

  id: {
    // Navigation & Common
    nav: {
      dashboard: '📊 Dashboard',
      input: '📝 Input',
      profile: '👤 Profil',
      logout: '🚪 Keluar',
      settings: '⚙️ Pengaturan',
      language: 'Bahasa'
    },

    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Selamat Datang di SIVILIZE-HUB PRO',
      recentProjects: 'Proyek Terbaru',
      noProjects: 'Belum ada proyek',
      createNew: 'Buat Proyek Baru',
      totalProjects: 'Total Proyek',
      totalBudget: 'Total Anggaran',
      completedProjects: 'Proyek Selesai'
    },

    // RAB Calculator
    rab: {
      title: 'Kalkulator RAB',
      projectName: 'Nama Proyek',
      projectLocation: 'Lokasi Proyek',
      buildingArea: 'Luas Bangunan (m²)',
      province: 'Provinsi',
      houseType: 'Tipe Rumah',
      bedrooms: 'Kamar Tidur',
      bathrooms: 'Kamar Mandi',
      materialGrade: 'Tingkat Material',
      continue: 'Lanjut',
      calculate: 'Hitung RAB',
      generateAutomatic: 'Hasilkan RAB Otomatis',
      export: 'Unduh',
      exportExcel: 'Unduh ke Excel',
      exportPDF: 'Unduh ke PDF',
      simple: 'Sederhana (36-70m²)',
      medium: 'Menengah (70-120m²)',
      luxury: 'Mewah (120-250m²)',
      standard: 'Standard',
      premium: 'Premium'
    },

    // RAB Categories
    categories: {
      struktur: 'Pekerjaan Struktur',
      persiapan: 'Pekerjaan Persiapan',
      tanah: 'Pekerjaan Tanah',
      dinding: 'Pekerjaan Dinding',
      lantai: 'Pekerjaan Lantai',
      finishing: 'Pekerjaan Finishing',
      atap: 'Pekerjaan Atap',
      lainnya: 'Lain-lain'
    },

    // Validation & Errors
    validation: {
      projectNameRequired: 'Nama proyek harus diisi',
      areaRequired: 'Luas bangunan harus lebih dari 0',
      provinceRequired: 'Provinsi harus dipilih',
      bedroomRequired: 'Kamar tidur minimal 1',
      bathroomRequired: 'Kamar mandi minimal 1',
      error: 'Error',
      success: 'Berhasil',
      invalidInput: 'Input tidak valid',
      tryAgain: 'Coba lagi'
    },

    // AI Assistant
    ai: {
      title: 'AI Assistant',
      support24: 'Support 24/7',
      askAnything: 'Tanya apa saja...',
      send: 'Kirim',
      close: 'Tutup',
      hello: 'Halo! Saya AI Assistant SIVILIZE-HUB. Ada yang bisa saya bantu?',
      greeting: 'Halo! Saya siap membantu Anda menggunakan SIVILIZE-HUB PRO. Untuk membuat RAB: 1) Klik "Proyek Baru" 2) Isi data 3) Klik "Hitung RAB"',
      rabExplain: 'RAB adalah Rencana Anggaran Biaya. Aplikasi ini menghitung berdasarkan AHSP/SNI standar nasional dengan harga material sesuai wilayah Anda.',
      exportGuide: 'Setelah menghitung RAB, Anda bisa export ke Excel atau PDF dengan tombol yang tersedia di hasil perhitungan.',
      houseTypes: 'Tersedia 3 tipe: Sederhana (36-70m²), Menengah (70-120m²), Mewah (120-250m²). Pilih sesuai kebutuhan dan budget Anda.',
      errorHelp: 'Jika ada error, pastikan: 1) Semua input terisi 2) Angka positif 3) Provinsi dipilih. Butuh bantuan langkah demi langkah?',
      defaultResponse: 'Saya bisa bantu tentang: RAB, AHSP, export, tipe rumah, atau error yang Anda alami. Tanyakan spesifik ya!'
    },

    // Auth
    auth: {
      login: 'Masuk',
      register: 'Daftar',
      email: 'Email',
      password: 'Password',
      rememberMe: 'Ingat saya',
      noAccount: 'Belum punya akun?',
      haveAccount: 'Sudah punya akun?',
      forgotPassword: 'Lupa password?',
      signIn: 'Masuk ke Platform',
      signUp: 'Buat Akun'
    },

    // Buttons
    buttons: {
      next: 'Selanjutnya',
      previous: 'Sebelumnya',
      save: 'Simpan',
      delete: 'Hapus',
      edit: 'Edit',
      submit: 'Kirim',
      cancel: 'Batal'
    }
  }
};

// Hook to use translations
export const useTranslation = (language: Language = 'id') => {
  return {
    t: (path: string) => getNestedTranslation(translations[language], path),
    lang: language,
    all: translations[language]
  };
};

// Helper to get nested translation
function getNestedTranslation(obj: unknown, path: string): string {
  return path.split('.').reduce((current: unknown, prop: string) => {
    if (current && typeof current === 'object' && prop in current) {
      return (current as Record<string, unknown>)[prop];
    }
    return undefined;
  }, obj) as string || path;
}

export default translations;
