import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TYPE_LABELS = {
  'full-time':  'Full-Time',
  'contract':   'Contract',
  'freelance':  'Freelance',
  'consulting': 'Consulting',
  'other':      'Other',
};

const LeadsInbox = () => {
  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/leads', { headers: { Authorization: `Bearer ${token}` } });
        setLeads(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/leads/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setLeads(prev => prev.filter(l => l._id !== id));
    } catch { /* silent */ }
  };

  if (loading) return <div className="text-slate-400 py-8 text-center"><i className="fas fa-spinner fa-spin mr-2" />Loading leads…</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <i className="fas fa-user-tie text-yellow-400" /> Hire Me Leads
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {leads.length} lead{leads.length !== 1 ? 's' : ''} received via your public portfolio.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <i className="fas fa-inbox text-4xl mb-4 block" />
          <p>No leads yet. Share your portfolio URL to start receiving requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map(lead => (
            <div key={lead._id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-900/40 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-blue-300 font-bold text-sm">{lead.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{lead.name}</p>
                    <a href={`mailto:${lead.email}`} className="text-blue-400 hover:underline text-sm">{lead.email}</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-900/40 border border-purple-700/30 text-purple-300 rounded-full text-xs font-medium">
                    {TYPE_LABELS[lead.projectType] || lead.projectType}
                  </span>
                  <button onClick={() => deleteLead(lead._id)}
                    className="text-slate-500 hover:text-red-400 transition-colors">
                    <i className="fas fa-trash text-sm" />
                  </button>
                </div>
              </div>

              {(lead.budget || lead.message) && (
                <div className="mt-4 pl-13 space-y-2 ml-13" style={{ marginLeft: 52 }}>
                  {lead.budget && (
                    <p className="text-sm text-slate-400">
                      <span className="text-slate-500">Budget:</span>{' '}
                      <span className="text-green-400 font-medium">{lead.budget}</span>
                    </p>
                  )}
                  {lead.message && (
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-700/50 rounded-lg px-4 py-3">
                      {lead.message}
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-600 mt-3 ml-13" style={{ marginLeft: 52 }}>
                {new Date(lead.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadsInbox;
