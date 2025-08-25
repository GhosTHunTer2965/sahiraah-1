
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, userId, answers, studentName, educationLevel } = await req.json();
    
    console.log('Analyzing career guidance for:', { sessionId, userId, studentName, educationLevel });
    
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Enhanced fallback analysis when OpenAI fails
    let analysis;
    
    // Check if OpenAI API key is available and valid
    if (openAIApiKey && openAIApiKey.trim() !== '') {
      try {
        // Create comprehensive analysis prompt for Indian students
        const analysisPrompt = `You are an expert career counselor specializing in guidance for Indian students. 

Analyze the following student profile and quiz responses:
- Name: ${studentName}
- Education Level: ${educationLevel}
- Quiz Responses: ${JSON.stringify(answers, null, 2)}

Provide a comprehensive career analysis with:

1. STRENGTHS (3-5 key strengths based on responses)
2. AREAS FOR IMPROVEMENT (2-3 areas to develop)
3. TOP 5 CAREER RECOMMENDATIONS specifically suitable for Indian students with:
   - Career title
   - Why it matches their profile
   - Growth potential in India
   - Salary range in INR
   - Key skills needed
   - Educational pathway required

4. SKILL DEVELOPMENT ROADMAP for top career choice

Focus on:
- Current Indian job market trends
- Emerging technologies and opportunities
- Practical, actionable advice
- Clear learning pathways

Return response in JSON format:
{
  "strengths": ["strength1", "strength2", ...],
  "areasForImprovement": ["area1", "area2", ...],
  "careerRecommendations": [
    {
      "title": "Career Title",
      "description": "Why this matches",
      "growthPotential": "Growth prospects",
      "salaryRange": "INR range",
      "keySkills": ["skill1", "skill2", ...],
      "educationPath": "Education requirements",
      "matchScore": 95
    }
  ],
  "skillRoadmap": {
    "immediate": ["Skills to learn now"],
    "shortTerm": ["Skills for next 6 months"],
    "longTerm": ["Skills for career advancement"]
  }
}`;

        // Get AI analysis
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an expert career counselor for Indian students. Provide accurate, practical career guidance.' },
              { role: 'user', content: analysisPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 3000
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`OpenAI API error ${response.status}:`, errorData);
          throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
        }

        const aiData = await response.json();
        
        if (aiData.choices && aiData.choices[0] && aiData.choices[0].message && aiData.choices[0].message.content) {
          analysis = JSON.parse(aiData.choices[0].message.content);
          console.log('AI analysis successful');
        } else {
          throw new Error('Invalid AI response structure');
        }
      } catch (error) {
        console.error('OpenAI analysis failed:', error);
        console.log('Falling back to fallback analysis');
        analysis = null;
      }
    } else {
      console.log('OpenAI API key not configured, using fallback analysis');
    }

    // Enhanced fallback analysis based on user responses
    if (!analysis) {
      console.log('Using fallback analysis');
      analysis = generateFallbackAnalysis(answers, studentName, educationLevel);
    }

    // Update quiz session with analysis results
    const { error: sessionError } = await supabase
      .from('user_quiz_sessions')
      .update({
        session_completed_at: new Date().toISOString(),
        is_completed: true,
        student_name: studentName,
        education_level: educationLevel,
        strengths: analysis.strengths,
        weaknesses: analysis.areasForImprovement,
        career_recommendations: analysis.careerRecommendations
      })
      .eq('id', sessionId);

    if (sessionError) {
      console.error('Session update error:', sessionError);
      throw sessionError;
    }

    // Store career recommendations in history
    const careersToStore = analysis.careerRecommendations.slice(0, 3);
    for (const career of careersToStore) {
      const { error: historyError } = await supabase
        .from('user_career_history')
        .insert({
          user_id: userId,
          session_id: sessionId,
          career: career.title,
          reason: career.description,
          strengths: analysis.strengths,
          weaknesses: analysis.areasForImprovement,
          improvement_areas: analysis.areasForImprovement,
          report_data: {
            salary_range: career.salaryRange,
            growth_potential: career.growthPotential,
            key_skills: career.keySkills,
            education_path: career.educationPath,
            match_score: career.matchScore
          }
        });

      if (historyError) {
        console.error('Career history insert error:', historyError);
      }
    }

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysis: analysis,
      sessionId: sessionId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in career analysis:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackAnalysis(answers: Record<string, string>, studentName: string, educationLevel: string) {
  const answerText = Object.values(answers).join(' ').toLowerCase();
  
  // Analyze interests from responses
  const hasCodeInterest = answerText.includes('coding') || answerText.includes('programming') || answerText.includes('software') || answerText.includes('technology');
  const hasDesignInterest = answerText.includes('design') || answerText.includes('creative') || answerText.includes('art');
  const hasDataInterest = answerText.includes('data') || answerText.includes('analysis') || answerText.includes('research');
  const hasBusinessInterest = answerText.includes('business') || answerText.includes('management') || answerText.includes('entrepreneur');
  
  let primaryCareer = "Software Developer";
  let careerDescription = "Your responses indicate strong analytical thinking and problem-solving skills, making software development an excellent fit.";
  
  if (hasDesignInterest) {
    primaryCareer = "UI/UX Designer";
    careerDescription = "Your creative thinking and design interests align perfectly with user experience design.";
  } else if (hasDataInterest) {
    primaryCareer = "Data Scientist";
    careerDescription = "Your analytical approach and interest in patterns make data science an ideal career path.";
  } else if (hasBusinessInterest) {
    primaryCareer = "Product Manager";
    careerDescription = "Your strategic thinking and business acumen are well-suited for product management.";
  }

  return {
    strengths: [
      "Strong analytical and problem-solving abilities",
      "Good communication and collaboration skills",
      "Adaptable and eager to learn new technologies",
      "Strategic thinking and planning capabilities"
    ],
    areasForImprovement: [
      "Building confidence with new technologies and tools",
      "Developing stronger presentation and public speaking skills",
      "Gaining more hands-on experience through practical projects"
    ],
    careerRecommendations: [
      {
        title: primaryCareer,
        description: careerDescription,
        growthPotential: "Excellent growth prospects in India's expanding tech sector",
        salaryRange: "₹3-15 LPA (Entry to Mid-level), ₹15-50+ LPA (Senior/Lead)",
        keySkills: ["Problem Solving", "Technical Skills", "Communication", "Project Management"],
        educationPath: `Build foundational skills through online courses and practical projects. ${educationLevel} provides a good starting point.`,
        matchScore: 88
      },
      {
        title: "Digital Marketing Specialist",
        description: "Combines creativity with analytical thinking, perfect for the growing digital economy",
        growthPotential: "High demand across all industries for digital transformation",
        salaryRange: "₹2-10 LPA (Entry to Mid-level), ₹10-25+ LPA (Senior/Manager)",
        keySkills: ["Digital Strategy", "Content Creation", "Analytics", "SEO/SEM"],
        educationPath: "Start with digital marketing certifications and hands-on campaign experience",
        matchScore: 82
      },
      {
        title: "Business Analyst",
        description: "Perfect blend of analytical thinking and business understanding",
        growthPotential: "Growing demand as companies focus on data-driven decisions",
        salaryRange: "₹4-12 LPA (Entry to Mid-level), ₹12-30+ LPA (Senior/Lead)",
        keySkills: ["Data Analysis", "Business Process", "Communication", "Problem Solving"],
        educationPath: "Develop analytical skills and gain business domain knowledge",
        matchScore: 79
      }
    ],
    skillRoadmap: {
      immediate: ["Basic programming concepts", "Communication skills", "Digital literacy"],
      shortTerm: ["Specialized technical skills", "Project management", "Industry knowledge"],
      longTerm: ["Leadership capabilities", "Advanced specialization", "Innovation mindset"]
    }
  };
}
