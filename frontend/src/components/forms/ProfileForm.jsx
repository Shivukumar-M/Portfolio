import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const ANIMATION_THEMES = [
  { id: 'cosmic',  label: 'Cosmic',  emoji: '🌌', desc: 'Purple nebula, star particles' },
  { id: 'neon',    label: 'Neon',    emoji: '⚡', desc: 'Cyan & pink electric glow' },
  { id: 'ocean',   label: 'Ocean',   emoji: '🌊', desc: 'Deep blue water vibes' },
  { id: 'matrix',  label: 'Matrix',  emoji: '🟩', desc: 'Green digital rain' },
  { id: 'minimal', label: 'Minimal', emoji: '⬜', desc: 'Clean, subtle, professional' },
];

const EMPTY_FORM = {
  name: '', photo: '', title: '', bio: '',
  github: '', linkedin: '', twitter: '',
};

const ProfileForm = ({ profileData, setProfileData }) => {
  const [formData,   setFormData]   = useState(EMPTY_FORM);
  const [username,   setUsername]   = useState('');
  const [animTheme,  setAnimTheme]  = useState('cosmic');
  const [usernameMsg, setUsernameMsg] = useState('');
  const [usernameErr, setUsernameErr] = useState('');
  const [themeMsg,   setThemeMsg]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [message,    setMessage]    = useState('');
  const [error,      setError]      = useState('');
  const [isDirty,    setIsDirty]    = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // '' | 'auto-saving' | 'auto-saved'

  const photoInputRef   = useRef(null);
  const formDataRef     = useRef(formData);       // always current formData without closure issues
  const historyRef      = useRef({ past: [], future: [] });
  const autoSaveTimer   = useRef(null);
  const snapshotTimer   = useRef(null);
  const isDirtyRef      = useRef(false);

  // Keep refs in sync
  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { isDirtyRef.current  = isDirty;  }, [isDirty]);

  // Populate form when profileData loads
  useEffect(() => {
    if (!profileData) return;
    const initial = {
      name:     profileData.profile?.name              || '',
      photo:    profileData.profile?.photo             || '',
      title:    profileData.profile?.title             || '',
      bio:      profileData.profile?.bio               || '',
      github:   profileData.profile?.social?.github    || '',
      linkedin: profileData.profile?.social?.linkedin  || '',
      twitter:  profileData.profile?.social?.twitter   || '',
    };
    setFormData(initial);
    setUsername(profileData.username || '');
    setAnimTheme(profileData.animationTheme || 'cosmic');
    // Seed history with the loaded state so first Ctrl+Z reverts to server state
    historyRef.current = { past: [initial], future: [] };
    setIsDirty(false);
  }, [profileData]);

  // ── Core save logic (used by manual save AND auto-save) ──────────────────────
  const doSave = useCallback(async ({ silent = false } = {}) => {
    if (!silent) { setLoading(true); setError(''); setMessage(''); }
    else setSaveStatus('auto-saving');

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const fd = formDataRef.current;
      const profile = {
        name:  fd.name,
        photo: fd.photo,
        title: fd.title,
        bio:   fd.bio,
        social: { github: fd.github, linkedin: fd.linkedin, twitter: fd.twitter },
      };
      const res = await axios.put('/api/profile', { profile }, { headers });
      setProfileData(res.data);

      if (!silent) {
        setMessage('Profile saved!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setSaveStatus('auto-saved');
        setTimeout(() => setSaveStatus(''), 2500);
      }
      setIsDirty(false);
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || 'Save failed');
      else setSaveStatus('');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [setProfileData]);

  // ── Push a debounced snapshot to the undo history ────────────────────────────
  const scheduleSnapshot = useCallback((prevSnapshot) => {
    clearTimeout(snapshotTimer.current);
    snapshotTimer.current = setTimeout(() => {
      historyRef.current.past.push(prevSnapshot);
      historyRef.current.future = [];       // new change clears redo stack
      if (historyRef.current.past.length > 60) historyRef.current.past.shift();
    }, 500);
  }, []);

  // ── Reset auto-save countdown (fires 30s after last change) ──────────────────
  const resetAutoSave = useCallback(() => {
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (isDirtyRef.current) doSave({ silent: true });
    }, 30000);
  }, [doSave]);

  // Cleanup timers on unmount
  useEffect(() => () => {
    clearTimeout(autoSaveTimer.current);
    clearTimeout(snapshotTimer.current);
  }, []);

  // ── handleChange: wraps every field change ────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const prev = formDataRef.current;
    setFormData(p => ({ ...p, [name]: value }));
    setIsDirty(true);
    scheduleSnapshot({ ...prev });
    resetAutoSave();
  }, [scheduleSnapshot, resetAutoSave]);

  // ── Undo ──────────────────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (past.length === 0) return;
    const prev = past.pop();
    future.push({ ...formDataRef.current });
    setFormData(prev);
    setIsDirty(true);
    resetAutoSave();
  }, [resetAutoSave]);

  // ── Redo ──────────────────────────────────────────────────────────────────────
  const handleRedo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (future.length === 0) return;
    const next = future.pop();
    past.push({ ...formDataRef.current });
    setFormData(next);
    setIsDirty(true);
    resetAutoSave();
  }, [resetAutoSave]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      if (e.key === 's') {
        e.preventDefault();
        doSave({ silent: false });
        return;
      }
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [doSave, handleUndo, handleRedo]);

  // ── Manual form submit ────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    doSave({ silent: false });
  };

  // ── Photo upload ──────────────────────────────────────────────────────────────
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('photo', file);
      const { data } = await axios.post('/api/profile/upload-photo', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setFormData(prev => ({ ...prev, photo: data.photoUrl }));
      setProfileData(prev => ({ ...prev, profile: { ...prev?.profile, photo: data.photoUrl } }));
      setIsDirty(true);
      resetAutoSave();
      setMessage('Photo uploaded!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setError('Photo upload failed. Max 5MB.');
      setTimeout(() => setError(''), 4000);
    }
    setUploading(false);
  };

  const handleUsernameUpdate = async () => {
    setUsernameErr('');
    setUsernameMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch('/api/u/settings/username', { username },
        { headers: { Authorization: `Bearer ${token}` } });
      setUsername(res.data.username);
      setProfileData(prev => ({ ...prev, username: res.data.username }));
      setUsernameMsg(`Username set to @${res.data.username}`);
    } catch (err) {
      setUsernameErr(err.response?.data?.message || 'Failed to update username');
    }
  };

  const handleThemeUpdate = async (themeId) => {
    setAnimTheme(themeId);
    setThemeMsg('');
    try {
      const token = localStorage.getItem('token');
      await axios.patch('/api/u/settings/theme', { animationTheme: themeId },
        { headers: { Authorization: `Bearer ${token}` } });
      setProfileData(prev => ({ ...prev, animationTheme: themeId }));
      setThemeMsg('Theme saved!');
      setTimeout(() => setThemeMsg(''), 2000);
    } catch {
      // silent
    }
  };

  const canUndo = historyRef.current.past.length > 1;  // >1 because first entry is the initial state
  const canRedo = historyRef.current.future.length > 0;

  return (
    <div>
      {/* ── Header row with status bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Edit Profile</h2>

        {/* Status bar */}
        <div className="flex items-center gap-3">
          {/* Undo / Redo buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
            >
              <i className="fas fa-undo" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
            >
              <i className="fas fa-redo" />
            </button>
          </div>

          {/* Dirty / auto-save indicator */}
          {saveStatus === 'auto-saving' && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <i className="fas fa-spinner fa-spin text-xs" />
              Auto-saving…
            </span>
          )}
          {saveStatus === 'auto-saved' && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <i className="fas fa-check-circle text-xs" />
              Auto-saved
            </span>
          )}
          {isDirty && saveStatus === '' && (
            <span className="flex items-center gap-1.5 text-xs text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
              Unsaved changes
            </span>
          )}

          {/* Keyboard hint */}
          <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg">
            <kbd className="font-mono">Ctrl+S</kbd>
            <span>to save</span>
          </span>
        </div>
      </div>

      {message && (
        <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-3 rounded-lg mb-6 flex items-center gap-2">
          <i className="fas fa-check-circle" />
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 flex items-center gap-2">
          <i className="fas fa-exclamation-circle" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input
              type="text" id="name" name="name"
              value={formData.name} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">Professional Title</label>
            <input
              type="text" id="title" name="title"
              value={formData.title} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
              placeholder="Full Stack Developer"
            />
          </div>
        </div>

        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Profile Photo</label>
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <img
                src={formData.photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-slate-600"
              />
              <label
                htmlFor="profile-form-photo-upload"
                className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-full border-2 border-slate-800 flex items-center justify-center cursor-pointer transition-colors shadow-lg z-10"
                title="Upload photo"
              >
                {uploading
                  ? <i className="fas fa-spinner fa-spin text-white text-xs" />
                  : <i className="fas fa-camera text-white text-xs" />
                }
              </label>
              <input
                id="profile-form-photo-upload"
                ref={photoInputRef}
                type="file" accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
            <div className="flex-1">
              <p className="text-slate-400 text-xs mb-2">Click the camera to upload, or paste a URL below</p>
              <input
                type="text" name="photo"
                value={formData.photo} onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white text-sm transition-colors"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
          <textarea
            id="bio" name="bio"
            value={formData.bio} onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none transition-colors duration-300"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-white mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'github',   label: 'GitHub',   placeholder: 'https://github.com/username'   },
              { id: 'linkedin', label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/username' },
              { id: 'twitter',  label: 'Twitter',   placeholder: 'https://twitter.com/username'  },
            ].map(f => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-sm font-medium text-slate-300 mb-2">{f.label}</label>
                <input
                  type="text" id={f.id} name={f.id}
                  value={formData[f.id]} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors duration-300"
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading
              ? <><i className="fas fa-spinner fa-spin" /> Saving…</>
              : <><i className="fas fa-save" /> Save Profile</>
            }
          </button>

          {/* Undo / Redo secondary row for mobile */}
          <div className="flex items-center gap-2 sm:hidden">
            <button type="button" onClick={handleUndo} disabled={!canUndo}
              className="px-3 py-2 rounded-lg text-xs bg-slate-700 text-slate-300 disabled:opacity-30 flex items-center gap-1.5">
              <i className="fas fa-undo" /> Undo
            </button>
            <button type="button" onClick={handleRedo} disabled={!canRedo}
              className="px-3 py-2 rounded-lg text-xs bg-slate-700 text-slate-300 disabled:opacity-30 flex items-center gap-1.5">
              <i className="fas fa-redo" /> Redo
            </button>
          </div>

          {/* Keyboard shortcuts hint */}
          <p className="text-xs text-slate-500 hidden sm:block">
            <kbd className="font-mono bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">Ctrl+S</kbd> save ·{' '}
            <kbd className="font-mono bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">Ctrl+Z</kbd> undo ·{' '}
            <kbd className="font-mono bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">Ctrl+Y</kbd> redo ·{' '}
            auto-saves after 30s
          </p>
        </div>
      </form>

      {/* ── Public URL / Username ─────────────────────────────────── */}
      <div className="mt-10 pt-8 border-t border-slate-700">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <i className="fas fa-link text-blue-400" /> Public Portfolio URL
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Your portfolio is shareable at{' '}
          <span className="text-blue-400 font-mono">
            {window.location.origin}/u/{username || 'your-username'}
          </span>
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="your-username"
            className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white font-mono text-sm transition-colors"
          />
          <button
            onClick={handleUsernameUpdate}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors text-sm whitespace-nowrap"
          >
            Save Username
          </button>
        </div>
        {usernameMsg && (
          <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
            <i className="fas fa-check-circle" /> {usernameMsg}
          </p>
        )}
        {usernameErr && (
          <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
            <i className="fas fa-exclamation-circle" /> {usernameErr}
          </p>
        )}
      </div>

      {/* ── Animation Theme Picker ────────────────────────────────── */}
      <div className="mt-8 pt-8 border-t border-slate-700">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <i className="fas fa-magic text-purple-400" /> Portfolio Animation Theme
        </h3>
        <p className="text-slate-400 text-sm mb-5">
          Choose how your public portfolio looks and animates.
          {themeMsg && <span className="text-green-400 ml-2">✓ {themeMsg}</span>}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ANIMATION_THEMES.map(th => (
            <button
              key={th.id}
              onClick={() => handleThemeUpdate(th.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                animTheme === th.id
                  ? 'border-blue-500 bg-blue-900/20 scale-105 shadow-lg shadow-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
              }`}
            >
              <div className="text-2xl mb-2">{th.emoji}</div>
              <p className="font-semibold text-white text-sm">{th.label}</p>
              <p className="text-slate-400 text-xs mt-0.5">{th.desc}</p>
              {animTheme === th.id && (
                <div className="mt-2 text-xs text-blue-400 font-medium">✓ Active</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
