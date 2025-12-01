import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, ArrowLeft, PhoneOff, Maximize2, Minimize2 } from 'lucide-react';
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

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const VideoMeeting = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  useEffect(() => {
    if (sessionId) {
      loadSessionDetails();
    }
  }, [sessionId]);

  // Load Jitsi script
  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => setJitsiLoaded(true);
      document.body.appendChild(script);
    } else {
      setJitsiLoaded(true);
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, []);

  const loadSessionDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please login to view your session');
        navigate('/login');
        return;
      }

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
        .eq('user_id', user.id)
        .single();

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

  const startMeeting = async () => {
    if (!jitsiLoaded || !jitsiContainerRef.current || !session) {
      toast.error('Meeting system is loading, please wait...');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
      
      // Create a unique room name using session ID
      const roomName = `career-guidance-${session.id.slice(0, 8)}`;

      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: userName,
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: true,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 
            'fullscreen', 'fodeviceselection', 'hangup', 'chat', 
            'raisehand', 'videoquality', 'filmstrip', 'tileview',
            'settings', 'shortcuts'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_BACKGROUND: '#1a1a2e',
          MOBILE_APP_PROMO: false,
        },
      };

      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      jitsiApiRef.current.addListener('videoConferenceLeft', () => {
        setMeetingStarted(false);
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
          jitsiApiRef.current = null;
        }
      });

      setMeetingStarted(true);
      toast.success('Meeting started! Share this page link with your expert.');
    } catch (error) {
      console.error('Error starting meeting:', error);
      toast.error('Failed to start meeting');
    }
  };

  const endMeeting = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sessionDate = new Date(session.session_date);

  // Fullscreen meeting view
  if (meetingStarted && isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Minimize2 className="h-4 w-4 mr-2" />
            Exit Fullscreen
          </Button>
          <Button variant="destructive" size="sm" onClick={endMeeting}>
            <PhoneOff className="h-4 w-4 mr-2" />
            End Meeting
          </Button>
        </div>
        <div ref={jitsiContainerRef} className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
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
                      onClick={toggleFullscreen}
                    >
                      <Maximize2 className="mr-2 h-4 w-4" />
                      Fullscreen
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
                    ? 'Meeting in progress - share the room link with your expert'
                    : 'Start your video meeting session'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!meetingStarted ? (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-6">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <Video className="h-12 w-12 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-semibold">Ready to Start Your Session?</p>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Click the button below to start a video meeting. Your expert can join using the same session link.
                      </p>
                    </div>
                    <Button 
                      size="lg" 
                      onClick={startMeeting}
                      disabled={!jitsiLoaded}
                      className="gap-2"
                    >
                      <Video className="h-5 w-5" />
                      {jitsiLoaded ? 'Start Meeting' : 'Loading...'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Powered by Jitsi Meet - Free & Secure Video Conferencing
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div 
                      ref={jitsiContainerRef} 
                      className="w-full h-[500px] rounded-lg overflow-hidden bg-muted"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Share this page URL with your expert so they can join the same meeting room
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoMeeting;
