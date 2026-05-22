import React, { useState } from 'react';
import axios from 'axios';

const ScoreRing = ({ label, score }) => {
  const color = score >= 90 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="48" y="48" textAnchor="middle" dominantBaseline="central"
          className="rotate-90" style={{ transform: 'rotate(90deg)', transformOrigin: '48px 48px', fill: color, fontSize: '20px', fontWeight: 'bold', fontFamily: 'inherit' }}>
          {score}
        </text>
      </svg>
      <span className="text-slate-300 text-sm font-medium capitalize">{label}</span>
    </div>
  );
};

const LighthouseAudit = ({ profileData }) => {
  const username = profileData?.username || '';
  const defaultUrl = username ? `${window.location.origin}/u/${username}` : '';

  const [url, setUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const runAudit = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/lighthouse/audit', { url }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Audit failed. Make sure your portfolio is publicly accessible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <i className="fas fa-tachometer-alt text-green-400" /> Performance Auditor
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Runs a Google PageSpeed Insights audit on your public portfolio URL.
        </p>
      </div>

      {/* URL Input */}
      <div className="flex gap-3 mb-8">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://yourportfolio.com/u/username"
          className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
        />
        <button onClick={runAudit} disabled={loading || !url}
          className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
          {loading
            ? <><i className="fas fa-spinner fa-spin" /> Auditing…</>
            : <><i className="fas fa-play" /> Run Audit</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
          <i className="fas fa-exclamation-circle mr-2" />{error}
        </div>
      )}

      {loading && (
        <div className="text-center py-16 text-slate-400">
          <i className="fas fa-spinner fa-spin text-4xl mb-4 block text-green-400" />
          <p>Running PageSpeed analysis… this takes 10–30 seconds.</p>
        </div>
      )}

      {result && (
        <div className="space-y-8">
          {/* Score rings */}
          <div className="bg-slate-800 rounded-2xl p-8">
            <p className="text-slate-400 text-xs text-center mb-6 uppercase tracking-widest">Scores for <span className="text-white font-mono">{result.url}</span></p>
            <div className="flex justify-around flex-wrap gap-6">
              {Object.entries(result.scores).map(([key, val]) => (
                <ScoreRing key={key} label={key} score={val} />
              ))}
            </div>
          </div>

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <i className="fas fa-lightbulb text-yellow-400" /> Top Improvement Tips
              </h3>
              <div className="space-y-3">
                {result.tips.map((tip, i) => (
                  <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-white font-semibold text-sm mb-1">{tip.title}</p>
                        <p className="text-slate-400 text-xs leading-relaxed">{tip.description}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                        tip.score >= 50 ? 'bg-yellow-900/40 text-yellow-400' : 'bg-red-900/40 text-red-400'
                      }`}>
                        {tip.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex gap-6 text-xs text-slate-500">
            {[['#22c55e', '90–100 Fast'], ['#f59e0b', '50–89 Needs work'], ['#ef4444', '0–49 Slow']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: c }} /> {l}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LighthouseAudit;
