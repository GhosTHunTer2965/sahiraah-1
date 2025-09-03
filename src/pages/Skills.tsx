import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BrainIcon, 
  CodeIcon, 
  UsersIcon, 
  GlobeIcon,
  ClockIcon,
  TrophyIcon,
  BarChart3Icon,
  PlayIcon,
  HistoryIcon,
  StarIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";

interface SkillQuiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  duration_minutes: number;
  total_questions: number;
}

interface SkillAttempt {
  id: string;
  quiz_id: string;
  started_at: string;
  completed_at: string | null;
  percentage_score: number | null;
  is_completed: boolean;
  skill_quizzes: SkillQuiz;
}

const Skills = () => {
  const [skillQuizzes, setSkillQuizzes] = useState<SkillQuiz[]>([]);
  const [userAttempts, setUserAttempts] = useState<SkillAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchSkillQuizzes();
    fetchUserAttempts();
  }, []);

  const fetchSkillQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_quizzes')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setSkillQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching skill quizzes:', error);
      toast({
        title: "Error",
        description: "Failed to load skill assessments",
        variant: "destructive",
      });
    }
  };

  const fetchUserAttempts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('skill_quiz_attempts')
        .select(`
          *,
          skill_quizzes(*)
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      setUserAttempts(data || []);
    } catch (error) {
      console.error('Error fetching user attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quizId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to take skill assessments",
          variant: "destructive",
        });
        return;
      }

      // Create new attempt
      const { data, error } = await supabase
        .from('skill_quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quizId
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to quiz interface (would be implemented as a separate component)
      toast({
        title: "Quiz Started",
        description: "Good luck with your assessment!",
      });
      
      // Here you would navigate to the actual quiz component
      // For now, we'll just refresh the attempts
      fetchUserAttempts();
      
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to start the quiz",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical':
        return <CodeIcon className="h-5 w-5" />;
      case 'soft_skills':
        return <UsersIcon className="h-5 w-5" />;
      case 'language':
        return <GlobeIcon className="h-5 w-5" />;
      default:
        return <BrainIcon className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['all', ...new Set(skillQuizzes.map(q => q.category))];
  const filteredQuizzes = selectedCategory === 'all' 
    ? skillQuizzes 
    : skillQuizzes.filter(q => q.category === selectedCategory);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Assessments</h1>
          <p className="text-gray-600">
            Test your professional skills and see how you compare with your peers
          </p>
        </div>

        <Tabs defaultValue="assessments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assessments">Available Assessments</TabsTrigger>
            <TabsTrigger value="history">My Results</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === 'all' ? 'All Categories' : category.replace('_', ' ')}
                </Button>
              ))}
            </div>

            {/* Skill Quizzes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map(quiz => (
                <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(quiz.category)}
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      </div>
                      <Badge className={getDifficultyColor(quiz.difficulty_level)}>
                        {quiz.difficulty_level}
                      </Badge>
                    </div>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {quiz.duration_minutes} mins
                      </div>
                      <div className="flex items-center gap-1">
                        <BrainIcon className="h-4 w-4" />
                        {quiz.total_questions} questions
                      </div>
                    </div>
                    <Button 
                      onClick={() => startQuiz(quiz.id)}
                      className="w-full"
                    >
                      <PlayIcon className="mr-2 h-4 w-4" />
                      Start Assessment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredQuizzes.length === 0 && (
              <div className="text-center py-12">
                <BrainIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No assessments found
                </h3>
                <p className="text-gray-600">
                  {selectedCategory === 'all' 
                    ? 'No skill assessments are currently available.' 
                    : `No assessments found for ${selectedCategory.replace('_', ' ')} category.`
                  }
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {userAttempts.length > 0 ? (
              <div className="space-y-4">
                {userAttempts.map(attempt => (
                  <Card key={attempt.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(attempt.skill_quizzes.category)}
                          <div>
                            <h3 className="font-semibold">{attempt.skill_quizzes.title}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(attempt.started_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {attempt.is_completed ? (
                            <div className="space-y-1">
                              <div className="text-2xl font-bold text-green-600">
                                {attempt.percentage_score}%
                              </div>
                              <Badge variant="secondary">
                                <TrophyIcon className="mr-1 h-3 w-3" />
                                Completed
                              </Badge>
                            </div>
                          ) : (
                            <Badge variant="outline">
                              <ClockIcon className="mr-1 h-3 w-3" />
                              In Progress
                            </Badge>
                          )}
                        </div>
                      </div>
                      {attempt.is_completed && attempt.percentage_score && (
                        <div className="mt-4">
                          <Progress value={attempt.percentage_score} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No assessment history
                </h3>
                <p className="text-gray-600 mb-4">
                  Take your first skill assessment to see your results here.
                </p>
                <Button onClick={() => {
                  const firstTab = document.querySelector('[data-state="inactive"]') as HTMLElement;
                  firstTab?.click();
                }}>
                  Browse Assessments
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Skills;