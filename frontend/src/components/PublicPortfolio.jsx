import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import HireMeModal from './HireMeModal';

import TemplateCosmic   from './templates/TemplateCosmic';
import TemplateTerminal from './templates/TemplateTerminal';
import TemplateGlass    from './templates/TemplateGlass';
import TemplateMagazine from './templates/TemplateMagazine';
import TemplateRetro    from './templates/TemplateRetro';

const TEMPLATES = {
  cosmic:   TemplateCosmic,
  terminal: TemplateTerminal,
  glass:    TemplateGlass,
  magazine: TemplateMagazine,
  retro:    TemplateRetro,
};

export default function PublicPortfolio() {
  const { username } = useParams();
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);
  const [hireMeOpen, setHireMeOpen] = useState(false);

  useEffect(() => {
    axios.get(`/api/u/${username}`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(e => { setLoading(false); if (e.response?.status === 404) setNotFound(true); });
  }, [username]);

  // Track visit
  useEffect(() => {
    if (!username) return;
    const sessionId = sessionStorage.getItem('sid') || (() => {
      const id = Math.random().toString(36).slice(2);
      sessionStorage.setItem('sid', id);
      return id;
    })();
    axios.post(`/api/analytics/track/${username}`, { page: '/', sessionId }).catch(() => {});
  }, [username]);

  // OG / document meta tags — uses seoConfig when available (Feature 3)
  useEffect(() => {
    if (!data) return;
    const p    = data.profile || {};
    const seo  = data.seoConfig || {};
    const title = seo.title       || `${p.name || username} — Portfolio`;
    const desc  = seo.description || (p.bio || '').slice(0, 155) || `${p.name || username}'s portfolio.`;
    const prev  = document.title;

    const setMeta = (attr, val, prop = false) => {
      const sel = prop ? `meta[property="${attr}"]` : `meta[name="${attr}"]`;
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); el.setAttribute(prop ? 'property' : 'name', attr); document.head.appendChild(el); }
      el.setAttribute('content', val);
    };

    document.title = title;
    setMeta('description', desc);
    setMeta('og:title',       title,             true);
    setMeta('og:description', desc,              true);
    setMeta('og:image',       p.photo || '',     true);
    setMeta('og:url',         window.location.href, true);
    setMeta('og:type',        'profile',         true);
    setMeta('twitter:card',   'summary_large_image');
    setMeta('twitter:title',  title);
    setMeta('twitter:image',  p.photo || '');

    return () => { document.title = prev; };
  }, [data, username]);

  // Inject CSS variables from templateConfig.colors (Feature 4 — Live Theme Engine)
  useEffect(() => {
    if (!data?.templateConfig?.colors) return;
    const { primary, accent, bg } = data.templateConfig.colors;
    const root = document.documentElement;
    if (primary) root.style.setProperty('--color-primary', primary);
    if (accent)  root.style.setProperty('--color-accent',  accent);
    if (bg)      root.style.setProperty('--color-bg',      bg);
    return () => {
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-accent');
      root.style.removeProperty('--color-bg');
    };
  }, [data]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading portfolio…</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center px-4">
      <div>
        <p className="text-8xl mb-6">🔍</p>
        <h1 className="text-4xl font-bold text-white mb-3">@{username} not found</h1>
        <p className="text-slate-400 mb-8">This portfolio doesn't exist yet.</p>
        <Link to="/" className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-500 transition-colors">Go Home</Link>
      </div>
    </div>
  );

  const cfg        = data.templateConfig || {};
  const templateId = cfg.templateId || 'cosmic';
  const Template   = TEMPLATES[templateId] || TemplateCosmic;

  const config = {
    ...cfg,
    animationTheme: data.animationTheme || 'cosmic',
    sectionOrder:   data.sectionOrder   || ['about','skills','projects','experience','certifications','testimonials','blog','contact'],
  };

  return (
    <>
      <Template data={data} config={config} />

      {/* Floating Hire Me button */}
      <button onClick={() => setHireMeOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full shadow-2xl shadow-blue-500/30 flex items-center gap-2 transition-all hover:scale-105">
        <i className="fas fa-briefcase" /> Hire Me
      </button>

      {hireMeOpen && (
        <HireMeModal
          portfolioUserId={data.user?._id || data._id}
          ownerName={data.profile?.name || username}
          onClose={() => setHireMeOpen(false)}
        />
      )}
    </>
  );
}
