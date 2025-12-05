import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ExpertProtectedRouteProps {
  children: React.ReactNode;
}

const ExpertProtectedRoute = ({ children }: ExpertProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExpert, setIsExpert] = useState(false);

  useEffect(() => {
    const checkExpertRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }

        // Check if user has expert role
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'expert')
          .maybeSingle();

        if (error) {
          console.error('Error checking expert role:', error);
          setIsLoading(false);
          return;
        }

        setIsExpert(!!roleData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in expert auth check:', error);
        setIsLoading(false);
      }
    };

    checkExpertRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkExpertRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isExpert) {
    return <Navigate to="/expert-login" replace />;
  }

  return <>{children}</>;
};

export default ExpertProtectedRoute;
