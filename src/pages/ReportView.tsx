import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CareerReport } from "@/components/CareerReport";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ReportView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    // Get report data from navigation state
    if (location.state?.reportData) {
      setReportData(location.state.reportData);
    } else {
      // If no data, redirect back to settings
      navigate("/settings", { replace: true });
    }
  }, [location.state, navigate]);

  if (!reportData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-full">
        <Button
          variant="ghost"
          onClick={() => navigate("/settings")}
          className="mb-2 ml-4 mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
        
        <CareerReport
          reportData={reportData}
          onClose={() => navigate("/settings")}
          onDownloadPDF={() => {}}
        />
      </div>
    </div>
  );
};

export default ReportView;
