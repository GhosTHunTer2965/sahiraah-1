
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { BrainIcon, RocketIcon, LoaderIcon, ArrowRightIcon, AlertCircleIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  question: string;
  type: "text";
  placeholder?: string;
  category: string;
  reasoning: string;
}

interface Answer {
  question: string;
  answer: string;
  category: string;
}

interface Props {
  onComplete: (sessionId: string) => void;
  onBack: () => void;
}

const GeminiCareerQuiz = ({ onComplete, onBack }: Props) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [showPersonalInfo, setShowPersonalInfo] = useState(true);
  const [questionCount, setQuestionCount] = useState(0);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const maxQuestions = 15;
  const maxRetries = 3;

  // Fallback questions for when API fails
  const fallbackQuestions = [
    {
      question: "What activities make you lose track of time?",
      type: "text" as const,
      placeholder: "Describe activities that deeply engage you...",
      category: "interests",
      reasoning: "Understanding your natural interests helps identify career paths that will keep you motivated and engaged."
    },
    {
      question: "What kind of problems do you enjoy solving?",
      type: "text" as const,
      placeholder: "Share what type of challenges excite you...",
      category: "problem_solving",
      reasoning: "Your problem-solving preferences reveal the type of work environment and challenges that suit you best."
    },
    {
      question: "How do you prefer to work with others?",
      type: "text" as const,
      placeholder: "Describe your ideal team dynamics...",
      category: "teamwork",
      reasoning: "Understanding your collaboration style helps match you with careers that fit your social work preferences."
    },
    {
      question: "What subjects did you enjoy most in school?",
      type: "text" as const,
      placeholder: "Tell us about your favorite subjects and why...",
      category: "academic_interests",
      reasoning: "Academic preferences often translate into career interests and can guide educational pathways."
    },
    {
      question: "What impact do you want to make in the world?",
      type: "text" as const,
      placeholder: "Share your vision for contributing to society...",
      category: "purpose",
      reasoning: "Your desired impact helps identify meaningful career paths that align with your values and goals."
    }
  ];

  const startQuiz = async () => {
    if (!studentName.trim() || !educationLevel.trim()) {
      toast({
        title: "Information Required",
        description: "Please provide your name and education level to begin.",
        variant: "destructive",
      });
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Create quiz session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: session, error } = await supabase
        .from('user_quiz_sessions')
        .insert({
          user_id: user.id,
          student_name: studentName,
          education_level: educationLevel,
          current_question_index: 0,
          total_questions: maxQuestions,
          is_completed: false
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(session.id);
      setShowPersonalInfo(false);
      
      // Try to generate first question, fallback if needed
      await generateNextQuestion([]);
    } catch (error) {
      console.error('Error starting quiz:', error);
      setError('Failed to start quiz. Please try again.');
      toast({
        title: "Error",
        description: "Failed to start the quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNextQuestion = async (currentAnswers: Answer[]) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Generating question:', { currentAnswers: currentAnswers.length, questionCount });
      
      const response = await supabase.functions.invoke('gemini-career-guidance', {
        body: {
          action: 'generate_question',
          answers: currentAnswers,
          currentQuestionCount: questionCount,
          userName: studentName,
          educationLevel: educationLevel
        }
      });

      console.log('Question generation response:', response);

      if (response.error) {
        console.error('Supabase function error:', response.error);
        throw new Error(response.error.message || 'Failed to generate question');
      }

      const { isComplete, question } = response.data;

      if (isComplete) {
        await generateFinalReport();
        return;
      }

      if (question && question.question) {
        setCurrentQuestion(question);
        setCurrentAnswer("");
        setRetryCount(0);
      } else {
        throw new Error('Invalid question format received');
      }

    } catch (error) {
      console.error('Error generating question:', error);
      
      // Use fallback question based on current progress
      if (retryCount < maxRetries && questionCount < fallbackQuestions.length) {
        console.log('Using fallback question');
        const fallbackQuestion = fallbackQuestions[questionCount] || fallbackQuestions[0];
        setCurrentQuestion(fallbackQuestion);
        setCurrentAnswer("");
        setRetryCount(retryCount + 1);
        
        toast({
          title: "Using Standard Question",
          description: "We're continuing with our standard questions while we resolve the issue.",
        });
      } else {
        setError('Unable to generate questions. Please try again.');
        toast({
          title: "Error",
          description: "Failed to generate questions. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before continuing.",
        variant: "destructive",
      });
      return;
    }

    const newAnswer: Answer = {
      question: currentQuestion!.question,
      answer: currentAnswer,
      category: currentQuestion!.category
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    
    // Save answer to database
    try {
      if (sessionId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_quiz_answers').insert({
            user_id: user.id,
            session_id: sessionId,
            question_number: questionCount + 1,
            question_text: currentQuestion!.question,
            answer_text: currentAnswer,
            question_category: currentQuestion!.category
          });
        }
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      // Continue even if saving fails
    }

    const newQuestionCount = questionCount + 1;
    setQuestionCount(newQuestionCount);

    if (newQuestionCount >= maxQuestions) {
      await generateFinalReport();
    } else {
      await generateNextQuestion(updatedAnswers);
    }
  };

  const generateFinalReport = async () => {
    setIsGeneratingReport(true);
    try {
      console.log('Generating final report with answers:', answers.length);
      
      const response = await supabase.functions.invoke('gemini-career-guidance', {
        body: {
          action: 'generate_report',
          answers: answers,
          userName: studentName,
          educationLevel: educationLevel
        }
      });

      console.log('Report generation response:', response);

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate report');
      }

      const { analysis } = response.data;

      // Update session with analysis results
      if (sessionId) {
        await supabase
          .from('user_quiz_sessions')
          .update({
            is_completed: true,
            session_completed_at: new Date().toISOString(),
            strengths: analysis.strengths,
            weaknesses: analysis.areasForImprovement,
            career_recommendations: analysis.careerRecommendations
          })
          .eq('id', sessionId);

        toast({
          title: "Assessment Complete!",
          description: "Your personalized career recommendations are ready.",
        });

        onComplete(sessionId);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate your career report. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate your career report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    if (questionCount === 0) {
      generateNextQuestion([]);
    } else {
      generateNextQuestion(answers);
    }
  };

  if (showPersonalInfo) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <BrainIcon className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl">Smart Tree Career Assessment</CardTitle>
          <CardDescription className="text-lg">
            Get personalized career recommendations through our smart assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="education">Education Level *</Label>
              <Input
                id="education"
                placeholder="e.g., SSLC/10th, PUC/12th, BE/B.Tech, BA, BSc, etc."
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
              />
              <p className="text-sm text-gray-600">
                Examples: SSLC, 10th Standard, PUC, 12th Grade, BE/B.Tech, BA, BSc, MBA, etc.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What to Expect:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Up to 15 personalized questions</li>
              <li>• Questions adapt based on your answers</li>
              <li>• Get detailed career recommendations</li>
              <li>• Receive free course suggestions</li>
              <li>• Save results to your history</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button 
              onClick={startQuiz} 
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RocketIcon className="ml-2 h-4 w-4" />
              )}
              Start Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isGeneratingReport) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <LoaderIcon className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Generating Your Career Report</h3>
            <p className="text-gray-600">
              Analyzing your responses and creating personalized recommendations...
            </p>
            <Progress value={85} className="mt-4 max-w-md mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-red-900">Something Went Wrong</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onBack}>
                Back to Menu
              </Button>
              <Button onClick={handleRetry}>
                Try Again
                <RocketIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && !currentQuestion) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <LoaderIcon className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Preparing Your Question</h3>
            <p className="text-gray-600">
              Creating a personalized question based on your profile...
            </p>
            <Progress value={30} className="mt-4 max-w-md mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl">Question {questionCount + 1} of {maxQuestions}</CardTitle>
          <span className="text-sm text-gray-500">{Math.round(((questionCount) / maxQuestions) * 100)}% Complete</span>
        </div>
        <Progress value={(questionCount / maxQuestions) * 100} className="mb-4" />
        {currentQuestion && (
          <CardDescription className="text-sm text-blue-600 mb-4">
            💡 {currentQuestion.reasoning}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentQuestion && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                {currentQuestion.question}
              </h3>
              <p className="text-sm text-blue-700">
                Category: {currentQuestion.category.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            
            <Textarea
              placeholder={currentQuestion.placeholder || "Share your thoughts and experiences..."}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="min-h-[120px] text-base"
            />
          </div>
        )}

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={loading}
            className="flex-1"
          >
            Back to Menu
          </Button>
          <Button
            onClick={handleAnswerSubmit}
            disabled={loading || !currentAnswer.trim()}
            className="flex-1"
          >
            {loading ? (
              <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ArrowRightIcon className="h-4 w-4 mr-2" />
            )}
            {questionCount >= maxQuestions - 1 ? "Complete Assessment" : "Next Question"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeminiCareerQuiz;
