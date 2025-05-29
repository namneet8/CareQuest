"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Download, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Lock,
  BookOpen,
  Trophy
} from "lucide-react";

type Report = {
  levelId: string;
  fileName: string;
  url: string;
  createdAt: string;
};

// Define report types with enhanced metadata
const REPORT_TYPES = [
  {
    id: "basic",
    title: "Basic Health Assessment",
    description: "Initial health screening and basic recommendations",
    icon: FileText,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    iconColor: "text-blue-600"
  },
  {
    id: "intermediate",
    title: "Detailed Health Analysis",
    description: "Comprehensive analysis with lifestyle recommendations",
    icon: BookOpen,
    color: "bg-green-100 text-green-800 border-green-200",
    iconColor: "text-green-600"
  },
  {
    id: "advanced",
    title: "Complete Wellness Report",
    description: "Full health profile with personalized action plan",
    icon: Trophy,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    iconColor: "text-purple-600"
  }
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/reports");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch reports");
        }
        const { reports } = await response.json();
        setReports(reports);
      } catch (e) {
        setError(`Failed to load reports: ${e}`);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      alert(`Failed to download the report: ${e}`);
    }
  };

  const getStatusMessage = () => {
    const reportCount = reports.length;
    
    if (reportCount === 0) {
      return {
        type: "info",
        icon: AlertCircle,
        title: "No Reports Generated Yet",
        message: "Start by answering our health assessment questions to generate your first report.",
        actionText: "Begin Assessment"
      };
    } else if (reportCount < 3) {
      return {
        type: "warning",
        icon: Lock,
        title: `${reportCount}/3 Reports Generated`,
        message: "Continue answering questions to unlock more advanced reports and get deeper insights into your health.",
        actionText: "Continue Assessment"
      };
    } else {
      return {
        type: "success",
        icon: CheckCircle,
        title: "All Reports Complete!",
        message: "Congratulations! You have generated all three comprehensive health reports.",
        actionText: "View Dashboard"
      };
    }
  };

  const isReportGenerated = (reportIndex: number) => {
    return reports.length > reportIndex;
  };

  const getReportData = (reportIndex: number) => {
    return reports.find((_, index) => index === reportIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Health Reports</h1>
          <p className="text-xl text-gray-600">Track your health journey with comprehensive assessments</p>
        </div>

        {/* Progress Status */}
        <div className="mb-8">
          <Alert className={`${
            statusInfo.type === 'success' ? 'border-green-200 bg-green-50' :
            statusInfo.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
            'border-blue-200 bg-blue-50'
          }`}>
            <statusInfo.icon className={`h-5 w-5 ${
              statusInfo.type === 'success' ? 'text-green-600' :
              statusInfo.type === 'warning' ? 'text-yellow-600' :
              'text-blue-600'
            }`} />
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900">{statusInfo.title}</h3>
              <AlertDescription className="text-gray-700 mt-1">
                {statusInfo.message}
              </AlertDescription>
              {statusInfo.type !== 'success' && (
                <Button className="mt-3" size="sm">
                  {statusInfo.actionText}
                </Button>
              )}
            </div>
          </Alert>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{reports.length}/3 Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(reports.length / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {REPORT_TYPES.map((reportType, index) => {
            const isGenerated = isReportGenerated(index);
            const reportData = getReportData(index);
            const IconComponent = reportType.icon;

            return (
              <Card 
                key={reportType.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  isGenerated ? 'ring-2 ring-green-200' : 'opacity-75'
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {isGenerated ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Generated
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>

                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg ${reportType.color} flex items-center justify-center mb-4`}>
                    <IconComponent className={`h-6 w-6 ${reportType.iconColor}`} />
                  </div>
                  <CardTitle className={`text-lg ${!isGenerated ? 'text-gray-500' : ''}`}>
                    {reportType.title}
                  </CardTitle>
                  <CardDescription className={!isGenerated ? 'text-gray-400' : ''}>
                    {reportType.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {isGenerated && reportData ? (
                    <>
                      {/* Report Info */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Generated on {new Date(reportData.createdAt).toLocaleDateString()}
                      </div>
                      
                      {/* File Name */}
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">File: </span>
                        <span className="text-gray-600">{reportData.fileName}</span>
                      </div>

                      {/* Download Button */}
                      <Button 
                        onClick={() => handleDownload(reportData.url, reportData.fileName)}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Locked State */}
                      <div className="text-center py-6">
                        <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Complete more assessments to unlock this report
                        </p>
                      </div>
                      
                      <Button variant="secondary" className="w-full" disabled>
                        Not Available Yet
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        {reports.length < 3 && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready for Your Next Assessment?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Continue your health journey by answering more questions. Each assessment 
                unlocks deeper insights and more personalized recommendations.
              </p>
              <Button size="lg" className=" hover:bg-blue-700">
                Continue Assessment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}