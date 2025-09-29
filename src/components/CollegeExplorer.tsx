import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { School, MapPin, Star, IndianRupee, TrendingUp, ExternalLink, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface College {
  id: string;
  name: string;
  location: string;
  state: string;
  college_type: string;
  ranking_nirf?: number;
  ranking_overall?: number;
  establishment_year?: number;
  affiliation?: string;
  accreditation: string[];
  admission_requirements: Record<string, any>;
  entrance_exams: string[];
  fee_structure: Record<string, any>;
  placement_statistics: Record<string, any>;
  facilities: string[];
  courses_offered: string[];
  website_url?: string;
  contact_info: Record<string, any>;
}

interface CollegeExplorerProps {
  targetCareer?: string;
  userEducationLevel?: string;
  userLocation?: string;
}

export const CollegeExplorer: React.FC<CollegeExplorerProps> = ({
  targetCareer,
  userEducationLevel,
  userLocation
}) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    state: '',
    ranking: '',
    feeRange: ''
  });

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [colleges, filters]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('is_active', true)
        .order('ranking_nirf', { ascending: true, nullsFirst: false });

      if (error) throw error;

      const formattedColleges = (data || []).map(college => ({
        ...college,
        accreditation: Array.isArray(college.accreditation) ? college.accreditation.map(String) : [],
        entrance_exams: Array.isArray(college.entrance_exams) ? college.entrance_exams.map(String) : [],
        facilities: Array.isArray(college.facilities) ? college.facilities.map(String) : [],
        courses_offered: Array.isArray(college.courses_offered) ? college.courses_offered.map(String) : [],
        admission_requirements: (college.admission_requirements as Record<string, any>) || {},
        fee_structure: (college.fee_structure as Record<string, any>) || {},
        placement_statistics: (college.placement_statistics as Record<string, any>) || {},
        contact_info: (college.contact_info as Record<string, any>) || {},
        affiliation: college.affiliation || '',
        website_url: college.website_url || ''
      }));

      setColleges(formattedColleges);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      toast.error('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...colleges];

    if (filters.search) {
      filtered = filtered.filter(college =>
        college.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        college.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(college => college.college_type === filters.type);
    }

    if (filters.state) {
      filtered = filtered.filter(college => college.state === filters.state);
    }

    if (filters.ranking) {
      filtered = filtered.filter(college => {
        if (!college.ranking_nirf) return filters.ranking === 'unranked';
        switch (filters.ranking) {
          case 'top50': return college.ranking_nirf <= 50;
          case 'top100': return college.ranking_nirf <= 100;
          case 'top200': return college.ranking_nirf <= 200;
          default: return true;
        }
      });
    }

    setFilteredColleges(filtered);
  };

  const getCollegeTypeColor = (type: string) => {
    switch (type) {
      case 'government': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-blue-100 text-blue-800';
      case 'deemed': return 'bg-purple-100 text-purple-800';
      case 'autonomous': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCollegeSelect = (college: College) => {
    setSelectedCollege(college);
  };

  const handleApplyToCollege = (college: College) => {
    if (college.website_url) {
      window.open(college.website_url, '_blank');
    }
    toast.success(`Opening ${college.name} website for application`);
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
          <School className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">College Explorer</h2>
        </div>
        
        {targetCareer && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              Showing colleges recommended for <strong>{targetCareer}</strong> career path
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Search colleges..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          
          <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="College Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="deemed">Deemed University</SelectItem>
              <SelectItem value="autonomous">Autonomous</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.state} onValueChange={(value) => setFilters(prev => ({ ...prev, state: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All States</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.ranking} onValueChange={(value) => setFilters(prev => ({ ...prev, ranking: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="NIRF Ranking" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Rankings</SelectItem>
              <SelectItem value="top50">Top 50</SelectItem>
              <SelectItem value="top100">Top 100</SelectItem>
              <SelectItem value="top200">Top 200</SelectItem>
              <SelectItem value="unranked">Unranked</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setFilters({ search: '', type: '', state: '', ranking: '', feeRange: '' })}>
            <Filter className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredColleges.map((college) => (
          <Card key={college.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCollegeSelect(college)}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{college.name}</CardTitle>
                {college.ranking_nirf && (
                  <Badge variant="secondary" className="ml-2">
                    #{college.ranking_nirf} NIRF
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {college.location}, {college.state}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge className={getCollegeTypeColor(college.college_type)}>
                {college.college_type.charAt(0).toUpperCase() + college.college_type.slice(1)}
              </Badge>
              
              {college.entrance_exams.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium">Entrance Exams: </span>
                  {college.entrance_exams.slice(0, 2).join(', ')}
                  {college.entrance_exams.length > 2 && '...'}
                </div>
              )}

              {college.fee_structure?.annual_fee && (
                <div className="flex items-center gap-1 text-sm">
                  <IndianRupee className="h-4 w-4" />
                  <span>{college.fee_structure.annual_fee}/year</span>
                </div>
              )}

              {college.placement_statistics?.average_package && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Avg: ₹{college.placement_statistics.average_package} LPA</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredColleges.length === 0 && (
        <div className="text-center py-8">
          <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No colleges found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}

      {/* College Detail Modal */}
      <Dialog open={!!selectedCollege} onOpenChange={() => setSelectedCollege(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedCollege && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedCollege.name}</span>
                  {selectedCollege.ranking_nirf && (
                    <Badge variant="secondary">NIRF Rank #{selectedCollege.ranking_nirf}</Badge>
                  )}
                </DialogTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {selectedCollege.location}, {selectedCollege.state}
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="admission">Admission</TabsTrigger>
                  <TabsTrigger value="placement">Placement</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">College Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>Type: <Badge className={getCollegeTypeColor(selectedCollege.college_type)}>
                          {selectedCollege.college_type}
                        </Badge></div>
                        {selectedCollege.establishment_year && (
                          <div>Established: {selectedCollege.establishment_year}</div>
                        )}
                        {selectedCollege.affiliation && (
                          <div>Affiliation: {selectedCollege.affiliation}</div>
                        )}
                      </div>
                    </div>
                    
                    {selectedCollege.facilities.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Facilities</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedCollege.facilities.map((facility, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedCollege.accreditation.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Accreditation</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedCollege.accreditation.map((acc, index) => (
                          <Badge key={index} variant="secondary">{acc}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="courses" className="space-y-4">
                  <h4 className="font-medium">Available Courses</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {selectedCollege.courses_offered.map((course, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        {course}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="admission" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Entrance Exams</h4>
                      <div className="space-y-2">
                        {selectedCollege.entrance_exams.map((exam, index) => (
                          <Badge key={index} variant="outline">{exam}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Fee Structure</h4>
                      <div className="space-y-2 text-sm">
                        {selectedCollege.fee_structure?.annual_fee && (
                          <div className="flex justify-between">
                            <span>Annual Fee:</span>
                            <span className="font-medium">₹{selectedCollege.fee_structure.annual_fee}</span>
                          </div>
                        )}
                        {selectedCollege.fee_structure?.hostel_fee && (
                          <div className="flex justify-between">
                            <span>Hostel Fee:</span>
                            <span className="font-medium">₹{selectedCollege.fee_structure.hostel_fee}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="placement" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {selectedCollege.placement_statistics?.average_package && (
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{selectedCollege.placement_statistics.average_package} LPA
                        </div>
                        <div className="text-sm text-green-700">Average Package</div>
                      </div>
                    )}
                    {selectedCollege.placement_statistics?.highest_package && (
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          ₹{selectedCollege.placement_statistics.highest_package} LPA
                        </div>
                        <div className="text-sm text-blue-700">Highest Package</div>
                      </div>
                    )}
                    {selectedCollege.placement_statistics?.placement_rate && (
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedCollege.placement_statistics.placement_rate}%
                        </div>
                        <div className="text-sm text-purple-700">Placement Rate</div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleApplyToCollege(selectedCollege)} className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Website
                </Button>
                <Button variant="outline" onClick={() => setSelectedCollege(null)}>
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