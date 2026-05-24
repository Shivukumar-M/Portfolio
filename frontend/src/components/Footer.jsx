import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home',     href: '#home' },
    { name: 'About',    href: '#about' },
    { name: 'Skills',   href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact',  href: '#contact' },
  ];

  const socialLinks = [
    { name: 'GitHub',   icon: 'fab fa-github',   url: 'https://github.com/Shivukumar-M' },
    { name: 'LinkedIn', icon: 'fab fa-linkedin',  url: 'https://www.linkedin.com/in/shivu-kumar-a-m' },
  ];

  const linkStyle = {
    display: 'block',
    fontSize: '0.875rem',
    color: '#71717a',
    textDecoration: 'none',
    padding: '0.125rem 0',
    transition: 'color 0.15s ease',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <footer
      style={{
        background: '#09090b',
        borderTop: '1px solid #27272a',
        padding: '3.5rem 1.5rem 2rem',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#00ff88',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}>S</span>
              </div>
              <span style={{ color: '#fafafa', fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '-0.01em', fontFamily: 'Inter, sans-serif' }}>
                Shivukumar
              </span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: '#52525b', lineHeight: 1.7, fontFamily: 'Inter, sans-serif', maxWidth: 220 }}>
              Linux Engineer · Full Stack Developer · Security Enthusiast
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.625rem',
                background: '#052e16',
                border: '1px solid rgba(0,255,136,0.3)',
                borderRadius: 999,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: '#00ff88',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#00ff88',
                  flexShrink: 0,
                  animation: 'blink 1.5s step-end infinite',
                }}
              />
              Open to opportunities
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4
              style={{
                margin: '0 0 1rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#d4d4d8',
                letterSpacing: '-0.005em',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    style={linkStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#d4d4d8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#71717a'; }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4
              style={{
                margin: '0 0 1rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#d4d4d8',
                letterSpacing: '-0.005em',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Services
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {['Web Development', 'Security Auditing', 'API Design', 'Linux Automation'].map((s) => (
                <li key={s} style={{ fontSize: '0.875rem', color: '#52525b', fontFamily: 'Inter, sans-serif', padding: '0.125rem 0' }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4
              style={{
                margin: '0 0 1rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#d4d4d8',
                letterSpacing: '-0.005em',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Connect
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  style={{
                    width: 34,
                    height: 34,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    background: '#18181b',
                    border: '1px solid #27272a',
                    color: '#71717a',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.15s ease, border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#00ff88'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#71717a'; e.currentTarget.style.borderColor = '#27272a'; }}
                >
                  <i className={link.icon} />
                </a>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#52525b', fontFamily: 'JetBrains Mono, monospace' }}>
              shivukumar.vercel.app
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #27272a',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#52525b', fontFamily: 'Inter, sans-serif' }}>
            © {currentYear} Shivukumar M. All rights reserved.
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              color: '#3f3f46',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.02em',
            }}
          >
            React · Node.js · MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
