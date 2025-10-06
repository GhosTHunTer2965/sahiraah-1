
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import PublicNavbar from './PublicNavbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const publicRoutes = ['/', '/about', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {isPublicRoute ? <PublicNavbar /> : <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
