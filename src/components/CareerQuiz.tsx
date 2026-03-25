
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BookIcon, CodeIcon, UserIcon, BrainCogIcon, LightbulbIcon, GraduationCapIcon, RocketIcon, SparklesIcon, TrendingUpIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface QuizQuestion {
  question: string;
  type: "text" | "radio";
  options?: string[];
  placeholder?: string;
  icon: React.ReactNode;
  category: string;
  reasoning?: string;
}

interface QuizProps {
  userId: string;
  onComplete: (sessionId: string) => void;
}

const CareerQuiz = ({ userId, onComplete }: QuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [userName, setUserName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [questionCount, setQuestionCount] = useState(20);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);

  // Verify authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "Please log in to take the career guidance assessment",
          variant: "destructive",
        });
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  // Base foundation questions (these are asked first to gather context)
  const getFoundationQuestions = (): QuizQuestion[] => [
    {
      question: "What's your name?",
      type: "text",
      placeholder: "Your name",
      icon: <UserIcon className="h-5 w-5 text-blue-700" />,
      category: "personal",
    },
    {
      question: "What is your current education level?",
      type: "radio",
      options: ["10th Standard", "PU/11th-12th", "Diploma", "Graduate", "Post Graduate"],
      icon: <GraduationCapIcon className="h-5 w-5 text-blue-700" />,
      category: "personal",
    },
    {
      question: "Which subjects or areas interest you the most?",
      type: "text",
      placeholder: "E.g., Technology, Arts, Science, Business, Healthcare...",
      icon: <BookIcon className="h-5 w-5 text-blue-700" />,
      category: "interests",
    },
    {
      question: "What type of activities energize you the most?",
      type: "radio",
      options: [
        "Solving complex problems and puzzles",
        "Creating and designing new things", 
        "Helping and teaching others",
        "Leading teams and projects",
        "Analyzing data and finding patterns"
      ],
      icon: <BrainCogIcon className="h-5 w-5 text-blue-700" />,
      category: "personality",
    }
  ];

  // Generate personalized questions based on user responses
  const generatePersonalizedQuestions = async (userAnswers: Record<string, string>, questionNumber: number) => {
    setLoadingQuestions(true);
    console.log('Generating personalized questions with context:', { userAnswers, questionNumber });
    
    try {
      const response = await supabase.functions.invoke('generate-adaptive-questions', {
        body: {
          answers: userAnswers,
          educationLevel,
          userName,
          currentQuestionNumber: questionNumber
        }
      });

      console.log('Supabase function response:', response);

      if (response.error) {
        console.error('Supabase function error:', response.error);
        throw new Error(response.error.message || 'Failed to generate questions');
      }
      
      const result = response.data;
      console.log('Generated questions result:', result);

      if (result?.questions && Array.isArray(result.questions)) {
        const personalizedQuestions = result.questions.map((q: any) => ({
          question: q.question,
          type: q.type,
          options: q.options,
          placeholder: q.placeholder,
          category: q.category,
          reasoning: q.reasoning,
          icon: getCategoryIcon(q.category)
        }));

        console.log(`Successfully generated ${personalizedQuestions.length} personalized questions`);
        return personalizedQuestions;
      } else {
        throw new Error('Invalid response format from question generation');
      }
    } catch (error) {
      console.error('Error generating personalized questions:', error);
      toast({
        title: "Using standard questions",
        description: "Personalizing your assessment with our comprehensive question set.",
        variant: "default",
      });
      return getDefaultQuestions();
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      personal: <UserIcon className="h-5 w-5 text-blue-700" />,
      interests: <BookIcon className="h-5 w-5 text-blue-700" />,
      personality: <BrainCogIcon className="h-5 w-5 text-blue-700" />,
      skills: <LightbulbIcon className="h-5 w-5 text-blue-700" />,
      technology: <CodeIcon className="h-5 w-5 text-blue-700" />,
      career_vision: <RocketIcon className="h-5 w-5 text-blue-700" />,
      motivation: <TrendingUpIcon className="h-5 w-5 text-blue-700" />,
      learning_style: <GraduationCapIcon className="h-5 w-5 text-blue-700" />,
      work_environment: <UserIcon className="h-5 w-5 text-blue-700" />,
      problem_solving: <BrainCogIcon className="h-5 w-5 text-blue-700" />,
      social_impact: <SparklesIcon className="h-5 w-5 text-blue-700" />,
      teamwork: <UserIcon className="h-5 w-5 text-blue-700" />,
      work_style: <BrainCogIcon className="h-5 w-5 text-blue-700" />,
      team_role: <UserIcon className="h-5 w-5 text-blue-700" />,
      assessment: <LightbulbIcon className="h-5 w-5 text-blue-700" />
    };
    return iconMap[category] || <UserIcon className="h-5 w-5 text-blue-700" />;
  };

  // Fallback questions if AI generation fails
  const getDefaultQuestions = (): QuizQuestion[] => [
    {
      question: "How do you prefer to solve complex problems?",
      type: "radio",
      options: [
        "Break down into smaller, manageable parts",
        "Look for patterns and connections",
        "Think creatively and outside the box",
        "Research and gather information first",
        "Collaborate with others for ideas"
      ],
      icon: <LightbulbIcon className="h-5 w-5 text-blue-700" />,
      category: "problem_solving",
    },
    {
      question: "What motivates you most in your learning journey?",
      type: "radio",
      options: [
        "Achieving mastery and expertise",
        "Making a positive impact on others",
        "Financial success and stability",
        "Creative expression and innovation",
        "Recognition and acknowledgment"
      ],
      icon: <TrendingUpIcon className="h-5 w-5 text-blue-700" />,
      category: "motivation",
    },
    {
      question: "Which work environment appeals to you most?",
      type: "radio",
      options: [
        "Fast-paced startup environment",
        "Structured corporate setting",
        "Creative agency or studio",
        "Research institution or lab",
        "Remote/flexible work setup"
      ],
      icon: <UserIcon className="h-5 w-5 text-blue-700" />,
      category: "work_environment",
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
      icon: <RocketIcon className="h-5 w-5 text-blue-700" />,
      category: "interests",
    }
  ];

  // Initialize foundation questions when quiz starts
  useEffect(() => {
    if (quizStarted && questions.length === 0) {
      const foundationQuestions = getFoundationQuestions();
      setQuestions(foundationQuestions);
      setQuestionCount(foundationQuestions.length + 12); // Foundation + personalized
    }
  }, [quizStarted]);

  const createQuizSession = async () => {
    try {
      const { data, error } = await supabase
        .from('user_quiz_sessions')
        .insert({
          user_id: userId,
          total_questions: questionCount,
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating quiz session:', error);
      toast({
        title: "Error",
        description: "Could not start quiz session. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleInputChange = (value: string) => {
    if (currentQuestion === 0) {
      setUserName(value);
    }
    
    const questionText = questions[currentQuestion]?.question || "";
    setAnswers({ ...answers, [questionText]: value });
  };

  const handleNext = async () => {
    const questionText = questions[currentQuestion]?.question || "";
    
    if (!answers[questionText]) {
      toast({
        title: "Please answer the question",
        description: "We need your input to provide accurate career recommendations.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create session on first question if not already created
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = await createQuizSession();
      }

      // Store individual answer
      const { error } = await supabase
        .from('user_quiz_answers')
        .insert({
          session_id: currentSessionId,
          user_id: userId,
          question_number: currentQuestion + 1,
          question_category: questions[currentQuestion]?.category || "general",
          question_text: questionText,
          answer_text: answers[questionText]
        });
      
      if (error) throw error;

      // Record education level
      if (currentQuestion === 1) {
        setEducationLevel(answers[questionText]);
      }

      // Generate personalized questions after foundation questions (after question 3)
      if (currentQuestion === 3 && !questionsGenerated) {
        console.log('Generating personalized questions after foundation questions...');
        const personalizedQuestions = await generatePersonalizedQuestions(answers, currentQuestion + 1);
        const allQuestions = [...questions, ...personalizedQuestions];
        setQuestions(allQuestions);
        setQuestionCount(allQuestions.length);
        setQuestionsGenerated(true);
        
        toast({
          title: "Questions Personalized!",
          description: "We've customized the remaining questions based on your responses.",
        });
      }

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Quiz completed - trigger AI analysis
        await completeQuiz(currentSessionId);
      }
    } catch (error) {
      console.error("Error storing answer:", error);
      toast({
        title: "Something went wrong",
        description: "Could not save your answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const completeQuiz = async (sessionId: string) => {
    setProcessing(true);
    
    try {
      console.log('Completing quiz with session:', sessionId);
      
      const response = await supabase.functions.invoke('analyze-career-guidance', {
        body: {
          sessionId,
          userId,
          answers,
          studentName: userName,
          educationLevel
        }
      });

      console.log('Analysis response:', response);

      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const result = response.data;
      
      if (result?.success) {
        toast({
          title: "Analysis Complete!",
          description: "Your personalized career recommendations are ready."
        });
        onComplete(sessionId);
      } else {
        throw new Error(result?.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error completing quiz:', error);
      toast({
        title: "Analysis Error",
        description: "There was an issue analyzing your responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const startQuiz = async () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
  };

  const nextIntroStep = () => {
    if (introStep < 2) {
      setIntroStep(introStep + 1);
    } else {
      startQuiz();
    }
  };

  // Enhanced introduction flow
  if (!quizStarted) {
    const introContent = [
      {
        title: "Welcome to SahiRaah",
        subtitle: "AI-Powered Career Discovery Platform",
        content: "Discover your perfect career path with our intelligent assessment system designed specifically for Indian students.",
        icon: <RocketIcon className="h-16 w-16 text-yellow-500" />,
        highlights: ["Personalized AI Analysis", "Future-Ready Careers", "Industry-Specific Roadmaps"]
      },
      {
        title: "How Our Assessment Works",
        subtitle: "Smart, Adaptive & Personalized",
        content: "Our AI adapts questions based on your responses, ensuring we understand your unique strengths and interests.",
        icon: <BrainCogIcon className="h-16 w-16 text-blue-500" />,
        highlights: ["Dynamic Question Flow", "Real-time Analysis", "Behavioral Insights"]
      },
      {
        title: "What You'll Receive",
        subtitle: "Comprehensive Career Guidance",
        content: "Get detailed career recommendations, visual progress tracking, and step-by-step learning roadmaps.",
        icon: <SparklesIcon className="h-16 w-16 text-green-500" />,
        highlights: ["Career Matches", "Skill Roadmaps", "Learning Resources"]
      }
    ];

    const currentIntro = introContent[introStep];

    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl border-0">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              {currentIntro.icon}
            </div>
            
            <h1 className="text-3xl font-bold text-blue-900 mb-2">{currentIntro.title}</h1>
            <h2 className="text-xl text-blue-700 mb-6">{currentIntro.subtitle}</h2>
            
            <p className="text-blue-800 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              {currentIntro.content}
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {currentIntro.highlights.map((highlight, idx) => (
                <div key={idx} className="bg-white/70 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <p className="text-blue-800 font-medium">{highlight}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center space-x-2 mb-6">
              {introContent.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full ${
                    idx === introStep ? 'bg-yellow-500' : 'bg-blue-300'
                  }`}
                />
              ))}
            </div>

            <Button 
              onClick={nextIntroStep}
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-blue-900 font-semibold px-8 py-3 text-lg shadow-lg"
            >
              {introStep < 2 ? "Continue" : "Start Your Journey"} 
              <RocketIcon className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (processing) {
    return (
      <Card className="bg-white shadow-lg border border-blue-100">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Analyzing Your Responses</h3>
            <p className="text-blue-700">Our AI is creating your personalized career recommendations...</p>
            <div className="mt-6">
              <Progress value={100} className="h-2 bg-blue-50" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadingQuestions) {
    return (
      <Card className="bg-white shadow-lg border border-blue-100">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Personalizing Your Assessment</h3>
            <p className="text-blue-700">Creating questions tailored specifically for you...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="bg-white shadow-lg border border-blue-100">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Preparing Assessment</h3>
            <p className="text-blue-700">Getting ready to start your personalized career discovery...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questionCount) * 100;
  
  return (
    <Card className="bg-white shadow-lg border border-blue-100">
      <CardContent className="pt-6">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-700">
              Question {currentQuestion + 1} of {questionCount}
            </span>
            <span className="text-sm text-blue-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-3 bg-blue-50" />
        </div>

        {userName && (
          <div className="mb-6 pb-4 border-b border-gray-200 bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-medium">
              {currentQuestion <= 3
                ? `Hi ${userName}! Let's understand your background and interests.` 
                : questionsGenerated
                ? `Great progress, ${userName}! These questions are personalized based on your responses...`
                : `Excellent, ${userName}! We're tailoring the next questions just for you...`}
            </p>
            {question.reasoning && currentQuestion > 3 && (
              <p className="text-sm text-blue-600 mt-2">💡 {question.reasoning}</p>
            )}
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              {question.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                {question.category === "personal" && "About You"}
                {question.category === "interests" && "Your Interests"}
                {question.category === "skills" && "Your Skills"}
                {question.category === "personality" && "Personality"}
                {question.category === "motivation" && "Your Motivation"}
                {question.category === "technology" && "Technology & Innovation"}
                {question.category === "career_vision" && "Career Vision"}
                {question.category === "work_environment" && "Work Environment"}
                {question.category === "problem_solving" && "Problem Solving"}
                {question.category === "social_impact" && "Social Impact"}
                {question.category === "learning_style" && "Learning Style"}
                {question.category === "teamwork" && "Teamwork"}
                {question.category === "work_style" && "Work Style"}
                {question.category === "team_role" && "Team Role"}
                {question.category === "assessment" && "Assessment"}
                {!["personal", "interests", "skills", "personality", "motivation", "technology", "career_vision", "work_environment", "problem_solving", "social_impact", "learning_style", "teamwork", "work_style", "team_role", "assessment"].includes(question.category) && "Assessment"}
              </h3>
            </div>
          </div>
          
          <p className="text-blue-900 text-xl mb-6 font-medium">{question.question}</p>

          {question.type === "text" && (
            <Input
              value={answers[question.question] || ""}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={question.placeholder}
              className="w-full text-lg p-4 border-2 border-blue-200 focus:border-blue-500 rounded-lg"
            />
          )}

          {question.type === "radio" && (
            <RadioGroup
              value={answers[question.question] || ""}
              onValueChange={(value) => handleInputChange(value)}
              className="space-y-4"
            >
              {question.options?.map((option) => (
                <div key={option} className="flex items-center rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-all relative">
                  <Label htmlFor={option} className="flex items-center space-x-3 p-3 w-full cursor-pointer">
                    <RadioGroupItem value={option} id={option} className="text-blue-600" />
                    <span className="text-blue-800 font-medium flex-1">{option}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleNext} 
            size="lg"
            disabled={processing || loadingQuestions}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-blue-900 font-semibold px-8 py-3"
          >
            {currentQuestion < questions.length - 1 ? (
              <>Next Question <RocketIcon className="ml-2 h-4 w-4" /></>
            ) : (
              <>Get My Results <SparklesIcon className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerQuiz;
