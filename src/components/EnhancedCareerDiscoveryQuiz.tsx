import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, AlertCircle } from "lucide-react";

interface Props {
  onComplete: (sessionId: string) => void;
}

interface Question {
  id: number;
  question: string;
  type: "multiple-choice" | "text";
  options?: string[];
}

const EnhancedCareerDiscoveryQuiz = ({ onComplete }: Props) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // 15 Multiple Choice Questions
  const multipleChoiceQuestions: Question[] = [
    {
      id: 1,
      question: "Which word best describes your personality?",
      type: "multiple-choice",
      options: ["A. Imaginative", "B. Analytical", "C. Empathetic", "D. Organized"]
    },
    {
      id: 2,
      question: "What type of problems in the world interest you most?",
      type: "multiple-choice",
      options: [
        "A. Environmental or design challenges",
        "B. Technological or scientific problems",
        "C. Social issues like education or equality",
        "D. Economic or organizational challenges"
      ]
    },
    {
      id: 3,
      question: "What motivates you to work hard?",
      type: "multiple-choice",
      options: [
        "A. Achieving goals and measurable success",
        "B. Bringing creative ideas to life",
        "C. Making a difference for others",
        "D. Solving complex or technical problems"
      ]
    },
    {
      id: 4,
      question: "How do you like to learn new things?",
      type: "multiple-choice",
      options: [
        "A. By experimenting and hands-on practice",
        "B. By observing or visualizing",
        "C. By discussing or teaching others",
        "D. By reading, researching, and analyzing"
      ]
    },
    {
      id: 5,
      question: "What kind of activities make you lose track of time?",
      type: "multiple-choice",
      options: [
        "A. Creating, designing, or imagining new things",
        "B. Solving puzzles or analyzing how things work",
        "C. Talking to people or helping others",
        "D. Organizing, planning, or managing tasks"
      ]
    },
    {
      id: 6,
      question: "What do you enjoy learning about the most?",
      type: "multiple-choice",
      options: [
        "A. Art, creativity, and human expression",
        "B. Technology, science, and systems",
        "C. Psychology, education, and people",
        "D. Business, organization, and strategy"
      ]
    },
    {
      id: 7,
      question: "How do you usually handle deadlines?",
      type: "multiple-choice",
      options: [
        "A. I stay calm and use creativity to find shortcuts",
        "B. I plan systematically and finish ahead of time",
        "C. I rely on collaboration to stay on track",
        "D. I create structure and check progress regularly"
      ]
    },
    {
      id: 8,
      question: "When faced with failure, what do you usually do first?",
      type: "multiple-choice",
      options: [
        "A. Reflect and find creative alternatives",
        "B. Analyze the mistake and learn from it",
        "C. Talk it out and seek feedback",
        "D. Regroup and make a structured new plan"
      ]
    },
    {
      id: 9,
      question: "How do you approach decision-making?",
      type: "multiple-choice",
      options: [
        "A. Based on logic and data",
        "B. Based on intuition and creativity",
        "C. Based on how it impacts others",
        "D. Based on practicality and efficiency"
      ]
    },
    {
      id: 10,
      question: "What motivates you most when you wake up to work/study?",
      type: "multiple-choice",
      options: [
        "A. The desire to create something original and new",
        "B. The goal of helping people directly and making a difference",
        "C. The pursuit of mastery and being the best in a field",
        "D. The opportunity to earn a good income and achieve financial stability"
      ]
    },
    {
      id: 11,
      question: "Which word describes you best?",
      type: "multiple-choice",
      options: ["A. Imaginative", "B. Curious", "C. Caring", "D. Organized"]
    },
    {
      id: 12,
      question: "Your best friend is upset because they got fewer marks than expected. What will you do?",
      type: "multiple-choice",
      options: [
        "A. Tell them not to cry and move on",
        "B. Listen to them and make them feel better",
        "C. Compare your marks with theirs",
        "D. Avoid talking about it"
      ]
    },
    {
      id: 13,
      question: "You're part of a group project, and one teammate isn't doing their share of work. How will you handle it?",
      type: "multiple-choice",
      options: [
        "A. Do their part quietly to finish the project",
        "B. Get angry and complain to the teacher",
        "C. Talk calmly to them and understand what's wrong",
        "D. Ignore it and focus only on your part"
      ]
    },
    {
      id: 14,
      question: "If 5 pencils cost ₹25, how many pencils can you buy for ₹100?",
      type: "multiple-choice",
      options: ["A. 15", "B. 20", "C. 25", "D. 30"]
    },
    {
      id: 15,
      question: "A train leaves Mangaluru at 6:30 AM and reaches Udupi at 8:00 AM. Another train leaves Udupi at 7:15 AM and reaches Mangaluru at 8:45 AM. At what time do the two trains meet if they travel at the same speed?",
      type: "multiple-choice",
      options: ["A. 7:30 AM", "B. 7:37 AM", "C. 7:45 AM", "D. 7:50 AM"]
    }
  ];

  // 5 Open-ended Text Questions
  const textQuestions: Question[] = [
    {
      id: 16,
      question: "Describe what your ideal work or study environment looks like, including the pace, people, and setting you prefer.",
      type: "text"
    },
    {
      id: 17,
      question: "If you were leading a group project, how would you ensure it is completed successfully? Mention your steps or strategies.",
      type: "text"
    },
    {
      id: 18,
      question: "Tell me about a time you were offered something new outside your comfort zone. How did you respond and why?",
      type: "text"
    },
    {
      id: 19,
      question: "What kind of challenges or problems excite you the most, and can you give an example from your experience?",
      type: "text"
    },
    {
      id: 20,
      question: "Where do you see yourself in 10 years, and what kind of work or impact do you want to have then?",
      type: "text"
    }
  ];

  const allQuestions = [...multipleChoiceQuestions, ...textQuestions];
  const currentQuestion = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;

  // Timer for multiple-choice questions
  useEffect(() => {
    if (currentQuestion?.type === "multiple-choice" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentQuestion?.type === "multiple-choice") {
      // Auto-advance when time runs out
      handleNext(true);
    }
  }, [timeLeft, currentQuestion]);

  // Reset timer when question changes
  useEffect(() => {
    if (currentQuestion?.type === "multiple-choice") {
      setTimeLeft(60);
    }
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

  const handleNext = async (autoAdvance = false) => {
    if (!sessionId) return;

    // Validate answer for text questions
    if (currentQuestion.type === "text" && !currentAnswer.trim() && !autoAdvance) {
      toast({
        title: "Answer Required",
        description: "Please provide your answer before continuing",
        variant: "destructive"
      });
      return;
    }

    // Save answer
    const answerValue = currentAnswer || (autoAdvance ? "No answer (time expired)" : "");
    const newAnswers = { ...answers, [currentQuestion.id]: answerValue };
    setAnswers(newAnswers);

    // Store in database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_quiz_answers').insert({
        session_id: sessionId,
        user_id: user.id,
        question_number: currentQuestion.id,
        question_category: currentQuestion.type,
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
      // Quiz complete - generate recommendations
      await generateRecommendations();
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
          answers: Object.entries(answers).map(([qId, answer]) => ({
            question: allQuestions.find(q => q.id === parseInt(qId))?.question,
            answer
          }))
        }
      });

      if (error) throw error;

      if (data.success) {
        // Update session as completed
        await supabase
          .from('user_quiz_sessions')
          .update({
            is_completed: true,
            session_completed_at: new Date().toISOString(),
            career_recommendations: data.recommendations
          })
          .eq('id', sessionId);

        toast({
          title: "Analysis Complete!",
          description: "Your personalized career recommendations are ready"
        });

        onComplete(sessionId);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Analyzing Your Responses</h3>
            <p className="text-blue-700">Our AI is generating your personalized career recommendations...</p>
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
          {currentQuestion?.type === "multiple-choice" && (
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-semibold">{timeLeft}s</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-blue-700">
            <span>Question {currentQuestionIndex + 1} of {allQuestions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentQuestion?.type === "multiple-choice" && timeLeft <= 10 && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-orange-800">Time is running out! Please select an answer.</p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-lg font-medium text-blue-900">
            {currentQuestion?.question}
          </p>

          {currentQuestion?.type === "multiple-choice" ? (
            <RadioGroup
              value={currentAnswer}
              onValueChange={setCurrentAnswer}
              className="space-y-3"
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-blue-50 transition">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                    {option}
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
          <div className="text-sm text-blue-600">
            {currentQuestion?.type === "text" && "Take your time to write a detailed response"}
            {currentQuestion?.type === "multiple-choice" && "Select one option to continue"}
          </div>
          <Button
            onClick={() => handleNext(false)}
            disabled={!currentAnswer}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {currentQuestionIndex < allQuestions.length - 1 ? "Next Question" : "Get My Results"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCareerDiscoveryQuiz;
