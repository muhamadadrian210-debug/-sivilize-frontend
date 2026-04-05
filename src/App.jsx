import React, { useState, useRef, useEffect } from 'react';
import { LogoCivil, LogoBlueprint, LogoStructural, LogoBridge } from './components/LogoCivil';
import LogoSelector from './components/LogoSelector';
import { useLanguage } from './hooks/useLanguage';
import { getAIService } from './services/aiService';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import Pricing from './components/Pricing';
import Analytics from './components/Analytics';

// API Base URL - Production Ready (dari environment variable)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for fetch with timeout
const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Test connection to backend - Silent mode with retry
const testConnection = async (retryCount = 0) => {
  const maxRetries = 2;
  
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetchWithTimeout(
      (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', ''),
      { 
        headers,
        mode: 'cors'
      },
      3000 // 3 second timeout
    );
    
    // Silent success - no console log
    return response.ok;
  } catch (error) {
    // Silent retry if failed and haven't exceeded max retries
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return testConnection(retryCount + 1);
    }
    // Silent failure - no console log
    return false;
  }
};

// Save project to backend - Silent mode
const saveProjectToBackend = async (rabData) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const projectData = {
      namaProyek: projectForm.namaProyek || `Project ${new Date().toLocaleDateString('id-ID')}`,
      lokasi: projectForm.lokasi || 'Unknown',
      luasBangunan: projectForm.luasBangunan,
      tipeRumah: projectForm.tipeRumah,
      provinsi: projectForm.provinsi,
      rabData: rabData,
      createdAt: new Date().toISOString()
    };

    await fetchWithTimeout(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(projectData)
    }, 3000); // 3 second timeout

    // Silent success - no console log
    return;
  } catch (error) {
    // Silent failure - no console log
    return;
  }
};

// Check authentication
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// ========================================
// BACKEND LOGIC - GROUPED STRUCTURE WAJIB
// ========================================

// 1. classifyKategori(namaPekerjaan) - WAJIB case-insensitive
const classifyKategori = (namaPekerjaan) => {
  if (!namaPekerjaan || typeof namaPekerjaan !== 'string') {
    return 'Lain-lain';
  }

  const namaLower = namaPekerjaan.toLowerCase();
  
  // Struktur
  if (namaLower.includes('galian') || namaLower.includes('tanah') || 
      namaLower.includes('pondasi') || namaLower.includes('batu') || 
      namaLower.includes('beton') || namaLower.includes('besian') || 
      namaLower.includes('pembesian') || namaLower.includes('kolom') || 
      namaLower.includes('balok') || namaLower.includes('sloof') || 
      namaLower.includes('plat') || namaLower.includes('struktur') || 
      namaLower.includes('cor')) {
    return 'Struktur';
  }
  
  // Dinding
  if (namaLower.includes('dinding') || namaLower.includes('bata') || 
      namaLower.includes('plester') || namaLower.includes('plesteran') || 
      namaLower.includes('pasangan') || namaLower.includes('aci') || 
      namaLower.includes('acian') || namaLower.includes('tembok')) {
    return 'Dinding';
  }
  
  // Lantai
  if (namaLower.includes('lantai') || namaLower.includes('keramik') || 
      namaLower.includes('penutup') || namaLower.includes('flooring') || 
      namaLower.includes('granit') || namaLower.includes('marmer') || 
      namaLower.includes('vinyl')) {
    return 'Lantai';
  }
  
  // Finishing (mencakup semua finishing termasuk bukaan, atap, plumbing, listrik, persiapan)
  if (namaLower.includes('cat') || namaLower.includes('pengecatan') || 
      namaLower.includes('finishing') || namaLower.includes('coating') || 
      namaLower.includes('plafond') || namaLower.includes('ceiling') ||
      namaLower.includes('pintu') || namaLower.includes('jendela') || 
      namaLower.includes('kusen') || namaLower.includes('daun') || 
      namaLower.includes('frame') || namaLower.includes('bukaan') ||
      namaLower.includes('atap') || namaLower.includes('genteng') || 
      namaLower.includes('rangka') || namaLower.includes('kayu') || 
      namaLower.includes('talang') || namaLower.includes('roof') ||
      namaLower.includes('air') || namaLower.includes('plumbing') || 
      namaLower.includes('pipa') || namaLower.includes('drainase') || 
      namaLower.includes('sanitair') || namaLower.includes('wastafel') ||
      namaLower.includes('listrik') || namaLower.includes('electrical') || 
      namaLower.includes('kabel') || namaLower.includes('instalasi') || 
      namaLower.includes('lampu') ||
      namaLower.includes('pembersihan') || namaLower.includes('persiapan') || 
      namaLower.includes('pengukuran') || namaLower.includes('penandaan') || 
      namaLower.includes('clearing') || namaLower.includes('setup')) {
    return 'Finishing';
  }
  
  // Default
  return 'Lain-lain';
};

// 2. transformToGrouped(dataFlat) - WAJIB
const transformToGrouped = (dataFlat) => {
  if (!Array.isArray(dataFlat)) {
    throw new Error('ERROR: Input harus array, bukan ' + typeof dataFlat);
  }

  // Initialize grouped structure dengan 4 kategori utama
  const groupedData = {};
  const kategoriList = [
    'Struktur',
    'Dinding',
    'Lantai',
    'Finishing',
    'Lain-lain'
  ];

  // Initialize empty buckets
  kategoriList.forEach(kategori => {
    groupedData[kategori] = {
      kategori: kategori,
      items: [],
      subtotal: 0
    };
  });

  // Process each item
  dataFlat.forEach((item, index) => {
    if (!item || !item.uraian) {
      console.warn('WARNING: Item invalid di index', index);
      return;
    }

    // Auto-classify
    const kategori = classifyKategori(item.uraian);
    
    // Calculate total
    const volume = parseFloat(item.volume) || 0;
    const hargaSatuan = parseFloat(item.harga_satuan) || 0;
    const total = volume * hargaSatuan;

    // Add to category
    groupedData[kategori].items.push({
      no: groupedData[kategori].items.length + 1,
      uraian: item.uraian,
      volume: volume,
      satuan: item.satuan || 'unit',
      harga_satuan: hargaSatuan,
      total: total
    });

    // Update subtotal
    groupedData[kategori].subtotal += total;
  });

  return groupedData;
};

// 3. hitungSubtotal(groupedData) - WAJIB
const hitungSubtotal = (groupedData) => {
  if (!groupedData || typeof groupedData !== 'object') {
    throw new Error('ERROR: Input harus object grouped structure');
  }

  let subtotalPerKategori = {};
  
  Object.keys(groupedData).forEach(kategori => {
    const dataKategori = groupedData[kategori];
    if (!dataKategori.items || !Array.isArray(dataKategori.items)) {
      throw new Error(`ERROR: Kategori ${kategori} tidak memiliki items array`);
    }
    
    // Hitung subtotal
    subtotalPerKategori[kategori] = dataKategori.items.reduce((sum, item) => {
      return sum + (parseFloat(item.total) || 0);
    }, 0);
    
    // Update subtotal di groupedData
    dataKategori.subtotal = subtotalPerKategori[kategori];
  });

  return subtotalPerKategori;
};

// 4. hitungGrandTotal(groupedData) - WAJIB
const hitungGrandTotal = (groupedData) => {
  if (!groupedData || typeof groupedData !== 'object') {
    throw new Error('ERROR: Input harus object grouped structure');
  }

  let grandTotal = 0;
  
  Object.keys(groupedData).forEach(kategori => {
    const dataKategori = groupedData[kategori];
    if (dataKategori.subtotal) {
      grandTotal += parseFloat(dataKategori.subtotal) || 0;
    }
  });

  return grandTotal;
};

