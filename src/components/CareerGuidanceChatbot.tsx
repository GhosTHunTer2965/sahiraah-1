import React, { useState, useEffect, useRef } from 'react';
import { Send, Download, MessageSquare, Loader2, Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface CareerGuidanceChatbotProps {
  onClose?: () => void;
}

const CareerGuidanceChatbot: React.FC<CareerGuidanceChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversation = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp,
      }));

      setMessages(loadedMessages);
      setConversationId(convId);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setInput('');
    setIsSidebarOpen(false);
    toast.success('New conversation started');
  };

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
        content: data.message,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(data.conversationId);
      loadConversations();
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


  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4 mr-2" />
                Chats
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Conversations</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3">
                <Button
                  onClick={handleNewChat}
                  className="w-full justify-start"
                  variant="default"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
                <Separator />
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-2">
                    {conversations.length > 0 ? (
                      conversations.map((conv) => (
                        <Button
                          key={conv.id}
                          variant={conversationId === conv.id ? "secondary" : "ghost"}
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => loadConversation(conv.id)}
                        >
                          <div className="truncate text-sm">
                            {conv.title || `Chat ${conv.id.slice(0, 8)}`}
                          </div>
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No previous conversations
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <MessageSquare className="h-5 w-5" />
            AI Career Advisor
          </h2>
        </div>
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
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden p-4">

        <ScrollArea className="flex-1 pr-4 min-h-0">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Welcome to AI Career Guidance!</p>
                <p className="text-sm">
                  Ask me about your career goals, college choices, entrance exams, or any career-related doubts.
                  I'll provide comprehensive guidance in a conversational way.
                </p>
                <p className="text-sm mt-2 font-medium">
                  Example: "What are the best colleges for M.Sc Mathematics in India?"
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted prose prose-sm max-w-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed break-words">{message.content}</div>
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

        <div className="flex gap-2 pt-2 border-t">
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
      </div>
    </div>
  );
};

export default CareerGuidanceChatbot;