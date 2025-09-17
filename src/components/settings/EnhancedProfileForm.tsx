import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

interface EnhancedUserProfile {
  id: string;
  name: string;
  email: string;
  location?: string;
  bio?: string;
  profilePicture?: string;
  // Enhanced fields
  family_income_range?: string;
  location_type?: string;
  parent_education_level?: string;
  financial_constraints?: string[];
  preferred_language?: string;
  region?: string;
  state?: string;
  disability_status?: string;
  learning_pace_preference?: string;
  time_availability?: string;
  prior_education_level?: string;
  current_qualification?: string;
  work_experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  skills_interests?: string[];
  career_aspirations?: string[];
  profile_completion_percentage?: number;
}

interface Props {
  profile: EnhancedUserProfile;
  onProfileUpdate: (updatedProfile: EnhancedUserProfile) => Promise<void>;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Urdu',
  'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'Maithili', 'Sanskrit'
];

const EDUCATION_LEVELS = [
  'Below 5th Standard', '5th Standard', '8th Standard', '10th Standard', '12th Standard',
  'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Professional Certification'
];

const INCOME_RANGES = [
  'Below ₹2 Lakh', '₹2-5 Lakh', '₹5-10 Lakh', '₹10-15 Lakh', '₹15-25 Lakh', 'Above ₹25 Lakh'
];

const FINANCIAL_CONSTRAINTS = [
  'Limited funds for courses', 'No internet access', 'No computer/smartphone',
  'Time constraints due to work', 'Family responsibilities', 'Location barriers'
];

