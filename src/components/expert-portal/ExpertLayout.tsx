import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExpertLayoutProps {
  children: React.ReactNode;
  expertName?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'sessions', label: 'Sessions', icon: Calendar },
  { id: 'earnings', label: 'Earnings', icon: IndianRupee },
  { id: 'students', label: 'Student Insights', icon: GraduationCap },
  { id: 'availability', label: 'Availability', icon: Users },
  { id: 'profile', label: 'Profile', icon: Settings },
];

const ExpertLayout = ({ children, expertName, activeTab, onTabChange }: ExpertLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-[#12121a] border-r border-[#1e1e2e] transition-all duration-300 z-50 flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-semibold text-white">SahiRaah</h1>
                <p className="text-xs text-gray-400">Expert Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                activeTab === item.id 
                  ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-violet-400 border border-violet-500/30" 
                  : "text-gray-400 hover:text-white hover:bg-[#1e1e2e]"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", activeTab === item.id && "text-violet-400")} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-3 border-t border-[#1e1e2e] text-gray-400 hover:text-white flex items-center justify-center"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>

        {/* Logout */}
        <div className="p-3 border-t border-[#1e1e2e]">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn("flex-1 transition-all duration-300", collapsed ? "ml-16" : "ml-64")}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-[#1e1e2e]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500">Welcome back, {expertName}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1e1e2e] transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ExpertLayout;
