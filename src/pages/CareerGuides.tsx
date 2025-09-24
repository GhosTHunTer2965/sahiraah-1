
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import CareerGuideDetail from "@/components/CareerGuideDetail";
import AdBanner from "@/components/AdBanner";

const CareerGuides = () => {
  const [selectedGuide, setSelectedGuide] = useState<number | null>(null);

  const guides = [
    {
      title: "Technology Careers",
      content: "Explore careers in software development, data science, cybersecurity, and more.",
      roles: ["Software Engineer", "Data Scientist", "Cybersecurity Analyst", "UX Designer", "Cloud Architect"],
      description: "The technology sector offers diverse opportunities in developing, implementing, and maintaining software and hardware systems that power our digital world. These careers combine technical knowledge, problem-solving, and creativity.",
      roadmap: {
        beginner: {
          resources: [
            { title: "CS50: Introduction to Computer Science", link: "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x", platform: "edX" },
            { title: "Programming Foundations", link: "https://www.youtube.com/playlist?list=PLG9A6ovzPqX6d9uWzx0UYN9pm0zzl5ofA", platform: "YouTube" },
            { title: "Web Development for Beginners", link: "https://www.freecodecamp.org/learn/responsive-web-design/", platform: "freeCodeCamp" }
          ]
        },
        intermediate: {
          resources: [
            { title: "Data Structures and Algorithms", link: "https://nptel.ac.in/courses/106/102/106102064/", platform: "NPTEL" },
            { title: "Full Stack Development", link: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", platform: "freeCodeCamp" },
            { title: "Cloud Computing Basics", link: "https://www.coursera.org/learn/cloud-computing-basics", platform: "Coursera" }
          ]
        },
        advanced: {
          resources: [
            { title: "Machine Learning", link: "https://www.coursera.org/learn/machine-learning", platform: "Coursera" },
            { title: "Advanced Web Development", link: "https://fullstackopen.com/en/", platform: "Full Stack Open" },
            { title: "System Design", link: "https://www.youtube.com/watch?v=SqcXvc3ZmRU&list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX", platform: "YouTube" }
          ]
        }
      },
      timeline: {
        beginner: "2-3 months",
        intermediate: "4-6 months",
        advanced: "6-12 months"
      }
    },
    {
      title: "Healthcare Professions",
      content: "Learn about careers in medicine, nursing, therapy, and healthcare administration.",
      roles: ["Medical Practitioner", "Nurse", "Healthcare Administrator", "Medical Technologist", "Public Health Specialist"],
      description: "Healthcare professions involve providing medical care, improving patient outcomes, and managing healthcare systems. These careers require a strong foundation in biological sciences, empathy, and dedication to improving quality of life.",
      roadmap: {
        beginner: {
          resources: [
            { title: "Introduction to Biology", link: "https://ocw.mit.edu/courses/7-00-introduction-biology-fall-2023/", platform: "MIT OpenCourseWare" },
            { title: "Anatomy and Physiology", link: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtOAKed_MxxWBNaPno5h3Zs8", platform: "YouTube" },
            { title: "Medical Terminology", link: "https://www.coursera.org/learn/clinical-terminology", platform: "Coursera" }
          ]
        },
        intermediate: {
          resources: [
            { title: "Introduction to Healthcare Systems", link: "https://www.edx.org/course/fundamentals-of-healthcare-systems-engineering", platform: "edX" },
            { title: "Public Health 101", link: "https://www.coursera.org/learn/public-health", platform: "Coursera" },
            { title: "Healthcare Management", link: "https://nptel.ac.in/courses/110/106/110106166/", platform: "NPTEL" }
          ]
        },
        advanced: {
          resources: [
            { title: "Evidence-Based Medicine", link: "https://www.coursera.org/learn/clinical-research", platform: "Coursera" },
            { title: "Healthcare Analytics", link: "https://www.edx.org/professional-certificate/harvardx-health-data-science", platform: "edX" },
            { title: "Medical Ethics", link: "https://www.coursera.org/learn/introduction-to-healthcare", platform: "Coursera" }
          ]
        }
      },
      timeline: {
        beginner: "3-4 months",
        intermediate: "6-8 months",
        advanced: "8-12 months"
      }
    },
    {
      title: "Business & Finance",
      content: "Discover opportunities in marketing, finance, entrepreneurship, and management.",
      roles: ["Financial Analyst", "Marketing Manager", "Entrepreneur", "Business Consultant", "Investment Banker"],
      description: "Business and finance careers focus on creating, managing, and growing organizations and wealth. These roles involve understanding market dynamics, financial principles, and strategic decision-making.",
      roadmap: {
        beginner: {
          resources: [
            { title: "Introduction to Financial Accounting", link: "https://www.coursera.org/learn/wharton-accounting", platform: "Coursera" },
            { title: "Principles of Marketing", link: "https://nptel.ac.in/courses/110/105/110105095/", platform: "NPTEL" },
            { title: "Business Foundations", link: "https://www.edx.org/professional-certificate/wharton-business-foundations", platform: "edX" }
          ]
        },
        intermediate: {
          resources: [
            { title: "Financial Markets", link: "https://www.coursera.org/learn/financial-markets-global", platform: "Coursera" },
            { title: "Digital Marketing", link: "https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing", platform: "Google Digital Garage" },
            { title: "Entrepreneurship 101", link: "https://ocw.mit.edu/courses/15-390-new-enterprises-spring-2013/", platform: "MIT OpenCourseWare" }
          ]
        },
        advanced: {
          resources: [
            { title: "Investment Management", link: "https://www.coursera.org/specializations/investment-management", platform: "Coursera" },
            { title: "Strategic Leadership", link: "https://www.edx.org/professional-certificate/dartmouthx-leadership-in-global-business", platform: "edX" },
            { title: "Business Analytics", link: "https://nptel.ac.in/courses/110/107/110107129/", platform: "NPTEL" }
          ]
        }
      },
      timeline: {
        beginner: "2-3 months",
        intermediate: "3-6 months",
        advanced: "6-9 months"
      }
    },
    {
      title: "Creative Industries",
      content: "Explore careers in design, media, writing, and the arts.",
      roles: ["Graphic Designer", "Content Creator", "UX/UI Designer", "Video Editor", "Digital Artist"],
      description: "Creative careers involve producing visual, written, or audio content that engages audiences. These roles combine artistic skills, technical knowledge, and an understanding of audience preferences and behavior.",
      roadmap: {
        beginner: {
          resources: [
            { title: "Fundamentals of Graphic Design", link: "https://www.coursera.org/learn/fundamentals-of-graphic-design", platform: "Coursera" },
            { title: "Digital Media Basics", link: "https://www.youtube.com/playlist?list=PLpQQipWcxwt-CU7fh1_GaHFYcOAZOVx69", platform: "YouTube" },
            { title: "Content Writing 101", link: "https://www.coursera.org/learn/content-marketing", platform: "Coursera" }
          ]
        },
        intermediate: {
          resources: [
            { title: "UI/UX Design", link: "https://www.coursera.org/professional-certificates/google-ux-design", platform: "Coursera" },
            { title: "Video Production & Editing", link: "https://www.youtube.com/playlist?list=PLpQQipWcxwt8vVzFpoJS5TtCh8Ktke9TH", platform: "YouTube" },
            { title: "Digital Illustration", link: "https://www.domestika.org/en/courses/4-digital-illustration-for-beginners", platform: "Domestika" }
          ]
        },
        advanced: {
          resources: [
            { title: "Motion Graphics", link: "https://www.youtube.com/playlist?list=PLpQQipWcxwt9U7qgyYkvNH3Mp8XHXCMmQ", platform: "YouTube" },
            { title: "Advanced Design Principles", link: "https://www.coursera.org/learn/advanced-design-principles", platform: "Coursera" },
            { title: "Portfolio Development", link: "https://www.domestika.org/en/courses/2849-creative-personal-portfolio-showcase-your-work-effectively", platform: "Domestika" }
          ]
        }
      },
      timeline: {
        beginner: "1-3 months",
        intermediate: "3-5 months",
        advanced: "5-8 months"
      }
    },
    {
      title: "Education & Research",
      content: "Learn about careers in teaching, research, and academic administration.",
      roles: ["Teacher", "Educational Researcher", "Instructional Designer", "Academic Advisor", "Educational Technologist"],
      description: "Education and research careers focus on facilitating learning, creating knowledge, and developing educational systems. These roles require subject expertise, communication skills, and a passion for helping others learn and grow.",
      roadmap: {
        beginner: {
          resources: [
            { title: "Introduction to Education", link: "https://www.coursera.org/learn/teaching-learning", platform: "Coursera" },
            { title: "Research Methods Basics", link: "https://www.edx.org/professional-certificate/mitx-foundations-of-development-policy", platform: "edX" },
            { title: "Learning Theory", link: "https://nptel.ac.in/courses/109/107/109107121/", platform: "NPTEL" }
          ]
        },
        intermediate: {
          resources: [
            { title: "Instructional Design", link: "https://www.coursera.org/specializations/instructional-design", platform: "Coursera" },
            { title: "Educational Technology", link: "https://www.edx.org/professional-certificate/mitx-online-teaching", platform: "edX" },
            { title: "Assessment in Education", link: "https://www.coursera.org/learn/learning-assessment", platform: "Coursera" }
          ]
        },
        advanced: {
          resources: [
            { title: "Educational Leadership", link: "https://www.edx.org/professional-certificate/leading-educational-innovation-improvement", platform: "edX" },
            { title: "Advanced Research Methods", link: "https://www.coursera.org/learn/quantitative-methods", platform: "Coursera" },
            { title: "Curriculum Development", link: "https://nptel.ac.in/courses/109/107/109107121/", platform: "NPTEL" }
          ]
        }
      },
      timeline: {
        beginner: "2-4 months",
        intermediate: "4-6 months",
        advanced: "6-10 months"
      }
    },
  ];

  const handleCloseModal = () => {
    setSelectedGuide(null);
  };

  return (
    <div className="min-h-screen bg-[#f0f6ff] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#1d3557] mb-2">Career Guides</h1>
        <p className="text-[#1d3557] mb-8">
          Explore comprehensive guides to various career paths and industries
        </p>

        {/* Ad Banner */}
        <AdBanner size="leaderboard" className="bg-white mb-8" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide, index) => (
            <HoverCard key={index}>
              <HoverCardTrigger asChild>
                <Card 
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedGuide(index)}
                >
                  <CardHeader>
                    <CardTitle className="text-[#1d3557]">{guide.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#1d3557]">{guide.content}</p>
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-white p-4 shadow-lg rounded-lg">
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-900">{guide.title}</h3>
                  <div>
                    <span className="text-sm font-medium text-blue-700">Popular roles:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {guide.roles.slice(0, 3).map((role, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                          {role}
                        </span>
                      ))}
                      {guide.roles.length > 3 && (
                        <span className="text-xs text-blue-600">+{guide.roles.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">Click to view detailed roadmap and resources</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>

        {selectedGuide !== null && (
          <CareerGuideDetail 
            isOpen={selectedGuide !== null}
            onClose={handleCloseModal}
            career={guides[selectedGuide]}
          />
        )}
      </div>
    </div>
  );
};

export default CareerGuides;
