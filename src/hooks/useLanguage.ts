// Hook for language management
import { useState, useCallback, useEffect } from 'react';
import { translations } from '@/i18n/translations';

export function useLanguage(initialLanguage: 'en' | 'id' = 'id') {
  const [language, setLanguage] = useState<'en' | 'id'>(() => {
    // Try to get from localStorage
    const saved = localStorage.getItem('sivilize_language');
    return (saved as 'en' | 'id') || initialLanguage;
  });

  // Save to localStorage when language changes
  useEffect(() => {
    localStorage.setItem('sivilize_language', language);
  }, [language]);

  const changeLanguage = useCallback((newLanguage: 'en' | 'id') => {
    setLanguage(newLanguage);
  }, []);

  const t = useCallback((path: string) => {
    return getNestedValue(translations[language], path) || path;
  }, [language]);

  return {
    language,
    changeLanguage,
    t,
    translations: translations[language],
    availableLanguages: ['en', 'id'] as const
  };
}

// Helper to get nested value from object
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, prop) => current?.[prop], obj) || path;
}

export default useLanguage;
