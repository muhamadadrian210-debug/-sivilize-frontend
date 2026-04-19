import { type Project, type RABTemplate, type User } from '../store/useStore';

export interface BackupData {
  version: string;
  exportedAt: string;
  exportedBy: string;
  projects: Project[];
  rabTemplates: RABTemplate[];
}

export interface ImportResult {
  success: boolean;
  projectsImported: number;
  projectsSkipped: number;
  templatesImported: number;
  errors: string[];
}

/**
 * Export semua data ke file JSON dan trigger download.
 */
export function exportAllData(
  projects: Project[],
  rabTemplates: RABTemplate[],
  user: User | null
): void {
  const backup: BackupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    exportedBy: user?.name || 'Unknown',
    projects,
    rabTemplates,
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `sivilize_backup_${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import data dari file JSON.
 * Merge strategy: skip project jika ID sudah ada; selalu import template dengan ID baru.
 */
export async function importData(
  file: File,
  existingProjects: Project[],
  existingTemplates: RABTemplate[],
  callbacks: {
    addProject: (project: Project) => void;
    saveRABTemplate: (template: Omit<RABTemplate, 'id' | 'createdAt'>) => void;
  }
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    projectsImported: 0,
    projectsSkipped: 0,
    templatesImported: 0,
    errors: [],
  };

  try {
    const text = await file.text();
    let backup: BackupData;

    try {
      backup = JSON.parse(text);
    } catch {
      result.errors.push('File bukan JSON yang valid');
      return result;
    }

    // Validasi format
    if (!backup.version || !Array.isArray(backup.projects)) {
      result.errors.push('Format backup tidak valid. Pastikan file adalah backup dari SIVILIZE HUB PRO.');
      return result;
    }

    const existingIds = new Set(existingProjects.map(p => p.id));

    // Import projects
    for (const project of backup.projects) {
      if (existingIds.has(project.id)) {
        result.projectsSkipped++;
      } else {
        callbacks.addProject(project);
        result.projectsImported++;
      }
    }

    // Import templates (selalu dengan ID baru)
    if (Array.isArray(backup.rabTemplates)) {
      for (const template of backup.rabTemplates) {
        const { id: _id, createdAt: _createdAt, ...templateData } = template;
        callbacks.saveRABTemplate(templateData);
        result.templatesImported++;
      }
    }

    result.success = true;
  } catch (err) {
    result.errors.push(`Gagal mengimpor data: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  return result;
}
