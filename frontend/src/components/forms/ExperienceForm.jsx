import { useState, useEffect } from 'react';
import axios from 'axios';

const empty = {
  type: 'work', title: '', organization: '', location: '',
  startDate: '', endDate: '', current: false, description: '', technologies: '',
};

export default function ExperienceForm() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('/api/experience', { headers }).then(r => setEntries(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean) };
      if (editing) {
        const { data } = await axios.put(`/api/experience/${editing}`, payload, { headers });
        setEntries(entries.map(e => e._id === editing ? data : e));
      } else {
        const { data } = await axios.post('/api/experience', payload, { headers });
        setEntries([...entries, data]);
      }
      setForm(empty); setEditing(null); setMsg('Saved!');
    } catch { setMsg('Error saving.'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const del = async (id) => {
    await axios.delete(`/api/experience/${id}`, { headers });
    setEntries(entries.filter(e => e._id !== id));
  };

  const startEdit = (e) => {
    setEditing(e._id);
    setForm({ ...e, technologies: (e.technologies || []).join(', ') });
  };

  const work = entries.filter(e => e.type === 'work');
  const edu  = entries.filter(e => e.type === 'education');

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="bg-slate-700/40 border border-slate-600 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg">{editing ? 'Edit Entry' : 'Add Entry'}</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 text-sm">Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm">
              <option value="work">Work Experience</option>
              <option value="education">Education</option>
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-sm">{form.type === 'work' ? 'Job Title' : 'Degree / Course'}</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm" placeholder="e.g. Full Stack Developer" />
          </div>
          <div>
            <label className="text-slate-400 text-sm">{form.type === 'work' ? 'Company' : 'University / School'}</label>
            <input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })}
              className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm" placeholder="Organization name" />
          </div>
          <div>
            <label className="text-slate-400 text-sm">Location</label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm" placeholder="City, Country" />
          </div>
          <div>
            <label className="text-slate-400 text-sm">Start Date</label>
            <input type="month" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
              className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-slate-400 text-sm">End Date</label>
            <input type="month" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
              disabled={form.current}
              className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm disabled:opacity-40" />
            <label className="flex items-center gap-2 mt-1 text-slate-400 text-xs cursor-pointer">
              <input type="checkbox" checked={form.current} onChange={e => setForm({ ...form, current: e.target.checked, endDate: '' })} />
              Currently here
            </label>
          </div>
        </div>

        <div>
          <label className="text-slate-400 text-sm">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3} className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm resize-none" placeholder="Describe your role or achievements..." />
        </div>

        {form.type === 'work' && (
          <div>
            <label className="text-slate-400 text-sm">Technologies (comma-separated)</label>
            <input value={form.technologies} onChange={e => setForm({ ...form, technologies: e.target.value })}
              className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm" placeholder="React, Node.js, MongoDB" />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving || !form.title || !form.organization}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 text-sm font-medium">
            {saving ? 'Saving…' : editing ? 'Update' : 'Add Entry'}
          </button>
          {editing && (
            <button onClick={() => { setForm(empty); setEditing(null); }}
              className="text-slate-400 hover:text-white text-sm transition-colors">Cancel</button>
          )}
          {msg && <span className="text-green-400 text-sm">{msg}</span>}
        </div>
      </div>

      {/* Timeline */}
      {[{ label: 'Work Experience', icon: 'fas fa-briefcase', list: work },
        { label: 'Education', icon: 'fas fa-graduation-cap', list: edu }].map(({ label, icon, list }) => (
        list.length > 0 && (
          <div key={label}>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <i className={`${icon} text-blue-400`}></i> {label}
            </h3>
            <div className="space-y-3">
              {list.map(entry => (
                <div key={entry._id} className="bg-slate-700/40 border border-slate-600 rounded-xl p-4 flex justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-white font-medium">{entry.title}</p>
                    <p className="text-blue-400 text-sm">{entry.organization} {entry.location && `· ${entry.location}`}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {entry.startDate} — {entry.current ? 'Present' : entry.endDate}
                    </p>
                    {entry.description && <p className="text-slate-400 text-sm mt-2 line-clamp-2">{entry.description}</p>}
                    {entry.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.technologies.map(t => (
                          <span key={t} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(entry)} className="text-slate-400 hover:text-blue-400 transition-colors">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => del(entry._id)} className="text-slate-400 hover:text-red-400 transition-colors">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {entries.length === 0 && (
        <p className="text-slate-500 text-center py-8">No entries yet. Add your work experience and education above.</p>
      )}
    </div>
  );
}
