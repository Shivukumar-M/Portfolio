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

const defaultProjects = [
  {
    _id: 'p1', emoji: '☣️', title: 'Malware Analysis Engine',
    description: 'Static malware inspection & analysis system. Analyses suspicious files for malicious patterns and behaviours using Python tooling on Linux.',
    technologies: ['Python', 'Linux'], githubLink: 'https://github.com/Shivukumar-M', cardColor: '#ef4444',
  },
  {
    _id: 'p2', emoji: '🔐', title: 'Encryption Manager',
    description: 'AES-256 encryption & key management tool. Provides secure file and data encryption with a clean Java interface and proper key lifecycle management.',
    technologies: ['Java', 'Cryptography'], githubLink: 'https://github.com/Shivukumar-M', cardColor: '#f59e0b',
  },
  {
    _id: 'p3', emoji: '🚗', title: 'DreamCars Rental',
    description: 'Full-stack vehicle rental & management portal with booking system, admin panel, and fleet management built with PHP and MySQL.',
    technologies: ['PHP', 'MySQL'], githubLink: 'https://github.com/Shivukumar-M', cardColor: '#06b6d4',
  },
  {
    _id: 'p4', emoji: '🤖', title: 'SDIT / Gemini Automation',
    description: 'CLI & web automation for institutional workflows. Integrates Google Gemini API for intelligent task processing and reporting automation.',
    technologies: ['Python', 'Node.js'], githubLink: 'https://github.com/Shivukumar-M', cardColor: '#00ff88',
  },
  {
    _id: 'p5', emoji: '👁️', title: 'FaceCapture AI',
    description: 'Biometric authentication prototype using facial recognition for secure access control. Built with JavaScript and OpenCV integration.',
    technologies: ['JavaScript', 'OpenCV'], githubLink: 'https://github.com/Shivukumar-M', cardColor: '#a855f7',
  },
  {
    _id: 'p6', emoji: '🌐', title: 'CivicSense',
    description: 'Secure civic issue reporting web platform. Citizens can report and track local infrastructure problems with full authentication and notification system.',
    technologies: ['Node.js', 'React', 'PostgreSQL'], githubLink: 'https://github.com/Shivukumar-M', cardColor: '#3b82f6',
  },
];

