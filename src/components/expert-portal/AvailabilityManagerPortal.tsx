import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Plus, Trash2, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface AvailabilityManagerPortalProps {
  expertId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const AvailabilityManagerPortal = ({ expertId }: AvailabilityManagerPortalProps) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: 1,
    start: '09:00',
    end: '17:00',
  });

  useEffect(() => {
    loadAvailability();
  }, [expertId]);

  const loadAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_availability')
        .select('*')
        .eq('expert_id', expertId)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSlot = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('expert_availability')
        .insert({
          expert_id: expertId,
          day_of_week: newSlot.day,
          start_time: newSlot.start,
          end_time: newSlot.end,
          is_available: true,
          is_recurring: true,
        });

      if (error) throw error;

      toast.success('Availability slot added');
      loadAvailability();
    } catch (error) {
      console.error('Error adding slot:', error);
      toast.error('Failed to add slot');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('expert_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast.success('Slot removed');
      loadAvailability();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to remove slot');
    }
  };

  const toggleSlotAvailability = async (slot: AvailabilitySlot) => {
    try {
      const { error } = await supabase
        .from('expert_availability')
        .update({ is_available: !slot.is_available })
        .eq('id', slot.id);

      if (error) throw error;

      toast.success(slot.is_available ? 'Slot marked unavailable' : 'Slot marked available');
      loadAvailability();
    } catch (error) {
      console.error('Error toggling slot:', error);
      toast.error('Failed to update slot');
    }
  };

  // Group slots by day
  const slotsByDay = DAYS.map((day, index) => ({
    day,
    dayIndex: index,
    slots: slots.filter(s => s.day_of_week === index),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add New Slot */}
      <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-violet-400" />
          Add Availability Slot
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Day</label>
            <Select value={newSlot.day.toString()} onValueChange={(v) => setNewSlot({ ...newSlot, day: parseInt(v) })}>
              <SelectTrigger className="bg-[#1e1e2e] border-[#2e2e3e] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e2e] border-[#2e2e3e]">
                {DAYS.map((day, index) => (
                  <SelectItem key={index} value={index.toString()} className="text-white hover:bg-[#2e2e3e]">
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Start Time</label>
            <Select value={newSlot.start} onValueChange={(v) => setNewSlot({ ...newSlot, start: v })}>
              <SelectTrigger className="bg-[#1e1e2e] border-[#2e2e3e] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e2e] border-[#2e2e3e] max-h-60">
                {TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time} className="text-white hover:bg-[#2e2e3e]">
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">End Time</label>
            <Select value={newSlot.end} onValueChange={(v) => setNewSlot({ ...newSlot, end: v })}>
              <SelectTrigger className="bg-[#1e1e2e] border-[#2e2e3e] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e2e] border-[#2e2e3e] max-h-60">
                {TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time} className="text-white hover:bg-[#2e2e3e]">
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={addSlot}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {isSaving ? 'Adding...' : 'Add Slot'}
            </Button>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] overflow-hidden">
        <div className="p-6 border-b border-[#1e1e2e]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-violet-400" />
            Weekly Schedule
          </h3>
        </div>

        <div className="divide-y divide-[#1e1e2e]">
          {slotsByDay.map(({ day, dayIndex, slots: daySlots }) => (
            <div key={dayIndex} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{day}</h4>
                <span className="text-sm text-gray-500">{daySlots.length} slot(s)</span>
              </div>

              {daySlots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                        slot.is_available
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-gray-500/10 border-gray-500/30 text-gray-500'
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </span>
                      <button
                        onClick={() => toggleSlotAvailability(slot)}
                        className="ml-1 p-1 rounded hover:bg-white/10 transition-colors"
                        title={slot.is_available ? 'Mark unavailable' : 'Mark available'}
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete slot"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No availability set</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManagerPortal;
