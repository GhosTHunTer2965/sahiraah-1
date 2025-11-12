import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Brain, GraduationCap, Heart, DollarSign, MapPin, Clock, Users, Target } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  category: string;
  type: 'multiple_choice' | 'rating' | 'text' | 'select' | 'multi_select';
  question: string;
  options?: string[];
  context?: string;
  weight: number;
}

interface QuizResponse {
  questionId: string;
  category: string;
  answer: string | string[] | number;
  weight: number;
}

interface EnhancedCareerQuizProps {
  onComplete: (responses: QuizResponse[], sessionId: string) => void;
  userProfile?: {
    educationLevel?: string;
    location?: string;
    age?: number;
  };
}

const enhancedQuestions: Question[] = [
  // Academic Background & Performance
  {
    id: 'current_education',
    category: 'academic_background',
    type: 'select',
    question: 'What is your current educational level?',
    options: ['10th Grade', '12th Grade (Science)', '12th Grade (Commerce)', '12th Grade (Arts)', 'Graduate', 'Postgraduate', 'Other'],
    weight: 3
  },
  {
    id: 'academic_performance',
    category: 'academic_background',
    type: 'select',
    question: 'How would you describe your academic performance?',
    options: ['Excellent (90%+)', 'Good (75-90%)', 'Average (60-75%)', 'Below Average (45-60%)', 'Poor (<45%)'],
    weight: 2
  },
  {
    id: 'favorite_subjects',
    category: 'academic_background',
    type: 'multi_select',
    question: 'Which subjects do you enjoy or perform best in? (Select all that apply)',
    options: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Geography', 'Economics', 'Arts/Drawing', 'Music', 'Physical Education', 'Psychology', 'Philosophy'],
    weight: 3
  },
  {
    id: 'learning_style',
    category: 'academic_background',
    type: 'multiple_choice',
    question: 'How do you learn best?',
    options: ['Visual (diagrams, charts, videos)', 'Auditory (listening, discussions)', 'Kinesthetic (hands-on, experiments)', 'Reading/Writing (books, notes)'],
    weight: 2
  },

  // Socio-Economic Context
  {
    id: 'family_income',
    category: 'socio_economic',
    type: 'select',
    question: 'What is your family\'s annual income range?',
    options: ['Below ₹2 Lakh', '₹2-5 Lakh', '₹5-10 Lakh', '₹10-20 Lakh', '₹20-50 Lakh', 'Above ₹50 Lakh', 'Prefer not to say'],
    weight: 3
  },
  {
    id: 'education_investment',
    category: 'socio_economic',
    type: 'select',
    question: 'How much can your family invest in your higher education?',
    options: ['Less than ₹1 Lakh', '₹1-3 Lakh', '₹3-5 Lakh', '₹5-10 Lakh', '₹10-20 Lakh', 'More than ₹20 Lakh', 'Need financial aid/scholarship'],
    weight: 3
  },
  {
    id: 'location_type',
    category: 'socio_economic',
    type: 'select',
    question: 'Where do you currently live?',
    options: ['Rural area', 'Small town', 'City', 'Metro city'],
    weight: 2
  },
  {
    id: 'mobility_willingness',
    category: 'socio_economic',
    type: 'multiple_choice',
    question: 'Are you willing to relocate for education or career opportunities?',
    options: ['Yes, anywhere in India', 'Yes, but only within my state', 'Yes, but only nearby cities', 'No, prefer to stay local'],
    weight: 2
  },
  {
    id: 'parent_education',
    category: 'socio_economic',
    type: 'select',
    question: 'What is the highest education level of your parents?',
    options: ['No formal education', 'Primary school', 'High school', 'Graduate', 'Postgraduate', 'Professional degree'],
    weight: 1
  },

  // Personality & Aptitude
  {
    id: 'work_environment',
    category: 'personality',
    type: 'multiple_choice',
    question: 'In which environment do you work best?',
    options: ['Quiet, individual workspace', 'Collaborative team environment', 'Dynamic, changing environments', 'Structured, organized settings'],
    weight: 3
  },
  {
    id: 'pressure_handling',
    category: 'personality',
    type: 'rating',
    question: 'How well do you handle pressure and deadlines? (1 = Very Poor, 5 = Excellent)',
    weight: 2
  },
  {
    id: 'leadership_interest',
    category: 'personality',
    type: 'rating',
    question: 'How interested are you in leading teams or projects? (1 = Not at all, 5 = Very interested)',
    weight: 2
  },
  {
    id: 'problem_solving_style',
    category: 'personality',
    type: 'multiple_choice',
    question: 'How do you approach problem-solving?',
    options: ['Analytical and systematic', 'Creative and innovative', 'Collaborative discussion', 'Trial and error'],
    weight: 3
  },
  {
    id: 'communication_preference',
    category: 'personality',
    type: 'multiple_choice',
    question: 'Which communication style suits you best?',
    options: ['Public speaking and presentations', 'One-on-one conversations', 'Written communication', 'Visual/graphic communication'],
    weight: 2
  },

  // Career Aspirations & Values
  {
    id: 'career_motivation',
    category: 'career_aspirations',
    type: 'multiple_choice',
    question: 'What motivates you most in a career?',
    options: ['High salary and financial security', 'Job satisfaction and passion', 'Social impact and helping others', 'Recognition and prestige', 'Work-life balance', 'Innovation and creativity'],
    weight: 3
  },
  {
    id: 'work_life_balance',
    category: 'career_aspirations',
    type: 'rating',
    question: 'How important is work-life balance to you? (1 = Not important, 5 = Very important)',
    weight: 2
  },
  {
    id: 'job_security_preference',
    category: 'career_aspirations',
    type: 'multiple_choice',
    question: 'Which do you prefer?',
    options: ['Stable job with predictable income', 'High-risk, high-reward opportunities', 'Entrepreneurship and business ownership', 'Flexible freelance/contract work'],
    weight: 2
  },
  {
    id: 'industry_interest',
    category: 'career_aspirations',
    type: 'multi_select',
    question: 'Which industries interest you? (Select all that apply)',
    options: ['Technology/IT', 'Healthcare/Medicine', 'Education', 'Finance/Banking', 'Manufacturing', 'Government/Public Service', 'Media/Entertainment', 'Sports', 'Agriculture', 'Defense', 'Research/Science', 'Social Work'],
    weight: 3
  },

  // Skills & Interests Assessment
  {
    id: 'technical_aptitude',
    category: 'skills_interests',
    type: 'rating',
    question: 'How comfortable are you with technology and computers? (1 = Very uncomfortable, 5 = Very comfortable)',
    weight: 3
  },
  {
    id: 'mathematical_skills',
    category: 'skills_interests',
    type: 'rating',
    question: 'How would you rate your mathematical and analytical skills? (1 = Very poor, 5 = Excellent)',
    weight: 3
  },
  {
    id: 'creative_skills',
    category: 'skills_interests',
    type: 'rating',
    question: 'How would you rate your creative and artistic abilities? (1 = Very poor, 5 = Excellent)',
    weight: 2
  },
  {
    id: 'social_skills',
    category: 'skills_interests',
    type: 'rating',
    question: 'How would you rate your interpersonal and social skills? (1 = Very poor, 5 = Excellent)',
    weight: 2
  },
  {
    id: 'physical_stamina',
    category: 'skills_interests',
    type: 'rating',
    question: 'How would you rate your physical fitness and stamina? (1 = Very poor, 5 = Excellent)',
    weight: 1
  },

  // Career Goals & Timeline
  {
    id: 'career_timeline',
    category: 'career_goals',
    type: 'multiple_choice',
    question: 'When do you want to start your career?',
    options: ['Immediately after current education', 'After additional skill development (1-2 years)', 'After higher education (3-4 years)', 'After advanced degrees (5+ years)'],
    weight: 2
  },
  {
    id: 'salary_expectations',
    category: 'career_goals',
    type: 'select',
    question: 'What are your starting salary expectations?',
    options: ['₹2-4 Lakh per year', '₹4-6 Lakh per year', '₹6-10 Lakh per year', '₹10-15 Lakh per year', '₹15+ Lakh per year', 'Not sure/Salary not the main factor'],
    weight: 2
  },

  // Additional Context
  {
    id: 'role_models',
    category: 'additional_context',
    type: 'text',
    question: 'Who are your role models or inspirations in any field? (Optional)',
    weight: 1
  },
  {
    id: 'unique_circumstances',
    category: 'additional_context',
    type: 'text',
    question: 'Are there any unique circumstances or constraints we should consider? (Optional)',
    weight: 1
  }
];

