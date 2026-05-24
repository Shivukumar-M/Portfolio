import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext.jsx';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Home',     href: '#home' },
    { name: 'About',    href: '#about' },
    { name: 'Skills',   href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact',  href: '#contact' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 50,
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(9, 9, 11, 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #27272a' : '1px solid transparent',
        padding: scrolled ? '0.75rem 0' : '1.25rem 0',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 12px rgba(0,255,136,0.35)',
              }}
            >
              <span style={{ color: '#000', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}>S</span>
            </div>
            <span
              className="gradient-text"
              style={{
                fontWeight: 700,
                fontSize: '0.9375rem',
                letterSpacing: '-0.01em',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {isAuthenticated && user ? `${user.email.split('@')[0]}` : 'Portfolio'}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden-mobile">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="nav-link-ul"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 32,
                  padding: '0 0.75rem',
                  borderRadius: 6,
                  color: '#a1a1aa',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#00ff88'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; }}
              >
                {link.name}
              </a>
            ))}

            {/* Separator */}
            <div style={{ width: 1, height: 20, background: '#27272a', margin: '0 0.5rem' }} />

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Link
                  to="/dashboard"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    height: 32,
                    padding: '0 0.75rem',
                    borderRadius: 6,
                    color: '#a1a1aa',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'color 0.15s ease, background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fafafa'; e.currentTarget.style.background = '#27272a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <i className="fas fa-gauge-high" style={{ fontSize: '0.75rem' }} />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    height: 32,
                    padding: '0 0.75rem',
                    borderRadius: 6,
                    background: 'transparent',
                    border: 'none',
                    color: '#a1a1aa',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'color 0.15s ease, background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fafafa'; e.currentTarget.style.background = '#27272a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <i className="fas fa-arrow-right-from-bracket" style={{ fontSize: '0.75rem' }} />
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary" style={{ height: 32, fontSize: '0.875rem' }}>
                Sign in
              </Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid #27272a',
              color: '#a1a1aa',
              cursor: 'pointer',
            }}
            className="show-mobile"
            aria-label="Toggle menu"
          >
            <i className={`fas ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} style={{ fontSize: '0.875rem' }} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 10,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 6,
                    color: '#a1a1aa',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fafafa'; e.currentTarget.style.background = '#27272a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'transparent'; }}
                >
                  {link.name}
                </a>
              ))}

              <div style={{ height: 1, background: '#27272a', margin: '0.375rem 0' }} />

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 6,
                      color: '#a1a1aa',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#fafafa'; e.currentTarget.style.background = '#27272a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <i className="fas fa-gauge-high" style={{ fontSize: '0.75rem' }} />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 6,
                      background: 'transparent',
                      border: 'none',
                      color: '#a1a1aa',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#fafafa'; e.currentTarget.style.background = '#27272a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <i className="fas fa-arrow-right-from-bracket" style={{ fontSize: '0.75rem' }} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary"
                  onClick={() => setMenuOpen(false)}
                  style={{ justifyContent: 'center', marginTop: '0.25rem' }}
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile   { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;
