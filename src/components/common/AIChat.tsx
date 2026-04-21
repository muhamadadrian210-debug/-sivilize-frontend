import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, User, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `Kamu adalah Kiro, AI Assistant expert di SIVILIZE HUB PRO — platform RAB & Teknik Sipil Indonesia.

Keahlianmu:
- Perhitungan RAB (Rencana Anggaran Biaya) sesuai AHSP/SNI
- Permen PUPR No. 1 Tahun 2022
- Analisa Harga Satuan Pekerjaan (AHSP)
- Jenis pondasi & rekomendasi berdasarkan jenis tanah
- Material bangunan & harga pasar Indonesia
- K3 (Keselamatan & Kesehatan Kerja) proyek konstruksi
- Struktur bangunan, atap, MEP (Mekanikal, Elektrikal, Plumbing)

Gaya bicara: santai, pakai bahasa Indonesia, panggil user "Bro", jawaban singkat & to the point.
Kalau ditanya di luar konstruksi/RAB, tetap bantu tapi ingatkan fokus utama kamu adalah teknik sipil.`;

const callGemini = async (messages: Message[], userInput: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    // Fallback cerdas tanpa API key
    return getFallbackResponse(userInput);
  }

  // Build conversation history (max 10 pesan terakhir)
  const history = messages.slice(-10).map(m => ({
    role: m.sender === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userInput }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    // Handle quota exceeded
    if (response.status === 429) throw new Error('quota');
    throw new Error(`Gemini error: ${response.status} - ${errData?.error?.message || ''}`);
  }
  
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('empty_response');
  return text;
};

// Fallback response berbasis keyword — aktif saat API key tidak ada atau quota habis
const getFallbackResponse = (input: string): string => {
  const q = input.toLowerCase();

  if (q.includes('rab') || q.includes('rencana anggaran')) {
    return 'RAB (Rencana Anggaran Biaya) adalah dokumen estimasi biaya konstruksi. Di SIVILIZE HUB PRO, lo bisa generate RAB otomatis di menu **Kalkulator RAB** — tinggal input dimensi bangunan, sistem langsung hitung semua item sesuai AHSP/SNI. 🏗️';
  }
  if (q.includes('pondasi') || q.includes('fondasi')) {
    return 'Rekomendasi pondasi berdasarkan jenis tanah:\n• **Tanah keras** → Batu kali (paling ekonomis)\n• **Tanah sedang** → Footplate\n• **Tanah lunak** → Strauss pile\n• **Tanah gambut** → Tiang pancang (wajib)\n• **Tanah berbatu** → Batu kali / footplate\n\nDi Kalkulator RAB, pilih jenis tanah dan sistem otomatis rekomendasikan pondasi yang tepat!';
  }
  if (q.includes('beton') || q.includes('k-225') || q.includes('k225')) {
    return 'Komposisi Beton K-225 per m³ (AHSP SNI):\n• Semen PC: 371 kg\n• Pasir beton: 0.498 m³\n• Krikil/split: 0.776 m³\n• Air: 215 liter\n\nUpah tenaga kerja:\n• Pekerja: 1.65 OH\n• Tukang batu: 0.275 OH\n• Mandor: 0.083 OH\n\nHarga satuan ~Rp 1.3-1.5 juta/m³ tergantung lokasi.';
  }
  if (q.includes('bata') || q.includes('pasangan dinding')) {
    return 'Pasangan bata merah 1:4 per m²:\n• Bata merah: 70 buah\n• Semen PC: 11.5 kg\n• Pasir pasang: 0.043 m³\n\nUpah: Tukang batu 0.1 OH + Pekerja 0.3 OH\nProduktivitas: ~10 m²/hari per tim';
  }
  if (q.includes('ahsp') || q.includes('harga satuan')) {
    return 'AHSP (Analisa Harga Satuan Pekerjaan) adalah standar perhitungan biaya konstruksi Indonesia berdasarkan **Permen PUPR No.1/2022**.\n\nSetiap item pekerjaan punya koefisien material + upah tenaga kerja. Di SIVILIZE, lo bisa klik **"Lihat Komposisi AHSP"** di setiap item RAB untuk lihat detail lengkapnya!';
  }
  if (q.includes('kurva s') || q.includes('progress')) {
    return 'Kurva S adalah grafik progress rencana vs realisasi proyek. Fungsinya:\n• Laporan ke owner/bank\n• Deteksi keterlambatan lebih awal\n• Dasar klaim termin pembayaran\n\nDi SIVILIZE, isi tanggal mulai & selesai proyek, lalu update progress di Buku Harian — Kurva S otomatis terbentuk!';
  }
  if (q.includes('export') || q.includes('cetak') || q.includes('pdf') || q.includes('excel')) {
    return 'Cara cetak/export RAB:\n1. Klik tombol **"Cetak / Export"** di halaman RAB\n2. Preview ringkasan RAB muncul\n3. Isi nama perusahaan & estimator\n4. Pilih **Download PDF** atau **Download Excel**\n\nPDF sudah include kop surat, tanda tangan, dan nomor dokumen profesional!';
  }
  if (q.includes('harga') || q.includes('material') || q.includes('semen') || q.includes('besi')) {
    return 'Harga material di SIVILIZE sudah diupdate ke **2026** dan disesuaikan per provinsi:\n• Jawa: harga basis\n• Sumatera: +8-12%\n• Kalimantan: +15-28%\n• Papua Pegunungan: +85% (logistik udara)\n\nLo juga bisa override harga lokal sendiri di fitur Regional Price!';
  }
  if (q.includes('backup') || q.includes('restore') || q.includes('data hilang')) {
    return 'Untuk backup data:\n1. Buka **Profil** → tab **Backup & Restore**\n2. Klik **Export Semua Data**\n3. File JSON tersimpan di HP/PC lo\n\nUntuk restore: upload file JSON yang sama. Data tidak akan hilang meski ganti HP!';
  }
  if (q.includes('share') || q.includes('bagikan') || q.includes('klien')) {
    return 'Cara share RAB ke klien/owner:\n1. Buka proyek → klik **"Bagikan RAB"**\n2. Link read-only otomatis dibuat\n3. Kirim link ke klien via WA/email\n\nKlien bisa lihat RAB lengkap tanpa perlu daftar akun!';
  }
  if (q.includes('halo') || q.includes('hai') || q.includes('hi') || q.includes('hello')) {
    return 'Halo Bro! 👋 Gue Kiro, AI assistant SIVILIZE HUB PRO.\n\nGue bisa bantu lo dengan:\n• Perhitungan RAB & AHSP\n• Rekomendasi pondasi & material\n• Cara pakai fitur SIVILIZE\n• Pertanyaan seputar konstruksi\n\nMau tanya apa?';
  }
  if (q.includes('terima kasih') || q.includes('makasih') || q.includes('thanks')) {
    return 'Sama-sama Bro! 🙏 Kalau ada pertanyaan lain seputar RAB atau konstruksi, tanya aja. Semoga proyeknya lancar!';
  }

  return `Pertanyaan lo: "${input}"\n\nGue bisa bantu seputar:\n• **RAB & AHSP** — cara hitung, komposisi material\n• **Pondasi** — rekomendasi berdasarkan jenis tanah\n• **Material** — harga, spesifikasi, merek\n• **Fitur SIVILIZE** — cara pakai export, kurva S, backup\n• **Konstruksi umum** — beton, bata, atap, MEP\n\nCoba tanya lebih spesifik ya Bro! 💪`;
};

