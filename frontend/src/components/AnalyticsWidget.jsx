import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AnalyticsWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('/api/analytics/summary', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400 text-sm py-8 text-center">Loading analytics…</div>;
  if (!data) return <div className="text-slate-500 text-sm py-8 text-center">No analytics data yet. Analytics are tracked when visitors view your public portfolio.</div>;

  const maxDaily = Math.max(...(data.daily?.map(d => d.count) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Views',    value: data.total,  icon: 'fas fa-eye',          color: 'blue' },
          { label: 'Last 30 Days',  value: data.last30,  icon: 'fas fa-calendar-alt', color: 'purple' },
          { label: 'Last 7 Days',   value: data.last7,   icon: 'fas fa-chart-line',   color: 'green' },
          { label: 'Today',         value: data.today,   icon: 'fas fa-sun',          color: 'yellow' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-4 text-center`}>
            <i className={`${icon} text-${color}-400 text-xl mb-2 block`}></i>
            <p className={`text-3xl font-bold text-${color}-400`}>{value}</p>
            <p className="text-slate-400 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Daily chart (last 7 days) */}
      {data.daily?.length > 0 && (
        <div className="bg-slate-700/40 border border-slate-600 rounded-xl p-4">
          <h4 className="text-white font-semibold text-sm mb-4">Daily Views (Last 7 Days)</h4>
          <div className="flex items-end gap-2 h-24">
            {data.daily.map(({ _id, count }) => (
              <div key={_id} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-slate-400 text-xs">{count}</span>
                <div
                  className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
                  style={{ height: `${Math.max(4, (count / maxDaily) * 80)}px` }}
                />
                <span className="text-slate-500 text-xs">{_id.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page breakdown */}
      {data.pageBreakdown?.length > 0 && (
        <div className="bg-slate-700/40 border border-slate-600 rounded-xl p-4">
          <h4 className="text-white font-semibold text-sm mb-4">Top Pages (Last 30 Days)</h4>
          <div className="space-y-2">
            {data.pageBreakdown.map(({ _id, count }) => (
              <div key={_id} className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-mono truncate mr-4">{_id}</span>
                <span className="text-blue-400 font-semibold flex-shrink-0">{count} views</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-slate-500 text-xs text-center">Analytics are collected from public portfolio visits only.</p>
    </div>
  );
}
