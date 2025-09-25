import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, MapPin, Clock, IndianRupee, TrendingUp, Target, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface EducationalPathway {
  id: string;
  current_stage: string;
  target_career: string;
  pathway_title: string;
  pathway_description?: string;
  duration: string;
  total_investment_range?: string;
  difficulty_level: string;
  success_probability?: number;
  steps: Array<{
    step_number: number;
    title: string;
    description: string;
    duration: string;
    cost?: string;
    requirements?: string[];
    resources?: string[];
  }>;
  milestones: Array<{
    milestone: string;
    timeline: string;
    description: string;
  }>;
  alternative_routes: Array<{
    route_name: string;
    description: string;
    benefits: string[];
    drawbacks: string[];
  }>;
  prerequisites: string[];
  career_prospects: Record<string, any>;
  roi_analysis: Record<string, any>;
  is_recommended: boolean;
  priority_order: number;
}

interface EducationalPathwaysProps {
  userStage?: string;
  targetCareer?: string;
}

export const EducationalPathways: React.FC<EducationalPathwaysProps> = ({
  userStage = '10th',
  targetCareer
}) => {
  const [pathways, setPathways] = useState<EducationalPathway[]>([]);
  const [filteredPathways, setFilteredPathways] = useState<EducationalPathway[]>([]);
  const [selectedPathway, setSelectedPathway] = useState<EducationalPathway | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    stage: userStage,
    career: targetCareer || '',
    difficulty: '',
    duration: ''
  });

  useEffect(() => {
    fetchPathways();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pathways, filters]);

  const fetchPathways = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('educational_pathways')
        .select('*')
        .order('priority_order', { ascending: true });

      if (error) throw error;

      const formattedPathways = (data || []).map(pathway => ({
        ...pathway,
        steps: Array.isArray(pathway.steps) ? pathway.steps as any[] : [],
        milestones: Array.isArray(pathway.milestones) ? pathway.milestones as any[] : [],
        alternative_routes: Array.isArray(pathway.alternative_routes) ? pathway.alternative_routes as any[] : [],
        prerequisites: Array.isArray(pathway.prerequisites) ? pathway.prerequisites.map(String) : [],
        career_prospects: (pathway.career_prospects as Record<string, any>) || {},
        roi_analysis: (pathway.roi_analysis as Record<string, any>) || {}
      }));

      setPathways(formattedPathways);
    } catch (error) {
      console.error('Error fetching educational pathways:', error);
      toast.error('Failed to load educational pathways');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...pathways];

    if (filters.stage) {
      filtered = filtered.filter(pathway => pathway.current_stage === filters.stage);
    }

    if (filters.career) {
      filtered = filtered.filter(pathway =>
        pathway.target_career.toLowerCase().includes(filters.career.toLowerCase())
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(pathway => pathway.difficulty_level === filters.difficulty);
    }

    if (filters.duration) {
      filtered = filtered.filter(pathway => pathway.duration === filters.duration);
    }

    setFilteredPathways(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case '10th': return '10th Grade';
      case '12th': return '12th Grade';
      case 'graduate': return 'Graduate';
      case 'postgraduate': return 'Postgraduate';
      default: return stage;
    }
  };

  const handleSelectPathway = (pathway: EducationalPathway) => {
    setSelectedPathway(pathway);
  };

  const handleStartPathway = (pathway: EducationalPathway) => {
    toast.success(`Started tracking ${pathway.pathway_title} pathway`);
    // Would integrate with user's learning path tracking system
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Educational Pathways</h2>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            Discover structured learning paths from your current stage to your dream career
          </p>
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Select value={filters.stage} onValueChange={(value) => setFilters(prev => ({ ...prev, stage: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Current Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Stages</SelectItem>
              <SelectItem value="10th">10th Grade</SelectItem>
              <SelectItem value="12th">12th Grade</SelectItem>
              <SelectItem value="graduate">Graduate</SelectItem>
              <SelectItem value="postgraduate">Postgraduate</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.career} onValueChange={(value) => setFilters(prev => ({ ...prev, career: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Target Career" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Careers</SelectItem>
              <SelectItem value="Software Engineer">Software Engineer</SelectItem>
              <SelectItem value="Data Scientist">Data Scientist</SelectItem>
              <SelectItem value="Doctor">Doctor</SelectItem>
              <SelectItem value="Business Analyst">Business Analyst</SelectItem>
              <SelectItem value="Teacher">Teacher</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.duration} onValueChange={(value) => setFilters(prev => ({ ...prev, duration: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Duration</SelectItem>
              <SelectItem value="1-2 years">1-2 years</SelectItem>
              <SelectItem value="3-4 years">3-4 years</SelectItem>
              <SelectItem value="5-6 years">5-6 years</SelectItem>
              <SelectItem value="7+ years">7+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pathway Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredPathways.map((pathway) => (
          <Card key={pathway.id} 
                className={`cursor-pointer hover:shadow-lg transition-all ${pathway.is_recommended ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleSelectPathway(pathway)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{pathway.pathway_title}</CardTitle>
                {pathway.is_recommended && (
                  <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {getStageLabel(pathway.current_stage)} → {pathway.target_career}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {pathway.duration}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pathway.pathway_description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {pathway.pathway_description}
                </p>
              )}

              <div className="flex gap-2 flex-wrap">
                <Badge className={getDifficultyColor(pathway.difficulty_level)}>
                  {pathway.difficulty_level}
                </Badge>
                {pathway.total_investment_range && (
                  <Badge variant="outline">
                    <IndianRupee className="h-3 w-3 mr-1" />
                    {pathway.total_investment_range}
                  </Badge>
                )}
                {pathway.success_probability && (
                  <Badge variant="outline">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {pathway.success_probability}% success rate
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Progress Steps:</div>
                <div className="text-sm text-muted-foreground">
                  {pathway.steps.length} steps • {pathway.milestones.length} milestones
                </div>
                <Progress value={(1 / pathway.steps.length) * 100} className="h-2" />
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={(e) => {
                  e.stopPropagation();
                  handleStartPathway(pathway);
                }}>
                  Start Journey
                </Button>
                <Button size="sm" variant="outline" onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPathway(pathway);
                }}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPathways.length === 0 && (
        <div className="text-center py-8">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No pathways found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or check back later</p>
        </div>
      )}

      {/* Pathway Detail Modal */}
      <Dialog open={!!selectedPathway} onOpenChange={() => setSelectedPathway(null)}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          {selectedPathway && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedPathway.pathway_title}</span>
                  <div className="flex gap-2">
                    {selectedPathway.is_recommended && (
                      <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                    )}
                    <Badge className={getDifficultyColor(selectedPathway.difficulty_level)}>
                      {selectedPathway.difficulty_level}
                    </Badge>
                  </div>
                </DialogTitle>
                <p className="text-muted-foreground">
                  From {getStageLabel(selectedPathway.current_stage)} to {selectedPathway.target_career}
                </p>
              </DialogHeader>

              <Tabs defaultValue="steps" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="steps">Steps</TabsTrigger>
                  <TabsTrigger value="milestones">Milestones</TabsTrigger>
                  <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
                  <TabsTrigger value="prospects">Career</TabsTrigger>
                  <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="steps" className="space-y-4">
                  <div className="space-y-4">
                    {selectedPathway.steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                            {step.step_number}
                          </div>
                          {index < selectedPathway.steps.length - 1 && (
                            <div className="w-0.5 h-16 bg-muted mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <Card>
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{step.title}</CardTitle>
                                <Badge variant="outline">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {step.duration}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {step.cost && (
                                <div className="flex items-center gap-2 text-sm">
                                  <IndianRupee className="h-4 w-4" />
                                  <span>Estimated Cost: {step.cost}</span>
                                </div>
                              )}
                              
                              {step.requirements && step.requirements.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Requirements:</div>
                                  <div className="space-y-1">
                                    {step.requirements.map((req, reqIndex) => (
                                      <div key={reqIndex} className="flex items-center gap-2 text-sm">
                                        <Target className="h-3 w-3 text-muted-foreground" />
                                        {req}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {step.resources && step.resources.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Resources:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {step.resources.map((resource, resIndex) => (
                                      <Badge key={resIndex} variant="secondary" className="text-xs">
                                        {resource}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="milestones" className="space-y-4">
                  <div className="grid gap-4">
                    {selectedPathway.milestones.map((milestone, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium">{milestone.milestone}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {milestone.description}
                              </div>
                              <Badge variant="outline" className="mt-2">
                                {milestone.timeline}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="alternatives" className="space-y-4">
                  <div className="grid gap-4">
                    {selectedPathway.alternative_routes.map((route, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">{route.route_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{route.description}</p>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                          <div>
                            <div className="text-sm font-medium mb-2 text-green-700">Benefits:</div>
                            <ul className="space-y-1">
                              {route.benefits.map((benefit, bIndex) => (
                                <li key={bIndex} className="text-sm flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-2 text-orange-700">Considerations:</div>
                            <ul className="space-y-1">
                              {route.drawbacks.map((drawback, dIndex) => (
                                <li key={dIndex} className="text-sm flex items-center gap-2">
                                  <ArrowRight className="h-3 w-3 text-orange-600" />
                                  {drawback}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="prospects" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(selectedPathway.career_prospects).map(([key, value]) => (
                      <Card key={key}>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary mb-1">
                              {String(value)}
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {key.replace('_', ' ')}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="roi" className="space-y-4">
                  <div className="grid gap-4">
                    {Object.entries(selectedPathway.roi_analysis).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-lg font-bold text-primary">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleStartPathway(selectedPathway)} className="flex-1">
                  Start This Journey
                </Button>
                <Button variant="outline" onClick={() => setSelectedPathway(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};