const AIChat = () => {
  useStore(); // keep store subscription
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Halo Bro! Gue Kiro, AI assistant SIVILIZE HUB PRO. Tanya apa aja seputar RAB, material, AHSP, pondasi, atau konstruksi — gue siap bantu! 🏗️',
      timestamp: new Date()
    }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');

    const userMsg: Message = { sender: 'user', text: userText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await callGemini(messages, userText);
      setMessages(prev => [...prev, { sender: 'ai', text: reply, timestamp: new Date() }]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : '';
      let fallbackText: string;
      
      if (errMsg === 'quota') {
        fallbackText = getFallbackResponse(userText);
      } else if (errMsg.includes('API key')) {
        fallbackText = getFallbackResponse(userText);
      } else {
        fallbackText = getFallbackResponse(userText);
      }
      
      setMessages(prev => [...prev, { sender: 'ai', text: fallbackText, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      sender: 'ai',
      text: 'Chat dibersihkan. Ada yang bisa gue bantu bro? 🏗️',
      timestamp: new Date()
    }]);
  };

  // Quick prompts
  const quickPrompts = [
    'Cara hitung RAB rumah 100m²?',
    'Pondasi apa untuk tanah lunak?',
    'Berapa harga beton K-225?',
    'Apa itu bowplank?',
  ];

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary-hover transition-all hover:scale-110 active:scale-95"
          title="Tanya Kiro AI"
        >
          <Sparkles size={22} className="text-white" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[60] w-[360px] md:w-96 h-[560px] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-orange-600">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Kiro AI</p>
                <p className="text-white/70 text-[10px]">
                  {import.meta.env.VITE_GEMINI_API_KEY ? 'Powered by Gemini • Expert Konstruksi' : 'Mode Offline • Expert Konstruksi'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearChat} className="text-white/70 hover:text-white transition-colors p-1" title="Hapus chat">
                <Trash2 size={15} />
              </button>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles size={13} className="text-primary" />
                  </div>
                )}
                <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-background border border-border text-white rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-border flex items-center justify-center shrink-0 mt-1">
                    <User size={13} className="text-text-secondary" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles size={13} className="text-primary" />
                </div>
                <div className="bg-background border border-border px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts — tampil kalau belum ada percakapan */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {quickPrompts.map((p, i) => (
                <button key={i} onClick={() => { setInput(p); inputRef.current?.focus(); }}
                  className="text-[11px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors">
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Tanya Kiro seputar RAB..."
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:border-primary outline-none transition-colors"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-40 active:scale-95"
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
