import { useEffect, useState } from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

export default function GitHubStats({ username }) {
  const [stats, setStats] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { ref, visible } = useScrollAnimation();

  useEffect(() => {
    if (!username) return;
    const handle = username.replace('https://github.com/', '').replace(/\/$/, '').split('/').pop();

    Promise.all([
      fetch(`https://api.github.com/users/${handle}`),
      fetch(`https://api.github.com/users/${handle}/repos?sort=stars&per_page=6`),
    ])
      .then(async ([uRes, rRes]) => {
        if (!uRes.ok) throw new Error('Not found');
        const [user, repoList] = await Promise.all([uRes.json(), rRes.json()]);
        setStats(user);
        setRepos(Array.isArray(repoList) ? repoList : []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (!username) return null;

  return (
    <div ref={ref} className={`scroll-animate ${visible ? 'visible' : ''}`}>
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <i className="fab fa-github text-slate-300"></i> GitHub Stats
        </h3>

        {loading && <p className="text-slate-400 text-sm">Loading GitHub data…</p>}
        {error  && <p className="text-slate-500 text-sm">Could not load GitHub stats.</p>}

        {stats && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Repos',     value: stats.public_repos,  color: 'blue' },
                { label: 'Followers', value: stats.followers,      color: 'purple' },
                { label: 'Following', value: stats.following,      color: 'green' },
                { label: 'Gists',     value: stats.public_gists,  color: 'yellow' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-3 text-center`}>
                  <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
                  <p className="text-slate-400 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>

            <img
              src={`https://github-readme-stats.vercel.app/api?username=${stats.login}&show_icons=true&theme=tokyonight&hide_border=true&count_private=true`}
              alt="GitHub Stats"
              className="w-full rounded-xl mb-4"
              onError={e => e.target.style.display = 'none'}
            />

            {repos.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Top Repositories</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {repos.map(repo => (
                    <a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 hover:border-blue-500/50 transition-colors"
                    >
                      <p className="text-white text-sm font-medium truncate">{repo.name}</p>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{repo.description || 'No description'}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span><i className="fas fa-star mr-1 text-yellow-400"></i>{repo.stargazers_count}</span>
                        <span><i className="fas fa-code-branch mr-1"></i>{repo.forks_count}</span>
                        {repo.language && <span className="text-blue-400">{repo.language}</span>}
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
