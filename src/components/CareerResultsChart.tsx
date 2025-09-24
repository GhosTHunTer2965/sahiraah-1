import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CareerResultsChartProps {
  analysisData: {
    strengths: string[];
    areasForImprovement: string[];
    careerRecommendations: Array<{
      title: string;
      matchScore: number;
      keySkills: string[];
      salaryRange: string;
    }>;
  };
}

const CareerResultsChart = ({ analysisData }: CareerResultsChartProps) => {
  // Prepare data for pie chart (top 5 careers)
  const careerData = analysisData.careerRecommendations.slice(0, 5).map(career => ({
    name: career.title,
    value: career.matchScore,
    salary: career.salaryRange
  }));

  // Prepare data for skill radar chart
  const skillsData = analysisData.careerRecommendations[0]?.keySkills.slice(0, 6).map(skill => ({
    skill,
    score: Math.floor(Math.random() * 40) + 60 // Random score between 60-100 for demo
  })) || [];

  // Prepare data for strengths vs improvements bar chart
  const strengthsImprovementsData = [
    {
      category: 'Strengths',
      count: analysisData.strengths.length,
      fill: '#10b981'
    },
    {
      category: 'Areas to Improve',
      count: analysisData.areasForImprovement.length,
      fill: '#f59e0b'
    }
  ];

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
      {/* Career Match Scores Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Career Match Scores</CardTitle>
          <CardDescription>Your compatibility with different career paths</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={careerData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {careerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Match Score']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Skills Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Key Skills Analysis</CardTitle>
          <CardDescription>Your skill profile for the top recommended career</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={skillsData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                name="Skill Level"
                dataKey="score"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Strengths vs Improvements Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Overview</CardTitle>
          <CardDescription>Your strengths vs areas for improvement</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={strengthsImprovementsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Salary Range Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Potential</CardTitle>
          <CardDescription>Expected salary ranges for your top career matches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {careerData.slice(0, 3).map((career, index) => (
              <div key={career.name} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="font-medium">{career.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{career.salary}</div>
                  <div className="text-sm text-gray-500">{career.value}% match</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerResultsChart;