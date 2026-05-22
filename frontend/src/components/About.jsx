import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../store/AuthContext.jsx';

function useReveal(threshold = 0.08) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function TimelineItem({ icon, title, subtitle, period, description, badge, delay, isLast }) {
  const [ref, visible] = useReveal(0.06);
  return (
    <div
      ref={ref}
      className="flex gap-4"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateX(-16px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {/* Spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: '#10b981', flexShrink: 0 }}
        >
          <i className={`${icon} text-white`} style={{ fontSize: 8 }} />
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 mt-1.5"
            style={{ background: 'linear-gradient(to bottom, rgba(16,185,129,0.3), transparent)', minHeight: 20 }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-1 mb-1">
          <div>
            <p style={{ color: '#e9ebdf', fontWeight: 600, fontSize: '0.8rem', margin: 0 }}>{title}</p>
            <p style={{ color: '#8b867f', fontSize: '0.7rem', marginTop: 1 }}>{subtitle}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className="px-2 py-0.5 text-xs"
              style={{
                background: '#151515',
                border: '1px solid #3f403d',
                borderRadius: '4px',
                color: '#8b867f',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.65rem',
                whiteSpace: 'nowrap',
              }}
            >
              {period}
            </span>
            {badge && (
              <span
                className="px-2 py-0.5 text-xs"
                style={{ background: '#0e352c', borderRadius: '4px', color: '#10b981', fontSize: '0.6rem' }}
              >
                {badge}
              </span>
            )}
          </div>
        </div>
        {description && (
          <p style={{ color: '#8b867f', fontSize: '0.75rem', lineHeight: 1.6, marginTop: 4 }}>{description}</p>
        )}
      </div>
    </div>
  );
}

const About = () => {
  const { isAuthenticated } = useAuth();
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultAboutData = {
    story: {
      intro: "I'm Shivu Kumar A M — a Linux engineer, full-stack web developer, and cyber security enthusiast. I don't treat these as separate roles — they reinforce each other.",
      skills: "My primary stack: Python, JavaScript, and Bash for scripting; Django, FastAPI, and Node.js on the backend; PostgreSQL, MySQL, and MongoDB for storage. I apply security principles throughout every layer.",
    },
    experiences: [
      {
        title: 'Full Stack Web Developer',
        company: 'Independent Projects',
        period: '2023 – Present',
        description: 'Building production web apps using Node.js, React, Django, and FastAPI with security-first architecture.',
        current: true,
      },
      {
        title: 'Linux & Security Research',
        company: 'Self-Directed',
        period: '2022 – Present',
        description: 'Linux internals, Kali tooling, web application security. Built malware analysis engine and encryption manager.',
        current: true,
      },
    ],
    education: [
      {
        degree: 'Master of Computer Applications (MCA)',
        school: 'University',
        period: '2024 – Present',
        description: 'Software engineering, web development, and information security.',
      },
    ],
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (isAuthenticated) {
          const token = localStorage.getItem('token');
          const res = await axios.get('/api/about', { headers: { Authorization: `Bearer ${token}` } });
          if (res.data.success) { setAboutData(res.data.data); return; }
        }
        setAboutData(defaultAboutData);
      } catch { setAboutData(defaultAboutData); }
      finally { setLoading(false); }
    })();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <section id="about" className="py-20 px-4" style={{ background: '#151515' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <div className="loading" />
        </div>
      </section>
    );
  }

  const { story, experiences, education } = aboutData || defaultAboutData;

  const stats = [
    { n: '4+',  label: 'Years on Linux' },
    { n: '12+', label: 'Projects Built' },
    { n: '3yr', label: 'Security Focus' },
    { n: '20+', label: 'Technologies' },
  ];

  const improving = [
    'Advanced backend patterns',
    'Linux internals & optimization',
    'Secure web architectures',
    'Python automation & tooling',
  ];

  return (
    <section
      id="about"
      className="py-20 px-4 relative overflow-hidden"
      style={{ background: '#151515' }}
    >
      {/* Ambient blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%', right: '0',
          width: 350, height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 12s ease-in-out infinite',
        }}
      />
      {/* Scan-line */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          height: 1,
          background: 'linear-gradient(to right, transparent 0%, rgba(16,185,129,0.12) 50%, transparent 100%)',
          animation: 'scanDown 12s linear infinite',
          top: 0,
        }}
      />
      {/* Floating dots */}
      {[
        { x: '5%',  y: '30%', s: 2, d: 0,   dur: 8  },
        { x: '92%', y: '55%', s: 3, d: 1.5, dur: 10 },
        { x: '50%', y: '85%', s: 2, d: 3,   dur: 7  },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: p.x, top: p.y,
            width: p.s, height: p.s,
            background: 'rgba(16,185,129,0.3)',
            animation: `float ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.d}s`,
          }}
        />
      ))}

      <div className="max-w-6xl mx-auto relative">
        {/* ── Header + stats in one tight row ── */}
        <div
          className="flex flex-wrap items-end justify-between gap-6 mb-10 pb-8"
          style={{ borderBottom: '1px solid #3f403d' }}
        >
          <div>
            <p className="eyebrow mb-2">About</p>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                fontWeight: 300,
                letterSpacing: '-0.018em',
                color: '#e9ebdf',
                margin: 0,
                lineHeight: 1,
              }}
            >
              Who I Am
            </h2>
          </div>
          {/* Inline stat strip */}
          <div className="flex gap-6">
            {stats.map(({ n, label }) => (
              <div key={label} className="text-right">
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: '#10b981',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {n}
                </div>
                <div style={{ color: '#8b867f', fontSize: '0.65rem', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main two-column grid ── */}
        <div className="grid lg:grid-cols-5 gap-8">

          {/* LEFT — YAML card + story ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* YAML terminal card */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: '#0e0e0e', border: '1px solid #3f403d' }}
            >
              {/* Title bar */}
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{ borderBottom: '1px solid #3f403d', background: '#151515' }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffbd2e' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28ca41' }} />
                <span
                  className="ml-2 text-xs"
                  style={{ fontFamily: '"JetBrains Mono", monospace', color: '#8b867f' }}
                >
                  ~/profile.yaml
                </span>
                <span
                  className="ml-auto text-xs"
                  style={{ fontFamily: '"JetBrains Mono", monospace', color: '#10b981' }}
                >
                  ● ACTIVE
                </span>
              </div>
              {/* YAML body */}
              <div
                className="p-4 text-xs leading-7"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                <div><span style={{ color: '#10b981' }}>Name</span><span style={{ color: '#3f403d' }}>: </span><span style={{ color: '#e9ebdf' }}>Shivu Kumar A M</span></div>
                <div><span style={{ color: '#10b981' }}>Core_Identity</span><span style={{ color: '#3f403d' }}>:</span></div>
                <div className="pl-4"><span style={{ color: '#10b981' }}>- </span><span style={{ color: '#cbccc4' }}>Linux</span></div>
                <div className="pl-4"><span style={{ color: '#10b981' }}>- </span><span style={{ color: '#cbccc4' }}>Full Stack Web Developer</span></div>
                <div className="pl-4"><span style={{ color: '#10b981' }}>- </span><span style={{ color: '#cbccc4' }}>Cyber Security Enthusiast</span></div>
                {/* <div><span style={{ color: '#10b981' }}>Languages</span><span style={{ color: '#3f403d' }}>: </span><span style={{ color: '#b6b8af' }}>Python, JavaScript, Bash</span></div>
                <div><span style={{ color: '#10b981' }}>Backend</span><span style={{ color: '#3f403d' }}>: </span><span style={{ color: '#b6b8af' }}>Django, FastAPI, Node.js</span></div>
                <div><span style={{ color: '#10b981' }}>Databases</span><span style={{ color: '#3f403d' }}>: </span><span style={{ color: '#b6b8af' }}>PostgreSQL, MySQL, MongoDB</span></div> */}
                <div>
                  <span style={{ color: '#10b981' }}>Mindset</span>
                  <span style={{ color: '#3f403d' }}>: </span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>Build → Secure → Automate</span>
                </div>
                <div>
                  <span style={{ color: '#10b981' }}>Portfolio</span>
                  <span style={{ color: '#3f403d' }}>: </span>
                  <a
                    href="https://shivukumar.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#10b981', textDecoration: 'underline', textDecorationColor: 'rgba(16,185,129,0.35)' }}
                  >
                    shivukumar.vercel.app ↗
                  </a>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span style={{ color: '#3f403d' }}>$</span>
                  <span style={{ color: '#10b981', animation: 'blink 1s step-end infinite' }}>▋</span>
                </div>
              </div>
            </div>

            {/* Story text */}
            <div
              className="rounded-xl p-5"
              style={{ background: '#242424', border: '1px solid #3f403d' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ background: '#151515', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  <i className="fas fa-user" style={{ color: '#10b981', fontSize: 8 }} />
                </div>
                <h3 style={{ color: '#e9ebdf', fontWeight: 600, fontSize: '0.8rem', margin: 0 }}>My Story</h3>
              </div>
              {[story.intro, story.skills].filter(Boolean).map((p, i) => (
                <p key={i} style={{ color: '#94958e', fontSize: '0.78rem', lineHeight: 1.7, marginBottom: i === 0 ? 8 : 0 }}>{p}</p>
              ))}
            </div>

            {/* How I work — compact */}
            <div
              className="rounded-xl p-5"
              style={{ background: '#242424', border: '1px solid #3f403d' }}
            >
              <p className="eyebrow mb-3">How I Work</p>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  ['01', 'Design the system'],
                  ['02', 'Build on Linux'],
                  ['03', 'Secure inputs & APIs'],
                  ['04', 'Automate everything'],
                  ['05', 'Monitor & improve'],
                ].map(([n, t]) => (
                  <div key={n} className="flex items-center gap-3">
                    <span
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: '#10b981',
                        fontSize: '0.65rem',
                        minWidth: 20,
                      }}
                    >
                      {n}
                    </span>
                    <span style={{ color: '#cbccc4', fontSize: '0.78rem' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — timeline + improving ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Experience */}
            {experiences?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <p className="eyebrow">Experience</p>
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, #3f403d, transparent)' }} />
                </div>
                {experiences.map((exp, i) => (
                  <TimelineItem
                    key={i}
                    icon="fas fa-briefcase"
                    title={exp.title}
                    subtitle={exp.company}
                    period={exp.period}
                    description={exp.description}
                    badge={exp.current ? 'Current' : null}
                    delay={i * 80}
                    isLast={i === experiences.length - 1 && (!education || education.length === 0)}
                  />
                ))}
              </div>
            )}

            {/* Education */}
            {education?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <p className="eyebrow">Education</p>
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, #3f403d, transparent)' }} />
                </div>
                {education.map((edu, i) => (
                  <TimelineItem
                    key={i}
                    icon="fas fa-graduation-cap"
                    title={edu.degree}
                    subtitle={edu.school}
                    period={edu.period}
                    description={edu.description}
                    delay={i * 80}
                    isLast={i === education.length - 1}
                  />
                ))}
              </div>
            )}

            {/* Core stack tags — horizontal */}
            <div
              className="rounded-xl p-5"
              style={{ background: '#242424', border: '1px solid #3f403d' }}
            >
              <p className="eyebrow mb-3">Core Stack</p>
              <div className="flex flex-wrap gap-2">
                {['Python', 'JavaScript', 'Bash', 'Django', 'FastAPI', 'Node.js', 'React', 'Linux', 'PostgreSQL', 'MongoDB'].map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 text-xs cursor-default transition-all duration-200"
                    style={{
                      background: '#151515',
                      border: '1px solid #3f403d',
                      borderRadius: '4px',
                      color: '#cbccc4',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.7rem',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3f403d'; e.currentTarget.style.color = '#cbccc4'; }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Currently improving — terminal */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: '#0e0e0e', border: '1px solid #3f403d' }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2"
                style={{ borderBottom: '1px solid #3f403d', background: '#151515' }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: '#ff5f57' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#ffbd2e' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#28ca41' }} />
                <span
                  className="ml-2 text-xs"
                  style={{ fontFamily: '"JetBrains Mono", monospace', color: '#8b867f' }}
                >
                  ~/currently-improving.md
                </span>
              </div>
              <div className="p-4">
                <p
                  className="mb-3 text-xs"
                  style={{ fontFamily: '"JetBrains Mono", monospace', color: '#10b981' }}
                >
                  🎯 Currently Improving
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {improving.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span style={{ color: '#10b981', fontSize: 8, marginTop: 4 }}>▸</span>
                      <span style={{ color: '#cbccc4', fontSize: '0.75rem', lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <span style={{ color: '#3f403d', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}>$</span>
                  <span style={{ color: '#10b981', fontFamily: '"JetBrains Mono", monospace', animation: 'blink 1s step-end infinite' }}>▋</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
