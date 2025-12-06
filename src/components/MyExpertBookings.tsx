import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, User, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  session_date: string;
  duration_minutes: number;
  amount_paid: number;
  payment_status: string;
  session_status: string;
  meeting_link: string | null;
  expert: {
    id: string;
    name: string;
    title: string;
  } | null;
}

const MyExpertBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();

    // Set up real-time subscription
    const channel = supabase
      .channel('expert-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expert_sessions'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          loadBookings(); // Refresh bookings on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('expert_sessions')
        .select(`
          id,
          session_date,
          duration_minutes,
          amount_paid,
          payment_status,
          session_status,
          meeting_link,
          experts (
            id,
            name,
            title
          )
        `)
        .eq('user_id', user.id)
        .order('session_date', { ascending: false });

      if (error) throw error;

      const formattedBookings: Booking[] = (data || []).map((booking: any) => ({
        id: booking.id,
        session_date: booking.session_date,
        duration_minutes: booking.duration_minutes,
        amount_paid: booking.amount_paid,
        payment_status: booking.payment_status,
        session_status: booking.session_status,
        meeting_link: booking.meeting_link,
        expert: booking.experts ? {
          id: booking.experts.id,
          name: booking.experts.name,
          title: booking.experts.title,
        } : null,
      }));

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  const upcomingBookings = bookings.filter(b => isUpcoming(b.session_date) && b.session_status !== 'cancelled');
  const pastBookings = bookings.filter(b => !isUpcoming(b.session_date) || b.session_status === 'cancelled');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Loading your bookings...</span>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>You haven't booked any sessions yet.</p>
            <p className="text-sm mt-1">Book a session with an expert to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Sessions */}
      {upcomingBookings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Upcoming Sessions
              <Badge variant="secondary" className="ml-auto">
                {upcomingBookings.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{booking.expert?.name || 'Expert'}</h4>
                      <p className="text-sm text-muted-foreground">{booking.expert?.title}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(booking.session_date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(booking.session_date), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(booking.session_status)}>
                        {booking.session_status}
                      </Badge>
                      <Badge className={getPaymentStatusColor(booking.payment_status)}>
                        {booking.payment_status}
                      </Badge>
                    </div>
                    {booking.meeting_link && booking.session_status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/video-meeting/${booking.id}`)}
                        className="gap-1"
                      >
                        <Video className="h-4 w-4" />
                        Join Meeting
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Past Sessions */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Past Sessions
              <Badge variant="outline" className="ml-auto">
                {pastBookings.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pastBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">{booking.expert?.name || 'Expert'}</h4>
                      <p className="text-sm text-muted-foreground">{booking.expert?.title}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(booking.session_date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(booking.session_date), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(booking.session_status)}>
                      {booking.session_status}
                    </Badge>
                    <Badge variant="outline">
                      ₹{booking.amount_paid}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyExpertBookings;
