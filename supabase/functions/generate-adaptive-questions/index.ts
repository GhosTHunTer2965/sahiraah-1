import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.22.4";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  answers: z.record(z.string(), z.string().max(2000)).optional().default({}),
  educationLevel: z.string().min(1).max(100).optional(),
  userName: z.string().min(1).max(100).optional(),
  currentQuestionNumber: z.number().int().min(0).max(100).optional()
});

// Sanitize user input before using in prompts
function sanitizeForPrompt(text: string): string {
  return text
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[<>{}]/g, '') // Remove potentially dangerous characters
    .slice(0, 2000); // Enforce length limit
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const rawBody = await req.json();
    const validationResult = requestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid input data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { answers, educationLevel, userName, currentQuestionNumber } = validationResult.data;
    
    // Sanitize inputs
    const sanitizedUserName = userName ? sanitizeForPrompt(userName) : 'Student';
    const sanitizedEducationLevel = educationLevel ? sanitizeForPrompt(educationLevel) : 'Not specified';
    
    console.log('Generating questions for:', { 
      userName: sanitizedUserName, 
      educationLevel: sanitizedEducationLevel, 
      currentQuestionNumber, 
      answersCount: Object.keys(answers || {}).length 
    });

    // Enhanced fallback questions that work without AI
    const generateFallbackQuestions = (userContext: { userName: string; educationLevel: string; answers: Record<string, string> }) => {
      const { userName: contextUserName } = userContext;
      
      return [
        {
          question: `${contextUserName}, what type of activities energize you the most?`,
          type: "radio",
          options: [
            "Solving complex problems and puzzles",
            "Creating and designing new things", 
            "Helping and teaching others",
            "Leading teams and projects",
            "Analyzing data and finding patterns"
          ],
          category: "personality",
          reasoning: "Understanding what energizes you helps identify suitable work environments and roles."
        },
        {
          question: "Which emerging technology field excites you most for future career opportunities?",
          type: "radio",
          options: [
            "Artificial Intelligence & Machine Learning",
            "Sustainable Technology & Green Energy",
            "Biotechnology & Health Innovation",
            "Fintech & Digital Finance",
            "Space Technology & Exploration"
          ],
          category: "technology",
          reasoning: "Your interest in emerging technologies can guide career path selection."
        },
        {
          question: "What motivates you more in your career aspirations?",
          type: "radio",
          options: [
            "Making a significant impact on society",
            "Building financial independence and security",
            "Continuous learning and personal growth",
            "Recognition and professional achievement",
            "Work-life balance and flexibility"
          ],
          category: "motivation",
          reasoning: "Understanding your core motivations helps align career choices with personal values."
        },
        {
          question: "How do you typically approach complex challenges or problems?",
          type: "radio",
          options: [
            "Break them down into smaller, manageable steps",
            "Research extensively before taking action",
            "Brainstorm creative and innovative solutions",
            "Collaborate with others to find solutions",
            "Trust my intuition and take quick action"
          ],
          category: "problem_solving",
          reasoning: "Your problem-solving style indicates which career environments would suit you best."
        },
        {
          question: "What type of impact would you like your career to have on India's development?",
          type: "radio",
          options: [
            "Advancing technology and digital transformation",
            "Improving healthcare and life quality",
            "Promoting education and skill development",
            "Driving economic growth and entrepreneurship",
            "Addressing environmental and sustainability challenges"
          ],
          category: "social_impact",
          reasoning: "Your desire for societal impact can help identify meaningful career paths."
        },
        {
          question: "Which work environment energizes you the most?",
          type: "radio",
          options: [
            "Dynamic startup with rapid growth and change",
            "Established corporate with structured processes",
            "Remote/hybrid with maximum flexibility",
            "Collaborative team-based environment",
            "Independent consultant or freelancer setup"
          ],
          category: "work_environment",
          reasoning: "Understanding your preferred work environment is crucial for job satisfaction."
        },
        {
          question: "What's your preferred way to develop new skills and knowledge?",
          type: "radio",
          options: [
            "Hands-on projects and real-world application",
            "Structured courses and certification programs",
            "Learning from mentors and experienced professionals",
            "Self-directed research and online resources",
            "Peer learning and collaborative study groups"
          ],
          category: "learning_style",
          reasoning: "Your learning style preferences help create personalized development roadmaps."
        },
        {
          question: "What type of projects excite you the most?",
          type: "radio",
          options: [
            "Technology and coding projects",
            "Creative and design projects",
            "Research and analysis projects",
            "Business and strategy projects",
            "Social impact and community projects"
          ],
          category: "interests",
          reasoning: "Your project preferences reveal your natural inclinations and interests."
        },
        {
          question: "How do you prefer to work with others?",
          type: "radio",
          options: [
            "Leading and directing team efforts",
            "Collaborating as an equal team member",
            "Supporting others and following guidance",
            "Working independently with minimal interaction",
            "Mentoring and teaching others"
          ],
          category: "teamwork",
          reasoning: "Your collaboration style helps identify suitable team roles and career paths."
        },
        {
          question: "What aspect of technology interests you most?",
          type: "radio",
          options: [
            "Building software applications and websites",
            "Analyzing data to find insights and patterns",
            "Designing user experiences and interfaces",
            "Understanding how systems and networks work",
            "Exploring new technologies and innovations"
          ],
          category: "technology",
          reasoning: "Your technology interests can guide specialization within tech careers."
        },
        {
          question: "How do you handle pressure and deadlines?",
          type: "radio",
          options: [
            "I thrive under pressure and work well with tight deadlines",
            "I prefer steady progress with reasonable timelines",
            "I work best when I can plan ahead and avoid rush",
            "I perform well with clear priorities and structure",
            "I like flexibility to adjust timelines as needed"
          ],
          category: "work_style",
          reasoning: "Understanding how you handle pressure helps identify suitable work environments."
        },
        {
          question: "What role do you see yourself playing in a team?",
          type: "radio",
          options: [
            "The strategist who plans and organizes",
            "The innovator who brings creative ideas",
            "The executor who gets things done efficiently",
            "The communicator who facilitates collaboration",
            "The specialist who provides deep expertise"
          ],
          category: "team_role",
          reasoning: "Your natural team role helps identify career paths that match your strengths."
        }
      ];
    };

    // Try AI generation first if API key is available
    if (openAIApiKey) {
      try {
        // Create context from previous answers (sanitized)
        const answerContext = Object.entries(answers || {}).map(([question, answer]) => 
          `Q: ${sanitizeForPrompt(question)}\nA: ${sanitizeForPrompt(answer)}`
        ).join('\n\n');

        // Create a more sophisticated prompt based on current progress
        const questionPrompt = `You are an expert career counselor creating adaptive questions for Indian students.

STUDENT PROFILE:
- Name: ${sanitizedUserName}
- Education Level: ${sanitizedEducationLevel}
- Current Question Number: ${currentQuestionNumber || 'Initial'}

PREVIOUS RESPONSES:
${answerContext || 'No previous responses yet'}

TASK: Generate 12 highly personalized questions that adapt to this student's responses. These questions should:

1. Build upon their previous answers to create deeper insights
2. Be culturally relevant for Indian students and job market
3. Focus on emerging careers (AI, sustainability, healthcare tech, fintech, etc.)
4. Mix different question types to maintain engagement
5. Progressively reveal personality traits, skills, and interests

QUESTION CATEGORIES TO INCLUDE:
- Career interests based on previous responses
- Problem-solving approach and analytical thinking
- Technology adoption and digital literacy
- Leadership and teamwork preferences
- Learning style and skill development interests
- Work environment and culture preferences
- Innovation and creativity potential
- Communication and interpersonal skills
- Long-term career aspirations
- Industry-specific inclinations

IMPORTANT: 
- Questions should feel conversational and personalized
- Reference their education level appropriately
- Include practical scenarios they might relate to
- Focus on future-oriented career paths in India's growing economy

Return exactly this JSON format:
{
  "questions": [
    {
      "question": "Question text that builds on their responses",
      "type": "radio" or "text",
      "options": ["option1", "option2", "option3", "option4", "option5"] (for radio type only),
      "placeholder": "hint text" (for text type only),
      "category": "category_name",
      "reasoning": "Why this question is relevant based on their profile"
    }
  ]
}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: 'You are an expert career counselor and psychologist specializing in career assessment for Indian students. You create questions that reveal deep insights about personality, skills, interests, and career potential. Always respond with valid JSON.' 
              },
              { role: 'user', content: questionPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.8,
            max_tokens: 3000
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenAI API error:', response.status, errorText);
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const aiData = await response.json();
        console.log('OpenAI response received, processing questions...');
        
        let result;
        try {
          result = JSON.parse(aiData.choices[0].message.content);
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          throw new Error('Invalid JSON response from AI');
        }

        // Enhanced question validation and formatting
        const questions = (result.questions || []).map((q: any, index: number) => {
          const questionData: any = {
            question: q.question || `Assessment question ${index + 1}`,
            type: q.type === 'text' ? 'text' : 'radio',
            category: q.category || "assessment",
            reasoning: q.reasoning || "General assessment"
          };

          if (questionData.type === 'radio') {
            questionData.options = Array.isArray(q.options) && q.options.length >= 3 
              ? q.options.slice(0, 5) // Max 5 options
              : [
                  "Strongly Agree",
                  "Agree", 
                  "Neutral",
                  "Disagree",
                  "Strongly Disagree"
                ];
          } else {
            questionData.placeholder = q.placeholder || "Please share your thoughts...";
          }

          return questionData;
        }).slice(0, 12); // Ensure max 12 questions

        console.log(`Generated ${questions.length} personalized questions`);

        return new Response(JSON.stringify({
          success: true,
          questions: questions,
          metadata: {
            generated_at: new Date().toISOString(),
            user_context: {
              name: sanitizedUserName,
              education: sanitizedEducationLevel,
              previous_answers: Object.keys(answers || {}).length
            }
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('AI generation failed, using fallback:', error);
      }
    }

    // Use enhanced fallback questions
    const fallbackQuestions = generateFallbackQuestions({
      userName: sanitizedUserName,
      educationLevel: sanitizedEducationLevel,
      answers: answers || {}
    });

    console.log(`Using ${fallbackQuestions.length} fallback questions`);

    return new Response(JSON.stringify({
      success: true,
      questions: fallbackQuestions,
      fallback: true,
      metadata: {
        generated_at: new Date().toISOString(),
        user_context: {
          name: sanitizedUserName,
          education: sanitizedEducationLevel,
          previous_answers: Object.keys(answers || {}).length
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating adaptive questions:', error);
    
    // Final emergency fallback - don't expose error details
    const emergencyQuestions = [
      {
        question: "What subjects or topics make you lose track of time when you're learning about them?",
        type: "text",
        placeholder: "e.g., Coding, design, business strategies, psychology...",
        category: "interests",
        reasoning: "Understanding deep interests helps identify natural career inclinations."
      },
      {
        question: "How do you prefer to solve challenging problems?",
        type: "radio",
        options: [
          "Break them down step by step",
          "Think creatively and brainstorm",
          "Research and gather information first",
          "Collaborate with others",
          "Trust my instincts and act quickly"
        ],
        category: "problem_solving",
        reasoning: "Problem-solving approach indicates suitable career environments."
      }
    ];

    return new Response(JSON.stringify({
      success: true,
      questions: emergencyQuestions,
      fallback: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
