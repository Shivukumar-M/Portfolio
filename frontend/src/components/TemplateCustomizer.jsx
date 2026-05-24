import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FONTS } from './templates/utils';

// ─── Built-in template definitions ────────────────────────────────────────────
const BUILT_IN = [
  { id: 'cosmic',   name: 'Cosmic',        emoji: '🌌', desc: 'Space particles, glitch text, 3D tilt',    preview: 'from-purple-950 via-indigo-950 to-slate-950', accent: '#a855f7' },
  { id: 'terminal', name: 'Terminal',       emoji: '💻', desc: 'Hacker aesthetic, ASCII art, code vibes',  preview: 'from-black to-green-950',                    accent: '#00ff41' },
  { id: 'glass',    name: 'Glassmorphism',  emoji: '🔮', desc: 'Frosted glass, ambient orbs, minimal',     preview: 'from-slate-950 via-violet-950 to-slate-950', accent: '#8b5cf6' },
  { id: 'magazine', name: 'Magazine',       emoji: '📰', desc: 'Bold editorial, huge type, asymmetric',   preview: 'from-zinc-950 to-zinc-900',                  accent: '#f97316' },
  { id: 'retro',    name: 'Retro Wave',     emoji: '🕹️', desc: 'Synthwave, neon glow, grid floor',         preview: 'from-purple-950 via-fuchsia-950 to-purple-950', accent: '#ff007a' },
];

const STYLE_DEFAULTS = {
  cosmic:   { primary: '#a855f7', accent: '#06b6d4', bg: '#0a0015' },
  terminal: { primary: '#00ff41', accent: '#00d4ff', bg: '#0a0a0a' },
  glass:    { primary: '#8b5cf6', accent: '#06b6d4', bg: '#030712' },
  magazine: { primary: '#f97316', accent: '#fbbf24', bg: '#09090b' },
  retro:    { primary: '#ff007a', accent: '#00d4ff', bg: '#0d0018' },
};

const STYLE_FONTS = {
  cosmic: 'Inter', terminal: 'JetBrains Mono', glass: 'Space Grotesk',
  magazine: 'Playfair Display', retro: 'Press Start 2P',
};

