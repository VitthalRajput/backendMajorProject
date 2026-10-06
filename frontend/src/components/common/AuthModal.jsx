import React, { useState, useEffect } from 'react';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const AuthModal = () => {
  const { authModal, closeAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState(authModal.mode || 'login'); // 'login' | 'register'

  // Login form state
  const [identifier, setIdentifier] = useState(''); // username or email
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setTab(authModal.mode || 'login');
    setError('');
    setSuccess('');
  }, [authModal.mode, authModal.isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && authModal.isOpen && !loading) {
        closeAuthModal();
      }
    };
    if (authModal.isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [authModal.isOpen, loading, closeAuthModal]);

  if (!authModal.isOpen) return null;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !loginPassword) {
      setError('Please provide your username/email and password');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const isEmail = identifier.includes('@');
      await login({
        email: isEmail ? identifier.trim() : undefined,
        username: !isEmail ? identifier.trim() : undefined,
        password: loginPassword,
      });
      // Context will trigger callback and close modal
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !username.trim() || !regPassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (!avatarFile) {
      setError('An avatar image is required to register');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('username', username.trim().toLowerCase());
      formData.append('password', regPassword);
      formData.append('avatar', avatarFile);
      if (coverImageFile) {
        formData.append('coverImage', coverImageFile);
      }

      await register(formData);
      setSuccess('Account created successfully! Logging you in...');
      // Auto login after registration
      await login({
        username: username.trim().toLowerCase(),
        password: regPassword,
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (!loading) closeAuthModal();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '440px',
          padding: '28px',
          backgroundColor: 'var(--surface-raised)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '14px',
              }}
            >
              ▶
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
              StreamCore
            </h2>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={closeAuthModal}
            disabled={loading}
            aria-label="Close modal"
            style={{ padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--surface-card)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '14px',
              backgroundColor: tab === 'login' ? 'var(--brand-primary)' : 'transparent',
              color: tab === 'login' ? '#FFFFFF' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '14px',
              backgroundColor: tab === 'register' ? 'var(--brand-primary)' : 'transparent',
              color: tab === 'register' ? '#FFFFFF' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              color: 'var(--status-danger)',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              color: 'var(--status-success)',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
                Username or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your username or email"
                required
                style={{ width: '100%' }}
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px', fontWeight: 500 }}>
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px', fontWeight: 500 }}>
                  Username *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px', fontWeight: 500 }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px', fontWeight: 500 }}>
                Password *
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                style={{ width: '100%' }}
              />
            </div>

            {/* Avatar upload */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px', fontWeight: 500 }}>
                Profile Avatar *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--surface-card)',
                      border: '1px dashed var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Upload size={18} />
                  </div>
                )}
                <label
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'var(--surface-card)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                  }}
                >
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </label>
                {avatarFile && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                    {avatarFile.name}
                  </span>
                )}
              </div>
            </div>

            {/* Cover image upload (optional) */}
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px', fontWeight: 500 }}>
                Cover Image (optional)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'var(--surface-card)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                  }}
                >
                  Choose Cover
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    style={{ display: 'none' }}
                  />
                </label>
                {coverImageFile && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {coverImageFile.name}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

