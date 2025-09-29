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
    const systemPrompt = `You are an expert career guidance counselor specializing in Indian education and career paths. You provide comprehensive, structured advice to students about their career goals.

Context Data Available:
Top Indian Colleges: ${JSON.stringify(collegesData.data || [])}
Entrance Exams: ${JSON.stringify(examsData.data || [])}
Career Pathways: ${JSON.stringify(pathwaysData.data || [])}

IMPORTANT: Structure your responses in the following JSON format with these exact sections:

{
  "careerPathSummary": {
    "feasibility": "Detailed assessment of how realistic their plan is",
    "alternativeRoutes": ["Alternative path 1", "Alternative path 2"]
  },
  "collegesAndCourses": [
    {
      "name": "College Name",
      "program": "Degree Program",
      "entranceExam": "Required Exam",
      "website": "URL",
      "location": "City, State",
      "admissionDeadline": "When to apply"
    }
  ],
  "jobInsights": {
    "roles": ["Job Role 1", "Job Role 2"],
    "salaryRanges": {
      "fresher": "X-Y LPA",
      "experienced": "X-Y LPA",
      "remote": "X-Y LPA"
    },
    "industryTrends": "Current market insights"
  },
  "preparationTips": {
    "freeResources": [
      {"name": "NPTEL", "url": "https://nptel.ac.in", "description": "Free IIT courses"},
      {"name": "GATE Prep", "url": "https://gate.iitk.ac.in", "description": "Official resources"}
    ],
    "examStrategy": "How to prepare for entrance exams",
    "skillDevelopment": "Technical skills to focus on"
  },
  "successProbability": {
    "percentage": "XX%",
    "factors": ["Factor 1", "Factor 2"],
    "challenges": ["Challenge 1", "Challenge 2"]
  },
  "nextStepsRoadmap": [
    {"step": "Action 1", "timeline": "When", "priority": "High/Medium/Low"},
    {"step": "Action 2", "timeline": "When", "priority": "High/Medium/Low"}
  ]
}

Focus on Indian context, authentic institutions, realistic salary ranges for India, and actionable advice. Be encouraging but honest about challenges.`;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(messageHistory || []).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to get AI response');
    }

    const aiData = await openAIResponse.json();
    const aiMessage = aiData.choices[0].message.content;

    console.log('AI Response:', aiMessage);

    // Parse the AI response as JSON
    let structuredResponse;
    try {
      structuredResponse = JSON.parse(aiMessage);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback to plain text response
      structuredResponse = {
        careerPathSummary: { feasibility: aiMessage, alternativeRoutes: [] },
        collegesAndCourses: [],
        jobInsights: { roles: [], salaryRanges: {}, industryTrends: "" },
        preparationTips: { freeResources: [], examStrategy: "", skillDevelopment: "" },
        successProbability: { percentage: "N/A", factors: [], challenges: [] },
        nextStepsRoadmap: []
      };
    }

    // Store the AI response
    await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: currentConversationId,
        content: aiMessage,
        role: 'assistant',
        metadata: structuredResponse
      });

    return new Response(
      JSON.stringify({
        response: structuredResponse,
        conversationId: currentConversationId,
        rawContent: aiMessage
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