
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";

const ExploreResources = () => {
  const experts = [
    {
      name: "Sundar Pichai",
      title: "CEO, Google",
      linkedin: "https://www.linkedin.com/in/sundar-pichai-1a6b69222/",
      image: "/lovable-uploads/6b9157fa-c88d-488f-99b9-9f5fb09bc314.png",
      expertise: ["Technology", "Leadership", "Innovation"]
    },
    {
      name: "Satya Nadella",
      title: "CEO, Microsoft",
      linkedin: "https://www.linkedin.com/in/satyanadella/",
      image: "/lovable-uploads/d8890721-0b30-43c6-a2d6-5e3f872c8401.png",
      expertise: ["Cloud Computing", "AI", "Business Strategy"]
    },
    {
      name: "Indra Nooyi",
      title: "Former CEO, PepsiCo",
      linkedin: "https://www.linkedin.com/in/indranooyi/",
      image: "/lovable-uploads/a76bcec3-8df6-42e8-9c30-98a61df2ba76.png",
      expertise: ["Business Leadership", "Strategy", "Sustainability"]
    },
    {
      name: "Tim Cook",
      title: "CEO, Apple",
      linkedin: "https://www.linkedin.com/in/tim-cook-446b5129/",
      image: "/lovable-uploads/36906fe3-2a3f-466d-8e86-53460799efd2.png",
      expertise: ["Operations", "Supply Chain", "Innovation"]
    },
    {
      name: "Sheryl Sandberg",
      title: "Former COO, Meta",
      linkedin: "https://www.linkedin.com/in/sherylsandberg/",
      image: "/lovable-uploads/1bd2fd26-59a7-4638-ab11-3b70e09e14a6.png",
      expertise: ["Digital Marketing", "Leadership", "Women in Tech"]
    }
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-[#1d3557] mb-2">Explore Resources</h2>
      <p className="text-[#1d3557] mb-6">Based on your interests and strengths, here are some career resources:</p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Courses Section */}
        <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[#1d3557]" />
              <CardTitle className="text-[#1d3557]">Skill Development Courses</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[#1d3557]">
              Find courses and resources to build skills for your desired career path. Learn from top platforms with free and paid options.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              asChild
              variant="outline" 
              className="border-[#1d3557] text-[#1d3557] hover:bg-[#1d3557] hover:text-white w-full flex justify-between"
            >
              <Link to="/courses">
                Browse Courses
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Expert Connect Section */}
        <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-[#1d3557]" />
              <CardTitle className="text-[#1d3557]">Expert Connect</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[#1d3557] mb-4">
              Connect with industry leaders and experts. Learn from their experiences and get inspired by their career journeys.
            </p>
            <div className="space-y-3">
              {experts.slice(0, 2).map((expert, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                  <img 
                    src={expert.image} 
                    alt={expert.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#1d3557] text-sm">{expert.name}</h4>
                    <p className="text-xs text-blue-700">{expert.title}</p>
                  </div>
                  <a 
                    href={expert.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Connect →
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-blue-700 text-center w-full">
              View {experts.length - 2} more industry experts
            </p>
          </CardFooter>
        </Card>
      </div>

    </div>
  );
};

export default ExploreResources;
