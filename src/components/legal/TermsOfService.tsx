import { 
  FileText, 
  AlertCircle, 
  Ban, 
  Activity,
  CheckCircle2,
  ChevronRight,
  ShieldOff
} from 'lucide-react';

const TermsOfService = () => {
  const sections = [
    {
      title: 'Aturan Penggunaan Aplikasi',
      icon: CheckCircle2,
      content: [
        'Hanya individu berusia 18 tahun ke atas yang diizinkan menggunakan platform.',
        'Pengguna bertanggung jawab atas keakuratan data proyek yang dimasukkan.',
        'Sivilize Hub Pro tidak bertanggung jawab atas kesalahan perhitungan akibat input data yang tidak valid.',
        'Akun bersifat personal dan tidak boleh dibagikan kepada orang lain tanpa izin.'
      ]
    },
    {
      title: 'Larangan Penyalahgunaan',
      icon: Ban,
      content: [
        'Dilarang melakukan reverse engineering terhadap algoritma perhitungan AHSP.',
        'Dilarang menggunakan skrip otomatis untuk mengambil data dari platform.',
        'Dilarang mengunggah file berbahaya, virus, atau malware ke dalam sistem.',
        'Penyalahgunaan hak akses dapat mengakibatkan penangguhan akun secara permanen.'
      ]
    },
    {
      title: 'Batas Tanggung Jawab Developer',
      icon: ShieldOff,
      content: [
        'Layanan disediakan "apa adanya" tanpa jaminan mutlak atas ketersediaan 24/7.',
        'Kami tidak bertanggung jawab atas kerugian finansial yang timbul dari keputusan bisnis berdasarkan data platform.',
        'Developer berhak melakukan pemeliharaan sistem (maintenance) sewaktu-waktu.',
        'Hasil perhitungan RAB bersifat estimasi profesional dan perlu divalidasi oleh ahli teknik sipil terkait.'
      ]
    },
    {
      title: 'Perubahan Layanan',
      icon: Activity,
      content: [
        'Fitur aplikasi dapat berubah, ditambahkan, atau dihapus tanpa pemberitahuan sebelumnya.',
        'Kami akan memberitahukan perubahan signifikan melalui email atau notifikasi sistem.',
        'Penggunaan berkelanjutan setelah perubahan dianggap sebagai persetujuan terhadap aturan baru.'
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
          <FileText size={40} />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Ketentuan Layanan</h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Terakhir diperbarui: 31 Maret 2026. Dengan mengakses Sivilize Hub Pro, Anda setuju untuk mematuhi seluruh syarat dan ketentuan di bawah ini.
        </p>
      </div>

      <div className="grid gap-8">
        {sections.map((section, index) => (
          <div key={index} className="glass-card p-8 group hover:border-primary/30 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                <section.icon size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">{section.title}</h2>
            </div>
            <ul className="space-y-4">
              {section.content.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-text-secondary leading-relaxed">
                  <ChevronRight size={18} className="text-primary shrink-0 mt-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 glass-card p-8 border-red-500/20 bg-red-500/5 text-center">
        <div className="flex items-center justify-center gap-2 text-red-400 font-bold mb-4">
          <AlertCircle size={20} />
          Peringatan Penting
        </div>
        <p className="text-text-secondary text-sm">
          Pelanggaran terhadap ketentuan layanan ini dapat mengakibatkan penghentian akses secara sepihak oleh developer demi keamanan ekosistem Sivilize Hub Pro.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
