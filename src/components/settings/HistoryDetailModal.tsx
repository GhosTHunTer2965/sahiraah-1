import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenIcon, ExternalLinkIcon, ClockIcon, TagIcon, TrendingUpIcon, FileTextIcon } from "lucide-react";
import { generateCareerReport } from "@/utils/reportGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface HistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    career: string;
    reason?: string;
    timestamp: string;
    roadmap_summary?: string;
    courses?: any;
    tags?: string[];
    links_clicked?: boolean;
    isSelected?: boolean;
  };
}

export const HistoryDetailModal = ({ isOpen, onClose, item }: HistoryDetailModalProps) => {
  const navigate = useNavigate();

  const handleLinkClick = (url: string, title: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    console.log(`Clicked on: ${title} - ${url}`);
  };

  const handleViewReport = async () => {
    try {
      // Fetch user quiz responses to generate report
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: responses } = await supabase
        .from('user_quiz_responses')
        .select('question, answer')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (responses) {
        const userAnswers = responses.reduce((acc, response) => {
          acc[response.question] = response.answer;
          return acc;
        }, {} as Record<string, string>);

        // Create mock career recommendation for report generation
        const mockCareer = {
          title: item.career,
          description: `Complete career path for ${item.career} with comprehensive roadmap and resources`,
          matchPercentage: 85,
          roadmap: item.courses ? {
            beginner: { resources: item.courses.beginner || [] },
            intermediate: { resources: item.courses.intermediate || [] },
            advanced: { resources: item.courses.advanced || [] }
          } : {
            beginner: { resources: [] },
            intermediate: { resources: [] },
            advanced: { resources: [] }
          },
          salaryRange: "Competitive salary based on experience and skills",
          futureOutlook: "Growing field with excellent career prospects"
        };

        const report = generateCareerReport(
          userAnswers, 
          mockCareer, 
          userAnswers["What's your name?"] || "Student"
        );
        
        // Navigate to report page with data
        navigate("/report", { state: { reportData: report } });
        onClose(); // Close the modal
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const renderCourseLevel = (levelName: string, courses: any[]) => {
    if (!courses || courses.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <BookOpenIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No courses available for this level</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center text-blue-900 mb-4">
          <ClockIcon className="h-5 w-5 mr-2" />
          <span className="font-medium">
            {levelName === 'beginner' && 'Foundation Level (2-6 months)'}
            {levelName === 'intermediate' && 'Intermediate Level (6-12 months)'}
            {levelName === 'advanced' && 'Advanced Level (12+ months)'}
          </span>
        </div>
        
        <div className="grid gap-4">
          {courses.map((course: any, idx: number) => (
            <Card key={idx} className="bg-white border border-gray-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">{course.title}</h4>
                    <div className="flex items-center text-sm text-blue-700 mb-2">
                      <BookOpenIcon className="h-4 w-4 mr-1" />
                      <span>Platform: {course.platform}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {levelName.charAt(0).toUpperCase() + levelName.slice(1)} Level
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (course.url) {
                        window.open(course.url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    <ExternalLinkIcon className="h-4 w-4 mr-1" />
                    Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">
                {item.career.includes("Software") && "💻"}
                {item.career.includes("UI/UX") && "🎨"}
                {item.career.includes("Data") && "📊"}
                {item.career.includes("Product") && "🚀"}
                {item.career.includes("Marketing") && "📈"}
                {item.career.includes("Design") && "🎨"}
                {!["Software", "UI/UX", "Data", "Product", "Marketing", "Design"].some(keyword => 
                  item.career.includes(keyword)) && "🌟"}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-blue-900">
                  {item.career}
                </DialogTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {item.isSelected && (
                    <Badge className="bg-green-100 text-green-800">Current Selection</Badge>
                  )}
                  {item.links_clicked && (
                    <Badge className="bg-purple-100 text-purple-800">Links Explored</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewReport}
                className="border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
              >
                <FileTextIcon className="h-4 w-4 mr-1" />
                View Report
              </Button>
            </div>
          </div>
          
          <DialogDescription className="text-blue-700 text-lg">
            Complete career roadmap and learning resources from your quiz results
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <TagIcon className="h-5 w-5 text-blue-700 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">Career Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, idx) => (
                  <Badge key={idx} className="bg-blue-100 text-blue-800">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap Summary */}
          {item.roadmap_summary && (
            <div>
              <div className="flex items-center mb-3">
                <TrendingUpIcon className="h-5 w-5 text-blue-700 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">Learning Roadmap</h3>
              </div>
              <Card className="bg-blue-50 border border-blue-200">
                <CardContent className="p-4">
                  <p className="text-blue-800 leading-relaxed">{item.roadmap_summary}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recommendation Reason */}
          {item.reason && (
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Why This Career Matches You</h3>
              <Card className="bg-yellow-50 border border-yellow-200">
                <CardContent className="p-4">
                  <p className="text-blue-800 leading-relaxed">{item.reason}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Course Roadmap */}
          {item.courses && (
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Complete Learning Path</h3>
              
              {Array.isArray(item.courses) ? (
                // New format: Array of courses with level property
                <Tabs defaultValue="beginner" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 mb-6 h-auto p-1">
                    <TabsTrigger 
                      value="beginner" 
                      className="flex-1 py-3 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
                    >
                      <div className="text-center w-full">
                        <div className="font-medium">Beginner</div>
                        <div className="text-xs opacity-75">Foundation</div>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="intermediate" 
                      className="flex-1 py-3 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
                    >
                      <div className="text-center w-full">
                        <div className="font-medium">Intermediate</div>
                        <div className="text-xs opacity-75">Practical Skills</div>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="advanced" 
                      className="flex-1 py-3 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
                    >
                      <div className="text-center w-full">
                        <div className="font-medium">Advanced</div>
                        <div className="text-xs opacity-75">Mastery</div>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="beginner">
                    {renderCourseLevel('beginner', item.courses.filter((course: any) => course.level === 'beginner'))}
                  </TabsContent>
                  
                  <TabsContent value="intermediate">
                    {renderCourseLevel('intermediate', item.courses.filter((course: any) => course.level === 'intermediate'))}
                  </TabsContent>
                  
                  <TabsContent value="advanced">
                    {renderCourseLevel('advanced', item.courses.filter((course: any) => course.level === 'advanced'))}
                  </TabsContent>
                </Tabs>
              ) : (
                // Legacy format: Object with level keys
                <Tabs defaultValue="beginner" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 mb-6 h-auto p-1">
                    <TabsTrigger 
                      value="beginner" 
                      className="flex-1 py-3 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
                    >
                      <div className="text-center w-full">
                        <div className="font-medium">Beginner</div>
                        <div className="text-xs opacity-75">Foundation</div>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="intermediate" 
                      className="flex-1 py-3 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
                    >
                      <div className="text-center w-full">
                        <div className="font-medium">Intermediate</div>
                        <div className="text-xs opacity-75">Practical Skills</div>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="advanced" 
                      className="flex-1 py-3 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
                    >
                      <div className="text-center w-full">
                        <div className="font-medium">Advanced</div>
                        <div className="text-xs opacity-75">Mastery</div>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="beginner">
                    {renderCourseLevel('beginner', item.courses.beginner || [])}
                  </TabsContent>
                  
                  <TabsContent value="intermediate">
                    {renderCourseLevel('intermediate', item.courses.intermediate || [])}
                  </TabsContent>
                  
                  <TabsContent value="advanced">
                    {renderCourseLevel('advanced', item.courses.advanced || [])}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          {/* Timestamp Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center text-sm text-gray-600">
              <ClockIcon className="h-4 w-4 mr-2" />
              <span>
                Generated on {new Date(item.timestamp).toLocaleString()} • 
                 {item.courses && (Array.isArray(item.courses) ? item.courses.length > 0 : Object.keys(item.courses).length > 0)
                  ? Array.isArray(item.courses) 
                    ? ` ${item.courses.length} total resources`
                    : ` ${Object.values(item.courses).flat().length} total resources`
                  : ' No resources available'
                }
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
