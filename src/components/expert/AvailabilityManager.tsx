import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Calendar, Clock, Save } from 'lucide-react';

interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface DayAvailability {
  day: number;
  dayName: string;
  slots: TimeSlot[];
}

const DAYS = [
  { day: 0, dayName: 'Sunday' },
  { day: 1, dayName: 'Monday' },
  { day: 2, dayName: 'Tuesday' },
  { day: 3, dayName: 'Wednesday' },
  { day: 4, dayName: 'Thursday' },
  { day: 5, dayName: 'Friday' },
  { day: 6, dayName: 'Saturday' },
];

const TIME_SLOTS = [
  { start: '09:00', end: '10:00', label: '9:00 AM' },
  { start: '10:00', end: '11:00', label: '10:00 AM' },
  { start: '11:00', end: '12:00', label: '11:00 AM' },
  { start: '12:00', end: '13:00', label: '12:00 PM' },
  { start: '13:00', end: '14:00', label: '1:00 PM' },
  { start: '14:00', end: '15:00', label: '2:00 PM' },
  { start: '15:00', end: '16:00', label: '3:00 PM' },
  { start: '16:00', end: '17:00', label: '4:00 PM' },
  { start: '17:00', end: '18:00', label: '5:00 PM' },
];

interface AvailabilityManagerProps {
  expertId: string;
}

const AvailabilityManager = ({ expertId }: AvailabilityManagerProps) => {
  const [availability, setAvailability] = useState<Record<number, Record<string, boolean>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, [expertId]);

  const loadAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_availability')
        .select('*')
        .eq('expert_id', expertId)
        .eq('is_recurring', true);

      if (error) throw error;

      // Initialize availability map
      const availMap: Record<number, Record<string, boolean>> = {};
      DAYS.forEach(({ day }) => {
        availMap[day] = {};
        TIME_SLOTS.forEach(slot => {
          availMap[day][slot.start] = false;
        });
      });

      // Populate with existing data
      data?.forEach(item => {
        if (availMap[item.day_of_week]) {
          const startTime = item.start_time.substring(0, 5);
          availMap[item.day_of_week][startTime] = item.is_available;
        }
      });

      setAvailability(availMap);
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSlot = (day: number, startTime: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [startTime]: !prev[day][startTime]
      }
    }));
  };

  const toggleDay = (day: number, enable: boolean) => {
    setAvailability(prev => {
      const daySlots: Record<string, boolean> = {};
      TIME_SLOTS.forEach(slot => {
        daySlots[slot.start] = enable;
      });
      return { ...prev, [day]: daySlots };
    });
  };

  const saveAvailability = async () => {
    setIsSaving(true);
    try {
      // Delete existing recurring availability
      const { error: deleteError } = await supabase
        .from('expert_availability')
        .delete()
        .eq('expert_id', expertId)
        .eq('is_recurring', true);

      if (deleteError) throw deleteError;

      // Insert new availability
      const inserts: any[] = [];
      Object.entries(availability).forEach(([day, slots]) => {
        Object.entries(slots).forEach(([startTime, isAvailable]) => {
          if (isAvailable) {
            const slot = TIME_SLOTS.find(s => s.start === startTime);
            if (slot) {
              inserts.push({
                expert_id: expertId,
                day_of_week: parseInt(day),
                start_time: `${slot.start}:00`,
                end_time: `${slot.end}:00`,
                is_recurring: true,
                is_available: true
              });
            }
          }
        });
      });

      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from('expert_availability')
          .insert(inserts);

        if (insertError) throw insertError;
      }

      toast.success('Availability saved successfully');
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability');
    } finally {
      setIsSaving(false);
    }
  };

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Availability
            </CardTitle>
            <CardDescription>
              Set your recurring weekly availability for sessions
            </CardDescription>
          </div>
          <Button onClick={saveAvailability} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 border-b">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Time
                </th>
                {DAYS.map(({ day, dayName }) => (
                  <th key={day} className="p-2 border-b text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-medium">{dayName.slice(0, 3)}</span>
                      <Switch
                        checked={Object.values(availability[day] || {}).some(v => v)}
                        onCheckedChange={(checked) => toggleDay(day, checked)}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(slot => (
                <tr key={slot.start} className="hover:bg-muted/50">
                  <td className="p-2 border-b text-sm font-medium">
                    {slot.label}
                  </td>
                  {DAYS.map(({ day }) => (
                    <td key={`${day}-${slot.start}`} className="p-2 border-b text-center">
                      <button
                        onClick={() => toggleSlot(day, slot.start)}
                        className={`w-8 h-8 rounded-md transition-colors ${
                          availability[day]?.[slot.start]
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {availability[day]?.[slot.start] ? '✓' : ''}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Click on time slots to toggle availability. Green slots indicate you're available for bookings.
        </p>
      </CardContent>
    </Card>
  );
};

export default AvailabilityManager;
