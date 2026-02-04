import { Calendar, Users, IndianRupee, TrendingUp, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SessionStats {
  upcoming: number;
  completed: number;
  totalEarnings: number;
  pendingEarnings: number;
}

interface ExpertOverviewProps {
  stats: SessionStats;
  expertName: string;
}

const ExpertOverview = ({ stats, expertName }: ExpertOverviewProps) => {
  const statCards = [
    {
      title: 'Upcoming Sessions',
      value: stats.upcoming,
      icon: Calendar,
      trend: '+2 this week',
      trendUp: true,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      title: 'Completed Sessions',
      value: stats.completed,
      icon: Users,
      trend: '+12% vs last month',
      trendUp: true,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/10 to-teal-500/10',
    },
    {
      title: 'Total Earnings',
      value: `₹${stats.totalEarnings.toLocaleString()}`,
      icon: IndianRupee,
      trend: '+8% vs last month',
      trendUp: true,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-500/10 to-purple-500/10',
    },
    {
      title: 'Pending Payout',
      value: `₹${stats.pendingEarnings.toLocaleString()}`,
      icon: TrendingUp,
      trend: 'Next payout in 3 days',
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
            You have {stats.upcoming} upcoming session{stats.upcoming !== 1 ? 's' : ''} scheduled.
          </p>
        </div>
        {/* Decorative elements */}
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
        {/* Today's Schedule */}
        <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Today's Schedule</h3>
            <Clock className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {stats.upcoming > 0 ? (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-[#1e1e2e] border border-[#2e2e3e]">
                <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Upcoming Session</p>
                  <p className="text-sm text-gray-400">Check the Sessions tab for details</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">
                  {stats.upcoming} pending
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No sessions scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#1e1e2e]">
              <span className="text-gray-400">This Month's Sessions</span>
              <span className="text-white font-semibold">{stats.completed + stats.upcoming}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#1e1e2e]">
              <span className="text-gray-400">Completion Rate</span>
              <span className="text-emerald-400 font-semibold">
                {stats.completed > 0 ? Math.round((stats.completed / (stats.completed + stats.upcoming)) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#1e1e2e]">
              <span className="text-gray-400">Avg. Rating</span>
              <span className="text-amber-400 font-semibold">4.8 ★</span>
            </div>
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
