import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Save, IndianRupee } from 'lucide-react';

interface ExpertData {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  expertise: unknown;
  hourly_rate: number;
  image_url: string | null;
}

interface ExpertProfileProps {
  expertId: string;
}

const ExpertProfile = ({ expertId }: ExpertProfileProps) => {
  const [expert, setExpert] = useState<ExpertData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    expertise: '',
    hourly_rate: 199,
  });

  useEffect(() => {
    loadExpertProfile();
  }, [expertId]);

  const loadExpertProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('id', expertId)
        .single();

      if (error) throw error;

      setExpert(data);
      const expertiseArray = Array.isArray(data.expertise) ? data.expertise : [];
      setFormData({
        name: data.name || '',
        title: data.title || '',
        bio: data.bio || '',
        expertise: expertiseArray.map(String).join(', '),
        hourly_rate: data.hourly_rate || 199,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
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
          expertise: expertiseArray,
          hourly_rate: formData.hourly_rate,
        })
        .eq('id', expertId);

      if (error) throw error;

      toast.success('Profile updated successfully');
      loadExpertProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
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
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>
          Update your profile information visible to users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
            {expert?.image_url ? (
              <img
                src={expert.image_url}
                alt={expert.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{expert?.name}</h3>
            <p className="text-sm text-muted-foreground">{expert?.title}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Professional Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Senior Career Counselor"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell users about your experience and expertise..."
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="expertise">Areas of Expertise</Label>
            <Input
              id="expertise"
              value={formData.expertise}
              onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
              placeholder="Career Planning, Resume Review, Interview Prep (comma separated)"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple areas with commas
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rate">Hourly Rate (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="rate"
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseInt(e.target.value) || 0 })}
                className="pl-10"
                min={0}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExpertProfile;
