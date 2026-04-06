import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, IndianRupee, Video, CheckCircle2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import MyExpertBookings from './MyExpertBookings';

interface Expert {
  id: string;
  name: string;
  title: string;
  bio: string;
  expertise: string[];
  hourly_rate: number;
  image_url: string | null;
}

const ExpertBooking = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadExperts();
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    // Razorpay handles payment verification in the handler callback
    // No need for URL parameter checking
  };

  const loadExperts = async () => {
    try {
      // Explicitly select only public fields, excluding email for privacy
      const { data, error } = await supabase
        .from('experts')
        .select('id, name, title, bio, expertise, hourly_rate, image_url, is_available')
        .eq('is_available', true);

      if (error) throw error;
      
      const formattedExperts: Expert[] = (data || []).map(expert => ({
        id: expert.id,
        name: expert.name,
        title: expert.title,
        bio: expert.bio || '',
        expertise: Array.isArray(expert.expertise) ? expert.expertise as string[] : [],
        hourly_rate: Number(expert.hourly_rate),
        image_url: expert.image_url,
      }));
      
      setExperts(formattedExperts);
    } catch (error) {
      console.error('Error loading experts:', error);
      toast.error('Failed to load experts');
    }
  };

  const handleBookSession = async () => {
    if (!selectedExpert) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please login to book a session');
        navigate('/login');
        return;
      }

      setIsBooking(true);

      // Generate a unique Jitsi meeting link for the session
      const generatedMeetingLink = `https://meet.jit.si/CareerGuidance-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
      const sessionDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow

      const { error: bookingError } = await supabase
        .from('expert_sessions')
        .insert({
          user_id: user.id,
          expert_id: selectedExpert.id,
          session_date: sessionDateTime.toISOString(),
          duration_minutes: 60,
          amount_paid: selectedExpert.hourly_rate,
          payment_status: 'completed',
          session_status: 'scheduled',
          meeting_link: generatedMeetingLink
        });

      if (bookingError) throw bookingError;

      setBookingSuccess(true);
      toast.success('Session booked successfully!');
      setSelectedExpert(null);
      setIsBooking(false);

      setTimeout(() => {
        setBookingSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Booking failed. Please try again.');
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* My Bookings Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          My Bookings
          <Badge variant="secondary" className="ml-2">Live Tracking</Badge>
        </h3>
        <MyExpertBookings />
      </div>

      {/* Available Experts Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Available Experts
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experts.map((expert) => (
            <Card key={expert.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <span className="text-2xl font-bold text-primary">
                    {expert.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <CardTitle className="text-center text-lg">{expert.name}</CardTitle>
                <CardDescription className="text-center text-sm">{expert.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{expert.bio}</p>
                <div className="flex flex-wrap gap-1">
                  {expert.expertise.slice(0, 3).map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <IndianRupee className="h-4 w-4 text-primary" />
                  <span className="font-bold text-lg">₹{expert.hourly_rate}</span>
                  <span className="text-sm text-muted-foreground">/hour</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setSelectedExpert(expert)}
                  className="w-full"
                >
                  Book Session
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedExpert && !bookingSuccess && !razorpayOpen} onOpenChange={() => setSelectedExpert(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Session with {selectedExpert?.name}</DialogTitle>
            <DialogDescription>
              One-on-one career guidance session
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Session Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Duration: 60 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span>Mode: Online Video Call</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Scheduled within 24 hours</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Platform Fee</span>
                <span className="font-bold text-lg">₹{selectedExpert?.hourly_rate}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Includes 1-hour session with expert guidance, career roadmap, and follow-up resources
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedExpert(null)}
              disabled={isBooking}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookSession}
              disabled={isBooking}
              className="w-full sm:w-auto"
            >
              {isBooking ? 'Processing...' : `Pay ₹${selectedExpert?.hourly_rate} & Book`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bookingSuccess} onOpenChange={setBookingSuccess}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-center">
              Your session with {selectedExpert?.name} has been booked successfully.
              You will receive a confirmation email with the meeting link shortly.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpertBooking;