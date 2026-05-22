import React, { useState, useEffect } from 'react';
import axios from 'axios';

// skillicons.dev catalog — icon = key used in the URL
const SKILL_CATALOG = [
  // Languages
  { name: 'JavaScript',  icon: 'js',         category: 'Languages' },
  { name: 'TypeScript',  icon: 'ts',         category: 'Languages' },
  { name: 'Python',      icon: 'python',     category: 'Languages' },
  { name: 'Java',        icon: 'java',       category: 'Languages' },
  { name: 'PHP',         icon: 'php',        category: 'Languages' },
  { name: 'C++',         icon: 'cpp',        category: 'Languages' },
  { name: 'C',           icon: 'c',          category: 'Languages' },
  { name: 'C#',          icon: 'cs',         category: 'Languages' },
  { name: 'Go',          icon: 'go',         category: 'Languages' },
  { name: 'Rust',        icon: 'rust',       category: 'Languages' },
  { name: 'Swift',       icon: 'swift',      category: 'Languages' },
  { name: 'Kotlin',      icon: 'kotlin',     category: 'Languages' },
  { name: 'Dart',        icon: 'dart',       category: 'Languages' },
  { name: 'R',           icon: 'r',          category: 'Languages' },
  { name: 'Scala',       icon: 'scala',      category: 'Languages' },
  { name: 'Lua',         icon: 'lua',        category: 'Languages' },
  { name: 'Bash',        icon: 'bash',       category: 'Languages' },
  { name: 'Perl',        icon: 'perl',       category: 'Languages' },
  // Frontend
  { name: 'React',       icon: 'react',      category: 'Frontend' },
  { name: 'Next.js',     icon: 'nextjs',     category: 'Frontend' },
  { name: 'Vue.js',      icon: 'vuejs',      category: 'Frontend' },
  { name: 'Angular',     icon: 'angular',    category: 'Frontend' },
  { name: 'Svelte',      icon: 'svelte',     category: 'Frontend' },
  { name: 'HTML',        icon: 'html',       category: 'Frontend' },
  { name: 'CSS',         icon: 'css',        category: 'Frontend' },
  { name: 'TailwindCSS', icon: 'tailwind',   category: 'Frontend' },
  { name: 'Bootstrap',   icon: 'bootstrap',  category: 'Frontend' },
  { name: 'Sass',        icon: 'sass',       category: 'Frontend' },
  { name: 'Redux',       icon: 'redux',      category: 'Frontend' },
  { name: 'GraphQL',     icon: 'graphql',    category: 'Frontend' },
  { name: 'Flutter',     icon: 'flutter',    category: 'Frontend' },
  { name: 'Vite',        icon: 'vite',       category: 'Frontend' },
  { name: 'Webpack',     icon: 'webpack',    category: 'Frontend' },
  { name: 'Astro',       icon: 'astro',      category: 'Frontend' },
  { name: 'Remix',       icon: 'remix',      category: 'Frontend' },
  // Backend
  { name: 'Node.js',     icon: 'nodejs',     category: 'Backend' },
  { name: 'Express',     icon: 'express',    category: 'Backend' },
  { name: 'Django',      icon: 'django',     category: 'Backend' },
  { name: 'Flask',       icon: 'flask',      category: 'Backend' },
  { name: 'FastAPI',     icon: 'fastapi',    category: 'Backend' },
  { name: 'Spring',      icon: 'spring',     category: 'Backend' },
  { name: 'Laravel',     icon: 'laravel',    category: 'Backend' },
  { name: 'NestJS',      icon: 'nestjs',     category: 'Backend' },
  { name: 'Deno',        icon: 'deno',       category: 'Backend' },
  { name: 'Bun',         icon: 'bun',        category: 'Backend' },
  // Database
  { name: 'MongoDB',     icon: 'mongodb',    category: 'Database' },
  { name: 'MySQL',       icon: 'mysql',      category: 'Database' },
  { name: 'PostgreSQL',  icon: 'postgresql', category: 'Database' },
  { name: 'SQLite',      icon: 'sqlite',     category: 'Database' },
  { name: 'Redis',       icon: 'redis',      category: 'Database' },
  { name: 'Firebase',    icon: 'firebase',   category: 'Database' },
  { name: 'Supabase',    icon: 'supabase',   category: 'Database' },
  { name: 'Cassandra',   icon: 'cassandra',  category: 'Database' },
  { name: 'Prisma',      icon: 'prisma',     category: 'Database' },
  // DevOps
  { name: 'Docker',      icon: 'docker',     category: 'DevOps' },
  { name: 'Kubernetes',  icon: 'kubernetes', category: 'DevOps' },
  { name: 'Git',         icon: 'git',        category: 'DevOps' },
  { name: 'GitHub',      icon: 'github',     category: 'DevOps' },
  { name: 'GitLab',      icon: 'gitlab',     category: 'DevOps' },
  { name: 'AWS',         icon: 'aws',        category: 'DevOps' },
  { name: 'GCP',         icon: 'gcp',        category: 'DevOps' },
  { name: 'Azure',       icon: 'azure',      category: 'DevOps' },
  { name: 'Vercel',      icon: 'vercel',     category: 'DevOps' },
  { name: 'Netlify',     icon: 'netlify',    category: 'DevOps' },
  { name: 'Linux',       icon: 'linux',      category: 'DevOps' },
  { name: 'Nginx',       icon: 'nginx',      category: 'DevOps' },
  // Tools & Design
  { name: 'VS Code',     icon: 'vscode',     category: 'Tools' },
  { name: 'Figma',       icon: 'figma',      category: 'Tools' },
  { name: 'Jest',        icon: 'jest',       category: 'Tools' },
  { name: 'Postman',     icon: 'postman',    category: 'Tools' },
  { name: 'Selenium',    icon: 'selenium',   category: 'Tools' },
  { name: 'Electron',    icon: 'electron',   category: 'Tools' },
  { name: 'Unity',       icon: 'unity',      category: 'Tools' },
  { name: 'Arduino',     icon: 'arduino',    category: 'Tools' },
  { name: 'Raspberry Pi',icon: 'raspberrypi',category: 'Tools' },
  { name: 'TensorFlow',  icon: 'tensorflow', category: 'Tools' },
  { name: 'PyTorch',     icon: 'pytorch',    category: 'Tools' },
];

