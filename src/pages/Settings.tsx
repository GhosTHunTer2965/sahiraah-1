
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { HistorySettings } from "@/components/settings/HistorySettings";
import { UserProfile } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get active tab from navigation state, default to "profile"
  const activeTab = (location.state as { activeTab?: string })?.activeTab || "profile";
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in with Supabase
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error.message);
          navigate("/login");
          return;
        }
        
        if (!data.session) {
          navigate("/login");
          return;
        }
        
        setUserId(data.session.user.id);
        
        // Fetch the user's profile from our profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching user profile:", profileError);
        }
        
        // If profile exists, use it; otherwise use the auth user data
        if (profileData) {
          setProfile({
            id: data.session.user.id,
            name: profileData.name || data.session.user.email?.split('@')[0] || 'User',
            email: profileData.email || data.session.user.email || '',
            location: profileData.location || '',
            bio: profileData.bio || '',
            profilePicture: data.session.user.user_metadata?.avatar_url || ''
          });
        } else {
          // Create initial profile with data from auth
          setProfile({
            id: data.session.user.id,
            name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
            email: data.session.user.email || '',
            location: '',
            bio: '',
            profilePicture: data.session.user.user_metadata?.avatar_url || ''
          });
          
          // Insert initial profile
          await supabase.from('user_profiles').insert({
            id: data.session.user.id,
            name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
            email: data.session.user.email || ''
          });
        }
      } catch (error) {
        console.error("Error in session handling:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, [navigate]);

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    try {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: updatedProfile.name,
          email: updatedProfile.email,
          location: updatedProfile.location,
          bio: updatedProfile.bio
        })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      setProfile(updatedProfile);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-blue-900 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6">Account Settings</h1>
        
        {profile && (
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger value="profile" className="text-xs md:text-sm">Profile</TabsTrigger>
              <TabsTrigger value="account" className="text-xs md:text-sm">Account</TabsTrigger>
              <TabsTrigger value="history" className="text-xs md:text-sm">History</TabsTrigger>
              <TabsTrigger value="preferences" className="text-xs md:text-sm">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <ProfileForm profile={profile} onProfileUpdate={handleProfileUpdate} />
            </TabsContent>
            
            <TabsContent value="account" className="space-y-6">
              <AccountSettings profile={profile} />
            </TabsContent>
            
            <TabsContent value="history" className="space-y-6">
              <HistorySettings userId={profile.id} />
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-6">
              <PreferencesSettings userId={profile.id} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Settings;
