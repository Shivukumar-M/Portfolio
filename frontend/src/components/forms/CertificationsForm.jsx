import { useState, useEffect } from 'react';
import axios from 'axios';

const empty = { title: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '', image: '' };

export default function CertificationsForm() {
  const [certs, setCerts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('/api/certifications', { headers }).then(r => setCerts(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        const { data } = await axios.put(`/api/certifications/${editing}`, form, { headers });
        setCerts(certs.map(c => c._id === editing ? data : c));
      } else {
        const { data } = await axios.post('/api/certifications', form, { headers });
        setCerts([data, ...certs]);
      }
      setForm(empty); setEditing(null); setMsg('Saved!');
    } catch { setMsg('Error saving.'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const del = async (id) => {
    await axios.delete(`/api/certifications/${id}`, { headers });
    setCerts(certs.filter(c => c._id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-700/40 border border-slate-600 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg">{editing ? 'Edit Certification' : 'Add Certification'}</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'title', label: 'Certificate Title', placeholder: 'e.g. AWS Solutions Architect' },
            { key: 'issuer', label: 'Issuer', placeholder: 'e.g. Amazon Web Services' },
            { key: 'issueDate', label: 'Issue Date', type: 'month' },
            { key: 'expiryDate', label: 'Expiry Date (optional)', type: 'month' },
            { key: 'credentialId', label: 'Credential ID (optional)', placeholder: 'ABC123' },
            { key: 'credentialUrl', label: 'Credential URL (optional)', placeholder: 'https://...' },
          ].map(({ key, label, placeholder, type = 'text' }) => (
            <div key={key}>
              <label className="text-slate-400 text-sm">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                placeholder={placeholder} />
            </div>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <button onClick={save} disabled={saving || !form.title || !form.issuer || !form.issueDate}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 text-sm font-medium">
            {saving ? 'Saving…' : editing ? 'Update' : 'Add Certification'}
          </button>
          {editing && (
            <button onClick={() => { setForm(empty); setEditing(null); }}
              className="text-slate-400 hover:text-white text-sm transition-colors">Cancel</button>
          )}
          {msg && <span className="text-green-400 text-sm">{msg}</span>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {certs.map(cert => (
          <div key={cert._id} className="bg-slate-700/40 border border-slate-600 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div className="min-w-0 mr-3">
                <p className="text-white font-medium">{cert.title}</p>
                <p className="text-blue-400 text-sm">{cert.issuer}</p>
                <p className="text-slate-400 text-xs mt-1">
                  Issued: {cert.issueDate}{cert.expiryDate ? ` · Expires: ${cert.expiryDate}` : ''}
                </p>
                {cert.credentialId && <p className="text-slate-500 text-xs mt-1">ID: {cert.credentialId}</p>}
                {cert.credentialUrl && (
                  <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 text-xs mt-1 inline-flex items-center gap-1 hover:text-blue-300">
                    <i className="fas fa-external-link-alt"></i> Verify
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(cert._id); setForm(cert); }}
                  className="text-slate-400 hover:text-blue-400 transition-colors"><i className="fas fa-edit"></i></button>
                <button onClick={() => del(cert._id)}
                  className="text-slate-400 hover:text-red-400 transition-colors"><i className="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {certs.length === 0 && (
        <p className="text-slate-500 text-center py-8">No certifications yet. Add yours above.</p>
      )}
    </div>
  );
}
