
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

const ExploreResources = () => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-[#1d3557] mb-2">Explore Resources</h2>
      <p className="text-[#1d3557] mb-6">Based on your interests and strengths, here are some career resources:</p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="text-[#1d3557]">NSQF Explorer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#1d3557]">
              Browse NSQF qualifications, levels, sectors, and career roles.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              asChild
              variant="outline" 
              className="border-[#1d3557] text-[#1d3557] hover:bg-[#1d3557] hover:text-white w-full flex justify-between"
            >
              <Link to="/nsqf-explorer">
                Explore NSQF
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="text-[#1d3557]">College Explorer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#1d3557]">
              Find top colleges, courses, admission requirements, and rankings.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              asChild
              variant="outline" 
              className="border-[#1d3557] text-[#1d3557] hover:bg-[#1d3557] hover:text-white w-full flex justify-between"
            >
              <Link to="/college-explorer">
                Find Colleges
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="text-[#1d3557]">Educational Pathways</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#1d3557]">
              Get structured roadmaps from your current level to dream career.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              asChild
              variant="outline" 
              className="border-[#1d3557] text-[#1d3557] hover:bg-[#1d3557] hover:text-white w-full flex justify-between"
            >
              <Link to="/educational-pathways">
                View Pathways
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="text-[#1d3557]">Entrance Exam Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#1d3557]">
              Comprehensive guide for JEE, NEET, GATE, and other entrance exams.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              asChild
              variant="outline" 
              className="border-[#1d3557] text-[#1d3557] hover:bg-[#1d3557] hover:text-white w-full flex justify-between"
            >
              <Link to="/entrance-exams">
                Exam Guide
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

    </div>
  );
};

export default ExploreResources;
