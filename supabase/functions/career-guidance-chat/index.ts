import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CareerGuidanceRequest {
  message: string;
  conversationId?: string;
}

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
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: user, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user.user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, conversationId } = await req.json() as CareerGuidanceRequest;
    
    console.log('Career guidance request from user:', user.user.id);
    console.log('Message:', message);

    let currentConversationId = conversationId;

    // Create new conversation if none exists
    if (!currentConversationId) {
      const conversationTitle = message.slice(0, 50) + (message.length > 50 ? '...' : '');
      
      const { data: conversation, error: convError } = await supabaseClient
        .from('chat_conversations')
        .insert({
          user_id: user.user.id,
          title: conversationTitle
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw new Error('Failed to create conversation');
      }

      currentConversationId = conversation.id;
    }

    // Store the user message
    await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: currentConversationId,
        content: message,
        role: 'user'
      });

    // Get conversation history for context
    const { data: messageHistory } = await supabaseClient
      .from('chat_messages')
      .select('content, role')
      .eq('conversation_id', currentConversationId)
      .order('timestamp', { ascending: true })
      .limit(10);

    // Fetch relevant data for context
    const [collegesData, examsData, pathwaysData] = await Promise.all([
      supabaseClient.from('colleges').select('name, location, state, website_url, courses_offered').eq('is_active', true).limit(10),
      supabaseClient.from('entrance_exams').select('exam_name, exam_type, conducting_body, preparation_timeline, preparation_resources').eq('is_active', true).limit(10),
      supabaseClient.from('educational_pathways').select('pathway_title, target_career, duration, steps').eq('is_recommended', true).limit(5)
    ]);

    // Build context for AI
    const systemPrompt = `You are an expert career guidance counselor specializing in Indian education and career paths. You provide comprehensive, conversational advice to students about their career goals.

Context Data Available:
Top Indian Colleges: ${JSON.stringify(collegesData.data || [])}
Entrance Exams: ${JSON.stringify(examsData.data || [])}
Career Pathways: ${JSON.stringify(pathwaysData.data || [])}

IMPORTANT INSTRUCTIONS:
- Reply in a natural, conversational, and friendly tone as if you're chatting with a student
- Break down your advice into clear, easy-to-read paragraphs
- Use bullet points and numbered lists where appropriate to make information scannable
- Include specific college names, entrance exam details, salary ranges when relevant
- Provide actionable next steps and preparation tips
- Be encouraging but realistic about challenges
- Keep responses focused and not too lengthy (aim for 300-500 words)
- Focus on Indian education context and authentic institutions

Example response format:
"That's a great career goal! Let me help you understand the path to becoming a [career].

To pursue [goal], you'll typically need to:
• Complete [degree] from a reputed institution
• Clear entrance exams like [exam names]
• Build skills in [relevant skills]

Here are some top colleges you should consider:
1. [College Name] - [Location] - Entry via [exam]
2. [College Name] - [Location] - Entry via [exam]

For preparation, I recommend:
- Start with [specific advice]
- Focus on [key areas]
- Check out free resources like NPTEL, Khan Academy

Salary expectations: Freshers typically earn [X-Y LPA], while experienced professionals can make [X-Y LPA].

Your next steps should be:
1. [Action item with timeline]
2. [Action item with timeline]

Feel free to ask if you need more specific guidance on any aspect!"

Remember: Write like a helpful mentor, not like a formal report. Be conversational and supportive.`;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(messageHistory || []).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call Groq API instead of OpenAI
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    
    if (!groqApiKey) {
      console.error('GROQ_API_KEY not configured');
      throw new Error('AI service not configured');
    }

    console.log('Calling Groq API...');
    
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, errorData);
      throw new Error(`AI service error: ${groqResponse.status}`);
    }

    const aiData = await groqResponse.json();
    console.log('Groq response received');
    
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error('Invalid AI response structure:', aiData);
      throw new Error('Invalid response from AI service');
    }
    
    const aiMessage = aiData.choices[0].message.content;

    console.log('AI Response:', aiMessage);

    // Store the AI response
    await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: currentConversationId,
        content: aiMessage,
        role: 'assistant'
      });

    return new Response(
      JSON.stringify({
        message: aiMessage,
        conversationId: currentConversationId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in career-guidance-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});