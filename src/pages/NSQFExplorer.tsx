import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Target, TrendingUp, Award } from "lucide-react";
import NSQFQualificationBrowser from "@/components/NSQFQualificationBrowser";
import SkillAssessmentModule from "@/components/SkillAssessmentModule";

export default function NSQFExplorer() {
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<'technical' | 'soft_skills' | 'cognitive' | 'practical'>('technical');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold tracking-tight">
            NSQF Qualifications & Skills Explorer
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover qualifications aligned with the National Skills Qualifications Framework 
            and assess your skills to find the perfect career pathway
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">10 NSQF Levels</h3>
              <p className="text-sm text-muted-foreground">
                From basic skills to advanced expertise
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Multiple Sectors</h3>
              <p className="text-sm text-muted-foreground">
                IT, Healthcare, Manufacturing & more
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Career Pathways</h3>
              <p className="text-sm text-muted-foreground">
                Clear progression routes mapped
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Award className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Recognized Credits</h3>
              <p className="text-sm text-muted-foreground">
                Industry-accepted qualifications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="qualifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="qualifications">NSQF Qualifications</TabsTrigger>
            <TabsTrigger value="assessment">Skill Assessment</TabsTrigger>
            <TabsTrigger value="pathways">Career Pathways</TabsTrigger>
          </TabsList>

          <TabsContent value="qualifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>National Skills Qualifications Framework</CardTitle>
                <CardDescription>
                  Explore qualifications across all 10 NSQF levels, from basic skills to advanced expertise.
                  Each qualification includes detailed information about job roles, entry requirements, and career progression.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NSQFQualificationBrowser />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Skill Assessments</CardTitle>
                <CardDescription>
                  Evaluate your current skill level across different domains and get personalized recommendations 
                  for skill development and career advancement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { type: 'technical' as const, label: 'Technical Skills', desc: 'Job-specific technical competencies' },
                    { type: 'soft_skills' as const, label: 'Soft Skills', desc: 'Communication and interpersonal skills' },
                    { type: 'cognitive' as const, label: 'Cognitive Skills', desc: 'Problem-solving and analytical thinking' },
                    { type: 'practical' as const, label: 'Practical Skills', desc: 'Hands-on application abilities' }
                  ].map(assessment => (
                    <Card 
                      key={assessment.type}
                      className={`cursor-pointer transition-colors ${
                        selectedAssessmentType === assessment.type 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedAssessmentType(assessment.type)}
                    >
                      <CardContent className="pt-4 text-center">
                        <h3 className="font-semibold">{assessment.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {assessment.desc}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <SkillAssessmentModule 
                  assessmentType={selectedAssessmentType}
                  onAssessmentComplete={(results) => {
                    console.log('Assessment completed:', results);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pathways" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Career Pathways & Progression Routes</CardTitle>
                <CardDescription>
                  Discover how different NSQF qualifications connect to create clear career progression pathways.
                  Each pathway shows the skills, experience, and qualifications needed at each level.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Information Technology Pathway */}
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Information Technology Pathway</CardTitle>
                        <Badge variant="outline">High Demand</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          {[
                            { level: 1, title: 'Basic Computer Skills', roles: ['Data Entry'] },
                            { level: 3, title: 'Computer Operator', roles: ['System Admin Assistant'] },
                            { level: 5, title: 'Web Developer', roles: ['Frontend Developer'] },
                            { level: 7, title: 'Systems Analyst', roles: ['Technical Lead'] },
                            { level: 9, title: 'IT Architect', roles: ['Solution Architect'] }
                          ].map(item => (
                            <div key={item.level} className="text-center">
                              <Badge className="mb-2">Level {item.level}</Badge>
                              <h4 className="font-medium text-sm">{item.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {item.roles.join(', ')}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Growth Potential:</strong> High demand with 15-20% annual growth in digital roles
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Healthcare Pathway */}
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Healthcare & Life Sciences Pathway</CardTitle>
                        <Badge variant="outline">Essential Services</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          {[
                            { level: 2, title: 'Healthcare Support', roles: ['Ward Assistant'] },
                            { level: 4, title: 'Healthcare Assistant', roles: ['Patient Care'] },
                            { level: 6, title: 'Medical Technician', roles: ['Lab Technician'] },
                            { level: 8, title: 'Healthcare Manager', roles: ['Department Head'] },
                            { level: 10, title: 'Healthcare Specialist', roles: ['Senior Consultant'] }
                          ].map(item => (
                            <div key={item.level} className="text-center">
                              <Badge className="mb-2">Level {item.level}</Badge>
                              <h4 className="font-medium text-sm">{item.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {item.roles.join(', ')}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Growth Potential:</strong> Steady demand with focus on specialized skills and technology integration
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Digital Marketing Pathway */}
                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Digital Marketing & Media Pathway</CardTitle>
                        <Badge variant="outline">Emerging Field</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[
                            { level: 3, title: 'Social Media Assistant', roles: ['Content Creator'] },
                            { level: 5, title: 'Digital Marketing Associate', roles: ['SEO Specialist'] },
                            { level: 7, title: 'Marketing Manager', roles: ['Campaign Manager'] },
                            { level: 9, title: 'Digital Strategy Lead', roles: ['Head of Digital'] }
                          ].map(item => (
                            <div key={item.level} className="text-center">
                              <Badge className="mb-2">Level {item.level}</Badge>
                              <h4 className="font-medium text-sm">{item.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {item.roles.join(', ')}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Growth Potential:</strong> Rapidly expanding with focus on digital transformation and online presence
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}