
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListCheckIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CourseDetailProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    title: string;
    description: string;
    level: string;
    duration: string;
    prerequisites?: string[];
    resources: Array<{
      name: string;
      platform: string;
      link: string;
      type: string;
    }>;
    nextCourse?: string;
  };
}

const CourseDetail = ({ isOpen, onClose, course }: CourseDetailProps) => {
  const { toast } = useToast();
  
  const handleMarkCompleted = () => {
    toast({
      title: "Course marked as completed!",
      description: "Your progress has been updated on your dashboard.",
    });
  };
  
  const handleAddToPath = () => {
    toast({
      title: "Added to your learning path!",
      description: `${course.title} has been added to your personal learning path.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl font-bold text-blue-900">{course.title}</DialogTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {course.level}
            </Badge>
          </div>
          <DialogDescription className="text-blue-700">
            {course.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-semibold text-blue-800 mb-2">Course Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm font-medium text-blue-700">Duration</p>
                <p className="text-blue-900">{course.duration}</p>
              </div>
              {course.nextCourse && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-blue-700">Next Step</p>
                  <p className="text-blue-900">{course.nextCourse}</p>
                </div>
              )}
            </div>
          </div>
          
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-blue-800 mb-2">Prerequisites</h3>
              <ul className="list-disc pl-5 space-y-1">
                {course.prerequisites.map((prereq, idx) => (
                  <li key={idx} className="text-blue-700">{prereq}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <h3 className="text-md font-semibold text-blue-800 mb-2">Free Resources</h3>
            <div className="space-y-3">
              {course.resources.map((resource, idx) => (
                <div key={idx} className="bg-white p-3 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-blue-900">{resource.name}</p>
                      <p className="text-sm text-blue-700">
                        Platform: {resource.platform} • Type: {resource.type}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(resource.link, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      Access
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handleMarkCompleted}
            className="border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white"
          >
            <ListCheckIcon className="mr-2 h-4 w-4" />
            Mark as Completed
          </Button>
          <Button 
            onClick={handleAddToPath}
            className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold"
          >
            Add to My Path
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseDetail;