const CATEGORIES = ['all', 'general', 'creative', 'minimal', 'corporate', 'developer', 'designer'];

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ─── Mini template preview card ───────────────────────────────────────────────
const TemplateCard = ({ tmpl, selected, onSelect, onPreview }) => {
  const baseId = tmpl.baseStyle || tmpl.id;
  const accent = tmpl.accent || tmpl.colors?.primary || '#a855f7';
  const bgColor = tmpl.colors?.bg || null;

  return (
    <div className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 group ${
      selected
        ? 'border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.02]'
        : 'border-slate-700 hover:border-slate-500 hover:scale-[1.01]'
    }`}>
      {/* Preview area */}
      <div
        className={`h-32 relative overflow-hidden flex items-center justify-center ${!bgColor ? `bg-gradient-to-br ${tmpl.preview || 'from-slate-950 to-slate-900'}` : ''}`}
        style={bgColor ? { background: bgColor } : {}}>

        {/* Thumbnail image */}
        {tmpl.thumbnail && (
          <img src={tmpl.thumbnail} alt={tmpl.name}
            className="absolute inset-0 w-full h-full object-cover opacity-80" />
        )}

        {/* Decorative preview when no thumbnail */}
        {!tmpl.thumbnail && baseId === 'cosmic' && (
          <>
            {[...Array(10)].map((_,i) => (
              <div key={i} className="absolute w-1 h-1 rounded-full"
                style={{ background: accent, top:`${(i*37)%95}%`, left:`${(i*53)%95}%`, opacity: 0.6 }} />
            ))}
            <div className="text-3xl font-black" style={{ color: accent, textShadow:`0 0 20px ${accent}` }}>◆</div>
          </>
        )}
        {!tmpl.thumbnail && baseId === 'terminal' && (
          <div className="text-left px-4 w-full font-mono text-xs" style={{ color: accent }}>
            <div>$ whoami</div><div style={{ opacity:0.7 }}>developer</div>
            <div>$ ls skills</div><div style={{ opacity:0.7 }}>[████░] 80%</div>
          </div>
        )}
        {!tmpl.thumbnail && baseId === 'glass' && (
          <>
            <div className="absolute top-4 left-4 w-16 h-16 rounded-full blur-xl opacity-50" style={{ background: accent }} />
            <div className="w-24 h-14 rounded-2xl" style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', backdropFilter:'blur(8px)' }} />
          </>
        )}
        {!tmpl.thumbnail && baseId === 'magazine' && (
          <div className="text-left px-4 w-full">
            <div className="text-xs tracking-widest uppercase mb-1" style={{ color: accent }}>Portfolio</div>
            <div className="text-3xl font-black text-white uppercase leading-none">YOUR<br />NAME</div>
          </div>
        )}
        {!tmpl.thumbnail && baseId === 'retro' && (
          <>
            <div className="absolute inset-0" style={{ backgroundImage:`linear-gradient(${accent}22 1px,transparent 1px),linear-gradient(90deg,${accent}22 1px,transparent 1px)`, backgroundSize:'16px 16px' }} />
            <div className="text-xl font-bold" style={{ color: accent, textShadow:`0 0 10px ${accent}` }}>▶ START</div>
          </>
        )}

        {/* Overlay badges */}
        {tmpl.featured && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-600/90 text-white text-xs rounded-full backdrop-blur-sm">
            ★ Featured
          </div>
        )}
        {tmpl.isDB && !tmpl.thumbnail && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-purple-600/80 text-white text-xs rounded-full backdrop-blur-sm">
            Custom
          </div>
        )}
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <i className="fas fa-check text-white text-xs" />
          </div>
        )}

        {/* Preview hover overlay */}
        {tmpl.previewUrl && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button onClick={e => { e.stopPropagation(); onPreview(tmpl.previewUrl); }}
              className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-lg border border-white/30 hover:bg-white/30 transition-colors">
              <i className="fas fa-external-link-alt mr-1" /> Live Preview
            </button>
          </div>
        )}
      </div>

      {/* Info + Use button */}
      <div className="p-3 bg-slate-800/90">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{tmpl.emoji || '🎨'}</span>
              <span className="font-bold text-white text-sm truncate">{tmpl.name}</span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">{tmpl.desc || tmpl.description}</p>
          </div>
        </div>
        {tmpl.tags?.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2">
            {tmpl.tags.slice(0,3).map((tag,i) => (
              <span key={i} className="px-1.5 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">{tag}</span>
            ))}
          </div>
        )}
        <button onClick={() => onSelect(tmpl)}
          className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selected
              ? 'bg-purple-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
          }`}>
          {selected ? '✓ Using this template' : 'Use this template'}
        </button>
      </div>
    </div>
  );
};

