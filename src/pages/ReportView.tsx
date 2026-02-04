import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CareerReport } from "@/components/CareerReport";

const ReportView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    // Get report data from navigation state
    if (location.state?.reportData) {
      setReportData(location.state.reportData);
    } else {
      // If no data, redirect back to settings history tab
      navigate("/settings", { replace: true, state: { activeTab: "history" } });
    }
  }, [location.state, navigate]);

  if (!reportData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-full">
        <CareerReport
          reportData={reportData}
          onClose={() => navigate("/settings", { state: { activeTab: "history" } })}
          onDownloadPDF={() => {}}
        />
      </div>
    </div>
  );
};

export default ReportView;
