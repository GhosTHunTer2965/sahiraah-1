import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Video, User, CheckCircle, XCircle, AlertCircle, Link2, MessageSquare, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Session {
  id: string;
  session_date: string;
  session_status: string;
  payment_status: string;
  duration_minutes: number;
  meeting_link: string | null;
  notes: string | null;
  amount_paid: number | null;
  user_id: string;
  student_name?: string;
}

interface ExpertSessionsPortalProps {
  expertId: string;
}

const ExpertSessionsPortal = ({ expertId }: ExpertSessionsPortalProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  useEffect(() => {
    loadSessions();

    const channel = supabase
      .channel('expert-sessions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expert_sessions',
          filter: `expert_id=eq.${expertId}`,
        },
        () => {
          loadSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [expertId]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_sessions')
        .select('*')
        .eq('expert_id', expertId)
        .order('session_date', { ascending: false });

      if (error) throw error;

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

  const saveMeetingLink = async (sessionId: string) => {
    if (!meetingLinkInput.trim()) {
      toast.error('Please enter a meeting link');
      return;
    }
    try {
      const { error } = await supabase
        .from('expert_sessions')
        .update({ meeting_link: meetingLinkInput.trim() })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Meeting link saved — student can now join');
      setEditingLinkId(null);
      setMeetingLinkInput('');
      loadSessions();
    } catch (error) {
      console.error('Error saving meeting link:', error);
      toast.error('Failed to save meeting link');
    }
  };

  const saveNotes = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('expert_sessions')
        .update({ notes: notesInput.trim() || null })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Notes saved');
      setEditingNotesId(null);
      setNotesInput('');
      loadSessions();
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const cancelSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to cancel this session?')) return;
    try {
      const { error } = await supabase
        .from('expert_sessions')
        .update({ session_status: 'cancelled' })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Session cancelled');
      loadSessions();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Failed to cancel session');
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
    if (filter === 'cancelled') {
      return session.session_status === 'cancelled';
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

  const sessionCounts = {
    all: sessions.length,
    upcoming: sessions.filter(s => new Date(s.session_date) >= new Date() && s.session_status === 'scheduled').length,
    completed: sessions.filter(s => s.session_status === 'completed').length,
    cancelled: sessions.filter(s => s.session_status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === f
                ? 'bg-violet-600 text-white'
                : 'bg-[#1e1e2e] text-gray-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filter === f ? 'bg-white/20' : 'bg-[#2e2e3e]'
            }`}>
              {sessionCounts[f]}
            </span>
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
                          {session.payment_status && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.payment_status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                              session.payment_status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>
                              ₹{session.amount_paid || 0} • {session.payment_status}
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
                    <div className="flex items-center gap-2 flex-wrap">
                      {session.session_status === 'scheduled' && (
                        <>
                          {session.meeting_link && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                              onClick={() => window.open(session.meeting_link!, '_blank')}
                            >
                              <Video className="h-4 w-4 mr-1" />
                              Join
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                            onClick={() => {
                              setEditingLinkId(session.id);
                              setMeetingLinkInput(session.meeting_link || '');
                            }}
                          >
                            <Link2 className="h-4 w-4 mr-1" />
                            {session.meeting_link ? 'Edit' : 'Add'} Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
                            onClick={() => updateSessionStatus(session.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {isPast ? 'Mark Complete' : 'Complete'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            onClick={() => cancelSession(session.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {/* Notes button for all sessions */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#2e2e3e] text-gray-400 hover:bg-[#1e1e2e]"
                        onClick={() => {
                          setEditingNotesId(editingNotesId === session.id ? null : session.id);
                          setNotesInput(session.notes || '');
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Notes
                      </Button>
                    </div>
                  </div>

                  {/* Meeting Link Editor */}
                  {editingLinkId === session.id && (
                    <div className="mt-4 p-4 rounded-lg bg-[#1e1e2e] flex flex-col sm:flex-row gap-3">
                      <Input
                        placeholder="Paste meeting link (Google Meet, Zoom, etc.)"
                        value={meetingLinkInput}
                        onChange={(e) => setMeetingLinkInput(e.target.value)}
                        className="bg-[#12121a] border-[#2e2e3e] text-white flex-1"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveMeetingLink(session.id)} className="bg-violet-600 hover:bg-violet-700">
                          <Save className="h-4 w-4 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="outline" className="border-[#2e2e3e] text-gray-400"
                          onClick={() => { setEditingLinkId(null); setMeetingLinkInput(''); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Notes Editor */}
                  {editingNotesId === session.id && (
                    <div className="mt-4 p-4 rounded-lg bg-[#1e1e2e] space-y-3">
                      <Textarea
                        placeholder="Add session notes, key topics discussed, action items..."
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        className="bg-[#12121a] border-[#2e2e3e] text-white min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveNotes(session.id)} className="bg-violet-600 hover:bg-violet-700">
                          <Save className="h-4 w-4 mr-1" /> Save Notes
                        </Button>
                        <Button size="sm" variant="outline" className="border-[#2e2e3e] text-gray-400"
                          onClick={() => { setEditingNotesId(null); setNotesInput(''); }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Existing meeting link display */}
                  {session.meeting_link && editingLinkId !== session.id && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-violet-400">
                      <Link2 className="h-4 w-4" />
                      <span className="truncate">{session.meeting_link}</span>
                    </div>
                  )}

                  {/* Notes display */}
                  {session.notes && editingNotesId !== session.id && (
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
              : filter === 'cancelled'
              ? 'No cancelled sessions'
              : 'No sessions recorded yet. When students book sessions with you, they will appear here.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpertSessionsPortal;
