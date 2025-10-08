
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import AICareerQuiz from "@/components/AICareerQuiz";
import GeminiCareerReport from "@/components/GeminiCareerReport";
import ExploreResources from "@/components/ExploreResources";
import CareerGuidanceChatbot from "@/components/CareerGuidanceChatbot";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
    toast({
      title: "Analysis Complete!",
      description: "Your personalized career recommendations are ready."
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

  const handleViewLastResults = () => {
    if (lastSessionId) {
      setCompletedSessionId(lastSessionId);
      setQuizCompleted(true);
      setQuizStarted(false);
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
            <AICareerQuiz onComplete={(sessionId) => handleQuizComplete(sessionId)} />
          </div>
        ) : (
          <>
            {/* Three-column Career Discovery Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8 items-stretch">
              {/* Begin Your Career Discovery Card */}
              <Card className="bg-white shadow-md flex flex-col">
                <CardHeader>
                  <CardTitle className="text-blue-900">Begin Your Career Discovery</CardTitle>
                  <CardDescription>Take our comprehensive AI-powered assessment to get personalized recommendations</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center py-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold mr-3 flex-shrink-0">
                        1
                      </div>
                   <div>
                     <h4 className="font-medium text-blue-900">Take the Smart Tree Assessment</h4>
                     <p className="text-sm text-blue-700">Short questions that adapt to your interests</p>
                   </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold mr-3 flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900">Get AI Analysis</h4>
                        <p className="text-sm text-blue-700">Advanced algorithms analyze your strengths</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold mr-3 flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900">Explore Career Paths</h4>
                        <p className="text-sm text-blue-700">Get detailed roadmaps and learning resources</p>
                      </div>
                    </div>
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
              <Card className="bg-white shadow-md flex flex-col">
                <CardHeader>
                  <CardTitle className="text-blue-900">Have Plans or Doubts? Ask AI to Clarify</CardTitle>
                  <CardDescription>Get instant career guidance with AI-powered chat advisor</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-medium text-blue-900 mb-2">AI Career Advisor</h4>
                    <p className="text-blue-700">
                      Chat with our AI to get personalized guidance on colleges, careers, exams, and more
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog open={showChatbot} onOpenChange={setShowChatbot}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                        Chat with AI Advisor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] h-[800px] p-0">
                      <CareerGuidanceChatbot onClose={() => setShowChatbot(false)} />
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>

              {/* Your Career Recommendations Card */}
              <Card className="bg-white shadow-md flex flex-col">
                <CardHeader>
                  <CardTitle className="text-blue-900">Your Career Recommendations</CardTitle>
                  <CardDescription>
                    {hasExistingResults ? "View your personalized career analysis" : "Based on your profile and responses"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {hasExistingResults ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="text-lg font-medium text-blue-900 mb-2">Analysis Complete</h4>
                      <p className="text-blue-700">
                        Your personalized career recommendations are ready to view
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-blue-400" />
                      </div>
                      <h4 className="text-lg font-medium text-blue-900 mb-2">No Recommendations Yet</h4>
                      <p className="text-blue-700">
                        Take the career quiz to get AI-powered personalized recommendations
                      </p>
                    </div>
                  )}
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
    </div>
  );
};

export default Dashboard;
