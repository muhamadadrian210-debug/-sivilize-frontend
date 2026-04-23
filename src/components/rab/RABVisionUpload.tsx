/**
 * RABVisionUpload — Upload denah & analisis pakai Gemini Vision
 * Komponen terpisah biar ga ngerusak RABCalculator
 */
import { useState } from 'react';
import { Sparkles, Upload, X } from 'lucide-react';
import { type Project } from '../../store/useStore';

interface RABVisionUploadProps {
  onResult: (data: {
    dimensions: { length: number; width: number; height: number };
    floors?: number;
    bedroomCount?: number;
    bathroomCount?: number;
    roofModel?: Project['roofModel'];
    notes?: string;
  }) => void;
  onClose: () => void;
}

const RABVisionUpload = ({ onResult, onClose }: RABVisionUploadProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError('API key Gemini belum diset. Tambahkan VITE_GEMINI_API_KEY di Vercel.');
      return;
    }

    setError('');
    setProgress(10);
    setStatus('Memuat gambar...');

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setProgress(30);
      setStatus('Gemini AI lagi baca denah lu...');

      const prompt = `Kamu ahli teknik sipil Indonesia. Analisis gambar denah/gambar teknik ini.
Jawab HANYA dengan JSON (tanpa markdown):
{
  "panjang": <meter>,
  "lebar": <meter>,
  "tinggi": <meter, default 3>,
  "floors": <jumlah lantai, default 1>,
  "bedroomCount": <kamar tidur>,
  "bathroomCount": <kamar mandi>,
  "roofType": "<1-air|2-air|3-air|4-air|dak>",
  "notes": "<catatan singkat>"
}
Kalau bukan denah: {"error": "bukan denah"}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: file.type || 'image/jpeg', data: base64 } }] }],
            generationConfig: { maxOutputTokens: 512, temperature: 0.1 },
          }),
        }
      );

      setProgress(80);
      setStatus('Hampir selesai...');

      if (!res.ok) throw new Error('Gemini API error: ' + res.statusText);

      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Respons AI tidak valid');

      const parsed = JSON.parse(match[0]);
      if (parsed.error) throw new Error(parsed.error);

      const panjang = Math.max(1, Math.min(500, Number(parsed.panjang) || 0));
      const lebar   = Math.max(1, Math.min(500, Number(parsed.lebar)   || 0));
      const tinggi  = Math.max(2, Math.min(10,  Number(parsed.tinggi)  || 3));

      if (!panjang || !lebar) throw new Error('Dimensi tidak terdeteksi dari gambar');

      setProgress(100);
      setStatus('Berhasil!');

      setTimeout(() => {
        onResult({
          dimensions: { length: panjang, width: lebar, height: tinggi },
          floors: Math.max(1, Math.min(10, Number(parsed.floors) || 1)),
          bedroomCount: Number(parsed.bedroomCount) || undefined,
          bathroomCount: Number(parsed.bathroomCount) || undefined,
          roofModel: parsed.roofType as Project['roofModel'],
          notes: parsed.notes,
        });
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal analisis gambar');
      setProgress(0);
      setStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={progress > 0 ? undefined : onClose} />
      <div className="relative glass-card w-full max-w-lg p-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            AI Vision — Baca Denah Otomatis
          </h3>
          {progress === 0 && (
            <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <p className="text-text-secondary text-xs">
          Upload foto denah, tampak depan/samping, atau gambar teknik. Gemini AI bakal baca dimensinya otomatis.
        </p>

        {/* Upload area */}
        <label className={`block border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${progress > 0 ? 'opacity-50 pointer-events-none border-border' : 'border-border hover:border-primary/50 cursor-pointer'}`}>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <Upload size={32} className="mx-auto text-primary mb-3" />
          <p className="text-text-secondary text-sm">Klik atau drag gambar ke sini</p>
          <p className="text-text-secondary text-xs mt-1 opacity-60">JPG, PNG — denah, tampak depan/samping</p>
        </label>

        {/* Progress */}
        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-text-secondary">
              <span>{status}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs">
            {error}
          </div>
        )}

        <button onClick={onClose} className="w-full text-center text-xs text-text-secondary hover:text-white transition-colors">
          Isi manual aja
        </button>
      </div>
    </div>
  );
};

export default RABVisionUpload;
