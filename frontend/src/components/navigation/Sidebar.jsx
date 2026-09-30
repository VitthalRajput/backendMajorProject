import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, History, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import subscriptionsApi from '../../api/subscriptions.api.js';
import SidebarItem from './SidebarItem.jsx';
import ChannelAvatar from '../common/ChannelAvatar.jsx';
import Skeleton from '../common/Skeleton.jsx';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    if (window.innerWidth < 900 && isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Fetch subscribed channels
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user?._id) {
        setSubscriptions([]);
        return;
      }
      setLoadingSubscriptions(true);
      try {
        const data = await subscriptionsApi.getSubscribedChannels(user._id);
        setSubscriptions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Failed to load subscriptions in sidebar', err);
        setSubscriptions([]);
      } finally {
        setLoadingSubscriptions(false);
      }
    };

    fetchSubscriptions();
  }, [user?._id]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 40,
            display: window.innerWidth < 900 ? 'block' : 'none',
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 'var(--topbar-height)',
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--surface-base)',
          borderRight: '1px solid var(--border-subtle)',
          padding: '12px 8px',
          overflowY: 'auto',
          zIndex: 45,
          transition: 'transform var(--transition-normal)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {/* Main Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <SidebarItem to="/" icon={Home} label="Home" />
          <SidebarItem to="/liked-videos" icon={Heart} label="Liked Videos" />
          <SidebarItem to="/history" icon={History} label="History" />
          <SidebarItem to="/studio/dashboard" icon={LayoutDashboard} label="Studio Dashboard" />
        </div>

        <div
          style={{
            height: '1px',
            backgroundColor: 'var(--border-subtle)',
            margin: '12px 8px',
          }}
        />

        {/* Subscriptions Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.6px',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            Subscriptions
          </div>

          {!isAuthenticated ? (
            <div style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.4 }}>
              Sign in to see channels you subscribe to.
            </div>
          ) : loadingSubscriptions ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px' }}>
                <Skeleton variant="circular" width="28px" height="28px" />
                <Skeleton variant="text" width="110px" height="14px" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px' }}>
                <Skeleton variant="circular" width="28px" height="28px" />
                <Skeleton variant="text" width="90px" height="14px" />
              </div>
            </div>
          ) : subscriptions.length === 0 ? (
            <div style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.4 }}>
              No subscriptions yet.
            </div>
          ) : (
            subscriptions.map((sub) => {
              const username = sub.username || sub.channelDetails?.username;
              const fullName = sub.fullName || sub.channelDetails?.fullName || username;
              const avatar = sub.avatar || sub.channelDetails?.avatar;

              if (!username) return null;

              return (
                <Link
                  key={sub._id || username}
                  to={`/c/${username}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <ChannelAvatar
                    avatar={avatar}
                    username={username}
                    fullName={fullName}
                    size={28}
                  />
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {fullName || username}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
