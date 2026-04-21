import { type RABItem, type DailyLog } from '../store/useStore';

export interface KurvaSChartPoint {
  label: string;
  rencana: number;
  realisasi: number | null;
  isManual: boolean;
}

// Distribusi pekerjaan per minggu berdasarkan kategori
const CATEGORY_WEEK_MAP: Record<string, number[]> = {
  'Persiapan':                [1, 2],
  'Tanah & Pondasi':          [2, 3, 4],
  'Struktur':                 [3, 4, 5, 6, 7, 8],
  'Dinding & Plesteran':      [6, 7, 8, 9, 10],
  'Kusen, Pintu & Jendela':   [8, 9, 10, 11],
  'Atap & Plafon':            [9, 10, 11, 12],
  'Lantai & Keramik':         [10, 11, 12],
  'Instalasi Listrik':        [10, 11, 12, 13],
  'Instalasi Air & Sanitasi': [9, 10, 11, 12],
  'Finishing & Pengecatan':   [12, 13, 14, 15, 16],
  'Lain-lain':                [1, 2, 3, 4],
};

/**
 * Membangun data chart Kurva S dari items RAB, tanggal, daily logs, dan manual progress.
 */
export function buildChartData(
  items: RABItem[],
  startDate: string,
  endDate: string,
  dailyLogs: DailyLog[],
  manualProgress: Record<number, number>
): KurvaSChartPoint[] {
  if (!startDate || !endDate) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  const durationWeeks = Math.max(4, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));

  const grandTotal = items.reduce((s, i) => s + i.total, 0);

  // Distribusi biaya per minggu
  const weeklyBudget: number[] = Array(durationWeeks + 1).fill(0);

  items.forEach(item => {
    const weeks = CATEGORY_WEEK_MAP[item.category] || [1, 2, 3, 4];
    // Clamp weeks ke durasi proyek
    const validWeeks = weeks.filter(w => w <= durationWeeks);
    if (validWeeks.length === 0) {
      // Distribusikan ke minggu terakhir jika semua di luar range
      weeklyBudget[durationWeeks] += item.total;
      return;
    }
    const perWeek = item.total / validWeeks.length;
    validWeeks.forEach(w => {
      weeklyBudget[w] += perWeek;
    });
  });

  // Kumulatif rencana
  let cumPlan = 0;
  const result: KurvaSChartPoint[] = [];

  for (let w = 0; w <= durationWeeks; w++) {
    cumPlan += weeklyBudget[w];
    const planPercent = grandTotal > 0 ? Math.min(100, (cumPlan / grandTotal) * 100) : 0;

    // Cari realisasi dari DailyLog
    const logsUpToWeek = dailyLogs.filter(log => {
      const logDate = new Date(log.date);
      const weekNum = Math.ceil((logDate.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return weekNum <= w && weekNum >= 0;
    });

    let realizationPercent: number | null = null;
    let isManual = false;

    if (logsUpToWeek.length > 0) {
      // Ambil log terbaru
      const sortedLogs = [...logsUpToWeek].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastLog = sortedLogs[0];
      if (lastLog.progressPercent !== undefined && lastLog.progressPercent !== null) {
        realizationPercent = lastLog.progressPercent;
      }
    }

    // Fallback ke manual progress jika tidak ada dari DailyLog
    if (realizationPercent === null && manualProgress[w] !== undefined) {
      realizationPercent = manualProgress[w];
      isManual = true;
    }

    result.push({
      label: `M${w}`,
      rencana: planPercent,
      realisasi: realizationPercent,
      isManual,
    });
  }

  return result;
}

/**
 * Agregasi data mingguan ke bulanan (setiap 4 minggu = 1 bulan).
 * Nilai kumulatif bulan = nilai kumulatif minggu terakhir bulan tersebut.
 */
export function aggregateToMonthly(weeklyData: KurvaSChartPoint[]): KurvaSChartPoint[] {
  if (weeklyData.length === 0) return [];

  const result: KurvaSChartPoint[] = [];
  const weeksPerMonth = 4;
  const numMonths = Math.ceil((weeklyData.length - 1) / weeksPerMonth);

  for (let m = 0; m < numMonths; m++) {
    const lastWeekIdx = Math.min((m + 1) * weeksPerMonth, weeklyData.length - 1);
    const monthData = weeklyData[lastWeekIdx];

    // Cari realisasi terbaru dalam bulan ini (tidak null)
    let realisasi: number | null = null;
    let isManual = false;
    for (let w = lastWeekIdx; w >= m * weeksPerMonth; w--) {
      if (weeklyData[w].realisasi !== null) {
        realisasi = weeklyData[w].realisasi;
        isManual = weeklyData[w].isManual;
        break;
      }
    }

    result.push({
      label: `Bln ${m + 1}`,
      rencana: monthData.rencana,
      realisasi,
      isManual,
    });
  }

  // Pastikan monoton naik untuk rencana
  for (let i = 1; i < result.length; i++) {
    if (result[i].rencana < result[i - 1].rencana) {
      result[i].rencana = result[i - 1].rencana;
    }
  }

  return result;
}
