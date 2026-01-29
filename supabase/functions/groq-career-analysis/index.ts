import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { z } from "https://esm.sh/zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const answerSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(2000),
});

const requestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  answers: z.array(answerSchema).max(50).optional().default([]),
  action: z.enum(['generate_questions', 'analyze']).optional(),
  educationLevel: z.string().min(1).max(100).optional().default('Not specified'),
});

// Sanitize user input for AI prompts
function sanitizeForPrompt(text: string): string {
  return text
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[<>{}]/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, 2000); // Limit length
}

async function generateAdaptiveQuestions(educationLevel: string) {
  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const sanitizedEducationLevel = sanitizeForPrompt(educationLevel);

  const questionPrompt = `Generate 20 personalized career discovery questions for a student at: ${sanitizedEducationLevel}

REQUIREMENTS:
- First 15 questions: Multiple-choice with 4 options (A, B, C, D)
- Last 5 questions: Open-ended text questions
- Tailor question complexity to education level
- For 10th/12th standard: Focus on interests, subjects, basic career awareness
- For Undergraduate: Focus on specialization, skills, career goals
- For Postgraduate: Focus on advanced specialization, research, industry experience

Return EXACTLY this JSON format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "type": "multiple-choice",
      "category": "personality/interests/skills/goals",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"]
    }
  ]
}

Generate all 20 questions (15 MCQ + 5 text) tailored to ${sanitizedEducationLevel}.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
          content: 'You are an expert career counselor creating personalized assessment questions for Indian students.'
        },
        {
          role: 'user',
          content: questionPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Invalid response format');
  }

  const result = JSON.parse(jsonMatch[0]);

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate input
    const validationResult = requestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid input data'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { sessionId, answers, action, educationLevel } = validationResult.data;
    
    // Sanitize inputs
    const sanitizedEducationLevel = sanitizeForPrompt(educationLevel);
    const sanitizedAnswers = answers.map(a => ({
      question: sanitizeForPrompt(a.question),
      answer: sanitizeForPrompt(a.answer),
    }));
    
    // Handle question generation
    if (action === 'generate_questions') {
      return await generateAdaptiveQuestions(sanitizedEducationLevel);
    }
    
    console.log('Processing career analysis for session:', sessionId);
    console.log('Education level:', sanitizedEducationLevel);
    console.log('Total answers received:', sanitizedAnswers.length);

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      console.error('GROQ_API_KEY not found, please update the secret');
      throw new Error('GROQ_API_KEY not configured');
    }

    // Format answers for AI analysis
    const answersText = sanitizedAnswers.map((a, i) => 
      `Q${i + 1}: ${a.question}\nAnswer: ${a.answer}`
    ).join('\n\n');

    const analysisPrompt = `You are an expert career counselor analyzing a student's comprehensive career assessment.

STUDENT PROFILE:
Education Level: ${sanitizedEducationLevel}

ASSESSMENT RESPONSES:
${answersText}

TASK: Generate exactly 5 career recommendations with detailed step-by-step roadmaps and learning resources.

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
      "roadmap": {
        "currentStage": "Based on education level: ${sanitizedEducationLevel}",
        "steps": [
          {
            "stage": "Stage name (e.g., Complete 12th Standard)",
            "duration": "Time estimate",
            "actions": ["Action 1", "Action 2", "Action 3"],
            "milestones": ["Milestone 1", "Milestone 2"]
          }
        ],
        "timeline": "Total estimated time from current level to career",
        "criticalDecisions": ["Decision 1", "Decision 2"]
      },
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
      throw new Error('AI service temporarily unavailable');
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

    // Store recommendations in user_career_history if sessionId is provided
    if (sessionId) {
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
      error: 'An error occurred processing your request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
