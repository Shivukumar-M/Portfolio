import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TestimonialsManager({ profileData }) {
  const [testimonials, setTestimonials] = useState([]);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('/api/testimonials', { headers }).then(r => setTestimonials(r.data)).catch(() => {});
  }, []);

  const approve = async (id) => {
    const { data } = await axios.patch(`/api/testimonials/${id}/approve`, {}, { headers });
    setTestimonials(testimonials.map(t => t._id === id ? data : t));
  };

  const del = async (id) => {
    await axios.delete(`/api/testimonials/${id}`, { headers });
    setTestimonials(testimonials.filter(t => t._id !== id));
  };

  const pending  = testimonials.filter(t => !t.approved);
  const approved = testimonials.filter(t => t.approved);
  const submitUrl = profileData?.username
    ? `${window.location.origin}/u/${profileData.username}#testimonials`
    : null;

  return (
    <div className="space-y-6">
      {submitUrl && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <i className="fas fa-info-circle text-blue-400 mt-0.5"></i>
          <div>
            <p className="text-white text-sm font-medium">Share your portfolio URL to collect testimonials</p>
            <p className="text-slate-400 text-xs mt-1">Visitors can submit a testimonial from your public portfolio. You approve them here before they go live.</p>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
            <i className="fas fa-clock"></i> Pending Approval ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map(t => (
              <TestimonialCard key={t._id} t={t} onApprove={() => approve(t._id)} onDelete={() => del(t._id)} showApprove />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
          <i className="fas fa-check-circle"></i> Approved ({approved.length})
        </h3>
        {approved.length === 0
          ? <p className="text-slate-500 text-sm">No approved testimonials yet.</p>
          : <div className="space-y-3">{approved.map(t => (
              <TestimonialCard key={t._id} t={t} onDelete={() => del(t._id)} />
            ))}</div>
        }
      </div>
    </div>
  );
}

function TestimonialCard({ t, onApprove, onDelete, showApprove }) {
  return (
    <div className="bg-slate-700/40 border border-slate-600 rounded-xl p-4">
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white font-medium text-sm">{t.authorName}</p>
            {t.authorTitle && <span className="text-slate-400 text-xs">· {t.authorTitle}</span>}
            {t.authorCompany && <span className="text-slate-400 text-xs">@ {t.authorCompany}</span>}
          </div>
          <div className="flex text-yellow-400 text-xs mb-2">
            {Array.from({ length: t.rating }).map((_, i) => <i key={i} className="fas fa-star mr-0.5"></i>)}
          </div>
          <p className="text-slate-300 text-sm italic">"{t.content}"</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {showApprove && (
            <button onClick={onApprove}
              className="bg-green-600/20 border border-green-500/30 text-green-400 px-3 py-1 rounded-lg text-xs hover:bg-green-600/30 transition-colors">
              Approve
            </button>
          )}
          <button onClick={onDelete} className="text-slate-400 hover:text-red-400 transition-colors">
            <i className="fas fa-trash text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
