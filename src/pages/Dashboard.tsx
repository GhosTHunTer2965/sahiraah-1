
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

interface User {
  id: string;
  name: string;
  email: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
  const [hasExistingResults, setHasExistingResults] = useState(false);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    // Check if user is logged in with Supabase
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
        
        // Fetch user profile
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

        // Insert profile if it doesn't exist
        if (!profileData) {
          await supabase.from('user_profiles').insert({
            id: data.session.user.id,
            name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
            email: data.session.user.email || ''
          });
        }

        // Check for existing quiz results
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

    // Set up auth state change listener
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

  // Reset quiz state when navigating to dashboard root or when reset state is passed
  useEffect(() => {
    if (location.pathname === '/dashboard' && !location.hash && !location.search) {
      // Reset if coming from elsewhere or if reset state is passed
      if (location.state?.reset || quizCompleted || quizStarted) {
        setQuizStarted(false);
        setQuizCompleted(false);
        setCompletedSessionId(null);
        // Clear the state to prevent repeated resets
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
      title: "Quiz Started",
      description: "Career Discovery Quiz Started! Answer the questions to get personalized career recommendations."
    });
  };

  const handleQuizComplete = (sessionId: string) => {
    setCompletedSessionId(sessionId);
    setQuizCompleted(true);
    setQuizStarted(false);
    setHasExistingResults(true);
    
    // Scroll to top to show the results
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast({
      title: "Analysis Complete!",
      description: "Your personalized career recommendations are ready. Scroll up to view them."
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
        title: "Incomplete Quiz",
        description: "Please answer all the questions in the quiz for optimal results",
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
      
      // Scroll to top to show the results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-blue-900 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f6ff] py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Welcome, {user?.name || "Student"}!
          </h1>
          <p className="text-blue-700 text-lg">
            Let's discover the career path that's perfectly aligned with your interests and strengths.
          </p>
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
            <h2 className="text-2xl font-bold text-blue-900 mb-6">AI-Powered Career Assessment</h2>
            <EnhancedCareerDiscoveryQuiz 
              onComplete={(sessionId) => handleQuizComplete(sessionId)} 
              onEarlyExit={handleQuizEarlyExit}
            />
          </div>
        ) : (
          <>
            {/* Three-column Career Discovery Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Begin Your Career Discovery Card */}
              <Card className="bg-white shadow-md flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-blue-900">Begin Your Career Discovery</CardTitle>
                  <CardDescription>Take our comprehensive AI-powered assessment to get personalized recommendations</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                      <ClipboardList className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-medium text-blue-900 mb-2">Smart Career Assessment</h4>
                    <p className="text-blue-700">
                      Take our AI-powered quiz to discover careers that match your unique strengths
                    </p>
                  </div>
                  <div className="space-y-2 text-left flex-1">
                    <p className="text-sm text-blue-700">✓ Adaptive questions based on your interests</p>
                    <p className="text-sm text-blue-700">✓ Advanced AI analysis of your strengths</p>
                    <p className="text-sm text-blue-700">✓ Detailed career roadmaps and resources</p>
                  </div>
                </CardContent>
                <CardFooter>
                   <Button 
                     className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold w-full"
                     onClick={handleStartQuiz}
                   >
                     Take Career Quiz
                   </Button>
                </CardFooter>
              </Card>

              {/* AI Career Guidance Card */}
              <Card className="bg-white shadow-md flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-blue-900">Have Plans or Doubts? Ask AI to Clarify</CardTitle>
                  <CardDescription>Get instant career guidance with AI-powered chat advisor</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                      <MessageSquare className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-medium text-blue-900 mb-2">AI Advisor</h4>
                    <p className="text-blue-700">
                      Chat with our AI to get personalized guidance on colleges, careers, exams, and more
                    </p>
                  </div>
                  <div className="space-y-2 text-left flex-1">
                    <p className="text-sm text-blue-700">✓ Ask about career paths and opportunities</p>
                    <p className="text-sm text-blue-700">✓ Get college and exam recommendations</p>
                    <p className="text-sm text-blue-700">✓ Clarify doubts about your future plans</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                    onClick={() => setShowChatbot(true)}
                  >
                    Chat with AI Advisor
                  </Button>
                </CardFooter>
              </Card>

              {/* Your Career Recommendations Card */}
              <Card className="bg-white shadow-md flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-blue-900">Your Career Recommendations</CardTitle>
                  <CardDescription>
                    {hasExistingResults ? "View your personalized career analysis" : "Based on your profile and responses"}
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
                      {hasExistingResults ? "Analysis Complete" : "No Recommendations Yet"}
                    </h4>
                    <p className="text-blue-700">
                      {hasExistingResults 
                        ? "Your personalized career recommendations are ready to view" 
                        : "Take the career quiz to get AI-powered personalized recommendations"}
                    </p>
                  </div>
                  <div className="space-y-2 text-left flex-1">
                    {hasExistingResults ? (
                      <>
                        <p className="text-sm text-blue-700">✓ Detailed career path recommendations</p>
                        <p className="text-sm text-blue-700">✓ Personalized learning roadmap</p>
                        <p className="text-sm text-blue-700">✓ Skills assessment and growth areas</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-blue-700">✓ Discover careers matching your interests</p>
                        <p className="text-sm text-blue-700">✓ Get customized learning paths</p>
                        <p className="text-sm text-blue-700">✓ Identify your unique strengths</p>
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
                      View My Results
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white w-full"
                      onClick={handleStartQuiz}
                    >
                      Start Discovery Journey
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>

          </>
        )}

        {/* Always show Explore Resources section */}
        <ExploreResources />
        
      </div>

      {/* Fullscreen AI Advisor */}
      {showChatbot && (
        <CareerGuidanceChatbot onClose={() => setShowChatbot(false)} />
      )}
    </div>
  );
};

export default Dashboard;
