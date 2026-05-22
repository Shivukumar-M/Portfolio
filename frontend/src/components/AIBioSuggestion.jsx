import { useState } from 'react';
import axios from 'axios';

export default function AIBioSuggestion({ profileData, skillsData, onApply }) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        '/api/ai/bio-suggestion',
        {
          name: profileData?.profile?.name,
          title: profileData?.profile?.title,
          skills: skillsData?.map(s => s.name || s).filter(Boolean),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuggestion(data.bio);
    } catch {
      setError('AI suggestion failed. Make sure ANTHROPIC_API_KEY is set in your backend .env file.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">✨</span>
        <h4 className="text-white font-semibold">AI Bio Suggestion</h4>
      </div>
      <p className="text-slate-400 text-sm">
        Generate a professional bio using your name, title and skills — powered by Claude AI.
      </p>

      <button
        onClick={generate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
      >
        {loading ? <><i className="fas fa-spinner fa-spin"></i> Generating…</> : <><i className="fas fa-magic"></i> Generate Bio</>}
      </button>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {suggestion && (
        <div className="space-y-2">
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-slate-200 text-sm leading-relaxed">
            {suggestion}
          </div>
          <button
            onClick={() => onApply(suggestion)}
            className="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
          >
            <i className="fas fa-check"></i> Apply to Profile
          </button>
        </div>
      )}
    </div>
  );
}
