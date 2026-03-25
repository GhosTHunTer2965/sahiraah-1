import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CourseDetail from "@/components/CourseDetail";

const Courses = () => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  const courses = [
    {
      title: "Introduction to Web Development",
      description: "Learn HTML, CSS, and JavaScript basics to build interactive websites and web applications.",
      level: "Beginner",
      duration: "Self-paced",
      prerequisites: [],
      resources: [
        { name: "Responsive Web Design Certification", platform: "freeCodeCamp", link: "https://www.freecodecamp.org/learn/responsive-web-design/", type: "Interactive Tutorial" },
        { name: "CS50's Web Programming", platform: "Harvard CS50", link: "https://cs50.harvard.edu/web/", type: "Course" },
        { name: "MDN Web Docs HTML/CSS", platform: "Mozilla", link: "https://developer.mozilla.org/en-US/docs/Learn", type: "Docs" }
      ],
      nextCourse: "Advanced JavaScript Frameworks"
    },
    {
      title: "Python Programming & Automation",
      description: "Master Python from basics to advanced concepts including data structures and automation scripting.",
      level: "Beginner",
      duration: "Self-paced",
      prerequisites: [],
      resources: [
        { name: "CS50's Introduction to Programming with Python", platform: "Harvard CS50", link: "https://cs50.harvard.edu/python/2022/", type: "Course" },
        { name: "Automate the Boring Stuff with Python", platform: "Online Book", link: "https://automatetheboringstuff.com/", type: "Interactive Tutorial" },
        { name: "Google's Python Class", platform: "Google for Education", link: "https://developers.google.com/edu/python", type: "Video Series" }
      ],
      nextCourse: "Data Science Fundamentals"
    },
    {
      title: "Data Science Fundamentals",
      description: "Master statistics, Python, and data visualization to analyze and interpret complex datasets.",
      level: "Intermediate",
      duration: "Self-paced",
      prerequisites: ["Python Fundamentals"],
      resources: [
        { name: "Data Analysis with Python", platform: "freeCodeCamp", link: "https://www.freecodecamp.org/learn/data-analysis-with-python/", type: "Course" },
        { name: "Intro to Machine Learning", platform: "Kaggle", link: "https://www.kaggle.com/learn/intro-to-machine-learning", type: "Interactive Tutorial" },
        { name: "CS50's Intro to AI with Python", platform: "Harvard CS50", link: "https://cs50.harvard.edu/ai/", type: "Course" }
      ],
      nextCourse: "Advanced Machine Learning"
    },
    {
      title: "Machine Learning & AI",
      description: "Understand machine learning algorithms, neural networks, and deep learning fundamentals.",
      level: "Advanced",
      duration: "Self-paced",
      prerequisites: ["Python", "Basic Calculus & Linear Algebra"],
      resources: [
        { name: "Machine Learning Crash Course", platform: "Google", link: "https://developers.google.com/machine-learning/crash-course", type: "Interactive Tutorial" },
        { name: "Practical Deep Learning", platform: "fast.ai", link: "https://course.fast.ai/", type: "Course" },
        { name: "Intro to Deep Learning (6.S191)", platform: "MIT", link: "http://introtodeeplearning.com/", type: "Video Series" }
      ],
      nextCourse: "Natural Language Processing"
    },
    {
      title: "Mobile App Development",
      description: "Learn to develop native mobile applications for iOS and Android platforms using React Native.",
      level: "Intermediate",
      duration: "Self-paced",
      prerequisites: ["JavaScript Basics"],
      resources: [
        { name: "React Native Official Docs", platform: "Meta", link: "https://reactnative.dev/docs/getting-started", type: "Docs" },
        { name: "Mobile App Development with React Native", platform: "Harvard CS50", link: "https://cs50.harvard.edu/mobile/2018/", type: "Course" },
        { name: "React Native Full Course", platform: "YouTube / freeCodeCamp", link: "https://www.youtube.com/watch?v=obH0Po_RdWk", type: "Video Series" }
      ],
      nextCourse: "Advanced State Management"
    },
    {
      title: "UI/UX Design Fundamentals",
      description: "Learn user research, wireframing, prototyping, and usability testing to create user-centered digital products.",
      level: "Beginner",
      duration: "Self-paced",
      prerequisites: [],
      resources: [
        { name: "Figma UI Design Tutorial", platform: "YouTube / freeCodeCamp", link: "https://www.youtube.com/watch?v=jwMmCTEEnqw", type: "Video Series" },
        { name: "Laws of UX", platform: "Web", link: "https://lawsofux.com/", type: "Interactive Tutorial" },
        { name: "Google UX Design Certificate Info", platform: "Google", link: "https://grow.google/certificates/ux-design/", type: "Course" }
      ],
      nextCourse: "Advanced Interaction Design"
    },
    {
      title: "Cloud Computing Fundamentals",
      description: "Master cloud infrastructure, deployment, and services using Amazon Web Services and Microsoft Azure.",
      level: "Intermediate",
      duration: "Self-paced",
      prerequisites: ["Networking Fundamentals"],
      resources: [
        { name: "AWS Cloud Practitioner Essentials", platform: "AWS Skill Builder", link: "https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials", type: "Course" },
        { name: "Azure Fundamentals", platform: "Microsoft Learn", link: "https://learn.microsoft.com/en-us/training/paths/azure-fundamentals/", type: "Interactive Tutorial" },
        { name: "AWS Certified Cloud Practitioner Bootcamp", platform: "YouTube / freeCodeCamp", link: "https://www.youtube.com/watch?v=SOTamWNgDKc", type: "Video Series" }
      ],
      nextCourse: "DevOps Engineering"
    },
    {
      title: "Digital Marketing Essentials",
      description: "Learn SEO, SEM, social media marketing, and content strategy to promote products and services online.",
      level: "Beginner",
      duration: "Self-paced",
      prerequisites: [],
      resources: [
        { name: "Digital Marketing Certification", platform: "HubSpot Academy", link: "https://academy.hubspot.com/courses/digital-marketing", type: "Course" },
        { name: "Google Ads Certifications", platform: "Google Skillshop", link: "https://skillshop.exceedlms.com/student/catalog/list?category_ids=53-google-ads", type: "Interactive Tutorial" },
        { name: "Meta Social Media Marketing", platform: "Coursera", link: "https://www.coursera.org/professional-certificates/facebook-social-media-marketing", type: "Course" }
      ],
      nextCourse: "Advanced Marketing Analytics"
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


        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, index) => (
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
