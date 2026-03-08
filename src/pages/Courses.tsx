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
    },
    {
      title: "Machine Learning & AI",
      description: "Understand machine learning algorithms, neural networks, and AI fundamentals with hands-on Python projects.",
      level: "Advanced",
      duration: "16 weeks",
      prerequisites: ["Python Programming", "Statistics", "Linear Algebra"],
      resources: [
        { name: "Machine Learning by Andrew Ng", platform: "Coursera", link: "https://www.coursera.org/learn/machine-learning", type: "Course" },
        { name: "Deep Learning Specialization", platform: "Coursera", link: "https://www.coursera.org/specializations/deep-learning", type: "Course" },
        { name: "Intro to Machine Learning", platform: "NPTEL", link: "https://nptel.ac.in/courses/106/105/106105152/", type: "Video Series" }
      ],
      nextCourse: "Natural Language Processing"
    },
    {
      title: "Cybersecurity Fundamentals",
      description: "Learn network security, ethical hacking, cryptography, and security best practices to protect digital systems.",
      level: "Intermediate",
      duration: "10 weeks",
      prerequisites: ["Basic Networking Knowledge", "Operating Systems"],
      resources: [
        { name: "Introduction to Cybersecurity", platform: "Coursera", link: "https://www.coursera.org/learn/intro-cyber-security", type: "Course" },
        { name: "Ethical Hacking for Beginners", platform: "YouTube", link: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", type: "Video Series" },
        { name: "Cybersecurity Essentials", platform: "Cisco Networking Academy", link: "https://www.netacad.com/courses/cybersecurity", type: "Interactive Tutorial" }
      ],
      nextCourse: "Advanced Penetration Testing"
    },
    {
      title: "Cloud Computing with AWS",
      description: "Master cloud infrastructure, deployment, and services using Amazon Web Services for scalable applications.",
      level: "Intermediate",
      duration: "10 weeks",
      prerequisites: ["Basic Linux", "Networking Fundamentals"],
      resources: [
        { name: "AWS Cloud Practitioner Essentials", platform: "AWS Training", link: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/", type: "Course" },
        { name: "Cloud Computing Basics", platform: "Coursera", link: "https://www.coursera.org/learn/cloud-computing-basics", type: "Course" },
        { name: "AWS Tutorial for Beginners", platform: "YouTube", link: "https://www.youtube.com/watch?v=ulprqHHWlNg", type: "Video Series" }
      ],
      nextCourse: "DevOps & Cloud Architecture"
    },
    {
      title: "UI/UX Design Fundamentals",
      description: "Learn user research, wireframing, prototyping, and usability testing to create user-centered digital products.",
      level: "Beginner",
      duration: "8 weeks",
      prerequisites: [],
      resources: [
        { name: "Google UX Design Certificate", platform: "Coursera", link: "https://www.coursera.org/professional-certificates/google-ux-design", type: "Course" },
        { name: "UI/UX Design Tutorial", platform: "YouTube", link: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU", type: "Video Series" },
        { name: "Intro to UX Design", platform: "Udacity", link: "https://www.udacity.com/course/ux-designer-nanodegree--nd578", type: "Course" }
      ],
      nextCourse: "Advanced Interaction Design"
    },
    {
      title: "Python Programming",
      description: "Master Python from basics to advanced concepts including OOP, file handling, and automation scripting.",
      level: "Beginner",
      duration: "8 weeks",
      prerequisites: [],
      resources: [
        { name: "Python for Everybody", platform: "Coursera", link: "https://www.coursera.org/specializations/python", type: "Course" },
        { name: "Automate the Boring Stuff with Python", platform: "YouTube", link: "https://www.youtube.com/watch?v=rfscVS0vtbw", type: "Video Series" },
        { name: "Learn Python", platform: "freeCodeCamp", link: "https://www.freecodecamp.org/learn/scientific-computing-with-python/", type: "Interactive Tutorial" }
      ],
      nextCourse: "Data Science Fundamentals"
    },
    {
      title: "Blockchain & Web3 Development",
      description: "Understand blockchain technology, smart contracts, and decentralized application development with Solidity.",
      level: "Advanced",
      duration: "12 weeks",
      prerequisites: ["JavaScript", "Basic Cryptography Concepts"],
      resources: [
        { name: "Blockchain Specialization", platform: "Coursera", link: "https://www.coursera.org/specializations/blockchain", type: "Course" },
        { name: "Solidity & Ethereum Tutorial", platform: "YouTube", link: "https://www.youtube.com/watch?v=M576WGiDBdQ", type: "Video Series" },
        { name: "Blockchain Technology", platform: "NPTEL", link: "https://nptel.ac.in/courses/106/105/106105235/", type: "Video Series" }
      ],
      nextCourse: "DeFi & Tokenomics"
    },
    {
      title: "Project Management Professional",
      description: "Learn Agile, Scrum, and Waterfall methodologies to plan, execute, and deliver projects successfully.",
      level: "Intermediate",
      duration: "8 weeks",
      prerequisites: ["Basic Business Knowledge"],
      resources: [
        { name: "Google Project Management Certificate", platform: "Coursera", link: "https://www.coursera.org/professional-certificates/google-project-management", type: "Course" },
        { name: "Agile Project Management", platform: "edX", link: "https://www.edx.org/learn/agile", type: "Course" },
        { name: "PMP Exam Prep", platform: "YouTube", link: "https://www.youtube.com/watch?v=GC7pN8Mjot8", type: "Video Series" }
      ],
      nextCourse: "Program Management & Portfolio Strategy"
    },
    {
      title: "Content Writing & Copywriting",
      description: "Master the art of persuasive writing, storytelling, blogging, and creating compelling marketing copy.",
      level: "Beginner",
      duration: "6 weeks",
      prerequisites: [],
      resources: [
        { name: "Content Strategy for Professionals", platform: "Coursera", link: "https://www.coursera.org/specializations/content-strategy", type: "Course" },
        { name: "Copywriting Masterclass", platform: "YouTube", link: "https://www.youtube.com/watch?v=RSbH_tvGVMs", type: "Video Series" },
        { name: "Writing for the Web", platform: "edX", link: "https://www.edx.org/learn/writing", type: "Course" }
      ],
      nextCourse: "Advanced SEO Content Strategy"
    },
    {
      title: "Embedded Systems & IoT",
      description: "Learn microcontroller programming, sensor integration, and IoT protocols to build connected devices.",
      level: "Intermediate",
      duration: "12 weeks",
      prerequisites: ["C Programming", "Basic Electronics"],
      resources: [
        { name: "Introduction to Embedded Systems", platform: "Coursera", link: "https://www.coursera.org/learn/introduction-embedded-systems", type: "Course" },
        { name: "IoT Fundamentals", platform: "NPTEL", link: "https://nptel.ac.in/courses/106/105/106105166/", type: "Video Series" },
        { name: "Arduino & IoT Projects", platform: "YouTube", link: "https://www.youtube.com/watch?v=fJWR7dBuc18", type: "Video Series" }
      ],
      nextCourse: "Industrial IoT & Edge Computing"
    },
    {
      title: "Public Speaking & Communication",
      description: "Build confidence in public speaking, presentations, and professional communication for career growth.",
      level: "Beginner",
      duration: "4 weeks",
      prerequisites: [],
      resources: [
        { name: "Introduction to Public Speaking", platform: "Coursera", link: "https://www.coursera.org/learn/public-speaking", type: "Course" },
        { name: "Effective Communication Skills", platform: "edX", link: "https://www.edx.org/learn/communication-skills", type: "Course" },
        { name: "Public Speaking Tips", platform: "YouTube", link: "https://www.youtube.com/watch?v=tShavGuo0_8", type: "Video Series" }
      ],
      nextCourse: "Negotiation & Persuasion Skills"
    },
    {
      title: "DevOps Engineering",
      description: "Learn CI/CD pipelines, Docker, Kubernetes, and infrastructure automation for modern software delivery.",
      level: "Advanced",
      duration: "14 weeks",
      prerequisites: ["Linux Administration", "Cloud Basics", "Git"],
      resources: [
        { name: "DevOps Engineering on AWS", platform: "Coursera", link: "https://www.coursera.org/learn/devops-aws", type: "Course" },
        { name: "Docker & Kubernetes Tutorial", platform: "YouTube", link: "https://www.youtube.com/watch?v=bhBSlnQcq2k", type: "Video Series" },
        { name: "DevOps Fundamentals", platform: "edX", link: "https://www.edx.org/learn/devops", type: "Course" }
      ],
      nextCourse: "Site Reliability Engineering"
    },
    {
      title: "Accounting & Tally",
      description: "Learn bookkeeping, GST filing, Tally ERP, and financial accounting practices for Indian businesses.",
      level: "Beginner",
      duration: "6 weeks",
      prerequisites: [],
      resources: [
        { name: "Introduction to Financial Accounting", platform: "Coursera", link: "https://www.coursera.org/learn/wharton-accounting", type: "Course" },
        { name: "Tally Prime Full Course", platform: "YouTube", link: "https://www.youtube.com/watch?v=eAMy9l4QLdA", type: "Video Series" },
        { name: "GST & Taxation Basics", platform: "NPTEL", link: "https://nptel.ac.in/courses/110/104/110104073/", type: "Video Series" }
      ],
      nextCourse: "Advanced Taxation & Audit"
    },
    {
      title: "Video Editing & Production",
      description: "Master video editing software, color grading, motion graphics, and storytelling for digital media.",
      level: "Beginner",
      duration: "6 weeks",
      prerequisites: [],
      resources: [
        { name: "Video Editing with DaVinci Resolve", platform: "YouTube", link: "https://www.youtube.com/watch?v=63Ln33rROc4", type: "Video Series" },
        { name: "Filmmaking & Video Production", platform: "Coursera", link: "https://www.coursera.org/learn/filmmaking", type: "Course" },
        { name: "Motion Graphics with After Effects", platform: "Udemy", link: "https://www.udemy.com/course/after-effects-motion-graphics/", type: "Course" }
      ],
      nextCourse: "Advanced Cinematography & VFX"
    },
    {
      title: "Database Management & SQL",
      description: "Learn relational databases, SQL queries, database design, and administration for data-driven applications.",
      level: "Beginner",
      duration: "6 weeks",
      prerequisites: [],
      resources: [
        { name: "SQL for Data Science", platform: "Coursera", link: "https://www.coursera.org/learn/sql-for-data-science", type: "Course" },
        { name: "SQL Tutorial - Full Course", platform: "freeCodeCamp", link: "https://www.freecodecamp.org/learn/relational-database/", type: "Interactive Tutorial" },
        { name: "Database Management System", platform: "NPTEL", link: "https://nptel.ac.in/courses/106/105/106105175/", type: "Video Series" }
      ],
      nextCourse: "Advanced Database Architecture"
    },
    {
      title: "Electrical & Solar Energy",
      description: "Understand electrical systems, solar panel installation, and renewable energy technologies for a sustainable future.",
      level: "Intermediate",
      duration: "10 weeks",
      prerequisites: ["Basic Physics", "Mathematics"],
      resources: [
        { name: "Solar Energy Basics", platform: "Coursera", link: "https://www.coursera.org/learn/solar-energy-basics", type: "Course" },
        { name: "Electrical Engineering Fundamentals", platform: "NPTEL", link: "https://nptel.ac.in/courses/108/102/108102042/", type: "Video Series" },
        { name: "Solar Panel Installation Guide", platform: "YouTube", link: "https://www.youtube.com/watch?v=jSa1tvrrFZg", type: "Video Series" }
      ],
      nextCourse: "Advanced Renewable Energy Systems"
    },
    {
      title: "Human Resource Management",
      description: "Learn talent acquisition, employee engagement, performance management, and HR analytics.",
      level: "Intermediate",
      duration: "8 weeks",
      prerequisites: ["Basic Management Knowledge"],
      resources: [
        { name: "Human Resource Management", platform: "Coursera", link: "https://www.coursera.org/learn/human-resources-management", type: "Course" },
        { name: "HR Analytics", platform: "edX", link: "https://www.edx.org/learn/hr-analytics", type: "Course" },
        { name: "People Management Skills", platform: "YouTube", link: "https://www.youtube.com/watch?v=QZpkE5wJGoo", type: "Video Series" }
      ],
      nextCourse: "Organizational Development & Change Management"
    },
    {
      title: "3D Modeling & Animation",
      description: "Create stunning 3D models, animations, and visual effects using Blender and industry-standard tools.",
      level: "Intermediate",
      duration: "12 weeks",
      prerequisites: ["Basic Design Knowledge"],
      resources: [
        { name: "Blender 3D Modeling Course", platform: "YouTube", link: "https://www.youtube.com/watch?v=nIoXOplUvAw", type: "Video Series" },
        { name: "3D Animation Specialization", platform: "Coursera", link: "https://www.coursera.org/specializations/3d-animation", type: "Course" },
        { name: "Computer Graphics", platform: "NPTEL", link: "https://nptel.ac.in/courses/106/106/106106090/", type: "Video Series" }
      ],
      nextCourse: "Game Development with Unity"
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