const SI_URL = (key) => `https://skillicons.dev/icons?i=${key}&theme=dark`;

// Render skill icon — si:key for skillicons, otherwise FontAwesome class
export function SkillIcon({ icon, size = 'w-8 h-8' }) {
  if (!icon) return <i className="fas fa-code text-slate-400"></i>;
  if (icon.startsWith('si:')) {
    return (
      <img
        src={SI_URL(icon.slice(3))}
        alt={icon.slice(3)}
        className={`${size} object-contain`}
        loading="lazy"
      />
    );
  }
  return <i className={`${icon} text-blue-400`}></i>;
}

// Map catalog display categories → valid Skill model enum values
const CAT_MAP = {
  Languages: 'languages',
  Frontend:  'frontend',
  Backend:   'backend',
  Database:  'database',
  DevOps:    'devops',
  Design:    'design',
  Tools:     'tools',
};

const CATEGORIES = ['All', ...new Set(SKILL_CATALOG.map(s => s.category))];

const emptyCustom = { name: '', level: 70, category: 'other', icon: 'fas fa-code', color: 'bg-blue-500' };

const SkillsForm = ({ skillsData, setSkillsData }) => {
  const [skills, setSkills] = useState([]);
  const [mode, setMode] = useState('picker'); // 'picker' | 'custom'
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set()); // set of icon keys already in catalog
  const [addingBatch, setAddingBatch] = useState(false);

  // Custom skill state
  const [customForm, setCustomForm] = useState(emptyCustom);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { setSkills(skillsData); }, [skillsData]);

  // Build set of already-added skillicon keys
  useEffect(() => {
    const added = new Set(
      skills.filter(s => s.icon?.startsWith('si:')).map(s => s.icon.slice(3))
    );
    setSelected(added);
  }, [skills]);

  const toggleSelect = (iconKey) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(iconKey) ? next.delete(iconKey) : next.add(iconKey);
      return next;
    });
  };

  const addSelectedSkills = async () => {
    // Find newly checked items (not yet saved)
    const alreadySaved = new Set(
      skills.filter(s => s.icon?.startsWith('si:')).map(s => s.icon.slice(3))
    );
    const toAdd = [...selected].filter(k => !alreadySaved.has(k));
    const toRemove = skills.filter(s => s.icon?.startsWith('si:') && !selected.has(s.icon.slice(3)));

    if (toAdd.length === 0 && toRemove.length === 0) return;
    setAddingBatch(true);

    try {
      // Delete removed skills
      for (const s of toRemove) {
        await axios.delete(`/api/skills/${s._id}`, { headers });
      }

      // Add new skills
      const added = [];
      for (const key of toAdd) {
        const catalog = SKILL_CATALOG.find(s => s.icon === key);
        const payload = {
          name: catalog?.name || key,
          icon: `si:${key}`,
          level: 70,
          category: CAT_MAP[catalog?.category] || 'other',
          color: 'bg-blue-500',
        };
        const { data } = await axios.post('/api/skills', payload, { headers });
        added.push(data);
      }

      const kept = skills.filter(s => !toRemove.find(r => r._id === s._id));
      const newList = [...kept, ...added];
      setSkills(newList);
      setSkillsData(newList);
      setMsg(`Saved ${toAdd.length > 0 ? `+${toAdd.length}` : ''}${toRemove.length > 0 ? ` -${toRemove.length}` : ''} skills`);
    } catch {
      setMsg('Error saving skills');
    }
    setAddingBatch(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const saveCustom = async () => {
    if (!customForm.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const { data } = await axios.put(`/api/skills/${editingId}`, customForm, { headers });
        const updated = skills.map(s => s._id === editingId ? data : s);
        setSkills(updated); setSkillsData(updated);
      } else {
        const { data } = await axios.post('/api/skills', customForm, { headers });
        const updated = [...skills, data];
        setSkills(updated); setSkillsData(updated);
      }
      setCustomForm(emptyCustom); setEditingId(null); setMsg('Saved!');
    } catch { setMsg('Error saving.'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const deleteSkill = async (id) => {
    await axios.delete(`/api/skills/${id}`, { headers });
    const updated = skills.filter(s => s._id !== id);
    setSkills(updated); setSkillsData(updated);
  };

  const startEdit = (skill) => {
    setCustomForm({ name: skill.name, level: skill.level, category: skill.category, icon: skill.icon, color: skill.color });
    setEditingId(skill._id);
    setMode('custom');
  };

  const filtered = SKILL_CATALOG.filter(s => {
    const matchCat = filterCat === 'All' || s.category === filterCat;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Manage Skills</h2>
        {msg && <span className="text-green-400 text-sm">{msg}</span>}
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 bg-slate-700/50 rounded-xl p-1 w-fit">
        <button onClick={() => setMode('picker')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'picker' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
          <i className="fas fa-th mr-2"></i>Icon Picker
        </button>
        <button onClick={() => setMode('custom')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'custom' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
          <i className="fas fa-plus mr-2"></i>Custom Skill
        </button>
      </div>

      {/* ── ICON PICKER MODE ── */}
      {mode === 'picker' && (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Check skills to add them. Uncheck to remove. Icons powered by{' '}
            <a href="https://skillicons.dev" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">skillicons.dev</a>
          </p>

          {/* Search + category filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search skills..."
              className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterCat === cat ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Icon grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-80 overflow-y-auto pr-1">
            {filtered.map(({ name, icon }) => {
              const checked = selected.has(icon);
              return (
                <button
                  key={icon}
                  onClick={() => toggleSelect(icon)}
                  title={name}
                  className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                    checked
                      ? 'border-blue-500 bg-blue-500/15 shadow-md shadow-blue-500/20'
                      : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
                  }`}
                >
                  <img
                    src={SI_URL(icon)}
                    alt={name}
                    className="w-9 h-9 object-contain"
                    loading="lazy"
                  />
                  <span className="text-slate-400 text-xs truncate w-full text-center leading-tight" style={{ fontSize: '10px' }}>
                    {name}
                  </span>
                  {checked && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white" style={{ fontSize: '8px' }}></i>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-700">
            <button
              onClick={addSelectedSkills}
              disabled={addingBatch}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
            >
              {addingBatch
                ? <><i className="fas fa-spinner fa-spin"></i> Saving…</>
                : <><i className="fas fa-save"></i> Save Selection</>}
            </button>
            <span className="text-slate-400 text-sm">{selected.size} selected</span>
          </div>
        </div>
      )}

      {/* ── CUSTOM SKILL MODE ── */}
      {mode === 'custom' && (
        <div className="bg-slate-700/40 border border-slate-600 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold">{editingId ? 'Edit Skill' : 'Add Custom Skill'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-sm">Skill Name</label>
              <input value={customForm.name}
                onChange={e => setCustomForm({ ...customForm, name: e.target.value })}
                className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Photoshop" />
            </div>
            <div>
              <label className="text-slate-400 text-sm">Category</label>
              <select value={customForm.category}
                onChange={e => setCustomForm({ ...customForm, category: e.target.value })}
                className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm">
                {['frontend','backend','languages','database','devops','design','tools','other'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-slate-400 text-sm">
                Icon — Font Awesome class (e.g. <code className="text-blue-400">fab fa-react</code>) or leave default
              </label>
              <input value={customForm.icon}
                onChange={e => setCustomForm({ ...customForm, icon: e.target.value })}
                className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm font-mono"
                placeholder="fas fa-code" />
            </div>
            <div className="col-span-2">
              <label className="text-slate-400 text-sm">Proficiency: {customForm.level}%</label>
              <input type="range" min="0" max="100" value={customForm.level}
                onChange={e => setCustomForm({ ...customForm, level: parseInt(e.target.value) })}
                className="w-full mt-1" />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={saveCustom} disabled={saving || !customForm.name.trim()}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 text-sm font-medium">
              {saving ? 'Saving…' : editingId ? 'Update' : 'Add Skill'}
            </button>
            {editingId && (
              <button onClick={() => { setCustomForm(emptyCustom); setEditingId(null); }}
                className="text-slate-400 hover:text-white text-sm transition-colors">Cancel</button>
            )}
          </div>
        </div>
      )}

      {/* ── SAVED SKILLS LIST ── */}
      <div>
        <h3 className="text-white font-semibold mb-3">Your Skills ({skills.length})</h3>
        {skills.length === 0
          ? <p className="text-slate-500 text-sm">No skills yet. Use the picker above to add some.</p>
          : (
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <div key={skill._id}
                  className="flex items-center gap-2 bg-slate-700/60 border border-slate-600 rounded-xl px-3 py-2 group">
                  <SkillIcon icon={skill.icon} size="w-5 h-5" />
                  <span className="text-white text-sm font-medium">{skill.name}</span>
                  <span className="text-slate-500 text-xs">{skill.level}%</span>
                  <div className="flex gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(skill)}
                      className="text-slate-400 hover:text-blue-400 transition-colors">
                      <i className="fas fa-edit text-xs"></i>
                    </button>
                    <button onClick={() => deleteSkill(skill._id)}
                      className="text-slate-400 hover:text-red-400 transition-colors">
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
};

export default SkillsForm;
