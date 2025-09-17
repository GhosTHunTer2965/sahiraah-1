import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BookOpen, Users, Clock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NSQFQualification {
  id: string;
  level: number;
  title: string;
  description: string;
  sector: string;
  sub_sector: string;
  job_roles: string[];
  entry_requirements: string;
  credit_points: number;
  duration_hours: number;
  is_active: boolean;
}

interface Props {
  onQualificationSelect?: (qualification: NSQFQualification) => void;
  selectedLevel?: number;
  showSelectionMode?: boolean;
}

export default function NSQFQualificationBrowser({ 
  onQualificationSelect, 
  selectedLevel,
  showSelectionMode = false 
}: Props) {
  const [qualifications, setQualifications] = useState<NSQFQualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>(selectedLevel?.toString() || '');
  const [filterSector, setFilterSector] = useState<string>('');

  useEffect(() => {
    fetchQualifications();
  }, []);

  const fetchQualifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nsqf_qualifications')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: true });

      if (error) throw error;
      setQualifications((data || []).map(item => ({
        ...item,
        job_roles: Array.isArray(item.job_roles) ? item.job_roles : []
      })));
    } catch (error) {
      console.error('Error fetching NSQF qualifications:', error);
      toast.error('Failed to load qualifications');
    } finally {
      setLoading(false);
    }
  };

  const filteredQualifications = qualifications.filter(qual => {
    const matchesSearch = !searchQuery || 
      qual.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qual.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qual.sector.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = !filterLevel || qual.level.toString() === filterLevel;
    const matchesSector = !filterSector || qual.sector === filterSector;
    
    return matchesSearch && matchesLevel && matchesSector;
  });

  const uniqueSectors = [...new Set(qualifications.map(q => q.sector))].sort();

  const getLevelColor = (level: number) => {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-orange-100 text-orange-800', 
      'bg-yellow-100 text-yellow-800',
      'bg-green-100 text-green-800',
      'bg-blue-100 text-blue-800',
      'bg-indigo-100 text-indigo-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-gray-100 text-gray-800',
      'bg-slate-100 text-slate-800'
    ];
    return colors[level - 1] || colors[9];
  };

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours} hours`;
    const days = Math.floor(hours / 8);
    const months = Math.floor(days / 30);
    if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search qualifications, sectors, or job roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              {[...Array(10)].map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Level {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSector} onValueChange={setFilterSector}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sectors</SelectItem>
              {uniqueSectors.map(sector => (
                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredQualifications.length} of {qualifications.length} qualifications
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredQualifications.map(qualification => (
          <Card key={qualification.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className={`${getLevelColor(qualification.level)} mb-2`}>
                    NSQF Level {qualification.level}
                  </Badge>
                  <CardTitle className="text-lg leading-tight">
                    {qualification.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {qualification.sector}
                    {qualification.sub_sector && ` • ${qualification.sub_sector}`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {qualification.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Job Roles:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {qualification.job_roles.slice(0, 3).map(role => (
                    <Badge key={role} variant="outline" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                  {qualification.job_roles.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{qualification.job_roles.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">
                      {formatDuration(qualification.duration_hours)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Credits</p>
                    <p className="text-muted-foreground">
                      {qualification.credit_points} points
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Entry Requirements:</span> {qualification.entry_requirements}
                </p>
              </div>

              {showSelectionMode && (
                <Button
                  onClick={() => onQualificationSelect?.(qualification)}
                  className="w-full"
                  size="sm"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Select This Qualification
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQualifications.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No qualifications found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters to find relevant qualifications.
          </p>
        </div>
      )}
    </div>
  );
}