import { useEffect, useState } from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

export default function LeetCodeStats({ username }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { ref, visible } = useScrollAnimation();

  useEffect(() => {
    if (!username) return;

    // Use the public LeetCode stats card (image-based, no API key needed)
    setLoading(false);
  }, [username]);

  if (!username) return null;

  return (
    <div ref={ref} className={`scroll-animate ${visible ? 'visible' : ''}`}>
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-yellow-400 font-mono text-lg">{'{}'}</span> LeetCode Stats
        </h3>

        <img
          src={`https://leetcard.jacoblin.cool/${username}?theme=dark&font=Nunito&ext=heatmap`}
          alt="LeetCode Stats"
          className="w-full rounded-xl"
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
        />
        <p className="text-slate-500 text-sm hidden">Could not load LeetCode stats. Check username.</p>

        <a
          href={`https://leetcode.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <i className="fas fa-external-link-alt"></i>
          View on LeetCode
        </a>
      </div>
    </div>
  );
}
