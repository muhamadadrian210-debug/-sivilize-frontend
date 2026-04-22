/**
 * Vision Service — Analisis gambar denah menggunakan Gemini Vision
 * Mengekstrak dimensi bangunan dari foto/gambar denah
 */

export interface DennahAnalysisResult {
  success: boolean;
  dimensions?: {
    panjang: number;
    lebar: number;
    tinggi: number;
  };
  wallLengths?: { sisi: string; panjang: number }[];
  floors?: number;
  rooms?: {
    bedroomCount: number;
    bathroomCount: number;
  };
  roofType?: string;
  notes?: string;
  rawText?: string;
  error?: string;
}

const GEMINI_PROMPT = `Kamu adalah ahli teknik sipil Indonesia. Analisis gambar denah/gambar teknik bangunan ini dan ekstrak informasi berikut dalam format JSON.

Jika ini adalah denah rumah/bangunan, ekstrak:
1. Dimensi utama bangunan (panjang × lebar dalam meter)
2. Tinggi bangunan per lantai (default 3m jika tidak terlihat)
3. Panjang setiap sisi dinding jika terlihat (Sisi Depan, Belakang, Kiri, Kanan)
4. Jumlah lantai
5. Jumlah kamar tidur dan kamar mandi
6. Tipe atap jika terlihat

Jawab HANYA dengan JSON format ini (tanpa markdown, tanpa penjelasan):
{
  "panjang": <angka dalam meter>,
  "lebar": <angka dalam meter>,
  "tinggi": <angka dalam meter, default 3>,
  "floors": <jumlah lantai, default 1>,
  "wallLengths": [
    {"sisi": "Depan", "panjang": <angka>},
    {"sisi": "Belakang", "panjang": <angka>},
    {"sisi": "Kiri", "panjang": <angka>},
    {"sisi": "Kanan", "panjang": <angka>}
  ],
  "bedroomCount": <angka>,
  "bathroomCount": <angka>,
  "roofType": "<1-air|2-air|3-air|4-air|dak>",
  "notes": "<catatan singkat tentang bangunan>"
}

Jika gambar bukan denah bangunan atau tidak bisa dianalisis, jawab:
{"error": "Gambar bukan denah bangunan yang valid"}`;

export async function analyzeDenah(imageFile: File): Promise<DennahAnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'API key Gemini tidak ditemukan' };
  }

  try {
    // Convert file to base64
    const base64 = await fileToBase64(imageFile);
    const mimeType = imageFile.type || 'image/jpeg';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: GEMINI_PROMPT },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                }
              }
            ]
          }],
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.1, // rendah = lebih konsisten
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return { success: false, error: `Gemini error: ${err.error?.message || response.statusText}` };
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON dari response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: 'Tidak bisa membaca hasil analisis', rawText };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (parsed.error) {
      return { success: false, error: parsed.error };
    }

    // Validasi nilai
    const panjang = Math.max(1, Math.min(500, Number(parsed.panjang) || 0));
    const lebar   = Math.max(1, Math.min(500, Number(parsed.lebar)   || 0));
    const tinggi  = Math.max(2, Math.min(10,  Number(parsed.tinggi)  || 3));
    const floors  = Math.max(1, Math.min(10,  Number(parsed.floors)  || 1));

    if (panjang === 0 || lebar === 0) {
      return { success: false, error: 'Dimensi bangunan tidak terdeteksi dari gambar' };
    }

    return {
      success: true,
      dimensions: { panjang, lebar, tinggi },
      wallLengths: parsed.wallLengths?.filter((w: { panjang: number }) => w.panjang > 0) || [],
      floors,
      rooms: {
        bedroomCount: Math.max(0, Number(parsed.bedroomCount) || 0),
        bathroomCount: Math.max(0, Number(parsed.bathroomCount) || 0),
      },
      roofType: parsed.roofType || '2-air',
      notes: parsed.notes || '',
      rawText,
    };
  } catch (err) {
    return { success: false, error: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (data:image/jpeg;base64,)
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
