import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { historyId } = await req.json();

    if (!historyId) {
      throw new Error('History ID is required');
    }

    // Fetch the history record
    const { data: historyRecord, error: fetchError } = await supabaseClient
      .from('user_career_history')
      .select('*')
      .eq('id', historyId)
      .single();

    if (fetchError) {
      throw new Error('Failed to fetch history record');
    }

    // Sanitize course URLs by checking if they're still valid
    const sanitizedCourses: any[] = [];
    
    if (Array.isArray(historyRecord.courses)) {
      for (const course of historyRecord.courses) {
        try {
          // Basic URL validation and sanitization
          if (course.url && typeof course.url === 'string') {
            const url = new URL(course.url);
            // Only allow https URLs for security
            if (url.protocol === 'https:') {
              // Try to fetch the URL to check if it's still valid
              const response = await fetch(course.url, { 
                method: 'HEAD',
                signal: AbortSignal.timeout(5000) // 5 second timeout
              });
              
              if (response.ok) {
                sanitizedCourses.push({
                  ...course,
                  url: course.url,
                  verified: true,
                  lastChecked: new Date().toISOString()
                });
              } else {
                // Keep the course but mark as potentially unavailable
                sanitizedCourses.push({
                  ...course,
                  url: course.url,
                  verified: false,
                  lastChecked: new Date().toISOString(),
                  status: 'url_unreachable'
                });
              }
            } else {
              // Convert http to https if possible, otherwise mark as insecure
              const httpsUrl = course.url.replace(/^http:/, 'https:');
              sanitizedCourses.push({
                ...course,
                url: httpsUrl,
                verified: false,
                lastChecked: new Date().toISOString(),
                status: 'converted_to_https'
              });
            }
          } else {
            // Course without URL or invalid URL
            sanitizedCourses.push({
              ...course,
              verified: false,
              lastChecked: new Date().toISOString(),
              status: 'no_valid_url'
            });
          }
        } catch (error) {
          // If URL validation fails, keep course but mark as invalid
          sanitizedCourses.push({
            ...course,
            verified: false,
            lastChecked: new Date().toISOString(),
            status: 'url_validation_failed'
          });
        }
      }
    }

    // Update the history record with sanitized courses
    const { error: updateError } = await supabaseClient
      .from('user_career_history')
      .update({
        courses: sanitizedCourses,
        updated_at: new Date().toISOString()
      })
      .eq('id', historyId);

    if (updateError) {
      throw new Error('Failed to update history record');
    }

    return new Response(JSON.stringify({
      success: true,
      sanitizedCount: sanitizedCourses.length,
      verifiedCount: sanitizedCourses.filter(c => c.verified).length,
      courses: sanitizedCourses
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sanitize-history-courses function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
