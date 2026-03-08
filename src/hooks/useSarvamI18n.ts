import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSarvamTranslation, SARVAM_LANGUAGES } from './useSarvamTranslation';

/**
 * Hook that wraps react-i18next's `t` function with Sarvam AI real-time translation.
 * For the 8 languages with static translations, it uses those.
 * For all other languages (14 additional), it translates on-the-fly via Sarvam AI.
 */

const STATIC_LANGUAGES = ['english', 'hindi', 'tamil', 'telugu', 'kannada', 'marathi', 'bengali', 'gujarati'];

export function useSarvamI18n() {
  const { t, i18n } = useTranslation();
  const { translateTexts } = useSarvamTranslation();
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const currentLang = i18n.language;
  const pendingKeysRef = useRef<Set<string>>(new Set());
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const needsDynamicTranslation = !STATIC_LANGUAGES.includes(currentLang) && currentLang !== 'english';

  // Batch translate pending keys
  const flushPendingTranslations = useCallback(async () => {
    const keys = Array.from(pendingKeysRef.current);
    pendingKeysRef.current.clear();
    if (keys.length === 0) return;

    // Get English values for all keys
    const englishTexts = keys.map(key => i18n.t(key, { lng: 'english' }));
    const uniqueTexts = [...new Set(englishTexts.filter(t => t))];

    if (uniqueTexts.length === 0) return;

    setIsTranslating(true);
    try {
      const translations = await translateTexts(uniqueTexts, currentLang);
      setDynamicTranslations(prev => {
        const next = { ...prev };
        keys.forEach((key, i) => {
          const englishText = englishTexts[i];
          if (translations[englishText]) {
            next[key] = translations[englishText];
          }
        });
        return next;
      });
    } catch (err) {
      console.error('Sarvam batch translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  }, [currentLang, translateTexts, i18n]);

  // Reset dynamic translations when language changes
  useEffect(() => {
    if (needsDynamicTranslation) {
      setDynamicTranslations({});
      pendingKeysRef.current.clear();
    }
  }, [currentLang, needsDynamicTranslation]);

  // Enhanced t function
  const st = useCallback((key: string, options?: any): string => {
    if (!needsDynamicTranslation) {
      return String(t(key, options));
    }

    // Check if we already have a dynamic translation
    if (dynamicTranslations[key]) {
      return dynamicTranslations[key];
    }

    // Queue for translation
    if (!pendingKeysRef.current.has(key)) {
      pendingKeysRef.current.add(key);
      // Debounce batch translation
      if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
      batchTimerRef.current = setTimeout(flushPendingTranslations, 100);
    }

    // Return English fallback while translating
    return String(i18n.t(key, { lng: 'english', ...options }));
  }, [needsDynamicTranslation, dynamicTranslations, t, i18n, flushPendingTranslations]);

  return { st, isTranslating, currentLang, i18n };
}