export const EnhancedCareerQuiz: React.FC<EnhancedCareerQuizProps> = ({ onComplete, userProfile }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[] | number>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [startTime] = useState<Date>(new Date());

  useEffect(() => {
    // Generate session ID
    const newSessionId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  const currentQuestion = enhancedQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / enhancedQuestions.length) * 100;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic_background': return <GraduationCap className="h-5 w-5" />;
      case 'socio_economic': return <DollarSign className="h-5 w-5" />;
      case 'personality': return <Brain className="h-5 w-5" />;
      case 'career_aspirations': return <Target className="h-5 w-5" />;
      case 'skills_interests': return <Heart className="h-5 w-5" />;
      case 'career_goals': return <MapPin className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  const handleAnswerChange = (value: string | string[] | number) => {
    setCurrentAnswer(value);
  };

  const handleNext = async () => {
    if (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
      toast.error('Please provide an answer before proceeding');
      return;
    }

    const response: QuizResponse = {
      questionId: currentQuestion.id,
      category: currentQuestion.category,
      answer: currentAnswer,
      weight: currentQuestion.weight
    };

    const updatedResponses = [...responses, response];
    setResponses(updatedResponses);

    // Save response to database
    try {
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        await supabase.from('user_quiz_answers').insert({
          session_id: sessionId,
          user_id: user.data.user.id,
          question_number: currentQuestionIndex + 1,
          question_category: currentQuestion.category,
          question_text: currentQuestion.question,
          answer_text: Array.isArray(currentAnswer) ? currentAnswer.join(', ') : String(currentAnswer)
        });
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    }

    if (currentQuestionIndex < enhancedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
    } else {
      // Quiz completed
      const endTime = new Date();
      const timeTaken = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60); // minutes

      try {
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          await supabase.from('user_quiz_sessions').insert({
            id: sessionId,
            user_id: user.data.user.id,
            session_started_at: startTime.toISOString(),
            session_completed_at: endTime.toISOString(),
            current_question_index: enhancedQuestions.length,
            total_questions: enhancedQuestions.length,
            is_completed: true
          });
        }
      } catch (error) {
        console.error('Error saving session:', error);
      }

      onComplete(updatedResponses, sessionId);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Restore previous answer
      const previousResponse = responses[currentQuestionIndex - 1];
      if (previousResponse) {
        setCurrentAnswer(previousResponse.answer);
      } else {
        setCurrentAnswer('');
      }
    }
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <RadioGroup
            value={String(currentAnswer)}
            onValueChange={(value) => handleAnswerChange(value)}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent hover:border-primary transition-all cursor-pointer">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'select':
        return (
          <Select value={String(currentAnswer)} onValueChange={(value) => handleAnswerChange(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {currentQuestion.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multi_select':
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`multi-${index}`}
                  checked={Array.isArray(currentAnswer) && currentAnswer.includes(option)}
                  onChange={(e) => {
                    const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                    if (e.target.checked) {
                      handleAnswerChange([...current, option]);
                    } else {
                      handleAnswerChange(current.filter(item => item !== option));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={`multi-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">1 (Poor)</span>
              <span className="text-sm text-muted-foreground">5 (Excellent)</span>
            </div>
            <RadioGroup
              value={String(currentAnswer)}
              onValueChange={(value) => handleAnswerChange(Number(value))}
              className="flex justify-between"
            >
              {[1, 2, 3, 4, 5].map((rating) => (
                <div key={rating} className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value={String(rating)} id={`rating-${rating}`} />
                  <Label htmlFor={`rating-${rating}`} className="cursor-pointer">
                    {rating}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'text':
        return (
          <Textarea
            value={String(currentAnswer)}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[100px]"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(currentQuestion.category)}
            <span className="text-sm font-medium capitalize">
              {currentQuestion.category.replace('_', ' ')}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1} of {enhancedQuestions.length}
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
          {currentQuestion.context && (
            <p className="text-sm text-muted-foreground">
              {currentQuestion.context}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {renderQuestionInput()}
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex-1"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1"
              disabled={!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)}
            >
              {currentQuestionIndex === enhancedQuestions.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <Clock className="h-4 w-4 inline mr-1" />
        Estimated time remaining: {Math.max(0, enhancedQuestions.length - currentQuestionIndex - 1)} minutes
      </div>
    </div>
  );
};