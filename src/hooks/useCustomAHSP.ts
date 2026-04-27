/**
 * Hook untuk Custom AHSP per User
 * User bisa override koefisien material & upah per item AHSP sesuai daerah mereka
 * Data disimpan di localStorage dengan key per userId
 */

import { useState, useCallback } from 'react';
import type { AHSPTemplate } from '../data/ahsp';

export interface AHSPCustomization {
  ahspId: string;           // ID item AHSP yang di-custom
  name?: string;            // Override nama (opsional)
  materialOverrides?: Record<string, number>;  // Override koefisien material: { "Semen PC": 380 }
  laborOverrides?: Record<string, number>;     // Override koefisien upah: { "Pekerja": 1.8 }
  productivityOverride?: number;               // Override produktivitas
  notes?: string;           // Catatan user (misal: "Harga pasir di Kalimantan lebih mahal")
  updatedAt: number;
}

const getStorageKey = (userId: string) => `sivilize_custom_ahsp_${userId}`;

export function useCustomAHSP(userId: string | undefined) {
  const [customizations, setCustomizations] = useState<Record<string, AHSPCustomization>>(() => {
    if (!userId) return {};
    try {
      const raw = localStorage.getItem(getStorageKey(userId));
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const save = useCallback((data: Record<string, AHSPCustomization>) => {
    if (!userId) return;
    setCustomizations(data);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
  }, [userId]);

  // Simpan/update custom untuk 1 item AHSP
  const setCustom = useCallback((ahspId: string, custom: Omit<AHSPCustomization, 'ahspId' | 'updatedAt'>) => {
    const updated = {
      ...customizations,
      [ahspId]: { ...custom, ahspId, updatedAt: Date.now() },
    };
    save(updated);
  }, [customizations, save]);

  // Hapus custom untuk 1 item
  const removeCustom = useCallback((ahspId: string) => {
    const updated = { ...customizations };
    delete updated[ahspId];
    save(updated);
  }, [customizations, save]);

  // Reset semua custom
  const resetAll = useCallback(() => {
    save({});
  }, [save]);

  // Merge template default dengan custom user — ini yang dipakai di RAB Calculator
  const getMergedTemplate = useCallback((template: AHSPTemplate): AHSPTemplate => {
    const custom = customizations[template.id];
    if (!custom) return template;

    return {
      ...template,
      name: custom.name || template.name,
      productivity: custom.productivityOverride ?? template.productivity,
      materials: template.materials.map(m => ({
        ...m,
        coeff: custom.materialOverrides?.[m.name] ?? m.coeff,
      })),
      laborCoefficients: template.laborCoefficients.map(l => ({
        ...l,
        coeff: custom.laborOverrides?.[l.name] ?? l.coeff,
      })),
    };
  }, [customizations]);

  const hasCustom = useCallback((ahspId: string) => !!customizations[ahspId], [customizations]);
  const getCustom = useCallback((ahspId: string) => customizations[ahspId], [customizations]);
  const totalCustomized = Object.keys(customizations).length;

  return { customizations, setCustom, removeCustom, resetAll, getMergedTemplate, hasCustom, getCustom, totalCustomized };
}
