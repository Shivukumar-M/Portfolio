import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_STYLES   = ['cosmic', 'terminal', 'glass', 'magazine', 'retro'];
const STYLE_EMOJIS  = { cosmic: '🌌', terminal: '💻', glass: '🔮', magazine: '📰', retro: '🕹️' };
const STYLE_DEFAULTS = {
  cosmic:   { primary: '#a855f7', accent: '#06b6d4', bg: '#0a0015' },
  terminal: { primary: '#00ff41', accent: '#00d4ff', bg: '#0a0a0a' },
  glass:    { primary: '#8b5cf6', accent: '#06b6d4', bg: '#030712' },
  magazine: { primary: '#f97316', accent: '#fbbf24', bg: '#09090b' },
  retro:    { primary: '#ff007a', accent: '#00d4ff', bg: '#0d0018' },
};
const CATEGORIES = ['general', 'creative', 'minimal', 'corporate', 'developer', 'designer'];
const FONTS = [
  'Inter', 'Space Grotesk', 'Poppins', 'JetBrains Mono', 'Playfair Display',
  'Press Start 2P', 'Roboto', 'Montserrat', 'Fira Code', 'DM Sans',
];
const SECTIONS_LIST = [
  { key: 'home',           label: 'Home / Hero',    icon: 'fas fa-home',           defaultOn: true  },
  { key: 'about',          label: 'About',          icon: 'fas fa-user',           defaultOn: true  },
  { key: 'skills',         label: 'Skills',         icon: 'fas fa-code',           defaultOn: true  },
  { key: 'projects',       label: 'Projects',       icon: 'fas fa-folder',         defaultOn: true  },
  { key: 'experience',     label: 'Experience',     icon: 'fas fa-briefcase',      defaultOn: true  },
  { key: 'education',      label: 'Education',      icon: 'fas fa-graduation-cap', defaultOn: false },
  { key: 'certifications', label: 'Certifications', icon: 'fas fa-certificate',    defaultOn: true  },
  { key: 'services',       label: 'Services',       icon: 'fas fa-cogs',           defaultOn: false },
  { key: 'testimonials',   label: 'Testimonials',   icon: 'fas fa-quote-left',     defaultOn: false },
  { key: 'blog',           label: 'Blog',           icon: 'fas fa-blog',           defaultOn: false },
  { key: 'contact',        label: 'Contact',        icon: 'fas fa-envelope',       defaultOn: true  },
  { key: 'footer',         label: 'Footer',         icon: 'fas fa-stream',         defaultOn: true  },
];
const SOURCE_META = {
  'ui-built': { icon: 'fas fa-paint-brush', label: 'UI Built', color: '#8B5CF6' },
  'zip':      { icon: 'fas fa-file-archive', label: 'ZIP',     color: '#F59E0B' },
  'html':     { icon: 'fab fa-html5',        label: 'HTML',    color: '#F97316' },
  'react':    { icon: 'fab fa-react',        label: 'React',   color: '#06B6D4' },
};

const defaultSections = () =>
  Object.fromEntries(SECTIONS_LIST.map((s, i) => [s.key, { enabled: s.defaultOn, order: i }]));

const emptyForm = () => ({
  name: '', description: '', thumbnail: '', previewUrl: '',
  category: 'general', tags: '', version: '1.0', author: 'Admin',
  status: 'active', featured: false,
  sourceType: 'ui-built',
  baseStyle: 'cosmic', colors: { ...STYLE_DEFAULTS.cosmic },
  font: 'Inter', animationSpeed: 'normal', customCSS: '',
  sections: defaultSections(),
});

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    active:   'bg-green-900/30 text-green-400 border-green-700/40',
    inactive: 'bg-slate-700/30 text-slate-400 border-slate-600/40',
    draft:    'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.inactive}`}>
      {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
      {status}
    </span>
  );
};

// ─── SourceBadge ─────────────────────────────────────────────────────────────
const SourceBadge = ({ type }) => {
  const m = SOURCE_META[type] || SOURCE_META['ui-built'];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border"
      style={{ background: `${m.color}18`, color: m.color, borderColor: `${m.color}30` }}>
      <i className={`${m.icon} text-xs`} />
      {m.label}
    </span>
  );
};

