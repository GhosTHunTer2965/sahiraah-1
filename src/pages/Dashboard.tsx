
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import EnhancedCareerDiscoveryQuiz from "@/components/EnhancedCareerDiscoveryQuiz";
import GeminiCareerReport from "@/components/GeminiCareerReport";
import ExploreResources from "@/components/ExploreResources";
import CareerGuidanceChatbot from "@/components/CareerGuidanceChatbot";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, MessageSquare, CheckCircle2 } from "lucide-react";
import { useSarvamI18n } from "@/hooks/useSarvamI18n";

interface User {
  id: string;
  name: string;
  email: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
  const [hasExistingResults, setHasExistingResults] = useState(false);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error.message);
          navigate("/login");
          return;
        }
        
        if (!data.session) {
          navigate("/login");
          return;
        }
        
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        setUser({
          id: data.session.user.id,
          name: profileData?.name || data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
          email: profileData?.email || data.session.user.email || ''
        });

        if (!profileData) {
          await supabase.from('user_profiles').insert({
            id: data.session.user.id,
            name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
            email: data.session.user.email || ''
          });
        }

        const { data: existingSessions } = await supabase
          .from('user_quiz_sessions')
          .select('id, is_completed, session_completed_at')
          .eq('user_id', data.session.user.id)
          .eq('is_completed', true)
          .order('session_completed_at', { ascending: false })
          .limit(1);

        if (existingSessions && existingSessions.length > 0) {
          setHasExistingResults(true);
          setLastSessionId(existingSessions[0].id);
        }

      } catch (error) {
        console.error("Error in session handling:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (event === 'SIGNED_IN' && currentSession) {
          setUser({
            id: currentSession.user.id,
            name: currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0] || 'User',
            email: currentSession.user.email || ''
          });
        } else if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (location.pathname === '/dashboard' && !location.hash && !location.search) {
      if (location.state?.reset || quizCompleted || quizStarted) {
        setQuizStarted(false);
        setQuizCompleted(false);
        setCompletedSessionId(null);
        if (location.state?.reset) {
          navigate('/dashboard', { replace: true, state: {} });
        }
      }
    }
  }, [location.pathname, location.hash, location.search, location.state]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setQuizCompleted(false);
    setCompletedSessionId(null);
    toast({
      title: t('dashboard.quizStarted'),
      description: t('dashboard.quizStartedDesc')
    });
  };

  const handleQuizComplete = (sessionId: string) => {
    setCompletedSessionId(sessionId);
    setQuizCompleted(true);
    setQuizStarted(false);
    setHasExistingResults(true);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast({
      title: t('dashboard.analysisCompleteTitle'),
      description: t('dashboard.analysisCompleteDesc')
    });
  };

  const handleRetakeQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCompletedSessionId(null);
  };

  const handleBackToDashboard = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCompletedSessionId(null);
  };

  const handleQuizEarlyExit = (answeredCount: number) => {
    const minRequiredAnswers = 5;
    if (answeredCount < minRequiredAnswers) {
      toast({
        title: t('dashboard.incompleteQuiz'),
        description: t('dashboard.incompleteQuizDesc'),
        variant: "destructive"
      });
    }
    setQuizStarted(false);
    setQuizCompleted(false);
    setCompletedSessionId(null);
  };

  const handleViewLastResults = () => {
    if (lastSessionId) {
      setCompletedSessionId(lastSessionId);
      setQuizCompleted(true);
      setQuizStarted(false);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-blue-900 text-xl">{t('dashboard.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f6ff] py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            {t('dashboard.welcome', { name: user?.name || "Student" })}
          </h1>
          <p className="text-blue-700 text-lg">{t('dashboard.subtitle')}</p>
        </div>

        {/* Quiz Section */}
        {quizCompleted && completedSessionId ? (
          <>
            <GeminiCareerReport 
              sessionId={completedSessionId} 
              onRetake={handleBackToDashboard} 
            />
          </>
        ) : quizStarted ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">{t('dashboard.aiAssessment')}</h2>
            <EnhancedCareerDiscoveryQuiz 
              onComplete={(sessionId) => handleQuizComplete(sessionId)} 
              onEarlyExit={handleQuizEarlyExit}
            />
          </div>
        ) : (
          <>
            {/* Three-column Career Discovery Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white shadow-md flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-blue-900">{t('dashboard.beginDiscovery')}</CardTitle>
                  <CardDescription>{t('dashboard.beginDiscoveryDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                      <ClipboardList className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-medium text-blue-900 mb-2">{t('dashboard.smartAssessment')}</h4>
                    <p className="text-blue-700">{t('dashboard.smartAssessmentDesc')}</p>
                  </div>
                  <div className="space-y-2 text-left flex-1">
                    <p className="text-sm text-blue-700">✓ {t('dashboard.adaptiveQuestions')}</p>
                    <p className="text-sm text-blue-700">✓ {t('dashboard.advancedAI')}</p>
                    <p className="text-sm text-blue-700">✓ {t('dashboard.detailedRoadmaps')}</p>
                  </div>
                </CardContent>
                <CardFooter>
                   <Button 
                     className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold w-full"
                     onClick={handleStartQuiz}
                   >
                     {t('dashboard.takeQuiz')}
                   </Button>
                </CardFooter>
              </Card>

              <Card className="bg-white shadow-md flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-blue-900">{t('dashboard.askAI')}</CardTitle>
                  <CardDescription>{t('dashboard.askAIDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                      <MessageSquare className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-medium text-blue-900 mb-2">{t('dashboard.aiAdvisor')}</h4>
                    <p className="text-blue-700">{t('dashboard.aiAdvisorDesc')}</p>
                  </div>
                  <div className="space-y-2 text-left flex-1">
                    <p className="text-sm text-blue-700">✓ {t('dashboard.askCareerPaths')}</p>
                    <p className="text-sm text-blue-700">✓ {t('dashboard.getCollegeRecs')}</p>
                    <p className="text-sm text-blue-700">✓ {t('dashboard.clarifyDoubts')}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                    onClick={() => setShowChatbot(true)}
                  >
                    {t('dashboard.chatWithAI')}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-white shadow-md flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-blue-900">{t('dashboard.yourRecommendations')}</CardTitle>
                  <CardDescription>
                    {hasExistingResults ? t('dashboard.viewAnalysis') : t('dashboard.basedOnProfile')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 rounded-full ${hasExistingResults ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center mx-auto`}>
                      <CheckCircle2 className={`w-8 h-8 ${hasExistingResults ? 'text-green-600' : 'text-blue-400'}`} />
                    </div>
                  </div>
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-medium text-blue-900 mb-2">
                      {hasExistingResults ? t('dashboard.analysisComplete') : t('dashboard.noRecsYet')}
                    </h4>
                    <p className="text-blue-700">
                      {hasExistingResults 
                        ? t('dashboard.recsReady')
                        : t('dashboard.takeQuizForRecs')}
                    </p>
                  </div>
                  <div className="space-y-2 text-left flex-1">
                    {hasExistingResults ? (
                      <>
                        <p className="text-sm text-blue-700">✓ {t('dashboard.detailedRecs')}</p>
                        <p className="text-sm text-blue-700">✓ {t('dashboard.personalizedRoadmap')}</p>
                        <p className="text-sm text-blue-700">✓ {t('dashboard.skillsAssessment')}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-blue-700">✓ {t('dashboard.discoverCareers')}</p>
                        <p className="text-sm text-blue-700">✓ {t('dashboard.customizedPaths')}</p>
                        <p className="text-sm text-blue-700">✓ {t('dashboard.identifyStrengths')}</p>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  {hasExistingResults ? (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                      onClick={handleViewLastResults}
                    >
                      {t('dashboard.viewResults')}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white w-full"
                      onClick={handleStartQuiz}
                    >
                      {t('dashboard.startJourney')}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </>
        )}

        <ExploreResources />
      </div>

      {showChatbot && (
        <CareerGuidanceChatbot onClose={() => setShowChatbot(false)} />
      )}
    </div>
  );
};

export default Dashboard;
