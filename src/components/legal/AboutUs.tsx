import { 
  Building2, 
  Target, 
  Users, 
  Rocket, 
  Cpu,
  Trophy,
  History,
  Layout
} from 'lucide-react';

const AboutUs = () => {
  const values = [
    {
      title: 'Visi Kami',
      icon: Target,
      desc: 'Menjadi standar global dalam otomatisasi teknik sipil yang menghubungkan ide dan realisasi konstruksi dengan presisi tinggi.'
    },
    {
      title: 'Misi Kami',
      icon: Rocket,
      desc: 'Memberdayakan insinyur sipil dengan teknologi AI untuk meningkatkan efisiensi biaya, waktu, dan kualitas proyek.'
    },
    {
      title: 'Inovasi AI',
      icon: Cpu,
      desc: 'Mengintegrasikan kecerdasan buatan dalam analisis denah dan estimasi AHSP secara otomatis.'
    },
    {
      title: 'Komunitas Terpadu',
      icon: Users,
      desc: 'Membangun ekosistem yang mendukung kolaborasi antara profesional konstruksi di seluruh Indonesia.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      {/* Hero Section */}
      <div className="text-center mb-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
          <History size={14} />
          <span>Sejarah & Evolusi</span>
        </div>
        <h1 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight">
          Merevolusi <span className="text-primary">Teknik Sipil</span><br />
          Melalui Kekuatan Teknologi
        </h1>
        <p className="text-text-secondary text-lg max-w-3xl mx-auto leading-relaxed">
          Sivilize Hub Pro lahir dari kebutuhan akan alat yang lebih cerdas, cepat, dan akurat dalam perencanaan konstruksi. Kami menggabungkan pengalaman teknik sipil konvensional dengan inovasi perangkat lunak modern.
        </p>
      </div>

      {/* Description Grid */}
      <div className="grid md:grid-cols-2 gap-12 mb-24">
        <div className="glass-card p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all" />
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Layout className="text-primary" />
            Platform Terpadu
          </h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            Sivilize Hub Pro bukan sekadar kalkulator RAB. Ini adalah pusat ekosistem bagi insinyur sipil untuk mengelola seluruh aspek proyek dalam satu dashboard yang intuitif dan profesional.
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-black text-white">38</div>
              <div className="text-xs text-text-secondary uppercase">Provinsi</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-black text-white">5k+</div>
              <div className="text-xs text-text-secondary uppercase">Data AHSP</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-black text-white">AI</div>
              <div className="text-xs text-text-secondary uppercase">Powered</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all" />
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Trophy className="text-primary" />
            Tujuan Utama
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Tujuan kami adalah meminimalisir kesalahan manusia dalam estimasi biaya (RAB), mengoptimalkan penggunaan material, dan memastikan setiap proyek konstruksi berjalan sesuai jadwal melalui sistem monitoring yang canggih.
          </p>
        </div>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {values.map((v, i) => (
          <div key={i} className="text-center p-6 rounded-2xl border border-border hover:border-primary/50 transition-all bg-card/30">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary group-hover:scale-110 transition-transform">
              <v.icon size={24} />
            </div>
            <h3 className="text-white font-bold mb-2">{v.title}</h3>
            <p className="text-text-secondary text-xs leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-24 p-12 bg-gradient-to-br from-primary/20 via-background to-background rounded-3xl border border-primary/20 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 blur-3xl pointer-events-none" />
        <h2 className="text-3xl font-black text-white mb-6 relative z-10">Membangun Masa Depan Peradaban</h2>
        <p className="text-text-secondary mb-10 relative z-10 max-w-xl mx-auto">
          Sivilize Hub Pro - Dikembangkan oleh <span className="text-primary font-bold">Muhamad Adrian</span> untuk kemajuan infrastruktur bangsa.
        </p>
        <div className="flex justify-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-primary">
            <Building2 size={24} />
          </div>
          <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-primary">
            <Target size={24} />
          </div>
          <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-primary">
            <Rocket size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
