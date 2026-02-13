import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Briefcase, IndianRupee, Save, Camera, Eye, EyeOff, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface ExpertData {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  email: string | null;
  hourly_rate: number | null;
  expertise: any;
  image_url: string | null;
  is_available: boolean | null;
}

interface ExpertProfilePortalProps {
  expertId: string;
}

const ExpertProfilePortal = ({ expertId }: ExpertProfilePortalProps) => {
  const [expert, setExpert] = useState<ExpertData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    hourly_rate: 0,
    is_available: true,
  });
  const [expertiseTags, setExpertiseTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [sessionStats, setSessionStats] = useState({ total: 0, completed: 0, students: 0 });

  useEffect(() => {
    loadExpert();
    loadStats();
  }, [expertId]);

  const loadExpert = async () => {
    try {
      const { data, error } = await supabase
        .from('experts')
        .select('id, name, title, bio, expertise, hourly_rate, image_url, user_id, is_available, email')
        .eq('id', expertId)
        .single();

      if (error) throw error;

      setExpert(data);
      setFormData({
        name: data.name || '',
        title: data.title || '',
        bio: data.bio || '',
        email: data.email || '',
        hourly_rate: data.hourly_rate || 0,
        is_available: data.is_available ?? true,
      });
      setExpertiseTags(Array.isArray(data.expertise) ? data.expertise.map(String) : []);
    } catch (error) {
      console.error('Error loading expert:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: sessions } = await supabase
        .from('expert_sessions')
        .select('id, session_status, user_id')
        .eq('expert_id', expertId);

      if (sessions) {
        const uniqueStudents = new Set(sessions.map(s => s.user_id));
        setSessionStats({
          total: sessions.length,
          completed: sessions.filter(s => s.session_status === 'completed').length,
          students: uniqueStudents.size,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !expertiseTags.includes(tag)) {
      setExpertiseTags([...expertiseTags, tag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setExpertiseTags(expertiseTags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('experts')
        .update({
          name: formData.name,
          title: formData.title,
          bio: formData.bio,
          email: formData.email,
          hourly_rate: formData.hourly_rate,
          expertise: expertiseTags,
          is_available: formData.is_available,
        })
        .eq('id', expertId);

      if (error) throw error;

      toast.success('Profile updated successfully');
      loadExpert();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAvailability = async () => {
    const newValue = !formData.is_available;
    setFormData({ ...formData, is_available: newValue });
    
    try {
      const { error } = await supabase
        .from('experts')
        .update({ is_available: newValue })
        .eq('id', expertId);

      if (error) throw error;

      toast.success(newValue ? 'You are now visible to students' : 'You are now hidden from students');
    } catch (error) {
      console.error('Error toggling availability:', error);
      setFormData({ ...formData, is_available: !newValue });
      toast.error('Failed to update availability');
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
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-[#1e1e2e] p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              {expert?.image_url ? (
                <img src={expert.image_url} alt={expert.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-white" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center border-2 border-[#0a0a0f] hover:bg-violet-700 transition-colors">
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-white">{expert?.name}</h2>
            <p className="text-violet-300">{expert?.title}</p>
            <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{sessionStats.total}</p>
                <p className="text-xs text-gray-400">Sessions</p>
              </div>
              <div className="w-px h-8 bg-[#2e2e3e]" />
              <div className="text-center">
                <p className="text-lg font-bold text-white">{sessionStats.students}</p>
                <p className="text-xs text-gray-400">Students</p>
              </div>
              <div className="w-px h-8 bg-[#2e2e3e]" />
              <div className="text-center">
                <p className="text-lg font-bold text-white">{sessionStats.completed}</p>
                <p className="text-xs text-gray-400">Completed</p>
              </div>
            </div>
          </div>
          {/* Availability Toggle */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1e1e2e] border border-[#2e2e3e]">
              {formData.is_available ? (
                <Eye className="h-5 w-5 text-emerald-400" />
              ) : (
                <EyeOff className="h-5 w-5 text-gray-500" />
              )}
              <Switch
                checked={formData.is_available}
                onCheckedChange={toggleAvailability}
              />
            </div>
            <p className={`text-xs font-medium ${formData.is_available ? 'text-emerald-400' : 'text-gray-500'}`}>
              {formData.is_available ? 'Visible' : 'Hidden'}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] p-6 space-y-6">
        <h3 className="text-lg font-semibold text-white mb-6">Edit Profile</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-400 flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#1e1e2e] border-[#2e2e3e] text-white"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-[#1e1e2e] border-[#2e2e3e] text-white"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Title / Role
            </Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-[#1e1e2e] border-[#2e2e3e] text-white"
              placeholder="e.g., Senior Career Counselor"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400 flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Hourly Rate (₹)
            </Label>
            <Input
              type="number"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({ ...formData, hourly_rate: parseInt(e.target.value) || 0 })}
              className="bg-[#1e1e2e] border-[#2e2e3e] text-white"
              placeholder="1000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-400">Bio</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="bg-[#1e1e2e] border-[#2e2e3e] text-white min-h-[120px]"
            placeholder="Tell students about your experience and expertise..."
          />
          <p className="text-xs text-gray-500">{formData.bio.length}/500 characters</p>
        </div>

        {/* Expertise Tags */}
        <div className="space-y-2">
          <Label className="text-gray-400">Areas of Expertise</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {expertiseTags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-400 text-sm"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="bg-[#1e1e2e] border-[#2e2e3e] text-white flex-1"
              placeholder="Add expertise (e.g., Career Counseling)"
            />
            <Button
              type="button"
              onClick={addTag}
              variant="outline"
              className="border-[#2e2e3e] text-gray-300 hover:bg-[#1e1e2e]"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ExpertProfilePortal;
