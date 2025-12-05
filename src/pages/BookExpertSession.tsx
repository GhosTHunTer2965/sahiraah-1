import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, IndianRupee, Video, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { z } from 'zod';

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  countryCode: z.string().min(1, "Please select a country code"),
  phone: z.string().regex(/^[0-9]{6,15}$/, "Phone number must be between 6 and 15 digits"),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
  selectedDate: z.date({ required_error: "Please select a date" }),
  selectedTimeSlot: z.string().min(1, "Please select a time slot")
});

interface Expert {
  id: string;
  name: string;
  title: string;
  bio: string;
  expertise: string[];
  hourly_rate: number;
  image_url: string | null;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

const BookExpertSession = () => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedSessionId, setBookedSessionId] = useState<string | null>(null);
  const [step, setStep] = useState<'expert' | 'details' | 'confirm'>('expert');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadExperts();
    loadUserDetails();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedExpert) {
      generateTimeSlots();
    }
  }, [selectedDate, selectedExpert]);

  const loadUserDetails = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email || '');
      setName(user.user_metadata?.full_name || '');
    }
  };

  const loadExperts = async () => {
    try {
      const { data, error } = await supabase
        .from('experts')
        .select('*')
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

  const generateTimeSlots = async () => {
    if (!selectedExpert || !selectedDate) return;

    try {
      const dayOfWeek = selectedDate.getDay();
      
      // Fetch expert's availability for this day
      const { data: availability, error: availError } = await supabase
        .from('expert_availability')
        .select('*')
        .eq('expert_id', selectedExpert.id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true)
        .eq('is_recurring', true);

      if (availError) throw availError;

      // If no availability set, show default slots
      if (!availability || availability.length === 0) {
        const defaultSlots: TimeSlot[] = [
          { id: '09:00', time: '09:00 AM', available: true },
          { id: '10:00', time: '10:00 AM', available: true },
          { id: '11:00', time: '11:00 AM', available: true },
          { id: '12:00', time: '12:00 PM', available: true },
          { id: '14:00', time: '02:00 PM', available: true },
          { id: '15:00', time: '03:00 PM', available: true },
          { id: '16:00', time: '04:00 PM', available: true },
          { id: '17:00', time: '05:00 PM', available: true },
          { id: '18:00', time: '06:00 PM', available: true },
        ];
        setAvailableTimeSlots(defaultSlots);
        return;
      }

      // Fetch already booked sessions for this date
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: bookedSessions } = await supabase
        .from('expert_sessions')
        .select('session_date')
        .eq('expert_id', selectedExpert.id)
        .gte('session_date', startOfDay.toISOString())
        .lte('session_date', endOfDay.toISOString())
        .in('session_status', ['scheduled', 'completed']);

      const bookedHours = new Set(
        (bookedSessions || []).map(s => new Date(s.session_date).getHours())
      );

      // Convert availability to time slots
      const timeLabels: Record<string, string> = {
        '09': '09:00 AM', '10': '10:00 AM', '11': '11:00 AM',
        '12': '12:00 PM', '13': '01:00 PM', '14': '02:00 PM',
        '15': '03:00 PM', '16': '04:00 PM', '17': '05:00 PM',
      };

      const slots: TimeSlot[] = availability.map(slot => {
        const hour = slot.start_time.substring(0, 2);
        const hourNum = parseInt(hour);
        return {
          id: `${hour}:00`,
          time: timeLabels[hour] || `${hour}:00`,
          available: !bookedHours.has(hourNum)
        };
      }).sort((a, b) => a.id.localeCompare(b.id));

      setAvailableTimeSlots(slots);
    } catch (error) {
      console.error('Error generating time slots:', error);
      // Fallback to default slots
      const defaultSlots: TimeSlot[] = [
        { id: '09:00', time: '09:00 AM', available: true },
        { id: '10:00', time: '10:00 AM', available: true },
        { id: '11:00', time: '11:00 AM', available: true },
        { id: '12:00', time: '12:00 PM', available: true },
        { id: '14:00', time: '02:00 PM', available: true },
        { id: '15:00', time: '03:00 PM', available: true },
        { id: '16:00', time: '04:00 PM', available: true },
        { id: '17:00', time: '05:00 PM', available: true },
        { id: '18:00', time: '06:00 PM', available: true },
      ];
      setAvailableTimeSlots(defaultSlots);
    }
  };

  const handleExpertSelect = (expert: Expert) => {
    setSelectedExpert(expert);
    setStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validated = bookingSchema.parse({
        name,
        email,
        countryCode,
        phone,
        notes: notes || undefined,
        selectedDate,
        selectedTimeSlot
      });

      setStep('confirm');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      }
    }
  };

  const handleBookSession = async () => {
    if (!selectedExpert || !selectedDate || !selectedTimeSlot) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please login to book a session');
        navigate('/login');
        return;
      }

      setIsBooking(true);

      // Create session datetime
      const [hours] = selectedTimeSlot.split(':');
      const sessionDateTime = new Date(selectedDate);
      sessionDateTime.setHours(parseInt(hours), 0, 0, 0);

      // Create booking directly without payment (Razorpay disabled)
      const { data: sessionData, error: bookingError } = await supabase
        .from('expert_sessions')
        .insert({
          user_id: user.id,
          expert_id: selectedExpert.id,
          session_date: sessionDateTime.toISOString(),
          duration_minutes: 60,
          amount_paid: selectedExpert.hourly_rate,
          payment_status: 'pending', // Payment disabled
          session_status: 'scheduled',
          notes: notes || null,
        })
        .select('id')
        .single();

      if (bookingError) throw bookingError;

      setBookedSessionId(sessionData?.id || null);
      setBookingSuccess(true);
      setIsBooking(false);
      toast.success('Session booked successfully!');
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book session. Please try again.');
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => step === 'expert' ? navigate(-1) : setStep(step === 'confirm' ? 'details' : 'expert')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Book Expert Session</h1>
          <p className="text-muted-foreground">Schedule a personalized career guidance session with industry experts</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8 gap-2">
          <div className={cn("flex items-center gap-2", step === 'expert' && "text-primary font-semibold")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2", 
              step === 'expert' ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground")}>
              1
            </div>
            <span className="hidden sm:inline">Select Expert</span>
          </div>
          <div className="w-12 h-0.5 bg-muted-foreground" />
          <div className={cn("flex items-center gap-2", step === 'details' && "text-primary font-semibold")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2",
              step === 'details' ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground")}>
              2
            </div>
            <span className="hidden sm:inline">Details</span>
          </div>
          <div className="w-12 h-0.5 bg-muted-foreground" />
          <div className={cn("flex items-center gap-2", step === 'confirm' && "text-primary font-semibold")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2",
              step === 'confirm' ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground")}>
              3
            </div>
            <span className="hidden sm:inline">Confirm</span>
          </div>
        </div>

        {/* Step 1: Select Expert */}
        {step === 'expert' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert) => (
              <Card key={expert.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleExpertSelect(expert)}>
                <CardHeader className="pb-3">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <span className="text-3xl font-bold text-primary">
                      {expert.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <CardTitle className="text-center">{expert.name}</CardTitle>
                  <CardDescription className="text-center">{expert.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">{expert.bio}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
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
              </Card>
            ))}
          </div>
        )}

        {/* Step 2: Enter Details & Select Date/Time */}
        {step === 'details' && selectedExpert && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Session with {selectedExpert.name}</CardTitle>
              <CardDescription>Fill in your details and select your preferred date and time</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="flex gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+91">🇮🇳 +91</SelectItem>
                          <SelectItem value="+1">🇺🇸 +1</SelectItem>
                          <SelectItem value="+44">🇬🇧 +44</SelectItem>
                          <SelectItem value="+61">🇦🇺 +61</SelectItem>
                          <SelectItem value="+81">🇯🇵 +81</SelectItem>
                          <SelectItem value="+86">🇨🇳 +86</SelectItem>
                          <SelectItem value="+49">🇩🇪 +49</SelectItem>
                          <SelectItem value="+33">🇫🇷 +33</SelectItem>
                          <SelectItem value="+39">🇮🇹 +39</SelectItem>
                          <SelectItem value="+34">🇪🇸 +34</SelectItem>
                          <SelectItem value="+7">🇷🇺 +7</SelectItem>
                          <SelectItem value="+55">🇧🇷 +55</SelectItem>
                          <SelectItem value="+52">🇲🇽 +52</SelectItem>
                          <SelectItem value="+82">🇰🇷 +82</SelectItem>
                          <SelectItem value="+65">🇸🇬 +65</SelectItem>
                          <SelectItem value="+971">🇦🇪 +971</SelectItem>
                          <SelectItem value="+966">🇸🇦 +966</SelectItem>
                          <SelectItem value="+27">🇿🇦 +27</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        required
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific topics or questions you'd like to discuss..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Select Preferred Date</h3>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-md border"
                    />
                  </div>
                  {selectedDate && (
                    <p className="text-sm text-center text-muted-foreground">
                      Selected: {format(selectedDate, 'PPP')}
                    </p>
                  )}
                </div>

                {/* Time Slot Selection */}
                {selectedDate && availableTimeSlots.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Available Time Slots</h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {availableTimeSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          type="button"
                          variant={selectedTimeSlot === slot.id ? 'default' : 'outline'}
                          disabled={!slot.available}
                          onClick={() => setSelectedTimeSlot(slot.id)}
                          className="h-auto py-3"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg">
                  Continue to Confirmation
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && selectedExpert && selectedDate && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Confirm Your Booking</CardTitle>
              <CardDescription>Review your session details before proceeding to payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Expert Details */}
              <div className="space-y-2">
                <h3 className="font-semibold">Expert</h3>
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {selectedExpert.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedExpert.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedExpert.title}</p>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="space-y-2">
                <h3 className="font-semibold">Session Details</h3>
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{format(selectedDate, 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{availableTimeSlots.find(s => s.id === selectedTimeSlot)?.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span>Online Video Call (60 minutes)</span>
                  </div>
                </div>
              </div>

              {/* Your Details */}
              <div className="space-y-2">
                <h3 className="font-semibold">Your Details</h3>
                <div className="space-y-1 p-4 bg-muted rounded-lg text-sm">
                  <p><span className="font-medium">Name:</span> {name}</p>
                  <p><span className="font-medium">Email:</span> {email}</p>
                  <p><span className="font-medium">Phone:</span> {countryCode} {phone}</p>
                  {notes && <p><span className="font-medium">Notes:</span> {notes}</p>}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg">Total Amount</span>
                  <span className="font-bold text-2xl text-primary">₹{selectedExpert.hourly_rate}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Includes 1-hour session with expert guidance, career roadmap, and follow-up resources
                </p>
              </div>

              <Button
                onClick={handleBookSession}
                disabled={isBooking}
                className="w-full"
                size="lg"
              >
                {isBooking ? 'Processing...' : `Proceed to Payment`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Success Dialog */}
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
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button onClick={() => bookedSessionId && navigate(`/video-meeting/${bookedSessionId}`)}>
                  <Video className="h-4 w-4 mr-2" />
                  Go to Meeting
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BookExpertSession;
