import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSarvamTranslation, SARVAM_LANGUAGES } from './useSarvamTranslation';

/**
 * Hook that wraps react-i18next's `t` function with Sarvam AI real-time translation.
 * For English, returns static translations.
 * For all other languages, translates on-the-fly via Sarvam AI.
 */

export function useSarvamI18n() {
  const { t, i18n } = useTranslation();
  const { translateTexts } = useSarvamTranslation();
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const currentLang = i18n.language;
  const pendingKeysRef = useRef<Set<string>>(new Set());
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushingRef = useRef(false);
  const langRef = useRef(currentLang);

  const needsDynamicTranslation = currentLang !== 'english';

  // Track language changes
  useEffect(() => {
    langRef.current = currentLang;
  }, [currentLang]);

  // Batch translate pending keys
  const flushPendingTranslations = useCallback(async () => {
    if (flushingRef.current) return;
    flushingRef.current = true;

    const keys = Array.from(pendingKeysRef.current);
    pendingKeysRef.current.clear();
    if (keys.length === 0) {
      flushingRef.current = false;
      return;
    }

    // Get English values for all keys
    const englishTexts = keys.map(key => String(i18n.t(key, { lng: 'english' })));
    
    // Deduplicate texts while preserving key mapping
    const uniqueTextsSet = new Set<string>();
    const uniqueTexts: string[] = [];
    englishTexts.forEach(text => {
      if (text && !uniqueTextsSet.has(text)) {
        uniqueTextsSet.add(text);
        uniqueTexts.push(text);
      }
    });

    if (uniqueTexts.length === 0) {
      flushingRef.current = false;
      return;
    }

    setIsTranslating(true);
    try {
      const translations = await translateTexts(uniqueTexts, langRef.current);
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
      flushingRef.current = false;
    }
  }, [translateTexts, i18n]);

  // Reset dynamic translations when language changes
  useEffect(() => {
    setDynamicTranslations({});
    pendingKeysRef.current.clear();
    flushingRef.current = false;
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }
  }, [currentLang]);

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
      batchTimerRef.current = setTimeout(flushPendingTranslations, 150);
    }

    // Return English fallback while translating
    return String(i18n.t(key, { lng: 'english', ...options }));
  }, [needsDynamicTranslation, dynamicTranslations, t, i18n, flushPendingTranslations]);

  return { st, isTranslating, currentLang, i18n };
}
