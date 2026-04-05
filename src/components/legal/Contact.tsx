import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  Send, 
  MessageSquare, 
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Headphones,
  Users
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSent(false), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      title: 'Email Support',
      desc: 'muhamadadrian210@gmail.com',
      icon: Mail,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: 'Developer Utama',
      desc: 'Muhamad Adrian',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      title: 'Hubungi Kami',
      desc: '081338219957',
      icon: Phone,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      title: 'Jam Operasional',
      desc: 'Senin - Jumat: 09:00 - 18:00 WIB',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <Headphones size={14} />
          <span>Layanan Bantuan</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Hubungi Kami</h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Ada pertanyaan, masukan, atau kendala teknis? Tim support kami siap membantu Anda membangun proyek konstruksi yang lebih baik.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {contactInfo.map((info, i) => (
            <div key={i} className="glass-card p-6 flex items-start gap-4 hover:border-primary/30 transition-all group">
              <div className={`p-3 ${info.bg} ${info.color} rounded-xl group-hover:scale-110 transition-transform`}>
                <info.icon size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">{info.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{info.desc}</p>
              </div>
            </div>
          ))}

          <div className="glass-card p-6 bg-primary/5 border-primary/20">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <HelpCircle size={20} className="text-primary" />
              Pusat Bantuan
            </h3>
            <p className="text-text-secondary text-xs mb-4">
              Cek dokumentasi kami untuk solusi instan terhadap masalah yang umum terjadi.
            </p>
            <button className="text-primary text-xs font-bold flex items-center gap-2 hover:underline">
              Buka Knowledge Base
              <Send size={12} />
            </button>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="glass-card p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <MessageSquare className="text-primary" />
              Kirim Pesan
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Alamat Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="budi@email.com"
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-text-secondary text-sm font-medium">Subjek</label>
                <input 
                  type="text" 
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Contoh: Masalah Login / Konsultasi Fitur"
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-text-secondary text-sm font-medium">Pesan Anda</label>
                <textarea 
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Tuliskan detail pertanyaan atau kendala Anda di sini..."
                  className="w-full bg-background border border-border rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || isSent}
                className={`w-full h-14 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
                  isSent 
                    ? 'bg-emerald-500 text-white shadow-glow-emerald' 
                    : 'bg-primary text-white hover:bg-primary-dark shadow-glow'
                } disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : isSent ? (
                  <>
                    <CheckCircle2 size={20} />
                    <span>Pesan Berhasil Terkirim!</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Kirim Sekarang</span>
                  </>
                )}
              </button>

              <div className="flex items-start gap-3 p-4 bg-background/50 border border-border rounded-xl">
                <AlertCircle size={18} className="text-text-secondary shrink-0 mt-0.5" />
                <p className="text-text-secondary text-xs leading-relaxed">
                  Tim kami biasanya merespons dalam waktu 1-2 hari kerja. Pastikan alamat email yang Anda masukkan valid untuk menerima balasan kami.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
