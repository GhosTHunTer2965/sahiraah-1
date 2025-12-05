import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock, User, Video, IndianRupee } from 'lucide-react';

interface Session {
  id: string;
  session_date: string;
  duration_minutes: number;
  session_status: string;
  payment_status: string;
  amount_paid: number;
  notes: string | null;
  meeting_link: string | null;
  user_id: string;
}

interface ExpertSessionsProps {
  expertId: string;
}

const ExpertSessions = ({ expertId }: ExpertSessionsProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, [expertId]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_sessions')
        .select('*')
        .eq('expert_id', expertId)
        .order('session_date', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingSessions = sessions.filter(
    s => new Date(s.session_date) >= new Date() && s.session_status === 'scheduled'
  );

  const pastSessions = sessions.filter(
    s => new Date(s.session_date) < new Date() || s.session_status !== 'scheduled'
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Sessions
          </CardTitle>
          <CardDescription>
            Sessions scheduled with users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No upcoming sessions scheduled
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(session.session_date), 'PPP')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(session.session_date), 'p')}
                        </span>
                        <span>{session.duration_minutes} mins</span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {session.amount_paid}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(session.session_status)}>
                      {session.session_status}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/video-meeting/${session.id}`)}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Meeting
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>
            Completed and past sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pastSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No past sessions
            </p>
          ) : (
            <div className="space-y-3">
              {pastSessions.map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <span className="font-medium">
                        {format(new Date(session.session_date), 'PPP')}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {format(new Date(session.session_date), 'p')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <IndianRupee className="h-3 w-3" />
                      {session.amount_paid}
                    </span>
                    <Badge className={getStatusColor(session.session_status)}>
                      {session.session_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpertSessions;
