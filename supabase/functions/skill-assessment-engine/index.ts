import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

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

    const { action, quizId, attemptId, answers, userId } = await req.json();

    if (action === 'calculate_percentile') {
      return await calculatePercentile(supabaseClient, { quizId, score: answers.score });
    }

    if (action === 'generate_skill_questions') {
      return await generateSkillQuestions(supabaseClient, { quizId, category: answers.category });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in skill-assessment-engine:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function calculatePercentile(supabaseClient: any, { quizId, score }: any) {
  try {
    // Get all completed attempts for this quiz
    const { data: attempts, error } = await supabaseClient
      .from('skill_quiz_attempts')
      .select('percentage_score')
      .eq('quiz_id', quizId)
      .eq('is_completed', true)
      .not('percentage_score', 'is', null);

    if (error) throw error;

    if (!attempts || attempts.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        percentile: 50, // Default if no data
        totalAttempts: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate percentile
    const scores = attempts.map(a => a.percentage_score).sort((a, b) => a - b);
    const rank = scores.filter(s => s < score).length;
    const percentile = Math.round((rank / scores.length) * 100);

    return new Response(JSON.stringify({
      success: true,
      percentile,
      totalAttempts: scores.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    throw new Error(`Failed to calculate percentile: ${error.message}`);
  }
}

async function generateSkillQuestions(supabaseClient: any, { quizId, category }: any) {
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const prompt = `Generate 10 multiple choice questions for a ${category} skill assessment. 

Requirements:
- Questions should be professional and test actual skill knowledge
- Include 4 options per question (A, B, C, D)
- Mark the correct answer
- Provide brief explanations for learning
- Questions should be appropriate for Indian job market

Return EXACTLY this JSON format:
{
  "questions": [
    {
      "question_text": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "A",
      "explanation": "Brief explanation of why this is correct",
      "points": 1
    }
  ]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const questionsData = JSON.parse(jsonMatch[0]);

    // Insert questions into database
    const questionsToInsert = questionsData.questions.map((q: any, index: number) => ({
      quiz_id: quizId,
      question_text: q.question_text,
      question_type: 'multiple_choice',
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      points: q.points || 1,
      order_index: index
    }));

    const { error: insertError } = await supabaseClient
      .from('skill_questions')
      .insert(questionsToInsert);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({
      success: true,
      questionsCreated: questionsToInsert.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}