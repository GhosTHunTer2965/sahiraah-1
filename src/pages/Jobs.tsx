import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BriefcaseIcon, 
  MapPinIcon, 
  CalendarIcon,
  ExternalLinkIcon,
  FilterIcon,
  SearchIcon,
  BuildingIcon,
  ClockIcon,
  IndianRupeeIcon,
  StarIcon,
  AlertCircleIcon,
  TrendingUpIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";

interface Job {
  id: string;
  title: string;
  company_name: string;
  description: string;
  job_type: string;
  location: string;
  is_remote: boolean;
  is_onsite: boolean;
  salary_range: string;
  required_skills: string[];
  experience_level: string;
  duration: string | null;
  application_deadline: string | null;
  external_url: string | null;
  company_logo_url: string | null;
  is_urgent: boolean;
  is_high_opportunity: boolean;
  is_exclusive: boolean;
  posted_at: string;
}

interface JobApplication {
  id: string;
  job_id: string;
  status: string;
  applied_at: string;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userApplications, setUserApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
    fetchUserApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('posted_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load job listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserApplications(data || []);
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  };

  const applyToJob = async (jobId: string, externalUrl?: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to apply for jobs",
          variant: "destructive",
        });
        return;
      }

      // If there's an external URL, open it
      if (externalUrl) {
        window.open(externalUrl, '_blank');
      }

      // Track the application
      const { error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_id: jobId,
          status: 'applied'
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Applied",
            description: "You have already applied to this position",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Application Submitted",
        description: "Your application has been tracked successfully",
      });

      fetchUserApplications();
    } catch (error) {
      console.error('Error applying to job:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  const hasApplied = (jobId: string) => {
    return userApplications.some(app => app.job_id === jobId);
  };

  const getJobTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'job':
        return 'bg-blue-100 text-blue-800';
      case 'internship':
        return 'bg-green-100 text-green-800';
      case 'part-time':
        return 'bg-yellow-100 text-yellow-800';
      case 'contract':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExperienceBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'entry':
        return 'bg-green-100 text-green-800';
      case 'mid':
        return 'bg-yellow-100 text-yellow-800';
      case 'senior':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.required_skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesJobType = jobTypeFilter === "all" || job.job_type === jobTypeFilter;
    const matchesLocation = locationFilter === "all" || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesExperience = experienceFilter === "all" || job.experience_level === experienceFilter;

    return matchesSearch && matchesJobType && matchesLocation && matchesExperience;
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs & Internships</h1>
          <p className="text-gray-600">
            Discover opportunities from reputable employers and startups
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs, companies, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="job">Full-time Job</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
                </SelectContent>
              </Select>

              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map(job => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {job.company_logo_url && (
                        <img 
                          src={job.company_logo_url} 
                          alt={job.company_name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <BuildingIcon className="h-4 w-4" />
                          <span>{job.company_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getJobTypeBadgeColor(job.job_type)}>
                        {job.job_type}
                      </Badge>
                      <Badge className={getExperienceBadgeColor(job.experience_level)}>
                        {job.experience_level} level
                      </Badge>
                      {job.is_urgent && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircleIcon className="mr-1 h-3 w-3" />
                          Urgent
                        </Badge>
                      )}
                      {job.is_high_opportunity && (
                        <Badge className="bg-orange-100 text-orange-800">
                          <TrendingUpIcon className="mr-1 h-3 w-3" />
                          High Opportunity
                        </Badge>
                      )}
                      {job.is_exclusive && (
                        <Badge className="bg-purple-100 text-purple-800">
                          <StarIcon className="mr-1 h-3 w-3" />
                          Exclusive
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{job.location}</span>
                        {job.is_remote && <span>• Remote</span>}
                      </div>
                      
                      {job.salary_range && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <IndianRupeeIcon className="h-4 w-4" />
                          <span>{job.salary_range}</span>
                        </div>
                      )}

                      {job.duration && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4" />
                          <span>{job.duration}</span>
                        </div>
                      )}
                    </div>

                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {job.required_skills.slice(0, 5).map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.required_skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.required_skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                        {job.application_deadline && (
                          <span>• Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col gap-2">
                    <Button
                      onClick={() => applyToJob(job.id, job.external_url)}
                      disabled={hasApplied(job.id)}
                      className="min-w-[120px]"
                    >
                      {hasApplied(job.id) ? (
                        "Applied"
                      ) : (
                        <>
                          Apply Now
                          {job.external_url && <ExternalLinkIcon className="ml-2 h-4 w-4" />}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms to find more opportunities.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Jobs;