import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext.jsx';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let result;
      if (isRegistering) {
        result = await register(formData.email, formData.password, formData.username);
      } else {
        result = await login(formData.email, formData.password);
      }
      navigate(result?.isAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    height: '2.375rem',
    padding: '0 0.75rem',
    background: 'transparent',
    border: '1px solid #27272a',
    borderRadius: 8,
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    color: '#fafafa',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  const focusInput = (e) => {
    e.target.style.borderColor = '#00ff88';
    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
  };
  const blurInput = (e) => {
    e.target.style.borderColor = '#27272a';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#09090b',
        padding: '1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Brand mark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#00ff88',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.125rem', fontFamily: 'Inter, sans-serif' }}>S</span>
          </div>
          <span style={{ color: '#fafafa', fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.01em' }}>
            Portfolio
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: 14,
            padding: '1.75rem',
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1
              style={{
                margin: '0 0 0.375rem',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#fafafa',
                letterSpacing: '-0.02em',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {isRegistering ? 'Create an account' : 'Welcome back'}
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#71717a', fontFamily: 'Inter, sans-serif' }}>
              {isRegistering
                ? 'Enter your details to get started'
                : 'Sign in to manage your portfolio'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 8,
                marginBottom: '1.25rem',
              }}
            >
              <i className="fas fa-circle-exclamation" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#fca5a5', fontFamily: 'Inter, sans-serif' }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Username (register only) */}
            {isRegistering && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label
                  htmlFor="username"
                  style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#d4d4d8', fontFamily: 'Inter, sans-serif' }}
                >
                  Username
                  <span style={{ color: '#71717a', fontWeight: 400, marginLeft: '0.375rem', fontSize: '0.75rem' }}>
                    → /u/username
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#52525b',
                      fontSize: '0.875rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      pointerEvents: 'none',
                    }}
                  >
                    @
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                    placeholder="johndoe"
                    style={{ ...inputStyle, paddingLeft: '1.875rem', fontFamily: 'JetBrains Mono, monospace' }}
                    onFocus={focusInput}
                    onBlur={blurInput}
                  />
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#52525b', fontFamily: 'Inter, sans-serif' }}>
                  Letters, numbers and underscore only. Auto-generated if blank.
                </p>
              </div>
            )}

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label
                htmlFor="email"
                style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#d4d4d8', fontFamily: 'Inter, sans-serif' }}
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label
                htmlFor="password"
                style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#d4d4d8', fontFamily: 'Inter, sans-serif' }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                height: '2.375rem',
                marginTop: '0.25rem',
                background: loading ? '#059669' : '#00ff88',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1,
                transition: 'opacity 0.15s ease',
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 14, height: 14,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  {isRegistering ? 'Creating account…' : 'Signing in…'}
                </>
              ) : (
                isRegistering ? 'Create account' : 'Sign in'
              )}
            </button>
          </form>

          {/* Toggle register/login */}
          <p
            style={{
              marginTop: '1.25rem',
              textAlign: 'center',
              fontSize: '0.8125rem',
              color: '#71717a',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#00ff88',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(16, 185, 129, 0.35)',
              }}
            >
              {isRegistering ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.8125rem',
              color: '#52525b',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#a1a1aa'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#52525b'; }}
          >
            <i className="fas fa-arrow-left" style={{ fontSize: '0.75rem' }} />
            Back to portfolio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