// 5. VALIDATION - WAJIB
const validateGroupedStructure = (groupedData) => {
  const errors = [];

  // Check if it's object (not array/flat)
  if (!groupedData || typeof groupedData !== 'object') {
    errors.push('ERROR: Data harus object grouped structure, bukan flat list/array');
  }

  // Check if has categories
  if (Object.keys(groupedData).length === 0) {
    errors.push('ERROR: Tidak ada kategori dalam grouped structure');
  }

  // Check each category
  Object.keys(groupedData).forEach(kategori => {
    const data = groupedData[kategori];
    
    if (!data.items || !Array.isArray(data.items)) {
      errors.push(`ERROR: Kategori ${kategori} tidak memiliki items array`);
    }
    
    if (typeof data.subtotal !== 'number') {
      errors.push(`ERROR: Kategori ${kategori} tidak memiliki subtotal valid`);
    }
  });

  // Check grand total
  const grandTotal = hitungGrandTotal(groupedData);
  if (grandTotal <= 0) {
    errors.push('ERROR: Grand total harus lebih dari 0');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// 6. MAIN FUNCTION - Generate RAB Grouped dengan 4 Kategori
const generateRABGrouped = (luas, tipeRumah, provinsi) => {
  try {
    // Create flat data dengan semua item pekerjaan
    const flatData = [
      // Struktur
      { uraian: 'Galian Tanah untuk Pondasi', volume: luas * 0.3, satuan: 'm³', harga_satuan: 75000 },
      { uraian: 'Urugan Pasir', volume: luas * 0.2, satuan: 'm³', harga_satuan: 45000 },
      { uraian: 'Pemadatan Tanah', volume: luas * 0.3, satuan: 'm³', harga_satuan: 35000 },
      { uraian: 'Pondasi Batu Kosong', volume: luas * 0.15, satuan: 'm³', harga_satuan: 85000 },
      { uraian: 'Sloof Beton Bertulang', volume: luas * 0.05, satuan: 'm³', harga_satuan: 90000 },
      { uraian: 'Kolom Beton Bertulang', volume: luas * 0.08, satuan: 'm³', harga_satuan: 95000 },
      { uraian: 'Balok Beton Bertulang', volume: luas * 0.12, satuan: 'm³', harga_satuan: 90000 },
      { uraian: 'Plat Lantai Beton', volume: luas, satuan: 'm²', harga_satuan: 75000 },
      { uraian: 'Pembesian', volume: luas * 80, satuan: 'kg', harga_satuan: 25000 },
      
      // Dinding
      { uraian: 'Pasangan Bata Merah', volume: luas * 3.5, satuan: 'm²', harga_satuan: 65000 },
      { uraian: 'Plesteran Dinding', volume: luas * 3.5, satuan: 'm²', harga_satuan: 40000 },
      { uraian: 'Acian Dinding', volume: luas * 3.5, satuan: 'm²', harga_satuan: 30000 },
      
      // Lantai
      { uraian: 'Keramik Lantai', volume: luas, satuan: 'm²', harga_satuan: 50000 },
      { uraian: 'Granit Lantai', volume: luas * 0.5, satuan: 'm²', harga_satuan: 120000 },
      
      // Finishing (mencakup semua finishing work)
      { uraian: 'Pembersihan Lokasi Proyek', volume: luas * 0.1, satuan: 'm²', harga_satuan: 50000 },
      { uraian: 'Pengecatan Interior', volume: luas * 3.5, satuan: 'm²', harga_satuan: 30000 },
      { uraian: 'Pengecatan Exterior', volume: luas * 2, satuan: 'm²', harga_satuan: 35000 },
      { uraian: 'Cat Plafond', volume: luas, satuan: 'm²', harga_satuan: 25000 },
      { uraian: 'Kusen Pintu Kayu', volume: 2, satuan: 'unit', harga_satuan: 1200000 },
      { uraian: 'Daun Pintu Utama', volume: 2, satuan: 'unit', harga_satuan: 800000 },
      { uraian: 'Kusen Jendela Kayu', volume: 3, satuan: 'unit', harga_satuan: 850000 },
      { uraian: 'Daun Jendela', volume: 3, satuan: 'unit', harga_satuan: 600000 },
      { uraian: 'Rangka Atap Kayu', volume: luas, satuan: 'm²', harga_satuan: 25000 },
      { uraian: 'Penutup Genteng Beton', volume: luas, satuan: 'm²', harga_satuan: 45000 },
      { uraian: 'Talang Beton', volume: luas * 0.5, satuan: 'm', harga_satuan: 35000 },
      { uraian: 'Instalasi Air Bersih', volume: luas * 0.1, satuan: 'm', harga_satuan: 30000 },
      { uraian: 'Instalasi Air Kotor', volume: luas * 0.1, satuan: 'm', harga_satuan: 35000 },
      { uraian: 'Instalasi Listrik', volume: 5, satuan: 'titik', harga_satuan: 55000 }
    ];

    // Transform to grouped structure
    const groupedData = transformToGrouped(flatData);
    
    // Calculate subtotals
    hitungSubtotal(groupedData);
    
    // Calculate grand total
    const grandTotal = hitungGrandTotal(groupedData);
    
    // VALIDATION - WAJIB
    const validation = validateGroupedStructure(groupedData);
    if (!validation.isValid) {
      console.error('VALIDATION ERROR:', validation.errors);
      throw new Error('ERROR: Grouped structure validation failed: ' + validation.errors.join(', '));
    }

    // Return grouped structure
    return {
      groupedRAB: groupedData,
      grandTotal: grandTotal,
      totalPPN: grandTotal * 0.11,
      totalProfit: grandTotal * 0.15,
      grandTotalFinal: grandTotal * 1.31,
      validation: validation
    };

  } catch (error) {
    console.error('ERROR: Generate RAB Grouped failed:', error.message);
    throw new Error('ERROR: Gagal generate RAB dengan grouped structure - ' + error.message);
  }
};
const KATEGORI_PEKERJAAN = {
  'Pekerjaan Persiapan': {
    keywords: ['pembersihan', 'persiapan', 'pengukuran', 'penandaan', 'clearing', 'setup'],
    items: []
  },
  'Pekerjaan Struktur': {
    keywords: ['galian', 'tanah', 'pondasi', 'batu', 'beton', 'besian', 'pembesian', 'kolom', 'balok', 'sloof', 'plat', 'struktur', 'cor'],
    items: []
  },
  'Pekerjaan Dinding & Plester': {
    keywords: ['dinding', 'bata', 'plester', 'plesteran', 'pasangan', 'aci', 'acian', 'tembok'],
    items: []
  },
  'Pekerjaan Lantai & Penutup': {
    keywords: ['lantai', 'keramik', 'penutup', 'flooring', 'granit', 'marmer', 'vinyl'],
    items: []
  },
  'Pekerjaan Finishing': {
    keywords: ['cat', 'pengecatan', 'finishing', 'coating', 'plafond', 'ceiling'],
    items: []
  },
  'Pekerjaan Bukaan': {
    keywords: ['pintu', 'jendela', 'kusen', 'daun', 'frame', 'bukaan'],
    items: []
  },
  'Pekerjaan Atap': {
    keywords: ['atap', 'genteng', 'rangka', 'kayu', 'talang', 'roof'],
    items: []
  },
  'Pekerjaan Plumbing': {
    keywords: ['air', 'plumbing', 'pipa', 'drainase', 'sanitair', 'wastafel'],
    items: []
  },
  'Pekerjaan Listrik': {
    keywords: ['listrik', 'electrical', 'kabel', 'instalasi', 'lampu'],
    items: []
  },
  'Lain-lain': {
    keywords: [],
    items: []
  }
};

// Fungsi mengkategorikan pekerjaan otomatis
const kategorikanPekerjaan = (namaPekerjaan) => {
  const namaLower = namaPekerjaan.toLowerCase();
  
  for (const [kategori, data] of Object.entries(KATEGORI_PEKERJAAN)) {
    if (kategori === 'Lain-lain') continue;
    
    for (const keyword of data.keywords) {
      if (namaLower.includes(keyword)) {
        return kategori;
      }
    }
  }
  
  return 'Lain-lain';
};

// Database item pekerjaan standar
const DATABASE_PEKERJAAN = [
  // Pekerjaan Persiapan
  { nama: 'Pembersihan Lokasi Proyek', satuan: 'm²', harga: 50000, deskripsi: 'Clearing dan persiapan area' },
  { nama: 'Pengukuran dan Penandaan', satuan: 'm²', harga: 25000, deskripsi: 'Survey dan marking' },
  { nama: 'Pembuatan Papan Proyek', satuan: 'unit', harga: 500000, deskripsi: 'Papan nama proyek' },
  
  // Pekerjaan Struktur
  { nama: 'Galian Tanah untuk Pondasi', satuan: 'm³', harga: 75000, deskripsi: 'Excavation pondasi' },
  { nama: 'Urugan Pasir', satuan: 'm³', harga: 45000, deskripsi: 'Sand backfill' },
  { nama: 'Pemadatan Tanah', satuan: 'm³', harga: 35000, deskripsi: 'Soil compaction' },
  { nama: 'Pondasi Batu Kosong', satuan: 'm³', harga: 85000, deskripsi: 'Stone foundation 1:3:5' },
  { nama: 'Foot Plate Beton', satuan: 'm³', harga: 95000, deskripsi: 'Concrete foot plate' },
  { nama: 'Sloof Beton Bertulang', satuan: 'm³', harga: 90000, deskripsi: 'Reinforced concrete beam' },
  { nama: 'Kolom Beton Bertulang', satuan: 'm³', harga: 95000, deskripsi: 'Reinforced concrete column' },
  { nama: 'Balok Beton Bertulang', satuan: 'm³', harga: 90000, deskripsi: 'Reinforced concrete beam' },
  { nama: 'Plat Lantai Beton', satuan: 'm²', harga: 75000, deskripsi: 'Concrete slab' },
  { nama: 'Pembesian', satuan: 'kg', harga: 25000, deskripsi: 'Steel reinforcement' },
  
  // Pekerjaan Dinding & Plester
  { nama: 'Pasangan Bata Merah', satuan: 'm²', harga: 65000, deskripsi: 'Brick wall 1:2:10' },
  { nama: 'Plesteran Dinding', satuan: 'm²', harga: 40000, deskripsi: 'Wall plastering 1:3' },
  { nama: 'Acian Dinding', satuan: 'm²', harga: 30000, deskripsi: 'Wall finishing' },
  
  // Pekerjaan Lantai & Penutup
  { nama: 'Keramik Lantai', satuan: 'm²', harga: 50000, deskripsi: 'Ceramic flooring' },
  { nama: 'Granit Lantai', satuan: 'm²', harga: 120000, deskripsi: 'Granite flooring' },
  { nama: 'Penutup Lantai Vinyl', satuan: 'm²', harga: 35000, deskripsi: 'Vinyl flooring' },
  
  // Pekerjaan Finishing
  { nama: 'Pengecatan Interior', satuan: 'm²', harga: 30000, deskripsi: 'Interior painting' },
  { nama: 'Pengecatan Exterior', satuan: 'm²', harga: 35000, deskripsi: 'Exterior painting' },
  { nama: 'Cat Plafond', satuan: 'm²', harga: 25000, deskripsi: 'Ceiling painting' },
  
  // Pekerjaan Bukaan
  { nama: 'Kusen Pintu Kayu', satuan: 'unit', harga: 1200000, deskripsi: 'Wood door frame' },
  { nama: 'Daun Pintu Utama', satuan: 'unit', harga: 800000, deskripsi: 'Main door' },
  { nama: 'Kusen Jendela Kayu', satuan: 'unit', harga: 850000, deskripsi: 'Wood window frame' },
  { nama: 'Daun Jendela', satuan: 'unit', harga: 600000, deskripsi: 'Window sash' },
  
  // Pekerjaan Atap
  { nama: 'Rangka Atap Kayu', satuan: 'm²', harga: 25000, deskripsi: 'Wood roof frame' },
  { nama: 'Penutup Genteng Beton', satuan: 'm²', harga: 45000, deskripsi: 'Concrete roof tiles' },
  { nama: 'Talang Beton', satuan: 'm', harga: 35000, deskripsi: 'Concrete gutter' },
  
  // Pekerjaan Plumbing
  { nama: 'Instalasi Air Bersih', satuan: 'm', harga: 30000, deskripsi: 'Clean water installation' },
  { nama: 'Instalasi Air Kotor', satuan: 'm', harga: 35000, deskripsi: 'Wastewater installation' },
  
  // Pekerjaan Listrik
  { nama: 'Instalasi Listrik', satuan: 'titik', harga: 55000, deskripsi: 'Electrical installation' }
];

// Fungsi generate RAB dengan grouping otomatis
const generateRABGrouped = (luas, tipeRumah, provinsi) => {
  // Reset kategori
  Object.keys(KATEGORI_PEKERJAAN).forEach(kategori => {
    KATEGORI_PEKERJAAN[kategori].items = [];
  });

  // Generate volume dan masukkan ke kategori
  const volumeCalculator = {
    'Pembersihan Lokasi Proyek': luas * 0.1,
    'Pengukuran dan Penandaan': luas * 0.05,
    'Pembuatan Papan Proyek': 1,
    'Galian Tanah untuk Pondasi': luas * 0.3,
    'Urugan Pasir': luas * 0.2,
    'Pemadatan Tanah': luas * 0.3,
    'Pondasi Batu Kosong': luas * 0.15,
    'Foot Plate Beton': luas * 0.05,
    'Sloof Beton Bertulang': luas * 0.05,
    'Kolom Beton Bertulang': luas * 0.08,
    'Balok Beton Bertulang': luas * 0.12,
    'Plat Lantai Beton': luas,
    'Pembesian': luas * 80, // kg per m²
    'Pasangan Bata Merah': luas * 3.5,
    'Plesteran Dinding': luas * 3.5,
    'Acian Dinding': luas * 3.5,
    'Keramik Lantai': luas,
    'Pengecatan Interior': luas * 3.5,
    'Pengecatan Exterior': luas * 2,
    'Cat Plafond': luas,
    'Kusen Pintu Kayu': 2,
    'Daun Pintu Utama': 2,
    'Kusen Jendela Kayu': 3,
    'Daun Jendela': 3,
    'Rangka Atap Kayu': luas,
    'Penutup Genteng Beton': luas,
    'Talang Beton': luas * 0.5,
    'Instalasi Air Bersih': luas * 0.1,
    'Instalasi Air Kotor': luas * 0.1,
    'Instalasi Listrik': 5
  };

  // Masukkan item ke kategori otomatis
  DATABASE_PEKERJAAN.forEach(item => {
    const kategori = kategorikanPekerjaan(item.nama);
    const volume = volumeCalculator[item.nama] || 1;
    const total = volume * item.harga;
    
    KATEGORI_PEKERJAAN[kategori].items.push({
      no: KATEGORI_PEKERJAAN[kategori].items.length + 1,
      uraian: item.nama,
      volume: volume,
      satuan: item.satuan,
      hargaSatuan: item.harga,
      total: total,
      deskripsi: item.deskripsi
    });
  });

  // Hitung subtotal per kategori
  const hasilRAB = {};
  let grandTotal = 0;

  Object.keys(KATEGORI_PEKERJAAN).forEach(kategori => {
    const subtotal = KATEGORI_PEKERJAAN[kategori].items.reduce((sum, item) => sum + item.total, 0);
    hasilRAB[kategori] = {
      items: KATEGORI_PEKERJAAN[kategori].items,
      subtotal: subtotal
    };
    grandTotal += subtotal;
  });

  return {
    groupedRAB: hasilRAB,
    grandTotal: grandTotal,
    totalPPN: grandTotal * 0.11,
    totalProfit: grandTotal * 0.15,
    grandTotalFinal: grandTotal * 1.31
  };
};
const MATERIAL_KOEFISIEN = {
  semen: { berat: 50, satuan: 'sak' }, // 50kg per sak
  pasir: { volume: 1, satuan: 'm³' },
  batu: { volume: 1, satuan: 'm³' },
  besi: { berat: 1, satuan: 'kg' },
  kayu: { volume: 1, satuan: 'm³' },
  genteng: { satuan: 'bij' },
  keramik: { satuan: 'm²' },
  cat: { volume: 5, satuan: 'liter' },
  kusen: { satuan: 'unit' }
};

// Koefisien Material per Pekerjaan
const KOEFISIEN_MATERIAL = {
  pembersihanLahan: {
    alat: ['Cangkul', 'Sekop', 'Garpu'],
    upah: 50000,
    keterangan: 'Pembersihan rumput, sampah, dan persiapan lahan'
  },
  pekerjaanTanah: {
    galian: {
      semen: 0, pasir: 0, batu: 0, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 50000,
      keterangan: 'Galian tanah untuk pondasi dan jalur'
    },
    urugan: {
      semen: 0, pasir: 1.2, batu: 0, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 45000,
      keterangan: 'Urugan pasir untuk lantai dan halaman'
    },
    pemadatan: {
      semen: 0, pasir: 0, batu: 0, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 35000,
      keterangan: 'Pemadatan tanah dengan mesin stamper'
    }
  },
  pekerjaanPondasi: {
    batuKosong: {
      semen: 0.15, pasir: 0.65, batu: 1.2, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 75000,
      keterangan: 'Pondasi batu kosong 1:3:5'
    },
    footPlate: {
      semen: 0.35, pasir: 0.7, batu: 1.0, besi: 25, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 85000,
      keterangan: 'Foot plate beton bertulang'
    },
    sloof: {
      semen: 0.33, pasir: 0.67, batu: 0, besi: 30, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 90000,
      keterangan: 'Sloof beton bertulang'
    }
  },
  pekerjaanStruktur: {
    kolom: {
      semen: 0.35, pasir: 0.67, batu: 0, besi: 120, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 95000,
      keterangan: 'Kolom struktur 15x15cm'
    },
    balok: {
      semen: 0.33, pasir: 0.67, batu: 0, besi: 110, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 90000,
      keterangan: 'Balok beton bertulang'
    },
    plat: {
      semen: 0.30, pasir: 0.60, batu: 0, besi: 80, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 75000,
      keterangan: 'Plat lantai beton 12cm'
    }
  },
  pekerjaanDinding: {
    pasanganBata: {
      semen: 0.08, pasir: 0.77, batu: 0.15, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 65000,
      keterangan: 'Pasangan bata merah 1:2:10'
    },
    plesteran: {
      semen: 0.25, pasir: 0.75, batu: 0, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 40000,
      keterangan: 'Plesteran dinding 1:3'
    },
    acian: {
      semen: 0.15, pasir: 0, batu: 0, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 30000,
      keterangan: 'Acian halus finish'
    }
  },
  pekerjaanAtap: {
    rangka: {
      semen: 0, pasir: 0, batu: 0, besi: 0, kayu: 0.15, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 25000,
      keterangan: 'Rangka atap kayu kelas 1'
    },
    genteng: {
      semen: 0.02, pasir: 0.15, batu: 0, besi: 0, kayu: 0, genteng: 15, keramik: 0, cat: 0, kusen: 0,
      upah: 45000,
      keterangan: 'Genteng beton flat'
    },
    talang: {
      semen: 0.1, pasir: 0.3, batu: 0, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 35000,
      keterangan: 'Talang beton precast'
    }
  },
  pekerjaanPlumbing: {
    airBersih: {
      semen: 0, pasir: 0, batu: 0, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 30000,
      keterangan: 'Instalasi pipa PVC 1/2" - 4"'
    },
    airKotor: {
      semen: 0, pasir: 0, batu: 0, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 35000,
      keterangan: 'Instalasi pipa PVC 3" - 6"'
    },
    listrik: {
      semen: 0, pasir: 0, batu: 0, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 0,
      upah: 55000,
      keterangan: 'Instalasi listrik 1.5mm - 4mm'
    }
  },
  pekerjaanFinishing: {
    keramik: {
      semen: 0.05, pasir: 0.20, batu: 0, besi: 0, kayu: 0, genteng: 0, keramik: 1.05, cat: 0, kusen: 0,
      upah: 50000,
      keterangan: 'Keramik lantai 40x40cm'
    },
    cat: {
      semen: 0, pasir: 0, batu: 0, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0.3, kusen: 0,
      upah: 30000,
      keterangan: 'Cat dinding interior/exterior'
    },
    kusenPintu: {
      semen: 0, pasir: 0, batu: 0, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 1,
      upah: 120000,
      keterangan: 'Kusen pintu kayu + daun pintu'
    },
    kusenJendela: {
      semen: 0, pasir: 0, batu: 0, besi: 0, kayu: 0, genteng: 0, keramik: 0, cat: 0, kusen: 1,
      upah: 85000,
      keterangan: 'Kusen jendela kayu + daun jendela'
    }
  }
};

// Harga Material per Wilayah
const HARGA_MATERIAL = {
  'Nusa Tenggara Timur': { semen: 75000, pasir: 120000, batu: 180000, besi: 25000, keramik: 85000, cat: 65000, kayu: 1500000, genteng: 12000 },
  'DKI Jakarta': { semen: 85000, pasir: 150000, batu: 220000, besi: 28000, keramik: 95000, cat: 75000, kayu: 1800000, genteng: 15000 },
  'Jawa Barat': { semen: 80000, pasir: 140000, batu: 200000, besi: 27000, keramik: 90000, cat: 70000, kayu: 1650000, genteng: 13500 },
  'Jawa Tengah': { semen: 78000, pasir: 130000, batu: 190000, besi: 26000, keramik: 88000, cat: 68000, kayu: 1600000, genteng: 13000 },
  'Jawa Timur': { semen: 77000, pasir: 125000, batu: 185000, besi: 25500, keramik: 86000, cat: 66000, kayu: 1550000, genteng: 12500 }
};

// Tipe Rumah
const TIPE_RUMAH = {
  sederhana: { nama: 'Tipe Sederhana', minLuas: 36, maxLuas: 70, minBiaya: 2500000, maxBiaya: 3500000 },
  menengah: { nama: 'Tipe Menengah', minLuas: 70, maxLuas: 120, minBiaya: 3500000, maxBiaya: 5000000 },
  mewah: { nama: 'Tipe Mewah', minLuas: 120, maxLuas: 250, minBiaya: 5000000, maxBiaya: 8000000 }
};

function App() {
  // Check authentication on mount
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setAuthChecked(true);
  }, []);

  // Language Management
  const { language, changeLanguage, t } = useLanguage('id');
  
  // AI Service with context awareness
  const [aiService] = useState(() => getAIService(language));
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: t('ai.hello') }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [sessionId] = useState('SIV-' + Math.random().toString(36).substr(2, 9).toUpperCase());
  const reportRef = useRef(null);

  // Form state
  const [projectForm, setProjectForm] = useState({
    namaProyek: '',
    tipeRumah: 'menengah',
    luasBangunan: '',
    panjang: '',
    lebar: '',
    lantai: 1,
    kamarTidur: '',
    kamarMandi: '',
    provinsi: '',
    profitKontraktor: 15,
    ppn: 11,
    biayaTidakTerduga: 5,
    // Tenaga kerja
    mandor: 1,
    tukangBatu: 3,
    tukangKayu: 2,
    tukangBesi: 1,
    kenek: 4,
    hariKerjaPerMinggu: 6
  });

  const [hasilRAB, setHasilRAB] = useState(null);

  // Load projects dari localStorage
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('sivilize-projects');
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }
    } catch (error) {
      console.log('Error loading projects:', error);
    }
  }, []);

  // Save projects ke localStorage
  useEffect(() => {
    try {
      if (projects.length > 0) {
        localStorage.setItem('sivilize-projects', JSON.stringify(projects));
      }
    } catch (error) {
      console.log('Error saving projects:', error);
    }
  }, [projects]);

  // Advanced AI Handler with context tracking
  const handleAISend = async () => {
    if (!userInput.trim()) return;
    
    const newUserMessage = { sender: 'user', text: userInput };
    setAiMessages(prev => [...prev, newUserMessage]);
    setIsLoadingAI(true);
    
    try {
      // Set user context for smart responses
      aiService.setUserContext({
        currentPage,
        lastAction: 'message',
        projectName: currentProject?.namaProyek,
        projectStage: currentPage === 'input' ? 'creation' : currentPage === 'dashboard' ? 'review' : undefined,
        hasMultipleProjects: projects.length > 1
      });
      
      // Change language if needed
      if (aiService.getLanguage() !== language) {
        aiService.setLanguage(language);
      }
      
      // Get AI response (now with context awareness & FAQ search)
      const response = await aiService.getResponse(userInput);
      
      const aiMessage = { 
        sender: 'ai', 
        text: response.text,
        type: response.type,
        recommendations: response.recommendations
      };
      
      setAiMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMsg = { 
        sender: 'ai', 
        text: language === 'id' 
          ? 'Maaf, terjadi error. Silakan coba lagi.' 
          : 'Sorry, an error occurred. Please try again.'
      };
      setAiMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoadingAI(false);
      setUserInput('');
    }
  };

  // Update language throughout app
  useEffect(() => {
    if (aiService) {
      aiService.setLanguage(language);
    }
  }, [language, aiService]);

  // Validasi input
  const validateForm = () => {
    const errors = [];
    
    if (!projectForm.namaProyek.trim()) errors.push('Nama proyek harus diisi');
    if (!projectForm.luasBangunan || parseFloat(projectForm.luasBangunan) <= 0) 
      errors.push('Luas bangunan harus lebih dari 0');
    if (!projectForm.provinsi) errors.push('Provinsi harus dipilih');
    if (!projectForm.kamarTidur || parseInt(projectForm.kamarTidur) < 1) 
      errors.push('Kamar tidur minimal 1');
    if (!projectForm.kamarMandi || parseInt(projectForm.kamarMandi) < 1) 
      errors.push('Kamar mandi minimal 1');
    
    return errors;
  };

  // Fungsi hitung RAB dengan Grouped Structure WAJIB
  const hitungRAB = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Error:\n' + errors.join('\n'));
      return;
    }

    try {
      const luas = parseFloat(projectForm.luasBangunan);
      
      // GENERATE GROUPED STRUCTURE - WAJIB
      const rabGrouped = generateRABGrouped(luas, projectForm.tipeRumah, projectForm.provinsi);
      
      // VALIDATION WAJIB: Pastikan grouped structure valid
      if (!rabGrouped.validation.isValid) {
        console.error('❌ ERROR: Grouped structure validation failed:', rabGrouped.validation.errors);
        alert('ERROR: ' + rabGrouped.validation.errors.join('\n'));
        return;
      }

      // VALIDATION WAJIB: Pastikan bukan flat list
      if (Array.isArray(rabGrouped.groupedRAB)) {
        console.error('❌ ERROR: Hasil masih flat list, bukan grouped structure!');
        alert('ERROR: Sistem menghasilkan flat list, bukan grouped structure!');
        return;
      }

      // Hitung estimasi waktu
      const volumes = {
        galian: luas * 0.3,
        urugan: luas * 0.2,
        pondasi: luas * 0.15,
        kolom: luas * 0.08,
        balok: luas * 0.12,
        plat: luas,
        dinding: luas * 3.5,
        atap: luas * 1.2,
        lantai: luas,
        plumbing: luas * 0.1,
        listrik: parseInt(projectForm.kamarTidur) + parseInt(projectForm.kamarMandi) + 3
      };

      const estimasiWaktu = hitungEstimasiWaktu(luas, volumes);
      const upahMandor = 150000 * estimasiWaktu.totalHari * projectForm.mandor;
      const upahTukangBatu = 120000 * estimasiWaktu.totalHari * projectForm.tukangBatu;
      const upahTukangKayu = 130000 * estimasiWaktu.totalHari * projectForm.tukangKayu;
      const upahTukangBesi = 140000 * estimasiWaktu.totalHari * projectForm.tukangBesi;
      const upahKenek = 80000 * estimasiWaktu.totalHari * projectForm.kenek;
      const totalUpah = upahMandor + upahTukangBatu + upahTukangKayu + upahTukangBesi + upahKenek;

      // Hitung profit dan PPN
      const profit = rabGrouped.grandTotal * (projectForm.profitKontraktor / 100);
      const ppnAmount = rabGrouped.grandTotal * (projectForm.ppn / 100);
      const tidakTeruga = rabGrouped.grandTotal * (projectForm.biayaTidakTerduga / 100);
      const grandTotal = rabGrouped.grandTotal + profit + ppnAmount + tidakTeruga;

      const hasil = {
        sessionId: generateSessionId(),
        namaProyek: projectForm.namaProyek,
        tipeRumah: projectForm.tipeRumah,
        luasBangunan: projectForm.luasBangunan,
        lantai: projectForm.lantai,
        kamarTidur: projectForm.kamarTidur,
        kamarMandi: projectForm.kamarMandi,
        provinsi: projectForm.provinsi,
        tanggal: projectForm.tanggal,
        estimasiWaktu: estimasiWaktu,
        tenagaKerja: {
          mandor: projectForm.mandor,
          tukangBatu: projectForm.tukangBatu,
          tukangKayu: projectForm.tukangKayu,
          tukangBesi: projectForm.tukangBesi,
          kenek: projectForm.kenek,
          totalTenaga: projectForm.mandor + projectForm.tukangBatu + projectForm.tukangKayu + projectForm.tukangBesi + projectForm.kenek,
          totalUpah: totalUpah,
          detailUpah: {
            mandor: upahMandor,
            tukangBatu: upahTukangBatu,
            tukangKayu: upahTukangKayu,
            tukangBesi: upahTukangBesi,
            kenek: upahKenek
          }
        },
        // WAJIB: Gunakan grouped structure, bukan flat list
        groupedRAB: rabGrouped.groupedRAB,
        totalBiaya: rabGrouped.grandTotal,
        profit: profit,
        ppnAmount: ppnAmount,
        tidakTeruga: tidakTeruga,
        grandTotal: grandTotal,
        biayaPerM2: grandTotal / luas,
        profitKontraktor: projectForm.profitKontraktor,
        ppn: projectForm.ppn,
        biayaTidakTerduga: projectForm.biayaTidakTerduga,
        hariKerjaPerMinggu: projectForm.hariKerjaPerMinggu,
        // Validation status
        validation: rabGrouped.validation
      };

      // Final validation: Pastikan grouped structure valid
      if (!hasil.groupedRAB || typeof hasil.groupedRAB !== 'object' || Array.isArray(hasil.groupedRAB)) {
        console.error('❌ ERROR: Final validation failed - grouped structure invalid!');
        alert('ERROR: Final validation failed - grouped structure invalid!');
        return;
      }

      // SUCCESS: Set hasil dengan grouped structure
      setHasilRAB(hasil);
      setCurrentProject(hasil);
      console.log('✅ RAB Generated with Valid Grouped Structure:', {
        categories: Object.keys(hasil.groupedRAB).length,
        grandTotal: hasil.grandTotal,
        validation: hasil.validation
      });

    } catch (error) {
      console.error('❌ ERROR: Hitung RAB failed:', error.message);
      alert('ERROR: ' + error.message);
    }
  };
  const hitungRAB = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Error:\n' + errors.join('\n'));
      return;
    }

    // Try backend API first (only if authenticated) - Silent mode
    if (isAuthenticated()) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetchWithTimeout(`${API_BASE_URL}/calculate-rab`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            luas: projectForm.luasBangunan,
            tipeRumah: projectForm.tipeRumah,
            provinsi: projectForm.provinsi
          })
        }, 5000); // 5 second timeout

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            const rabData = result.data;
            
            // Save project to backend silently
            saveProjectToBackend(rabData);
            
            // Update hasilRAB dengan data dari backend
            setHasilRAB({
              ...projectForm,
              ...rabData,
              sessionId: sessionId,
              tanggal: new Date().toLocaleDateString('id-ID'),
              backendUsed: true
            });
            
            setCurrentPage('input');
            return; // Success, exit function
          }
        }
      } catch (error) {
        // Silent failure - continue to local calculation
      }
    }

    // Fallback to local calculation (always available)
    const luas = parseFloat(projectForm.luasBangunan);
    const hargaMaterial = HARGA_MATERIAL[projectForm.provinsi] || HARGA_MATERIAL['Jawa Tengah'];
    
    // Generate grouped structure WAJIB
    const rabGrouped = generateRABGrouped(luas, projectForm.tipeRumah, projectForm.provinsi);
    
    // Validasi: WAJIB grouped structure, bukan flat list
    if (!rabGrouped.groupedRAB || typeof rabGrouped.groupedRAB !== 'object') {
      console.error('ERROR: RAB harus dalam grouped structure!');
      alert('ERROR: Sistem harus menghasilkan grouped structure, bukan flat list!');
      return;
    }

    // Hitung estimasi waktu
    const volumes = {
      galian: luas * 0.3,
      urugan: luas * 0.2,
      pondasi: luas * 0.15,
      kolom: luas * 0.08,
      balok: luas * 0.12,
      plat: luas,
      dinding: luas * 3.5,
      atap: luas * 1.2,
      lantai: luas,
      plumbing: luas * 0.1,
      listrik: parseInt(projectForm.kamarTidur) + parseInt(projectForm.kamarMandi) + 3
    };

    const estimasiWaktu = hitungEstimasiWaktu(luas, volumes);
    const upahMandor = 150000 * estimasiWaktu.totalHari * projectForm.mandor;
    const upahTukangBatu = 120000 * estimasiWaktu.totalHari * projectForm.tukangBatu;
    const upahTukangKayu = 130000 * estimasiWaktu.totalHari * projectForm.tukangKayu;
    const upahTukangBesi = 140000 * estimasiWaktu.totalHari * projectForm.tukangBesi;
    const upahKenek = 80000 * estimasiWaktu.totalHari * projectForm.kenek;
    const totalUpah = upahMandor + upahTukangBatu + upahTukangKayu + upahTukangBesi + upahKenek;

    // Hitung profit dan PPN
    const profit = rabGrouped.grandTotal * (projectForm.profitKontraktor / 100);
    const ppnAmount = rabGrouped.grandTotal * (projectForm.ppn / 100);
    const tidakTeruga = rabGrouped.grandTotal * (projectForm.biayaTidakTerduga / 100);
    const grandTotal = rabGrouped.grandTotal + profit + ppnAmount + tidakTeruga;

    const hasil = {
      sessionId: generateSessionId(),
      namaProyek: projectForm.namaProyek,
      tipeRumah: projectForm.tipeRumah,
      luasBangunan: projectForm.luasBangunan,
      lantai: projectForm.lantai,
      kamarTidur: projectForm.kamarTidur,
      kamarMandi: projectForm.kamarMandi,
      provinsi: projectForm.provinsi,
      tanggal: projectForm.tanggal,
      estimasiWaktu: estimasiWaktu,
      tenagaKerja: {
        mandor: projectForm.mandor,
        tukangBatu: projectForm.tukangBatu,
        tukangKayu: projectForm.tukangKayu,
        tukangBesi: projectForm.tukangBesi,
        kenek: projectForm.kenek,
        totalTenaga: projectForm.mandor + projectForm.tukangBatu + projectForm.tukangKayu + projectForm.tukangBesi + projectForm.kenek,
        totalUpah: totalUpah,
        detailUpah: {
          mandor: upahMandor,
          tukangBatu: upahTukangBatu,
          tukangKayu: upahTukangKayu,
          tukangBesi: upahTukangBesi,
          kenek: upahKenek
        }
      },
      // WAJIB: Gunakan grouped structure, bukan flat list
      groupedRAB: rabGrouped.groupedRAB,
      totalBiaya: rabGrouped.grandTotal,
      profit: profit,
      ppnAmount: ppnAmount,
      tidakTeruga: tidakTeruga,
      grandTotal: grandTotal,
      biayaPerM2: grandTotal / luas,
      profitKontraktor: projectForm.profitKontraktor,
      ppn: projectForm.ppn,
      biayaTidakTerduga: projectForm.biayaTidakTerduga,
      hariKerjaPerMinggu: projectForm.hariKerjaPerMinggu
    };

    // Final validation: Pastikan tidak ada flat list
    if (hasil.groupedRAB && Object.keys(hasil.groupedRAB).length > 0) {
      setHasilRAB(hasil);
      setCurrentProject(hasil);
      console.log('✅ RAB Generated with Grouped Structure:', hasil.groupedRAB);
    } else {
      console.error('❌ ERROR: RAB structure is invalid or empty!');
      alert('ERROR: Gagal generate RAB dengan grouped structure!');
    }
  };

  // UI Component: Tabel RAB Grouped per Kategori (4 Kategori Utama)
