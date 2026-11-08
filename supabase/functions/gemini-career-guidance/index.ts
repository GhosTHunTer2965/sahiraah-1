import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.22.4";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? '';

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
  action: z.enum(['generate_question', 'generate_report']),
  answers: z.array(answerSchema).max(50).optional().default([]),
  currentQuestionCount: z.number().int().min(0).max(100).optional().default(0),
  userName: z.string().min(1).max(100).optional().default('Student'),
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
    
    const { action, answers, currentQuestionCount, userName, educationLevel } = validationResult.data;
    
    // Sanitize text inputs
    const sanitizedUserName = sanitizeForPrompt(userName);
    const sanitizedEducationLevel = sanitizeForPrompt(educationLevel);
    const sanitizedAnswers = answers.map(a => ({
      question: sanitizeForPrompt(a.question),
      answer: sanitizeForPrompt(a.answer),
    }));
    
    console.log('Gemini Career Guidance:', { action, currentQuestionCount, answersCount: sanitizedAnswers.length });

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    if (action === 'generate_question') {
      return await generateNextQuestion(sanitizedAnswers, currentQuestionCount, sanitizedUserName, sanitizedEducationLevel);
    } else if (action === 'generate_report') {
      return await generateCareerReport(sanitizedAnswers, sanitizedUserName, sanitizedEducationLevel);
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error in gemini-career-guidance:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'An error occurred processing your request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateNextQuestion(answers: { question: string; answer: string }[], currentQuestionCount: number, userName: string, educationLevel: string) {
  const maxQuestions = 20;
  
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

  const questionPrompt = `You are an expert career counselor for Indian students. Generate the next SHORT and EASY question in a dynamic tree-based career assessment.

STUDENT PROFILE:
- Name: ${userName}
- Education Level: ${educationLevel}
- Current Question: ${currentQuestionCount + 1} of ${maxQuestions}

PREVIOUS RESPONSES:
${answerContext || 'No previous responses yet'}

PREVIOUSLY ASKED QUESTIONS (DO NOT REPEAT OR ASK ANYTHING SIMILAR TO THESE):
${answers.map((a, i) => `${i + 1}. ${a.question}`).join("\n")}

TASK: Generate a completely NEW, DIFFERENT question that branches naturally into a new aspect of their profile. You MUST NEVER REPEAT any previously asked question. The question should:

1. Be MAXIMUM 15 words - keep it short and clear
2. Build upon their previous responses to dive deeper into their interests  
3. Be culturally relevant for Indian students and career market
4. Focus on emerging careers and modern opportunities
5. Use simple language that's easy to understand
6. Help reveal personality traits, skills, and interests

EXAMPLE BRANCHING LOGIC:
- If they mentioned "Technology" → Ask "What tech area interests you most?"
- If they mentioned "Creative" → Ask "Which creative field excites you?"
- If they mentioned "Helping people" → Ask "How do you prefer to help others?"

QUESTION FORMAT RULES:
- Questions 1 to 15 (current question <= 15): MUST be MULTIPLE CHOICE with "type": "radio" and EXACTLY 4 distinct, realistic options in an array named "options": ["Option A", "Option B", "Option C", "Option D"].
- Questions 16 to 20 (current question >= 16): MUST be SENTENCE-BASED / OPEN-ENDED with "type": "text" and a helpful "placeholder": "Type 1-2 sentences explaining your thoughts...".

Return EXACTLY this JSON format:
{
  "question": "Short, engaging question text (max 20 words)",
  "type": "radio" or "text",
  "options": ["Option A", "Option B", "Option C", "Option D"], // ONLY if type is "radio"
  "placeholder": "Type your answer here in a sentence...", // ONLY if type is "text"
  "category": "category_name",
  "reasoning": "Why this question follows from their previous answers"
}

Generate a question that feels like a natural continuation of the conversation.`;

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

async function generateCareerReport(answers: { question: string; answer: string }[], userName: string, educationLevel: string) {
  const answerContext = answers.map((a, i) => 
    `Q${i + 1}: ${a.question}\nAnswer: ${a.answer}`
  ).join('\n\n');

  const reportPrompt = `You are an expert career counselor analyzing a student's assessment responses. Generate a comprehensive career analysis.

STUDENT PROFILE:
- Name: ${userName}
- Education Level: ${educationLevel}
- Total Questions Answered: ${answers.length}

RESPONSES:
${answerContext}

TASK: Analyze the responses and provide exactly 5 career recommendations with detailed analysis.

Return EXACTLY this JSON format:
{
  "strengths": ["Strength 1", "Strength 2", "Strength 3", "Strength 4"],
  "areasForImprovement": ["Area 1", "Area 2", "Area 3"],
  "careerRecommendations": [
    {
      "title": "Career Title",
      "description": "Detailed description explaining why this career matches their profile",
      "matchScore": 95,
      "growthPotential": "Specific growth opportunities in India",
      "salaryRange": "₹X-Y LPA",
      "keySkills": ["Skill 1", "Skill 2", "Skill 3"],
      "educationPath": "Specific education recommendations",
      "freeResources": {
        "beginner": [
          {"title": "HTML & CSS Basics", "url": "https://www.freecodecamp.org/learn/responsive-web-design/", "platform": "FreeCodeCamp", "duration": "4 weeks"},
          {"title": "JavaScript for Beginners", "url": "https://www.codecademy.com/learn/introduction-to-javascript", "platform": "Codecademy", "duration": "6 weeks"},
          {"title": "Programming Basics", "url": "https://www.khanacademy.org/computing/computer-programming", "platform": "Khan Academy", "duration": "8 weeks"}
        ],
        "intermediate": [
          {"title": "React.js Complete Course", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8", "platform": "YouTube", "duration": "10 weeks"},
          {"title": "Node.js Tutorial", "url": "https://www.youtube.com/watch?v=TlB_eWDSMt4", "platform": "YouTube", "duration": "8 weeks"},
          {"title": "Database Design", "url": "https://www.coursera.org/learn/database-design", "platform": "Coursera", "duration": "6 weeks"}
        ],
        "advanced": [
          {"title": "System Design Primer", "url": "https://www.youtube.com/watch?v=ZgdS0EUmn70", "platform": "YouTube", "duration": "12 weeks"},
          {"title": "AWS Cloud Practitioner", "url": "https://www.youtube.com/watch?v=3hLmDS179YE", "platform": "YouTube", "duration": "10 weeks"},
          {"title": "Machine Learning Course", "url": "https://www.coursera.org/learn/machine-learning", "platform": "Coursera", "duration": "16 weeks"}
        ]
      }
    }
  ],
  "personalityInsights": "Detailed personality analysis based on responses",
  "recommendedNextSteps": ["Step 1", "Step 2", "Step 3"]
}

Focus on careers relevant to India's job market and include ONLY working, free, and accessible course URLs.`;

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
              {"title": "HTML & CSS Basics", "url": "https://www.freecodecamp.org/learn/responsive-web-design/", "platform": "FreeCodeCamp", "duration": "4 weeks"},
              {"title": "JavaScript Basics", "url": "https://www.codecademy.com/learn/introduction-to-javascript", "platform": "Codecademy", "duration": "6 weeks"},
              {"title": "Programming Fundamentals", "url": "https://www.khanacademy.org/computing/computer-programming", "platform": "Khan Academy", "duration": "8 weeks"}
            ],
            intermediate: [
              {"title": "React.js Complete Course", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8", "platform": "YouTube", "duration": "10 weeks"},
              {"title": "Node.js Tutorial", "url": "https://www.youtube.com/watch?v=TlB_eWDSMt4", "platform": "YouTube", "duration": "8 weeks"},
              {"title": "Database Fundamentals", "url": "https://www.coursera.org/learn/database-design", "platform": "Coursera", "duration": "6 weeks"}
            ],
            advanced: [
              {"title": "System Design Basics", "url": "https://www.youtube.com/watch?v=ZgdS0EUmn70", "platform": "YouTube", "duration": "12 weeks"},
              {"title": "AWS Cloud Essentials", "url": "https://www.youtube.com/watch?v=3hLmDS179YE", "platform": "YouTube", "duration": "10 weeks"},
              {"title": "Machine Learning Intro", "url": "https://www.coursera.org/learn/machine-learning", "platform": "Coursera", "duration": "16 weeks"}
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

function getFallbackQuestion(questionCount: number, answers: { question: string; answer: string }[]) {
  const trueIndex = (answers && Array.isArray(answers) && answers.length > 0) ? answers.length : questionCount;
  const fallbackQuestions = [
    {
      question: "Which broad field excites you the most when thinking about your career?",
      type: "radio",
      options: ["Technology, Software & Artificial Intelligence","Creative Arts, Media & Digital Design","Healthcare, Medicine & Bio Sciences","Business, Finance & Entrepreneurship"],
      category: "domain",
      reasoning: "Identifying your primary interest domain."
    },
    {
      question: "Which type of day-to-day work tasks do you enjoy the most?",
      type: "radio",
      options: ["Solving complex technical problems or writing code","Designing visuals, creating stories, or digital media","Managing projects, organizing events, or leading teams","Conducting scientific research, analysis, and experiments"],
      category: "task_preference",
      reasoning: "Understanding your favorite daily activities."
    },
    {
      question: "What kind of working environment suits your personality best?",
      type: "radio",
      options: ["Fast-moving tech startup with rapid iteration","Established multinational corporation with clear hierarchy","Independent remote / freelance setup with flexible hours","Field work, research institute, or clinic setting"],
      category: "environment",
      reasoning: "Finding your ideal workplace culture."
    },
    {
      question: "How do you prefer to tackle unexpected challenges?",
      type: "radio",
      options: ["Researching data and following structured logic","Brainstorming creative and unconventional ideas","Discussing with others and building team consensus","Taking immediate action and learning through trial and error"],
      category: "problem_solving",
      reasoning: "Assessing your problem-solving approach."
    },
    {
      question: "Which emerging tech innovation interests you most?",
      type: "radio",
      options: ["AI agents, machine learning & automation","Clean energy, EVs & sustainable technology","Fintech, algorithmic trading & digital banking","Biotech, personalized medicine & genetics"],
      category: "technology",
      reasoning: "Identifying future market trends that resonate with you."
    },
    {
      question: "What role do you naturally step into when working in a group?",
      type: "radio",
      options: ["The Leader: Setting direction, deadlines, and inspiring members","The Specialist: Diving deep into the technical execution","The Designer: Shaping the presentation and user experience","The Mediator: Ensuring everyone is heard and conflicts are solved"],
      category: "team_dynamics",
      reasoning: "Evaluating your natural team role."
    },
    {
      question: "What type of intellectual puzzles do you find most rewarding?",
      type: "radio",
      options: ["Mathematical equations, algorithms, and logic puzzles","Understanding human behavior and psychology","Architecting complex physical or digital systems","Analyzing business market trends and investment strategies"],
      category: "intellectual_curiosity",
      reasoning: "Mapping your cognitive inclinations."
    },
    {
      question: "How do you prefer to communicate your ideas?",
      type: "radio",
      options: ["Detailed documentation, code, or technical diagrams","Visual slides, infographics, and storytelling","Live speaking, debates, and public presentations","One-on-one deep conversations and mentoring"],
      category: "communication",
      reasoning: "Identifying your optimal communication style."
    },
    {
      question: "What is your philosophy on continuous learning?",
      type: "radio",
      options: ["Self-taught through online documentation and building side projects","Structured university degrees and recognized certifications","Hands-on mentorship directly from senior industry leaders","Attending workshops, hackathons, and community bootcamps"],
      category: "learning_style",
      reasoning: "Evaluating your upskilling preferences."
    },
    {
      question: "When project requirements change abruptly, how do you react?",
      type: "radio",
      options: ["Quickly pivot and enjoy the spontaneity","Analyze the cost-benefit before systematically adapting","Rely on the team to divide the updated workload","Prefer sticking to a well-tested plan with minimal surprises"],
      category: "adaptability",
      reasoning: "Evaluating your agility under uncertainty."
    },
    {
      question: "Which impact metric would make you feel most proud in your career?",
      type: "radio",
      options: ["Building a product used daily by millions of people","Creating life-saving treatments or humanitarian solutions","Founding a profitable, industry-defining company","Advancing scientific research and academic knowledge"],
      category: "legacy",
      reasoning: "Understanding your vision of career impact."
    },
    {
      question: "What is your preferred balance between theory and execution?",
      type: "radio",
      options: ["80% hands-on building, 20% conceptual planning","50% strategic design, 50% implementation","80% research and theory, 20% prototyping","Focus on pitching and coordinating while experts execute"],
      category: "execution_style",
      reasoning: "Determining hands-on execution preference."
    },
    {
      question: "Which of these subjects did you naturally enjoy most in your studies?",
      type: "radio",
      options: ["Computer Science / Mathematics / Physics","Economics / Commerce / Business Studies","Literature / Fine Arts / Media Studies","Biology / Chemistry / Environmental Science"],
      category: "academic_interests",
      reasoning: "Grounding career paths in core academic strengths."
    },
    {
      question: "How do you prefer your performance to be evaluated?",
      type: "radio",
      options: ["By concrete output metrics (deliverables, features built, code)","By customer and user feedback and testimonials","By novelty and creativity of original solutions","By overall team collaboration and milestones reached"],
      category: "evaluation",
      reasoning: "Aligning career benchmarks with your definition of success."
    },
    {
      question: "What is your primary career goal over the next 3 to 5 years?",
      type: "radio",
      options: ["Reaching a senior engineering or technical specialist position","Founding or co-founding an innovative startup venture","Progressing into team leadership or executive management","Pursuing advanced international research and scholarship"],
      category: "milestones",
      reasoning: "Clarifying near-term professional goals."
    },
    {
      question: "In a sentence or two, describe a hobby or personal project that truly excites you.",
      type: "text",
      placeholder: "e.g., I love experimenting with UI designs or building small electronics...",
      category: "deep_passion",
      reasoning: "Exploring your personal creative flow."
    },
    {
      question: "What specific skill or technical domain are you most eager to master next?",
      type: "text",
      placeholder: "e.g., Cloud architectures, financial modeling, generative AI...",
      category: "growth_target",
      reasoning: "Highlighting key areas for upcoming skill acquisition."
    },
    {
      question: "Briefly share an example of a difficult challenge you managed to overcome.",
      type: "text",
      placeholder: "Describe the situation and how you solved it...",
      category: "resilience",
      reasoning: "Measuring problem-solving persistence and resilience."
    },
    {
      question: "What kind of workplace values or company culture matter most to you?",
      type: "text",
      placeholder: "e.g., Autonomy, strong mentorship, transparent leadership...",
      category: "culture_fit",
      reasoning: "Ensuring long-term organizational and cultural alignment."
    },
    {
      question: "Where do you envision yourself at the pinnacle of your career fulfillment?",
      type: "text",
      placeholder: "Describe your ideal long-term position and impact...",
      category: "career_vision",
      reasoning: "Formulating your 10-year career roadmap."
    }
  ];

  return fallbackQuestions[trueIndex % fallbackQuestions.length];
}
