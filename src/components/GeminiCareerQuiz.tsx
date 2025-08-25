import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrainIcon, RocketIcon, LoaderIcon, ArrowRightIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  question: string;
  type: "radio" | "text";
  options?: string[];
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
  const { toast } = useToast();

  const maxQuestions = 15;

  const startQuiz = async () => {
    if (!studentName.trim() || !educationLevel) {
      toast({
        title: "Information Required",
        description: "Please provide your name and education level to begin.",
        variant: "destructive",
      });
      return;
    }

    try {
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
      await generateNextQuestion([]);
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to start the quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateNextQuestion = async (currentAnswers: Answer[]) => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('gemini-career-guidance', {
        body: {
          action: 'generate_question',
          answers: currentAnswers,
          currentQuestionCount: questionCount,
          userName: studentName,
          educationLevel: educationLevel
        }
      });

      if (response.error) throw response.error;

      const { isComplete, question } = response.data;

      if (isComplete) {
        await generateFinalReport();
        return;
      }

      setCurrentQuestion(question);
      setCurrentAnswer("");
    } catch (error) {
      console.error('Error generating question:', error);
      toast({
        title: "Error",
        description: "Failed to generate the next question. Please try again.",
        variant: "destructive",
      });
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
      const response = await supabase.functions.invoke('gemini-career-guidance', {
        body: {
          action: 'generate_report',
          answers: answers,
          userName: studentName,
          educationLevel: educationLevel
        }
      });

      if (response.error) throw response.error;

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
      toast({
        title: "Error",
        description: "Failed to generate your career report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
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
                 placeholder="e.g., 10th Grade, 12th Grade, Undergraduate, Graduate"
                 value={educationLevel}
                 onChange={(e) => setEducationLevel(e.target.value)}
               />
             </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What to Expect:</h3>
             <ul className="text-sm text-blue-800 space-y-1">
               <li>• Up to 15 short, easy-to-understand questions</li>
               <li>• Type your own answers, no multiple choice</li>
               <li>• Get 5 tailored career recommendations</li>
               <li>• Receive 3 free courses for each level</li>
               <li>• Save results and courses to your history</li>
             </ul>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button onClick={startQuiz} className="flex-1">
              Start Assessment
              <RocketIcon className="ml-2 h-4 w-4" />
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

  if (loading && !currentQuestion) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <LoaderIcon className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Generating Next Question</h3>
            <p className="text-gray-600">
              Creating a personalized question based on your previous responses...
            </p>
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
            Focus: {currentQuestion.reasoning}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentQuestion && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
            
            <Textarea
              placeholder="Type your answer here... Share your thoughts and preferences"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="min-h-[120px]"
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