import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Video, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Session {
  id: string;
  session_date: string;
  session_status: string;
  payment_status: string;
  duration_minutes: number;
  meeting_link: string;
  notes: string;
  user_id: string;
  student_name?: string;
}

interface ExpertSessionsPortalProps {
  expertId: string;
}

const ExpertSessionsPortal = ({ expertId }: ExpertSessionsPortalProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    loadSessions();
  }, [expertId]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_sessions')
        .select('*')
        .eq('expert_id', expertId)
        .order('session_date', { ascending: false });

      if (error) throw error;

      // Fetch student names
      const userIds = [...new Set(data?.map(s => s.user_id) || [])];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.name]) || []);

      const enrichedData = data?.map(s => ({
        ...s,
        student_name: profileMap.get(s.user_id) || 'Student',
      })) || [];

      setSessions(enrichedData);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('expert_sessions')
        .update({ session_status: status })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success(`Session marked as ${status}`);
      loadSessions();
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update session');
    }
  };

  const filteredSessions = sessions.filter(session => {
    const now = new Date();
    const sessionDate = new Date(session.session_date);
    
    if (filter === 'upcoming') {
      return sessionDate >= now && session.session_status === 'scheduled';
    }
    if (filter === 'completed') {
      return session.session_status === 'completed';
    }
    return true;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'completed':
        return { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' };
      default:
        return { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-500/20' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'upcoming', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-violet-600 text-white'
                : 'bg-[#1e1e2e] text-gray-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const statusConfig = getStatusConfig(session.session_status);
            const sessionDate = new Date(session.session_date);
            const isPast = sessionDate < new Date();
            const isToday = sessionDate.toDateString() === new Date().toDateString();

            return (
              <div
                key={session.id}
                className="rounded-xl bg-[#12121a] border border-[#1e1e2e] overflow-hidden hover:border-[#2e2e3e] transition-colors"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Session Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                        <Calendar className="h-6 w-6 text-violet-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-white">{session.student_name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                            {session.session_status}
                          </span>
                          {isToday && session.session_status === 'scheduled' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {sessionDate.toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {sessionDate.toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {session.duration_minutes || 60} min
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {session.session_status === 'scheduled' && !isPast && (
                        <>
                          {session.meeting_link && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                              onClick={() => window.open(session.meeting_link, '_blank')}
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Join Meeting
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
                            onClick={() => updateSessionStatus(session.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                        </>
                      )}
                      {session.session_status === 'scheduled' && isPast && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
                          onClick={() => updateSessionStatus(session.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {session.notes && (
                    <div className="mt-4 p-4 rounded-lg bg-[#1e1e2e] text-sm text-gray-400">
                      <p className="font-medium text-gray-300 mb-1">Notes:</p>
                      {session.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-white mb-2">No Sessions Found</h3>
          <p className="text-gray-500">
            {filter === 'upcoming' 
              ? 'You have no upcoming sessions scheduled'
              : filter === 'completed'
              ? 'You have not completed any sessions yet'
              : 'No sessions recorded yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpertSessionsPortal;