// ─── Main TemplateCustomizer ──────────────────────────────────────────────────
const TemplateCustomizer = ({ profileData }) => {
  const username = profileData?.username || '';

  const [cfg, setCfg] = useState({
    templateId:       'cosmic',
    selectedPresetId: null,
    colors:           { ...STYLE_DEFAULTS.cosmic },
    font:             'Inter',
    animationSpeed:   'normal',
    customCSS:        '',
    customJS:         '',
    sections:         { about: true, skills: true, projects: true, contact: true },
  });

  const [dbTemplates,  setDbTemplates]  = useState([]);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [panel,        setPanel]        = useState('gallery'); // gallery | colors | font | speed | sections | code
  const [searchQ,      setSearchQ]      = useState('');
  const [catFilter,    setCatFilter]    = useState('all');
  const [loadingTmpls, setLoadingTmpls] = useState(false);

  // Load saved config
  useEffect(() => {
    const existing = profileData?.templateConfig;
    if (existing?.templateId) {
      setCfg(prev => ({
        ...prev,
        ...existing,
        colors:   { ...prev.colors,   ...(existing.colors   || {}) },
        sections: { ...prev.sections, ...(existing.sections || {}) },
      }));
    }
  }, [profileData]);

  // Fetch DB templates
  useEffect(() => {
    setLoadingTmpls(true);
    const params = {};
    if (catFilter !== 'all') params.category = catFilter;
    if (searchQ) params.search = searchQ;
    axios.get('/api/templates', { params })
      .then(({ data }) => setDbTemplates(data))
      .catch(() => {})
      .finally(() => setLoadingTmpls(false));
  }, [catFilter, searchQ]);

  // All templates = built-ins + DB templates
  const allTemplates = [
    ...BUILT_IN.map(t => ({ ...t, isBuiltIn: true })),
    ...dbTemplates.map(t => ({
      id:       `db_${t._id}`,
      _id:      t._id,
      name:     t.name,
      emoji:    '🎨',
      desc:     t.description,
      preview:  BUILT_IN.find(b => b.id === (t.baseStyle || 'cosmic'))?.preview || 'from-slate-950 to-slate-900',
      accent:   t.colors?.primary || '#a855f7',
      baseStyle: t.baseStyle || 'cosmic',
      colors:   t.colors,
      font:     t.font,
      animationSpeed: t.animationSpeed,
      customCSS: t.customCSS,
      sections: t.sections,
      featured: t.featured,
      usageCount: t.usageCount,
      thumbnail: t.thumbnail,
      previewUrl: t.previewUrl,
      tags:     t.tags,
      isDB:     true,
    })),
  ];

  const filteredTemplates = allTemplates.filter(t => {
    if (catFilter !== 'all' && !t.isBuiltIn) return true; // already filtered by API
    if (catFilter !== 'all' && t.isBuiltIn) return false;
    if (searchQ && t.isBuiltIn) {
      const q = searchQ.toLowerCase();
      return [t.name, t.desc, ...(t.tags || [])].some(v => v?.toLowerCase().includes(q));
    }
    return true;
  });

  const isSelected = (tmpl) => {
    if (cfg.selectedPresetId) return tmpl.id === cfg.selectedPresetId;
    return tmpl.isBuiltIn && tmpl.id === cfg.templateId;
  };

  const handleSelect = async (tmpl) => {
    if (tmpl.isBuiltIn) {
      const defaults = STYLE_DEFAULTS[tmpl.id] || {};
      const defFont  = STYLE_FONTS[tmpl.id]    || 'Inter';
      setCfg(prev => ({
        ...prev,
        templateId:       tmpl.id,
        selectedPresetId: null,
        colors:           { ...defaults },
        font:             defFont,
      }));
    } else {
      // DB template: use its baseStyle for rendering, apply its colors/font/CSS
      const base         = tmpl.baseStyle || 'cosmic';
      const defaultColors = STYLE_DEFAULTS[base] || {};
      const defaultFont   = STYLE_FONTS[base]    || 'Inter';
      const applySections = tmpl.sections
        ? Object.fromEntries(
            Object.entries(tmpl.sections).map(([k, v]) => [k, v?.enabled ?? true])
          )
        : cfg.sections;

      setCfg(prev => ({
        ...prev,
        templateId:       base,
        selectedPresetId: tmpl.id,
        colors:           { ...defaultColors, ...(tmpl.colors || {}) },
        font:             tmpl.font || defaultFont,
        animationSpeed:   tmpl.animationSpeed || prev.animationSpeed,
        customCSS:        tmpl.customCSS || '',
        sections:         applySections,
      }));

      // Increment usage count
      try {
        await axios.post(`/api/templates/${tmpl._id}/use`, {}, { headers: authHeaders() });
        setDbTemplates(prev => prev.map(t => t._id === tmpl._id ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t));
      } catch { /* ignore */ }
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.patch('/api/u/settings/template-config', { templateConfig: cfg }, { headers: authHeaders() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  };

  const update = (k, v) => setCfg(prev => ({ ...prev, [k]: v }));
  const updateColor   = (k, v) => setCfg(prev => ({ ...prev, colors:   { ...prev.colors,   [k]: v } }));
  const updateSection = (k, v) => setCfg(prev => ({ ...prev, sections: { ...prev.sections, [k]: v } }));

  const activeTemplate =
    allTemplates.find(t => t.id === cfg.selectedPresetId) ||
    BUILT_IN.find(t => t.id === cfg.templateId) ||
    BUILT_IN[0];

  const panels = [
    { id: 'gallery',  icon: 'fas fa-th-large',     label: 'Templates'   },
    { id: 'colors',   icon: 'fas fa-palette',       label: 'Colors'      },
    { id: 'font',     icon: 'fas fa-font',           label: 'Font'        },
    { id: 'speed',    icon: 'fas fa-tachometer-alt', label: 'Animation'   },
    { id: 'sections', icon: 'fas fa-layer-group',    label: 'Sections'    },
    { id: 'code',     icon: 'fas fa-code',           label: 'Custom Code' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-magic text-purple-400" /> Design Studio
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Using: <span className="text-white font-medium">{activeTemplate.emoji} {activeTemplate.name}</span>
            {username && <> · <span className="text-blue-400 font-mono text-xs">/u/{username}</span></>}
          </p>
        </div>
        <div className="flex gap-3">
          {username && (
            <button onClick={() => window.open(`/u/${username}`, '_blank')}
              className="px-4 py-2 bg-blue-900/30 border border-blue-700/40 text-blue-300 rounded-lg text-sm hover:bg-blue-900/50 transition-all flex items-center gap-2">
              <i className="fas fa-external-link-alt" /> Preview
            </button>
          )}
          <button onClick={save} disabled={saving}
            className="px-6 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white disabled:opacity-50 flex items-center gap-2">
            {saving ? <><i className="fas fa-spinner fa-spin" /> Saving…</> : saved ? <><i className="fas fa-check" /> Saved!</> : <><i className="fas fa-save" /> Save Design</>}
          </button>
        </div>
      </div>

      {/* Panel tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-slate-700 pb-3">
        {panels.map(p => (
          <button key={p.id} onClick={() => setPanel(p.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              panel === p.id
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}>
            <i className={`${p.icon} text-xs`} />
            <span className="hidden sm:inline">{p.label}</span>
          </button>
        ))}
      </div>

      {/* ── GALLERY ───────────────────────────────────────────────── */}
      {panel === 'gallery' && (
        <div>
          {/* Search + category filter */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-48">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search templates…"
                className="w-full pl-8 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  catFilter === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}>{cat === 'all' ? 'All Templates' : cat}</button>
            ))}
          </div>

          {/* Built-in templates */}
          {(catFilter === 'all' || catFilter === 'developer') && !searchQ && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Built-in Styles ({BUILT_IN.length})
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {BUILT_IN.map(t => (
                  <TemplateCard
                    key={t.id}
                    tmpl={t}
                    selected={isSelected(t)}
                    onSelect={handleSelect}
                    onPreview={(url) => window.open(url, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* DB templates */}
          {loadingTmpls ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-3" />
              <span className="text-slate-400 text-sm">Loading custom designs…</span>
            </div>
          ) : dbTemplates.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dbTemplates.map(t => {
                const card = allTemplates.find(c => c._id === t._id);
                return card ? (
                  <TemplateCard
                    key={card.id}
                    tmpl={card}
                    selected={isSelected(card)}
                    onSelect={handleSelect}
                    onPreview={(url) => window.open(url, '_blank')}
                  />
                ) : null;
              })}
            </div>
          ) : (catFilter !== 'all' || searchQ) ? (
            <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
              <p className="text-slate-400 text-sm">No custom designs match your search</p>
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
              <i className="fas fa-paint-brush text-3xl text-slate-600 block mb-2" />
              <p className="text-slate-400 text-sm">No custom designs yet</p>
              <p className="text-slate-500 text-xs mt-1">Admin can add more designs via the Admin Panel</p>
            </div>
          )}
        </div>
      )}

      {/* ── COLORS ────────────────────────────────────────────────── */}
      {panel === 'colors' && (
        <div>
          <p className="text-slate-400 text-sm mb-6">Customize the color palette of your selected template.</p>
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {[
              { key: 'primary', label: 'Primary Color',    desc: 'Main accent, headings, buttons' },
              { key: 'accent',  label: 'Secondary Color',  desc: 'Gradients, links, highlights'   },
              { key: 'bg',      label: 'Background Color', desc: 'Page background'                },
            ].map(({ key, label, desc }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-white mb-1">{label}</label>
                <p className="text-xs text-slate-500 mb-3">{desc}</p>
                <div className="flex items-center gap-3">
                  <input type="color" value={cfg.colors[key] || '#888'}
                    onChange={e => updateColor(key, e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-600 p-0.5 bg-slate-700" />
                  <input type="text" value={cfg.colors[key] || ''}
                    onChange={e => updateColor(key, e.target.value)} placeholder="#rrggbb"
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {['#a855f7','#06b6d4','#f97316','#00ff41','#ff007a','#0ea5e9','#ec4899','#00ff88'].map(c => (
                    <button key={c} onClick={() => updateColor(key, c)}
                      className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-all"
                      style={{ background: c, borderColor: cfg.colors[key] === c ? '#fff' : 'transparent' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-slate-700">
            <p className="text-sm font-semibold text-white mb-4">Quick Palettes</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { name:'Cosmic Purple', colors:{ primary:'#a855f7', accent:'#06b6d4', bg:'#0a0015' } },
                { name:'Neon Sunset',   colors:{ primary:'#ff6b6b', accent:'#ffd93d', bg:'#0d0208' } },
                { name:'Ocean Deep',    colors:{ primary:'#0ea5e9', accent:'#22d3ee', bg:'#020b18' } },
                { name:'Forest Dark',   colors:{ primary:'#22c55e', accent:'#a3e635', bg:'#021a0e' } },
                { name:'Rose Gold',     colors:{ primary:'#fb7185', accent:'#fbbf24', bg:'#160209' } },
                { name:'Electric',      colors:{ primary:'#00ffe0', accent:'#ff00aa', bg:'#000510' } },
                { name:'Midnight',      colors:{ primary:'#6366f1', accent:'#8b5cf6', bg:'#020215' } },
                { name:'Matrix',        colors:{ primary:'#00ff41', accent:'#00cc33', bg:'#000800' } },
              ].map(preset => (
                <button key={preset.name} onClick={() => setCfg(p => ({ ...p, colors: preset.colors }))}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 hover:border-slate-500 transition-all text-left">
                  <div className="flex gap-1">
                    {Object.values(preset.colors).slice(0,2).map((c,i) => (
                      <div key={i} className="w-5 h-5 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-300">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FONT ──────────────────────────────────────────────────── */}
      {panel === 'font' && (
        <div>
          <p className="text-slate-400 text-sm mb-6">Choose a typeface for your portfolio.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {FONTS.map(f => (
              <button key={f.id} onClick={() => update('font', f.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  cfg.font === f.id ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700 hover:border-slate-500'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">{f.label}</span>
                  {cfg.font === f.id && <i className="fas fa-check text-purple-400 text-xs" />}
                </div>
                <div className="text-2xl text-slate-300" style={{ fontFamily: f.id }}>
                  {f.id === 'Press Start 2P' ? 'ABC' : 'The quick brown fox'}
                </div>
                <span className="text-xs text-slate-500 capitalize mt-1 block">{f.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── ANIMATION SPEED ───────────────────────────────────────── */}
      {panel === 'speed' && (
        <div>
          <p className="text-slate-400 text-sm mb-6">Control how fast elements animate in.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'none',   label: '⏸ None'   },
              { id: 'slow',   label: '🐢 Slow'  },
              { id: 'normal', label: '⚡ Normal' },
              { id: 'fast',   label: '🚀 Fast'  },
            ].map(opt => (
              <button key={opt.id} onClick={() => update('animationSpeed', opt.id)}
                className={`p-6 rounded-xl border text-center transition-all ${
                  cfg.animationSpeed === opt.id
                    ? 'border-purple-500 bg-purple-900/20 scale-105'
                    : 'border-slate-700 hover:border-slate-500'
                }`}>
                <div className="text-3xl mb-2">{opt.label.split(' ')[0]}</div>
                <div className="text-white font-semibold capitalize">{opt.id}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTIONS ──────────────────────────────────────────────── */}
      {panel === 'sections' && (
        <div>
          <p className="text-slate-400 text-sm mb-6">Show or hide sections in your public portfolio.</p>
          <div className="space-y-3 max-w-md">
            {[
              { key: 'about',    icon: 'fas fa-user',     label: 'About / Experience',  desc: 'Your story and work history'     },
              { key: 'skills',   icon: 'fas fa-code',     label: 'Skills',               desc: 'Technical skills with bars'      },
              { key: 'projects', icon: 'fas fa-folder',   label: 'Projects',             desc: 'Your portfolio projects'         },
              { key: 'contact',  icon: 'fas fa-envelope', label: 'Contact',              desc: 'Email, phone, social links'      },
            ].map(({ key, icon, label, desc }) => (
              <label key={key} className="flex items-center justify-between p-4 rounded-xl border border-slate-700 hover:border-slate-600 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.sections[key] ? 'bg-blue-900/40' : 'bg-slate-700/40'}`}>
                    <i className={`${icon} text-sm ${cfg.sections[key] ? 'text-blue-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{label}</p>
                    <p className="text-slate-500 text-xs">{desc}</p>
                  </div>
                </div>
                <div className="relative">
                  <div onClick={() => updateSection(key, !cfg.sections[key])}
                    className={`w-12 h-6 rounded-full transition-all cursor-pointer ${cfg.sections[key] ? 'bg-blue-600' : 'bg-slate-600'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${cfg.sections[key] ? 'left-6' : 'left-0.5'}`} />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── CUSTOM CODE ───────────────────────────────────────────── */}
      {panel === 'code' && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-paint-brush text-blue-400" />
              <label className="text-white font-semibold">Custom CSS</label>
              <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">Injected into your portfolio</span>
            </div>
            <textarea value={cfg.customCSS} onChange={e => update('customCSS', e.target.value)}
              rows={12} spellCheck={false}
              placeholder={`/* Override any template style */\nh1 { letter-spacing: -0.04em; }\n\n.skill-card:hover { transform: translateY(-4px); }`}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-green-300 font-mono text-sm focus:outline-none focus:border-blue-500 resize-y" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-bolt text-yellow-400" />
              <label className="text-white font-semibold">Custom JavaScript</label>
              <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">Runs on page load</span>
            </div>
            <textarea value={cfg.customJS} onChange={e => update('customJS', e.target.value)}
              rows={10} spellCheck={false}
              placeholder={`// Runs in your visitors' browsers\n// document.querySelectorAll('.skill-card').forEach(el => { ... });`}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-yellow-200 font-mono text-sm focus:outline-none focus:border-blue-500 resize-y" />
            <div className="mt-2 p-3 rounded-lg border border-yellow-800/30 bg-yellow-950/20">
              <p className="text-xs text-yellow-500/80 flex items-center gap-2">
                <i className="fas fa-info-circle" />
                JavaScript runs directly in your visitors' browsers. Only add code you trust.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom save bar */}
      <div className="mt-10 pt-6 border-t border-slate-700 flex items-center justify-between flex-wrap gap-4">
        <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
          <span>Template: <span className="text-white">{activeTemplate.emoji} {activeTemplate.name}</span></span>
          <span>·</span>
          <span>Font: <span className="text-white">{cfg.font}</span></span>
          <span>·</span>
          <span>Speed: <span className="text-white capitalize">{cfg.animationSpeed}</span></span>
        </div>
        <div className="flex gap-3">
          {username && (
            <button onClick={() => window.open(`/u/${username}`, '_blank')}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-all flex items-center gap-2">
              <i className="fas fa-eye" /> Preview
            </button>
          )}
          <button onClick={save} disabled={saving}
            className="px-6 py-2 rounded-lg font-semibold text-white text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 flex items-center gap-2">
            {saving ? <><i className="fas fa-spinner fa-spin" /> Saving…</> : saved ? <><i className="fas fa-check" /> Saved!</> : <><i className="fas fa-save" /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCustomizer;
