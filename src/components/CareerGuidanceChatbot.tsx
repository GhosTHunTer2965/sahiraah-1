import React, { useState, useEffect, useRef } from 'react';
import { Send, Download, MessageSquare, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CareerGuidanceResponse {
  careerPathSummary?: {
    feasibility: string;
    alternativeRoutes: string[];
  };
  collegesAndCourses?: Array<{
    name: string;
    program: string;
    entranceExam: string;
    website: string;
    location: string;
    admissionDeadline: string;
  }>;
  jobInsights?: {
    roles: string[];
    salaryRanges: {
      [key: string]: string;
    };
    industryTrends: string;
  };
  preparationTips?: {
    freeResources: Array<{
      name: string;
      url: string;
      description: string;
    }>;
    examStrategy: string;
    skillDevelopment: string;
  };
  successProbability?: {
    percentage: string;
    factors: string[];
    challenges: string[];
  };
  nextStepsRoadmap?: Array<{
    step: string;
    timeline: string;
    priority: string;
  }>;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  metadata?: CareerGuidanceResponse;
}

interface CareerGuidanceChatbotProps {
  onClose?: () => void;
}

const CareerGuidanceChatbot: React.FC<CareerGuidanceChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('career-guidance-chat', {
        body: {
          message: input,
          conversationId: conversationId,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.rawContent,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        metadata: data.response,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(data.conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!conversationId) {
      toast.error('No conversation to export');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('export-chat-pdf', {
        body: { conversationId },
      });

      if (error) throw error;

      // Create a blob from the HTML content and trigger download
      const blob = new Blob([data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `career-guidance-${conversationId.slice(0, 8)}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Conversation exported successfully!');
    } catch (error) {
      console.error('Error exporting conversation:', error);
      toast.error('Failed to export conversation');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderStructuredResponse = (response: CareerGuidanceResponse) => {
    return (
      <div className="space-y-4">
        {response.careerPathSummary && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
              <span className="font-semibold text-primary">📍 Career Path Summary</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-3 space-y-2">
              <div>
                <strong>Feasibility:</strong> {response.careerPathSummary.feasibility}
              </div>
              {response.careerPathSummary.alternativeRoutes?.length > 0 && (
                <div>
                  <strong>Alternative Routes:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    {response.careerPathSummary.alternativeRoutes.map((route, idx) => (
                      <li key={idx} className="text-sm">• {route}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {response.collegesAndCourses && response.collegesAndCourses.length > 0 && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
              <span className="font-semibold text-primary">🏫 Colleges & Courses</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {response.collegesAndCourses.map((college, idx) => (
                <Card key={idx} className="p-3">
                  <div className="font-medium">{college.name}</div>
                  <div className="text-sm text-muted-foreground">
                    📚 {college.program} | 📍 {college.location}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    📝 {college.entranceExam} | 🌐 <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{college.website}</a>
                  </div>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {response.jobInsights && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
              <span className="font-semibold text-primary">💼 Job & Salary Insights</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-3 space-y-2">
              {response.jobInsights.roles?.length > 0 && (
                <div>
                  <strong>Job Roles:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {response.jobInsights.roles.map((role, idx) => (
                      <Badge key={idx} variant="secondary">{role}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {Object.keys(response.jobInsights.salaryRanges || {}).length > 0 && (
                <div>
                  <strong>Salary Ranges:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    {Object.entries(response.jobInsights.salaryRanges).map(([key, value]) => (
                      <li key={key} className="text-sm">• {key}: {value}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {response.preparationTips && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
              <span className="font-semibold text-primary">📚 Preparation Tips</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-3 space-y-2">
              {response.preparationTips.freeResources?.length > 0 && (
                <div>
                  <strong>Free Resources:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    {response.preparationTips.freeResources.map((resource, idx) => (
                      <li key={idx} className="text-sm">
                        • <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">{resource.name}</a>: {resource.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {response.preparationTips.examStrategy && (
                <div>
                  <strong>Exam Strategy:</strong>
                  <p className="text-sm mt-1">{response.preparationTips.examStrategy}</p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {response.successProbability && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
              <span className="font-semibold text-primary">📊 Success Probability</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-3 space-y-2">
              <div>
                <strong>Assessment:</strong> <Badge variant="outline">{response.successProbability.percentage}</Badge>
              </div>
              {response.successProbability.factors?.length > 0 && (
                <div>
                  <strong>Success Factors:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    {response.successProbability.factors.map((factor, idx) => (
                      <li key={idx} className="text-sm">• {factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {response.nextStepsRoadmap && response.nextStepsRoadmap.length > 0 && (
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
              <span className="font-semibold text-primary">🗺️ Next Steps Roadmap</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {response.nextStepsRoadmap.map((step, idx) => (
                <Card key={idx} className="p-3">
                  <div className="font-medium">{step.step}</div>
                  <div className="text-sm text-muted-foreground">
                    ⏰ {step.timeline} | <Badge variant={step.priority === 'High' ? 'destructive' : step.priority === 'Medium' ? 'default' : 'secondary'}>{step.priority} Priority</Badge>
                  </div>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Career Advisor
        </CardTitle>
        <div className="flex gap-2">
          {conversationId && (
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Welcome to AI Career Guidance!</p>
                <p className="text-sm">
                  Ask me about your career goals, college choices, entrance exams, or any career-related doubts.
                  I'll provide comprehensive guidance with colleges, jobs, preparation tips, and roadmaps.
                </p>
                <p className="text-sm mt-2 font-medium">
                  Example: "I want to do M.Sc Mathematics at IISc and become a DevOps Engineer earning 10 LPA. Can you guide me?"
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' && message.metadata ? (
                    renderStructuredResponse(message.metadata)
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your career goals, colleges, exams, or any doubts..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerGuidanceChatbot;