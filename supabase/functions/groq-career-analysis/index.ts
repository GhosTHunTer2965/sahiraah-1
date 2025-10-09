import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, answers } = await req.json();
    
    console.log('Processing career analysis for session:', sessionId);
    console.log('Total answers received:', answers?.length);

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      console.error('GROQ_API_KEY not found, please update the secret');
      throw new Error('GROQ_API_KEY not configured');
    }

    // Format answers for AI analysis
    const answersText = answers.map((a: any, i: number) => 
      `Q${i + 1}: ${a.question}\nAnswer: ${a.answer}`
    ).join('\n\n');

    const analysisPrompt = `You are an expert career counselor analyzing a student's comprehensive career assessment.

ASSESSMENT RESPONSES:
${answersText}

TASK: Generate exactly 5 career recommendations with detailed analysis and learning resources.

CRITICAL REQUIREMENTS:
1. Each career MUST include exactly 3 courses at each level (Beginner, Intermediate, Advanced)
2. Use ONLY working, free, and accessible course URLs from these platforms:
   - FreeCodeCamp (https://www.freecodecamp.org/)
   - Coursera (free courses at https://www.coursera.org/)
   - Khan Academy (https://www.khanacademy.org/)
   - YouTube (verified educational channels)
   - Codecademy (free courses at https://www.codecademy.com/)
   - edX (free courses at https://www.edx.org/)
3. All courses must be relevant to India's job market
4. Salary ranges must be in Indian Rupees (LPA format)

Return EXACTLY this JSON structure:
{
  "strengths": ["Strength 1", "Strength 2", "Strength 3", "Strength 4"],
  "areasForImprovement": ["Area 1", "Area 2", "Area 3"],
  "careerRecommendations": [
    {
      "title": "Career Title",
      "description": "Detailed description explaining why this career matches their profile (2-3 sentences)",
      "matchScore": 95,
      "growthPotential": "Specific growth opportunities in India",
      "salaryRange": "₹X-Y LPA",
      "keySkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
      "educationPath": "Specific education recommendations for Indian students",
      "freeResources": {
        "beginner": [
          {
            "title": "Course Title",
            "url": "https://exact-working-url.com/course",
            "platform": "Platform Name",
            "duration": "X weeks"
          },
          {
            "title": "Course Title 2",
            "url": "https://exact-working-url.com/course2",
            "platform": "Platform Name",
            "duration": "X weeks"
          },
          {
            "title": "Course Title 3",
            "url": "https://exact-working-url.com/course3",
            "platform": "Platform Name",
            "duration": "X weeks"
          }
        ],
        "intermediate": [
          {
            "title": "Course Title",
            "url": "https://exact-working-url.com/course",
            "platform": "Platform Name",
            "duration": "X weeks"
          },
          {
            "title": "Course Title 2",
            "url": "https://exact-working-url.com/course2",
            "platform": "Platform Name",
            "duration": "X weeks"
          },
          {
            "title": "Course Title 3",
            "url": "https://exact-working-url.com/course3",
            "platform": "Platform Name",
            "duration": "X weeks"
          }
        ],
        "advanced": [
          {
            "title": "Course Title",
            "url": "https://exact-working-url.com/course",
            "platform": "Platform Name",
            "duration": "X weeks"
          },
          {
            "title": "Course Title 2",
            "url": "https://exact-working-url.com/course2",
            "platform": "Platform Name",
            "duration": "X weeks"
          },
          {
            "title": "Course Title 3",
            "url": "https://exact-working-url.com/course3",
            "platform": "Platform Name",
            "duration": "X weeks"
          }
        ]
      }
    }
  ],
  "personalityInsights": "Detailed personality analysis based on responses (3-4 sentences)",
  "recommendedNextSteps": ["Step 1", "Step 2", "Step 3", "Step 4"]
}

Generate all 5 career recommendations following this exact format.`;

    console.log('Calling Groq API for career analysis...');

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career counselor specializing in Indian job market and education pathways. You provide accurate, practical career guidance with real course recommendations.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, errorText);
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    console.log('Groq API response received');

    const analysisText = groqData.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not extract JSON from response');
      throw new Error('Invalid response format from AI');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate that we have exactly 5 career recommendations
    if (!analysis.careerRecommendations || analysis.careerRecommendations.length !== 5) {
      console.error('Invalid number of career recommendations');
      throw new Error('AI did not generate exactly 5 career recommendations');
    }

    // Validate each recommendation has 3 courses per level
    for (const career of analysis.careerRecommendations) {
      if (!career.freeResources?.beginner || career.freeResources.beginner.length !== 3 ||
          !career.freeResources?.intermediate || career.freeResources.intermediate.length !== 3 ||
          !career.freeResources?.advanced || career.freeResources.advanced.length !== 3) {
        console.error('Invalid course structure in career recommendation');
        throw new Error('Career recommendations must have exactly 3 courses per level');
      }
    }

    console.log('Successfully generated 5 career recommendations with proper course structure');

    // Store recommendations in user_career_history
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Get user ID from session
      const { data: sessionData } = await supabase
        .from('user_quiz_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (sessionData?.user_id) {
        // Store each career recommendation in history
        for (const career of analysis.careerRecommendations) {
          await supabase.from('user_career_history').insert({
            user_id: sessionData.user_id,
            session_id: sessionId,
            career: career.title,
            reason: career.description,
            courses: career.freeResources,
            strengths: analysis.strengths,
            weaknesses: analysis.areasForImprovement,
            improvement_areas: analysis.areasForImprovement,
            report_data: {
              matchScore: career.matchScore,
              growthPotential: career.growthPotential,
              salaryRange: career.salaryRange,
              keySkills: career.keySkills,
              educationPath: career.educationPath,
              personalityInsights: analysis.personalityInsights,
              recommendedNextSteps: analysis.recommendedNextSteps
            }
          });
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      recommendations: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in groq-career-analysis:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to generate career analysis'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
