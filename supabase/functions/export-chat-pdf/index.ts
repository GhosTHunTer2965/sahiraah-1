import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { z } from "https://esm.sh/zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const exportSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID")
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: user, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user.user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const rawBody = await req.json();
    const validationResult = exportSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid input data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { conversationId } = validationResult.data;

    // Fetch conversation and messages
    const [conversationResult, messagesResult] = await Promise.all([
      supabaseClient
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.user.id)
        .single(),
      supabaseClient
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true })
    ]);

    if (conversationResult.error || !conversationResult.data) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const conversation = conversationResult.data;
    const messages = messagesResult.data || [];

    // Sanitize text for HTML output
    const sanitizeHtml = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // Generate HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Career Guidance Session - ${sanitizeHtml(conversation.title)}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #1d3557; padding-bottom: 20px; margin-bottom: 30px; }
        .title { color: #1d3557; font-size: 24px; font-weight: bold; }
        .subtitle { color: #666; font-size: 14px; margin-top: 10px; }
        .message { margin-bottom: 25px; padding: 15px; border-radius: 8px; }
        .user-message { background-color: #f8f9fa; border-left: 4px solid #1d3557; }
        .assistant-message { background-color: #fff; border: 1px solid #e0e0e0; }
        .message-role { font-weight: bold; color: #1d3557; margin-bottom: 8px; }
        .message-content { }
        .structured-section { margin: 15px 0; }
        .section-title { font-weight: bold; color: #1d3557; margin-bottom: 10px; font-size: 16px; }
        .subsection-title { font-weight: bold; color: #666; margin: 10px 0 5px 0; }
        .list-item { margin: 5px 0; }
        .college-item { background: #f8f9fa; padding: 10px; margin: 8px 0; border-radius: 4px; }
        .roadmap-item { background: #e8f4f8; padding: 8px; margin: 5px 0; border-radius: 4px; }
        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Career Guidance Session</div>
        <div class="subtitle">${sanitizeHtml(conversation.title)}</div>
        <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
    </div>

    ${messages.map(message => {
      let content = sanitizeHtml(message.content);
      
      // If it's an assistant message with structured data, format it nicely
      if (message.role === 'assistant' && message.metadata) {
        const data = message.metadata;
        content = `
          <div class="structured-section">
            <div class="section-title">📍 Career Path Summary</div>
            <div><strong>Feasibility:</strong> ${sanitizeHtml(String(data.careerPathSummary?.feasibility || 'Not specified'))}</div>
            ${data.careerPathSummary?.alternativeRoutes?.length ? 
              `<div class="subsection-title">Alternative Routes:</div>
               ${(data.careerPathSummary.alternativeRoutes as string[]).map(route => `<div class="list-item">• ${sanitizeHtml(String(route))}</div>`).join('')}` 
              : ''}
          </div>

          ${data.collegesAndCourses?.length ? `
          <div class="structured-section">
            <div class="section-title">🏫 Colleges & Courses</div>
            ${(data.collegesAndCourses as any[]).map(college => `
              <div class="college-item">
                <strong>${sanitizeHtml(String(college.name))}</strong> - ${sanitizeHtml(String(college.program))}<br>
                <small>📍 ${sanitizeHtml(String(college.location))} | 📝 ${sanitizeHtml(String(college.entranceExam))} | 🌐 ${sanitizeHtml(String(college.website))}</small>
              </div>
            `).join('')}
          </div>` : ''}

          ${data.jobInsights ? `
          <div class="structured-section">
            <div class="section-title">💼 Job & Salary Insights</div>
            ${data.jobInsights.roles?.length ? 
              `<div class="subsection-title">Job Roles:</div>
               ${(data.jobInsights.roles as string[]).map(role => `<div class="list-item">• ${sanitizeHtml(String(role))}</div>`).join('')}` 
              : ''}
            ${data.jobInsights.salaryRanges ? 
              `<div class="subsection-title">Salary Ranges:</div>
               ${Object.entries(data.jobInsights.salaryRanges).map(([key, value]) => 
                 `<div class="list-item">• ${sanitizeHtml(String(key))}: ${sanitizeHtml(String(value))}</div>`
               ).join('')}` 
              : ''}
          </div>` : ''}

          ${data.preparationTips ? `
          <div class="structured-section">
            <div class="section-title">📚 Preparation Tips</div>
            ${data.preparationTips.freeResources?.length ? 
              `<div class="subsection-title">Free Resources:</div>
               ${(data.preparationTips.freeResources as any[]).map(resource => 
                 `<div class="list-item">• <strong>${sanitizeHtml(String(resource.name))}:</strong> ${sanitizeHtml(String(resource.description))}</div>`
               ).join('')}` 
              : ''}
            ${data.preparationTips.examStrategy ? 
              `<div class="subsection-title">Exam Strategy:</div>
               <div>${sanitizeHtml(String(data.preparationTips.examStrategy))}</div>` 
              : ''}
          </div>` : ''}

          ${data.successProbability ? `
          <div class="structured-section">
            <div class="section-title">📊 Success Probability</div>
            <div><strong>Assessment:</strong> ${sanitizeHtml(String(data.successProbability.percentage))}</div>
            ${data.successProbability.factors?.length ? 
              `<div class="subsection-title">Success Factors:</div>
               ${(data.successProbability.factors as string[]).map(factor => `<div class="list-item">• ${sanitizeHtml(String(factor))}</div>`).join('')}` 
              : ''}
          </div>` : ''}

          ${data.nextStepsRoadmap?.length ? `
          <div class="structured-section">
            <div class="section-title">🗺️ Next Steps Roadmap</div>
            ${(data.nextStepsRoadmap as any[]).map(step => `
              <div class="roadmap-item">
                <strong>${sanitizeHtml(String(step.step))}</strong><br>
                <small>⏰ ${sanitizeHtml(String(step.timeline))} | 🔥 Priority: ${sanitizeHtml(String(step.priority))}</small>
              </div>
            `).join('')}
          </div>` : ''}
        `;
      }

      return `
        <div class="message ${message.role === 'user' ? 'user-message' : 'assistant-message'}">
          <div class="message-role">${message.role === 'user' ? '👤 You' : '🤖 AI Career Advisor'}</div>
          <div class="message-content">${content}</div>
        </div>
      `;
    }).join('')}

    <div class="footer">
        <div>Career Guidance powered by AI</div>
        <div>This report is generated based on your conversation session</div>
    </div>
</body>
</html>`;

    // Record the export
    await supabaseClient
      .from('chat_exports')
      .insert({
        user_id: user.user.id,
        conversation_id: conversationId
      });

    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="career-guidance-${conversationId.slice(0, 8)}.html"`
      },
    });

  } catch (error) {
    console.error('Error in export-chat-pdf function:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
