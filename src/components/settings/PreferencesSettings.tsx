
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookIcon, BellIcon, SunIcon, MoonIcon, GlobeIcon, GraduationCapIcon, ShieldIcon, EyeIcon, GaugeIcon, FilterIcon, TargetIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/toast/use-toast";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { SARVAM_LANGUAGES } from "@/hooks/useSarvamTranslation";
import { Button } from "@/components/ui/button";

interface PreferencesSettingsProps {
  userId?: string;
}

export const PreferencesSettings = ({ userId }: PreferencesSettingsProps) => {
  const { setTheme: setAppTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [careerReason, setCareerReason] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);
  const [theme, setTheme] = useState("light");
  const [languagePreference, setLanguagePreference] = useState("english");
  const [learningStyle, setLearningStyle] = useState("visual");
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [dataSharing, setDataSharing] = useState(true);
  const [learningPace, setLearningPace] = useState("standard");
  const [contentFilters, setContentFilters] = useState<any>({ job_types: [], price_max: null, locations: [] });
  const [learningGoals, setLearningGoals] = useState<any>({ skills: [], certifications: [], courses: [] });
  const [newGoalInput, setNewGoalInput] = useState({ skills: "", certifications: "", courses: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        const { data: careerData, error: careerError } = await supabase
          .from('user_career_history')
          .select('*')
          .eq('user_id', userId)
          .eq('is_selected', true)
          .single();
        
        if (careerError && careerError.code !== 'PGRST116') {
          console.error("Error fetching selected career:", careerError);
        }
        
        if (careerData) {
          setSelectedCareer(careerData.career);
          setCareerReason(careerData.reason);
        }
        
        const { data: prefData, error: prefError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (prefError && prefError.code !== 'PGRST116') {
          console.error("Error fetching user preferences:", prefError);
        }
        
        if (prefData) {
          setEmailNotifications(prefData.email_notifications ?? true);
          setAppNotifications(prefData.app_notifications ?? true);
          setTheme((prefData as any).theme ?? "light");
          setAppTheme((prefData as any).theme ?? "light");
          setLanguagePreference((prefData as any).language_preference ?? "english");
          i18n.changeLanguage((prefData as any).language_preference ?? "english");
          setLearningStyle((prefData as any).learning_style ?? "visual");
          setProfileVisibility((prefData as any).profile_visibility ?? "public");
          setDataSharing((prefData as any).data_sharing ?? true);
          setLearningPace((prefData as any).learning_pace ?? "standard");
          setContentFilters((prefData as any).content_filters ?? { job_types: [], price_max: null, locations: [] });
          setLearningGoals((prefData as any).learning_goals ?? { skills: [], certifications: [], courses: [] });
        } else {
          await supabase.from('user_preferences').insert({
            user_id: userId,
            email_notifications: true,
            app_notifications: true
          });
        }
      } catch (error) {
        console.error("Error in preferences fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreferences();
  }, [userId]);

  const updatePreference = async (field: string, value: any) => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ [field]: value, updated_at: new Date().toISOString() } as any)
        .eq('user_id', userId);
      if (error) throw error;
      toast({ title: "Preference updated" });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast({ title: "Failed to update preference", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleToggle = async (
    field: string,
    checked: boolean,
    setter: (v: boolean) => void
  ) => {
    setter(checked);
    const ok = await updatePreference(field, checked);
    if (!ok) setter(!checked);
  };

  const handleSelect = async (
    field: string,
    value: string,
    setter: (v: string) => void,
    prev: string
  ) => {
    setter(value);
    if (field === "theme") {
      setAppTheme(value);
    }
    if (field === "language_preference") {
      i18n.changeLanguage(value);
    }
    const ok = await updatePreference(field, value);
    if (!ok) {
      setter(prev);
      if (field === "theme") setAppTheme(prev);
      if (field === "language_preference") i18n.changeLanguage(prev);
    }
  };

  const handleContentFiltersUpdate = async (newFilters: any) => {
    setContentFilters(newFilters);
    await updatePreference("content_filters", newFilters);
  };

  const addGoalItem = async (category: 'skills' | 'certifications' | 'courses') => {
    const value = newGoalInput[category].trim();
    if (!value) return;
    
    const updated = { ...learningGoals, [category]: [...learningGoals[category], value] };
    setLearningGoals(updated);
    setNewGoalInput({ ...newGoalInput, [category]: "" });
    await updatePreference("learning_goals", updated);
  };

  const removeGoalItem = async (category: 'skills' | 'certifications' | 'courses', index: number) => {
    const updated = { ...learningGoals, [category]: learningGoals[category].filter((_: any, i: number) => i !== index) };
    setLearningGoals(updated);
    await updatePreference("learning_goals", updated);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.preferences')}</CardTitle>
          <CardDescription>{t('preferences.loadingPreferences')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Career Path */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookIcon className="h-5 w-5 text-primary" />
            Selected Career Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCareer ? (
            <div className="flex flex-col gap-2">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 w-fit">
                {selectedCareer}
              </Badge>
              {careerReason && (
                <p className="text-sm text-muted-foreground mt-1">{careerReason}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No career path selected yet. Take the career quiz to select a path.</p>
          )}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? <MoonIcon className="h-5 w-5 text-primary" /> : <SunIcon className="h-5 w-5 text-primary" />}
            Appearance
          </CardTitle>
          <CardDescription>Choose your preferred theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={theme} onValueChange={(v) => handleSelect("theme", v, setTheme, theme)}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">☀️ Light</SelectItem>
              <SelectItem value="dark">🌙 Dark</SelectItem>
              <SelectItem value="system">💻 System</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Language Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GlobeIcon className="h-5 w-5 text-primary" />
            Language Preference
          </CardTitle>
          <CardDescription>Choose your preferred language for the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={languagePreference} onValueChange={(v) => handleSelect("language_preference", v, setLanguagePreference, languagePreference)}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SARVAM_LANGUAGES).map(([key, lang]) => (
                <SelectItem key={key} value={key}>
                  {lang.nativeLabel} ({lang.label})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Learning Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCapIcon className="h-5 w-5 text-primary" />
            Learning Style
          </CardTitle>
          <CardDescription>Select your preferred learning style for personalized recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={learningStyle} onValueChange={(v) => handleSelect("learning_style", v, setLearningStyle, learningStyle)}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visual">👁️ Visual — Charts, diagrams, videos</SelectItem>
              <SelectItem value="auditory">👂 Auditory — Lectures, podcasts</SelectItem>
              <SelectItem value="reading">📖 Reading/Writing — Articles, notes</SelectItem>
              <SelectItem value="kinesthetic">🤲 Kinesthetic — Hands-on, projects</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="h-5 w-5 text-primary" />
            Notification Settings
          </CardTitle>
          <CardDescription>Control how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={(c) => handleToggle("email_notifications", c, setEmailNotifications)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="app-notifications">App Notifications</Label>
            <Switch
              id="app-notifications"
              checked={appNotifications}
              onCheckedChange={(c) => handleToggle("app_notifications", c, setAppNotifications)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Learning Pace */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GaugeIcon className="h-5 w-5 text-primary" />
            Learning Pace
          </CardTitle>
          <CardDescription>Choose how quickly you want to progress through your learning journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={learningPace} onValueChange={(v) => handleSelect("learning_pace", v, setLearningPace, learningPace)}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fast-track">⚡ Fast-track — Intensive, complete quickly</SelectItem>
              <SelectItem value="standard">🎯 Standard — Balanced pace</SelectItem>
              <SelectItem value="flexible">🌊 Flexible — Learn at your own pace</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Content Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5 text-primary" />
            Content Filters
          </CardTitle>
          <CardDescription>Customize what content you see based on your preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="price-max">Maximum Course Price (₹)</Label>
            <Input
              id="price-max"
              type="number"
              placeholder="e.g., 5000"
              value={contentFilters.price_max || ""}
              onChange={(e) => handleContentFiltersUpdate({ ...contentFilters, price_max: e.target.value ? parseInt(e.target.value) : null })}
              className="max-w-xs mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Only show courses within this price range</p>
          </div>
        </CardContent>
      </Card>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TargetIcon className="h-5 w-5 text-primary" />
            Learning Goals
          </CardTitle>
          <CardDescription>Track the skills and certifications you want to achieve.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Skills to Acquire */}
          <div>
            <Label className="text-sm font-semibold">Skills to Acquire</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="e.g., Python, Data Analysis"
                value={newGoalInput.skills}
                onChange={(e) => setNewGoalInput({ ...newGoalInput, skills: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && addGoalItem('skills')}
              />
              <Button onClick={() => addGoalItem('skills')} size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {learningGoals.skills.map((skill: string, i: number) => (
                <Badge key={i} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeGoalItem('skills', i)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Certifications to Earn */}
          <div>
            <Label className="text-sm font-semibold">Certifications to Earn</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="e.g., AWS Certified, Google Analytics"
                value={newGoalInput.certifications}
                onChange={(e) => setNewGoalInput({ ...newGoalInput, certifications: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && addGoalItem('certifications')}
              />
              <Button onClick={() => addGoalItem('certifications')} size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {learningGoals.certifications.map((cert: string, i: number) => (
                <Badge key={i} variant="secondary" className="flex items-center gap-1">
                  {cert}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeGoalItem('certifications', i)} />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5 text-primary" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Manage your profile visibility and data sharing preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="profile-visibility">Profile Visibility</Label>
            </div>
            <Select value={profileVisibility} onValueChange={(v) => handleSelect("profile_visibility", v, setProfileVisibility, profileVisibility)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="connections">Connections Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="data-sharing">Data Sharing for Recommendations</Label>
              <p className="text-xs text-muted-foreground">Allow us to use your data to improve career recommendations.</p>
            </div>
            <Switch
              id="data-sharing"
              checked={dataSharing}
              onCheckedChange={(c) => handleToggle("data_sharing", c, setDataSharing)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
