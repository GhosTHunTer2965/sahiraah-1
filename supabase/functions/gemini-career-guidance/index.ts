
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { action, answers, currentQuestionCount, userName, educationLevel } = await req.json();
    
    console.log('Gemini Career Guidance:', { action, currentQuestionCount, answersCount: answers?.length, userName, educationLevel });

    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in Supabase secrets.');
    }

    if (action === 'generate_question') {
      return await generateNextQuestion(answers, currentQuestionCount, userName, educationLevel);
    } else if (action === 'generate_report') {
      return await generateCareerReport(answers, userName, educationLevel);
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error in gemini-career-guidance:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateNextQuestion(answers: any[], currentQuestionCount: number, userName: string, educationLevel: string) {
  const maxQuestions = 15;
  
  if (currentQuestionCount >= maxQuestions) {
    return new Response(JSON.stringify({
      success: true,
      isComplete: true,
      message: "Assessment complete! Generating your career recommendations..."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Build context from previous answers
  const answerContext = answers.map((a, i) => 
    `Q${i + 1}: ${a.question}\nAnswer: ${a.answer}`
  ).join('\n\n');

  const questionPrompt = `You are an expert career counselor for Indian students. Generate the next question in a personalized career assessment.

STUDENT PROFILE:
- Name: ${userName}
- Education Level: ${educationLevel}
- Current Question: ${currentQuestionCount + 1} of ${maxQuestions}

EDUCATION LEVEL UNDERSTANDING:
${educationLevel.toLowerCase().includes('sslc') || educationLevel.toLowerCase().includes('10th') ? 'Student is in 10th standard/SSLC - focus on discovering basic interests and aptitudes' : ''}
${educationLevel.toLowerCase().includes('puc') || educationLevel.toLowerCase().includes('12th') ? 'Student is in 12th/PUC - focus on subject interests and career direction' : ''}
${educationLevel.toLowerCase().includes('graduate') || educationLevel.toLowerCase().includes('degree') ? 'Student is a graduate - focus on specialization and career advancement' : ''}

PREVIOUS RESPONSES:
${answerContext || 'No previous responses yet - start with discovering their core interests'}

TREE-BASED QUESTIONING LOGIC:
Create a question that builds directly on their previous answers. Each question should:
1. Be specific and engaging (max 15 words)
2. Build on their last answer to go deeper
3. Focus on discovering interests, skills, and career aspirations
4. Be appropriate for their education level
5. Use simple, clear language

QUESTION CATEGORIES TO EXPLORE:
- interests: What activities engage them naturally?
- skills: What are they naturally good at?
- values: What matters most to them in work?
- work_style: How do they prefer to work?
- goals: What do they want to achieve?
- subjects: Academic preferences and strengths
- problem_solving: How they approach challenges
- social_impact: What change they want to create

Return EXACTLY this JSON format:
{
  "question": "Clear, engaging question based on their responses",
  "type": "text",
  "placeholder": "Helpful placeholder text for the answer field",
  "category": "most_relevant_category",
  "reasoning": "Brief explanation of why this question helps their career discovery"
}

Generate a question that naturally follows their journey of self-discovery.`;

  try {
    console.log('Calling Gemini API with prompt length:', questionPrompt.length);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: questionPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini response structure:', data);
      throw new Error('Invalid response from Gemini API');
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('Generated text:', generatedText);
    
    // Clean up the response to extract JSON
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not extract JSON from:', generatedText);
      throw new Error('Could not extract JSON from response');
    }

    const questionData = JSON.parse(jsonMatch[0]);
    console.log('Parsed question data:', questionData);
    
    // Validate the response
    if (!questionData.question || !questionData.category) {
      console.error('Invalid question format:', questionData);
      throw new Error('Invalid question format from AI');
    }

    return new Response(JSON.stringify({
      success: true,
      isComplete: false,
      question: questionData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating question:', error);
    
    // Fallback question based on question count
    const fallbackQuestion = getFallbackQuestion(currentQuestionCount, answers);
    
    return new Response(JSON.stringify({
      success: true,
      isComplete: false,
      question: fallbackQuestion,
      fallback: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function generateCareerReport(answers: any[], userName: string, educationLevel: string) {
  const answerContext = answers.map((a, i) => 
    `Q${i + 1}: ${a.question}\nAnswer: ${a.answer}`
  ).join('\n\n');

  const reportPrompt = `You are an expert career counselor analyzing responses for personalized career guidance.

STUDENT PROFILE:
- Name: ${userName}
- Education Level: ${educationLevel}
- Questions Answered: ${answers.length}

RESPONSES:
${answerContext}

Generate career recommendations with VERIFIED, WORKING course links. Focus on careers that match their interests and education level.

Return EXACTLY this JSON format:
{
  "strengths": ["Strength 1", "Strength 2", "Strength 3", "Strength 4"],
  "areasForImprovement": ["Area 1", "Area 2", "Area 3"],
  "careerRecommendations": [
    {
      "title": "Career Title",
      "description": "Why this career matches their profile",
      "matchScore": 95,
      "growthPotential": "Growth opportunities in India",
      "salaryRange": "₹X-Y LPA",
      "keySkills": ["Skill 1", "Skill 2", "Skill 3"],
      "educationPath": "Recommended education path",
      "freeResources": {
        "beginner": [
          {"title": "Course 1", "url": "https://www.freecodecamp.org/learn/", "platform": "FreeCodeCamp", "duration": "4 weeks"},
          {"title": "Course 2", "url": "https://www.coursera.org/", "platform": "Coursera", "duration": "6 weeks"},
          {"title": "Course 3", "url": "https://www.khanacademy.org/", "platform": "Khan Academy", "duration": "3 weeks"}
        ],
        "intermediate": [
          {"title": "Course 1", "url": "https://www.edx.org/", "platform": "edX", "duration": "8 weeks"},
          {"title": "Course 2", "url": "https://ocw.mit.edu/", "platform": "MIT OCW", "duration": "10 weeks"},
          {"title": "Course 3", "url": "https://www.coursera.org/", "platform": "Coursera", "duration": "12 weeks"}
        ],
        "advanced": [
          {"title": "Course 1", "url": "https://ocw.mit.edu/", "platform": "MIT OCW", "duration": "12 weeks"},
          {"title": "Course 2", "url": "https://www.edx.org/", "platform": "edX", "duration": "14 weeks"},
          {"title": "Course 3", "url": "https://online-learning.harvard.edu/", "platform": "Harvard Online", "duration": "16 weeks"}
        ]
      }
    }
  ],
  "personalityInsights": "Analysis of their interests and work style",
  "recommendedNextSteps": ["Step 1", "Step 2", "Step 3"]
}

Focus on careers that genuinely match their responses and provide actionable guidance.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: reportPrompt }]
        }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 4000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Clean up the response to extract JSON
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const reportData = JSON.parse(jsonMatch[0]);
    
    return new Response(JSON.stringify({
      success: true,
      analysis: reportData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating report:', error);
    
    // Fallback analysis based on education level
    const fallbackAnalysis = getFallbackAnalysis(educationLevel, answers);
    
    return new Response(JSON.stringify({
      success: true,
      analysis: fallbackAnalysis,
      fallback: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

function getFallbackQuestion(questionCount: number, answers: any[]) {
  const fallbackQuestions = [
    {
      question: "What activities make you lose track of time?",
      type: "text",
      placeholder: "Describe activities that deeply engage you...",
      category: "interests",
      reasoning: "Understanding your natural interests helps identify career paths that will keep you motivated."
    },
    {
      question: "What kind of problems do you enjoy solving?",
      type: "text",
      placeholder: "Share what type of challenges excite you...",
      category: "problem_solving",
      reasoning: "Your problem-solving preferences reveal the type of work environment that suits you best."
    },
    {
      question: "How do you prefer to work with others?",
      type: "text",
      placeholder: "Describe your ideal team dynamics...",
      category: "teamwork",
      reasoning: "Understanding your collaboration style helps match you with suitable career environments."
    },
    {
      question: "What subjects interest you most in your studies?",
      type: "text",
      placeholder: "Tell us about your favorite subjects and why...",
      category: "subjects",
      reasoning: "Academic interests often translate into career preferences and guide educational paths."
    },
    {
      question: "What impact do you want to make in the world?",
      type: "text",
      placeholder: "Share your vision for contributing to society...",
      category: "values",
      reasoning: "Your desired impact helps identify meaningful career paths that align with your values."
    }
  ];

  return fallbackQuestions[questionCount % fallbackQuestions.length];
}

function getFallbackAnalysis(educationLevel: string, answers: any[]) {
  const isEarlyStage = educationLevel.toLowerCase().includes('10th') || educationLevel.toLowerCase().includes('sslc');
  
  return {
    strengths: [
      "Good communication skills",
      "Willingness to learn",
      "Problem-solving mindset",
      "Adaptability"
    ],
    areasForImprovement: [
      "Technical skill development",
      "Industry knowledge",
      "Professional experience"
    ],
    careerRecommendations: [
      {
        title: isEarlyStage ? "Technology & Programming" : "Software Development",
        description: "Based on your responses, technology offers excellent growth opportunities with your learning attitude.",
        matchScore: 85,
        growthPotential: "Excellent growth in India's expanding tech sector",
        salaryRange: isEarlyStage ? "₹3-8 LPA (entry level)" : "₹6-25 LPA",
        keySkills: ["Programming", "Problem Solving", "Logical Thinking"],
        educationPath: isEarlyStage ? "Consider Computer Science in 12th, then BE/B.Tech" : "Continuous learning through courses and projects",
        freeResources: {
          beginner: [
            {"title": "Introduction to Programming", "url": "https://www.freecodecamp.org/learn/", "platform": "FreeCodeCamp", "duration": "4 weeks"},
            {"title": "Computer Science Basics", "url": "https://www.khanacademy.org/computing/computer-programming", "platform": "Khan Academy", "duration": "6 weeks"},
            {"title": "Programming Fundamentals", "url": "https://www.coursera.org/courses?query=programming%20basics", "platform": "Coursera", "duration": "8 weeks"}
          ],
          intermediate: [
            {"title": "Web Development", "url": "https://www.freecodecamp.org/learn/responsive-web-design/", "platform": "FreeCodeCamp", "duration": "10 weeks"},
            {"title": "Data Structures", "url": "https://www.coursera.org/courses?query=data%20structures", "platform": "Coursera", "duration": "12 weeks"},
            {"title": "Full Stack Development", "url": "https://www.edx.org/learn/full-stack-development", "platform": "edX", "duration": "16 weeks"}
          ],
          advanced: [
            {"title": "Advanced Programming", "url": "https://ocw.mit.edu/courses/6-001-structure-and-interpretation-of-computer-programs-spring-2005/", "platform": "MIT OCW", "duration": "12 weeks"},
            {"title": "Software Engineering", "url": "https://www.edx.org/learn/software-engineering", "platform": "edX", "duration": "14 weeks"},
            {"title": "System Design", "url": "https://ocw.mit.edu/courses/6-033-computer-system-engineering-spring-2018/", "platform": "MIT OCW", "duration": "16 weeks"}
          ]
        }
      }
    ],
    personalityInsights: "You show curiosity and willingness to learn, which are excellent traits for career growth.",
    recommendedNextSteps: [
      "Start with basic courses in your area of interest",
      "Build practical projects to gain experience",
      "Connect with professionals in your chosen field"
    ]
  };
}
