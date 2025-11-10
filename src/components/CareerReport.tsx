import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BookOpenIcon, TrendingUpIcon, SparklesIcon, DownloadIcon, FileTextIcon, StarIcon, AlertTriangleIcon, ClockIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface SkillScore {
  skill: string;
  score: number;
  description: string;
}

interface CareerReportData {
  studentName: string;
  career: string;
  description: string;
  matchPercentage: number;
  strengths: string[];
  weaknesses: string[];
  skillScores: SkillScore[];
  roadmap: {
    beginner: { 
      title: string;
      duration: string;
      resources: { title: string; link: string; platform: string; estimatedTime: string }[] 
    };
    intermediate: { 
      title: string;
      duration: string;
      resources: { title: string; link: string; platform: string; estimatedTime: string }[] 
    };
    advanced: { 
      title: string;
      duration: string;
      resources: { title: string; link: string; platform: string; estimatedTime: string }[] 
    };
  };
  totalEstimatedTime: string;
  salaryRange: string;
  futureOutlook: string;
  generatedAt: string;
}

interface CareerReportProps {
  reportData: CareerReportData;
  onClose: () => void;
  onDownloadPDF: () => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const CareerReport = ({ reportData, onClose, onDownloadPDF }: CareerReportProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const reportElement = document.getElementById('career-report-content');
      if (!reportElement) {
        throw new Error('Report content not found');
      }

      // Create canvas from the report content
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add the image to PDF
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Add footer with branding
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text('Powered by SahiRaah AI Career Guidance', 105, 285, { align: 'center' });
        pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
      }

      // Save the PDF
      pdf.save(`${reportData.studentName}_Career_Report_${reportData.career.replace(/\s+/g, '_')}.pdf`);
      
      toast({
        title: "PDF Downloaded Successfully!",
        description: "Your career report has been saved to your downloads folder.",
      });

