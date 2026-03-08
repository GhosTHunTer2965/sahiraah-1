import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

    // Translate each text via Sarvam API (batch up to 50 at a time)
    const batchSize = 10;
    const results: string[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const promises = batch.map(async (text: string) => {
        if (!text || text.trim() === '') return text;

        const response = await fetch('https://api.sarvam.ai/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': SARVAM_API_KEY,
          },
          body: JSON.stringify({
            input: text.slice(0, 2000),
            source_language_code: sourceLanguage || 'auto',
            target_language_code: targetLanguage,
            model: 'mayura:v1',
            enable_preprocessing: true,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Sarvam API error [${response.status}]:`, errorText);
          return text; // Return original on error
        }

        const data = await response.json();
        return data.translated_text || text;
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
