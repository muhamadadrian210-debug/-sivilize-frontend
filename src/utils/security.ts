/**
 * Security utilities untuk SIVILIZE HUB PRO Frontend
 */

// ── Sanitasi input dari XSS ──────────────────────────────────
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// ── Validasi email format ────────────────────────────────────
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 100;
};

// ── Validasi password strength ───────────────────────────────
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) return { valid: false, message: 'Password minimal 8 karakter' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password harus ada huruf besar' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password harus ada huruf kecil' };
  if (!/\d/.test(password)) return { valid: false, message: 'Password harus ada angka' };
  if (!/[@$!%*?&_\-#]/.test(password)) return { valid: false, message: 'Password harus ada simbol (@$!%*?&_-#)' };
  return { valid: true, message: '' };
};

// ── Cek apakah token JWT masih valid (client-side) ──────────
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// ── Auto logout jika token expired ──────────────────────────
export const checkTokenValidity = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  if (isTokenExpired(token)) {
    localStorage.removeItem('token');
    return false;
  }
  return true;
};

// ── Sanitasi data sebelum dikirim ke API ─────────────────────
export const sanitizeFormData = <T extends Record<string, unknown>>(data: T): T => {
  const sanitized = { ...data };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      // Trim whitespace dan hapus karakter berbahaya
      (sanitized[key] as string) = (sanitized[key] as string)
        .trim()
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1F\x7F]/g, ''); // hapus control characters
    }
  }
  return sanitized;
};

// ── Content Security Policy helper ──────────────────────────
export const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    // Hanya izinkan https dan relative URLs
    return parsed.protocol === 'https:' || url.startsWith('/');
  } catch {
    // Relative URL
    return url.startsWith('/') || url.startsWith('./');
  }
};
