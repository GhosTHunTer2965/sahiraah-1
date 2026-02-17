import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ExpertLayout from '@/components/expert-portal/ExpertLayout';
import ExpertOverview from '@/components/expert-portal/ExpertOverview';
import ExpertSessionsPortal from '@/components/expert-portal/ExpertSessionsPortal';
import ExpertEarnings from '@/components/expert-portal/ExpertEarnings';
import StudentInsights from '@/components/expert-portal/StudentInsights';
import AvailabilityManagerPortal from '@/components/expert-portal/AvailabilityManagerPortal';
import ExpertProfilePortal from '@/components/expert-portal/ExpertProfilePortal';

interface ExpertData {
  id: string;
  name: string;
  title: string;
  hourly_rate: number;
}

interface SessionStats {
  upcoming: number;
  completed: number;
  totalEarnings: number;
  pendingEarnings: number;
}

const ExpertDashboard = () => {
  const [expert, setExpert] = useState<ExpertData | null>(null);
  const [stats, setStats] = useState<SessionStats>({ upcoming: 0, completed: 0, totalEarnings: 0, pendingEarnings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    loadExpertData();
  }, []);

  const loadExpertData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // Get expert record linked to this user
      let { data: expertData, error: expertError } = await supabase
        .from('experts')
        .select('id, name, title, bio, expertise, hourly_rate, image_url, user_id, is_available, email')
        .eq('user_id', session.user.id)
        .single();

      // If no expert record exists, auto-create one from the user's auth info
      if (expertError || !expertData) {
        const userEmail = session.user.email || '';
        const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split('@')[0] || 'Expert';
        
        // Insert without email and without RETURNING to avoid RLS recursion
        const { error: createError } = await supabase
          .from('experts')
          .insert({
            user_id: session.user.id,
            name: userName,
            title: 'Career Counselor',
            hourly_rate: 500,
            is_available: true,
          });

        if (createError) {
          console.error('Error creating expert profile:', createError);
          toast.error('Could not create expert profile. Please try logging in again.');
          setIsLoading(false);
          return;
        }

        // Fetch the newly created record separately
        const { data: createdExpert } = await supabase
          .from('experts')
          .select('id, name, title, bio, expertise, hourly_rate, image_url, user_id, is_available, email')
          .eq('user_id', session.user.id)
          .single();
        
        expertData = createdExpert;

        // Ensure user has expert role
        await supabase
          .from('user_roles')
          .upsert({ user_id: session.user.id, role: 'expert' as const }, { onConflict: 'user_id,role' })
          .select();
      }

      setExpert(expertData);

      // Load session statistics
      const { data: sessions } = await supabase
        .from('expert_sessions')
        .select('*')
        .eq('expert_id', expertData.id);

      if (sessions) {
        const now = new Date();
        const upcoming = sessions.filter(
          s => new Date(s.session_date) >= now && s.session_status === 'scheduled'
        ).length;
        const completed = sessions.filter(s => s.session_status === 'completed').length;
        const totalEarnings = sessions
          .filter(s => s.payment_status === 'completed')
          .reduce((sum, s) => sum + (s.amount_paid || 0), 0);
        const pendingEarnings = sessions
          .filter(s => s.payment_status === 'pending')
          .reduce((sum, s) => sum + (s.amount_paid || 0), 0);

        setStats({ upcoming, completed, totalEarnings, pendingEarnings });
      }
    } catch (error) {
      console.error('Error loading expert data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const expertId = expert?.id || '';

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ExpertOverview stats={stats} expertName={expert?.name || 'Expert'} expertId={expert?.id} />;
      case 'sessions':
        return <ExpertSessionsPortal expertId={expertId} />;
      case 'earnings':
        return <ExpertEarnings expertId={expertId} />;
      case 'students':
        return <StudentInsights expertId={expertId} />;
      case 'availability':
        return <AvailabilityManagerPortal expertId={expertId} />;
      case 'profile':
        return <ExpertProfilePortal expertId={expertId} />;
      default:
        return <ExpertOverview stats={stats} expertName={expert?.name || 'Expert'} expertId={expert?.id} />;
    }
  };

  return (
    <ExpertLayout 
      expertName={expert?.name} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </ExpertLayout>
  );
};

export default ExpertDashboard;
