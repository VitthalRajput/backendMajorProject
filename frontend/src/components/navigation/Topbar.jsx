import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, Search, Plus, User, LogOut, LayoutDashboard, Heart, History, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import ChannelAvatar from '../common/ChannelAvatar.jsx';

export const Topbar = ({ onToggleSidebar, onOpenUpload }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync search input if query param changes externally
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    navigate('/');
  };

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login', onOpenUpload);
    } else {
      onOpenUpload();
    }
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--surface-base)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 50,
      }}
    >
      {/* Left: Hamburger & Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="btn-icon"
          aria-label="Toggle sidebar navigation"
          style={{ width: '38px', height: '38px' }}
        >
          <Menu size={20} />
        </button>

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
          }}
          aria-label="StreamCore Home"
        >
          <div
            style={{
              width: '32px',
              height: '24px',
              backgroundColor: 'var(--brand-primary)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(255, 0, 51, 0.4)',
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderLeft: '8px solid #FFFFFF',
                marginLeft: '2px',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '-0.5px',
              color: 'var(--text-primary)',
            }}
          >
            StreamCore
          </span>
        </Link>
      </div>

      {/* Center: Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          flex: '0 1 560px',
          margin: '0 16px',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
            style={{
              width: '100%',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRight: 'none',
              borderRadius: 'var(--radius-pill) 0 0 var(--radius-pill)',
              padding: '8px 36px 8px 16px',
              fontSize: '14px',
              color: 'var(--text-primary)',
              height: '38px',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              style={{
                position: 'absolute',
                right: '10px',
                color: 'var(--text-muted)',
                padding: '2px',
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="submit"
          aria-label="Submit search"
          style={{
            height: '38px',
            padding: '0 20px',
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0 var(--radius-pill) var(--radius-pill) 0',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color var(--transition-fast), color var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-card-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-card)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Search size={18} />
        </button>
      </form>

      {/* Right: Upload & User Avatar / Sign In */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={handleUploadClick}
          className="btn-primary"
          style={{
            height: '36px',
            padding: '0 14px',
            fontSize: '13px',
            fontWeight: 600,
          }}
          title="Upload new video"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Upload</span>
        </button>

        {isAuthenticated && user ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                borderRadius: '50%',
                padding: '2px',
                border: dropdownOpen ? '2px solid var(--brand-primary)' : '2px solid transparent',
                transition: 'border-color var(--transition-fast)',
              }}
              aria-label="User account menu"
            >
              <ChannelAvatar
                avatar={user.avatar}
                username={user.username}
                fullName={user.fullName}
                size={34}
              />
            </button>

            {/* Account Dropdown */}
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '240px',
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-modal)',
                  padding: '8px 0',
                  zIndex: 100,
                }}
              >
                {/* User info banner */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                    {user.fullName || user.username}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    @{user.username}
                  </div>
                </div>

                <div style={{ padding: '4px 0' }}>
                  <Link
                    to={`/c/${user.username}`}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <User size={16} />
                    <span>Your Channel</span>
                  </Link>

                  <Link
                    to="/studio/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LayoutDashboard size={16} />
                    <span>StreamCore Studio</span>
                  </Link>

                  <Link
                    to="/liked-videos"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Heart size={16} />
                    <span>Liked Videos</span>
                  </Link>

                  <Link
                    to="/history"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <History size={16} />
                    <span>Watch History</span>
                  </Link>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      color: 'var(--status-danger)',
                      fontSize: '13px',
                      textAlign: 'left',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="btn-secondary"
            style={{
              height: '36px',
              padding: '0 16px',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
