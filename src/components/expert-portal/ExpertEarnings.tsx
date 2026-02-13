import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { IndianRupee, TrendingUp, ArrowUpRight, Download, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

interface EarningRecord {
  id: string;
  session_date: string;
  amount_paid: number;
  payment_status: string;
  session_status: string;
  student_name?: string;
}

interface ExpertEarningsProps {
  expertId: string;
}

const ExpertEarnings = ({ expertId }: ExpertEarningsProps) => {
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState({
    total: 0,
    thisMonth: 0,
    pending: 0,
    completed: 0,
  });
  const [monthlyData, setMonthlyData] = useState<{ month: string; earnings: number }[]>([]);

  useEffect(() => {
    loadEarnings();
  }, [expertId]);

  const loadEarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_sessions')
        .select('id, session_date, amount_paid, payment_status, session_status, user_id')
        .eq('expert_id', expertId)
        .order('session_date', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set(data?.map(e => e.user_id) || [])];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.name]) || []);

      const enrichedData = data?.map(e => ({
        ...e,
        student_name: profileMap.get(e.user_id) || 'Student',
      })) || [];

      setEarnings(enrichedData);

      // Calculate totals
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const total = enrichedData.reduce((sum, e) => sum + (e.amount_paid || 0), 0);
      const thisMonth = enrichedData
        .filter(e => new Date(e.session_date) >= thisMonthStart)
        .reduce((sum, e) => sum + (e.amount_paid || 0), 0);
      const pending = enrichedData
        .filter(e => e.payment_status === 'pending')
        .reduce((sum, e) => sum + (e.amount_paid || 0), 0);
      const completed = enrichedData
        .filter(e => e.payment_status === 'completed')
        .reduce((sum, e) => sum + (e.amount_paid || 0), 0);

      setTotals({ total, thisMonth, pending, completed });

      // Build monthly chart data (last 6 months)
      const months: { month: string; earnings: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        const monthEarnings = enrichedData
          .filter(e => {
            const sd = new Date(e.session_date);
            return sd >= d && sd <= monthEnd;
          })
          .reduce((sum, e) => sum + (e.amount_paid || 0), 0);
        months.push({
          month: d.toLocaleDateString('en-IN', { month: 'short' }),
          earnings: monthEarnings,
        });
      }
      setMonthlyData(months);
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    if (earnings.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Student', 'Date', 'Amount', 'Payment Status', 'Session Status'];
    const rows = earnings.map(e => [
      e.student_name || 'Student',
      new Date(e.session_date).toLocaleDateString('en-IN'),
      `₹${e.amount_paid || 0}`,
      e.payment_status,
      e.session_status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Earnings exported');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-[#1e1e2e] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-400 text-sm">Total Earnings</span>
          </div>
          <p className="text-3xl font-bold text-white">₹{totals.total.toLocaleString()}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-[#1e1e2e] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-400 text-sm">This Month</span>
          </div>
          <p className="text-3xl font-bold text-white">₹{totals.thisMonth.toLocaleString()}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-[#1e1e2e] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-400 text-sm">Pending</span>
          </div>
          <p className="text-3xl font-bold text-white">₹{totals.pending.toLocaleString()}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-[#1e1e2e] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-400 text-sm">Completed</span>
          </div>
          <p className="text-3xl font-bold text-white">₹{totals.completed.toLocaleString()}</p>
        </div>
      </div>

      {/* Monthly Earnings Chart */}
      <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Monthly Earnings</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1e2e',
                  border: '1px solid #2e2e3e',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Earnings']}
              />
              <Bar dataKey="earnings" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-xl bg-[#12121a] border border-[#1e1e2e] overflow-hidden">
        <div className="p-6 border-b border-[#1e1e2e] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Transaction History</h3>
          <Button
            variant="outline"
            size="sm"
            className="border-[#2e2e3e] text-gray-300 hover:bg-[#1e1e2e]"
            onClick={exportCSV}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {earnings.length > 0 ? (
          <div className="divide-y divide-[#1e1e2e]">
            {earnings.map((earning) => (
              <div key={earning.id} className="p-4 flex items-center justify-between hover:bg-[#1e1e2e]/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{earning.student_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(earning.session_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">₹{(earning.amount_paid || 0).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    earning.payment_status === 'completed' 
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {earning.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <IndianRupee className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No earnings recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertEarnings;
