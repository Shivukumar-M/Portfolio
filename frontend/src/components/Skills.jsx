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

const GROUPS = [
  {
    label: 'Languages & Systems',
    icon: '⚡',
    skills: [
      { name: 'Python',     icon: 'python' },
      { name: 'JavaScript', icon: 'js' },
      { name: 'PHP',        icon: 'php' },
      { name: 'Java',       icon: 'java' },
      { name: 'Bash',       icon: 'bash' },
      { name: 'Linux',      icon: 'linux' },
      { name: 'Kali',       icon: 'kali' },
    ],
  },
  {
    label: 'Web & Backend',
    icon: '🌐',
    skills: [
      { name: 'Node.js',  icon: 'nodejs' },
      { name: 'React',    icon: 'react' },
      { name: 'Django',   icon: 'django' },
      { name: 'FastAPI',  icon: 'fastapi' },
      { name: 'HTML',     icon: 'html' },
      { name: 'CSS',      icon: 'css' },
      { name: 'Tailwind', icon: 'tailwind' },
    ],
  },
  {
    label: 'Databases & DevOps',
    icon: '🗄️',
    skills: [
      { name: 'MySQL',      icon: 'mysql' },
      { name: 'PostgreSQL', icon: 'postgres' },
      { name: 'MongoDB',    icon: 'mongodb' },
      { name: 'Docker',     icon: 'docker' },
      { name: 'AWS',        icon: 'aws' },
      { name: 'Git',        icon: 'git' },
      { name: 'Vercel',     icon: 'vercel' },
    ],
  },
];

/* Floating ambient particles for section background */
const PARTICLES = [
  { x: '8%',  y: '15%', size: 3, delay: 0,    dur: 7 },
  { x: '22%', y: '70%', size: 2, delay: 1.2,  dur: 9 },
  { x: '45%', y: '25%', size: 4, delay: 0.5,  dur: 6 },
  { x: '60%', y: '80%', size: 2, delay: 2.1,  dur: 8 },
  { x: '75%', y: '40%', size: 3, delay: 0.8,  dur: 10 },
  { x: '88%', y: '60%', size: 2, delay: 1.6,  dur: 7 },
  { x: '35%', y: '55%', size: 2, delay: 3,    dur: 9 },
  { x: '92%', y: '20%', size: 3, delay: 0.3,  dur: 6 },
];

function SkillChip({ name, icon }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 cursor-default transition-all duration-200"
      style={{
        background: '#151515',
        border: '1px solid #3f403d',
        borderRadius: '7px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(16,185,129,0.55)';
        e.currentTarget.style.boxShadow = '0 0 12px rgba(16,185,129,0.1)';
        e.currentTarget.style.background = '#1a1a1a';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#3f403d';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.background = '#151515';
      }}
    >
      <img
        src={`https://skillicons.dev/icons?i=${icon}&theme=dark`}
        alt={name}
        className="w-4 h-4 object-contain"
        loading="lazy"
      />
      <span style={{ color: '#cbccc4', fontSize: '0.7rem', fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'nowrap' }}>
        {name}
      </span>
    </div>
  );
}

