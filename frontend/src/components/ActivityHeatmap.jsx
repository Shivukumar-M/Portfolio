import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['','Mon','','Wed','','Fri',''];

const cellColor = (count) => {
  if (!count) return '#1e293b';
  if (count === 1) return '#1d4ed8';
  if (count === 2) return '#2563eb';
  if (count <= 4)  return '#3b82f6';
  return '#60a5fa';
};

const ActivityHeatmap = () => {
  const [heatData, setHeatData] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [tooltip,  setTooltip]  = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/analytics/heatmap', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHeatData(res.data.data || []);
        setTotal(res.data.total || 0);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Build a full 52-week grid ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const WEEKS = 52;
  const COLS  = WEEKS;

  // Start from the Sunday 52 weeks ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (COLS * 7) + 1);
  // align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // Build lookup map
  const map = {};
  heatData.forEach(({ date, count }) => { map[date] = count; });

  // Build columns (each col = 7 days, Sun→Sat)
  const cols = [];
  let cursor = new Date(startDate);
  for (let w = 0; w < COLS; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cursor.toISOString().slice(0, 10);
      week.push({ date: dateStr, count: map[dateStr] || 0, month: cursor.getMonth(), day: cursor.getDay() });
      cursor.setDate(cursor.getDate() + 1);
    }
    cols.push(week);
  }

  // Month labels: find first week per month
  const monthLabels = [];
  cols.forEach((week, wi) => {
    const m = week[0].month;
    if (wi === 0 || cols[wi - 1][0].month !== m) {
      monthLabels.push({ month: m, col: wi });
    }
  });

  const CELL = 11;
  const GAP  = 2;
  const STEP  = CELL + GAP;
  const svgW  = COLS * STEP;
  const svgH  = 7 * STEP;

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-fire text-orange-400" /> Activity Heatmap
        </h2>
        <div className="h-32 flex items-center justify-center text-slate-500">
          <i className="fas fa-spinner fa-spin mr-2" /> Loading…
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <i className="fas fa-fire text-orange-400" /> Activity Heatmap
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {total} contribution{total !== 1 ? 's' : ''} in the last year (projects &amp; blog posts)
        </p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 overflow-x-auto relative">
        {/* Day labels */}
        <div className="flex">
          <div className="flex flex-col mr-1" style={{ width: 28 }}>
            <div style={{ height: 18 }} /> {/* month label spacer */}
            {DAYS.map((d, i) => (
              <div key={i} style={{ height: STEP, fontSize: 9, color: '#64748b', lineHeight: `${STEP}px` }}>{d}</div>
            ))}
          </div>

          <div>
            {/* Month labels */}
            <div className="flex mb-1" style={{ height: 16 }}>
              {monthLabels.map(({ month, col }) => (
                <div key={`${month}-${col}`}
                  style={{ position: 'absolute', left: 28 + col * STEP, fontSize: 10, color: '#94a3b8' }}>
                  {MONTHS[month]}
                </div>
              ))}
            </div>

            {/* SVG grid */}
            <svg width={svgW} height={svgH} style={{ display: 'block' }}>
              {cols.map((week, wi) =>
                week.map((cell, di) => (
                  <rect
                    key={`${wi}-${di}`}
                    x={wi * STEP}
                    y={di * STEP}
                    width={CELL}
                    height={CELL}
                    rx={2}
                    fill={cellColor(cell.count)}
                    style={{ cursor: cell.count ? 'pointer' : 'default' }}
                    onMouseEnter={e => {
                      if (!cell.count) return;
                      const rect = e.target.getBoundingClientRect();
                      setTooltip({ date: cell.date, count: cell.count, x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))
              )}
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
          <span>Less</span>
          {['#1e293b','#1d4ed8','#2563eb','#3b82f6','#60a5fa'].map(c => (
            <div key={c} style={{ width: CELL, height: CELL, background: c, borderRadius: 2 }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Tooltip (fixed position) */}
      {tooltip && (
        <div className="fixed z-50 pointer-events-none bg-slate-900 border border-slate-600 text-white text-xs rounded-lg px-3 py-2 shadow-xl"
          style={{ top: tooltip.y - 40, left: tooltip.x }}>
          <strong>{tooltip.count}</strong> contribution{tooltip.count !== 1 ? 's' : ''} on {tooltip.date}
        </div>
      )}
    </div>
  );
};

export default ActivityHeatmap;
