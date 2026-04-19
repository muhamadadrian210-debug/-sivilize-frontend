import { type Project, type AppNotification, type DailyLog } from '../store/useStore';

export interface NotificationEngineConfig {
  idleThresholdDays?: number;    // default: 7
  deviationThreshold?: number;   // default: 10 (persen)
}

// ── Helper functions ──────────────────────────────────────────

function isDuplicate(
  notifications: AppNotification[],
  title: string,
  projectId: string
): boolean {
  return notifications.some(
    n => n.title === title && n.projectId === projectId && !n.read
  );
}

function getLastDailyLog(dailyLogs: DailyLog[] | undefined): DailyLog | null {
  if (!dailyLogs || dailyLogs.length === 0) return null;
  return [...dailyLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
}

function getDaysSince(dateStr: string | undefined): number {
  if (!dateStr) return Infinity;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function hasRABItems(project: Project): boolean {
  const latestVersion = project.versions?.[project.versions.length - 1];
  return (latestVersion?.rabItems?.length || 0) > 0;
}

function getCurrentPeriodProgress(project: Project): { rencana: number; realisasi: number | null } {
  if (!project.startDate) return { rencana: 0, realisasi: null };

  const start = new Date(project.startDate);
  const now = new Date();
  const currentWeek = Math.ceil((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));

  // Estimasi rencana sederhana: linear dari 0 ke 100 selama durasi proyek
  const endDate = project.endDate ? new Date(project.endDate) : null;
  const totalWeeks = endDate
    ? Math.ceil((endDate.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
    : 16;

  const rencana = Math.min(100, (currentWeek / totalWeeks) * 100);

  // Realisasi dari daily log terbaru
  const lastLog = getLastDailyLog(project.dailyLogs);
  const realisasi = lastLog?.progressPercent ?? null;

  return { rencana, realisasi };
}

// ── Main engine ───────────────────────────────────────────────

export function runNotificationEngine(
  projects: Project[],
  notifications: AppNotification[],
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void,
  config?: NotificationEngineConfig
): void {
  const idleThreshold = config?.idleThresholdDays ?? 7;
  const deviationThreshold = config?.deviationThreshold ?? 10;

  for (const project of projects) {
    // Kondisi 1: RAB belum disimpan sebagai versi
    if (project.autoSaveDraft && project.autoSavedAt) {
      const title = 'RAB Belum Disimpan';
      if (!isDuplicate(notifications, title, project.id)) {
        addNotification({
          type: 'warning',
          title,
          message: `Proyek "${project.name}" memiliki data RAB yang belum disimpan sebagai versi.`,
          projectId: project.id,
        });
      }
    }

    // Kondisi 2: Proyek ongoing tidak ada update dalam N hari
    if (project.status === 'ongoing') {
      const lastLog = getLastDailyLog(project.dailyLogs);
      const daysSince = getDaysSince(lastLog?.date);

      if (daysSince >= idleThreshold) {
        const title = 'Proyek Tidak Diupdate';
        if (!isDuplicate(notifications, title, project.id)) {
          addNotification({
            type: 'warning',
            title,
            message: `Proyek "${project.name}" tidak ada update selama ${daysSince === Infinity ? 'lebih dari ' + idleThreshold : daysSince} hari.`,
            projectId: project.id,
          });
        }
      }
    }

    // Kondisi 3: Progress terlambat (deviasi > threshold)
    if (project.status === 'ongoing' && project.startDate && hasRABItems(project)) {
      const { rencana, realisasi } = getCurrentPeriodProgress(project);

      if (realisasi !== null && (rencana - realisasi) > deviationThreshold) {
        const title = 'Progress Terlambat';
        if (!isDuplicate(notifications, title, project.id)) {
          addNotification({
            type: 'error',
            title,
            message: `Proyek "${project.name}": Rencana ${rencana.toFixed(1)}%, Realisasi ${realisasi.toFixed(1)}%, Deviasi ${(rencana - realisasi).toFixed(1)}%.`,
            projectId: project.id,
          });
        }
      }
    }
  }
}
