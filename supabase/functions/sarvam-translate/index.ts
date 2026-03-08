import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Languages supported by mayura:v1 (faster, cheaper)
const MAYURA_LANGUAGES = new Set([
  'bn-IN', 'en-IN', 'gu-IN', 'hi-IN', 'kn-IN', 'ml-IN', 'mr-IN', 'od-IN', 'pa-IN', 'ta-IN', 'te-IN'
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SARVAM_API_KEY = Deno.env.get('SARVAM_API_KEY');
    if (!SARVAM_API_KEY) {
      throw new Error('SARVAM_API_KEY is not configured');
    }

    const { texts, targetLanguage, sourceLanguage } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'texts array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'targetLanguage is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use sarvam-translate:v1 for all 22 languages, mayura:v1 only for its supported subset
    const model = MAYURA_LANGUAGES.has(targetLanguage) ? 'mayura:v1' : 'sarvam-translate:v1';
    console.log(`Translating ${texts.length} texts to ${targetLanguage} using model: ${model}`);

    // Translate each text via Sarvam API
    const batchSize = 10;
    const results: string[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const promises = batch.map(async (text: string) => {
        if (!text || text.trim() === '') return text;

        try {
          const response = await fetch('https://api.sarvam.ai/translate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-subscription-key': SARVAM_API_KEY,
            },
            body: JSON.stringify({
              input: text.slice(0, 2000),
              source_language_code: sourceLanguage || 'en-IN',
              target_language_code: targetLanguage,
              model: model,
              enable_preprocessing: true,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Sarvam API error [${response.status}] for "${text.slice(0, 50)}":`, errorText);
            return text;
          }

          const data = await response.json();
          console.log(`Translated: "${text.slice(0, 30)}..." -> "${(data.translated_text || '').slice(0, 30)}..."`);
          return data.translated_text || text;
        } catch (err) {
          console.error(`Translation failed for "${text.slice(0, 50)}":`, err);
          return text;
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return new Response(
      JSON.stringify({ translations: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sarvam-translate:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Translation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
