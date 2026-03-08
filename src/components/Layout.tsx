
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import PublicNavbar from './PublicNavbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { supabase } from '@/integrations/supabase/client';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const alwaysPublicRoutes = ['/login', '/signup'];
  const isAlwaysPublic = alwaysPublicRoutes.includes(location.pathname);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const showPublicNavbar = isAlwaysPublic || isAuthenticated === false;

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {showPublicNavbar ? <PublicNavbar /> : <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
