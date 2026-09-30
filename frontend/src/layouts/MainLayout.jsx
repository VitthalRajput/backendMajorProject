import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Topbar from '../components/navigation/Topbar.jsx';
import Sidebar from '../components/navigation/Sidebar.jsx';
import UploadModal from '../components/upload/UploadModal.jsx';
import AuthModal from '../components/common/AuthModal.jsx';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1200);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const location = useLocation();

  // On watch page, auto-collapse sidebar on smaller screens or adjust layout
  const isWatchPage = location.pathname.startsWith('/watch/');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setSidebarOpen(false);
      } else if (!isWatchPage) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isWatchPage]);

  // If entering watch page on screen < 1400px, collapse sidebar to give 70/30 player room
  useEffect(() => {
    if (isWatchPage && window.innerWidth < 1440) {
      setSidebarOpen(false);
    }
  }, [isWatchPage]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface-base)' }}>
      {/* Topbar */}
      <Topbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenUpload={() => setUploadModalOpen(true)}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main
        style={{
          marginTop: 'var(--topbar-height)',
          marginLeft: sidebarOpen && window.innerWidth >= 900 ? 'var(--sidebar-width)' : 0,
          transition: 'margin-left var(--transition-normal)',
          minHeight: 'calc(100vh - var(--topbar-height))',
          width: sidebarOpen && window.innerWidth >= 900 ? 'calc(100% - var(--sidebar-width))' : '100%',
        }}
      >
        <Outlet />
      </main>

      {/* Global Modals */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={() => {
          // If we are on Home or Studio, an event or refresh can happen
          window.dispatchEvent(new CustomEvent('videoUploaded'));
        }}
      />

      <AuthModal />
    </div>
  );
};

export default MainLayout;
