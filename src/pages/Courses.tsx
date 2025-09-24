import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CourseDetail from "@/components/CourseDetail";
import AdBanner from "@/components/AdBanner";

const Courses = () => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  const courses = [
    {
      title: "Introduction to Web Development",
      description: "Learn HTML, CSS, and JavaScript basics to build interactive websites and web applications.",
      level: "Beginner",
      duration: "8 weeks",
      prerequisites: [],
      resources: [
        { name: "Introduction to HTML & CSS", platform: "Coursera", link: "https://www.coursera.org/learn/html-css-javascript-for-web-developers", type: "Course" },
        { name: "Web Development Crash Course", platform: "YouTube", link: "https://www.youtube.com/watch?v=Q33KBiDriJY", type: "Video Series" },
        { name: "Learn HTML, CSS & JavaScript", platform: "freeCodeCamp", link: "https://www.freecodecamp.org/learn/responsive-web-design/", type: "Interactive Tutorial" }
      ],
      nextCourse: "JavaScript Frameworks"
    },
    {
      title: "Data Science Fundamentals",
      description: "Master statistics, Python, and data visualization to analyze and interpret complex datasets.",
      level: "Intermediate",
      duration: "12 weeks",
      prerequisites: ["Basic Programming Knowledge", "High School Mathematics"],
      resources: [
        { name: "Introduction to Data Science in Python", platform: "Coursera", link: "https://www.coursera.org/learn/python-data-analysis", type: "Course" },
        { name: "Statistics & Probability", platform: "Khan Academy", link: "https://www.khanacademy.org/math/statistics-probability", type: "Interactive Tutorial" },
        { name: "Data Visualization with Python", platform: "NPTEL", link: "https://nptel.ac.in/courses/106/106/106106212/", type: "Video Series" }
      ],
      nextCourse: "Machine Learning Basics"
    },
    {
      title: "Graphic Design Essentials",
      description: "Learn design principles and industry-standard tools to create compelling visual content.",
      level: "Beginner",
      duration: "6 weeks",
      prerequisites: [],
      resources: [
        { name: "Fundamentals of Graphic Design", platform: "Coursera", link: "https://www.coursera.org/learn/fundamentals-of-graphic-design", type: "Course" },
        { name: "Graphic Design Tutorial for Beginners", platform: "YouTube", link: "https://www.youtube.com/watch?v=WONZVnlam6U", type: "Video Series" },
        { name: "Digital Design Principles", platform: "edX", link: "https://www.edx.org/course/digital-design-2", type: "Course" }
      ],
      nextCourse: "UI/UX Design Fundamentals"
    },
    {
      title: "Business Management & Leadership",
      description: "Develop essential management and leadership skills to effectively lead teams and organizations.",
      level: "Intermediate",
      duration: "10 weeks",
      prerequisites: ["Basic Business Knowledge"],
      resources: [
        { name: "Foundations of Business Strategy", platform: "Coursera", link: "https://www.coursera.org/learn/uva-darden-foundations-business-strategy", type: "Course" },
        { name: "Leadership and Management Skills", platform: "edX", link: "https://www.edx.org/course/leadership-and-management-skills", type: "Course" },
        { name: "Team Leadership", platform: "NPTEL", link: "https://nptel.ac.in/courses/110/104/110104031/", type: "Video Series" }
      ],
      nextCourse: "Advanced Strategic Management"
    },
    {
      title: "Healthcare Administration",
      description: "Learn about healthcare systems and administration to effectively manage healthcare organizations.",
      level: "Advanced",
      duration: "14 weeks",
      prerequisites: ["Basic Healthcare Knowledge", "Management Experience"],
      resources: [
        { name: "Healthcare Organization and Management", platform: "Coursera", link: "https://www.coursera.org/learn/healthcare-organizations-management", type: "Course" },
        { name: "Healthcare Policy", platform: "edX", link: "https://www.edx.org/course/healthcare-policy", type: "Course" },
        { name: "Health Informatics", platform: "NPTEL", link: "https://nptel.ac.in/courses/110/106/110106166/", type: "Video Series" }
      ],
      nextCourse: "Healthcare Quality and Patient Safety"
    },
    // Adding more courses
    {
      title: "Mobile App Development",
      description: "Learn to develop native mobile applications for iOS and Android platforms using React Native.",
      level: "Intermediate",
      duration: "10 weeks",
      prerequisites: ["JavaScript Basics", "React Fundamentals"],
      resources: [
        { name: "React Native - The Practical Guide", platform: "Udemy", link: "https://www.udemy.com/course/react-native-the-practical-guide/", type: "Course" },
        { name: "Mobile App Development with React Native", platform: "edX", link: "https://www.edx.org/learn/react-native", type: "Course" },
        { name: "React Native Tutorial for Beginners", platform: "YouTube", link: "https://www.youtube.com/watch?v=0-S5a0eXPoc", type: "Video Series" }
      ],
      nextCourse: "Advanced App Development & Publishing"
    },
    {
      title: "Financial Planning & Analysis",
      description: "Master financial analysis, forecasting, and budgeting techniques essential for business decision-making.",
      level: "Intermediate",
      duration: "8 weeks",
      prerequisites: ["Basic Accounting Knowledge"],
      resources: [
        { name: "Financial Planning & Analysis", platform: "Coursera", link: "https://www.coursera.org/learn/financial-planning", type: "Course" },
        { name: "Finance for Non-Finance Professionals", platform: "edX", link: "https://www.edx.org/learn/finance", type: "Course" },
        { name: "Financial Modeling Basics", platform: "YouTube", link: "https://www.youtube.com/watch?v=VdgYcfA4TM8", type: "Video Series" }
      ],
      nextCourse: "Advanced Financial Modeling"
    },
    {
      title: "Digital Marketing Essentials",
      description: "Learn SEO, SEM, social media marketing, and content strategy to promote products and services online.",
      level: "Beginner",
      duration: "6 weeks",
      prerequisites: [],
      resources: [
        { name: "Digital Marketing Specialization", platform: "Coursera", link: "https://www.coursera.org/specializations/digital-marketing", type: "Course" },
        { name: "Introduction to Digital Marketing", platform: "Google Digital Garage", link: "https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing", type: "Interactive Tutorial" },
        { name: "Social Media Marketing", platform: "NPTEL", link: "https://nptel.ac.in/courses/110/105/110105034/", type: "Video Series" }
      ],
      nextCourse: "Advanced Digital Marketing Analytics"
    }
  ];

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-[#f0f6ff] py-6">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#1d3557] mb-2">Skill Development Courses</h1>
        <p className="text-[#1d3557] mb-6">
          Find courses and resources to build skills for your desired career path
        </p>

        {/* Top Courses Ad */}
        <AdBanner size="leaderboard" className="mb-8" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.slice(0, 3).map((course, index) => (
            <Card 
              key={index} 
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedCourse(index)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-[#1d3557]">{course.title}</CardTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {course.level}
                  </Badge>
                </div>
                <CardDescription>Duration: {course.duration}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#1d3557]">{course.description}</p>
                <div className="mt-2 text-sm text-blue-700">Click to view free learning resources</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mid-Content Ad */}
        <AdBanner size="large-rectangle" className="my-8 flex justify-center" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {courses.slice(3).map((course, index) => (
            <Card 
              key={index + 3} 
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedCourse(index + 3)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-[#1d3557]">{course.title}</CardTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {course.level}
                  </Badge>
                </div>
                <CardDescription>Duration: {course.duration}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#1d3557]">{course.description}</p>
                <div className="mt-2 text-sm text-blue-700">Click to view free learning resources</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Courses Ad */}
        <AdBanner size="leaderboard" className="mt-8" />

        {selectedCourse !== null && (
          <CourseDetail
            isOpen={selectedCourse !== null}
            onClose={handleCloseModal}
            course={courses[selectedCourse]}
          />
        )}
      </div>
    </div>
  );
};

export default Courses;
