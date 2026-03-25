import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, AlertCircle, ArrowLeft } from "lucide-react";

interface Props {
  onComplete: (sessionId: string) => void;
  onEarlyExit?: (answeredCount: number) => void;
}

interface Question {
  id: number;
  question: string;
  type: "multiple-choice" | "text";
  options?: string[];
  category?: string;
}

const EnhancedCareerDiscoveryQuiz = ({ onComplete, onEarlyExit }: Props) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const { toast } = useToast();

  // Refs to track current state for timer callback
  const currentAnswerRef = useRef(currentAnswer);
  const sessionIdRef = useRef(sessionId);

  // Keep refs in sync
  useEffect(() => {
    currentAnswerRef.current = currentAnswer;
  }, [currentAnswer]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Initial education level question
  const educationLevelQuestion: Question = {
    id: 0,
    question: "What is your current education level?",
    type: "multiple-choice",
    category: "education_level",
    options: [
      "A. 10th Standard (Secondary School)",
      "B. 12th Standard (Higher Secondary)",
      "C. Undergraduate (Bachelor's Degree)",
      "D. Postgraduate (Master's/PhD)"
    ]
  };

  const currentQuestion = allQuestions.length > 0 ? allQuestions[currentQuestionIndex] : educationLevelQuestion;
  const progress = allQuestions.length > 0 ? ((currentQuestionIndex + 1) / allQuestions.length) * 100 : 0;

  // Timer for all questions
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !currentAnswerRef.current?.trim()) {
      // Set timer expired flag to trigger auto-advance
      setTimerExpired(true);
    }
  }, [timeLeft]);

  // Handle timer expiration separately to avoid dependency issues
  useEffect(() => {
    if (timerExpired && sessionIdRef.current) {
      setTimerExpired(false);
      // Auto-advance when time runs out with no answer
      handleTimerExpired();
    }
  }, [timerExpired]);

  // Reset timer when question changes (300s for questions 16-20, 60s otherwise)
  useEffect(() => {
    const timeLimit = currentQuestionIndex >= 15 ? 300 : 60;
    setTimeLeft(timeLimit);
    setTimerExpired(false);
  }, [currentQuestionIndex]);

  // Create session on mount
  useEffect(() => {
    const createSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_quiz_sessions')
        .insert({
          user_id: user.id,
          total_questions: 20
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        toast({
          title: "Error",
          description: "Could not start quiz session",
          variant: "destructive"
        });
        return;
      }

      setSessionId(data.id);
    };

    createSession();
  }, []);

  // Handle timer expiration - advances to next question with no answer
  const handleTimerExpired = async () => {
    if (!sessionIdRef.current) return;

    const noAnswerValue = "No answer (time expired)";
    const newAnswers = { ...answers, [currentQuestion.id]: noAnswerValue };
    setAnswers(newAnswers);

    // If this is the education level question with no answer, trigger early exit
    if (currentQuestion.category === "education_level" && !educationLevel) {
      // User didn't answer the first question - redirect to dashboard
      onEarlyExit?.(0);
      return;
    }

    // Store unanswered question in database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_quiz_answers').insert({
        session_id: sessionIdRef.current,
        user_id: user.id,
        question_number: currentQuestion.id,
        question_category: currentQuestion.category || currentQuestion.type,
        question_text: currentQuestion.question,
        answer_text: noAnswerValue
      });
    } catch (error) {
      console.error('Error saving unanswered question:', error);
    }

    // Move to next question or complete
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer("");
    } else {
      // Quiz complete - check if user answered enough questions
      await handleQuizCompletion(newAnswers);
    }
  };

  const handleNext = async ({ autoAdvance = false, selectedValue }: { autoAdvance?: boolean; selectedValue?: string } = {}) => {
    if (!sessionId) return;

    // Use selectedValue if provided, otherwise fall back to currentAnswer
    const effectiveAnswer = selectedValue || currentAnswer;

    // Validate answer for text questions
    if (currentQuestion.type === "text" && !effectiveAnswer.trim() && !autoAdvance) {
      toast({
        title: "Answer Required",
        description: "Please provide your answer before continuing",
        variant: "destructive"
      });
      return;
    }

    // Save answer
    const answerValue = effectiveAnswer || (autoAdvance ? "No answer (time expired)" : "");
    const newAnswers = { ...answers, [currentQuestion.id]: answerValue };
    setAnswers(newAnswers);

    // If this is the education level question, generate adaptive questions
    if (currentQuestion.category === "education_level" && !educationLevel) {
      setEducationLevel(answerValue);
      await generateAdaptiveQuestions(answerValue);
      setCurrentAnswer("");
      return;
    }

    // Store in database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_quiz_answers').insert({
        session_id: sessionId,
        user_id: user.id,
        question_number: currentQuestion.id,
        question_category: currentQuestion.category || currentQuestion.type,
        question_text: currentQuestion.question,
        answer_text: answerValue
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }

    // Move to next question or complete
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer("");
    } else {
      // Quiz complete - check if user answered enough questions
      await handleQuizCompletion(newAnswers);
    }
  };

  // Check if user answered at least 5 questions, otherwise trigger early exit
  const handleQuizCompletion = async (finalAnswers: Record<number, string>) => {
    const validAnswerCount = Object.values(finalAnswers).filter(
      answer => answer && answer !== "No answer (time expired)"
    ).length;

    const minRequiredAnswers = 5;
    if (validAnswerCount < minRequiredAnswers) {
      // Not enough valid answers - redirect to dashboard
      onEarlyExit?.(validAnswerCount);
      return;
    }

    // Sufficient answers - generate recommendations
    await generateRecommendations();
  };

  const generateAdaptiveQuestions = async (eduLevel: string) => {
    setIsGeneratingQuestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('groq-career-analysis', {
        body: {
          action: 'generate_questions',
          educationLevel: eduLevel
        }
      });

      if (error) throw error;

      if (data?.questions && Array.isArray(data.questions)) {
        setAllQuestions(data.questions);
        setCurrentQuestionIndex(0);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate questions. Using default questions.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const generateRecommendations = async () => {
    if (!sessionId) return;
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Call edge function to generate career recommendations
      const { data, error } = await supabase.functions.invoke('groq-career-analysis', {
        body: {
          sessionId,
          educationLevel,
          answers: Object.entries(answers).map(([qId, answer]) => ({
            question: allQuestions.find(q => q.id === parseInt(qId))?.question || educationLevelQuestion.question,
            answer
          }))
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to analyze responses');
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to generate recommendations');
      }

      if (data.success) {
        const analysis = data.recommendations;
        
        // Update session as completed with proper data structure
        await supabase
          .from('user_quiz_sessions')
          .update({
            is_completed: true,
            session_completed_at: new Date().toISOString(),
            career_recommendations: analysis.careerRecommendations || [],
            strengths: analysis.strengths || [],
            weaknesses: analysis.areasForImprovement || [],
            education_level: educationLevel
          })
          .eq('id', sessionId);

        toast({
          title: "Analysis Complete!",
          description: "Your personalized career recommendations are ready"
        });

        onComplete(sessionId);
      }
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing || isGeneratingQuestions) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">
              {isGeneratingQuestions ? "Generating Personalized Questions" : "Analyzing Your Responses"}
            </h3>
            <p className="text-blue-700">
              {isGeneratingQuestions 
                ? "Creating questions tailored to your education level..." 
                : "Our AI is generating your personalized career recommendations..."}
            </p>
            <p className="text-sm text-blue-600 mt-4">This may take a moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl text-blue-900">
            Career Discovery Assessment
          </CardTitle>
          <div className={`flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
            <Clock className="w-5 h-5" />
            <span className="text-lg font-semibold">{timeLeft}s</span>
          </div>
        </div>
        {allQuestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-blue-700">
              <span>Question {currentQuestionIndex + 1} of {allQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {timeLeft <= 10 && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg animate-fade-in">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-orange-800">Time is running out! Please {currentQuestion?.type === "multiple-choice" ? "select an answer" : "provide your answer"}.</p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-lg font-medium text-blue-900">
            {currentQuestion?.question}
          </p>

          {currentQuestion?.type === "multiple-choice" ? (
            <RadioGroup
              value={currentAnswer}
              onValueChange={(value) => {
                setCurrentAnswer(value);
                // Auto-advance immediately when option is selected
                setTimeout(() => handleNext({ selectedValue: value }), 300);
              }}
              className="space-y-3"
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center rounded-lg border border-border hover:bg-accent hover:border-primary transition-all relative">
                  <Label htmlFor={`option-${index}`} className="flex items-center space-x-3 p-4 w-full cursor-pointer">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <span className="flex-1">{option}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[150px]"
            />
          )}
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={() => {
              // Count answered questions (excluding education level question)
              const answeredCount = Object.keys(answers).filter(
                key => answers[parseInt(key)] && answers[parseInt(key)] !== "No answer (time expired)"
              ).length;
              onEarlyExit?.(answeredCount);
            }}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Quiz
          </Button>
          {currentQuestion && currentQuestion.type !== "multiple-choice" ? (
            <>
              <div className="text-sm text-blue-600">
                Take your time to write a detailed response
              </div>
              <Button
                onClick={() => handleNext()}
                disabled={!currentAnswer.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {!educationLevel ? "Continue" : currentQuestionIndex < allQuestions.length - 1 ? "Next Question" : "Get My Results"}
              </Button>
            </>
          ) : (
            <div className="text-sm text-blue-600 text-center flex-1">
              Your selection will automatically continue to the next question
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCareerDiscoveryQuiz;
