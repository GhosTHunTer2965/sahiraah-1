import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SessionFeedback = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [feedback, setFeedback] = useState({
    overallRating: 0,
    expertKnowledge: 0,
    communication: 0,
    helpfulness: 0,
    wouldRecommend: '',
    topicsDiscussed: [] as string[],
    mostHelpfulAspect: '',
    improvements: '',
    additionalComments: '',
  });

  const topics = [
    'Career Path Guidance',
    'Industry Insights',
    'Skill Development',
    'Education Advice',
    'Job Search Tips',
    'Resume/Portfolio Review',
    'Interview Preparation',
    'Networking Strategies',
  ];

  const handleRating = (field: string, value: number) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleTopicToggle = (topic: string) => {
    setFeedback(prev => ({
      ...prev,
      topicsDiscussed: prev.topicsDiscussed.includes(topic)
        ? prev.topicsDiscussed.filter(t => t !== topic)
        : [...prev.topicsDiscussed, topic],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (feedback.overallRating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update the session with feedback (storing in notes field for now)
      const feedbackData = JSON.stringify({
        ratings: {
          overall: feedback.overallRating,
          expertKnowledge: feedback.expertKnowledge,
          communication: feedback.communication,
          helpfulness: feedback.helpfulness,
        },
        wouldRecommend: feedback.wouldRecommend,
        topicsDiscussed: feedback.topicsDiscussed,
        mostHelpfulAspect: feedback.mostHelpfulAspect,
        improvements: feedback.improvements,
        additionalComments: feedback.additionalComments,
        submittedAt: new Date().toISOString(),
      });

      const { error } = await supabase
        .from('expert_sessions')
        .update({ 
          notes: feedbackData,
          session_status: 'completed'
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Session Feedback</CardTitle>
            <CardDescription>
              Help us improve by sharing your experience with the expert session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Rating Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Rate Your Experience</h3>
                
                <StarRating
                  label="Overall Experience *"
                  value={feedback.overallRating}
                  onChange={(val) => handleRating('overallRating', val)}
                />
                
                <StarRating
                  label="Expert's Knowledge"
                  value={feedback.expertKnowledge}
                  onChange={(val) => handleRating('expertKnowledge', val)}
                />
                
                <StarRating
                  label="Communication Quality"
                  value={feedback.communication}
                  onChange={(val) => handleRating('communication', val)}
                />
                
                <StarRating
                  label="Helpfulness of Advice"
                  value={feedback.helpfulness}
                  onChange={(val) => handleRating('helpfulness', val)}
                />
              </div>

              {/* Recommendation */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Would you recommend this expert to others?
                </Label>
                <RadioGroup
                  value={feedback.wouldRecommend}
                  onValueChange={(value) => setFeedback(prev => ({ ...prev, wouldRecommend: value }))}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="rec-yes" />
                    <Label htmlFor="rec-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maybe" id="rec-maybe" />
                    <Label htmlFor="rec-maybe" className="cursor-pointer">Maybe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="rec-no" />
                    <Label htmlFor="rec-no" className="cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Topics Discussed */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  What topics were discussed? (Select all that apply)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {topics.map((topic) => (
                    <div key={topic} className="flex items-center space-x-2">
                      <Checkbox
                        id={topic}
                        checked={feedback.topicsDiscussed.includes(topic)}
                        onCheckedChange={() => handleTopicToggle(topic)}
                      />
                      <Label 
                        htmlFor={topic} 
                        className="text-sm cursor-pointer"
                      >
                        {topic}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Feedback */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="helpful">
                    What was the most helpful aspect of the session?
                  </Label>
                  <Textarea
                    id="helpful"
                    placeholder="Share what you found most valuable..."
                    value={feedback.mostHelpfulAspect}
                    onChange={(e) => setFeedback(prev => ({ ...prev, mostHelpfulAspect: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="improvements">
                    What could be improved?
                  </Label>
                  <Textarea
                    id="improvements"
                    placeholder="Suggestions for improvement..."
                    value={feedback.improvements}
                    onChange={(e) => setFeedback(prev => ({ ...prev, improvements: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comments">
                    Additional Comments (Optional)
                  </Label>
                  <Textarea
                    id="comments"
                    placeholder="Any other thoughts you'd like to share..."
                    value={feedback.additionalComments}
                    onChange={(e) => setFeedback(prev => ({ ...prev, additionalComments: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SessionFeedback;
