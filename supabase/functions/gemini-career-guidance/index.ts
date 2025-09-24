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

const questionPrompt = `You are an expert career counselor for Indian students. Generate the next SHORT question in a TREE-BASED career assessment that builds on previous answers to discover the student's TRUE INTERESTS and PERSONALITY.

STUDENT PROFILE:
- Name: ${userName}
- Education Level: ${educationLevel}
- Current Question: ${currentQuestionCount + 1} of ${maxQuestions}

EDUCATION LEVEL UNDERSTANDING:
INDIAN EDUCATION BOARDS & SYSTEMS:
- SSLC/10th Standard = Secondary School Leaving Certificate (Karnataka, Tamil Nadu, Kerala system)
- ICSE/10th = Indian Certificate of Secondary Education (All India board)
- CBSE/10th = Central Board of Secondary Education (All India board)
- State Board 10th = Various state-specific 10th grade boards
- PUC/+2/12th = Pre-University Course/Higher Secondary/12th Standard
- CBSE 12th = Central Board 12th standard
- ICSE/ISC 12th = Indian School Certificate 12th standard
- State Board 12th = Various state-specific 12th grade boards
- Intermediate = 12th standard in Andhra Pradesh/Telangana
- HSC = Higher Secondary Certificate (Maharashtra, Gujarat)

HIGHER EDUCATION:
- BE/B.Tech = Bachelor of Engineering/Technology (4-year technical degree)
- BA = Bachelor of Arts (3-year humanities/liberal arts degree)
- BSc/B.Sc = Bachelor of Science (3-year science degree)
- BCom/B.Com = Bachelor of Commerce (3-year commerce degree)
- BBA = Bachelor of Business Administration (3-year business degree)
- BCA = Bachelor of Computer Applications (3-year computer degree)
- B.Pharma = Bachelor of Pharmacy (4-year pharmaceutical degree)
- MBBS = Bachelor of Medicine and Surgery (5.5-year medical degree)
- BDS = Bachelor of Dental Surgery (5-year dental degree)
- LLB = Bachelor of Laws (3-year law degree)
- CA = Chartered Accountant (professional accounting qualification)
- CS = Company Secretary (professional qualification)
- CMA = Cost and Management Accountant (professional qualification)
- Diploma = 3-year technical diploma after 10th
- ITI = Industrial Training Institute certificate

PREVIOUS RESPONSES:
${answerContext || 'No previous responses yet - start with discovering their natural interests and what excites them'}

CRITICAL TREE-BASED LOGIC:
You MUST create questions that branch directly from their previous answers to go DEEPER into their interests. Each question should:

1. Be MAXIMUM 8 words - extremely concise and clear
2. DIRECTLY BUILD on their last answer to explore deeper interests
3. Focus on DISCOVERING INTERESTS, PERSONALITY, and NATURAL INCLINATIONS
4. Consider their education level appropriately (use simpler language for younger students)
5. Branch into specific interest areas based on their responses
6. Use SMART TREE BRANCHING - each answer should unlock a specific path

SMART TREE BRANCHING EXAMPLES:
FIRST QUESTION: "What activities make you lose track of time?"
IF Technology → "Programming, gaming, or digital design - which appeals more?"
IF Creative → "Art, music, writing, or filmmaking - what draws you?"
IF Sports → "Playing, coaching, sports medicine, or sports business?"
IF Helping → "Teaching, healthcare, counseling, or social work?"
IF Problem-solving → "Math puzzles, fixing things, research, or strategy?"

DEEPER BRANCHING:
IF Programming → "Building apps, websites, games, or AI systems?"
IF Healthcare → "Treating patients, research, surgery, or mental health?"
IF Teaching → "Young kids, teenagers, adults, or special needs?"
IF Business → "Starting companies, managing teams, marketing, or finance?"

INTEREST DISCOVERY PRIORITY AREAS:
- What activities energize them naturally?
- What problems do they want to solve in the world?
- What subjects do they explore beyond school requirements?
- How do they prefer to work - alone, in teams, leading?
- What impact do they want to make?
- What type of environment motivates them?

Return EXACTLY this JSON format:
{
  "question": "Direct, interest-focused question (max 8 words)",
  "type": "text", 
  "placeholder": "Share what interests you most...",
  "category": "interests_discovery",
  "reasoning": "How this branches from their previous answer to discover deeper interests"
}

IMPORTANT: If this is question 1 and no previous responses, ask about natural interests or activities they enjoy.
Generate a question that naturally follows their interest discovery journey with smart tree branching.`;

  try {
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
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Clean up the response to extract JSON
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const questionData = JSON.parse(jsonMatch[0]);
    
    // Validate the response
    if (!questionData.question) {
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

  const reportPrompt = `You are an expert career counselor analyzing a student's interest-based assessment responses. Generate career recommendations based on their discovered INTERESTS.

STUDENT PROFILE:
- Name: ${userName}
- Education Level: ${educationLevel} (SSLC=10th grade, PUC=12th grade, BE/BTech=Engineering, BA=Bachelor of Arts, CA=Chartered Accountant, BBA=Business Administration)
- Total Questions Answered: ${answers.length} (exactly 15 tree-based questions focused on interests)

INTEREST-BASED RESPONSES:
${answerContext}

CRITICAL TASK: Analyze their interest patterns and provide exactly 5 career recommendations that MATCH their interests. Each career must include exactly 3 FREE, VERIFIED, WORKING courses per level.

VERIFIED COURSE SOURCES (NO 404 ERRORS):
- FreeCodeCamp: https://www.freecodecamp.org/learn/
- Khan Academy: https://www.khanacademy.org/
- Coursera (free courses): https://www.coursera.org/
- edX (free courses): https://www.edx.org/
- MIT OpenCourseWare: https://ocw.mit.edu/
- Harvard Online: https://online-learning.harvard.edu/

Return EXACTLY this JSON format:
{
  "strengths": ["Interest-based strength 1", "Interest-based strength 2", "Interest-based strength 3", "Interest-based strength 4"],
  "areasForImprovement": ["Interest development area 1", "Interest development area 2", "Interest development area 3"],
  "careerRecommendations": [
    {
      "title": "Career Title",
      "description": "Why this career perfectly matches their discovered interests and passion areas",
      "matchScore": 95,
      "growthPotential": "Specific growth opportunities in India based on their interests",
      "salaryRange": "₹X-Y LPA",
      "keySkills": ["Interest-aligned skill 1", "Interest-aligned skill 2", "Interest-aligned skill 3"],
      "educationPath": "Interest-based education recommendations for Indian context",
      "freeResources": {
        "beginner": [
          {"title": "Course Title 1", "url": "https://verified-working-url", "platform": "Platform Name", "duration": "X weeks"},
          {"title": "Course Title 2", "url": "https://verified-working-url", "platform": "Platform Name", "duration": "X weeks"},
          {"title": "Course Title 3", "url": "https://verified-working-url", "platform": "Platform Name", "duration": "X weeks"}
        ],
        "intermediate": [
          {"title": "Course Title 1", "url": "https://verified-working-url", "platform": "Platform Name", "duration": "X weeks"},
          {"title": "Course Title 2", "url": "https://verified-working-url", "platform": "Platform Name", "duration": "X weeks"},
          {"title": "Course Title 3", "url": "https://verified-working-url", "platform": "Platform Name", "duration": "X weeks"}
        ],
        "advanced": [
          {"title": "Course Title 1", "url": "https://verified-working-url", "platform": "Platform Name", "duration": "X weeks"},
          {"title": "Course Title 2", "url": "https://verified-working-url", "platform": "Platform Name", "duration": "X weeks"},
          {"title": "Course Title 3", "url": "https://verified-working-url", "platform": "Platform Name", "duration": "X weeks"}
        ]
      }
    }
  ],
  "personalityInsights": "Detailed analysis of their interests and how they align with personality traits",
  "recommendedNextSteps": ["Interest-based step 1", "Interest-based step 2", "Interest-based step 3"]
}

IMPORTANT: Use ONLY verified, working course URLs. No 404 errors allowed. Focus on careers that match their INTERESTS, not just skills.`;

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
    
    // Fallback analysis
    const fallbackAnalysis = {
      strengths: ["Problem-solving", "Communication", "Adaptability", "Learning agility"],
      areasForImprovement: ["Technical skills", "Leadership development", "Industry knowledge"],
      careerRecommendations: [
        {
          title: "Software Developer",
          description: "Based on your responses, you show strong logical thinking and problem-solving abilities suitable for software development.",
          matchScore: 88,
          growthPotential: "Excellent growth in India's expanding tech sector",
          salaryRange: "₹6-25 LPA",
          keySkills: ["Programming", "Problem Solving", "Logical Thinking"],
          educationPath: "Computer Science, Engineering, or coding bootcamps",
          freeResources: {
            beginner: [
              {"title": "Introduction to Programming", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "platform": "FreeCodeCamp", "duration": "4 weeks"},
              {"title": "Computer Science Basics", "url": "https://www.khanacademy.org/computing/computer-programming", "platform": "Khan Academy", "duration": "6 weeks"},
              {"title": "Programming Fundamentals", "url": "https://www.coursera.org/learn/programming-fundamentals", "platform": "Coursera", "duration": "8 weeks"}
            ],
            intermediate: [
              {"title": "Web Development Bootcamp", "url": "https://www.freecodecamp.org/learn/responsive-web-design/", "platform": "FreeCodeCamp", "duration": "10 weeks"},
              {"title": "Data Structures and Algorithms", "url": "https://www.khanacademy.org/computing/computer-science", "platform": "Khan Academy", "duration": "12 weeks"},
              {"title": "Full Stack Development", "url": "https://www.coursera.org/specializations/full-stack-web-development", "platform": "Coursera", "duration": "16 weeks"}
            ],
            advanced: [
              {"title": "Advanced Programming Concepts", "url": "https://ocw.mit.edu/courses/6-001-structure-and-interpretation-of-computer-programs-spring-2005/", "platform": "MIT OpenCourseWare", "duration": "12 weeks"},
              {"title": "Software Engineering Principles", "url": "https://www.edx.org/course/software-engineering-introduction", "platform": "edX", "duration": "14 weeks"},
              {"title": "System Design and Architecture", "url": "https://ocw.mit.edu/courses/6-033-computer-system-engineering-spring-2018/", "platform": "MIT OpenCourseWare", "duration": "16 weeks"}
            ]
          }
        }
      ],
      personalityInsights: "You demonstrate strong analytical thinking and a systematic approach to problem-solving.",
      recommendedNextSteps: ["Start with basic programming courses", "Build a portfolio of projects", "Network with industry professionals"]
    };
    
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
      question: "What subjects interest you most?",
      type: "text",
      placeholder: "Type the subjects that interest you...",
      category: "interests",
      reasoning: "Understanding core subject interests helps identify career paths."
    },
    {
      question: "How do you prefer to work?",
      type: "text",
      placeholder: "Describe your preferred work style...",
      category: "work_style",
      reasoning: "Work style preferences indicate suitable career environments."
    },
    {
      question: "What motivates you in your career?",
      type: "text",
      placeholder: "Share what drives you professionally...",
      category: "motivation",
      reasoning: "Understanding motivations helps align career choices with personal values."
    },
    {
      question: "Which technology field excites you?",
      type: "text",
      placeholder: "Tell us about technology that interests you...",
      category: "technology",
      reasoning: "Interest in emerging technologies guides future career opportunities."
    },
    {
      question: "How do you solve problems?",
      type: "text",
      placeholder: "Describe your problem-solving approach...",
      category: "problem_solving",
      reasoning: "Problem-solving approach reveals leadership and decision-making style."
    }
  ];

  return fallbackQuestions[questionCount % fallbackQuestions.length];
}