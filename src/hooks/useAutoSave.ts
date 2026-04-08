import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import type { ProjectVersion } from '../store/useStore';

interface UseAutoSaveOptions {
  projectId: string | null;
  data: Partial<ProjectVersion> | null;
  intervalMs?: number; // default 30 detik
  enabled?: boolean;
}

/**
 * Auto-save hook — simpan draft ke localStorage setiap N detik
 * Berguna saat koneksi internet di lapangan (NTT/Papua) terputus
 */
export const useAutoSave = ({
  projectId,
  data,
  intervalMs = 30000,
  enabled = true,
}: UseAutoSaveOptions) => {
  const { saveAutoSaveDraft, clearAutoSaveDraft } = useStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedRef = useRef<number>(0);

  const save = useCallback(() => {
    if (!projectId || !data || !enabled) return;
    saveAutoSaveDraft(projectId, data);
    lastSavedRef.current = Date.now();
  }, [projectId, data, enabled, saveAutoSaveDraft]);

  // Auto-save interval
  useEffect(() => {
    if (!enabled || !projectId) return;
    timerRef.current = setInterval(save, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [save, intervalMs, enabled, projectId]);

  // Save on page unload (koneksi putus tiba-tiba)
  useEffect(() => {
    const handleUnload = () => save();
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [save]);

  const clearDraft = useCallback(() => {
    if (projectId) clearAutoSaveDraft(projectId);
  }, [projectId, clearAutoSaveDraft]);

  return { save, clearDraft, lastSavedAt: lastSavedRef.current };
};