const RABGroupedTable = ({ groupedRAB }) => {
  if (!groupedRAB || Object.keys(groupedRAB).length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 font-semibold">❌ ERROR: RAB structure is invalid or empty!</p>
        <p className="text-red-500 text-sm">Sistem harus menghasilkan grouped structure, bukan flat list.</p>
      </div>
    );
  }

  // 4 Kategori Utama
  const kategoriOrder = [
    'Struktur',
    'Dinding', 
    'Lantai',
    'Finishing',
    'Lain-lain'
  ];

  let grandTotal = 0;

  return (
    <div className="space-y-6">
      {kategoriOrder.map((kategori, index) => {
        const dataKategori = groupedRAB[kategori];
        
        // Skip jika kategori tidak ada items
        if (!dataKategori || dataKategori.items.length === 0) return null;

        grandTotal += dataKategori.subtotal;

        return (
          <div key={kategori} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header Kategori */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3">
              <h3 className="text-lg font-bold">
                {String.fromCharCode(65 + index)}. {kategori.toUpperCase()}
              </h3>
            </div>

            {/* Tabel Items */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uraian</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Volume</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Satuan</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Harga Satuan</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataKategori.items.map((item, itemIndex) => (
                    <tr key={itemIndex} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.no}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.uraian}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.volume.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.satuan}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatRupiah(item.harga_satuan)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">{formatRupiah(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="5" className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                      SUBTOTAL {kategori.toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                      {formatRupiah(dataKategori.subtotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })}

      {/* Grand Total */}
      <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg border-2 border-blue-300 p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">TOTAL KESELURUHAN</span>
            <span className="text-lg font-bold text-blue-600">{formatRupiah(grandTotal)}</span>
          </div>
          <div className="border-t border-blue-200 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">PPN (11%)</span>
              <span className="text-gray-800">{formatRupiah(grandTotal * 0.11)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Profit Kontraktor (15%)</span>
              <span className="text-gray-800">{formatRupiah(grandTotal * 0.15)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Biaya Tidak Terduga (5%)</span>
              <span className="text-gray-800">{formatRupiah(grandTotal * 0.05)}</span>
            </div>
          </div>
          <div className="border-t-2 border-blue-300 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">GRAND TOTAL</span>
              <span className="text-xl font-bold text-blue-600">{formatRupiah(grandTotal * 1.31)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const RABGroupedTable = ({ groupedRAB }) => {
  if (!groupedRAB || Object.keys(groupedRAB).length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 font-semibold">❌ ERROR: RAB structure is invalid or empty!</p>
        <p className="text-red-500 text-sm">Sistem harus menghasilkan grouped structure, bukan flat list.</p>
      </div>
    );
  }

  const kategoriOrder = [
    'Pekerjaan Persiapan',
    'Pekerjaan Struktur', 
    'Pekerjaan Dinding & Plester',
    'Pekerjaan Lantai & Penutup',
    'Pekerjaan Finishing',
    'Pekerjaan Bukaan',
    'Pekerjaan Atap',
    'Pekerjaan Plumbing',
    'Pekerjaan Listrik',
    'Lain-lain'
  ];

  let grandTotal = 0;
  let noGlobal = 1;

  return (
    <div className="space-y-6">
      {kategoriOrder.map((kategori, index) => {
        const dataKategori = groupedRAB[kategori];
        
        // Skip jika kategori tidak ada items
        if (!dataKategori || dataKategori.items.length === 0) return null;

        grandTotal += dataKategori.subtotal;

        return (
          <div key={kategori} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header Kategori */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3">
              <h3 className="text-lg font-bold">
                {String.fromCharCode(65 + index)}. {kategori.toUpperCase()}
              </h3>
            </div>

            {/* Tabel Items */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uraian</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Volume</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Satuan</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Harga Satuan</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataKategori.items.map((item, itemIndex) => (
                    <tr key={itemIndex} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.no}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.uraian}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.volume.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.satuan}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatRupiah(item.hargaSatuan)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">{formatRupiah(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="5" className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                      SUBTOTAL {kategori.toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-orange-600 text-right">
                      {formatRupiah(dataKategori.subtotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })}

      {/* Grand Total */}
      <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg border-2 border-orange-300 p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">TOTAL KESELURUHAN</span>
            <span className="text-lg font-bold text-orange-600">{formatRupiah(grandTotal)}</span>
          </div>
          <div className="border-t border-orange-200 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">PPN (11%)</span>
              <span className="text-gray-800">{formatRupiah(grandTotal * 0.11)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Profit Kontraktor (15%)</span>
              <span className="text-gray-800">{formatRupiah(grandTotal * 0.15)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Biaya Tidak Terduga (5%)</span>
              <span className="text-gray-800">{formatRupiah(grandTotal * 0.05)}</span>
            </div>
          </div>
          <div className="border-t-2 border-orange-300 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">GRAND TOTAL</span>
              <span className="text-xl font-bold text-orange-600">{formatRupiah(grandTotal * 1.31)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
  const hitungKebutuhanMaterial = (luas, hargaMaterial) => {
    const volumes = {
      pembersihanLahan: luas * 0.1,
      galian: luas * 0.3,
      urugan: luas * 0.2,
      pondasi: luas * 0.15,
      kolom: luas * 0.08,
      balok: luas * 0.12,
      plat: luas,
      dinding: luas * 3.5,
      plester: luas * 3.5,
      atap: luas * 1.2,
      lantai: luas,
      cat: luas * 3.5,
      kusen: parseInt(projectForm.kamarTidur) + parseInt(projectForm.kamarMandi) + 2,
      plumbing: luas * 0.1,
      listrik: parseInt(projectForm.kamarTidur) + parseInt(projectForm.kamarMandi) + 3
    };

    const materialNeeded = {
      semen: 0,
      pasir: 0,
      batu: 0,
      besi: 0,
      kayu: 0,
      genteng: 0,
      keramik: 0,
      cat: 0,
      kusen: 0
    };

    const detailPekerjaan = [];

    // Pembersihan Lahan
    detailPekerjaan.push({
      no: '0',
      kategori: 'PEMBERSIHAN LAHAN',
      item: 'Pembersihan dan Persiapan Lahan',
      volume: volumes.pembersihanLahan.toFixed(2),
      satuan: 'm²',
      semen: 0,
      pasir: 0,
      batu: 0,
      besi: 0,
      kayu: 0,
      genteng: 0,
      keramik: 0,
      cat: 0,
      kusen: 0,
      upah: KOEFISIEN_MATERIAL.pembersihanLahan.upah,
      totalUpah: volumes.pembersihanLahan * KOEFISIEN_MATERIAL.pembersihanLahan.upah,
      keterangan: KOEFISIEN_MATERIAL.pembersihanLahan.keterangan
    });

    // Pekerjaan Tanah
    Object.keys(KOEFISIEN_MATERIAL.pekerjaanTanah).forEach(item => {
      const koef = KOEFISIEN_MATERIAL.pekerjaanTanah[item];
      const volume = item === 'galian' ? volumes.galian : volumes.urugan;
      
      detailPekerjaan.push({
        no: '1.' + (Object.keys(KOEFISIEN_MATERIAL.pekerjaanTanah).indexOf(item) + 1),
        kategori: 'PEKERJAAN TANAH',
        item: item.charAt(0).toUpperCase() + item.slice(1),
        volume: volume.toFixed(2),
        satuan: 'm³',
        semen: koef.semen * volume,
        pasir: koef.pasir * volume,
        batu: koef.batu * volume,
        besi: koef.besi * volume,
        kayu: koef.kayu * volume,
        genteng: koef.genteng * volume,
        keramik: koef.keramik * volume,
        cat: koef.cat * volume,
        kusen: koef.kusen * volume,
        upah: koef.upah,
        totalUpah: volume * koef.upah,
        keterangan: koef.keterangan
      });

      // Akumulasi material
      Object.keys(materialNeeded).forEach(mat => {
        materialNeeded[mat] += koef[mat] * volume;
      });
    });

    // Pekerjaan Pondasi
    Object.keys(KOEFISIEN_MATERIAL.pekerjaanPondasi).forEach(item => {
      const koef = KOEFISIEN_MATERIAL.pekerjaanPondasi[item];
      const volume = item === 'batuKosong' ? volumes.pondasi : luas * 0.05;
      
      detailPekerjaan.push({
        no: '2.' + (Object.keys(KOEFISIEN_MATERIAL.pekerjaanPondasi).indexOf(item) + 1),
        kategori: 'PEKERJAAN PONDASI',
        item: item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1'),
        volume: volume.toFixed(2),
        satuan: 'm³',
        semen: koef.semen * volume,
        pasir: koef.pasir * volume,
        batu: koef.batu * volume,
        besi: koef.besi * volume,
        kayu: koef.kayu * volume,
        genteng: koef.genteng * volume,
        keramik: koef.keramik * volume,
        cat: koef.cat * volume,
        kusen: koef.kusen * volume,
        upah: koef.upah,
        totalUpah: volume * koef.upah,
        keterangan: koef.keterangan
      });

      Object.keys(materialNeeded).forEach(mat => {
        materialNeeded[mat] += koef[mat] * volume;
      });
    });

    // Pekerjaan Struktur
    Object.keys(KOEFISIEN_MATERIAL.pekerjaanStruktur).forEach(item => {
      const koef = KOEFISIEN_MATERIAL.pekerjaanStruktur[item];
      const volume = item === 'plat' ? volumes.plat : luas * (item === 'kolom' ? 0.08 : 0.12);
      
      detailPekerjaan.push({
        no: '3.' + (Object.keys(KOEFISIEN_MATERIAL.pekerjaanStruktur).indexOf(item) + 1),
        kategori: 'PEKERJAAN STRUKTUR',
        item: item.charAt(0).toUpperCase() + item.slice(1),
        volume: volume.toFixed(2),
        satuan: item === 'plat' ? 'm²' : 'm³',
        semen: koef.semen * volume,
        pasir: koef.pasir * volume,
        batu: koef.batu * volume,
        besi: koef.besi * volume,
        kayu: koef.kayu * volume,
        genteng: koef.genteng * volume,
        keramik: koef.keramik * volume,
        cat: koef.cat * volume,
        kusen: koef.kusen * volume,
        upah: koef.upah,
        totalUpah: volume * koef.upah,
        keterangan: koef.keterangan
      });

      Object.keys(materialNeeded).forEach(mat => {
        materialNeeded[mat] += koef[mat] * volume;
      });
    });

    // Pekerjaan Dinding
    Object.keys(KOEFISIEN_MATERIAL.pekerjaanDinding).forEach(item => {
      const koef = KOEFISIEN_MATERIAL.pekerjaanDinding[item];
      const volume = volumes.dinding;
      
      detailPekerjaan.push({
        no: '4.' + (Object.keys(KOEFISIEN_MATERIAL.pekerjaanDinding).indexOf(item) + 1),
        kategori: 'PEKERJAAN DINDING',
        item: item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1'),
        volume: volume.toFixed(2),
        satuan: 'm²',
        semen: koef.semen * volume,
        pasir: koef.pasir * volume,
        batu: koef.batu * volume,
        besi: koef.besi * volume,
        kayu: koef.kayu * volume,
        genteng: koef.genteng * volume,
        keramik: koef.keramik * volume,
        cat: koef.cat * volume,
        kusen: koef.kusen * volume,
        upah: koef.upah,
        totalUpah: volume * koef.upah,
        keterangan: koef.keterangan
      });

      Object.keys(materialNeeded).forEach(mat => {
        materialNeeded[mat] += koef[mat] * volume;
      });
    });

    // Pekerjaan Atap
    Object.keys(KOEFISIEN_MATERIAL.pekerjaanAtap).forEach(item => {
      const koef = KOEFISIEN_MATERIAL.pekerjaanAtap[item];
      const volume = item === 'genteng' ? volumes.atap : item === 'talang' ? volumes.atap * 0.5 : volumes.atap;
      
      detailPekerjaan.push({
        no: '5.' + (Object.keys(KOEFISIEN_MATERIAL.pekerjaanAtap).indexOf(item) + 1),
        kategori: 'PEKERJAAN ATAP',
        item: item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1'),
        volume: volume.toFixed(2),
        satuan: item === 'talang' ? 'm' : 'm²',
        semen: koef.semen * volume,
        pasir: koef.pasir * volume,
        batu: koef.batu * volume,
        besi: koef.besi * volume,
        kayu: koef.kayu * volume,
        genteng: koef.genteng * volume,
        keramik: koef.keramik * volume,
        cat: koef.cat * volume,
        kusen: koef.kusen * volume,
        upah: koef.upah,
        totalUpah: volume * koef.upah,
        keterangan: koef.keterangan
      });

      Object.keys(materialNeeded).forEach(mat => {
        materialNeeded[mat] += koef[mat] * volume;
      });
    });

    // Pekerjaan Plumbing & Listrik
    ['airBersih', 'airKotor'].forEach(item => {
      const koef = KOEFISIEN_MATERIAL.pekerjaanPlumbing[item];
      const volume = volumes.plumbing;
      
      detailPekerjaan.push({
        no: '6.' + (item === 'airBersih' ? 1 : 2),
        kategori: 'PEKERJAAN PLUMBING',
        item: item === 'airBersih' ? 'Instalasi Air Bersih' : 'Instalasi Air Kotor',
        volume: volume.toFixed(2),
        satuan: 'm',
        semen: koef.semen * volume,
        pasir: koef.pasir * volume,
        batu: koef.batu * volume,
        besi: koef.besi * volume,
        kayu: koef.kayu * volume,
        genteng: koef.genteng * volume,
        keramik: koef.keramik * volume,
        cat: koef.cat * volume,
        kusen: koef.kusen * volume,
        upah: koef.upah,
        totalUpah: volume * koef.upah,
        keterangan: koef.keterangan
      });

      Object.keys(materialNeeded).forEach(mat => {
        materialNeeded[mat] += koef[mat] * volume;
      });
    });

    // Instalasi Listrik
    const listrikKoef = KOEFISIEN_MATERIAL.pekerjaanPlumbing.listrik;
    detailPekerjaan.push({
      no: '6.3',
      kategori: 'PEKERJAAN PLUMBING',
      item: 'Instalasi Listrik',
      volume: volumes.listrik,
      satuan: 'titik',
      semen: listrikKoef.semen * volumes.listrik,
      pasir: listrikKoef.pasir * volumes.listrik,
      batu: listrikKoef.batu * volumes.listrik,
      besi: listrikKoef.besi * volumes.listrik,
      kayu: listrikKoef.kayu * volumes.listrik,
      genteng: listrikKoef.genteng * volumes.listrik,
      keramik: listrikKoef.keramik * volumes.listrik,
      cat: listrikKoef.cat * volumes.listrik,
      kusen: listrikKoef.kusen * volumes.listrik,
      upah: listrikKoef.upah,
      totalUpah: volumes.listrik * listrikKoef.upah,
      keterangan: listrikKoef.keterangan
    });

    // Pekerjaan Finishing
    Object.keys(KOEFISIEN_MATERIAL.pekerjaanFinishing).forEach(item => {
      const koef = KOEFISIEN_MATERIAL.pekerjaanFinishing[item];
      const volume = item.includes('kusen') ? volumes.kusen : (item === 'cat' ? volumes.cat : volumes.lantai);
      
      detailPekerjaan.push({
        no: '7.' + (Object.keys(KOEFISIEN_MATERIAL.pekerjaanFinishing).indexOf(item) + 1),
        kategori: 'PEKERJAAN FINISHING',
        item: item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1'),
        volume: volume.toFixed(2),
        satuan: item.includes('kusen') ? 'unit' : (item === 'cat' ? 'm²' : 'm²'),
        semen: koef.semen * volume,
        pasir: koef.pasir * volume,
        batu: koef.batu * volume,
        besi: koef.besi * volume,
        kayu: koef.kayu * volume,
        genteng: koef.genteng * volume,
        keramik: koef.keramik * volume,
        cat: koef.cat * volume,
        kusen: koef.kusen * volume,
        upah: koef.upah,
        totalUpah: volume * koef.upah,
        keterangan: koef.keterangan
      });

      Object.keys(materialNeeded).forEach(mat => {
        materialNeeded[mat] += koef[mat] * volume;
      });
    });

    // Hitung total biaya material
    const totalBiayaMaterial = {
      semen: materialNeeded.semen * hargaMaterial.semen,
      pasir: materialNeeded.pasir * hargaMaterial.pasir,
      batu: materialNeeded.batu * hargaMaterial.batu,
      besi: materialNeeded.besi * hargaMaterial.besi,
      kayu: materialNeeded.kayu * hargaMaterial.kayu,
      genteng: materialNeeded.genteng * hargaMaterial.genteng,
      keramik: materialNeeded.keramik * hargaMaterial.keramik,
      cat: materialNeeded.cat * hargaMaterial.cat,
      kusen: materialNeeded.kusen * 1500000 // Harga per unit
    };

    const totalUpah = detailPekerjaan.reduce((sum, item) => sum + item.totalUpah, 0);
    const totalMaterial = Object.values(totalBiayaMaterial).reduce((sum, item) => sum + item, 0);
    const totalBiaya = totalUpah + totalMaterial;

    return {
      detailPekerjaan,
      materialNeeded,
      totalBiayaMaterial,
      totalUpah,
      totalMaterial,
      totalBiaya
    };
  };
  const hitungEstimasiWaktu = (luas, volumes) => {
    const totalTenaga = projectForm.mandor + projectForm.tukangBatu + projectForm.tukangKayu + projectForm.tukangBesi + projectForm.kenek;
    const hariKerjaPerMinggu = projectForm.hariKerjaPerMinggu;
    
    const estimasi = {
      pekerjaanTanah: {
        galian: Math.ceil(volumes.galian / (AHSP_STANDARD.pekerjaanTanah.produktivitas.galian * projectForm.tukangBatu)),
        urugan: Math.ceil(volumes.urugan / (AHSP_STANDARD.pekerjaanTanah.produktivitas.urugan * projectForm.kenek)),
        pemadatan: Math.ceil(volumes.galian / (AHSP_STANDARD.pekerjaanTanah.produktivitas.pemadatan * projectForm.kenek))
      },
      pekerjaanPondasi: {
        batuKosong: Math.ceil(volumes.pondasi / (AHSP_STANDARD.pekerjaanPondasi.produktivitas.batuKosong * projectForm.tukangBatu)),
        sloof: Math.ceil((luas * 0.05) / (AHSP_STANDARD.pekerjaanPondasi.produktivitas.sloof * projectForm.tukangBesi))
      },
      pekerjaanStruktur: {
        kolom: Math.ceil((luas * 0.08) / (AHSP_STANDARD.pekerjaanStruktur.produktivitas.kolom * projectForm.tukangBesi)),
        balok: Math.ceil((luas * 0.12) / (AHSP_STANDARD.pekerjaanStruktur.produktivitas.balok * projectForm.tukangBesi)),
        plat: Math.ceil(luas / (AHSP_STANDARD.pekerjaanStruktur.produktivitas.plat * projectForm.tukangBatu))
      },
      pekerjaanDinding: {
        bata: Math.ceil(volumes.dinding / (AHSP_STANDARD.pekerjaanDinding.produktivitas.bata * projectForm.tukangBatu)),
        plester: Math.ceil(volumes.plester / (AHSP_STANDARD.pekerjaanDinding.produktivitas.plester * projectForm.tukangBatu)),
        aci: Math.ceil(volumes.plester / (AHSP_STANDARD.pekerjaanDinding.produktivitas.aci * projectForm.kenek))
      },
      pekerjaanAtap: {
        rangka: Math.ceil(luas / (AHSP_STANDARD.pekerjaanAtap.produktivitas.rangka * projectForm.tukangKayu)),
        genteng: Math.ceil(luas / (AHSP_STANDARD.pekerjaanAtap.produktivitas.genteng * projectForm.tukangBatu)),
        talang: Math.ceil((luas * 0.5) / (AHSP_STANDARD.pekerjaanAtap.produktivitas.talang * projectForm.tukangKayu))
      },
      pekerjaanPlumbing: {
        air: Math.ceil(volumes.plumbing / (AHSP_STANDARD.pekerjaanPlumbing.produktivitas.air * projectForm.kenek)),
        listrik: Math.ceil(volumes.listrik / (AHSP_STANDARD.pekerjaanPlumbing.produktivitas.listrik * projectForm.tukangBesi))
      },
      pekerjaanFinishing: {
        keramik: Math.ceil(volumes.lantai / (AHSP_STANDARD.pekerjaanFinishing.produktivitas.keramik * projectForm.tukangBatu)),
        cat: Math.ceil(volumes.cat / (AHSP_STANDARD.pekerjaanFinishing.produktivitas.cat * projectForm.kenek)),
        kusen: Math.ceil(volumes.kusen / (AHSP_STANDARD.pekerjaanFinishing.produktivitas.kusen * projectForm.tukangKayu))
      }
    };

    // Hitung total hari per kategori
    const totalHariPerKategori = {};
    Object.keys(estimasi).forEach(kategori => {
      totalHariPerKategori[kategori] = Object.values(estimasi[kategori]).reduce((a, b) => Math.max(a, b), 0);
    });

    // Total hari (paralel work)
    const totalHari = Math.max(...Object.values(totalHariPerKategori));
    const totalMinggu = Math.ceil(totalHari / hariKerjaPerMinggu);
    const totalBulan = Math.ceil(totalMinggu / 4);

    return {
      detailHari: estimasi,
      totalHariPerKategori,
      totalHari,
      totalMinggu,
      totalBulan,
      durasiProyek: `${totalBulan} bulan ${totalMinggu % 4} minggu`
    };
  };
  const hitungRAB = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Error:\n' + errors.join('\n'));
      return;
    }

    const luas = parseFloat(projectForm.luasBangunan);
    const tipe = TIPE_RUMAH[projectForm.tipeRumah];
    const hargaMaterial = HARGA_MATERIAL[projectForm.provinsi] || HARGA_MATERIAL['Jawa Tengah'];
    
    // Volume pekerjaan estimasi
    const volumes = {
      galian: luas * 0.3,
      urugan: luas * 0.2,
      pondasi: luas * 0.15,
      struktur: luas * 0.25,
      dinding: luas * 3.5,
      plester: luas * 3.5,
      atap: luas * 1.2,
      lantai: luas,
      cat: luas * 3.5,
      kusen: parseInt(projectForm.kamarTidur) + parseInt(projectForm.kamarMandi) + 2,
      plumbing: luas * 0.1,
      listrik: parseInt(projectForm.kamarTidur) + parseInt(projectForm.kamarMandi) + 3
    };

    // Hitung estimasi waktu
    const estimasiWaktu = hitungEstimasiWaktu(luas, volumes);

    // Perhitungan biaya
    const detailBiaya = {
      pekerjaanTanah: 
        volumes.galian * AHSP_STANDARD.pekerjaanTanah.galian +
        volumes.urugan * AHSP_STANDARD.pekerjaanTanah.urugan +
        volumes.galian * AHSP_STANDARD.pekerjaanTanah.pemadatan,
      
      pekerjaanPondasi: 
        volumes.pondasi * (hargaMaterial.batu + hargaMaterial.semen * 0.2 + hargaMaterial.pasir * 0.8) * 1.2 +
        luas * 0.05 * (hargaMaterial.besi * 100 + hargaMaterial.semen * 0.3 + hargaMaterial.pasir * 0.7) * 0.95,
      
      pekerjaanStruktur: 
        luas * 0.08 * (hargaMaterial.besi * 120 + hargaMaterial.semen * 0.35 + hargaMaterial.pasir * 0.65) * 0.85 +
        luas * 0.12 * (hargaMaterial.besi * 110 + hargaMaterial.semen * 0.33 + hargaMaterial.pasir * 0.67) * 0.80 +
        luas * (hargaMaterial.besi * 80 + hargaMaterial.semen * 0.3 + hargaMaterial.pasir * 0.7) * 0.65,
      
      pekerjaanDinding: 
        volumes.dinding * (hargaMaterial.batu * 0.15 + hargaMaterial.semen * 0.08 + hargaMaterial.pasir * 0.77) * 0.75 +
        volumes.plester * (hargaMaterial.semen * 0.25 + hargaMaterial.pasir * 0.75) * 0.45 +
        volumes.plester * hargaMaterial.semen * 0.15 * 0.25,
      
      pekerjaanAtap: 
        luas * hargaMaterial.kayu * 0.15 +
        luas * hargaMaterial.genteng * 15 * 0.45 +
        luas * 0.5 * hargaMaterial.kayu * 0.35,
      
      pekerjaanPlumbing: 
        volumes.plumbing * 150000 * 0.25 +
        volumes.plumbing * 150000 * 0.30 +
        volumes.listrik * 150000 * 0.50,
      
      pekerjaanFinishing: 
        volumes.lantai * hargaMaterial.keramik * 0.55 +
        volumes.cat * hargaMaterial.cat * 0.3 * 0.25 +
        volumes.kusen * 1500000 * 1.20 +
        volumes.kusen * 1200000 * 0.85
    };

    const totalBiaya = Object.values(detailBiaya).reduce((a, b) => a + b, 0);
    const profit = totalBiaya * (projectForm.profitKontraktor / 100);
    const ppnAmount = (totalBiaya + profit) * (projectForm.ppn / 100);
    const tidakTeruga = (totalBiaya + profit + ppnAmount) * (projectForm.biayaTidakTerduga / 100);
    const grandTotal = totalBiaya + profit + ppnAmount + tidakTeruga;

    // Hitung upah tenaga kerja
    const totalTenaga = projectForm.mandor + projectForm.tukangBatu + projectForm.tukangKayu + projectForm.tukangBesi + projectForm.kenek;
    const upahMandor = projectForm.mandor * 150000 * estimasiWaktu.totalHari;
    const upahTukangBatu = projectForm.tukangBatu * 120000 * estimasiWaktu.totalHari;
    const upahTukangKayu = projectForm.tukangKayu * 130000 * estimasiWaktu.totalHari;
    const upahTukangBesi = projectForm.tukangBesi * 140000 * estimasiWaktu.totalHari;
    const upahKenek = projectForm.kenek * 80000 * estimasiWaktu.totalHari;
    const totalUpah = upahMandor + upahTukangBatu + upahTukangKayu + upahTukangBesi + upahKenek;

    const hasil = {
      ...projectForm,
      detailBiaya,
      totalBiaya,
      profit,
      ppnAmount,
      tidakTeruga,
      grandTotal,
      biayaPerM2: grandTotal / luas,
      tanggal: new Date().toLocaleDateString('id-ID'),
      sessionId,
      sumber: 'Mengacu pada AHSP/SNI Standar Nasional Indonesia',
      // Estimasi waktu
      estimasiWaktu,
      // Detail tenaga kerja
      tenagaKerja: {
        mandor: projectForm.mandor,
        tukangBatu: projectForm.tukangBatu,
        tukangKayu: projectForm.tukangKayu,
        tukangBesi: projectForm.tukangBesi,
        kenek: projectForm.kenek,
        totalTenaga,
        totalUpah,
        detailUpah: {
          mandor: upahMandor,
          tukangBatu: upahTukangBatu,
          tukangKayu: upahTukangKayu,
          tukangBesi: upahTukangBesi,
          kenek: upahKenek
        }
      }
    };

    setHasilRAB(hasil);
    setCurrentProject(hasil);
  };

  // ========================================
// EXPORT EXCEL - GROUPED STRUCTURE WAJIB
// ========================================

// Export Excel RAB dengan Grouped Structure WAJIB
  const exportExcel = () => {
    if (!hasilRAB) {
      alert('Hitung RAB terlebih dahulu!');
      return;
    }

    // VALIDATION WAJIB: Pastikan grouped structure
    if (!hasilRAB.groupedRAB || typeof hasilRAB.groupedRAB !== 'object' || Array.isArray(hasilRAB.groupedRAB)) {
      alert('ERROR: Tidak bisa export - grouped structure invalid!');
      return;
    }

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: RAB Grouped Structure - WAJIB
      const rabData = [];

      // HEADER ATAS
      rabData.push(['RENCANA ANGGARAN BIAYA']);
      rabData.push(['']);
      rabData.push(['Kegiatan', hasilRAB.namaProyek]);
      rabData.push(['Lokasi', hasilRAB.provinsi]);
      rabData.push(['Luas Bangunan', hasilRAB.luasBangunan + ' m²']);
      rabData.push(['Tahun', new Date().getFullYear()]);
      rabData.push(['Tanggal', hasilRAB.tanggal]);
      rabData.push(['']);

      // Kategori order untuk RAB profesional (4 Kategori Utama)
      const kategoriOrder = [
        'Struktur',
        'Dinding',
        'Lantai',
        'Finishing',
        'Lain-lain'
      ];

      let grandTotal = 0;
      let noGlobal = 1;

      // Generate tabel per kategori - WAJIB
      kategoriOrder.forEach((kategori, index) => {
        const dataKategori = hasilRAB.groupedRAB[kategori];
        
        // Skip jika kategori tidak ada items
        if (!dataKategori || dataKategori.items.length === 0) return;

        // Header Kategori - WAJIB merge cell style
        rabData.push([String.fromCharCode(65 + index), kategori.toUpperCase(), '', '', '', '']);
        
        // Header tabel - TIDAK diulang per kategori
        if (index === 0) {
          rabData.push(['No', 'Uraian', 'Volume', 'Satuan', 'Harga Satuan', 'Jumlah']);
        }

        // Items dalam kategori
        dataKategori.items.forEach(item => {
          rabData.push([
            item.no,
            item.uraian,
            item.volume.toFixed(2),
            item.satuan,
            formatRupiah(item.harga_satuan),
            formatRupiah(item.total)
          ]);
          noGlobal++;
        });

        // Subtotal kategori - WAJIB
        rabData.push(['', 'SUBTOTAL ' + kategori.toUpperCase(), '', '', '', formatRupiah(dataKategori.subtotal)]);
        rabData.push(['']); // Spasi antar kategori
        
        grandTotal += dataKategori.subtotal;
      });

      // Grand Total - WAJIB
      rabData.push(['', '', '', '', '', '']);
      rabData.push(['', 'TOTAL KESELURUHAN', '', '', '', formatRupiah(grandTotal)]);
      rabData.push(['', '', '', '', '', '']);
      rabData.push(['', 'PPN (11%)', '', '', '', formatRupiah(grandTotal * 0.11)]);
      rabData.push(['', 'Profit Kontraktor (15%)', '', '', '', formatRupiah(grandTotal * 0.15)]);
      rabData.push(['', 'Biaya Tidak Terduga (5%)', '', '', '', formatRupiah(grandTotal * 0.05)]);
      rabData.push(['', '', '', '', '', '']);
      rabData.push(['', 'GRAND TOTAL', '', '', '', formatRupiah(grandTotal * 1.31)]);

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(rabData);

      // Set column widths
      ws['!cols'] = [
        { wch: 8 },   // No
        { wch: 35 },  // Uraian
        { wch: 12 },  // Volume
        { wch: 10 },  // Satuan
        { wch: 15 },  // Harga Satuan
        { wch: 18 }   // Jumlah
      ];

      // Styling cells - WAJIB professional RAB format
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({c: C, r: R});
          const cell = ws[cellAddress];
          if (!cell) continue;

          // Header utama
          if (R === 0) {
            cell.s = {
              font: { bold: true, sz: 16 },
              alignment: { horizontal: 'center' },
              fill: { fgColor: { rgb: 'FFFF6B35' } }
            };
          }
          // Subheader
          else if (R >= 2 && R <= 6) {
            cell.s = {
              font: { bold: true },
              alignment: { horizontal: 'left' }
            };
          }
          // Header kategori (A, B, C...) - WAJIB merge cell style
          else if (cell.v && cell.v.toString().match(/^[A-J]$/)) {
            cell.s = {
              font: { bold: true, sz: 12 },
              fill: { fgColor: { rgb: 'FFD4D4D4' } },
              alignment: { horizontal: 'left' }
            };
          }
          // Header tabel
          else if (cell.v && cell.v.toString() === 'No') {
            cell.s = {
              font: { bold: true },
              fill: { fgColor: { rgb: 'FFE6E6E6' } },
              alignment: { horizontal: 'center' },
              border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
            };
          }
          // Subtotal rows - WAJIB bold
          else if (cell.v && cell.v.toString().includes('SUBTOTAL')) {
            cell.s = {
              font: { bold: true },
              fill: { fgColor: { rgb: 'FFE6E6E6' } },
              border: { top: { style: 'thin' } }
            };
          }
          // Total keseluruhan - WAJIB bold highlight
          else if (cell.v && (cell.v.toString().includes('TOTAL KESELURUHAN') || cell.v.toString().includes('GRAND TOTAL'))) {
            cell.s = {
              font: { bold: true, sz: 12 },
              fill: { fgColor: { rgb: 'FFFF6B35' } },
              border: { top: { style: 'medium' }, bottom: { style: 'medium' } }
            };
          }
          // Angka alignment
          else if (C >= 4 && C <= 5) {
            cell.s = {
              alignment: { horizontal: 'right' }
            };
          }
          // Volume alignment
          else if (C === 2) {
            cell.s = {
              alignment: { horizontal: 'center' }
            };
          }
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, 'RAB GROUPED');

      // Sheet 2: Summary Report
      const summaryData = [
        ['SUMMARY RENCANA ANGGARAN BIAYA'],
        [''],
        ['INFORMASI PROYEK'],
        ['Nama Proyek', hasilRAB.namaProyek],
        ['Lokasi', hasilRAB.provinsi],
        ['Luas Bangunan', hasilRAB.luasBangunan + ' m²'],
        ['Tipe Rumah', TIPE_RUMAH[hasilRAB.tipeRumah].nama],
        ['Tanggal', hasilRAB.tanggal],
        [''],
        ['REKAPITULASI BIAYA PER KATEGORI'],
        ['Kategori', 'Jumlah Item', 'Subtotal (Rp)'],
        ['Pekerjaan Persiapan', hasilRAB.groupedRAB['Pekerjaan Persiapan']?.items.length || 0, formatRupiah(hasilRAB.groupedRAB['Pekerjaan Persiapan']?.subtotal || 0)],
        ['Pekerjaan Struktur', hasilRAB.groupedRAB['Pekerjaan Struktur']?.items.length || 0, formatRupiah(hasilRAB.groupedRAB['Pekerjaan Struktur']?.subtotal || 0)],
        ['Pekerjaan Dinding', hasilRAB.groupedRAB['Pekerjaan Dinding']?.items.length || 0, formatRupiah(hasilRAB.groupedRAB['Pekerjaan Dinding']?.subtotal || 0)],
        ['Pekerjaan Lantai', hasilRAB.groupedRAB['Pekerjaan Lantai']?.items.length || 0, formatRupiah(hasilRAB.groupedRAB['Pekerjaan Lantai']?.subtotal || 0)],
        ['Pekerjaan Finishing', hasilRAB.groupedRAB['Pekerjaan Finishing']?.items.length || 0, formatRupiah(hasilRAB.groupedRAB['Pekerjaan Finishing']?.subtotal || 0)],
        ['Pekerjaan Bukaan', hasilRAB.groupedRAB['Pekerjaan Bukaan']?.items.length || 0, formatRupiah(hasilRAB.groupedRAB['Pekerjaan Bukaan']?.subtotal || 0)],
        ['Pekerjaan Atap', hasilRAB.groupedRAB['Pekerjaan Atap']?.items.length || 0, formatRupiah(hasilRAB.groupedRAB['Pekerjaan Atap']?.subtotal || 0)],
        ['Pekerjaan Plumbing', hasilRAB.groupedRAB['Pekerjaan Plumbing']?.items.length || 0, formatRupiah(hasilRAB.groupedRAB['Pekerjaan Plumbing']?.subtotal || 0)],
        ['Pekerjaan Listrik', hasilRAB.groupedRAB['Pekerjaan Listrik']?.items.length || 0, formatRupiah(hasilRAB.groupedRAB['Pekerjaan Listrik']?.subtotal || 0)],
        ['Pekerjaan Lain-lain', hasilRAB.groupedRAB['Pekerjaan Lain-lain']?.items.length || 0, formatRupiah(hasilRAB.groupedRAB['Pekerjaan Lain-lain']?.subtotal || 0)],
        [''],
        ['TOTAL BIAYA PEKERJAAN', '', formatRupiah(grandTotal)],
        ['PPN (11%)', '', formatRupiah(grandTotal * 0.11)],
        ['Profit Kontraktor (15%)', '', formatRupiah(grandTotal * 0.15)],
        ['Biaya Tidak Terduga (5%)', '', formatRupiah(grandTotal * 0.05)],
        ['GRAND TOTAL', '', formatRupiah(grandTotal * 1.31)],
        [''],
        ['BIAYA PER M²', '', formatRupiah((grandTotal * 1.31) / parseFloat(hasilRAB.luasBangunan))],
        [''],
        ['VALIDATION STATUS'],
        ['Grouped Structure', hasilRAB.validation?.isValid ? '✅ VALID' : '❌ INVALID'],
        ['Total Kategori', Object.keys(hasilRAB.groupedRAB).length],
        ['Grand Total', formatRupiah(grandTotal)]
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [
        { wch: 25 }, { wch: 15 }, { wch: 20 }
      ];

      XLSX.utils.book_append_sheet(wb, wsSummary, 'SUMMARY');

      // Save file dengan nama yang jelas
      const fileName = `RAB_Grouped_${hasilRAB.namaProyek}_${hasilRAB.tanggal}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      console.log('✅ Excel exported successfully with grouped structure:', fileName);
      alert('✅ Excel RAB Grouped Structure berhasil diexport!');

    } catch (error) {
      console.error('❌ ERROR: Export Excel failed:', error.message);
      alert('ERROR: Export Excel failed - ' + error.message);
    }
  };
  const exportExcel = () => {
    if (!hasilRAB) {
      alert('Hitung RAB terlebih dahulu!');
      return;
    }

    const luas = parseFloat(hasilRAB.luasBangunan);
    const rabGrouped = generateRABGrouped(luas, hasilRAB.tipeRumah, hasilRAB.provinsi);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: RAB Grouped by Kategori
    const rabData = [];

    // HEADER ATAS
    rabData.push(['RENCANA ANGGARAN BIAYA']);
    rabData.push(['']);
    rabData.push(['Kegiatan', hasilRAB.namaProyek]);
    rabData.push(['Lokasi', hasilRAB.provinsi]);
    rabData.push(['Luas Bangunan', hasilRAB.luasBangunan + ' m²']);
    rabData.push(['Tahun', new Date().getFullYear()]);
    rabData.push(['Tanggal', hasilRAB.tanggal]);
    rabData.push(['']);

    let noGlobal = 1;

    // Generate tabel per kategori
    Object.keys(rabGrouped.groupedRAB).forEach((kategori, index) => {
      const dataKategori = rabGrouped.groupedRAB[kategori];
      
      // Skip jika kategori tidak ada items
      if (dataKategori.items.length === 0) return;

      // Header Kategori
      rabData.push([String.fromCharCode(65 + index), kategori.toUpperCase(), '', '', '', '']);
      rabData.push(['No', 'Uraian', 'Volume', 'Satuan', 'Harga Satuan', 'Total']);

      // Items dalam kategori
      dataKategori.items.forEach(item => {
        rabData.push([
          item.no,
          item.uraian,
          item.volume.toFixed(2),
          item.satuan,
          formatRupiah(item.hargaSatuan),
          formatRupiah(item.total)
        ]);
      });

      // Subtotal kategori
      rabData.push(['', 'SUBTOTAL ' + kategori.toUpperCase(), '', '', '', formatRupiah(dataKategori.subtotal)]);
      rabData.push(['']);
    });

    // Grand Total
    rabData.push(['', '', '', '', '', '']);
    rabData.push(['', 'TOTAL KESELURUHAN', '', '', '', formatRupiah(rabGrouped.grandTotal)]);
    rabData.push(['', '', '', '', '', '']);
    rabData.push(['', 'PPN (11%)', '', '', '', formatRupiah(rabGrouped.totalPPN)]);
    rabData.push(['', 'Profit Kontraktor (15%)', '', '', '', formatRupiah(rabGrouped.totalProfit)]);
    rabData.push(['', 'Biaya Tidak Terduga (5%)', '', '', '', formatRupiah(rabGrouped.grandTotal * 0.05)]);
    rabData.push(['', '', '', '', '', '']);
    rabData.push(['', 'GRAND TOTAL', '', '', '', formatRupiah(rabGrouped.grandTotalFinal)]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(rabData);

    // Set column widths
    ws['!cols'] = [
      { wch: 8 },   // No
      { wch: 35 },  // Uraian
      { wch: 12 },  // Volume
      { wch: 10 },  // Satuan
      { wch: 15 },  // Harga Satuan
      { wch: 18 }   // Total
    ];

    // Styling cells
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({c: C, r: R});
        const cell = ws[cellAddress];
        if (!cell) continue;

        // Header utama
        if (R === 0) {
          cell.s = {
            font: { bold: true, sz: 16 },
            alignment: { horizontal: 'center' },
            fill: { fgColor: { rgb: 'FFFF6B35' } }
          };
        }
        // Subheader
        else if (R >= 2 && R <= 6) {
          cell.s = {
            font: { bold: true },
            alignment: { horizontal: 'left' }
          };
        }
        // Header kategori (A, B, C...)
        else if (cell.v && cell.v.toString().match(/^[A-I]$/)) {
          cell.s = {
            font: { bold: true, sz: 12 },
            fill: { fgColor: { rgb: 'FFD4D4D4' } },
            alignment: { horizontal: 'left' }
          };
        }
        // Header tabel dalam kategori
        else if (cell.v && cell.v.toString() === 'No') {
          cell.s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'FFE6E6E6' } },
            alignment: { horizontal: 'center' },
            border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
          };
        }
        // Subtotal rows
        else if (cell.v && cell.v.toString().includes('SUBTOTAL')) {
          cell.s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'FFE6E6E6' } },
            border: { top: { style: 'thin' } }
          };
        }
        // Total keseluruhan
        else if (cell.v && (cell.v.toString().includes('TOTAL KESELURUHAN') || cell.v.toString().includes('GRAND TOTAL'))) {
          cell.s = {
            font: { bold: true, sz: 12 },
            fill: { fgColor: { rgb: 'FFFF6B35' } },
            border: { top: { style: 'medium' }, bottom: { style: 'medium' } }
          };
        }
        // Angka alignment
        else if (C >= 4 && C <= 5) {
          cell.s = {
            alignment: { horizontal: 'right' }
          };
        }
        // Volume alignment
        else if (C === 2) {
          cell.s = {
            alignment: { horizontal: 'center' }
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'RAB GROUPED');

    // Sheet 2: Summary Report
    const summaryData = [
      ['SUMMARY RENCANA ANGGARAN BIAYA'],
      [''],
      ['INFORMASI PROYEK'],
      ['Nama Proyek', hasilRAB.namaProyek],
      ['Lokasi', hasilRAB.provinsi],
      ['Luas Bangunan', hasilRAB.luasBangunan + ' m²'],
      ['Tipe Rumah', TIPE_RUMAH[hasilRAB.tipeRumah].nama],
      ['Tanggal', hasilRAB.tanggal],
      [''],
      ['REKAPITULASI BIAYA PER KATEGORI'],
      ['Kategori', 'Jumlah Item', 'Subtotal (Rp)'],
      ['Pekerjaan Persiapan', rabGrouped.groupedRAB['Pekerjaan Persiapan']?.items.length || 0, formatRupiah(rabGrouped.groupedRAB['Pekerjaan Persiapan']?.subtotal || 0)],
      ['Pekerjaan Struktur', rabGrouped.groupedRAB['Pekerjaan Struktur']?.items.length || 0, formatRupiah(rabGrouped.groupedRAB['Pekerjaan Struktur']?.subtotal || 0)],
      ['Pekerjaan Dinding & Plester', rabGrouped.groupedRAB['Pekerjaan Dinding & Plester']?.items.length || 0, formatRupiah(rabGrouped.groupedRAB['Pekerjaan Dinding & Plester']?.subtotal || 0)],
      ['Pekerjaan Lantai & Penutup', rabGrouped.groupedRAB['Pekerjaan Lantai & Penutup']?.items.length || 0, formatRupiah(rabGrouped.groupedRAB['Pekerjaan Lantai & Penutup']?.subtotal || 0)],
      ['Pekerjaan Finishing', rabGrouped.groupedRAB['Pekerjaan Finishing']?.items.length || 0, formatRupiah(rabGrouped.groupedRAB['Pekerjaan Finishing']?.subtotal || 0)],
      ['Pekerjaan Bukaan', rabGrouped.groupedRAB['Pekerjaan Bukaan']?.items.length || 0, formatRupiah(rabGrouped.groupedRAB['Pekerjaan Bukaan']?.subtotal || 0)],
      ['Pekerjaan Atap', rabGrouped.groupedRAB['Pekerjaan Atap']?.items.length || 0, formatRupiah(rabGrouped.groupedRAB['Pekerjaan Atap']?.subtotal || 0)],
      ['Pekerjaan Plumbing', rabGrouped.groupedRAB['Pekerjaan Plumbing']?.items.length || 0, formatRupiah(rabGrouped.groupedRAB['Pekerjaan Plumbing']?.subtotal || 0)],
      ['Pekerjaan Listrik', rabGrouped.groupedRAB['Pekerjaan Listrik']?.items.length || 0, formatRupiah(rabGrouped.groupedRAB['Pekerjaan Listrik']?.subtotal || 0)],
      ['Lain-lain', rabGrouped.groupedRAB['Lain-lain']?.items.length || 0, formatRupiah(rabGrouped.groupedRAB['Lain-lain']?.subtotal || 0)],
      [''],
      ['TOTAL BIAYA PEKERJAAN', '', formatRupiah(rabGrouped.grandTotal)],
      ['PPN (11%)', '', formatRupiah(rabGrouped.totalPPN)],
      ['Profit Kontraktor (15%)', '', formatRupiah(rabGrouped.totalProfit)],
      ['Biaya Tidak Terduga (5%)', '', formatRupiah(rabGrouped.grandTotal * 0.05)],
      ['GRAND TOTAL', '', formatRupiah(rabGrouped.grandTotalFinal)],
      [''],
      ['BIAYA PER M²', '', formatRupiah(rabGrouped.grandTotalFinal / luas)],
      [''],
      ['ESTIMASI WAKTU'],
      ['Durasi Proyek', hasilRAB.estimasiWaktu.durasiProyek],
      ['Total Hari Kerja', hasilRAB.estimasiWaktu.totalHari + ' hari'],
      ['Total Minggu', hasilRAB.estimasiWaktu.totalMinggu + ' minggu'],
      [''],
      ['TENAGA KERJA'],
      ['Total Tenaga', hasilRAB.tenagaKerja.totalTenaga + ' orang'],
      ['Total Upah', formatRupiah(hasilRAB.tenagaKerja.totalUpah)]
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, wsSummary, 'SUMMARY');

    // Save file
    XLSX.writeFile(wb, `RAB_Grouped_${hasilRAB.namaProyek}_${hasilRAB.tanggal}.xlsx`);
  };
  const exportExcel = () => {
    if (!hasilRAB) {
      alert('Hitung RAB terlebih dahulu!');
      return;
    }

    const luas = parseFloat(hasilRAB.luasBangunan);
    const hargaMaterial = HARGA_MATERIAL[hasilRAB.provinsi] || HARGA_MATERIAL['Jawa Tengah'];
    const materialCalc = hitungKebutuhanMaterial(luas, hargaMaterial);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: RAB Utama Format Standar
    const rabData = [];

    // HEADER ATAS
    rabData.push(['RENCANA ANGGARAN BIAYA']);
    rabData.push(['']);
    rabData.push(['Kegiatan', hasilRAB.namaProyek]);
    rabData.push(['Lokasi', hasilRAB.provinsi]);
    rabData.push(['Tahun', new Date().getFullYear()]);
    rabData.push(['Tanggal', hasilRAB.tanggal]);
    rabData.push(['']);

    // HEADER TABEL
    rabData.push(['No', 'Uraian Pekerjaan', 'Volume', 'Satuan', 'Harga Satuan', 'Jumlah Harga']);

    // A. PEKERJAAN PERSIAPAN
    rabData.push(['A', 'PEKERJAAN PERSIAPAN', '', '', '', '']);
    
    // A.1 Pembersihan Lahan
    rabData.push(['A.1', 'Pembersihan dan Persiapan Lahan', 
      (luas * 0.1).toFixed(2), 'm²', 
      formatRupiah(KOEFISIEN_MATERIAL.pembersihanLahan.upah), 
      formatRupiah((luas * 0.1) * KOEFISIEN_MATERIAL.pembersihanLahan.upah)]);

    // Subtotal A
    const totalA = (luas * 0.1) * KOEFISIEN_MATERIAL.pembersihanLahan.upah;
    rabData.push(['', 'JUMLAH A', '', '', '', formatRupiah(totalA)]);
    rabData.push(['']);

    // B. PEKERJAAN TANAH & URUGAN
    rabData.push(['B', 'PEKERJAAN TANAH & URUGAN', '', '', '', '']);

    // B.1 Galian Tanah
    const galianVolume = luas * 0.3;
    const galianHarga = galianVolume * KOEFISIEN_MATERIAL.pekerjaanTanah.galian.upah;
    rabData.push(['B.1', 'Galian Tanah untuk Pondasi', 
      galianVolume.toFixed(2), 'm³', 
      formatRupiah(KOEFISIEN_MATERIAL.pekerjaanTanah.galian.upah), 
      formatRupiah(galianHarga)]);

    // B.2 Urugan Pasir
    const uruganVolume = luas * 0.2;
    const uruganHarga = uruganVolume * KOEFISIEN_MATERIAL.pekerjaanTanah.urugan.upah;
    rabData.push(['B.2', 'Urugan Pasir', 
      uruganVolume.toFixed(2), 'm³', 
      formatRupiah(KOEFISIEN_MATERIAL.pekerjaanTanah.urugan.upah), 
      formatRupiah(uruganHarga)]);

    // B.3 Pemadatan Tanah
    const pemadatanVolume = luas * 0.3;
    const pemadatanHarga = pemadatanVolume * KOEFISIEN_MATERIAL.pekerjaanTanah.pemadatan.upah;
    rabData.push(['B.3', 'Pemadatan Tanah', 
      pemadatanVolume.toFixed(2), 'm³', 
      formatRupiah(KOEFISIEN_MATERIAL.pekerjaanTanah.pemadatan.upah), 
      formatRupiah(pemadatanHarga)]);

    // Subtotal B
    const totalB = galianHarga + uruganHarga + pemadatanHarga;
    rabData.push(['', 'JUMLAH B', '', '', '', formatRupiah(totalB)]);
    rabData.push(['']);

    // C. PEKERJAAN STRUKTUR
    rabData.push(['C', 'PEKERJAAN STRUKTUR', '', '', '', '']);

    // C.1 Pondasi Batu Kosong
    const pondasiVolume = luas * 0.15;
    const pondasiHarga = pondasiVolume * 75000; // Harga satuan pondasi
    rabData.push(['C.1', 'Pondasi Batu Kosong 1:3:5', 
      pondasiVolume.toFixed(2), 'm³', 
      formatRupiah(75000), 
      formatRupiah(pondasiHarga)]);

    // C.2 Sloof Beton Bertulang
    const sloofVolume = luas * 0.05;
    const sloofHarga = sloofVolume * 90000;
    rabData.push(['C.2', 'Sloof Beton Bertulang', 
      sloofVolume.toFixed(2), 'm³', 
      formatRupiah(90000), 
      formatRupiah(sloofHarga)]);

    // C.3 Kolom Beton Bertulang
    const kolomVolume = luas * 0.08;
    const kolomHarga = kolomVolume * 95000;
    rabData.push(['C.3', 'Kolom Beton Bertulang 15x15cm', 
      kolomVolume.toFixed(2), 'm³', 
      formatRupiah(95000), 
      formatRupiah(kolomHarga)]);

    // C.4 Balok Beton Bertulang
    const balokVolume = luas * 0.12;
    const balokHarga = balokVolume * 90000;
    rabData.push(['C.4', 'Balok Beton Bertulang', 
      balokVolume.toFixed(2), 'm³', 
      formatRupiah(90000), 
      formatRupiah(balokHarga)]);

    // C.5 Plat Lantai Beton
    const platVolume = luas;
    const platHarga = platVolume * 75000;
    rabData.push(['C.5', 'Plat Lantai Beton 12cm', 
      platVolume.toFixed(2), 'm²', 
      formatRupiah(75000), 
      formatRupiah(platHarga)]);

    // Subtotal C
    const totalC = pondasiHarga + sloofHarga + kolomHarga + balokHarga + platHarga;
    rabData.push(['', 'JUMLAH C', '', '', '', formatRupiah(totalC)]);
    rabData.push(['']);

    // D. PEKERJAAN DINDING & FINISHING
    rabData.push(['D', 'PEKERJAAN DINDING & FINISHING', '', '', '', '']);

    // D.1 Pasangan Bata Merah
    const bataVolume = luas * 3.5;
    const bataHarga = bataVolume * 65000;
    rabData.push(['D.1', 'Pasangan Bata Merah 1:2:10', 
      bataVolume.toFixed(2), 'm²', 
      formatRupiah(65000), 
      formatRupiah(bataHarga)]);

    // D.2 Plesteran Dinding
    const plesterVolume = luas * 3.5;
    const plesterHarga = plesterVolume * 40000;
    rabData.push(['D.2', 'Plesteran Dinding 1:3', 
      plesterVolume.toFixed(2), 'm²', 
      formatRupiah(40000), 
      formatRupiah(plesterHarga)]);

    // D.3 Acian Halus
    const acianVolume = luas * 3.5;
    const acianHarga = acianVolume * 30000;
    rabData.push(['D.3', 'Acian Halus', 
      acianVolume.toFixed(2), 'm²', 
      formatRupiah(30000), 
      formatRupiah(acianHarga)]);

    // D.4 Keramik Lantai
    const keramikVolume = luas;
    const keramikHarga = keramikVolume * 50000;
    rabData.push(['D.4', 'Keramik Lantai 40x40cm', 
      keramikVolume.toFixed(2), 'm²', 
      formatRupiah(50000), 
      formatRupiah(keramikHarga)]);

    // D.5 Kusen Pintu
    const kusenPintuVolume = parseInt(hasilRAB.kamarTidur) + parseInt(hasilRAB.kamarMandi) + 2;
    const kusenPintuHarga = kusenPintuVolume * 1200000;
    rabData.push(['D.5', 'Kusen Pintu Kayu + Daun Pintu', 
      kusenPintuVolume, 'unit', 
      formatRupiah(1200000), 
      formatRupiah(kusenPintuHarga)]);

    // D.6 Kusen Jendela
    const kusenJendelaVolume = parseInt(hasilRAB.kamarTidur) + parseInt(hasilRAB.kamarMandi) + 2;
    const kusenJendelaHarga = kusenJendelaVolume * 850000;
    rabData.push(['D.6', 'Kusen Jendela Kayu + Daun Jendela', 
      kusenJendelaVolume, 'unit', 
      formatRupiah(850000), 
      formatRupiah(kusenJendelaHarga)]);

    // Subtotal D
    const totalD = bataHarga + plesterHarga + acianHarga + keramikHarga + kusenPintuHarga + kusenJendelaHarga;
    rabData.push(['', 'JUMLAH D', '', '', '', formatRupiah(totalD)]);
    rabData.push(['']);

    // E. PEKERJAAN ATAP
    rabData.push(['E', 'PEKERJAAN ATAP', '', '', '', '']);

    // E.1 Rangka Atap Kayu
    const rangkaVolume = luas;
    const rangkaHarga = rangkaVolume * 25000;
    rabData.push(['E.1', 'Rangka Atap Kayu Kelas 1', 
      rangkaVolume.toFixed(2), 'm²', 
      formatRupiah(25000), 
      formatRupiah(rangkaHarga)]);

    // E.2 Penutup Genteng
    const gentengVolume = luas;
    const gentengHarga = gentengVolume * 45000;
    rabData.push(['E.2', 'Penutup Genteng Beton Flat', 
      gentengVolume.toFixed(2), 'm²', 
      formatRupiah(45000), 
      formatRupiah(gentengHarga)]);

    // E.3 Talang Beton
    const talangVolume = luas * 0.5;
    const talangHarga = talangVolume * 35000;
    rabData.push(['E.3', 'Talang Beton Precast', 
      talangVolume.toFixed(2), 'm', 
      formatRupiah(35000), 
      formatRupiah(talangHarga)]);

    // Subtotal E
    const totalE = rangkaHarga + gentengHarga + talangHarga;
    rabData.push(['', 'JUMLAH E', '', '', '', formatRupiah(totalE)]);
    rabData.push(['']);

    // F. PEKERJAAN PENGECATAN
    rabData.push(['F', 'PEKERJAAN PENGECATAN', '', '', '', '']);

    // F.1 Cat Dinding Interior
    const catDindingVolume = luas * 3.5;
    const catDindingHarga = catDindingVolume * 30000;
    rabData.push(['F.1', 'Cat Dinding Interior', 
      catDindingVolume.toFixed(2), 'm²', 
      formatRupiah(30000), 
      formatRupiah(catDindingHarga)]);

    // F.2 Cat Dinding Exterior
    const catExteriorVolume = luas * 2;
    const catExteriorHarga = catExteriorVolume * 35000;
    rabData.push(['F.2', 'Cat Dinding Exterior', 
      catExteriorVolume.toFixed(2), 'm²', 
      formatRupiah(35000), 
      formatRupiah(catExteriorHarga)]);

    // F.3 Cat Plafond
    const catPlafondVolume = luas;
    const catPlafondHarga = catPlafondVolume * 25000;
    rabData.push(['F.3', 'Cat Plafond', 
      catPlafondVolume.toFixed(2), 'm²', 
      formatRupiah(25000), 
      formatRupiah(catPlafondHarga)]);

    // Subtotal F
    const totalF = catDindingHarga + catExteriorHarga + catPlafondHarga;
    rabData.push(['', 'JUMLAH F', '', '', '', formatRupiah(totalF)]);
    rabData.push(['']);

    // G. PEKERJAAN PLUMBING & LISTRIK
    rabData.push(['G', 'PEKERJAAN PLUMBING & LISTRIK', '', '', '', '']);

    // G.1 Instalasi Air Bersih
    const plumbingVolume = luas * 0.1;
    const plumbingHarga = plumbingVolume * 30000;
    rabData.push(['G.1', 'Instalasi Air Bersih PVC 1/2"-4"', 
      plumbingVolume.toFixed(2), 'm', 
      formatRupiah(30000), 
      formatRupiah(plumbingHarga)]);

    // G.2 Instalasi Air Kotor
    const airKotorVolume = luas * 0.1;
    const airKotorHarga = airKotorVolume * 35000;
    rabData.push(['G.2', 'Instalasi Air Kotor PVC 3"-6"', 
      airKotorVolume.toFixed(2), 'm', 
      formatRupiah(35000), 
      formatRupiah(airKotorHarga)]);

    // G.3 Instalasi Listrik
    const listrikVolume = parseInt(hasilRAB.kamarTidur) + parseInt(hasilRAB.kamarMandi) + 3;
    const listrikHarga = listrikVolume * 55000;
    rabData.push(['G.3', 'Instalasi Listrik 1.5mm-4mm', 
      listrikVolume, 'titik', 
      formatRupiah(55000), 
      formatRupiah(listrikHarga)]);

    // Subtotal G
    const totalG = plumbingHarga + airKotorHarga + listrikHarga;
    rabData.push(['', 'JUMLAH G', '', '', '', formatRupiah(totalG)]);
    rabData.push(['']);

    // TOTAL KESELURUHAN
    const totalKeseluruhan = totalA + totalB + totalC + totalD + totalE + totalF + totalG;
    rabData.push(['', '', '', '', '', '']);
    rabData.push(['', 'TOTAL KESELURUHAN', '', '', '', formatRupiah(totalKeseluruhan)]);
    rabData.push(['', '', '', '', '', '']);
    rabData.push(['', 'Pajak PPN (11%)', '', '', '', formatRupiah(totalKeseluruhan * 0.11)]);
    rabData.push(['', 'Profit Kontraktor (15%)', '', '', '', formatRupiah(totalKeseluruhan * 0.15)]);
    rabData.push(['', 'Biaya Tidak Terduga (5%)', '', '', '', formatRupiah(totalKeseluruhan * 0.05)]);
    rabData.push(['', '', '', '', '', '']);
    rabData.push(['', 'GRAND TOTAL', '', '', '', formatRupiah(totalKeseluruhan * 1.31)]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(rabData);

    // Set column widths
    ws['!cols'] = [
      { wch: 8 },   // No
      { wch: 35 },  // Uraian Pekerjaan
      { wch: 12 },  // Volume
      { wch: 10 },  // Satuan
      { wch: 15 },  // Harga Satuan
      { wch: 18 }   // Jumlah Harga
    ];

    // Styling cells
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({c: C, r: R});
        const cell = ws[cellAddress];
        if (!cell) continue;

        // Header utama
        if (R === 0) {
          cell.s = {
            font: { bold: true, sz: 16 },
            alignment: { horizontal: 'center' },
            fill: { fgColor: { rgb: 'FFFF6B35' } }
          };
        }
        // Subheader
        else if (R >= 2 && R <= 5) {
          cell.s = {
            font: { bold: true },
            alignment: { horizontal: 'left' }
          };
        }
        // Header tabel
        else if (R === 7) {
          cell.s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'FFE6E6E6' } },
            alignment: { horizontal: 'center' },
            border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
          };
        }
        // Section headers (A, B, C...)
        else if (cell.v && cell.v.toString().match(/^[A-G]$/)) {
          cell.s = {
            font: { bold: true, sz: 12 },
            fill: { fgColor: { rgb: 'FFD4D4D4' } },
            alignment: { horizontal: 'left' }
          };
        }
        // Subtotal rows
        else if (cell.v && cell.v.toString().includes('JUMLAH')) {
          cell.s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'FFE6E6E6' } },
            border: { top: { style: 'thin' } }
          };
        }
        // Total keseluruhan
        else if (cell.v && (cell.v.toString().includes('TOTAL KESELURUHAN') || cell.v.toString().includes('GRAND TOTAL'))) {
          cell.s = {
            font: { bold: true, sz: 12 },
            fill: { fgColor: { rgb: 'FFFF6B35' } },
            border: { top: { style: 'medium' }, bottom: { style: 'medium' } }
          };
        }
        // Angka alignment
        else if (C >= 4 && C <= 5) {
          cell.s = {
            alignment: { horizontal: 'right' }
          };
        }
        // Volume alignment
        else if (C === 2) {
          cell.s = {
            alignment: { horizontal: 'center' }
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'RAB UTAMA');

    // Sheet 2: Detail Material
    const materialData = [
      ['KEBUTUHAN MATERIAL DETAIL'],
      [''],
      ['PROYEK: ' + hasilRAB.namaProyek],
      ['LUAS: ' + hasilRAB.luasBangunan + ' m²'],
      ['LOKASI: ' + hasilRAB.provinsi],
      [''],
      ['No', 'Jenis Material', 'Kebutuhan', 'Satuan', 'Harga Satuan', 'Total Harga', 'Supplier'],
      ['1', 'Semen', materialCalc.materialNeeded.semen.toFixed(2), 'sak (50kg)', hargaMaterial.semen, formatRupiah(materialCalc.totalBiayaMaterial.semen), 'Holcim/Indocement'],
      ['2', 'Pasir', materialCalc.materialNeeded.pasir.toFixed(2), 'm³', hargaMaterial.pasir, formatRupiah(materialCalc.totalBiayaMaterial.pasir), 'Pasir Beton'],
      ['3', 'Batu Split', materialCalc.materialNeeded.batu.toFixed(2), 'm³', hargaMaterial.batu, formatRupiah(materialCalc.totalBiayaMaterial.batu), 'Batu Kali'],
      ['4', 'Besi Beton', materialCalc.materialNeeded.besi.toFixed(2), 'kg', hargaMaterial.besi, formatRupiah(materialCalc.totalBiayaMaterial.besi), 'Besi Polos/Ulir'],
      ['5', 'Kayu', materialCalc.materialNeeded.kayu.toFixed(2), 'm³', hargaMaterial.kayu, formatRupiah(materialCalc.totalBiayaMaterial.kayu), 'Kayu Kelas 1'],
      ['6', 'Genteng', materialCalc.materialNeeded.genteng.toFixed(0), 'bij', hargaMaterial.genteng, formatRupiah(materialCalc.totalBiayaMaterial.genteng), 'Genteng Beton'],
      ['7', 'Keramik', materialCalc.materialNeeded.keramik.toFixed(2), 'm²', hargaMaterial.keramik, formatRupiah(materialCalc.totalBiayaMaterial.keramik), 'Keramik 40x40'],
      ['8', 'Cat', materialCalc.materialNeeded.cat.toFixed(2), 'liter', hargaMaterial.cat, formatRupiah(materialCalc.totalBiayaMaterial.cat), 'Mowilex/Danish'],
      ['9', 'Kusen', materialCalc.materialNeeded.kusen.toFixed(0), 'unit', 1500000, formatRupiah(materialCalc.totalBiayaMaterial.kusen), 'Kayu/Aluminium'],
      [''],
      ['TOTAL MATERIAL', '', '', '', formatRupiah(materialCalc.totalMaterial), formatRupiah(materialCalc.totalMaterial), '']
    ];

    const wsMaterial = XLSX.utils.aoa_to_sheet(materialData);
    wsMaterial['!cols'] = [
      { wch: 5 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, wsMaterial, 'MATERIAL');

    // Save file
    XLSX.writeFile(wb, `RAB_${hasilRAB.namaProyek}_${hasilRAB.tanggal}.xlsx`);
  };

  // Export PDF Professional dengan Grouped Structure
  const exportPDF = async () => {
    if (!hasilRAB) {
      alert('Hitung RAB terlebih dahulu!');
      return;
    }

    // VALIDATION WAJIB: Pastikan grouped structure
    if (!hasilRAB.groupedRAB || typeof hasilRAB.groupedRAB !== 'object' || Array.isArray(hasilRAB.groupedRAB)) {
      alert('ERROR: Tidak bisa export PDF - grouped structure invalid!');
      return;
    }

    try {
      // Generate HTML content untuk PDF
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>RAB ${hasilRAB.namaProyek}</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 20px; 
              color: #333;
              line-height: 1.4;
              font-size: 12px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #ff6b35;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #ff6b35;
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0;
              color: #666;
              font-size: 14px;
            }
            .info-proyek {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
              border-left: 4px solid #ff6b35;
            }
            .info-proyek h3 {
              margin: 0 0 10px 0;
              color: #333;
              font-size: 16px;
            }
            .info-proyek .info-grid {
              display: grid;
              grid-template-columns: 200px 1fr;
              gap: 5px;
              font-size: 12px;
            }
            .kategori-section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .kategori-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 10px 15px;
              font-weight: bold;
              font-size: 14px;
              border-radius: 5px 5px 0 0;
              margin-bottom: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 0;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
              font-size: 11px;
            }
            .text-center {
              text-align: center !important;
            }
            .text-right {
              text-align: right !important;
            }
            .subtotal-row {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .grand-total {
              background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
              color: white;
              font-weight: bold;
              font-size: 14px;
            }
            .grand-total td {
              border: 2px solid #ff6b35;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #ddd;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            .footer strong {
              color: #333;
            }
            @media print {
              body { margin: 10px; }
              .kategori-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RENCANA ANGGARAN BIAYA</h1>
            <p>${hasilRAB.namaProyek}</p>
            <p>${hasilRAB.provinsi} - ${hasilRAB.tanggal}</p>
          </div>

          <div class="info-proyek">
            <h3>INFORMASI PROYEK</h3>
            <div class="info-grid">
              <span><strong>Nama Proyek:</strong></span><span>${hasilRAB.namaProyek}</span>
              <span><strong>Lokasi:</strong></span><span>${hasilRAB.provinsi}</span>
              <span><strong>Luas Bangunan:</strong></span><span>${hasilRAB.luasBangunan} m²</span>
              <span><strong>Tipe Rumah:</strong></span><span>${TIPE_RUMAH[hasilRAB.tipeRumah].nama}</span>
              <span><strong>Tanggal:</strong></span><span>${hasilRAB.tanggal}</span>
              <span><strong>Session ID:</strong></span><span>${hasilRAB.sessionId}</span>
            </div>
          </div>
      `;

      // Generate kategori sections
      const kategoriOrder = ['Struktur', 'Dinding', 'Lantai', 'Finishing', 'Lain-lain'];
      let grandTotal = 0;
      let nomorGlobal = 1;

      kategoriOrder.forEach((kategori, index) => {
        const dataKategori = hasilRAB.groupedRAB[kategori];
        
        if (!dataKategori || dataKategori.items.length === 0) return;

        grandTotal += dataKategori.subtotal;

        htmlContent += `
          <div class="kategori-section">
            <div class="kategori-header">
              ${String.fromCharCode(65 + index)}. ${kategori.toUpperCase()}
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 8%">No</th>
                  <th style="width: 40%">Uraian Pekerjaan</th>
                  <th style="width: 12%">Volume</th>
                  <th style="width: 10%">Satuan</th>
                  <th style="width: 15%">Harga Satuan</th>
                  <th style="width: 15%">Total</th>
                </tr>
              </thead>
              <tbody>
        `;

        dataKategori.items.forEach(item => {
          htmlContent += `
            <tr>
              <td class="text-center">${item.no}</td>
              <td>${item.uraian}</td>
              <td class="text-center">${item.volume.toFixed(2)}</td>
              <td class="text-center">${item.satuan}</td>
              <td class="text-right">${formatRupiah(item.harga_satuan)}</td>
              <td class="text-right">${formatRupiah(item.total)}</td>
            </tr>
          `;
          nomorGlobal++;
        });

        htmlContent += `
              </tbody>
              <tfoot>
                <tr class="subtotal-row">
                  <td colspan="5" class="text-right"><strong>SUBTOTAL ${kategori.toUpperCase()}</strong></td>
                  <td class="text-right"><strong>${formatRupiah(dataKategori.subtotal)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div style="height: 20px;"></div>
        `;
      });

      // Add grand total
      htmlContent += `
          <div class="kategori-section">
            <table>
              <tfoot>
                <tr class="grand-total">
                  <td colspan="5" class="text-right">TOTAL KESELURUHAN</td>
                  <td class="text-right">${formatRupiah(grandTotal)}</td>
                </tr>
                <tr style="background: #f8f9fa;">
                  <td colspan="5" class="text-right">PPN (11%)</td>
                  <td class="text-right">${formatRupiah(grandTotal * 0.11)}</td>
                </tr>
                <tr style="background: #f8f9fa;">
                  <td colspan="5" class="text-right">Profit Kontraktor (15%)</td>
                  <td class="text-right">${formatRupiah(grandTotal * 0.15)}</td>
                </tr>
                <tr style="background: #f8f9fa;">
                  <td colspan="5" class="text-right">Biaya Tidak Terduga (5%)</td>
                  <td class="text-right">${formatRupiah(grandTotal * 0.05)}</td>
                </tr>
                <tr class="grand-total">
                  <td colspan="5" class="text-right">GRAND TOTAL</td>
                  <td class="text-right">${formatRupiah(grandTotal * 1.31)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="footer">
            <p><strong>SIVILIZE-HUB PRO - Sistem RAB Rumah Tinggal Berbasis AHSP/SNI</strong></p>
            <p>PROPERTY OF MUHAMAD ADRIAN - Kupang, NTT | Email: muhamadadrian210@gmail.com | WA: 081338219957</p>
            <p>Session: ${hasilRAB.sessionId} | Military Grade Encryption 256-bit</p>
            <p><strong>Disclaimer:</strong> Hasil perhitungan merupakan estimasi dan harus diverifikasi kembali di lapangan. 
               Perhitungan mengacu pada AHSP/SNI Standar Nasional Indonesia.</p>
            <p><strong>✅ Grouped Structure Valid:</strong> Data dikelompokkan per kategori (Struktur, Dinding, Lantai, Finishing)</p>
          </div>
        </body>
        </html>
      `;

      // Open print window
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      console.log('✅ PDF exported successfully with grouped structure');
      alert('✅ PDF RAB Grouped Structure berhasil diexport!');

    } catch (error) {
      console.error('❌ ERROR: Export PDF failed:', error.message);
      alert('ERROR: Export PDF failed - ' + error.message);
    }
  };
  const exportPDF = async () => {
    if (!hasilRAB) {
      alert('Hitung RAB terlebih dahulu!');
      return;
    }

    // Create print-friendly HTML
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>RAB ${hasilRAB.namaProyek}</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #ff6b35;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #ff6b35;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
          }
          .info-section h3 {
            color: #ff6b35;
            margin-bottom: 10px;
            font-size: 16px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .info-section p {
            margin: 5px 0;
            font-size: 12px;
          }
          .cost-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .cost-table th {
            background: #ff6b35;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          .cost-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
          }
          .cost-table tr:nth-child(even) {
            background: #f8f9fa;
          }
          .total-row {
            background: #ff6b35 !important;
            color: white !important;
            font-weight: bold;
          }
          .timeline-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
          }
          .timeline-box {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .timeline-box h4 {
            color: #ff6b35;
            margin: 0 0 10px 0;
          }
          .timeline-box .number {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ff6b35;
            text-align: center;
            font-size: 11px;
            color: #666;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(255, 107, 53, 0.1);
            font-weight: bold;
            z-index: -1;
            pointer-events: none;
          }
          @media print {
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 120px;
              color: rgba(255, 107, 53, 0.1);
              font-weight: bold;
              z-index: -1;
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark">SIVILIZE-HUB</div>
        
        <div class="header">
          <h1>RAB RUMAH TINGGAL</h1>
          <p><strong>${hasilRAB.namaProyek}</strong></p>
          <p>Perhitungan Rencana Anggaran Biaya Berdasarkan AHSP/SNI</p>
          <p>Tanggal: ${hasilRAB.tanggal} | Session: ${hasilRAB.sessionId}</p>
        </div>

        <div class="info-grid">
          <div class="info-section">
            <h3>📋 Informasi Proyek</h3>
            <p><strong>Nama Proyek:</strong> ${hasilRAB.namaProyek}</p>
            <p><strong>Tipe Rumah:</strong> ${TIPE_RUMAH[hasilRAB.tipeRumah].nama}</p>
            <p><strong>Luas Bangunan:</strong> ${hasilRAB.luasBangunan} m²</p>
            <p><strong>Lantai:</strong> ${hasilRAB.lantai}</p>
            <p><strong>Kamar Tidur:</strong> ${hasilRAB.kamarTidur}</p>
            <p><strong>Kamar Mandi:</strong> ${hasilRAB.kamarMandi}</p>
            <p><strong>Lokasi:</strong> ${hasilRAB.provinsi}</p>
          </div>
          
          <div class="info-section">
            <h3>⏱️ Estimasi Waktu</h3>
            <p><strong>Durasi Proyek:</strong> ${hasilRAB.estimasiWaktu.durasiProyek}</p>
            <p><strong>Total Hari Kerja:</strong> ${hasilRAB.estimasiWaktu.totalHari} hari</p>
            <p><strong>Total Minggu:</strong> ${hasilRAB.estimasiWaktu.totalMinggu} minggu</p>
            <p><strong>Hari Kerja/Minggu:</strong> ${hasilRAB.hariKerjaPerMinggu} hari</p>
          </div>
        </div>

        <div class="timeline-grid">
          <div class="timeline-box">
            <h4>👥 Tenaga Kerja</h4>
            <div class="number">${hasilRAB.tenagaKerja.totalTenaga}</div>
            <p>Orang</p>
          </div>
          <div class="timeline-box">
            <h4>⏱️ Durasi</h4>
            <div class="number">${hasilRAB.estimasiWaktu.totalBulan}</div>
            <p>Bulan</p>
          </div>
          <div class="timeline-box">
            <h4>💰 Biaya per m²</h4>
            <div class="number">${formatRupiah(hasilRAB.biayaPerM2).replace('Rp ', '')}</div>
            <per m²></per m²>
          </div>
        </div>

        <h3 style="color: #ff6b35; margin: 30px 0 15px 0;">📊 Rincian Biaya Pekerjaan</h3>
        <table class="cost-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kategori Pekerjaan</th>
              <th>Volume</th>
              <th>Satuan</th>
              <th>Harga Satuan</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(hasilRAB.detailBiaya).map(([kategori, total], index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${kategori.replace(/([A-Z])/g, ' $1').trim()}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>${formatRupiah(total)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="5">SUBTOTAL</td>
              <td>${formatRupiah(hasilRAB.totalBiaya)}</td>
            </tr>
            <tr>
              <td colspan="5">Profit Kontraktor (${hasilRAB.profitKontraktor}%)</td>
              <td>${formatRupiah(hasilRAB.profit)}</td>
            </tr>
            <tr>
              <td colspan="5">PPN (${hasilRAB.ppn}%)</td>
              <td>${formatRupiah(hasilRAB.ppnAmount)}</td>
            </tr>
            <tr>
              <td colspan="5">Biaya Tidak Terduga (${hasilRAB.biayaTidakTerduga}%)</td>
              <td>${formatRupiah(hasilRAB.tidakTeruga)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="5">GRAND TOTAL</td>
              <td>${formatRupiah(hasilRAB.grandTotal)}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="color: #ff6b35; margin: 30px 0 15px 0;">👥 Rincian Tenaga Kerja & Upah</h3>
        <table class="cost-table">
          <thead>
            <tr>
              <th>Jenis Tenaga</th>
              <th>Jumlah</th>
              <th>Upah per Hari</th>
              <th>Total Hari</th>
              <th>Total Upah</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mandor</td>
              <td>${hasilRAB.tenagaKerja.mandor}</td>
              <td>Rp 150.000</td>
              <td>${hasilRAB.estimasiWaktu.totalHari}</td>
              <td>${formatRupiah(hasilRAB.tenagaKerja.detailUpah.mandor)}</td>
            </tr>
            <tr>
              <td>Tukang Batu</td>
              <td>${hasilRAB.tenagaKerja.tukangBatu}</td>
              <td>Rp 120.000</td>
              <td>${hasilRAB.estimasiWaktu.totalHari}</td>
              <td>${formatRupiah(hasilRAB.tenagaKerja.detailUpah.tukangBatu)}</td>
            </tr>
            <tr>
              <td>Tukang Kayu</td>
              <td>${hasilRAB.tenagaKerja.tukangKayu}</td>
              <td>Rp 130.000</td>
              <td>${hasilRAB.estimasiWaktu.totalHari}</td>
              <td>${formatRupiah(hasilRAB.tenagaKerja.detailUpah.tukangKayu)}</td>
            </tr>
            <tr>
              <td>Tukang Besi</td>
              <td>${hasilRAB.tenagaKerja.tukangBesi}</td>
              <td>Rp 140.000</td>
              <td>${hasilRAB.estimasiWaktu.totalHari}</td>
              <td>${formatRupiah(hasilRAB.tenagaKerja.detailUpah.tukangBesi)}</td>
            </tr>
            <tr>
              <td>Kenek/Pekerja</td>
              <td>${hasilRAB.tenagaKerja.kenek}</td>
              <td>Rp 80.000</td>
              <td>${hasilRAB.estimasiWaktu.totalHari}</td>
              <td>${formatRupiah(hasilRAB.tenagaKerja.detailUpah.kenek)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="4">TOTAL UPAH TENAGA KERJA</td>
              <td>${formatRupiah(hasilRAB.tenagaKerja.totalUpah)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p><strong>SIVILIZE-HUB PRO - Sistem RAB Rumah Tinggal Berbasis AHSP/SNI</strong></p>
          <p>PROPERTY OF MUHAMAD ADRIAN - KUPANG, NTT | Email: muhamadadrian210@gmail.com | WA: 081338219957</p>
          <p>Session: ${hasilRAB.sessionId} | Military Grade Encryption 256-bit</p>
          <p><strong>Disclaimer:</strong> Hasil perhitungan merupakan estimasi dan harus diverifikasi kembali di lapangan. Perhitungan mengacu pada AHSP/SNI Standar Nasional Indonesia.</p>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Format Rupiah
  const formatRupiah = (angka) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(angka));
  };

  // Save project
  const saveProject = () => {
    if (!hasilRAB) {
      alert('Hitung RAB terlebih dahulu!');
      return;
    }

    const newProject = {
      id: Date.now(),
      ...hasilRAB,
      createdAt: new Date().toISOString()
    };

    setProjects(prev => [...prev, newProject]);
    alert('Proyek berhasil disimpan!');
  };

  // Delete project
  const deleteProject = (id) => {
    if (confirm('Yakin ingin menghapus proyek ini?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  // Load project
  const loadProject = (project) => {
    setProjectForm({
      namaProyek: project.namaProyek,
      tipeRumah: project.tipeRumah,
      luasBangunan: project.luasBangunan,
      panjang: project.panjang,
      lebar: project.lebar,
      lantai: project.lantai,
      kamarTidur: project.kamarTidur,
      kamarMandi: project.kamarMandi,
      provinsi: project.provinsi,
      profitKontraktor: project.profitKontraktor,
      ppn: project.ppn,
      biayaTidakTerduga: project.biayaTidakTerduga
    });
    setHasilRAB(project);
    setCurrentProject(project);
    setCurrentPage('input');
  };

  // Dashboard Page
  const DashboardPage = () => (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <LogoSelector size={60} className="rounded-lg" />
            <div>
              <h1 className="text-4xl font-bold text-orange-500 mb-2">SIVILIZE-HUB PRO</h1>
              <p className="text-gray-400">Sistem RAB Rumah Tinggal Berbasis AHSP/SNI</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Session: {sessionId}</p>
            <p className="text-xs text-green-400">🔒 Military Grade Encryption</p>
            <p className="text-xs text-green-400">🟢 System Ready</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setCurrentPage('input')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl hover:opacity-90 transition-opacity"
          >
            <div className="text-4xl mb-2">🏗️</div>
            <h3 className="text-xl font-semibold mb-2">Proyek Baru</h3>
            <p className="text-sm opacity-90">Buat RAB untuk proyek baru</p>
          </button>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="text-xl font-semibold mb-2">Total Proyek</h3>
            <p className="text-3xl font-bold">{projects.length}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="text-xl font-semibold mb-2">Total Investasi</h3>
            <p className="text-2xl font-bold">
              {formatRupiah(projects.reduce((sum, p) => sum + (p.grandTotal || 0), 0))}
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-6">Daftar Proyek</h2>
          {projects.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📁</div>
              <p className="mb-4">Belum ada proyek</p>
              <button
                onClick={() => setCurrentPage('input')}
                className="bg-orange-500 px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Buat Proyek Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{project.namaProyek}</h3>
                    <p className="text-sm text-gray-400">
                      {TIPE_RUMAH[project.tipeRumah].nama} • {project.luasBangunan}m² • {project.provinsi}
                    </p>
                    <p className="text-lg font-bold text-orange-500 mt-1">
                      {formatRupiah(project.grandTotal)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadProject(project)}
                      className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Input Page
  const InputPage = () => (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Input Data Proyek</h1>
            <p className="text-gray-400">Perhitungan RAB berdasarkan AHSP/SNI Standar Nasional</p>
          </div>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            ← Kembali
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Input */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">📋 Data Umum Proyek</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Proyek *</label>
                  <input
                    type="text"
                    value={projectForm.namaProyek}
                    onChange={(e) => setProjectForm({...projectForm, namaProyek: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                    placeholder="Contoh: Rumah Pak Budi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipe Rumah *</label>
                  <select
                    value={projectForm.tipeRumah}
                    onChange={(e) => setProjectForm({...projectForm, tipeRumah: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  >
                    {Object.keys(TIPE_RUMAH).map(key => (
                      <option key={key} value={key}>
                        {TIPE_RUMAH[key].nama} ({TIPE_RUMAH[key].minLuas}-{TIPE_RUMAH[key].maxLuas}m²)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Panjang (m) *</label>
                    <input
                      type="number"
                      value={projectForm.panjang}
                      onChange={(e) => {
                        const panjang = parseFloat(e.target.value) || 0;
                        const lebar = parseFloat(projectForm.lebar) || 0;
                        setProjectForm({...projectForm, panjang: e.target.value, luasBangunan: (panjang * lebar).toString()});
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Lebar (m) *</label>
                    <input
                      type="number"
                      value={projectForm.lebar}
                      onChange={(e) => {
                        const lebar = parseFloat(e.target.value) || 0;
                        const panjang = parseFloat(projectForm.panjang) || 0;
                        setProjectForm({...projectForm, lebar: e.target.value, luasBangunan: (panjang * lebar).toString()});
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      placeholder="8"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Luas Bangunan (m²) *</label>
                  <input
                    type="number"
                    value={projectForm.luasBangunan}
                    onChange={(e) => setProjectForm({...projectForm, luasBangunan: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white bg-orange-500/20"
                    readOnly
                  />
                  <p className="text-xs text-orange-400 mt-1">Dihitung otomatis dari Panjang × Lebar</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Lantai</label>
                    <input
                      type="number"
                      value={projectForm.lantai}
                      onChange={(e) => setProjectForm({...projectForm, lantai: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Kamar Tidur *</label>
                    <input
                      type="number"
                      value={projectForm.kamarTidur}
                      onChange={(e) => setProjectForm({...projectForm, kamarTidur: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Kamar Mandi *</label>
                    <input
                      type="number"
                      value={projectForm.kamarMandi}
                      onChange={(e) => setProjectForm({...projectForm, kamarMandi: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Provinsi *</label>
                  <select
                    value={projectForm.provinsi}
                    onChange={(e) => setProjectForm({...projectForm, provinsi: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Pilih Provinsi</option>
                    {Object.keys(HARGA_MATERIAL).map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">👥 Tenaga Kerja</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Mandor</label>
                    <input
                      type="number"
                      value={projectForm.mandor}
                      onChange={(e) => setProjectForm({...projectForm, mandor: parseInt(e.target.value) || 1})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tukang Batu</label>
                    <input
                      type="number"
                      value={projectForm.tukangBatu}
                      onChange={(e) => setProjectForm({...projectForm, tukangBatu: parseInt(e.target.value) || 1})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tukang Kayu</label>
                    <input
                      type="number"
                      value={projectForm.tukangKayu}
                      onChange={(e) => setProjectForm({...projectForm, tukangKayu: parseInt(e.target.value) || 1})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tukang Besi</label>
                    <input
                      type="number"
                      value={projectForm.tukangBesi}
                      onChange={(e) => setProjectForm({...projectForm, tukangBesi: parseInt(e.target.value) || 1})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Kenek/Pekerja</label>
                    <input
                      type="number"
                      value={projectForm.kenek}
                      onChange={(e) => setProjectForm({...projectForm, kenek: parseInt(e.target.value) || 1})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hari Kerja/Minggu</label>
                    <select
                      value={projectForm.hariKerjaPerMinggu}
                      onChange={(e) => setProjectForm({...projectForm, hariKerjaPerMinggu: parseInt(e.target.value)})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                    >
                      <option value={5}>5 Hari</option>
                      <option value={6}>6 Hari</option>
                      <option value={7}>7 Hari</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <p className="text-xs text-blue-400">
                    <strong>Total Tenaga:</strong> {projectForm.mandor + projectForm.tukangBatu + projectForm.tukangKayu + projectForm.tukangBesi + projectForm.kenek} orang
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Biaya & Estimasi */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">💰 Parameter Biaya</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Profit Kontraktor ({projectForm.profitKontraktor}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={projectForm.profitKontraktor}
                    onChange={(e) => setProjectForm({...projectForm, profitKontraktor: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>{projectForm.profitKontraktor}%</span>
                    <span>30%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    PPN ({projectForm.ppn}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="11"
                    value={projectForm.ppn}
                    onChange={(e) => setProjectForm({...projectForm, ppn: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>{projectForm.ppn}%</span>
                    <span>11%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Biaya Tidak Terduga ({projectForm.biayaTidakTerduga}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={projectForm.biayaTidakTerduga}
                    onChange={(e) => setProjectForm({...projectForm, biayaTidakTerduga: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>{projectForm.biayaTidakTerduga}%</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">📊 Estimasi Cepat</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <p className="text-sm text-blue-400 mb-2">
                    <strong>Referensi AHSP/SNI:</strong> Perhitungan berdasarkan standar nasional
                  </p>
                  <p className="text-sm text-blue-400">
                    <strong>Disclaimer:</strong> Hasil estimasi, harus diverifikasi di lapangan
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Estimasi Biaya per m²</p>
                    <p className="text-xl font-bold text-orange-500">
                      {formatRupiah(TIPE_RUMAH[projectForm.tipeRumah].minBiaya)} - {formatRupiah(TIPE_RUMAH[projectForm.tipeRumah].maxBiaya)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Estimasi Total</p>
                    <p className="text-xl font-bold text-orange-500">
                      {formatRupiah(
                        parseFloat(projectForm.luasBangunan || 0) * 
                        ((TIPE_RUMAH[projectForm.tipeRumah].minBiaya + TIPE_RUMAH[projectForm.tipeRumah].maxBiaya) / 2)
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={hitungRAB}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    🧮 Hitung RAB Lengkap
                  </button>
                  <button
                    onClick={saveProject}
                    disabled={!hasilRAB}
                    className="bg-green-500 px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    💾 Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hasil Perhitungan - WAJIB Grouped Structure */}
        {hasilRAB && (
          <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6" ref={reportRef}>
            <h2 className="text-2xl font-semibold mb-6">📋 Hasil Perhitungan RAB - Grouped Structure</h2>
            
            {/* Validasi WAJIB: Grouped Structure */}
            {!hasilRAB.groupedRAB ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <div className="text-red-600 text-4xl mb-4">❌</div>
                  <h3 className="text-xl font-bold text-red-800 mb-2">ERROR: Invalid RAB Structure</h3>
                  <p className="text-red-600 text-sm">Sistem harus menghasilkan grouped structure, bukan flat list!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Informasi Proyek Cards */}
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Informasi Proyek</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Nama:</strong> {hasilRAB.namaProyek}</p>
                      <p><strong>Tipe:</strong> {TIPE_RUMAH[hasilRAB.tipeRumah].nama}</p>
                      <p><strong>Luas:</strong> {hasilRAB.luasBangunan} m²</p>
                      <p><strong>Lokasi:</strong> {hasilRAB.provinsi}</p>
                      <p><strong>Tanggal:</strong> {hasilRAB.tanggal}</p>
                      <p><strong>Session:</strong> {hasilRAB.sessionId}</p>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">⏱️ Estimasi Waktu</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Durasi Proyek:</strong> <span className="text-orange-500 font-bold">{hasilRAB.estimasiWaktu.durasiProyek}</span></p>
                      <p><strong>Total Hari:</strong> {hasilRAB.estimasiWaktu.totalHari} hari</p>
                      <p><strong>Total Minggu:</strong> {hasilRAB.estimasiWaktu.totalMinggu} minggu</p>
                      <p><strong>Total Bulan:</strong> {hasilRAB.estimasiWaktu.totalBulan} bulan</p>
                      <div className="mt-3 p-2 bg-blue-500/20 border border-blue-500/50 rounded">
                        <p className="text-xs text-blue-400">
                          <strong>Timeline per Kategori:</strong>
                        </p>
                        {Object.entries(hasilRAB.estimasiWaktu.totalHariPerKategori).map(([kategori, hari]) => (
                          <p key={kategori} className="text-xs text-blue-300">
                            {kategori}: {hari} hari
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">👥 Tenaga Kerja</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Total Tenaga:</strong> {hasilRAB.tenagaKerja.totalTenaga} orang</p>
                      <p><strong>Mandor:</strong> {hasilRAB.tenagaKerja.mandor} orang</p>
                      <p><strong>Tukang Batu:</strong> {hasilRAB.tenagaKerja.tukangBatu} orang</p>
                      <p><strong>Tukang Kayu:</strong> {hasilRAB.tenagaKerja.tukangKayu} orang</p>
                      <p><strong>Tukang Besi:</strong> {hasilRAB.tenagaKerja.tukangBesi} orang</p>
                      <p><strong>Kenek:</strong> {hasilRAB.tenagaKerja.kenek} orang</p>
                      <p><strong>Total Upah:</strong> <span className="text-green-500 font-bold">{formatRupiah(hasilRAB.tenagaKerja.totalUpah)}</span></p>
                    </div>
                  </div>
                </div>

                {/* WAJIB: Tabel RAB Grouped Structure */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">Rincian RAB per Kategori</h3>
                    <p className="text-gray-400 text-sm mt-1">✅ Grouped Structure - Bukan Flat List</p>
                  </div>
                  <RABGroupedTable groupedRAB={hasilRAB.groupedRAB} />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={exportExcel}
                    className="bg-green-500 px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    📊 Export Excel (Grouped)
                  </button>
                  <button
                    onClick={exportPDF}
                    className="bg-red-500 px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    📄 Export PDF
                  </button>
                  <button
                    onClick={saveProject}
                    className="bg-blue-500 px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    💾 Simpan Proyek
                  </button>
                </div>

                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    <strong>✅ Sistem RAB Grouped Structure:</strong> Data telah dikelompokkan per kategori pekerjaan konstruksi, 
                    bukan flat list. Setiap kategori memiliki subtotal dan grand total dihitung otomatis.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
                  <p><strong>Kenek:</strong> {hasilRAB.tenagaKerja.kenek} orang</p>
                  <p><strong>Total Upah:</strong> <span className="text-green-400 font-bold">{formatRupiah(hasilRAB.tenagaKerja.totalUpah)}</span></p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mt-8">

              <div>
                <h3 className="text-lg font-semibold mb-4">Ringkasan Biaya</h3>
                <div className="space-y-2">
                  {Object.entries(hasilRAB.detailBiaya).map(([kategori, total]) => (
                    <div key={kategori} className="flex justify-between text-sm">
                      <span className="capitalize">{kategori.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>{formatRupiah(total)}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/20 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Subtotal</span>
                      <span>{formatRupiah(hasilRAB.totalBiaya)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Profit ({hasilRAB.profitKontraktor}%)</span>
                      <span>{formatRupiah(hasilRAB.profit)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>PPN ({hasilRAB.ppn}%)</span>
                      <span>{formatRupiah(hasilRAB.ppnAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tidak Terduga ({hasilRAB.biayaTidakTerduga}%)</span>
                      <span>{formatRupiah(hasilRAB.tidakTeruga)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-orange-500">
                      <span>GRAND TOTAL</span>
                      <span>{formatRupiah(hasilRAB.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Biaya per m²</span>
                      <span>{formatRupiah(hasilRAB.biayaPerM2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={exportExcel}
                className="bg-green-500 px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                📊 Export Excel
              </button>
              <button
                onClick={exportPDF}
                className="bg-red-500 px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                📄 Export PDF
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-xs text-yellow-400">
                <strong>Disclaimer:</strong> Hasil perhitungan merupakan estimasi dan harus diverifikasi kembali di lapangan. 
                Perhitungan mengacu pada AHSP/SNI Standar Nasional Indonesia.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Advanced AI Assistant Component
  const AIAssistant = () => (
    <div className={`fixed bottom-6 right-6 z-50 ${showAI ? 'w-96' : 'w-auto'}`}>
      {!showAI && (
        <button
          onClick={() => setShowAI(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-full shadow-lg hover:opacity-90 transition-opacity hover:scale-110"
          title={t('ai.support24')}
        >
          <div className="w-6 h-6 text-white">💬</div>
        </button>
      )}

      {showAI && (
        <div className="bg-slate-900 border border-orange-500 rounded-xl shadow-2xl">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-xl flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{t('ai.title')}</h3>
              <p className="text-xs opacity-90">{t('ai.support24')}</p>
            </div>
            <button
              onClick={() => setShowAI(false)}
              className="text-white hover:opacity-80"
              title={t('ai.close')}
            >
              ✕
            </button>
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-3">
            {aiMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white/10 text-gray-200'
                }`}>
                  <p>{msg.text}</p>
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
                      {msg.recommendations.map((rec, i) => (
                        <a
                          key={i}
                          href={rec.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-300 hover:text-blue-200 block"
                        >
                          📚 {rec.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoadingAI && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-gray-200 p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoadingAI && handleAISend()}
                placeholder={t('ai.askAnything')}
                disabled={isLoadingAI}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              />
              <button
                onClick={handleAISend}
                disabled={isLoadingAI}
                className="bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {t('ai.send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Show loading screen while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <Auth />;
  }

  // Show auth page if navigating to profile
  if (currentPage === 'profile') {
    return <UserProfile />;
  }

  // Show pricing page
  if (currentPage === 'pricing') {
    return <Pricing />;
  }

  // Show analytics page
  if (currentPage === 'analytics') {
    return <Analytics />;
  }

  return (
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <LogoSelector size={32} className="rounded" />
              <span className="text-xl font-bold">SIVILIZE-HUB PRO</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`hover:text-orange-500 transition-colors ${currentPage === 'dashboard' ? 'text-orange-500' : ''}`}
              >
                {t('nav.dashboard')}
              </button>
              <button
                onClick={() => setCurrentPage('input')}
                className={`hover:text-orange-500 transition-colors ${currentPage === 'input' ? 'text-orange-500' : ''}`}
              >
                {t('nav.input')}
              </button>
              <button
                onClick={() => setCurrentPage('analytics')}
                className={`hover:text-orange-500 transition-colors ${currentPage === 'analytics' ? 'text-orange-500' : ''}`}
              >
                Analytics
              </button>
              <button
                onClick={() => setCurrentPage('pricing')}
                className={`hover:text-orange-500 transition-colors ${currentPage === 'pricing' ? 'text-orange-500' : ''}`}
              >
                Pricing
              </button>
              <button
                onClick={() => setCurrentPage('profile')}
                className={`hover:text-orange-500 transition-colors ${currentPage === 'profile' ? 'text-orange-500' : ''}`}
              >
                Profile
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.reload();
                }}
                className="hover:text-red-500 transition-colors"
              >
                Logout
              </button>
              
              {/* Language Switcher */}
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => changeLanguage('id')}
                  className={`px-3 py-1 rounded transition-colors ${
                    language === 'id'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                  title="Bahasa Indonesia"
                >
                  🇮🇩 ID
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-3 py-1 rounded transition-colors ${
                    language === 'en'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                  title="English"
                >
                  🇬🇧 EN
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'input' && <InputPage />}

      {/* AI Assistant */}
      <AIAssistant />

      {/* Footer */}
      <footer className="bg-black/50 border-t border-white/10 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex items-start space-x-3">
              <LogoSelector size={40} className="rounded-lg flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-4 text-orange-500">SIVILIZE-HUB PRO</h3>
                <p className="text-sm text-gray-400">
                  Sistem RAB Rumah Tinggal berbasis AHSP/SNI Standar Nasional Indonesia
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <div className="space-y-2 text-sm">
                <button className="text-orange-500 hover:text-orange-400 transition-colors block">
                  Privacy Policy
                </button>
                <button className="text-orange-500 hover:text-orange-400 transition-colors block">
                  Terms of Service
                </button>
                <button className="text-orange-500 hover:text-orange-400 transition-colors block">
                  Disclaimer
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Kontak</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>📍 Kupang, NTT</p>
                <p>📧 muhamadadrian210@gmail.com</p>
                <p>📱 081338219957</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Keamanan</h3>
              <div className="space-y-2 text-sm text-green-400">
                <p>🔒 Military Grade Encryption</p>
                <p>🛡️ Session: {sessionId}</p>
                <p>✅ AHSP/SNI Certified</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
            <p>&copy; 2024 SIVILIZE-HUB PRO. All rights reserved. PROPERTY OF MUHAMAD ADRIAN - KUPANG, NTT</p>
            <p className="mt-2 text-xs">
              <strong>Disclaimer:</strong> Hasil perhitungan merupakan estimasi dan harus diverifikasi kembali di lapangan. 
              Perhitungan mengacu pada AHSP/SNI Standar Nasional Indonesia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
