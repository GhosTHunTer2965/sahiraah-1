import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Brain, Target, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SkillCategory {
  id: string;
  name: string;
  description: string;
  nsqf_level_min: number;
  nsqf_level_max: number;
}

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'descriptive' | 'practical';
  options?: string[];
  correct_answer?: string;
  points: number;
}

interface AssessmentResponse {
  question_id: string;
  answer: string;
  time_taken?: number;
}

interface Props {
  skillCategoryId?: string;
  assessmentType?: 'technical' | 'soft_skills' | 'cognitive' | 'practical';
  onAssessmentComplete?: (results: any) => void;
}

const SAMPLE_QUESTIONS: { [key: string]: AssessmentQuestion[] } = {
  'technical': [
    {
      id: '1',
      question: 'What is the primary purpose of HTML in web development?',
      type: 'multiple_choice',
      options: ['Styling web pages', 'Creating web page structure', 'Adding interactivity', 'Database management'],
      correct_answer: 'Creating web page structure',
      points: 5
    },
    {
      id: '2',
      question: 'Explain the difference between a router and a switch in computer networking.',
      type: 'descriptive',
      points: 10
    }
  ],
  'soft_skills': [
    {
      id: '3',
      question: 'How would you handle a situation where you disagree with your team leader\'s decision?',
      type: 'multiple_choice',
      options: [
        'Argue publicly in team meetings',
        'Request a private discussion to share your perspective',
        'Ignore the decision and do what you think is right',
        'Complain to other team members'
      ],
      correct_answer: 'Request a private discussion to share your perspective',
      points: 5
    },
    {
      id: '4',
      question: 'Describe a time when you had to learn a new skill quickly. How did you approach it?',
      type: 'descriptive',
      points: 10
    }
  ],
  'cognitive': [
    {
      id: '5',
      question: 'If you have 8 balls and one of them is slightly heavier, how would you find the heavier ball using a balance scale in minimum attempts?',
      type: 'descriptive',
      points: 15
    },
    {
      id: '6',
      question: 'What comes next in the sequence: 2, 6, 12, 20, 30, ?',
      type: 'multiple_choice',
      options: ['40', '42', '44', '46'],
      correct_answer: '42',
      points: 8
    }
  ]
};

