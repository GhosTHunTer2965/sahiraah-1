import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Language code mapping for Sarvam AI
export const SARVAM_LANGUAGES: Record<string, { code: string; label: string; nativeLabel: string }> = {
  english: { code: 'en-IN', label: 'English', nativeLabel: 'English' },
  hindi: { code: 'hi-IN', label: 'Hindi', nativeLabel: 'हिन्दी' },
  tamil: { code: 'ta-IN', label: 'Tamil', nativeLabel: 'தமிழ்' },
  telugu: { code: 'te-IN', label: 'Telugu', nativeLabel: 'తెలుగు' },
  kannada: { code: 'kn-IN', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  marathi: { code: 'mr-IN', label: 'Marathi', nativeLabel: 'मराठी' },
  bengali: { code: 'bn-IN', label: 'Bengali', nativeLabel: 'বাংলা' },
  gujarati: { code: 'gu-IN', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  malayalam: { code: 'ml-IN', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  punjabi: { code: 'pa-IN', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
  odia: { code: 'od-IN', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
};

// In-memory cache for translations
const translationCache: Record<string, Record<string, string>> = {};

function getCacheKey(lang: string): string {
  return `sarvam_translations_${lang}`;
}

export function useSarvamTranslation() {
  const pendingRef = useRef<Record<string, Promise<Record<string, string>>>>({});

  const translateTexts = useCallback(async (
    texts: string[],
    targetLang: string
  ): Promise<Record<string, string>> => {
    if (targetLang === 'english') {
      // No translation needed for English
      const result: Record<string, string> = {};
      texts.forEach(t => { result[t] = t; });
      return result;
    }

    const langConfig = SARVAM_LANGUAGES[targetLang];
    if (!langConfig) {
      console.warn(`Unsupported language: ${targetLang}`);
      const result: Record<string, string> = {};
      texts.forEach(t => { result[t] = t; });
      return result;
    }

    // Check cache
    const cacheKey = getCacheKey(targetLang);
    if (!translationCache[cacheKey]) {
      translationCache[cacheKey] = {};
      // Try to load from localStorage
      try {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          translationCache[cacheKey] = JSON.parse(stored);
        }
      } catch {}
    }

    const cached = translationCache[cacheKey];
    // Filter out entries where cached value equals the original (failed translations)
    const uncachedTexts = texts.filter(t => !cached[t] || cached[t] === t);

    if (uncachedTexts.length === 0) {
      const result: Record<string, string> = {};
      texts.forEach(t => { result[t] = cached[t]; });
      return result;
    }

    // Call edge function
    try {
      const { data, error } = await supabase.functions.invoke('sarvam-translate', {
        body: {
          texts: uncachedTexts,
          targetLanguage: langConfig.code,
          sourceLanguage: 'en-IN',
        },
      });

      if (error) throw error;

      const translations = data.translations as string[];
      uncachedTexts.forEach((text, i) => {
        cached[text] = translations[i] || text;
      });

      // Persist to localStorage
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cached));
      } catch {}

      const result: Record<string, string> = {};
      texts.forEach(t => { result[t] = cached[t] || t; });
      return result;
    } catch (err) {
      console.error('Translation error:', err);
      const result: Record<string, string> = {};
      texts.forEach(t => { result[t] = cached[t] || t; });
      return result;
    }
  }, []);

  return { translateTexts, SARVAM_LANGUAGES };
}