function SkillGroup({ group, groupIndex }) {
  const [ref, visible] = useReveal(0.06);
  const row1 = group.skills.slice(0, 4);
  const row2 = group.skills.slice(4);

  return (
    <div
      ref={ref}
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        background: '#1c1c1c',
        border: '1px solid #3f403d',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${groupIndex * 160}ms, transform 0.6s ease ${groupIndex * 160}ms`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.28)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3f403d'; }}
    >
      {/* Ambient corner glow */}
      <div
        className="absolute top-0 right-0 w-28 h-28 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 100% 0%, rgba(16,185,129,0.07), transparent 70%)' }}
      />

      {/* Category header */}
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: '0.85rem' }}>{group.icon}</span>
        <span style={{
          color: '#e9ebdf',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.72rem',
          fontWeight: 700,
        }}>
          {group.label}
        </span>
        <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(16,185,129,0.35), transparent)' }} />
      </div>

      {/* Triangle chip layout — row 1: 4 chips, row 2: 3 chips indented */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {row1.map((s) => <SkillChip key={s.name} name={s.name} icon={s.icon} />)}
        </div>
        <div className="flex flex-wrap gap-2" style={{ paddingLeft: '1.5rem' }}>
          {row2.map((s) => <SkillChip key={s.name} name={s.name} icon={s.icon} />)}
        </div>
      </div>
    </div>
  );
}

const Skills = () => {
  const { isAuthenticated, user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'languages', 'frontend', 'backend', 'database', 'devops', 'design', 'tools'];

  useEffect(() => {
    (async () => {
      try {
        if (isAuthenticated && user) {
          const token = localStorage.getItem('token');
          const res = await axios.get('/api/skills', { headers: { Authorization: `Bearer ${token}` } });
          setSkills(res.data);
        }
      } catch { setSkills([]); }
      finally { setLoading(false); }
    })();
  }, [isAuthenticated, user]);

  const displayedSkills = activeCategory === 'all'
    ? skills
    : skills.filter((s) => s.category === activeCategory);

  if (loading) {
    return (
      <section id="skills" className="py-20 px-4" style={{ background: '#151515' }}>
        <div className="container mx-auto max-w-6xl text-center">
          <div className="loading mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="py-20 px-4 relative overflow-hidden" style={{ background: '#151515' }}>

      {/* ── Animated floating particles ── */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: 'rgba(16,185,129,0.35)',
            borderRadius: '50%',
            animation: `float ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* ── Animated scan-line ── */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          height: 1,
          background: 'linear-gradient(to right, transparent 0%, rgba(16,185,129,0.18) 50%, transparent 100%)',
          animation: 'scanDown 8s linear infinite',
          top: 0,
        }}
      />

      {/* ── Subtle grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="container mx-auto max-w-5xl relative">

        {/* Heading */}
        <div
          className="flex flex-wrap items-end justify-between gap-4 mb-10 pb-6"
          style={{ borderBottom: '1px solid #3f403d' }}
        >
          <div>
            <p className="eyebrow mb-2">Tech Stack</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 300, letterSpacing: '-0.014em', color: '#e9ebdf', margin: 0 }}>
              My <span className="gradient-text">Skills</span>
            </h2>
          </div>
          <p style={{ color: '#8b867f', fontSize: '0.825rem', maxWidth: '28rem' }}>
            Technologies I use to build, secure, and automate.
          </p>
        </div>

        {/* ── Unauthenticated: triangle group cards ── */}
        {!isAuthenticated && (
          <div className="grid lg:grid-cols-3 gap-5">
            {GROUPS.map((g, i) => (
              <SkillGroup key={g.label} group={g} groupIndex={i} />
            ))}
          </div>
        )}

        {/* ── Authenticated: filtered grid ── */}
        {isAuthenticated && (
          <>
            <div className="flex flex-wrap gap-2 mb-8">
              {categories
                .filter((c) => c === 'all' || skills.some((s) => s.category === c))
                .map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-3 py-1 text-xs capitalize transition-all duration-200"
                    style={
                      activeCategory === cat
                        ? { background: '#10b981', color: '#fff', borderRadius: '4px', border: '1px solid #10b981', fontWeight: 600 }
                        : { background: '#242424', color: '#8b867f', borderRadius: '4px', border: '1px solid #3f403d' }
                    }
                  >
                    {cat}
                  </button>
                ))}
            </div>

            {displayedSkills.length === 0 ? (
              <p style={{ color: '#8b867f', fontSize: '0.875rem', fontFamily: '"JetBrains Mono", monospace', textAlign: 'center', padding: '3rem 0' }}>
                No skills for: {activeCategory}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {displayedSkills.map((skill, index) => (
                  <div
                    key={skill._id || `${skill.name}-${index}`}
                    className="p-4 rounded-xl text-center transition-all duration-200"
                    style={{ background: '#242424', border: '1px solid #3f403d' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.45)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3f403d'; }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2.5 overflow-hidden"
                      style={{ background: '#151515', border: '1px solid #3f403d' }}
                    >
                      {skill.icon?.startsWith('si:') ? (
                        <img src={`https://skillicons.dev/icons?i=${skill.icon.slice(3)}&theme=dark`} alt={skill.name} className="w-6 h-6 object-contain" loading="lazy" />
                      ) : skill.icon?.startsWith('http') || skill.icon?.includes('/images/') ? (
                        <img src={skill.icon} alt={skill.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <i className={`${skill.icon || 'fas fa-cogs'} text-base`} style={{ color: '#cbccc4' }} />
                      )}
                    </div>
                    <p style={{ color: '#cbccc4', fontSize: '0.72rem', fontWeight: 500, margin: 0 }}>{skill.name}</p>
                    {skill.level && (
                      <div className="mt-2">
                        <div style={{ height: 2, background: '#151515', borderRadius: 2 }}>
                          <div style={{ height: 2, width: `${skill.level}%`, background: '#10b981', borderRadius: 2 }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Skills;
