import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Users, IndianRupee, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Video, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, isToday, isTomorrow } from 'date-fns';

interface SessionStats {
  upcoming: number;
  completed: number;
  totalEarnings: number;
  pendingEarnings: number;
}

interface ExpertOverviewProps {
  stats: SessionStats;
  expertName: string;
  expertId?: string;
}

interface TodaySession {
  id: string;
  session_date: string;
  duration_minutes: number;
  session_status: string;
  meeting_link: string | null;
  student_name: string;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'completed' | 'cancelled';
  student_name: string;
  session_date: string;
  created_at: string;
}

const ExpertOverview = ({ stats, expertName, expertId }: ExpertOverviewProps) => {
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (expertId) {
      loadTodayData();
    }
  }, [expertId]);

  const loadTodayData = async () => {
    if (!expertId) return;
    setIsLoading(true);
    try {
      // Load upcoming sessions (today & tomorrow)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowEnd = new Date();
      tomorrowEnd.setDate(tomorrowEnd.getDate() + 2);
      tomorrowEnd.setHours(0, 0, 0, 0);

      const { data: sessions } = await supabase
        .from('expert_sessions')
        .select('id, session_date, duration_minutes, session_status, meeting_link, user_id')
        .eq('expert_id', expertId)
        .gte('session_date', todayStart.toISOString())
        .lt('session_date', tomorrowEnd.toISOString())
        .eq('session_status', 'scheduled')
        .order('session_date', { ascending: true });

      // Load recent activity (last 10 sessions by creation)
      const { data: recent } = await supabase
        .from('expert_sessions')
        .select('id, session_date, session_status, user_id, created_at')
        .eq('expert_id', expertId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Gather all user IDs
      const allUserIds = [
        ...new Set([
          ...(sessions?.map(s => s.user_id) || []),
          ...(recent?.map(r => r.user_id) || []),
        ])
      ];

      let profileMap = new Map<string, string>();
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, name')
          .in('id', allUserIds);
        profileMap = new Map(profiles?.map(p => [p.id, p.name || 'Student']) || []);
      }

      setTodaySessions(
        sessions?.map(s => ({
          ...s,
          student_name: profileMap.get(s.user_id) || 'Student',
        })) || []
      );

      setRecentActivity(
        recent?.map(r => ({
          id: r.id,
          type: r.session_status === 'completed' ? 'completed' : r.session_status === 'cancelled' ? 'cancelled' : 'booking',
          student_name: profileMap.get(r.user_id) || 'Student',
          session_date: r.session_date,
          created_at: r.created_at || r.session_date,
        })) || []
      );
    } catch (error) {
      console.error('Error loading today data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Upcoming Sessions',
      value: stats.upcoming,
      icon: Calendar,
      trend: stats.upcoming > 0 ? `${stats.upcoming} scheduled` : 'None scheduled',
      trendUp: stats.upcoming > 0 ? true : null,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      title: 'Completed Sessions',
      value: stats.completed,
      icon: Users,
      trend: `${stats.completed} total`,
      trendUp: stats.completed > 0 ? true : null,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/10 to-teal-500/10',
    },
    {
      title: 'Total Earnings',
      value: `₹${stats.totalEarnings.toLocaleString()}`,
      icon: IndianRupee,
      trend: 'Lifetime earnings',
      trendUp: stats.totalEarnings > 0 ? true : null,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-500/10 to-purple-500/10',
    },
    {
      title: 'Pending Payout',
      value: `₹${stats.pendingEarnings.toLocaleString()}`,
      icon: TrendingUp,
      trend: stats.pendingEarnings > 0 ? 'Awaiting clearance' : 'All cleared',
      trendUp: null,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/10 to-orange-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Good {getTimeOfDay()}, {expertName}! 👋
          </h1>
          <p className="text-violet-100 text-lg">
            {todaySessions.length > 0
              ? `You have ${todaySessions.length} session${todaySessions.length !== 1 ? 's' : ''} coming up today & tomorrow.`
              : `You have ${stats.upcoming} upcoming session${stats.upcoming !== 1 ? 's' : ''} scheduled.`
            }
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.bgGradient} border border-[#1e1e2e] p-6`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              {stat.trendUp !== null && (
                <span className={`flex items-center text-xs font-medium ${stat.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.trendUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            {stat.trendUp === null && (
              <p className="text-xs text-gray-500 mt-2">{stat.trend}</p>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule - Real Data */}
        <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Upcoming Schedule</h3>
            <button onClick={loadTodayData} className="text-gray-400 hover:text-white transition-colors">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-3">
            {todaySessions.length > 0 ? (
              todaySessions.map((session) => {
                const sessionDate = new Date(session.session_date);
                return (
                  <div key={session.id} className="flex items-center gap-4 p-4 rounded-lg bg-[#1e1e2e] border border-[#2e2e3e]">
                    <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                      <User className="h-6 w-6 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{session.student_name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>
                          {isToday(sessionDate) ? 'Today' : isTomorrow(sessionDate) ? 'Tomorrow' : format(sessionDate, 'MMM d')}
                          {' at '}
                          {format(sessionDate, 'h:mm a')}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span>{session.duration_minutes || 60} min</span>
                      </div>
                    </div>
                    {session.meeting_link && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shrink-0"
                        onClick={() => window.open(session.meeting_link!, '_blank')}
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No sessions scheduled for today or tomorrow</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity - Real Data */}
        <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#1e1e2e]">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    activity.type === 'completed' ? 'bg-emerald-400' :
                    activity.type === 'cancelled' ? 'bg-red-400' :
                    'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">
                      {activity.type === 'booking' && `New booking from ${activity.student_name}`}
                      {activity.type === 'completed' && `Session with ${activity.student_name} completed`}
                      {activity.type === 'cancelled' && `Session with ${activity.student_name} cancelled`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(activity.session_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-[#1e1e2e]">
                  <span className="text-gray-400">Total Sessions</span>
                  <span className="text-white font-semibold">{stats.completed + stats.upcoming}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-[#1e1e2e]">
                  <span className="text-gray-400">Completion Rate</span>
                  <span className="text-emerald-400 font-semibold">
                    {stats.completed > 0 ? Math.round((stats.completed / (stats.completed + stats.upcoming)) * 100) : 0}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default ExpertOverview;
