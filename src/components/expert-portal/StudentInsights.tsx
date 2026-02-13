import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, User, Target, Briefcase, ChevronRight, Search, BookOpen, Calendar, Clock, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface StudentSession {
  id: string;
  session_date: string;
  session_status: string;
  duration_minutes: number;
  amount_paid: number | null;
}

interface StudentData {
  id: string;
  name: string;
  email: string;
  location: string;
  current_qualification: string;
  career_aspirations: any;
  skills_interests: any;
  sessions: StudentSession[];
  totalSessions: number;
  completedSessions: number;
}

interface StudentInsightsProps {
  expertId: string;
}

const StudentInsights = ({ expertId }: StudentInsightsProps) => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  useEffect(() => {
    loadStudents();
  }, [expertId]);

  const loadStudents = async () => {
    try {
      const { data: sessions, error: sessionsError } = await supabase
        .from('expert_sessions')
        .select('id, user_id, session_date, session_status, duration_minutes, amount_paid')
        .eq('expert_id', expertId)
        .order('session_date', { ascending: false });

      if (sessionsError) throw sessionsError;

      const userIds = [...new Set(sessions?.map(s => s.user_id) || [])];

      if (userIds.length === 0) {
        setStudents([]);
        setIsLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, name, email, location, current_qualification, career_aspirations, skills_interests')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const studentData = profiles?.map(profile => {
        const studentSessions = sessions?.filter(s => s.user_id === profile.id) || [];
        return {
          ...profile,
          sessions: studentSessions,
          totalSessions: studentSessions.length,
          completedSessions: studentSessions.filter(s => s.session_status === 'completed').length,
        };
      }) || [];

      // Sort by most recent session
      studentData.sort((a, b) => {
        const aDate = a.sessions[0]?.session_date || '';
        const bDate = b.sessions[0]?.session_date || '';
        return bDate.localeCompare(aDate);
      });

      setStudents(studentData);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.current_qualification?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Student Insights</h2>
          <p className="text-gray-400 text-sm">{students.length} student{students.length !== 1 ? 's' : ''} • View profiles and session history</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1e1e2e] border-[#2e2e3e] text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-1 rounded-xl bg-[#12121a] border border-[#1e1e2e] overflow-hidden">
          <div className="p-4 border-b border-[#1e1e2e]">
            <h3 className="font-medium text-white">Your Students ({filteredStudents.length})</h3>
          </div>
          {filteredStudents.length > 0 ? (
            <div className="divide-y divide-[#1e1e2e] max-h-[600px] overflow-y-auto">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full p-4 flex items-center justify-between hover:bg-[#1e1e2e]/50 transition-colors text-left ${
                    selectedStudent?.id === student.id ? 'bg-[#1e1e2e]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{student.name || 'Unknown'}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{student.location || 'No location'}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-violet-400">{student.totalSessions} session{student.totalSessions !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No students found</p>
            </div>
          )}
        </div>

        {/* Student Details */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="space-y-6">
              {/* Student Header */}
              <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] overflow-hidden">
                <div className="p-6 border-b border-[#1e1e2e] bg-gradient-to-r from-violet-600/10 to-indigo-600/10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-white">{selectedStudent.name || 'Unknown Student'}</h3>
                      <p className="text-gray-400 truncate">{selectedStudent.email}</p>
                      <p className="text-sm text-gray-500">{selectedStudent.location || 'Location not specified'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex gap-2">
                        <div className="px-3 py-1 rounded-lg bg-violet-500/20 text-center">
                          <p className="text-lg font-bold text-violet-400">{selectedStudent.totalSessions}</p>
                          <p className="text-xs text-gray-400">Total</p>
                        </div>
                        <div className="px-3 py-1 rounded-lg bg-emerald-500/20 text-center">
                          <p className="text-lg font-bold text-emerald-400">{selectedStudent.completedSessions}</p>
                          <p className="text-xs text-gray-400">Done</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Info */}
                <div className="p-6 space-y-5">
                  {/* Education */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                      <BookOpen className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Current Qualification</p>
                      <p className="text-white font-medium">{selectedStudent.current_qualification || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Career Goals */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Target className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Career Aspirations</p>
                      {selectedStudent.career_aspirations ? (
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(selectedStudent.career_aspirations) 
                            ? selectedStudent.career_aspirations.map((aspiration: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
                                  {aspiration}
                                </span>
                              ))
                            : <p className="text-white">{JSON.stringify(selectedStudent.career_aspirations)}</p>
                          }
                        </div>
                      ) : (
                        <p className="text-gray-500">Not specified</p>
                      )}
                    </div>
                  </div>

                  {/* Skills & Interests */}
                  {selectedStudent.skills_interests && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                        <Hash className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Skills & Interests</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(selectedStudent.skills_interests) 
                            ? selectedStudent.skills_interests.map((skill: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm">
                                  {skill}
                                </span>
                              ))
                            : typeof selectedStudent.skills_interests === 'object'
                            ? Object.entries(selectedStudent.skills_interests).map(([key, val], idx) => (
                                <span key={idx} className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm">
                                  {key}: {String(val)}
                                </span>
                              ))
                            : <p className="text-white">{String(selectedStudent.skills_interests)}</p>
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Session History */}
              <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] overflow-hidden">
                <div className="p-4 border-b border-[#1e1e2e]">
                  <h4 className="font-medium text-white flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-violet-400" />
                    Session History ({selectedStudent.sessions.length})
                  </h4>
                </div>
                <div className="divide-y divide-[#1e1e2e] max-h-[300px] overflow-y-auto">
                  {selectedStudent.sessions.map((session) => (
                    <div key={session.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          session.session_status === 'completed' ? 'bg-emerald-400' :
                          session.session_status === 'cancelled' ? 'bg-red-400' :
                          'bg-blue-400'
                        }`} />
                        <div>
                          <div className="flex items-center gap-2 text-sm text-white">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {new Date(session.session_date).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                            <span className="text-gray-500">
                              {new Date(session.session_date).toLocaleTimeString('en-IN', {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {session.duration_minutes || 60} min
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.amount_paid && (
                          <span className="text-sm text-gray-400">₹{session.amount_paid}</span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.session_status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          session.session_status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {session.session_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] p-12 text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-medium text-white mb-2">Select a Student</h3>
              <p className="text-gray-500">Click on a student from the list to view their profile and session history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentInsights;
