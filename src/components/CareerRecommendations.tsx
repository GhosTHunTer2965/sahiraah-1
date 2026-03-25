import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BookOpenIcon, TrendingUpIcon, SparklesIcon, CheckCircleIcon, ExternalLinkIcon, RotateCcwIcon, FileTextIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CareerGuideDetail from "./CareerGuideDetail";
import { generateCareerReport } from "@/utils/reportGenerator";
import { CareerReport } from "./CareerReport";

interface CareerRecommendationsProps {
  userAnswers: Record<string, string>;
  onRetake: () => void;
}

interface CareerRecommendation {
  title: string;
  description: string;
  matchPercentage: number;
  reason: string;
  roles: string[];
  indianContext: string;
  skills: string[];
  salaryRange: string;
  futureOutlook: string;
  roadmap: {
    beginner: { 
      resources: { title: string; link: string; platform: string; estimatedTime: string }[] 
    };
    intermediate: { 
      resources: { title: string; link: string; platform: string; estimatedTime: string }[] 
    };
    advanced: { 
      resources: { title: string; link: string; platform: string; estimatedTime: string }[] 
    };
  };
  timeline: { 
    beginner: string; 
    intermediate: string; 
    advanced: string; 
  };
  tags: string[];
}

const CareerRecommendations = ({ userAnswers, onRetake }: CareerRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState<CareerRecommendation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [savedCareers, setSavedCareers] = useState<Set<string>>(new Set());
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    generateRecommendations();
  }, [userAnswers]);

  const storeCareerHistory = async (career: CareerRecommendation, isSelected: boolean = false) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error("No authenticated user found");
        return;
      }

      // Prepare the courses data in the format expected by the database
      const coursesData = {
        beginner: career.roadmap.beginner.resources,
        intermediate: career.roadmap.intermediate.resources,
        advanced: career.roadmap.advanced.resources
      };

      // Create roadmap summary
      const roadmapSummary = `Beginner (${career.timeline.beginner}): Focus on foundational skills. Intermediate (${career.timeline.intermediate}): Build practical experience. Advanced (${career.timeline.advanced}): Master specialized techniques and lead projects.`;

      const { error } = await supabase
        .from('user_career_history')
        .insert({
          user_id: session.user.id,
          career: career.title,
          reason: career.reason,
          roadmap_summary: roadmapSummary,
          courses: coursesData,
          tags: career.tags,
          is_selected: isSelected,
          links_clicked: false
        });

      if (error) {
        console.error("Error storing career history:", error);
        throw error;
      }

      console.log("Career history stored successfully:", career.title);
    } catch (error) {
      console.error("Failed to store career history:", error);
    }
  };

  const generateRecommendations = () => {
    setLoading(true);
    
    // Enhanced AI logic based on user answers
    const careers: CareerRecommendation[] = [];
    
    // Analyze user interests and generate relevant recommendations
    const interests = Object.values(userAnswers).join(' ').toLowerCase();
    const educationLevel = userAnswers["What is your current education level?"] || "";
    const techInterest = userAnswers["How excited are you about learning cutting-edge technologies?"] || "";
    const projectType = userAnswers["What kind of projects excite you the most?"] || "";
    const workStyle = userAnswers["In which environment do you learn and work best?"] || "";
    
    // Technology-focused careers
    if (interests.includes("technology") || interests.includes("coding") || interests.includes("computer") || 
        techInterest.includes("Extremely excited") || techInterest.includes("Very interested") ||
        projectType.includes("Technology and coding")) {
      
      careers.push({
        title: "Software Developer",
        description: "Create innovative software solutions and applications that solve real-world problems",
        matchPercentage: 92,
        reason: "Your strong interest in technology and coding projects aligns perfectly with software development. Your analytical thinking and problem-solving approach are key skills for this field.",
        roles: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile App Developer"],
        indianContext: "India's IT sector contributes 8% to GDP with over 4.5 million professionals. Growing demand in fintech, edtech, and digital transformation.",
        skills: ["Programming Languages", "Problem Solving", "System Design", "Database Management", "Version Control"],
        salaryRange: "₹3-15 LPA (Entry to Mid-level), ₹15-50+ LPA (Senior/Lead)",
        futureOutlook: "Excellent growth prospects with emerging technologies like AI, blockchain, and cloud computing driving demand.",
        roadmap: {
          beginner: {
            resources: [
              { title: "HTML, CSS & JavaScript Fundamentals", link: "https://www.freecodecamp.org/learn/responsive-web-design/", platform: "FreeCodeCamp", estimatedTime: "4-6 weeks" },
              { title: "CS50's Introduction to Python", link: "https://cs50.harvard.edu/python/", platform: "Harvard CS50", estimatedTime: "6-8 weeks" },
              { title: "Git & GitHub Tutorial", link: "https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/GitHub", platform: "MDN Web Docs", estimatedTime: "2-3 weeks" }
            ]
          },
          intermediate: {
            resources: [
              { title: "React.js Official Docs", link: "https://react.dev/learn", platform: "React Docs", estimatedTime: "8-12 weeks" },
              { title: "Node.js API Development", link: "https://www.freecodecamp.org/learn/back-end-development-and-apis/", platform: "FreeCodeCamp", estimatedTime: "6-10 weeks" },
              { title: "Database Design & SQL", link: "https://www.khanacademy.org/computing/computer-programming/sql", platform: "Khan Academy", estimatedTime: "4-6 weeks" }
            ]
          },
          advanced: {
            resources: [
              { title: "System Design Essentials", link: "https://bytebytego.com/", platform: "ByteByteGo", estimatedTime: "12-16 weeks" },
              { title: "Cloud Computing with AWS", link: "https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials", platform: "AWS Skill Builder", estimatedTime: "16-20 weeks" },
              { title: "Advanced React Architecture", link: "https://react.dev/reference/react", platform: "React Docs", estimatedTime: "8-12 weeks" }
            ]
          }
        },
        timeline: {
          beginner: "3-6 months",
          intermediate: "6-12 months", 
          advanced: "12+ months"
        },
        tags: ["Technology", "Programming", "Software", "Problem Solving", "Innovation"]
      });
    }

    // Creative and Design careers
    if (interests.includes("creative") || interests.includes("design") || interests.includes("art") ||
        projectType.includes("Creative and design")) {
      
      careers.push({
        title: "UI/UX Designer",
        description: "Design intuitive and beautiful user experiences for digital products and applications",
        matchPercentage: 88,
        reason: "Your creative mindset and interest in design projects make you well-suited for UI/UX design. Your collaborative approach is valuable in design teams.",
        roles: ["UI Designer", "UX Designer", "Product Designer", "Interaction Designer"],
        indianContext: "Growing demand in Indian startups and tech companies. Average 25% salary growth year-over-year in design roles.",
        skills: ["Design Thinking", "User Research", "Prototyping", "Visual Design", "Interaction Design"],
        salaryRange: "₹2.5-12 LPA (Entry to Mid-level), ₹12-30+ LPA (Senior/Lead)",
        futureOutlook: "High demand as companies prioritize user experience. Opportunities in AR/VR and voice interface design.",
        roadmap: {
          beginner: {
            resources: [
              { title: "Design Thinking Fundamentals", link: "https://www.coursera.org/learn/uva-darden-design-thinking-fundamentals", platform: "Coursera", estimatedTime: "4-6 weeks" },
              { title: "Figma UI Design Tutorial", link: "https://www.youtube.com/watch?v=jwMmCTEEnqw", platform: "FreeCodeCamp", estimatedTime: "2-3 weeks" },
              { title: "Google UX Design Certificate HQ", link: "https://grow.google/certificates/ux-design/", platform: "Google", estimatedTime: "6-8 weeks" }
            ]
          },
          intermediate: {
            resources: [
              { title: "Figma Official Docs", link: "https://help.figma.com/hc/en-us/categories/360002042553-Figma-design", platform: "Figma", estimatedTime: "8-12 weeks" },
              { title: "User Research Methods", link: "https://www.nngroup.com/articles/which-ux-research-methods/", platform: "Nielsen Norman Group", estimatedTime: "6-10 weeks" },
              { title: "Prototyping Principles", link: "https://help.figma.com/hc/en-us/sections/360006764514-Prototyping", platform: "Figma", estimatedTime: "4-6 weeks" }
            ]
          },
          advanced: {
            resources: [
              { title: "Design Systems 101", link: "https://www.nngroup.com/articles/design-systems-101/", platform: "Nielsen Norman Group", estimatedTime: "12-16 weeks" },
              { title: "Advanced UX Strategy", link: "https://www.nngroup.com/courses/ux-strategy/", platform: "Nielsen Norman Group", estimatedTime: "16-20 weeks" },
              { title: "Design Leadership & Management", link: "https://www.designbetter.co/design-leadership-handbook", platform: "InVision", estimatedTime: "8-12 weeks" }
            ]
          }
        },
        timeline: {
          beginner: "2-4 months",
          intermediate: "4-8 months",
          advanced: "8+ months"
        },
        tags: ["Design", "Creativity", "User Experience", "Visual Design", "Technology"]
      });
    }

    // Data and Analytics careers
    if (interests.includes("data") || interests.includes("analysis") || interests.includes("patterns") ||
        projectType.includes("Research and analysis")) {
      
      careers.push({
        title: "Data Scientist",
        description: "Extract insights from data to drive business decisions and solve complex problems",
        matchPercentage: 85,
        reason: "Your analytical thinking and interest in finding patterns makes data science an excellent fit. Your problem-solving approach is crucial for data analysis.",
        roles: ["Data Analyst", "Data Scientist", "Machine Learning Engineer", "Business Intelligence Analyst"],
        indianContext: "India is becoming a global hub for data science with 50% growth in job opportunities. High demand in banking, e-commerce, and healthcare.",
        skills: ["Statistics", "Python/R Programming", "Machine Learning", "Data Visualization", "SQL"],
        salaryRange: "₹4-18 LPA (Entry to Mid-level), ₹18-60+ LPA (Senior/Lead)",
        futureOutlook: "Explosive growth expected with AI and machine learning adoption across industries.",
        roadmap: {
          beginner: {
            resources: [
              { title: "Statistics for Data Science", link: "https://www.khanacademy.org/math/statistics-probability", platform: "Khan Academy", estimatedTime: "4-6 weeks" },
              { title: "Data Analysis with Python", link: "https://www.freecodecamp.org/learn/data-analysis-with-python/", platform: "FreeCodeCamp", estimatedTime: "6-8 weeks" },
              { title: "Introduction to SQL", link: "https://www.w3schools.com/sql/", platform: "W3Schools", estimatedTime: "2-3 weeks" }
            ]
          },
          intermediate: {
            resources: [
              { title: "Intro to Machine Learning", link: "https://www.kaggle.com/learn/intro-to-machine-learning", platform: "Kaggle", estimatedTime: "8-12 weeks" },
              { title: "Data Visualization with Python", link: "https://www.kaggle.com/learn/data-visualization", platform: "Kaggle", estimatedTime: "6-10 weeks" },
              { title: "Pandas & NumPy Tutorial", link: "https://www.kaggle.com/learn/pandas", platform: "Kaggle", estimatedTime: "4-6 weeks" }
            ]
          },
          advanced: {
            resources: [
              { title: "Practical Deep Learning for Coders", link: "https://course.fast.ai/", platform: "Fast.ai", estimatedTime: "12-16 weeks" },
              { title: "Advanced SQL for Data Science", link: "https://www.kaggle.com/learn/advanced-sql", platform: "Kaggle", estimatedTime: "16-20 weeks" },
              { title: "MLOps and Model Deployment", link: "https://ml-ops.org/", platform: "MLOps.org", estimatedTime: "8-12 weeks" }
            ]
          }
        },
        timeline: {
          beginner: "4-6 months",
          intermediate: "6-12 months",
          advanced: "12+ months"
        },
        tags: ["Data Science", "Analytics", "Machine Learning", "Statistics", "Technology"]
      });
    }

    // Business and Management careers
    if (interests.includes("business") || interests.includes("management") || interests.includes("leadership") ||
        workStyle.includes("Leading teams")) {
      
      careers.push({
        title: "Product Manager",
        description: "Lead product development from conception to launch, balancing user needs with business goals",
        matchPercentage: 82,
        reason: "Your leadership qualities and strategic thinking align well with product management. Your collaborative approach is essential for working with cross-functional teams.",
        roles: ["Product Manager", "Associate Product Manager", "Senior Product Manager", "Director of Product"],
        indianContext: "High-growth field in Indian startups and tech companies. Product managers command premium salaries in the Indian market.",
        skills: ["Strategic Thinking", "Market Research", "Project Management", "Data Analysis", "Communication"],
        salaryRange: "₹8-25 LPA (Entry to Mid-level), ₹25-80+ LPA (Senior/Director)",
        futureOutlook: "Excellent prospects as companies focus on user-centric product development and digital transformation.",
        roadmap: {
          beginner: {
            resources: [
              { title: "Product Management Fundamentals", link: "https://www.coursera.org/learn/product-management-fundamentals", platform: "Coursera", estimatedTime: "4-6 weeks" },
              { title: "Introduction to Market Research", link: "https://academy.hubspot.com/courses/market-research", platform: "Hubspot Academy", estimatedTime: "2-3 weeks" },
              { title: "Agile and Scrum Basics", link: "https://www.atlassian.com/agile", platform: "Atlassian Agile Coach", estimatedTime: "6-8 weeks" }
            ]
          },
          intermediate: {
            resources: [
              { title: "Advanced Product Strategy", link: "https://www.svpg.com/articles/", platform: "SVPG Insights", estimatedTime: "8-12 weeks" },
              { title: "User Story Writing Workshop", link: "https://www.atlassian.com/agile/project-management/user-stories", platform: "Atlassian", estimatedTime: "6-10 weeks" },
              { title: "Product Analytics Deep Dive", link: "https://mixpanel.com/blog/product-analytics/", platform: "Mixpanel Basics", estimatedTime: "4-6 weeks" }
            ]
          },
          advanced: {
            resources: [
              { title: "Product Leadership Masterclass", link: "https://www.svpg.com/the-product-leaders-guide/", platform: "SVPG", estimatedTime: "12-16 weeks" },
              { title: "Strategic Product Planning", link: "https://www.atlassian.com/agile/project-management/product-planning", platform: "Atlassian", estimatedTime: "16-20 weeks" },
              { title: "Growth Product Management", link: "https://www.reforge.com/growth-series", platform: "Reforge HQ", estimatedTime: "8-12 weeks" }
            ]
          }
        },
        timeline: {
          beginner: "3-5 months",
          intermediate: "5-10 months",
          advanced: "10+ months"
        },
        tags: ["Product Management", "Strategy", "Leadership", "Business", "Technology"]
      });
    }

    // If no specific career matches, provide a general technology recommendation
    if (careers.length === 0) {
      careers.push({
        title: "Digital Marketing Specialist",
        description: "Drive brand growth through strategic digital marketing campaigns and analytics",
        matchPercentage: 75,
        reason: "Based on your responses, digital marketing offers a blend of creativity, analysis, and technology that could suit your interests.",
        roles: ["Digital Marketing Executive", "SEO Specialist", "Content Marketing Manager", "Social Media Manager"],
        indianContext: "Rapidly growing field in India with e-commerce boom. High demand across all industries for digital presence.",
        skills: ["Digital Strategy", "Content Creation", "SEO/SEM", "Analytics", "Social Media Marketing"],
        salaryRange: "₹2-10 LPA (Entry to Mid-level), ₹10-25+ LPA (Senior/Manager)",
        futureOutlook: "Strong growth as businesses continue digital transformation and online presence expansion.",
        roadmap: {
          beginner: {
            resources: [
              { title: "Digital Marketing Fundamentals", link: "https://skillshop.exceedlms.com/student/catalog/list?category_ids=53-google-ads", platform: "Google Skillshop", estimatedTime: "4-6 weeks" },
              { title: "Google Analytics Beginner Course", link: "https://analytics.google.com/analytics/academy/", platform: "Google Analytics Academy", estimatedTime: "2-3 weeks" },
              { title: "Content Marketing Basics", link: "https://academy.hubspot.com/courses/content-marketing", platform: "HubSpot Academy", estimatedTime: "6-8 weeks" }
            ]
          },
          intermediate: {
            resources: [
              { title: "Advanced SEO Techniques", link: "https://moz.com/learn/seo", platform: "Moz Academy", estimatedTime: "8-12 weeks" },
              { title: "Facebook Ads Mastery", link: "https://www.facebook.com/business/learn", platform: "Meta Blueprint", estimatedTime: "6-10 weeks" },
              { title: "Email Marketing Strategy", link: "https://academy.hubspot.com/courses/email-marketing", platform: "HubSpot Academy", estimatedTime: "4-6 weeks" }
            ]
          },
          advanced: {
            resources: [
              { title: "Marketing Automation", link: "https://academy.hubspot.com/courses/marketing-automation", platform: "HubSpot Academy", estimatedTime: "12-16 weeks" },
              { title: "Growth Hacking Strategies", link: "https://cxl.com/institute/programs/growth-marketing-training/", platform: "CXL Institute", estimatedTime: "16-20 weeks" },
              { title: "Advanced Analytics & Attribution", link: "https://analytics.google.com/analytics/academy/course/7", platform: "Google Academy", estimatedTime: "8-12 weeks" }
            ]
          }
        },
        timeline: {
          beginner: "2-4 months",
          intermediate: "4-8 months",
          advanced: "8+ months"
        },
        tags: ["Digital Marketing", "Analytics", "Creativity", "Technology", "Business"]
      });
    }

    // Store all generated recommendations in the database
    setTimeout(async () => {
      for (const career of careers) {
        await storeCareerHistory(career, false);
      }
      setRecommendations(careers);
      setLoading(false);
      
      toast({
        title: "Career Recommendations Generated!",
        description: `Found ${careers.length} career matches based on your interests and goals.`,
      });
    }, 2000);
  };

  const handleSaveCareer = async (career: CareerRecommendation) => {
    await storeCareerHistory(career, true);
    setSavedCareers(prev => new Set([...prev, career.title]));
    
    toast({
      title: "Career Path Saved!",
      description: `${career.title} has been added to your saved career paths.`,
    });
  };

  const handleViewDetails = (career: CareerRecommendation) => {
    setSelectedCareer(career);
    setIsDetailModalOpen(true);
  };

  const handleLinkClick = async (career: CareerRecommendation) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Update the links_clicked status for this career
        await supabase
          .from('user_career_history')
          .update({ links_clicked: true })
          .eq('user_id', session.user.id)
          .eq('career', career.title);
      }
    } catch (error) {
      console.error("Error updating link click status:", error);
    }
  };

  const handleViewReport = (career: CareerRecommendation) => {
    const userName = userAnswers["What's your name?"] || "Student";
    const report = generateCareerReport(userAnswers, career, userName);
    setReportData(report);
    setShowReport(true);
  };

  const handleDownloadPDF = async () => {
    // Track PDF download in career history
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && reportData) {
        await supabase
          .from('user_career_history')
          .update({ 
            links_clicked: true,
            roadmap_summary: `Complete career report downloaded with visual analytics and roadmap for ${reportData.career}` 
          })
          .eq('user_id', session.user.id)
          .eq('career', reportData.career);
      }
    } catch (error) {
      console.error("Error updating download status:", error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-lg border border-blue-100">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin h-12 w-12 border-4 border-blue-700 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Analyzing Your Responses</h3>
            <p className="text-blue-700 mb-4">Our AI is finding the perfect career matches for you...</p>
            <Progress value={75} className="w-full max-w-md mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showReport && reportData) {
    return (
      <CareerReport
        reportData={reportData}
        onClose={() => setShowReport(false)}
        onDownloadPDF={handleDownloadPDF}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="h-8 w-8 text-yellow-500 mr-2" />
            <h2 className="text-3xl font-bold text-blue-900">Your Career Recommendations</h2>
          </div>
          <p className="text-blue-700 text-lg max-w-2xl mx-auto">
            Based on your interests, skills, and goals, here are your personalized career paths with complete learning roadmaps.
          </p>
        </div>

        <div className="grid gap-6">
          {recommendations.map((career, index) => (
            <Card key={index} className="bg-white shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {career.title.includes("Software") && "💻"}
                      {career.title.includes("UI/UX") && "🎨"}
                      {career.title.includes("Data") && "📊"}
                      {career.title.includes("Product") && "🚀"}
                      {career.title.includes("Marketing") && "📈"}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-blue-900">{career.title}</CardTitle>
                      <div className="flex items-center mt-1">
                        <Badge className="bg-green-100 text-green-800 mr-2">
                          {career.matchPercentage}% Match
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {career.salaryRange.split(',')[0]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(career)}
                      className="border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                    >
                      <FileTextIcon className="h-4 w-4 mr-1" />
                      View Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(career)}
                      className="border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white"
                    >
                      <BookOpenIcon className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveCareer(career)}
                      disabled={savedCareers.has(career.title)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-blue-900"
                    >
                      {savedCareers.has(career.title) ? (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Saved
                        </>
                      ) : (
                        "Save Path"
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-blue-700 mb-4 text-base">
                  {career.description}
                </CardDescription>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Why this matches you:</h4>
                  <p className="text-blue-800">{career.reason}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Popular Roles:</h4>
                    <div className="flex flex-wrap gap-1">
                      {career.roles.slice(0, 3).map((role, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                      {career.roles.length > 3 && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          +{career.roles.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Key Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {career.skills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {career.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          +{career.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-blue-900 font-semibold">Beginner</div>
                    <div className="text-sm text-blue-700">{career.timeline.beginner}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {career.roadmap.beginner.resources.length} resources
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-blue-900 font-semibold">Intermediate</div>
                    <div className="text-sm text-blue-700">{career.timeline.intermediate}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {career.roadmap.intermediate.resources.length} resources
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-blue-900 font-semibold">Advanced</div>
                    <div className="text-sm text-blue-700">{career.timeline.advanced}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {career.roadmap.advanced.resources.length} resources
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            onClick={onRetake}
            className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
          >
            <RotateCcwIcon className="h-4 w-4 mr-2" />
            Retake Quiz for More Options
          </Button>
        </div>
      </div>

      {selectedCareer && (
        <CareerGuideDetail
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedCareer(null);
          }}
          career={selectedCareer}
        />
      )}
    </>
  );
};

export default CareerRecommendations;
