
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExpertBooking from "./ExpertBooking";

const ExploreResources = () => {
  const [showExpertDialog, setShowExpertDialog] = useState(false);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">Explore Resources</h2>
      <p className="text-muted-foreground mb-6">Based on your interests and strengths, here are some career resources:</p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Courses Section */}
        <Card className="bg-card rounded-xl shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle>Skill Development Courses</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Find courses and resources to build skills for your desired career path. Learn from top platforms with free and paid options.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button 
              asChild
              variant="outline" 
              className="w-full flex justify-between"
            >
              <Link to="/courses">
                Browse Courses
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Expert Connect Section */}
        <Card className="bg-card rounded-xl shadow-md hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle>Expert Connect</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Connect with mentors and professionals in your field of interest. Book 1-on-1 sessions for personalized career guidance.
            </CardDescription>
            <div className="text-sm space-y-2">
              <p>✓ 60-minute personalized sessions</p>
              <p>✓ Expert career guidance & roadmap</p>
              <p>✓ Industry insights & mentorship</p>
              <p className="font-semibold text-primary">Platform fee: ₹199/session</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => setShowExpertDialog(true)}
              className="w-full flex justify-between"
            >
              Book Expert Session
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showExpertDialog} onOpenChange={setShowExpertDialog}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Book a Session with Industry Experts</DialogTitle>
            <p className="text-muted-foreground">Choose an expert to guide your career journey</p>
          </DialogHeader>
          <div className="mt-6">
            <ExpertBooking />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExploreResources;
