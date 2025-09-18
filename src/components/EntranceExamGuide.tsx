import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Calendar, Clock, Target, TrendingUp, ExternalLink, Users, Award } from 'lucide-react';
import { toast } from 'sonner';

interface EntranceExam {
  id: string;
  exam_name: string;
  exam_type: string;
  conducting_body: string;
  eligibility_criteria: Record<string, any>;
  exam_pattern: Record<string, any>;
  syllabus: string[];
  exam_dates: Array<{ phase: string; date: string; deadline?: string }>;
  application_process: Record<string, any>;
  preparation_timeline: string;
  difficulty_level: string;
  success_rate?: number;
  average_attempts?: number;
  preparation_resources: Array<{ name: string; type: string; url?: string; price?: string }>;
  coaching_centers: Array<{ name: string; location: string; fee_range?: string; rating?: number }>;
}

interface EntranceExamGuideProps {
  targetCareer?: string;
  userEducationLevel?: string;
}

export const EntranceExamGuide: React.FC<EntranceExamGuideProps> = ({
  targetCareer,
  userEducationLevel
}) => {
  const [exams, setExams] = useState<EntranceExam[]>([]);
  const [filteredExams, setFilteredExams] = useState<EntranceExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<EntranceExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    difficulty: '',
    timeline: ''
  });

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [exams, filters]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('entrance_exams')
        .select('*')
        .eq('is_active', true)
        .order('difficulty_level', { ascending: true });

      if (error) throw error;

      const formattedExams = (data || []).map(exam => ({
        ...exam,
        eligibility_criteria: (exam.eligibility_criteria as Record<string, any>) || {},
        exam_pattern: (exam.exam_pattern as Record<string, any>) || {},
        application_process: (exam.application_process as Record<string, any>) || {},
        syllabus: Array.isArray(exam.syllabus) ? exam.syllabus.map(String) : [],
        exam_dates: Array.isArray(exam.exam_dates) ? exam.exam_dates as any[] : [],
        preparation_resources: Array.isArray(exam.preparation_resources) ? exam.preparation_resources as any[] : [],
        coaching_centers: Array.isArray(exam.coaching_centers) ? exam.coaching_centers as any[] : []
      }));

      setExams(formattedExams);
    } catch (error) {
      console.error('Error fetching entrance exams:', error);
      toast.error('Failed to load entrance exams');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...exams];

    if (filters.search) {
      filtered = filtered.filter(exam =>
        exam.exam_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        exam.conducting_body.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(exam => exam.exam_type === filters.type);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(exam => exam.difficulty_level === filters.difficulty);
    }

    if (filters.timeline) {
      filtered = filtered.filter(exam => exam.preparation_timeline === filters.timeline);
    }

    setFilteredExams(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'very_hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'engineering': return 'bg-blue-100 text-blue-800';
      case 'medical': return 'bg-green-100 text-green-800';
      case 'management': return 'bg-purple-100 text-purple-800';
      case 'government': return 'bg-orange-100 text-orange-800';
      case 'graduate': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimelineMonths = (timeline: string) => {
    switch (timeline) {
      case '6_months': return '6 months';
      case '1_year': return '1 year';
      case '2_years': return '2 years';
      default: return timeline;
    }
  };

  const handleCreateStudyPlan = (exam: EntranceExam) => {
    toast.success(`Study plan created for ${exam.exam_name}`);
    // Would integrate with a study planning system
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Entrance Exam Guide</h2>
        </div>
        
        {targetCareer && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              Showing entrance exams relevant for <strong>{targetCareer}</strong> career
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Search exams..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          
          <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Exam Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="management">Management</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="graduate">Graduate Studies</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
              <SelectItem value="very_hard">Very Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.timeline} onValueChange={(value) => setFilters(prev => ({ ...prev, timeline: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Prep Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Duration</SelectItem>
              <SelectItem value="6_months">6 Months</SelectItem>
              <SelectItem value="1_year">1 Year</SelectItem>
              <SelectItem value="2_years">2 Years</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setFilters({ search: '', type: '', difficulty: '', timeline: '' })}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Exam Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExams.map((exam) => (
          <Card key={exam.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedExam(exam)}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{exam.exam_name}</CardTitle>
                <Badge className={getExamTypeColor(exam.exam_type)}>
                  {exam.exam_type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{exam.conducting_body}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Badge className={getDifficultyColor(exam.difficulty_level)}>
                  {exam.difficulty_level.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {getTimelineMonths(exam.preparation_timeline)}
                </Badge>
              </div>

              {exam.success_rate && (
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>{exam.success_rate}% success rate</span>
                </div>
              )}

              {exam.exam_dates.length > 0 && (
                <div className="text-sm">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Next exam: {exam.exam_dates[0]?.date || 'TBA'}
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                {exam.preparation_resources.length} resources • {exam.coaching_centers.length} coaching centers
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No exams found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}

      {/* Exam Detail Modal */}
      <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedExam && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedExam.exam_name}</span>
                  <div className="flex gap-2">
                    <Badge className={getExamTypeColor(selectedExam.exam_type)}>
                      {selectedExam.exam_type}
                    </Badge>
                    <Badge className={getDifficultyColor(selectedExam.difficulty_level)}>
                      {selectedExam.difficulty_level.replace('_', ' ')}
                    </Badge>
                  </div>
                </DialogTitle>
                <p className="text-muted-foreground">Conducted by {selectedExam.conducting_body}</p>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="pattern">Pattern</TabsTrigger>
                  <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="coaching">Coaching</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Exam Statistics</h4>
                        <div className="space-y-2 text-sm">
                          {selectedExam.success_rate && (
                            <div className="flex justify-between">
                              <span>Success Rate:</span>
                              <span className="font-medium text-green-600">{selectedExam.success_rate}%</span>
                            </div>
                          )}
                          {selectedExam.average_attempts && (
                            <div className="flex justify-between">
                              <span>Avg. Attempts:</span>
                              <span className="font-medium">{selectedExam.average_attempts}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Prep Time:</span>
                            <span className="font-medium">{getTimelineMonths(selectedExam.preparation_timeline)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Important Dates</h4>
                        <div className="space-y-2">
                          {selectedExam.exam_dates.map((dateInfo, index) => (
                            <div key={index} className="p-3 bg-muted rounded-lg">
                              <div className="font-medium text-sm">{dateInfo.phase}</div>
                              <div className="text-sm text-muted-foreground">{dateInfo.date}</div>
                              {dateInfo.deadline && (
                                <div className="text-xs text-red-600">Deadline: {dateInfo.deadline}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Eligibility Criteria</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(selectedExam.eligibility_criteria).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pattern" className="space-y-4">
                  <h4 className="font-medium">Exam Pattern</h4>
                  <div className="grid gap-4">
                    {Object.entries(selectedExam.exam_pattern).map(([key, value]) => (
                      <div key={key} className="p-4 bg-muted rounded-lg">
                        <div className="font-medium capitalize mb-1">{key.replace('_', ' ')}</div>
                        <div className="text-sm text-muted-foreground">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="syllabus" className="space-y-4">
                  <h4 className="font-medium">Syllabus Topics</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {selectedExam.syllabus.map((topic, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm">{topic}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="space-y-4">
                  <h4 className="font-medium">Preparation Resources</h4>
                  <div className="grid gap-3">
                    {selectedExam.preparation_resources.map((resource, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{resource.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">{resource.type}</div>
                            {resource.price && (
                              <div className="text-sm text-green-600 font-medium">{resource.price}</div>
                            )}
                          </div>
                          {resource.url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="coaching" className="space-y-4">
                  <h4 className="font-medium">Coaching Centers</h4>
                  <div className="grid gap-3">
                    {selectedExam.coaching_centers.map((center, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{center.name}</div>
                            <div className="text-sm text-muted-foreground">{center.location}</div>
                            {center.fee_range && (
                              <div className="text-sm text-blue-600">{center.fee_range}</div>
                            )}
                          </div>
                          {center.rating && (
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium">{center.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleCreateStudyPlan(selectedExam)} className="flex-1">
                  Create Study Plan
                </Button>
                <Button variant="outline" onClick={() => setSelectedExam(null)}>
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