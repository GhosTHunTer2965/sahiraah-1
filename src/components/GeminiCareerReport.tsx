import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUpIcon, 
  BrainIcon, 
  RocketIcon, 
  BookOpenIcon, 
  TargetIcon,
  StarIcon,
  GraduationCapIcon,
  IndianRupeeIcon,
  ArrowRightIcon,
  DownloadIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  ExternalLinkIcon
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CareerRecommendation {
  title: string;
  description: string;
  matchScore: number;
  growthPotential: string;
  salaryRange: string;
  keySkills: string[];
  educationPath: string;
  freeResources: {
    beginner: Array<{title: string, url: string, platform: string, duration: string}>;
    intermediate: Array<{title: string, url: string, platform: string, duration: string}>;
    advanced: Array<{title: string, url: string, platform: string, duration: string}>;
  };
}

interface AnalysisData {
  strengths: string[];
  areasForImprovement: string[];
  careerRecommendations: CareerRecommendation[];
  personalityInsights: string;
  recommendedNextSteps: string[];
}

interface Props {
  sessionId: string;
  onRetake: () => void;
}

const GeminiCareerReport = ({ sessionId, onRetake }: Props) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalysisData();
  }, [sessionId]);

  const storeReportInHistory = async (sessionData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Extract all courses from career recommendations
      const allCourses: any[] = [];
      if (Array.isArray(sessionData.career_recommendations)) {
        sessionData.career_recommendations.forEach((rec: any) => {
          if (rec.freeResources) {
            ['beginner', 'intermediate', 'advanced'].forEach(level => {
              if (Array.isArray(rec.freeResources[level])) {
                rec.freeResources[level].forEach((course: any) => {
                  allCourses.push({
                    ...course,
                    level,
                    careerPath: rec.title
                  });
                });
              }
            });
          }
        });
      }

      // Store comprehensive data in user_career_history for each career recommendation
      for (const recommendation of sessionData.career_recommendations || []) {
        await supabase.from('user_career_history').insert({
          user_id: user.id,
          session_id: sessionId,
          career: recommendation.title || 'Career Assessment',
          strengths: sessionData.strengths,
          weaknesses: sessionData.weaknesses,
          improvement_areas: sessionData.weaknesses,
          report_data: {
            ...sessionData,
            full_report: true,
            recommendation_details: recommendation,
            personality_insights: "Based on your responses, you demonstrate strong analytical thinking and a systematic approach to problem-solving.",
            next_steps: ["Start with beginner-level courses", "Build a portfolio of projects", "Network with industry professionals"]
          },
          courses: recommendation.freeResources ? [
            ...(recommendation.freeResources.beginner || []).map((course: any) => ({ ...course, level: 'beginner', careerPath: recommendation.title })),
            ...(recommendation.freeResources.intermediate || []).map((course: any) => ({ ...course, level: 'intermediate', careerPath: recommendation.title })),
            ...(recommendation.freeResources.advanced || []).map((course: any) => ({ ...course, level: 'advanced', careerPath: recommendation.title }))
          ] : [],
          tags: [recommendation.title, ...(recommendation.keySkills || [])],
          roadmap_summary: `Career: ${recommendation.title}. Match Score: ${recommendation.matchScore}%. Growth: ${recommendation.growthPotential}. Salary: ${recommendation.salaryRange}`,
          reason: recommendation.description || 'AI-generated career recommendation based on assessment responses'
        });
      }

      console.log('Successfully stored all career recommendations and courses in history');
    } catch (error) {
      console.error('Error storing report in history:', error);
    }
  };

  const fetchAnalysisData = async () => {
    try {
      setError(null);
      const { data: sessionData, error } = await supabase
        .from('user_quiz_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      if (sessionData) {
        setStudentName(sessionData.student_name || "");
        setEducationLevel(sessionData.education_level || "");
        
        const strengths: string[] = Array.isArray(sessionData.strengths) 
          ? sessionData.strengths.filter(s => typeof s === 'string')
          : [];
        
        const weaknesses: string[] = Array.isArray(sessionData.weaknesses) 
          ? sessionData.weaknesses.filter(w => typeof w === 'string')
          : [];
        
        let careerRecommendations: CareerRecommendation[] = [];
        
        // Store in history when report is viewed
        await storeReportInHistory(sessionData);
        
        if (Array.isArray(sessionData.career_recommendations)) {
          careerRecommendations = sessionData.career_recommendations
            .map((rec: any) => {
              if (typeof rec === 'object' && rec !== null) {
                return {
                  title: rec.title || 'Career Option',
                  description: rec.description || 'Career description not available',
                  matchScore: typeof rec.matchScore === 'number' ? rec.matchScore : 85,
                  growthPotential: rec.growthPotential || 'High growth potential',
                  salaryRange: rec.salaryRange || 'Competitive salary',
                  keySkills: Array.isArray(rec.keySkills) ? rec.keySkills : ['Communication', 'Problem Solving'],
                  educationPath: rec.educationPath || 'Relevant education required',
                  freeResources: rec.freeResources || {
                    beginner: [],
                    intermediate: [],
                    advanced: []
                  }
                };
              }
              return null;
            })
            .filter((rec: CareerRecommendation | null): rec is CareerRecommendation => rec !== null);
        }
        
        if (careerRecommendations.length === 0) {
          careerRecommendations = [
            {
              title: "Technology Professional",
              description: "Based on your responses, you show strong analytical skills suitable for technology roles.",
              matchScore: 85,
              growthPotential: "Excellent growth opportunities in India's expanding tech sector",
              salaryRange: "₹6-25 LPA",
              keySkills: ["Problem Solving", "Technical Skills", "Communication"],
              educationPath: "Computer Science, Engineering, or related certifications",
              freeResources: {
                beginner: [
                  {title: "HTML & CSS Basics", url: "https://www.freecodecamp.org/learn/responsive-web-design/", platform: "FreeCodeCamp", duration: "4 weeks"}
                ],
                intermediate: [
                  {title: "JavaScript Complete Course", url: "https://www.youtube.com/watch?v=hdI2bqOjy3c", platform: "YouTube", duration: "8 weeks"}
                ],
                advanced: [
                  {title: "React.js Tutorial", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", platform: "YouTube", duration: "12 weeks"}
                ]
              }
            }
          ];
        }
        
        const analysis: AnalysisData = {
          strengths: strengths.length > 0 ? strengths : ["Problem-solving", "Communication", "Adaptability"],
          areasForImprovement: weaknesses.length > 0 ? weaknesses : ["Technical skills", "Leadership development"],
          careerRecommendations,
          personalityInsights: "Based on your responses, you demonstrate strong analytical thinking and a systematic approach to problem-solving.",
          recommendedNextSteps: ["Start with beginner-level courses", "Build a portfolio of projects", "Network with industry professionals"]
        };
        
        setAnalysisData(analysis);
      }
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      setError('Could not load your career recommendations.');
      toast({
        title: "Error Loading Data",
        description: "Could not load your career recommendations. Please try retaking the quiz.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    setDownloadingPDF(true);
    try {
      const element = document.getElementById('career-report-content');
      if (!element) throw new Error('Report content not found');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${studentName || 'Student'}_Career_Report.pdf`);
      
      toast({
        title: "Report Downloaded",
        description: "Your career report has been saved as a PDF.",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <Card>
            <CardContent className="pt-6">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Incomplete</h3>
            <p className="text-gray-600 mb-4">
              {error || "No analysis data available. Please retake the quiz to get your personalized recommendations."}
            </p>
            <Button onClick={onRetake} className="bg-blue-600 hover:bg-blue-700">
              Retake Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" id="career-report-content">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <BrainIcon className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl font-bold mb-2">AI Career Guidance Report</h1>
            <p className="text-xl opacity-90">{studentName}</p>
            <p className="text-lg opacity-75">{educationLevel}</p>
            <p className="text-sm opacity-60 mt-2">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button onClick={downloadReport} disabled={downloadingPDF} className="bg-green-600 hover:bg-green-700">
          {downloadingPDF ? "Downloading..." : "Download PDF Report"}
          <DownloadIcon className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onRetake}>
          <RefreshCwIcon className="mr-2 h-4 w-4" />
          Retake Assessment
        </Button>
      </div>

      {/* Personality Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BrainIcon className="mr-2 h-5 w-5 text-purple-600" />
            Personality Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{analysisData.personalityInsights}</p>
        </CardContent>
      </Card>

      {/* Strengths and Areas for Improvement */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <StarIcon className="mr-2 h-5 w-5" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisData.strengths.map((strength, index) => (
                <Badge key={index} variant="secondary" className="mr-2 mb-2 bg-green-100 text-green-800">
                  {strength}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <TargetIcon className="mr-2 h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisData.areasForImprovement.map((area, index) => (
                <Badge key={index} variant="outline" className="mr-2 mb-2 border-orange-300 text-orange-800">
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RocketIcon className="mr-2 h-5 w-5 text-blue-600" />
            Top 5 Career Recommendations
          </CardTitle>
          <CardDescription>
            Based on your responses, here are the careers that best match your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analysisData.careerRecommendations.map((career, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{career.title}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{career.matchScore}%</div>
                      <div className="text-sm text-gray-500">Match</div>
                    </div>
                  </div>
                  
                  <Progress value={career.matchScore} className="mb-4" />
                  
                  <p className="text-gray-700 mb-4">{career.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <IndianRupeeIcon className="mr-1 h-4 w-4" />
                        Salary Range
                      </h4>
                      <p className="text-gray-700">{career.salaryRange}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <TrendingUpIcon className="mr-1 h-4 w-4" />
                        Growth Potential
                      </h4>
                      <p className="text-gray-700">{career.growthPotential}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Key Skills Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {career.keySkills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <GraduationCapIcon className="mr-1 h-4 w-4" />
                      Education Path
                    </h4>
                    <p className="text-gray-700">{career.educationPath}</p>
                  </div>

                  {/* Free Learning Resources */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <BookOpenIcon className="mr-1 h-4 w-4" />
                      Free Learning Resources
                    </h4>
                    <Tabs defaultValue="beginner">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="beginner">Beginner</TabsTrigger>
                        <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                      </TabsList>
                      
                      {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                        <TabsContent key={level} value={level} className="mt-4">
                          <div className="space-y-3">
                            {career.freeResources[level]?.length > 0 ? (
                              career.freeResources[level].map((resource, resourceIndex) => (
                                <div key={resourceIndex} className="border rounded-lg p-3 hover:bg-gray-50">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-900">{resource.title}</h5>
                                      <p className="text-sm text-gray-600">{resource.platform} • {resource.duration}</p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(resource.url, '_blank')}
                                    >
                                      <ExternalLinkIcon className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-center py-4">No resources available for this level</p>
                            )}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowRightIcon className="mr-2 h-5 w-5 text-green-600" />
            Recommended Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            {analysisData.recommendedNextSteps.map((step, index) => (
              <li key={index} className="text-gray-700">{step}</li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeminiCareerReport;