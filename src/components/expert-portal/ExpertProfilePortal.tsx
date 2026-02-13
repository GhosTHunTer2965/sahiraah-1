import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Briefcase, IndianRupee, Save, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    expertise: '',
  });

  useEffect(() => {
    loadExpert();
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
        expertise: Array.isArray(data.expertise) ? data.expertise.join(', ') : '',
      });
    } catch (error) {
      console.error('Error loading expert:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const expertiseArray = formData.expertise
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      const { error } = await supabase
        .from('experts')
        .update({
          name: formData.name,
          title: formData.title,
          bio: formData.bio,
          email: formData.email,
          hourly_rate: formData.hourly_rate,
          expertise: expertiseArray,
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
      <div className="rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-[#1e1e2e] p-8 text-center">
        <div className="relative inline-block mb-4">
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
        <h2 className="text-2xl font-bold text-white">{expert?.name}</h2>
        <p className="text-violet-300">{expert?.title}</p>
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
        </div>

        <div className="space-y-2">
          <Label className="text-gray-400">Areas of Expertise (comma-separated)</Label>
          <Input
            value={formData.expertise}
            onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
            className="bg-[#1e1e2e] border-[#2e2e3e] text-white"
            placeholder="Career Counseling, Resume Building, Interview Prep"
          />
          <p className="text-xs text-gray-500">Separate multiple areas with commas</p>
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
