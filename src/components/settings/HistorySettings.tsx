
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookIcon, HistoryIcon, ArrowRightIcon, TagIcon } from "lucide-react";
import { CareerResult } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/toast/use-toast";
import { HistoryDetailModal } from "./HistoryDetailModal";

interface HistorySettingsProps {
  userId?: string;
}

interface EnhancedCareerResult extends CareerResult {
  roadmap_summary?: string;
  courses?: any;
  tags?: string[];
  links_clicked?: boolean;
}

export const HistorySettings = ({ userId }: HistorySettingsProps) => {
  const [careerHistory, setCareerHistory] = useState<EnhancedCareerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<EnhancedCareerResult | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchCareerHistory = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch career history from Supabase with enhanced fields
        const { data, error } = await supabase
          .from('user_career_history')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });
        
        if (error) {
          console.error("Error fetching career history:", error);
          toast({
            title: "Error loading history",
            description: "Could not load your career history. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          // Transform to match our enhanced CareerResult type
          const formattedHistory = data.map(item => ({
            career: item.career,
            reason: item.reason || '',
            timestamp: item.timestamp,
            isSelected: item.is_selected,
            roadmap_summary: item.roadmap_summary,
            courses: item.courses,
            tags: item.tags || [],
            links_clicked: item.links_clicked || false
          }));
          
          setCareerHistory(formattedHistory);
        }
      } catch (error) {
        console.error("Error in career history fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCareerHistory();
  }, [userId]);

  const handleViewDetails = (item: EnhancedCareerResult) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
  };

  if (!userId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Career Path History</CardTitle>
          <CardDescription>
            Please sign in to view your career history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Sign in to access your history</p>
            <Button className="mt-4" asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Career Path History</CardTitle>
          <CardDescription>
            Review your previous career quiz results and recommendations with complete roadmaps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin h-8 w-8 border-4 border-blue-700 border-t-transparent rounded-full"></div>
            </div>
          ) : careerHistory.length > 0 ? (
            <div className="space-y-4">
              {careerHistory.map((result, index) => (
                <div key={index} className="border rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <BookIcon className="h-5 w-5 text-blue-700" />
                      <Badge className="bg-blue-100 text-blue-800">
                        {result.career}
                      </Badge>
                      {result.isSelected && (
                        <Badge className="bg-green-100 text-green-800">Current Selection</Badge>
                      )}
                      {result.links_clicked && (
                        <Badge className="bg-purple-100 text-purple-800">Links Explored</Badge>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => handleViewDetails(result)}
                    >
                      View Details <ArrowRightIcon className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Tags */}
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <TagIcon className="h-4 w-4 text-gray-500" />
                      {result.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {result.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          +{result.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Roadmap Summary Preview */}
                  {result.roadmap_summary && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded line-clamp-2">
                      <strong>Roadmap:</strong> {result.roadmap_summary.substring(0, 150)}
                      {result.roadmap_summary.length > 150 && '...'}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <HistoryIcon className="h-4 w-4" />
                      <span>{new Date(result.timestamp).toLocaleString()}</span>
                    </div>
                    {result.courses && (
                      <div className="text-xs text-blue-600">
                        {Array.isArray(result.courses) && result.courses.length > 0 && `${result.courses.length} courses available`}
                        {!Array.isArray(result.courses) && Object.keys(result.courses).length > 0 && "External courses available"}
                      </div>
                    )}
                  </div>

                  {result.reason && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                      <strong>Recommendation reason:</strong> {result.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No previous quiz results found.</p>
              <p className="text-sm text-gray-400">Take the career quiz to see your results here.</p>
              <Button className="mt-4" asChild>
                <a href="/dashboard">Take Career Quiz</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedItem && (
        <HistoryDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
          item={selectedItem}
        />
      )}
    </>
  );
};
