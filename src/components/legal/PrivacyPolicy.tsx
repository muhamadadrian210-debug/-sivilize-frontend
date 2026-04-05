import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  FileCheck,
  RefreshCw,
  Mail,
  ChevronRight
} from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: 'Data yang Dikumpulkan',
      icon: Eye,
      content: [
        'Informasi Akun: Nama lengkap, alamat email, dan kata sandi yang dienkripsi.',
        'Data Proyek: Detail perhitungan RAB, volume pekerjaan, dan data AHSP yang Anda masukkan.',
        'Log Aktivitas: Informasi penggunaan platform untuk tujuan optimasi sistem.'
      ]
    },
    {
      title: 'Tujuan Penggunaan Data',
      icon: FileCheck,
      content: [
        'Menyediakan layanan perhitungan RAB dan manajemen proyek sipil.',
        'Mengirimkan notifikasi terkait status proyek dan pembaruan sistem.',
        'Personalisasi pengalaman pengguna berdasarkan riwayat proyek.',
        'Keperluan keamanan akun dan pencegahan penyalahgunaan.'
      ]
    },
    {
      title: 'Jaminan Keamanan Data',
      icon: Lock,
      content: [
        'Enkripsi End-to-End: Seluruh data sensitif dienkripsi menggunakan standar industri.',
        'Tanpa Pihak Ketiga: Kami menjamin tidak akan membagikan data Anda kepada pihak lain tanpa izin.',
        'Penyimpanan Aman: Data disimpan dalam server terproteksi tinggi dengan firewall berlapis.'
      ]
    },
    {
      title: 'Hak Pengguna Terhadap Data',
      icon: RefreshCw,
      content: [
        'Hak Akses: Anda berhak melihat data apa saja yang kami simpan.',
        'Hak Koreksi: Anda dapat mengubah atau memperbarui informasi akun kapan saja.',
        'Hak Penghapusan: Anda berhak meminta penghapusan permanen akun dan seluruh data terkait.'
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
          <ShieldCheck size={40} />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Kebijakan Privasi</h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Terakhir diperbarui: 31 Maret 2026. Kami berkomitmen untuk melindungi privasi dan keamanan data pengguna Sivilize Hub Pro.
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

      <div className="mt-16 glass-card p-8 border-primary/20 bg-primary/5 text-center">
        <h3 className="text-white font-bold mb-4">Butuh Informasi Lebih Lanjut?</h3>
        <p className="text-text-secondary text-sm mb-6">
          Jika Anda memiliki pertanyaan mengenai kebijakan privasi kami, jangan ragu untuk menghubungi tim support.
        </p>
        <button className="btn-primary inline-flex items-center gap-2">
          <Mail size={18} />
          Hubungi Tim Privasi
        </button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