export default function SkillAssessmentModule({ 
  skillCategoryId, 
  assessmentType = 'technical',
  onAssessmentComplete 
}: Props) {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(skillCategoryId || '');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const questions = SAMPLE_QUESTIONS[assessmentType] || [];

  useEffect(() => {
    fetchSkillCategories();
  }, []);

  const fetchSkillCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSkillCategories(data || []);
      
      if (data?.length && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching skill categories:', error);
      toast.error('Failed to load skill categories');
    }
  };

  const startAssessment = () => {
    setAssessmentStarted(true);
    setStartTime(new Date());
    setQuestionStartTime(new Date());
  };

  const submitAnswer = () => {
    const timeTaken = questionStartTime ? 
      Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000) : 0;

    const newResponse: AssessmentResponse = {
      question_id: questions[currentQuestion].id,
      answer: currentAnswer,
      time_taken: timeTaken
    };

    setResponses([...responses, newResponse]);
    setCurrentAnswer('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionStartTime(new Date());
    } else {
      completeAssessment([...responses, newResponse]);
    }
  };

  const completeAssessment = async (allResponses: AssessmentResponse[]) => {
    setLoading(true);
    try {
      const totalTimeTaken = startTime ? 
        Math.floor((new Date().getTime() - startTime.getTime()) / (1000 * 60)) : 0;

      const scoreBreakdown = calculateScore(allResponses);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const assessmentData = {
        user_id: user.user.id,
        skill_category_id: selectedCategory,
        assessment_type: assessmentType,
        questions: JSON.stringify(questions),
        responses: JSON.stringify(allResponses),
        score_breakdown: JSON.stringify(scoreBreakdown),
        overall_score: scoreBreakdown.totalScore,
        proficiency_level: getProficiencyLevel(scoreBreakdown.percentage),
        time_taken_minutes: totalTimeTaken,
        is_completed: true,
        completed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('comprehensive_skill_assessments')
        .insert(assessmentData);

      if (error) throw error;

      setAssessmentCompleted(true);
      onAssessmentComplete?.(assessmentData);
      toast.success('Assessment completed successfully!');
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment results');
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (allResponses: AssessmentResponse[]) => {
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((question, index) => {
      totalPoints += question.points;
      const response = allResponses[index];
      
      if (question.type === 'multiple_choice' && response?.answer === question.correct_answer) {
        earnedPoints += question.points;
      } else if (question.type === 'descriptive' && response?.answer.trim().length > 20) {
        // Basic scoring for descriptive answers based on length and content
        earnedPoints += Math.floor(question.points * 0.8); // Assume 80% for substantial answers
      }
    });

    return {
      totalPoints,
      earnedPoints,
      totalScore: earnedPoints,
      percentage: Math.round((earnedPoints / totalPoints) * 100)
    };
  };

  const getProficiencyLevel = (percentage: number): string => {
    if (percentage >= 85) return 'expert';
    if (percentage >= 70) return 'advanced';
    if (percentage >= 50) return 'intermediate';
    return 'beginner';
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (assessmentCompleted) {
    const scoreBreakdown = calculateScore(responses);
    const proficiencyLevel = getProficiencyLevel(scoreBreakdown.percentage);
    
    return (
      <Card>
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Assessment Completed!</CardTitle>
          <CardDescription>
            You've successfully completed the {assessmentType.replace('_', ' ')} assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">
              {scoreBreakdown.percentage}%
            </div>
            <Badge className={getProficiencyLevel(scoreBreakdown.percentage)}>
              {proficiencyLevel.charAt(0).toUpperCase() + proficiencyLevel.slice(1)} Level
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold">{scoreBreakdown.earnedPoints}</p>
              <p className="text-sm text-muted-foreground">Points Earned</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{scoreBreakdown.totalPoints}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Recommendations:</h3>
            <ul className="space-y-2 text-sm">
              {proficiencyLevel === 'beginner' && (
                <>
                  <li>• Focus on fundamental concepts and basic skills</li>
                  <li>• Take introductory courses in this area</li>
                  <li>• Practice regularly with guided exercises</li>
                </>
              )}
              {proficiencyLevel === 'intermediate' && (
                <>
                  <li>• Build on your existing knowledge with advanced topics</li>
                  <li>• Work on real-world projects to gain experience</li>
                  <li>• Consider specialization in specific areas</li>
                </>
              )}
              {proficiencyLevel === 'advanced' && (
                <>
                  <li>• Share your knowledge by mentoring others</li>
                  <li>• Explore cutting-edge developments in this field</li>
                  <li>• Consider leadership roles in projects</li>
                </>
              )}
              {proficiencyLevel === 'expert' && (
                <>
                  <li>• Contribute to the field through research or innovation</li>
                  <li>• Teach and mentor others in this domain</li>
                  <li>• Lead complex projects and initiatives</li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assessmentStarted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Skill Assessment</CardTitle>
              <CardDescription>
                Evaluate your {assessmentType.replace('_', ' ')} skills and get personalized recommendations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <Target className="h-8 w-8 text-blue-500 mb-2" />
              <h3 className="font-semibold">Personalized</h3>
              <p className="text-sm text-muted-foreground">
                Questions adapted to your level and goals
              </p>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-semibold">Quick & Efficient</h3>
              <p className="text-sm text-muted-foreground">
                Complete in 10-15 minutes
              </p>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-purple-500 mb-2" />
              <h3 className="font-semibold">Instant Results</h3>
              <p className="text-sm text-muted-foreground">
                Get immediate feedback and recommendations
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Assessment Details:</h3>
            <ul className="space-y-2 text-sm">
              <li>• {questions.length} questions covering key {assessmentType.replace('_', ' ')} areas</li>
              <li>• Mix of multiple choice and descriptive questions</li>
              <li>• No negative marking - attempt all questions</li>
              <li>• Results saved to your profile for future reference</li>
            </ul>
          </div>

          <Button onClick={startAssessment} className="w-full" size="lg">
            Start Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
            <CardDescription>
              {assessmentType.replace('_', ' ')} Assessment
            </CardDescription>
          </div>
          <Badge variant="outline">
            {currentQ.points} points
          </Badge>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
          
          {currentQ.type === 'multiple_choice' && currentQ.options && (
            <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          {currentQ.type === 'descriptive' && (
            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your detailed answer here..."
              rows={6}
              className="w-full"
            />
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Time spent: {questionStartTime ? 
              Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000) : 0}s
          </div>
          
          <Button 
            onClick={submitAnswer} 
            disabled={!currentAnswer.trim() || loading}
          >
            {currentQuestion === questions.length - 1 ? 'Complete Assessment' : 'Next Question'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}