export default function EnhancedProfileForm({ profile, onProfileUpdate }: Props) {
  const [formProfile, setFormProfile] = useState<EnhancedUserProfile>(profile);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newAspiration, setNewAspiration] = useState('');

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Calculate completion percentage
      const completionScore = calculateCompletionPercentage(formProfile);
      const updatedProfile = { ...formProfile, profile_completion_percentage: completionScore };
      
      await onProfileUpdate(updatedProfile);
      setFormProfile(updatedProfile);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletionPercentage = (prof: EnhancedUserProfile): number => {
    const fields = [
      prof.name, prof.email, prof.location, prof.bio, prof.family_income_range,
      prof.location_type, prof.parent_education_level, prof.preferred_language,
      prof.region, prof.state, prof.learning_pace_preference, prof.time_availability,
      prof.prior_education_level, prof.current_qualification
    ];
    
    const filledFields = fields.filter(field => field && field.length > 0).length;
    const arrayFields = [
      prof.financial_constraints?.length || 0,
      prof.work_experience?.length || 0,
      prof.skills_interests?.length || 0,
      prof.career_aspirations?.length || 0
    ];
    
    const filledArrays = arrayFields.filter(arr => arr > 0).length;
    return Math.round(((filledFields + filledArrays) / 18) * 100);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormProfile(prev => ({
        ...prev,
        skills_interests: [...(prev.skills_interests || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormProfile(prev => ({
      ...prev,
      skills_interests: prev.skills_interests?.filter(s => s !== skill) || []
    }));
  };

  const addAspiration = () => {
    if (newAspiration.trim()) {
      setFormProfile(prev => ({
        ...prev,
        career_aspirations: [...(prev.career_aspirations || []), newAspiration.trim()]
      }));
      setNewAspiration('');
    }
  };

  const removeAspiration = (aspiration: string) => {
    setFormProfile(prev => ({
      ...prev,
      career_aspirations: prev.career_aspirations?.filter(a => a !== aspiration) || []
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Profile Completion Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Profile Completion
            <Badge variant="secondary">
              {formProfile.profile_completion_percentage || 20}% Complete
            </Badge>
          </CardTitle>
          <Progress value={formProfile.profile_completion_percentage || 20} className="mt-2" />
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your personal details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formProfile.profilePicture} />
              <AvatarFallback className="text-lg">
                {formProfile.name ? getInitials(formProfile.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="profilePicture">Profile Picture URL</Label>
              <Input
                id="profilePicture"
                value={formProfile.profilePicture || ''}
                onChange={(e) => setFormProfile({...formProfile, profilePicture: e.target.value})}
                placeholder="https://example.com/your-photo.jpg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formProfile.name}
                onChange={(e) => setFormProfile({...formProfile, name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formProfile.email}
                onChange={(e) => setFormProfile({...formProfile, email: e.target.value})}
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formProfile.bio || ''}
              onChange={(e) => setFormProfile({...formProfile, bio: e.target.value})}
              placeholder="Tell us about yourself, your interests, and goals..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Geographic & Cultural Information */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic & Cultural Information</CardTitle>
          <CardDescription>Help us understand your regional context and language preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>State *</Label>
              <Select value={formProfile.state || ''} onValueChange={(value) => setFormProfile({...formProfile, state: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location Type</Label>
              <Select value={formProfile.location_type || ''} onValueChange={(value) => setFormProfile({...formProfile, location_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urban">Urban</SelectItem>
                  <SelectItem value="semi-urban">Semi-Urban</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">City/District</Label>
              <Input
                id="location"
                value={formProfile.location || ''}
                onChange={(e) => setFormProfile({...formProfile, location: e.target.value})}
                placeholder="Enter your city or district"
              />
            </div>
            <div>
              <Label>Preferred Language</Label>
              <Select value={formProfile.preferred_language || 'English'} onValueChange={(value) => setFormProfile({...formProfile, preferred_language: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang} value={lang.toLowerCase()}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Socio-Economic Background */}
      <Card>
        <CardHeader>
          <CardTitle>Socio-Economic Background</CardTitle>
          <CardDescription>This information helps us recommend appropriate programs and financial assistance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Family Income Range</Label>
              <Select value={formProfile.family_income_range || ''} onValueChange={(value) => setFormProfile({...formProfile, family_income_range: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_RANGES.map(range => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Parent/Guardian Education Level</Label>
              <Select value={formProfile.parent_education_level || ''} onValueChange={(value) => setFormProfile({...formProfile, parent_education_level: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Financial Constraints (Select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {FINANCIAL_CONSTRAINTS.map(constraint => (
                <div key={constraint} className="flex items-center space-x-2">
                  <Checkbox
                    id={constraint}
                    checked={formProfile.financial_constraints?.includes(constraint) || false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormProfile(prev => ({
                          ...prev,
                          financial_constraints: [...(prev.financial_constraints || []), constraint]
                        }));
                      } else {
                        setFormProfile(prev => ({
                          ...prev,
                          financial_constraints: prev.financial_constraints?.filter(c => c !== constraint) || []
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={constraint} className="text-sm">{constraint}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Educational Background */}
      <Card>
        <CardHeader>
          <CardTitle>Educational Background</CardTitle>
          <CardDescription>Your academic qualifications and current educational status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Prior Education Level</Label>
              <Select value={formProfile.prior_education_level || ''} onValueChange={(value) => setFormProfile({...formProfile, prior_education_level: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your education level" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currentQualification">Current Qualification/Course</Label>
              <Input
                id="currentQualification"
                value={formProfile.current_qualification || ''}
                onChange={(e) => setFormProfile({...formProfile, current_qualification: e.target.value})}
                placeholder="e.g., B.Tech Computer Science, ITI Electrician"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Preferences</CardTitle>
          <CardDescription>Help us personalize your learning experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Learning Pace Preference</Label>
              <Select value={formProfile.learning_pace_preference || ''} onValueChange={(value) => setFormProfile({...formProfile, learning_pace_preference: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your preferred pace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow & Steady</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="fast">Fast Track</SelectItem>
                  <SelectItem value="adaptive">Adaptive (Let AI decide)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeAvailability">Time Availability</Label>
              <Input
                id="timeAvailability"
                value={formProfile.time_availability || ''}
                onChange={(e) => setFormProfile({...formProfile, time_availability: e.target.value})}
                placeholder="e.g., 2 hours/day, Weekends only, Flexible"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="disabilityStatus">Accessibility Needs</Label>
            <Input
              id="disabilityStatus"
              value={formProfile.disability_status || ''}
              onChange={(e) => setFormProfile({...formProfile, disability_status: e.target.value})}
              placeholder="Any special accessibility requirements or accommodations needed"
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills & Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Interests</CardTitle>
          <CardDescription>What skills do you currently have or want to develop?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill or interest"
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            />
            <Button onClick={addSkill} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formProfile.skills_interests?.map(skill => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                {skill}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeSkill(skill)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Career Aspirations */}
      <Card>
        <CardHeader>
          <CardTitle>Career Aspirations</CardTitle>
          <CardDescription>What career paths are you interested in pursuing?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newAspiration}
              onChange={(e) => setNewAspiration(e.target.value)}
              placeholder="Add a career aspiration"
              onKeyPress={(e) => e.key === 'Enter' && addAspiration()}
            />
            <Button onClick={addAspiration} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formProfile.career_aspirations?.map(aspiration => (
              <Badge key={aspiration} variant="outline" className="flex items-center gap-1">
                {aspiration}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeAspiration(aspiration)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveProfile} disabled={saving} className="min-w-32">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}