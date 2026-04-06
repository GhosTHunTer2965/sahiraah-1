import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, ArrowLeft, PhoneOff, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SessionDetails {
  id: string;
  session_date: string;
  duration_minutes: number;
  session_status: string;
  meeting_link: string | null;
  notes: string | null;
  expert: {
    name: string;
    title: string;
    image_url: string | null;
  };
}

const VideoMeeting = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [isExpert, setIsExpert] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSessionDetails();
    }
  }, [sessionId]);

  const loadSessionDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please login to view your session');
        navigate('/login');
        return;
      }

      // Check user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'expert')
        .maybeSingle();
        
      const userIsExpert = !!roleData;
      setIsExpert(userIsExpert);

      const { data, error } = await supabase
        .from('expert_sessions')
        .select(`
          id,
          session_date,
          duration_minutes,
          session_status,
          meeting_link,
          notes,
          experts (
            name,
            title,
            image_url
          )
        `)
        .eq('id', sessionId)
        .maybeSingle(); // Removed .eq('user_id', user.id) because it blocks experts from viewing!

      if (error) throw error;

      if (data) {
        const sessionDetails: SessionDetails = {
          id: data.id,
          session_date: data.session_date,
          duration_minutes: data.duration_minutes,
          session_status: data.session_status,
          meeting_link: data.meeting_link,
          notes: data.notes,
          expert: {
            name: (data.experts as any)?.name || 'Expert',
            title: (data.experts as any)?.title || '',
            image_url: (data.experts as any)?.image_url || null,
          },
        };
        setSession(sessionDetails);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  // Generate a unique room name based on session ID
  const getRoomName = () => {
    if (!session) return '';
    return `CareerGuidance${session.id.replace(/-/g, '').slice(0, 16)}`;
  };

  // Jitsi Meet public instance - allows any room name
  const getMeetingUrl = () => {
    if (session?.meeting_link) {
      return session.meeting_link; // Use the provided unique link if available
    }
    const roomName = getRoomName();
    return `https://meet.jit.si/${roomName}`;
  };

  const startMeeting = () => {
    if (!session) {
      toast.error('Session details not loaded');
      return;
    }
    
    setMeetingStarted(true);
    window.open(getMeetingUrl(), '_blank');
    toast.success('Meeting launched in a new tab!');
  };

  const endMeeting = () => {
    setMeetingStarted(false);
    // Navigate based on role: Experts go to portal, Students go to dashboard
    if (isExpert) {
        navigate('/expert-dashboard');
    } else {
        navigate('/dashboard');
    }
  };

  const openInNewTab = () => {
    window.open(getMeetingUrl(), '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
            <CardDescription>
              We couldn't find the session you're looking for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(isExpert ? '/expert-dashboard' : '/dashboard')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sessionDate = new Date(session.session_date);


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate(isExpert ? '/expert-dashboard' : '/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Session Details */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Session Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {session.expert.image_url ? (
                    <img
                      src={session.expert.image_url}
                      alt={session.expert.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-primary">
                        {session.expert.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{session.expert.name}</p>
                    <p className="text-sm text-muted-foreground">{session.expert.title}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(sessionDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{format(sessionDate, 'h:mm a')} ({session.duration_minutes} mins)</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <Badge
                    variant={
                      session.session_status === 'completed'
                        ? 'secondary'
                        : session.session_status === 'scheduled'
                        ? 'default'
                        : 'outline'
                    }
                  >
                    {session.session_status}
                  </Badge>
                </div>

                {session.notes && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{session.notes}</p>
                  </div>
                )}

                {meetingStarted && (
                  <div className="pt-3 border-t space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={openInNewTab}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Rejoin Meeting
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={endMeeting}
                    >
                      <PhoneOff className="mr-2 h-4 w-4" />
                      End Meeting
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Video Meeting Area */}
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Video Meeting</CardTitle>
                <CardDescription>
                  {meetingStarted 
                    ? 'Meeting is open in another tab'
                    : 'Start your video meeting session'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-6">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold">
                      {meetingStarted ? "Meeting in Progress" : "Ready to Start Your Session?"}
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {meetingStarted 
                        ? "Your meeting has been securely launched in a new tab. Since video platforms block iframe embeddings, we open the room right in your browser natively!"
                        : "Click the button below to start your video meeting. It will open securely in a new tab."}
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={startMeeting}
                    className="gap-2"
                  >
                    <ExternalLink className="h-5 w-5" />
                    {meetingStarted ? "Rejoin Meeting tab" : "Launch Meeting"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Powered by Jitsi Meet - Free & Secure Video Conferencing
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoMeeting;