      onDownloadPDF();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-blue-200 rounded-lg shadow-lg">
          <p className="font-semibold text-blue-900">{data.skill}</p>
          <p className="text-blue-700">Score: {data.score}/10</p>
          <p className="text-sm text-gray-600 mt-1">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="container mx-auto max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-4 pt-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🎯</div>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Career Report</h1>
              <p className="text-blue-700">Personalized AI-Generated Career Guidance</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold"
            >
              {isGeneratingPDF ? (
                <>Generating PDF...</>
              ) : (
                <>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close Report
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <div id="career-report-content" className="bg-white shadow-lg p-4 md:p-6">
          {/* Student Info Header */}
          <div className="text-center mb-8 border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              Career Report for {reportData.studentName}
            </h2>
            <div className="flex items-center justify-center space-x-4">
              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                {reportData.matchPercentage}% Career Match
              </Badge>
              <Badge variant="outline" className="text-blue-700">
                Generated: {new Date(reportData.generatedAt).toLocaleDateString()}
              </Badge>
            </div>
          </div>

          {/* Career Overview */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {reportData.career.includes("Software") && "💻"}
                {reportData.career.includes("Data") && "📊"}
                {reportData.career.includes("Design") && "🎨"}
                {reportData.career.includes("Marketing") && "📈"}
                {!["Software", "Data", "Design", "Marketing"].some(keyword => 
                  reportData.career.includes(keyword)) && "🌟"}
              </div>
              <h3 className="text-3xl font-bold text-blue-900 mb-3">{reportData.career}</h3>
              <p className="text-lg text-blue-700 max-w-2xl mx-auto">{reportData.description}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-green-600 text-2xl mb-2">💰</div>
                  <h4 className="font-semibold text-blue-900">Salary Range</h4>
                  <p className="text-sm text-blue-700">{reportData.salaryRange}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-blue-600 text-2xl mb-2">⏱️</div>
                  <h4 className="font-semibold text-blue-900">Learning Time</h4>
                  <p className="text-sm text-blue-700">{reportData.totalEstimatedTime}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-purple-600 text-2xl mb-2">🚀</div>
                  <h4 className="font-semibold text-blue-900">Future Outlook</h4>
                  <p className="text-sm text-blue-700">{reportData.futureOutlook}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Skills Analysis</TabsTrigger>
              <TabsTrigger value="strengths">Strengths & Areas</TabsTrigger>
              <TabsTrigger value="roadmap">Learning Roadmap</TabsTrigger>
              <TabsTrigger value="resources">Courses & Resources</TabsTrigger>
            </TabsList>

            

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-900">Your Skills Distribution</CardTitle>
                  <CardDescription>
                    Based on your responses, here's how you score across key areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Bar Chart */}
                    <div>
                      <h4 className="text-lg font-semibold text-blue-900 mb-4">Skills Breakdown</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.skillScores}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="skill" 
                            tick={{ fontSize: 12, fill: '#1E40AF' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            domain={[0, 10]}
                            tick={{ fontSize: 12, fill: '#1E40AF' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div>
                      <h4 className="text-lg font-semibold text-blue-900 mb-4">Skills Distribution</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={reportData.skillScores}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="score"
                            label={({ skill, score }) => `${skill}: ${score}`}
                          >
                            {reportData.skillScores.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strengths" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <StarIcon className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-green-800">Your Strengths</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportData.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-800 font-medium">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <TrendingUpIcon className="h-5 w-5 text-orange-600" />
                      <CardTitle className="text-orange-800">Growth Areas</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportData.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-orange-800 font-medium">{weakness}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-700 text-sm">
                        💡 These areas represent opportunities for growth. Our recommended courses will help you develop these skills!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="roadmap" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-900">Your Learning Journey</CardTitle>
                  <CardDescription>
                    A step-by-step path to mastering {reportData.career}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Beginner */}
                    <div className="relative">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-900 font-bold text-sm">1</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-blue-900">{reportData.roadmap.beginner.title}</h4>
                          <p className="text-blue-700 text-sm">{reportData.roadmap.beginner.duration}</p>
                        </div>
                      </div>
                      <div className="ml-11 p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-800 text-sm mb-2">
                          Build foundational knowledge and get comfortable with basic concepts.
                        </p>
                        <div className="text-xs text-blue-600">
                          {reportData.roadmap.beginner.resources.length} courses available
                        </div>
                      </div>
                    </div>

                    {/* Intermediate */}
                    <div className="relative">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-900 font-bold text-sm">2</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-blue-900">{reportData.roadmap.intermediate.title}</h4>
                          <p className="text-blue-700 text-sm">{reportData.roadmap.intermediate.duration}</p>
                        </div>
                      </div>
                      <div className="ml-11 p-4 bg-green-50 rounded-lg">
                        <p className="text-green-800 text-sm mb-2">
                          Apply your knowledge through practical projects and real-world scenarios.
                        </p>
                        <div className="text-xs text-green-600">
                          {reportData.roadmap.intermediate.resources.length} courses available
                        </div>
                      </div>
                    </div>

                    {/* Advanced */}
                    <div className="relative">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-purple-900 font-bold text-sm">3</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-blue-900">{reportData.roadmap.advanced.title}</h4>
                          <p className="text-blue-700 text-sm">{reportData.roadmap.advanced.duration}</p>
                        </div>
                      </div>
                      <div className="ml-11 p-4 bg-purple-50 rounded-lg">
                        <p className="text-purple-800 text-sm mb-2">
                          Master advanced techniques and become ready for professional opportunities.
                        </p>
                        <div className="text-xs text-purple-600">
                          {reportData.roadmap.advanced.resources.length} courses available
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <div className="space-y-6">
                {/* Beginner Resources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-900">🟢 Beginner Level</CardTitle>
                    <CardDescription>{reportData.roadmap.beginner.duration}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {reportData.roadmap.beginner.resources.map((resource, idx) => (
                        <div key={idx} className="border rounded-lg p-4 hover:bg-blue-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-blue-900">{resource.title}</h4>
                              <div className="flex items-center space-x-2 text-sm text-blue-700 mt-1">
                                <BookOpenIcon className="h-4 w-4" />
                                <span>Platform: {resource.platform}</span>
                                <ClockIcon className="h-4 w-4 ml-2" />
                                <span>{resource.estimatedTime}</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(resource.link, '_blank')}
                            >
                              <FileTextIcon className="h-4 w-4 mr-1" />
                              Access
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Intermediate Resources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-900">🟡 Intermediate Level</CardTitle>
                    <CardDescription>{reportData.roadmap.intermediate.duration}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {reportData.roadmap.intermediate.resources.map((resource, idx) => (
                        <div key={idx} className="border rounded-lg p-4 hover:bg-blue-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-blue-900">{resource.title}</h4>
                              <div className="flex items-center space-x-2 text-sm text-blue-700 mt-1">
                                <BookOpenIcon className="h-4 w-4" />
                                <span>Platform: {resource.platform}</span>
                                <ClockIcon className="h-4 w-4 ml-2" />
                                <span>{resource.estimatedTime}</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(resource.link, '_blank')}
                            >
                              <FileTextIcon className="h-4 w-4 mr-1" />
                              Access
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Resources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-900">🔴 Advanced Level</CardTitle>
                    <CardDescription>{reportData.roadmap.advanced.duration}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {reportData.roadmap.advanced.resources.map((resource, idx) => (
                        <div key={idx} className="border rounded-lg p-4 hover:bg-blue-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-blue-900">{resource.title}</h4>
                              <div className="flex items-center space-x-2 text-sm text-blue-700 mt-1">
                                <BookOpenIcon className="h-4 w-4" />
                                <span>Platform: {resource.platform}</span>
                                <ClockIcon className="h-4 w-4 ml-2" />
                                <span>{resource.estimatedTime}</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(resource.link, '_blank')}
                            >
                              <FileTextIcon className="h-4 w-4 mr-1" />
                              Access
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
