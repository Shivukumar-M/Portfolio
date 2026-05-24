import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../store/AuthContext.jsx';
import axios from 'axios';

const PORTFOLIO_URL = 'https://shivukumar.vercel.app/';

const Hero = () => {
  const { isAuthenticated, user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  const roles = [
    'Linux Engineer',
    'Full Stack Web Developer',
    'Cyber Security Enthusiast',
    'Build → Secure → Automate',
  ];

  const typingSpeed = isDeleting ? 28 : 110;

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setProfileData({
      profile: {
        name: 'Shivu Kumar A M',
        bio: "Linux gives me control of the system. Web lets me build products. Security ensures what I build survives real-world use.",
        photo: '/images/github.jpg',
        social: {
          github: 'https://github.com/Shivukumar-M',
          linkedin: 'https://www.linkedin.com/in/shivu-kumar-a-m',
        },
      },
    });
    if (isAuthenticated && user) {
      (async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
          if (res.data) setProfileData(res.data);
        } catch {}
      })();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const i = loopNum % roles.length;
    const full = roles[i];
    const next = isDeleting ? full.substring(0, text.length - 1) : full.substring(0, text.length + 1);
    const t = setTimeout(() => {
      setText(next);
      if (!isDeleting && next === full) setTimeout(() => setIsDeleting(true), 2400);
      else if (isDeleting && next === '') { setIsDeleting(false); setLoopNum(n => n + 1); }
    }, typingSpeed);
    return () => clearTimeout(t);
  }, [text, isDeleting, loopNum]);

  if (!profileData) return null;
  const { profile } = profileData;

  return (
    <section
      id="home"
      ref={heroRef}
      className="min-h-screen flex items-center pt-20 relative overflow-hidden"
      style={{ background: '#09090b' }}
    >
      {/* Neon parallax atmosphere */}
      <div className="absolute inset-0 pointer-events-none parallax-atmosphere" />
      <div className="absolute inset-0 pointer-events-none">
        {/* Neon green top-right */}
        <div
          className="absolute"
          style={{
            top: '-10%', right: '-5%',
            width: 650, height: 650,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,255,136,0.14) 0%, transparent 65%)',
            filter: 'blur(55px)',
            transform: `translateY(${scrollY * 0.15}px)`,
          }}
        />
        {/* Cyan bottom-left */}
        <div
          className="absolute"
          style={{
            bottom: '-5%', left: '-5%',
            width: 550, height: 550,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.10) 0%, transparent 65%)',
            filter: 'blur(65px)',
            transform: `translateY(${scrollY * -0.10}px)`,
          }}
        />
        {/* Magenta center-top accent */}
        <div
          className="absolute"
          style={{
            top: '15%', left: '38%',
            width: 320, height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,0,255,0.05) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          transform: `translateY(${scrollY * 0.05}px)`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT ── */}
          <div className="fade-in">
            {/* Eyebrow badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded mb-6"
              style={{
                background: '#052e16',
                border: '1px solid rgba(0,255,136,0.30)',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.68rem',
                color: '#00ff88',
                borderRadius: 6,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#00ff88', animation: 'blink 1.3s step-end infinite', flexShrink: 0 }}
              />
              SYSTEM IDENTITY INITIALIZED
            </div>

            {/* Name */}
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                fontWeight: 600,
                letterSpacing: '-0.030em',
                lineHeight: 1.05,
                color: '#fafafa',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '1rem',
              }}
            >
              {profile.name}
            </h1>

            {/* Typing role */}
            <div
              className="mb-5 min-h-[1.6em]"
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem', color: '#71717a' }}
            >
              <span style={{ color: '#00ff88' }}>{text}</span>
              <span style={{ color: '#00ff88', animation: 'blink 1s step-end infinite' }}>_</span>
            </div>

            {/* Pillars */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['🐧 Linux', '🌐 Web Dev', '🔐 Security'].map((label) => (
                <span
                  key={label}
                  className="px-3 py-1 text-xs cursor-default transition-all duration-200"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: 6,
                    color: '#a1a1aa',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,136,0.45)'; e.currentTarget.style.color = '#00ff88'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#a1a1aa'; }}
                >
                  {label}
                </span>
              ))}
            </div>

            <p
              className="mb-8 max-w-md leading-relaxed"
              style={{ color: '#71717a', fontSize: '0.9rem', lineHeight: 1.75 }}
            >
              {profile.bio}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <a href="#projects" className="btn-neon-filled">View my work</a>
              <a href="#contact" className="btn-neon">Contact me</a>
              <a
                href={PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  color: '#52525b',
                  textDecoration: 'none',
                  fontFamily: '"JetBrains Mono", monospace',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#00ff88'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#52525b'; }}
              >
                <i className="fas fa-globe" style={{ fontSize: 9 }} />
                shivukumar.vercel.app ↗
              </a>
            </div>

            {/* Social icons */}
            <div className="flex gap-2">
              {[
                { href: profile.social?.github || 'https://github.com/Shivukumar-M', icon: 'fab fa-github', label: 'GitHub' },
                { href: profile.social?.linkedin || 'https://www.linkedin.com/in/shivu-kumar-a-m', icon: 'fab fa-linkedin', label: 'LinkedIn' },
              ].map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 flex items-center justify-center text-sm"
                  style={{
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: 8,
                    color: '#71717a',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,136,0.45)'; e.currentTarget.style.color = '#00ff88'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#71717a'; }}
                >
                  <i className={icon} />
                </a>
              ))}
            </div>
          </div>

          {/* ── RIGHT — Profile image ── */}
          <div
            className="flex justify-center items-center fade-in"
            style={{ transform: `translateY(${scrollY * 0.04}px)` }}
          >
            <div className="relative">
              {/* Image frame */}
              <div
                className="overflow-hidden"
                style={{
                  width: 300,
                  height: 360,
                  borderRadius: 14,
                  border: '1px solid #27272a',
                  boxShadow: '0 0 0 1px rgba(0,255,136,0.05), 0 24px 60px rgba(0,0,0,0.6)',
                }}
              >
                <img
                  src={profile.photo || '/images/github.jpg'}
                  alt={profile.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              {/* Active badge */}
              <div
                className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5"
                style={{
                  background: '#052e16',
                  border: '1px solid rgba(0,255,136,0.35)',
                  borderRadius: 8,
                  fontFamily: '"JetBrains Mono", monospace',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#00ff88', animation: 'blink 1.5s step-end infinite' }}
                />
                <span style={{ color: '#00ff88', fontSize: '0.65rem' }}>ACTIVE</span>
              </div>

              {/* Name tag */}
              <div
                className="absolute -top-3.5 left-1/2 px-3 py-1"
                style={{
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: 6,
                  transform: 'translateX(-50%)',
                  fontFamily: '"JetBrains Mono", monospace',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ color: '#a1a1aa', fontSize: '0.68rem' }}>~/profile.yaml</span>
              </div>

              {/* Corner accent */}
              <div
                className="absolute -bottom-3 -right-3 w-10 h-10 flex items-center justify-center"
                style={{
                  background: '#18181b',
                  border: '1px solid rgba(0,255,136,0.30)',
                  borderRadius: 10,
                  animation: 'float 5s ease-in-out infinite',
                  fontSize: '1.2rem',
                }}
              >
                🔐
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="flex justify-center mt-14">
          <div className="flex flex-col items-center gap-2" style={{ opacity: 0.18 }}>
            <span className="eyebrow" style={{ fontSize: '0.6rem' }}>scroll</span>
            <div
              className="w-px h-8"
              style={{ background: 'linear-gradient(to bottom, #00ff88, transparent)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
