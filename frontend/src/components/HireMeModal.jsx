import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PROJECT_TYPES = [
  { value: 'full-time',   label: 'Full-Time Position' },
  { value: 'contract',    label: 'Contract / Fixed-Term' },
  { value: 'freelance',   label: 'Freelance Project' },
  { value: 'consulting',  label: 'Consulting / Advisory' },
  { value: 'other',       label: 'Other' },
];

const BUDGETS = [
  'Under $1,000',
  '$1,000 – $5,000',
  '$5,000 – $15,000',
  '$15,000 – $50,000',
  '$50,000+',
  'Open to Discussion',
];

const HireMeModal = ({ portfolioUserId, ownerName, onClose }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    projectType: 'full-time',
    budget: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`/api/leads/submit/${portfolioUserId}`, form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 px-6 py-5 flex items-center justify-between border-b border-slate-700">
          <div>
            <h2 className="text-white text-xl font-bold flex items-center gap-2">
              <i className="fas fa-briefcase text-blue-400" /> Hire {ownerName || 'Me'}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">Tell them about your project</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-400 text-2xl" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Message Sent!</h3>
              <p className="text-slate-400 text-sm mb-6">
                {ownerName || 'They'} will get back to you at <strong className="text-white">{form.email}</strong>.
              </p>
              <button onClick={onClose}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
                  <i className="fas fa-exclamation-circle mr-2" />{error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1.5">Your Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    placeholder="Jane Smith"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1.5">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="jane@company.com"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Project Type</label>
                <select name="projectType" value={form.projectType} onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors">
                  {PROJECT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Budget</label>
                <select name="budget" value={form.budget} onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="">Select a range…</option>
                  {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange}
                  rows="4" placeholder="Describe your project, timeline, or any questions…"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none transition-colors" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2">
                {loading
                  ? <><i className="fas fa-spinner fa-spin" /> Sending…</>
                  : <><i className="fas fa-paper-plane" /> Send Hire Request</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default HireMeModal;