// ─── Template row (list) ──────────────────────────────────────────────────────
const TemplateRow = ({ t, onEdit, onDelete, onToggleStatus, onToggleFeatured }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700 hover:border-slate-500 transition-all group">
    {/* Thumb */}
    <div className="w-16 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
      {t.thumbnail
        ? <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
        : (
          <div className="w-full h-full flex items-center justify-center gap-1" style={{ background: t.colors?.bg || '#0a0015' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: t.colors?.primary || '#a855f7' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: t.colors?.accent  || '#06b6d4' }} />
          </div>
        )
      }
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-white font-semibold text-sm">{t.name}</span>
        {t.featured && (
          <span className="px-1.5 py-0.5 bg-amber-900/30 text-amber-400 text-xs rounded border border-amber-700/30">★ Featured</span>
        )}
        <StatusBadge status={t.status} />
        <SourceBadge type={t.sourceType} />
      </div>
      <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-slate-400">
        <span className="capitalize">{STYLE_EMOJIS[t.baseStyle]} {t.baseStyle}</span>
        <span>·</span>
        <span className="capitalize">{t.category}</span>
        <span>·</span>
        <span>{t.usageCount || 0} uses</span>
        <span>·</span>
        <span>v{t.version}</span>
        {t.tags?.length > 0 && (
          <>
            <span>·</span>
            <div className="flex gap-1">
              {t.tags.slice(0, 3).map((g, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded">{g}</span>
              ))}
              {t.tags.length > 3 && <span className="text-slate-500">+{t.tags.length - 3}</span>}
            </div>
          </>
        )}
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
      <button onClick={() => onToggleFeatured(t._id)}
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
          t.featured ? 'bg-amber-600/20 text-amber-400' : 'bg-slate-700 text-slate-400 hover:text-amber-400'
        }`} title={t.featured ? 'Unfeature' : 'Feature'}>
        <i className="fas fa-star" />
      </button>
      <button onClick={() => onToggleStatus(t._id, t.status)}
        className="w-7 h-7 rounded-lg bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors"
        title={t.status === 'active' ? 'Deactivate' : 'Activate'}>
        <i className={`fas fa-${t.status === 'active' ? 'eye-slash' : 'eye'}`} />
      </button>
      {(t.sourceType === 'zip' || t.sourceType === 'html') && (
        <a href={`/api/templates/admin/${t._id}/download?token=${localStorage.getItem('token')}`}
          target="_blank" rel="noreferrer"
          className="w-7 h-7 rounded-lg bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors"
          title="Download file">
          <i className="fas fa-download" />
        </a>
      )}
      <button onClick={() => onEdit(t)}
        className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 flex items-center justify-center text-xs transition-colors"
        title="Edit">
        <i className="fas fa-pen" />
      </button>
      <button onClick={() => onDelete(t._id)}
        className="w-7 h-7 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 flex items-center justify-center text-xs transition-colors"
        title="Delete">
        <i className="fas fa-trash" />
      </button>
    </div>
  </div>
);

// ─── TemplateForm ─────────────────────────────────────────────────────────────
const TemplateForm = ({ initial, onSave, onCancel, saving }) => {
  const [form,    setForm]    = useState(initial || emptyForm());
  const [tab,     setTab]     = useState('source');
  const [file,    setFile]    = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const set  = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setC = (k, v) => setForm(p => ({ ...p, colors: { ...p.colors, [k]: v } }));
  const setS = (k, f, v) => setForm(p => ({
    ...p,
    sections: { ...p.sections, [k]: { ...p.sections[k], [f]: v } },
  }));

  const pickStyle = (style) => {
    setForm(p => ({ ...p, baseStyle: style, colors: { ...STYLE_DEFAULTS[style] } }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); set('sourceType', f.name.endsWith('.html') || f.name.endsWith('.htm') ? 'html' : 'zip'); }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); set('sourceType', f.name.endsWith('.html') || f.name.endsWith('.htm') ? 'html' : 'zip'); }
  };

  const INP = 'w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500';
  const LBL = 'block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5';

  const TABS = [
    { id: 'source',   icon: 'fas fa-upload',       label: 'Source'   },
    { id: 'info',     icon: 'fas fa-info-circle',   label: 'Info'     },
    { id: 'theme',    icon: 'fas fa-palette',       label: 'Theme'    },
    { id: 'sections', icon: 'fas fa-layer-group',   label: 'Sections' },
    { id: 'css',      icon: 'fas fa-code',          label: 'CSS'      },
  ];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/80">
        <div>
          <h3 className="text-white font-bold text-lg">
            {initial?._id ? 'Edit Template' : 'Create New Template'}
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            {initial?._id ? 'Update template settings' : 'Add a new template to the library'}
          </p>
        </div>
        <button onClick={onCancel} className="w-8 h-8 rounded-lg bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
          <i className="fas fa-times" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 px-2 bg-slate-800/50 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors -mb-px ${
              tab === t.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}>
            <i className={`${t.icon} text-xs`} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 overflow-y-auto max-h-[58vh]">

        {/* ── SOURCE TAB ────────────────────────────────────────── */}
        {tab === 'source' && (
          <div className="space-y-6">
            <div>
              <label className={LBL}>Template Source Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(SOURCE_META).map(([key, m]) => (
                  <button key={key} type="button" onClick={() => set('sourceType', key)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      form.sourceType === key
                        ? 'border-blue-500 bg-blue-900/20 scale-[1.02]'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-700/30'
                    }`}>
                    <i className={`${m.icon} text-2xl mb-2 block`} style={{ color: m.color }} />
                    <span className="text-xs text-white font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* File drop zone for zip/html */}
            {(form.sourceType === 'zip' || form.sourceType === 'html') && (
              <div>
                <label className={LBL}>
                  {form.sourceType === 'zip' ? 'ZIP File' : 'HTML File'}
                  {!initial?._id && ' *'}
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    dragging ? 'border-blue-500 bg-blue-900/10' :
                    file     ? 'border-green-500 bg-green-900/10' :
                               'border-slate-600 hover:border-slate-400 bg-slate-700/30'
                  }`}>
                  <input ref={fileRef} type="file"
                    accept={form.sourceType === 'html' ? '.html,.htm' : '.zip'}
                    onChange={handleFileChange} className="hidden" />
                  {file ? (
                    <>
                      <i className={`${SOURCE_META[form.sourceType].icon} text-3xl mb-3 block text-green-400`} />
                      <p className="text-white font-medium text-sm">{file.name}</p>
                      <p className="text-slate-400 text-xs mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-3xl mb-3 block text-slate-400" />
                      <p className="text-slate-300 text-sm font-medium">
                        Drop {form.sourceType === 'html' ? 'HTML' : 'ZIP'} file here or click to browse
                      </p>
                      <p className="text-slate-500 text-xs mt-1">Max 100 MB</p>
                    </>
                  )}
                </div>
                {initial?.fileName && !file && (
                  <p className="text-slate-400 text-xs mt-2">
                    <i className="fas fa-paperclip mr-1" />
                    Current file: {initial.fileName} · Upload new to replace
                  </p>
                )}
              </div>
            )}

            {/* UI-Built / React info */}
            {(form.sourceType === 'ui-built' || form.sourceType === 'react') && (
              <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-700">
                <div className="flex items-start gap-3">
                  <i className="fas fa-info-circle text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium mb-1">
                      {form.sourceType === 'ui-built' ? 'UI-Built Template' : 'React Template'}
                    </p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {form.sourceType === 'ui-built'
                        ? 'This template uses the built-in portfolio renderer. Configure its visual theme in the Theme tab. No file upload needed.'
                        : 'This template is powered by a React component. Set the base style and colors. Upload the component code in the ZIP source type if applicable.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── INFO TAB ─────────────────────────────────────────── */}
        {tab === 'info' && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Template Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Dark Neon Developer" className={INP} />
              </div>
              <div>
                <label className={LBL}>Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className={INP}>
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={LBL}>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={3} placeholder="A sleek dark portfolio for developers…" className={INP} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Thumbnail URL</label>
                <input value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)}
                  placeholder="https://…/preview.png" className={INP} />
                {form.thumbnail && (
                  <img src={form.thumbnail} alt="" className="mt-2 h-20 w-full object-cover rounded-lg" />
                )}
              </div>
              <div>
                <label className={LBL}>Preview / Live Demo URL</label>
                <input value={form.previewUrl} onChange={e => set('previewUrl', e.target.value)}
                  placeholder="https://…" className={INP} />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={LBL}>Version</label>
                <input value={form.version} onChange={e => set('version', e.target.value)}
                  placeholder="1.0" className={INP} />
              </div>
              <div>
                <label className={LBL}>Author</label>
                <input value={form.author} onChange={e => set('author', e.target.value)}
                  placeholder="Admin" className={INP} />
              </div>
              <div>
                <label className={LBL}>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className={INP}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => set('tags', e.target.value)}
                  placeholder="dark, minimal, neon" className={INP} />
              </div>
              <div className="flex items-center pt-6">
                <button type="button" onClick={() => set('featured', !form.featured)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    form.featured
                      ? 'bg-amber-900/30 border-amber-700/40 text-amber-400'
                      : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white'
                  }`}>
                  <i className="fas fa-star text-xs" />
                  {form.featured ? '★ Featured' : 'Mark as Featured'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── THEME TAB ─────────────────────────────────────────── */}
        {tab === 'theme' && (
          <div className="space-y-6">
            <div>
              <label className={LBL}>Base Style (determines portfolio renderer)</label>
              <div className="grid grid-cols-5 gap-2">
                {BASE_STYLES.map(style => (
                  <button key={style} type="button" onClick={() => pickStyle(style)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      form.baseStyle === style
                        ? 'border-blue-500 bg-blue-900/20 scale-105'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-700/30'
                    }`}>
                    <div className="text-2xl mb-1">{STYLE_EMOJIS[style]}</div>
                    <div className="text-xs text-white capitalize">{style}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={LBL}>Colors</label>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { k: 'primary', label: 'Primary' },
                  { k: 'accent',  label: 'Accent'  },
                  { k: 'bg',      label: 'Background' },
                ].map(({ k, label }) => (
                  <div key={k}>
                    <label className="block text-xs text-slate-500 mb-1">{label}</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.colors[k] || '#888888'}
                        onChange={e => setC(k, e.target.value)}
                        className="w-9 h-9 rounded-lg cursor-pointer border border-slate-600 p-0.5 bg-slate-700" />
                      <input type="text" value={form.colors[k] || ''} placeholder="#rrggbb"
                        onChange={e => setC(k, e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                ))}
              </div>
              {/* Quick palettes */}
              <div className="mt-3 flex gap-1.5 flex-wrap">
                <span className="text-slate-500 text-xs mr-1 self-center">Quick:</span>
                {[
                  { primary:'#a855f7',accent:'#06b6d4',bg:'#0a0015' },
                  { primary:'#00ff41',accent:'#00d4ff',bg:'#0a0a0a' },
                  { primary:'#f97316',accent:'#fbbf24',bg:'#09090b' },
                  { primary:'#ff007a',accent:'#00d4ff',bg:'#0d0018' },
                  { primary:'#0ea5e9',accent:'#22d3ee',bg:'#020b18' },
                  { primary:'#22c55e',accent:'#a3e635',bg:'#021a0e' },
                  { primary:'#ec4899',accent:'#f97316',bg:'#150010' },
                  { primary:'#6366f1',accent:'#8b5cf6',bg:'#020215' },
                ].map((p, i) => (
                  <button key={i} type="button" onClick={() => setForm(f => ({ ...f, colors: p }))}
                    className="flex gap-0.5 p-0.5 rounded-lg border border-slate-700 hover:border-slate-400 transition-all" title="Apply palette">
                    {[p.primary, p.accent, p.bg].map((c, j) => (
                      <div key={j} className="w-4 h-4 rounded" style={{ background: c }} />
                    ))}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Font</label>
                <select value={form.font} onChange={e => set('font', e.target.value)} className={INP}>
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <div className="mt-2 text-slate-300 text-base px-2" style={{ fontFamily: form.font }}>
                  {form.font === 'Press Start 2P' ? 'ABC 123' : 'The quick brown fox'}
                </div>
              </div>
              <div>
                <label className={LBL}>Animation Speed</label>
                <div className="grid grid-cols-4 gap-2">
                  {['none', 'slow', 'normal', 'fast'].map(s => (
                    <button key={s} type="button" onClick={() => set('animationSpeed', s)}
                      className={`py-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                        form.animationSpeed === s
                          ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                          : 'border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live preview */}
            <div className="p-4 rounded-xl border border-slate-600 overflow-hidden" style={{ background: form.colors.bg }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: form.colors.primary }} />
                <div className="w-3 h-3 rounded-full" style={{ background: form.colors.accent }} />
                <span className="text-xs" style={{ color: form.colors.accent }}>Live Preview</span>
              </div>
              <p className="text-xl font-bold truncate" style={{ color: form.colors.primary, fontFamily: form.font }}>
                {STYLE_EMOJIS[form.baseStyle]} {form.name || 'Template Preview'}
              </p>
              <p className="text-sm mt-1 truncate" style={{ color: form.colors.accent }}>
                {form.description || 'Your description will appear here'}
              </p>
              <div className="flex gap-2 mt-3">
                {[form.colors.primary, form.colors.accent, form.colors.bg].map((c, i) => (
                  <div key={i} className="flex-1 h-6 rounded" style={{ background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SECTIONS TAB ──────────────────────────────────────── */}
        {tab === 'sections' && (
          <div className="space-y-2">
            <p className="text-slate-400 text-sm mb-4">
              Configure which sections this template includes by default. Users can override in their dashboard.
            </p>
            {SECTIONS_LIST.map((s, idx) => {
              const sc = form.sections[s.key] || { enabled: s.defaultOn, order: idx };
              return (
                <div key={s.key} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-xl border border-slate-700">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <i className={`${s.icon} text-xs text-slate-400`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{s.label}</p>
                    <p className="text-slate-500 text-xs">Position: {sc.order + 1}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={sc.order}
                      onChange={e => setS(s.key, 'order', Number(e.target.value))}
                      className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none">
                      {SECTIONS_LIST.map((_, i) => <option key={i} value={i}>{i + 1}</option>)}
                    </select>
                    <button type="button" onClick={() => setS(s.key, 'enabled', !sc.enabled)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${sc.enabled ? 'bg-blue-600' : 'bg-slate-600'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${sc.enabled ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CSS TAB ───────────────────────────────────────────── */}
        {tab === 'css' && (
          <div>
            <p className="text-slate-400 text-sm mb-3">
              Custom CSS injected into portfolios using this template.
              Use <code className="bg-slate-700 px-1 rounded text-blue-300 font-mono text-xs">var(--color-primary)</code>,{' '}
              <code className="bg-slate-700 px-1 rounded text-blue-300 font-mono text-xs">var(--color-accent)</code>,{' '}
              <code className="bg-slate-700 px-1 rounded text-blue-300 font-mono text-xs">var(--color-bg)</code> for theme colors.
            </p>
            <textarea
              value={form.customCSS}
              onChange={e => set('customCSS', e.target.value)}
              rows={16}
              spellCheck={false}
              placeholder={`/* Example */\nh1 {\n  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n.skill-card:hover {\n  border-color: var(--color-primary);\n  transform: translateY(-4px);\n}`}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-green-300 font-mono text-sm focus:outline-none focus:border-blue-500 resize-y"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between bg-slate-800/50">
        <div className="flex gap-1.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-2 h-2 rounded-full transition-colors ${tab === t.id ? 'bg-blue-500' : 'bg-slate-600'}`} />
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(form, file)} disabled={saving || !form.name}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
            {saving
              ? <><i className="fas fa-spinner fa-spin text-xs" /> Saving…</>
              : <><i className="fas fa-save text-xs" /> {initial?._id ? 'Update Template' : 'Create Template'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main TemplateLibrary (unified admin component) ───────────────────────────
export default function TemplateLibrary({ onCountChange }) {
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [toast,     setToast]     = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [search,    setSearch]    = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterSrc, setFilterSrc] = useState('all');
  const [filterSt,  setFilterSt]  = useState('all');

  const toast$ = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/templates/admin/all', { headers: authH() });
      setTemplates(data);
      onCountChange?.(data.length);
    } catch {
      toast$('Failed to load templates', 'err');
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form, file) => {
    if (!form.name.trim()) return toast$('Name is required', 'err');
    setSaving(true);
    try {
      const fd = new FormData();
      if (file) fd.append('templateFile', file);

      const tags = typeof form.tags === 'string'
        ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
        : form.tags;

      fd.append('name',           form.name);
      fd.append('description',    form.description);
      fd.append('thumbnail',      form.thumbnail);
      fd.append('previewUrl',     form.previewUrl);
      fd.append('category',       form.category);
      fd.append('version',        form.version);
      fd.append('author',         form.author);
      fd.append('status',         form.status);
      fd.append('featured',       String(form.featured));
      fd.append('sourceType',     form.sourceType);
      fd.append('baseStyle',      form.baseStyle);
      fd.append('font',           form.font);
      fd.append('animationSpeed', form.animationSpeed);
      fd.append('customCSS',      form.customCSS);
      fd.append('colors',         JSON.stringify(form.colors));
      fd.append('sections',       JSON.stringify(form.sections));
      tags.forEach(t => fd.append('tags', t));

      const hdrs = { ...authH(), 'Content-Type': 'multipart/form-data' };

      if (editing?._id) {
        await axios.put(`/api/templates/admin/${editing._id}`, fd, { headers: hdrs });
        toast$('Template updated');
      } else {
        await axios.post('/api/templates/admin', fd, { headers: hdrs });
        toast$('Template created');
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      toast$(err.response?.data?.message || 'Save failed', 'err');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template permanently? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/templates/admin/${id}`, { headers: authH() });
      toast$('Template deleted');
      setTemplates(prev => prev.filter(t => t._id !== id));
      onCountChange?.(templates.length - 1);
    } catch {
      toast$('Delete failed', 'err');
    }
  };

  const handleToggleStatus = async (id, cur) => {
    const next = cur === 'active' ? 'inactive' : 'active';
    try {
      await axios.patch(`/api/templates/admin/${id}/status`, { status: next }, { headers: authH() });
      setTemplates(prev => prev.map(t => t._id === id ? { ...t, status: next } : t));
    } catch {
      toast$('Update failed', 'err');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const { data } = await axios.patch(`/api/templates/admin/${id}/featured`, {}, { headers: authH() });
      setTemplates(prev => prev.map(t => t._id === id ? { ...t, featured: data.featured } : t));
    } catch {
      toast$('Update failed', 'err');
    }
  };

  const handleEdit = (t) => {
    setEditing({
      ...emptyForm(),
      ...t,
      tags:     (t.tags || []).join(', '),
      colors:   { ...STYLE_DEFAULTS[t.baseStyle || 'cosmic'], ...(t.colors || {}) },
      sections: { ...defaultSections(), ...(t.sections || {}) },
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filtered = templates.filter(t => {
    if (filterSt  !== 'all' && t.status     !== filterSt)  return false;
    if (filterCat !== 'all' && t.category   !== filterCat) return false;
    if (filterSrc !== 'all' && t.sourceType !== filterSrc) return false;
    if (search) {
      const q = search.toLowerCase();
      return [t.name, t.description, ...(t.tags || [])].some(v => v?.toLowerCase().includes(q));
    }
    return true;
  });

  const stats = {
    total:    templates.length,
    active:   templates.filter(t => t.status === 'active').length,
    featured: templates.filter(t => t.featured).length,
    uses:     templates.reduce((s, t) => s + (t.usageCount || 0), 0),
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <i className="fas fa-paint-brush text-white text-sm" />
            </div>
            Template Library
          </h2>
          <p className="text-slate-400 text-sm mt-1 ml-12">
            Upload or build templates — they appear instantly in users' Design tab
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-lg">
          <i className="fas fa-plus text-xs" />
          Add Template
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',       value: stats.total,    icon: 'fas fa-layer-group',  color: '#3B82F6' },
          { label: 'Active',      value: stats.active,   icon: 'fas fa-check-circle', color: '#10B981' },
          { label: 'Featured',    value: stats.featured, icon: 'fas fa-star',         color: '#F59E0B' },
          { label: 'Total Uses',  value: stats.uses,     icon: 'fas fa-users',        color: '#8B5CF6' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{s.value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form panel */}
      {showForm && (
        <div className="mb-6">
          <TemplateForm
            initial={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            saving={saving}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, tags…"
            className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none">
          <option value="all">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
        <select value={filterSrc} onChange={e => setFilterSrc(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none">
          <option value="all">All sources</option>
          {Object.entries(SOURCE_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </select>
        <select value={filterSt} onChange={e => setFilterSt(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={load}
          className="w-9 h-9 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
          <i className={`fas fa-sync-alt text-xs ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* List */}
      {loading && templates.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading templates…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
          <i className="fas fa-paint-brush text-4xl text-slate-600 block mb-3" />
          <p className="text-white font-semibold mb-1">
            {templates.length === 0 ? 'No templates yet' : 'No templates match your filters'}
          </p>
          <p className="text-slate-400 text-sm mb-4">
            {templates.length === 0
              ? 'Add your first template — upload a ZIP/HTML or build one with the UI builder'
              : 'Try adjusting search or filters'}
          </p>
          {templates.length === 0 && (
            <button onClick={() => { setEditing(null); setShowForm(true); }}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
              Add First Template
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <TemplateRow
              key={t._id}
              t={t}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
          <p className="text-xs text-slate-500 text-center pt-2">
            Showing {filtered.length} of {templates.length} templates
          </p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium ${
          toast.type === 'err'
            ? 'bg-red-950 border border-red-700/40 text-red-300'
            : 'bg-green-950 border border-green-700/40 text-green-300'
        }`}>
          <i className={`fas ${toast.type === 'err' ? 'fa-exclamation-circle' : 'fa-check-circle'}`} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