function ProjectCard({ project, delay }) {
  const [ref, visible] = useReveal(0.06);
  const color = project.cardColor || '#00ff88';

  return (
    <div
      ref={ref}
      className="shimmer-card rounded-xl overflow-hidden group"
      style={{
        background: 'linear-gradient(135deg, rgba(26,26,26,0.95), rgba(10,10,10,0.95))',
        border: '1px solid rgba(255,255,255,0.08)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, border-color 0.25s ease, box-shadow 0.25s ease`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}66`;
        e.currentTarget.style.boxShadow = `0 10px 40px rgba(0,0,0,0.6), 0 0 20px ${color}22`;
        e.currentTarget.style.transform = 'translateY(-5px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Visual panel */}
      <div className="h-40 relative overflow-hidden" style={{ background: '#09090b' }}>
        {project.emoji ? (
          <div className="w-full h-full flex items-center justify-center text-5xl relative">
            {/* Grid overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(${color}14 1px, transparent 1px), linear-gradient(90deg, ${color}14 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />
            {/* Corner accent */}
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-bl-3xl"
              style={{ background: `radial-gradient(circle at 100% 0%, ${color}22, transparent 70%)` }}
            />
            {/* Bottom accent bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: `linear-gradient(to right, ${color}44, transparent)` }}
            />
            <span
              className="relative z-10 transition-transform duration-300 group-hover:scale-110"
            >
              {project.emoji}
            </span>
          </div>
        ) : (
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3
          className="mb-2 transition-colors"
          style={{
            color: '#fafafa',
            fontWeight: 600,
            fontSize: '0.9rem',
            letterSpacing: '-0.01em',
          }}
        >
          {project.title}
        </h3>
        <p
          className="mb-4 leading-relaxed"
          style={{ color: '#71717a', fontSize: '0.775rem', lineHeight: 1.65 }}
        >
          {project.description}
        </p>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.technologies.map((tech, i) => (
            <span
              key={`${project._id}-${tech}-${i}`}
              className="px-2 py-0.5 rounded text-xs"
              style={{
                background: '#09090b',
                color: '#d4d4d8',
                border: '1px solid #27272a',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.68rem',
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div
          className="h-px w-full mb-4"
          style={{ background: '#27272a' }}
        />
        <div className="flex items-center gap-4">
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: '#71717a', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fafafa'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#71717a'; }}
            >
              <i className="fab fa-github" />
              <span>Code</span>
            </a>
          )}
          {project.liveDemo && (
            <a
              href={project.liveDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: color, textDecoration: 'none' }}
            >
              <i className="fas fa-external-link-alt" />
              <span>Live Demo</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const Projects = () => {
  const { isAuthenticated, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const techFilters = ['all', 'React', 'Node.js', 'Python', 'Django', 'JavaScript', 'Java', 'PHP'];

  useEffect(() => {
    (async () => {
      try {
        if (isAuthenticated && user) {
          const token = localStorage.getItem('token');
          const res = await axios.get('/api/projects', { headers: { Authorization: `Bearer ${token}` } });
          setProjects(res.data);
        } else {
          setProjects(defaultProjects);
        }
      } catch { setProjects(defaultProjects); }
      finally { setLoading(false); }
    })();
  }, [isAuthenticated, user]);

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter((p) => p.technologies.some((t) => t.toLowerCase() === filter.toLowerCase()));

  if (loading) {
    return (
      <section id="projects" className="py-20 px-4" style={{ background: '#09090b' }}>
        <div className="container mx-auto max-w-6xl text-center">
          <div className="loading mx-auto mb-4" />
          <p style={{ color: '#71717a', fontSize: '0.875rem' }}>Loading Projects…</p>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 px-4 relative overflow-hidden" style={{ background: '#09090b' }}>
      {/* Amber blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '20%', left: '20%',
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,43,17,0.10), transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 14s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />
      {/* Scan-line */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          height: 1,
          background: 'linear-gradient(to right, transparent 0%, rgba(0,255,136,0.10) 50%, transparent 100%)',
          animation: 'scanDown 10s linear infinite',
          animationDelay: '4s',
          top: 0,
        }}
      />
      {/* Floating dots */}
      {[
        { x: '15%', y: '20%', s: 2, d: 0.5, dur: 9  },
        { x: '85%', y: '70%', s: 3, d: 2,   dur: 7  },
        { x: '70%', y: '15%', s: 2, d: 1,   dur: 11 },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: p.x, top: p.y,
            width: p.s, height: p.s,
            background: 'rgba(0,255,136,0.28)',
            animation: `float ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.d}s`,
          }}
        />
      ))}

      <div className="container mx-auto max-w-6xl relative">

        {/* Heading */}
        <div className="text-center mb-14">
          <p className="eyebrow mb-4">What I've Built</p>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 300,
              letterSpacing: '-0.014em',
              color: '#fafafa',
              marginBottom: '1rem',
            }}
          >
            My <span className="gradient-text">Projects</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #27272a)' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00ff88' }} />
            <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #27272a)' }} />
          </div>
          <p style={{ color: '#71717a', fontSize: '0.875rem' }}>
            Spanning Linux tooling, web applications, and security utilities
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-10">
          <div
            className="rounded-xl p-1 flex flex-wrap justify-center gap-1"
            style={{ background: '#18181b', border: '1px solid #27272a' }}
          >
            {techFilters.map((tech) => (
              <button
                key={tech}
                onClick={() => setFilter(tech)}
                className="px-4 py-1.5 rounded-lg capitalize text-sm transition-all duration-200"
                style={
                  filter === tech
                    ? { background: 'linear-gradient(135deg, #00ff88, #00d4ff)', color: '#000', fontWeight: 700 }
                    : { color: '#71717a' }
                }
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <p
            className="text-center py-12"
            style={{ color: '#71717a', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.875rem' }}
          >
            No projects found matching: {filter}
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project._id || project.title} project={project} delay={index * 75} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
