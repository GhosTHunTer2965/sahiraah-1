import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { BrainIcon, ArrowRightIcon, CheckCircleIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'text';
  options?: string[];
  category: string;
}

interface Props {
  onComplete: (sessionId: string) => void;
}

const AICareerQuiz = ({ onComplete }: Props) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [generatingQuestions, setGeneratingQuestions] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    initializeQuiz();
  }, []);

  const initializeQuiz = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile for context
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile(profile);

      // Create quiz session
      const { data: session, error } = await supabase
        .from('user_quiz_sessions')
        .insert({
          user_id: user.id,
          student_name: profile?.name || 'Student',
          education_level: profile?.current_qualification || '12th standard',
          total_questions: 20
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(session.id);

      // Generate AI-driven questions
      await generateAdaptiveQuestions(profile);
    } catch (error) {
      console.error('Error initializing quiz:', error);
      toast({
        title: "Error",
        description: "Failed to initialize quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateAdaptiveQuestions = async (profile: any) => {
    try {
      setGeneratingQuestions(true);
      
      const educationLevel = profile?.current_qualification || '12th standard';
      const interests = profile?.skills_interests || [];
      
      const { data, error } = await supabase.functions.invoke('career-guidance-chat', {
        body: {
          message: `Generate 20 adaptive career assessment questions for a student with education level: ${educationLevel}. Include questions about personality (Myers-Briggs, Holland Codes, Big Five), career interests, NSQF inputs (family income, education spending capacity), and specific interests: ${interests.join(', ')}. 

Format as JSON array with structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "What motivates you most in work?",
      "type": "multiple_choice",
      "options": ["Achievement", "Recognition", "Helping others", "Financial gain"],
      "category": "personality"
    }
  ]
}

Ensure questions are appropriate for ${educationLevel} level and cover:
- 5 personality questions (Big Five traits, work preferences)
- 5 career interest questions (Holland Codes)
- 5 educational/financial questions (NSQF relevant)
- 5 skill/aptitude questions

Make options realistic and relevant for Indian students.`
        }
      });

      if (error) throw error;

      try {
        const response = JSON.parse(data.response);
        if (response.questions && Array.isArray(response.questions)) {
          setQuestions(response.questions);
        } else {
          throw new Error('Invalid questions format');
        }
      } catch (parseError) {
        console.error('Error parsing questions:', parseError);
        // Fallback to default questions
        setQuestions(getDefaultQuestions(educationLevel));
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setQuestions(getDefaultQuestions(profile?.current_qualification || '12th standard'));
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const getDefaultQuestions = (educationLevel: string): QuizQuestion[] => {
    const baseQuestions = [
      {
        id: 'q1',
        question: 'What type of work environment appeals to you most?',
        type: 'multiple_choice' as const,
        options: ['Creative and flexible', 'Structured and organized', 'Dynamic and fast-paced', 'Collaborative and social'],
        category: 'personality'
      },
      {
        id: 'q2',
        question: 'Which activity would you find most engaging?',
        type: 'multiple_choice' as const,
        options: ['Solving complex problems', 'Leading a team project', 'Creating something new', 'Helping others succeed'],
        category: 'interests'
      },
      {
        id: 'q3',
        question: 'What is your family\'s approximate annual income range?',
        type: 'multiple_choice' as const,
        options: ['Below ₹3 lakhs', '₹3-8 lakhs', '₹8-15 lakhs', 'Above ₹15 lakhs'],
        category: 'financial'
      },
      {
        id: 'q4',
        question: 'How much can your family invest in your education annually?',
        type: 'multiple_choice' as const,
        options: ['Up to ₹50,000', '₹50,000-₹2 lakhs', '₹2-5 lakhs', 'Above ₹5 lakhs'],
        category: 'financial'
      },
      {
        id: 'q5',
        question: 'Which subjects do you enjoy most?',
        type: 'multiple_choice' as const,
        options: ['Mathematics and Science', 'Arts and Literature', 'Social Sciences', 'Practical and Technical'],
        category: 'academic'
      }
    ];

    // Add education-level specific questions
    if (educationLevel.includes('10th')) {
      baseQuestions.push({
        id: 'q6',
        question: 'What stream are you planning for 11th-12th?',
        type: 'multiple_choice' as const,
        options: ['Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts/Humanities'],
        category: 'academic'
      });
    } else if (educationLevel.includes('12th')) {
      baseQuestions.push({
        id: 'q6',
        question: 'What type of higher education interests you?',
        type: 'multiple_choice' as const,
        options: ['Engineering', 'Medicine', 'Business/Management', 'Arts/Design'],
        category: 'academic'
      });
    }

    // Add more questions to reach 20
    for (let i = baseQuestions.length; i < 20; i++) {
      baseQuestions.push({
        id: `q${i + 1}`,
        question: `Rate your interest in ${['Technology', 'Healthcare', 'Business', 'Creative Arts', 'Social Service'][i % 5]} on a scale of 1-5`,
        type: 'multiple_choice' as const,
        options: ['1 - Very Low', '2 - Low', '3 - Moderate', '4 - High', '5 - Very High'],
        category: 'interests'
      });
    }

    return baseQuestions;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = async () => {
    const currentQ = questions[currentQuestion];
    if (!answers[currentQ.id]) {
      toast({
        title: "Answer Required",
        description: "Please select an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    // Store answer in database
    if (sessionId) {
      try {
        await supabase
          .from('user_quiz_answers')
          .insert({
            session_id: sessionId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            question_number: currentQuestion + 1,
            question_category: currentQ.category,
            question_text: currentQ.question,
            answer_text: answers[currentQ.id]
          });
      } catch (error) {
        console.error('Error storing answer:', error);
      }
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await completeQuiz();
    }
  };

  const completeQuiz = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      // Generate career analysis using Groq
      const { data, error } = await supabase.functions.invoke('gemini-career-guidance', {
        body: {
          sessionId,
          answers: Object.entries(answers).map(([questionId, answer]) => {
            const question = questions.find(q => q.id === questionId);
            return {
              question: question?.question || '',
              answer,
              category: question?.category || 'general'
            };
          }),
          userProfile
        }
      });

      if (error) throw error;

      // Mark session as completed
      await supabase
        .from('user_quiz_sessions')
        .update({
          is_completed: true,
          session_completed_at: new Date().toISOString(),
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          career_recommendations: data.career_recommendations || []
        })
        .eq('id', sessionId);

      onComplete(sessionId);
      
      toast({
        title: "Assessment Complete!",
        description: "Your personalized career recommendations are ready.",
      });
    } catch (error) {
      console.error('Error completing quiz:', error);
      toast({
        title: "Error",
        description: "Failed to complete assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (generatingQuestions) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <BrainIcon className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Generating Your Personalized Questions</h3>
            <p className="text-gray-600">AI is creating adaptive questions based on your profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600">Failed to load questions. Please refresh the page.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <BrainIcon className="mr-2 h-5 w-5 text-blue-600" />
            AI Career Assessment
          </CardTitle>
          <span className="text-sm text-gray-500">
            {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>
            
            {currentQ.type === 'multiple_choice' && currentQ.options && (
              <RadioGroup
                value={answers[currentQ.id] || ''}
                onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent hover:border-primary transition-all cursor-pointer">
                    <RadioGroupItem value={option} id={`${currentQ.id}-${index}`} />
                    <Label htmlFor={`${currentQ.id}-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQ.type === 'text' && (
              <Textarea
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[100px]"
              />
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleNext}
              disabled={loading || !answers[currentQ.id]}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                "Processing..."
              ) : currentQuestion === questions.length - 1 ? (
                <>
                  Get My Results
                  <CheckCircleIcon className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AICareerQuiz;