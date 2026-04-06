import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CareerGuides from "./pages/CareerGuides";
import Courses from "./pages/Courses";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import NSQFExplorer from "./pages/NSQFExplorer";
import CollegeExplorerPage from "./pages/CollegeExplorerPage";
import EducationalPathwaysPage from "./pages/EducationalPathwaysPage";
import EntranceExamGuidePage from "./pages/EntranceExamGuidePage";
import ReportView from "./pages/ReportView";
import BookExpertSession from "./pages/BookExpertSession";
import VideoMeeting from "./pages/VideoMeeting";
import SessionFeedback from "./pages/SessionFeedback";
import ExpertLogin from "./pages/ExpertLogin";
import ExpertDashboard from "./pages/ExpertDashboard";
import ResetPassword from "./pages/ResetPassword";
import ExpertProtectedRoute from "./components/ExpertProtectedRoute";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

// Auth protected route component
const ProtectedRoute = ({ 
  children, 
  requireUser = true 
}: { 
  children: React.ReactNode,
  requireUser?: boolean
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isExpert, setIsExpert] = useState<boolean>(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check Supabase session only - secure authentication
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // Check if user has expert role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.session.user.id)
            .eq('role', 'expert')
            .maybeSingle();

          setIsExpert(!!roleData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setIsExpert(false);
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    // Still checking auth status
    return <div className="min-h-screen flex items-center justify-center bg-blue-50">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If the route strictly requires a normal user, but the user is an expert, redirect them to expert-dashboard
  if (requireUser && isExpert) {
    return <Navigate to="/expert-dashboard" replace />;
  }
  
  // Authenticated and passed role checks, render children
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/"
              element={
                <Layout>
                  <Index />
                </Layout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <Layout>
                  <About />
                </Layout>
              }
            />
            <Route
              path="/contact"
              element={
                <Layout>
                  <Contact />
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Courses />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <ReportView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-expert"
              element={
                <ProtectedRoute>
                  <BookExpertSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video-meeting/:sessionId"
              element={
                <ProtectedRoute requireUser={false}>
                  <VideoMeeting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/session-feedback/:sessionId"
              element={
                <ProtectedRoute>
                  <SessionFeedback />
                </ProtectedRoute>
              }
            />
            {/* Expert Routes */}
            <Route path="/expert-login" element={<ExpertLogin />} />
            <Route
              path="/expert-dashboard"
              element={
                <ExpertProtectedRoute>
                  <ExpertDashboard />
                </ExpertProtectedRoute>
              }
            />
            <Route
              path="/terms"
              element={
                <Layout>
                  <Terms />
                </Layout>
              }
            />
            <Route
              path="/privacy"
              element={
                <Layout>
                  <Privacy />
                </Layout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
