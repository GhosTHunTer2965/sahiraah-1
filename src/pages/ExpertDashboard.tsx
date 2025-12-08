import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  IndianRupee,
  Clock,
  TrendingUp
} from 'lucide-react';
import AvailabilityManager from '@/components/expert/AvailabilityManager';
import ExpertSessions from '@/components/expert/ExpertSessions';
import ExpertProfile from '@/components/expert/ExpertProfile';

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
}

const ExpertDashboard = () => {
  const [expert, setExpert] = useState<ExpertData | null>(null);
  const [stats, setStats] = useState<SessionStats>({ upcoming: 0, completed: 0, totalEarnings: 0 });
  const [isLoading, setIsLoading] = useState(true);
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
      const { data: expertData, error: expertError } = await supabase
        .from('experts')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (expertError || !expertData) {
        console.error('Error loading expert:', expertError);
        toast.error('Could not load expert profile');
        return;
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

        setStats({ upcoming, completed, totalEarnings });
      }
    } catch (error) {
      console.error('Error loading expert data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">Expert Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {expert?.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
                  <p className="text-3xl font-bold">{stats.upcoming}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Sessions</p>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-3xl font-bold flex items-center">
                    <IndianRupee className="h-6 w-6" />
                    {stats.totalEarnings.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="availability" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Availability
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="availability">
            {expert && <AvailabilityManager expertId={expert.id} />}
          </TabsContent>

          <TabsContent value="sessions">
            {expert && <ExpertSessions expertId={expert.id} />}
          </TabsContent>

          <TabsContent value="profile">
            {expert && <ExpertProfile expertId={expert.id} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ExpertDashboard;
