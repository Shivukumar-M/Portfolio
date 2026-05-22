import React, { useState } from 'react';
import axios from 'axios';

const SEOGenerator = ({ profileData }) => {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState(
    profileData?.seoConfig?.title
      ? profileData.seoConfig
      : null
  );
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/ai/seo-tags', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTags(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const titleLen = tags?.title?.length || 0;
  const descLen = tags?.description?.length || 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <i className="fas fa-search text-orange-400" /> SEO Meta-Tag Generator
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          AI generates the perfect SEO title and meta description for your portfolio, then saves them automatically.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
        <p className="text-slate-300 text-sm font-semibold mb-3">How it works</p>
        <div className="grid sm:grid-cols-3 gap-4 text-xs text-slate-400">
          {[
            ['fas fa-user-circle text-blue-400', 'Reads your name, title, and bio from your profile'],
            ['fas fa-robot text-purple-400', 'Claude AI crafts a search-optimised title & description'],
            ['fas fa-save text-green-400', 'Saved to your account and injected into your public portfolio'],
          ].map(([icon, text], i) => (
            <div key={i} className="flex items-start gap-3">
              <i className={`${icon} mt-0.5`} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
          <i className="fas fa-exclamation-circle mr-2" />{error}
        </div>
      )}

      {/* Current tags preview */}
      {tags && (
        <div className="mb-8 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <i className="fas fa-eye text-slate-400" /> Preview
            {saved && <span className="text-xs text-green-400 font-normal flex items-center gap-1"><i className="fas fa-check" /> Saved</span>}
          </h3>

          {/* Google SERP mock */}
          <div className="bg-white rounded-xl p-5 text-left">
            <p className="text-slate-500 text-xs mb-1 font-sans">yourportfolio.com/u/{profileData?.username || 'you'}</p>
            <p className="text-blue-700 text-lg font-medium font-sans leading-snug hover:underline cursor-pointer">
              {tags.title || '—'}
            </p>
            <p className="text-slate-600 text-sm font-sans leading-relaxed mt-1">
              {tags.description || '—'}
            </p>
          </div>

          {/* Char counters */}
          <div className="flex gap-6 text-xs">
            <span className={titleLen > 60 ? 'text-red-400' : 'text-slate-400'}>
              Title: {titleLen}/60 chars {titleLen > 60 ? '⚠ Too long' : '✓'}
            </span>
            <span className={descLen > 155 ? 'text-red-400' : 'text-slate-400'}>
              Description: {descLen}/155 chars {descLen > 155 ? '⚠ Too long' : '✓'}
            </span>
          </div>
        </div>
      )}

      <button onClick={generate} disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center gap-2">
        {loading
          ? <><i className="fas fa-spinner fa-spin" /> Generating…</>
          : tags
          ? <><i className="fas fa-sync" /> Regenerate Tags</>
          : <><i className="fas fa-magic" /> Generate SEO Tags</>}
      </button>

      {!profileData?.profile?.bio && (
        <p className="text-yellow-500 text-xs mt-3 flex items-center gap-1">
          <i className="fas fa-exclamation-triangle" />
          Add a bio to your profile first for the best results.
        </p>
      )}
    </div>
  );
};

export default SEOGenerator;
