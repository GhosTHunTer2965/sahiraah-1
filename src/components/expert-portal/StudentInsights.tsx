import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, User, Target, Briefcase, ChevronRight, Search, BookOpen, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StudentData {
  id: string;
  name: string;
  email: string;
  location: string;
  current_qualification: string;
  career_aspirations: any;
  session_date: string;
  session_status: string;
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
      // Get all sessions for this expert
      const { data: sessions, error: sessionsError } = await supabase
        .from('expert_sessions')
        .select('user_id, session_date, session_status')
        .eq('expert_id', expertId)
        .order('session_date', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get unique user IDs
      const userIds = [...new Set(sessions?.map(s => s.user_id) || [])];

      if (userIds.length === 0) {
        setStudents([]);
        setIsLoading(false);
        return;
      }

      // Fetch student profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, name, email, location, current_qualification, career_aspirations')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine data
      const studentData = profiles?.map(profile => {
        const latestSession = sessions?.find(s => s.user_id === profile.id);
        return {
          ...profile,
          session_date: latestSession?.session_date || '',
          session_status: latestSession?.session_status || '',
        };
      }) || [];

      setStudents(studentData);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <p className="text-gray-400 text-sm">View student profiles and career interests before your sessions</p>
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
            <div className="divide-y divide-[#1e1e2e] max-h-[500px] overflow-y-auto">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full p-4 flex items-center justify-between hover:bg-[#1e1e2e]/50 transition-colors text-left ${
                    selectedStudent?.id === student.id ? 'bg-[#1e1e2e]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{student.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{student.location || 'No location'}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
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
            <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] overflow-hidden">
              {/* Student Header */}
              <div className="p-6 border-b border-[#1e1e2e] bg-gradient-to-r from-violet-600/10 to-indigo-600/10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedStudent.name || 'Unknown Student'}</h3>
                    <p className="text-gray-400">{selectedStudent.email}</p>
                    <p className="text-sm text-gray-500">{selectedStudent.location || 'Location not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Student Info */}
              <div className="p-6 space-y-6">
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

                {/* Session Status */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Last Session</p>
                    <div className="flex items-center gap-3">
                      <p className="text-white">
                        {selectedStudent.session_date 
                          ? new Date(selectedStudent.session_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'No session yet'}
                      </p>
                      {selectedStudent.session_status && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedStudent.session_status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : selectedStudent.session_status === 'scheduled'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {selectedStudent.session_status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] p-12 text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-medium text-white mb-2">Select a Student</h3>
              <p className="text-gray-500">Click on a student from the list to view their profile and career interests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentInsights;
