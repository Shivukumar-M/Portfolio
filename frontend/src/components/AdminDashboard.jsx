import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext.jsx';
import axios from 'axios';
import TemplateLibrary from './TemplateLibrary.jsx';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  accent:  '#3B82F6',
  accentD: '#1D4ED8',
  red:     '#F43F5E',
  green:   '#10B981',
  amber:   '#F59E0B',
  purple:  '#8B5CF6',
  bg:      '#0C0E16',
  s0:      '#10131E',
  s1:      '#161B2C',
  s2:      '#1E2438',
  s3:      '#252F45',
  s4:      '#303A58',
  text:    '#EEF2FF',
  text2:   '#8B95B5',
  text3:   '#4A5270',
  success: '#10B981',
  warn:    '#F59E0B',
  error:   '#F43F5E',
};

const R = "'Roboto', 'Inter', system-ui, sans-serif";
const M = "'Roboto Mono', 'JetBrains Mono', monospace";

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmtNum = (n) => {
  if (!n && n !== 0) return '—';
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return String(n);
};
const fmtBytes = (b) => {
  if (!b) return '—';
  if (b < 1024) return `${b}B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / 1048576).toFixed(1)}MB`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ─── Normalize to full N-day timeline ────────────────────────────────────────
const fillDays = (data = [], days = 14) => {
  const map = {};
  data.forEach(d => { map[d._id] = d.count; });
  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    result.push({ _id: key, count: map[key] || 0, label });
  }
  return result;
};

// ─── SVG: Sparkline ───────────────────────────────────────────────────────────
const Sparkline = ({ data = [], color = T.accent, w = 72, h = 28 }) => {
  if (data.length < 2) return <svg width={w} height={h} />;
  const filled = fillDays(data, Math.max(data.length, 7));
  const max = Math.max(...filled.map(d => d.count), 1);
  const pts = filled.map((d, i) => ({
    x: (i / (filled.length - 1)) * w,
    y: h - 2 - (d.count / max) * (h - 4),
  }));
  const path = pts.map((p, i) => {
    if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const pp = pts[i - 1], cx = (p.x + pp.x) / 2;
    return `C${cx.toFixed(1)},${pp.y.toFixed(1)} ${cx.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2" fill={color} />
    </svg>
  );
};

// ─── SVG: Timeline bar chart — always 14 fixed-width bars ────────────────────
const TimelineBar = ({ data = [], color = T.accent, height = 185 }) => {
  const W = 560, H = height;
  const pL = 36, pB = 32, pR = 8, pT = 12;
  const cW = W - pL - pR, cH = H - pB - pT;
  const n = data.length || 1;
  // Fixed bar width regardless of data length
  const barW = Math.max(10, Math.min(26, Math.floor(cW / (n * 1.85))));
  const totalBar = barW * n;
  const gap = (cW - totalBar) / (n + 1);
  const max = Math.max(...data.map(d => d.count), 1);
  const nMax = Math.ceil(max * 1.25 / 5) * 5 || 5;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* Grid */}
      {ticks.map((t, i) => {
        const y = pT + cH * (1 - t);
        return (
          <g key={i}>
            <line x1={pL} y1={y} x2={W - pR} y2={y}
              stroke={T.s3} strokeWidth="1" strokeDasharray={t === 0 ? 'none' : '3,3'} />
            <text x={pL - 5} y={y + 3.5} textAnchor="end" fill={T.text3} fontSize="9" fontFamily={R}>
              {Math.round(nMax * t)}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const x = pL + gap + i * (barW + gap);
        const bH = Math.max(d.count > 0 ? 3 : 0, (d.count / nMax) * cH);
        const y = pT + cH - bH;
        const age = n - 1 - i; // 0 = most recent
        const isRecent = age === 0;
        // Opacity fades for older bars
        const opacity = isRecent ? 1 : age <= 3 ? 0.75 : age <= 7 ? 0.45 : 0.2;
        const fill = isRecent ? T.red : color;
        const showLabel = i === 0 || i === Math.floor(n / 2) || i === n - 1;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bH} fill={fill} fillOpacity={opacity} rx={3} />
            {isRecent && d.count > 0 && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle"
                fill={T.red} fontSize="9" fontFamily={M} fontWeight="700">{d.count}</text>
            )}
            {showLabel && (
              <text x={x + barW / 2} y={H - 8} textAnchor="middle"
                fill={T.text3} fontSize="8" fontFamily={R}>
                {d.label || d._id?.slice(5) || ''}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ─── SVG: Dual area line chart (two series) ───────────────────────────────────
const DualAreaLine = ({ seriesA, seriesB, colorA = T.accent, colorB = T.green, height = 120 }) => {
  const W = 560, H = height;
  const pL = 36, pB = 28, pR = 8, pT = 10;
  const cW = W - pL - pR, cH = H - pB - pT;
  const allCounts = [...(seriesA?.map(d => d.count) || []), ...(seriesB?.map(d => d.count) || [])];
  const max = Math.max(...allCounts, 1);
  const nMax = Math.ceil(max * 1.3 / 5) * 5 || 5;
  const ticks = [0, 0.5, 1];

  const makeLine = (data) => {
    const n = data.length;
    if (n < 2) return { line: '', area: '', pts: [] };
    const pts = data.map((d, i) => ({
      x: pL + (i / (n - 1)) * cW,
      y: pT + cH - (d.count / nMax) * cH,
    }));
    const line = pts.map((p, i) => {
      if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      const pp = pts[i - 1], cx = (p.x + pp.x) / 2;
      return `C${cx.toFixed(1)},${pp.y.toFixed(1)} ${cx.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
    const bY = (pT + cH).toFixed(1);
    const area = `${line} L${(pL + cW).toFixed(1)},${bY} L${pL},${bY} Z`;
    return { line, area, pts };
  };

  const pathA = seriesA ? makeLine(seriesA) : null;
  const pathB = seriesB ? makeLine(seriesB) : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="da" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorA} stopOpacity="0.25" />
          <stop offset="100%" stopColor={colorA} stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="db" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorB} stopOpacity="0.2" />
          <stop offset="100%" stopColor={colorB} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => {
        const y = pT + cH * (1 - t);
        return (
          <g key={i}>
            <line x1={pL} y1={y} x2={W - pR} y2={y} stroke={T.s3} strokeWidth="1" />
            <text x={pL - 5} y={y + 3.5} textAnchor="end" fill={T.text3} fontSize="9" fontFamily={R}>
              {Math.round(nMax * t)}
            </text>
          </g>
        );
      })}
      {pathB && pathB.pts.length > 1 && (
        <>
          <path d={pathB.area} fill="url(#db)" />
          <path d={pathB.line} fill="none" stroke={colorB} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {pathA && pathA.pts.length > 1 && (
        <>
          <path d={pathA.area} fill="url(#da)" />
          <path d={pathA.line} fill="none" stroke={colorA} strokeWidth="2" strokeLinecap="round" />
          {pathA.pts.filter((_, i) => i === 0 || i === pathA.pts.length - 1).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={T.s1} stroke={colorA} strokeWidth="2" />
          ))}
        </>
      )}
      {pathB && pathB.pts.length > 1 && (
        pathB.pts.filter((_, i) => i === 0 || i === pathB.pts.length - 1).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={T.s1} stroke={colorB} strokeWidth="1.5" />
        ))
      )}
    </svg>
  );
};

// ─── SVG: Donut chart ─────────────────────────────────────────────────────────
const DonutChart = ({ segments = [], size = 140 }) => {
  if (!segments.length) return <div style={{ width: size, height: size }} />;
  const cx = size / 2, cy = size / 2, Ro = size / 2 - 10, Ri = Ro * 0.6;
  const total = segments.reduce((s, g) => s + g.value, 0) || 1;
  let cum = 0;
  const wedges = segments.map((seg, i) => {
    const pct = seg.value / total;
    const a1 = cum * 2 * Math.PI - Math.PI / 2;
    const a2 = (cum + pct) * 2 * Math.PI - Math.PI / 2;
    cum += pct;
    const large = pct > 0.5 ? 1 : 0;
    const x1 = cx + Ro * Math.cos(a1), y1 = cy + Ro * Math.sin(a1);
    const x2 = cx + Ro * Math.cos(a2), y2 = cy + Ro * Math.sin(a2);
    const xi1 = cx + Ri * Math.cos(a2), yi1 = cy + Ri * Math.sin(a2);
    const xi2 = cx + Ri * Math.cos(a1), yi2 = cy + Ri * Math.sin(a1);
    return (
      <path key={i}
        d={`M${x1.toFixed(2)},${y1.toFixed(2)} A${Ro},${Ro} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${xi1.toFixed(2)},${yi1.toFixed(2)} A${Ri},${Ri} 0 ${large},0 ${xi2.toFixed(2)},${yi2.toFixed(2)} Z`}
        fill={seg.color} />
    );
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={Ri + 1} fill={T.s1} />
      {wedges}
      <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle"
        fill={T.text} fontSize="18" fontWeight="700" fontFamily={R}>{fmtNum(total)}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle"
        fill={T.text3} fontSize="9" fontFamily={R} letterSpacing="0.1em">USERS</text>
    </svg>
  );
};

// ─── Horizontal bar chart (Platform Summary) ──────────────────────────────────
const HorizBars = ({ items = [] }) => {
  const max = Math.max(...items.map(x => x.value || 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, i) => {
        const pct = Math.round((item.value || 0) / max * 100);
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontFamily: R, fontSize: 12, color: T.text2 }}>{item.label}</span>
              </div>
              <span style={{ fontFamily: M, fontSize: 12, fontWeight: 600, color: item.color }}>{fmtNum(item.value)}</span>
            </div>
            <div style={{ height: 5, background: T.s3, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: `linear-gradient(90deg, ${item.color}99, ${item.color})`,
                borderRadius: 999,
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Trend indicator ──────────────────────────────────────────────────────────
const Trend = ({ value, label }) => {
  if (value == null) return null;
  const up = value >= 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 11, fontFamily: R, fontWeight: 500,
      color: up ? T.success : T.error }}>
      <i className={`fas fa-arrow-${up ? 'up' : 'down'}`} style={{ fontSize: 8 }} />
      {Math.abs(value)}% {label}
    </span>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
const Pill = ({ label, color = T.text2, bg = T.s2 }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    padding: '2px 8px', borderRadius: 9999,
    background: bg, color, fontSize: 11, fontFamily: R, fontWeight: 500, whiteSpace: 'nowrap',
  }}>{label}</span>
);

const RolePill = ({ isSuperAdmin, isAdmin }) => {
  if (isSuperAdmin) return <Pill label="★ Super Admin" color="#F59E0B" bg="rgba(245,158,11,0.14)" />;
  if (isAdmin)      return <Pill label="Admin" color={T.accent} bg="rgba(59,130,246,0.14)" />;
  return                   <Pill label="User" color={T.text3} bg={T.s2} />;
};

// ─── Search input ─────────────────────────────────────────────────────────────
const SearchInput = ({ value, onChange, placeholder, width = 260 }) => (
  <div style={{ position: 'relative' }}>
    <i className="fas fa-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.text3, fontSize: 11, pointerEvents: 'none' }} />
    <input value={value} onChange={onChange} placeholder={placeholder}
      style={{ paddingLeft: 30, paddingRight: 12, height: 34, width, fontFamily: R, fontSize: 13, color: T.text,
        background: T.s2, border: `1px solid ${T.s3}`, borderRadius: 20, outline: 'none' }}
      onFocus={e => e.target.style.borderColor = T.accent}
      onBlur={e => e.target.style.borderColor = T.s3} />
  </div>
);

// ─── Table cells ──────────────────────────────────────────────────────────────
const TH = ({ c, style }) => (
  <th style={{ padding: '8px 14px', textAlign: 'left', fontFamily: R, fontSize: 10, fontWeight: 600,
    color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em',
    borderBottom: `1px solid ${T.s3}`, background: T.s0, whiteSpace: 'nowrap', ...style }}>{c}</th>
);
const TD = ({ c, style }) => (
  <td style={{ padding: '10px 14px', fontFamily: R, fontSize: 13, color: T.text,
    borderBottom: `1px solid ${T.s2}`, verticalAlign: 'middle', ...style }}>{c}</td>
);

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const Card = ({ children, style, accent }) => (
  <div style={{
    background: T.s1,
    border: `1px solid ${T.s3}`,
    borderRadius: 12,
    overflow: 'hidden',
    borderTop: accent ? `2px solid ${accent}` : undefined,
    ...style,
  }}>{children}</div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [section,     setSection]     = useState('overview');
  const [stats,       setStats]       = useState(null);
  const [users,       setUsers]       = useState([]);
  const [downloads,   setDownloads]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [toast,       setToast]       = useState(null);
  const [userQ,       setUserQ]       = useState('');
  const [dlQ,         setDlQ]         = useState('');
  const [designCount, setDesignCount] = useState(0);

  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const isSA    = user?.isSuperAdmin;

  const toast$ = (msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    if (!user?.isAdmin) return;
    if (section === 'overview')    loadStats();
    if (section === 'users')       loadUsers();
    if (section === 'downloads')   loadDownloads();
    if (section === 'templatelib') loadDesignCount();
  }, [section, user]);

  const loadDesignCount = async () => {
    try {
      const { data } = await axios.get('/api/templates/admin/all', { headers });
      setDesignCount(data.length);
    } catch { /* ignore */ }
  };

  const loadStats     = async () => { setLoading(true); try { const {data} = await axios.get('/api/admin/stats',     {headers}); setStats(data);     } catch { toast$('Failed to load', 'err'); } finally { setLoading(false); } };
  const loadUsers     = async () => { setLoading(true); try { const {data} = await axios.get('/api/admin/users',     {headers}); setUsers(data);     } catch { toast$('Failed to load', 'err'); } finally { setLoading(false); } };
  const loadDownloads = async () => { setLoading(true); try { const {data} = await axios.get('/api/admin/downloads', {headers}); setDownloads(data); } catch { toast$('Failed to load', 'err'); } finally { setLoading(false); } };

  const toggleAdmin = async (id, isAdmin) => {
    if (!confirm(`${isAdmin ? 'Revoke admin from' : 'Grant admin to'} this user?`)) return;
    try {
      const { data } = await axios.patch(`/api/admin/users/${id}/toggle-admin`, {}, { headers });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isAdmin: data.isAdmin } : u));
      toast$(`Admin ${data.isAdmin ? 'granted' : 'revoked'}`);
    } catch (err) { toast$(err.response?.data?.message || 'Permission denied', 'err'); }
  };

  const filtUsers = users.filter(u => [u.email, u.username, u.profile?.name].some(f => f?.toLowerCase().includes(userQ.toLowerCase())));
  const filtDl    = downloads.filter(d => [d.userEmail, d.userName].some(f => f?.toLowerCase().includes(dlQ.toLowerCase())));

  const navItems = [
    { id: 'overview',    icon: 'fas fa-chart-area',  label: 'Dashboard',       color: T.accent  },
    { id: 'users',       icon: 'fas fa-users',        label: 'Users',           color: T.green,  count: users.length },
    { id: 'templatelib', icon: 'fas fa-paint-brush',  label: 'Template Library',color: T.purple, count: designCount },
    { id: 'downloads',   icon: 'fas fa-archive',      label: 'Downloads',       color: T.amber,  count: downloads.length },
  ];

  // Donut data from users
  const superAdmins = users.filter(u => u.isSuperAdmin).length;
  const admins      = users.filter(u => u.isAdmin && !u.isSuperAdmin).length;
  const regular     = users.length - admins - superAdmins;
  const donutSegs   = [
    { label: 'Regular',     value: regular,     color: T.accent,  pct: users.length ? Math.round(regular / users.length * 100) : 0 },
    { label: 'Admin',       value: admins,       color: T.purple,  pct: users.length ? Math.round(admins / users.length * 100) : 0 },
    { label: 'Super Admin', value: superAdmins,  color: T.amber,   pct: users.length ? Math.round(superAdmins / users.length * 100) : 0 },
  ].filter(s => s.value > 0);

  // Normalized 14-day chart data
  const userGrowthFilled  = fillDays(stats?.userGrowth  || []);
  const loginGrowthFilled = fillDays(stats?.loginGrowth || []);
  const dlGrowthFilled    = fillDays(stats?.downloadGrowth || []);

  // Trend calc
  const trend7v30 = stats && stats.newUsersLast30 > 0
    ? Math.round(((stats.newUsersLast7 * 4 - stats.newUsersLast30) / stats.newUsersLast30) * 100)
    : null;
  const dlTrend = stats && stats.totalDownloads > 0
    ? Math.round((stats.downloadsLast7 / Math.max(1, stats.totalDownloads)) * 100)
    : null;

  const kpiCards = [
    { label: 'TOTAL USERS',      value: fmtNum(stats?.totalUsers),     sub: `+${stats?.newUsersToday ?? 0} today`,        trend: trend7v30, icon: 'fas fa-users',        spark: stats?.userGrowth,     color: T.accent  },
    { label: 'ACTIVE 7 DAYS',    value: fmtNum(stats?.newUsersLast7),  sub: `${stats?.newUsersLast30 ?? 0} last 30 days`, trend: null,      icon: 'fas fa-user-check',   spark: stats?.loginGrowth,    color: T.green   },
    { label: 'TOTAL DOWNLOADS',  value: fmtNum(stats?.totalDownloads), sub: `${stats?.downloadsLast7 ?? 0} this week`,    trend: dlTrend,   icon: 'fas fa-download',     spark: stats?.downloadGrowth, color: T.amber   },
    { label: 'TEMPLATES',        value: fmtNum(stats?.totalTemplates), sub: 'active in library',                          trend: null,      icon: 'fas fa-layer-group',  spark: null,                  color: T.purple  },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg, fontFamily: R }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside style={{
        width: 210, background: T.s0,
        borderRight: `1px solid ${T.s3}`,
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Brand */}
        <div style={{ padding: '18px 16px 16px', borderBottom: `1px solid ${T.s3}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentD})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="fas fa-chart-line" style={{ color: '#fff', fontSize: 13 }} />
            </div>
            <div>
              <p style={{ fontFamily: R, fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1 }}>PORTFOLIO</p>
              <p style={{ fontFamily: R, fontSize: 9, color: T.text3, marginTop: 2, letterSpacing: '0.12em' }}>ADMIN CONSOLE</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p style={{ fontFamily: R, fontSize: 9, fontWeight: 600, color: T.text3, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 8px 8px' }}>Navigation</p>
          {navItems.map(n => {
            const active = section === n.id;
            return (
              <button key={n.id} onClick={() => setSection(n.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 10,
                  background: active ? `${n.color}18` : 'transparent',
                  color: active ? n.color : T.text2,
                  fontFamily: R, fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', transition: 'all 150ms',
                  border: active ? `1px solid ${n.color}30` : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = T.s2; e.currentTarget.style.color = T.text; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.text2; } }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                  background: active ? `${n.color}25` : T.s2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={n.icon} style={{ fontSize: 11, color: active ? n.color : T.text3 }} />
                </div>
                <span style={{ flex: 1, textAlign: 'left' }}>{n.label}</span>
                {n.count > 0 && (
                  <span style={{ fontFamily: M, fontSize: 10, color: active ? n.color : T.text3,
                    background: active ? `${n.color}18` : T.s3,
                    padding: '1px 6px', borderRadius: 999 }}>
                    {n.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div style={{ padding: '10px 10px 14px', borderTop: `1px solid ${T.s3}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 10, background: T.s2, marginBottom: 6 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9999, flexShrink: 0,
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentD})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: R, fontSize: 12, fontWeight: 700, color: '#fff' }}>
                {(user?.email || 'A')[0].toUpperCase()}
              </span>
            </div>
            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: R, fontSize: 11, color: T.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
              <p style={{ fontFamily: R, fontSize: 10, color: isSA ? T.amber : T.text3, marginTop: 1 }}>{isSA ? '★ Super Admin' : 'Admin'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={() => navigate('/dashboard')}
              style={{ flex: 1, height: 30, borderRadius: 8, background: T.s2, color: T.text2, fontFamily: R, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, border: `1px solid ${T.s3}` }}
              onMouseEnter={e => { e.currentTarget.style.background = T.s3; e.currentTarget.style.color = T.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.s2; e.currentTarget.style.color = T.text2; }}>
              <i className="fas fa-home" style={{ fontSize: 10 }} /> Portal
            </button>
            <button onClick={() => { logout(); navigate('/'); }}
              style={{ flex: 1, height: 30, borderRadius: 8, background: 'rgba(244,63,94,0.08)', color: T.red, fontFamily: R, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, border: `1px solid rgba(244,63,94,0.18)` }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,63,94,0.08)'}>
              <i className="fas fa-sign-out-alt" style={{ fontSize: 10 }} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>

        {/* Topbar */}
        <header style={{
          height: 54, background: T.s0,
          borderBottom: `1px solid ${T.s3}`,
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: R, fontSize: 12, color: T.text3 }}>Admin</span>
              <i className="fas fa-chevron-right" style={{ fontSize: 8, color: T.text3 }} />
              <span style={{ fontFamily: R, fontSize: 12, color: T.text, fontWeight: 500, textTransform: 'capitalize' }}>{section}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: M, fontSize: 11, color: T.text3 }}>
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,255,136,0.12)', color: T.green, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 9999, border: `1px solid rgba(0,255,136,0.25)`, letterSpacing: '0.08em' }}>
              <span style={{ width: 5, height: 5, borderRadius: 9999, background: T.green, display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              LIVE
            </span>
            <button onClick={() => {
              if (section === 'overview')    loadStats();
              if (section === 'users')       loadUsers();
              if (section === 'templatelib') loadDesignCount();
              if (section === 'downloads')   loadDownloads();
            }} style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', color: T.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = T.s2}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`} style={{ fontSize: 12 }} />
            </button>
            {/* <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentD})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: R, fontSize: 12, fontWeight: 700, color: '#fff' }}>{(user?.email || 'A')[0].toUpperCase()}</span>
            </div> */}
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ══ OVERVIEW ════════════════════════════════════════════════════════ */}
          {section === 'overview' && (
            <>
              {/* Page title */}
              <div>
                <h1 style={{ fontFamily: R, fontSize: 22, fontWeight: 700, color: T.text }}>Platform Overview</h1>
                <p style={{ fontFamily: R, fontSize: 13, color: T.text3, marginTop: 3 }}>
                  Analytics for <span style={{ color: T.accent }}>{new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                </p>
              </div>

              {/* KPI cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {kpiCards.map((k, i) => (
                  <Card key={i} accent={k.color}>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontFamily: R, fontSize: 10, fontWeight: 600, color: T.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k.label}</span>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${k.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className={k.icon} style={{ fontSize: 12, color: k.color }} />
                        </div>
                      </div>
                      <p style={{ fontFamily: R, fontSize: 28, fontWeight: 700, color: T.text, lineHeight: 1, marginBottom: 6 }}>{k.value}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: R, fontSize: 11, color: T.text3 }}>{k.sub}</span>
                        {k.trend != null && <Trend value={k.trend} label="vs prior" />}
                      </div>
                      {k.spark && k.spark.length > 1 && (
                        <div style={{ marginTop: 10 }}>
                          <Sparkline data={k.spark} color={k.color} w={110} h={26} />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Bar chart + Donut row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <Card>
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <p style={{ fontFamily: R, fontSize: 10, color: T.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>USER GROWTH</p>
                        <h2 style={{ fontFamily: R, fontSize: 16, fontWeight: 600, color: T.text }}>Registration Analysis · 14 Days</h2>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: T.accent, display: 'inline-block' }} />
                          <span style={{ fontFamily: R, fontSize: 11, color: T.text3 }}>Registrations</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: T.red, display: 'inline-block' }} />
                          <span style={{ fontFamily: R, fontSize: 11, color: T.text3 }}>Latest</span>
                        </div>
                      </div>
                    </div>
                    <TimelineBar data={userGrowthFilled} color={T.accent} height={170} />
                  </div>
                </Card>

                <Card>
                  <div style={{ padding: '16px 20px' }}>
                    <p style={{ fontFamily: R, fontSize: 10, color: T.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>SEGMENTATION</p>
                    <h2 style={{ fontFamily: R, fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 18 }}>User Distribution</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                      {stats?.totalUsers > 0
                        ? <DonutChart segments={donutSegs} size={148} />
                        : (
                          <div style={{ width: 148, height: 148, borderRadius: 9999, border: `2px dashed ${T.s3}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: R, fontSize: 11, color: T.text3 }}>No data</span>
                          </div>
                        )
                      }
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {donutSegs.map((seg, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
                            <span style={{ fontFamily: R, fontSize: 12, color: T.text, flex: 1 }}>{seg.label}</span>
                            <div style={{ width: 60, height: 3, background: T.s3, borderRadius: 999 }}>
                              <div style={{ width: `${seg.pct}%`, height: '100%', background: seg.color, borderRadius: 999 }} />
                            </div>
                            <span style={{ fontFamily: M, fontSize: 11, color: T.text2, width: 28, textAlign: 'right' }}>{seg.pct}%</span>
                          </div>
                        ))}
                        {!donutSegs.length && (
                          <p style={{ fontFamily: R, fontSize: 12, color: T.text3, textAlign: 'center' }}>Visit Users tab to see data</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Dual-line chart + Platform stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <Card>
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <p style={{ fontFamily: R, fontSize: 10, color: T.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>SESSION ANALYTICS</p>
                        <h2 style={{ fontFamily: R, fontSize: 16, fontWeight: 600, color: T.text }}>Registrations vs Logins · 14 Days</h2>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 16, height: 2, background: T.accent, display: 'inline-block', borderRadius: 1 }} />
                          <span style={{ fontFamily: R, fontSize: 11, color: T.text3 }}>Users</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 16, height: 2, background: T.green, display: 'inline-block', borderRadius: 1 }} />
                          <span style={{ fontFamily: R, fontSize: 11, color: T.text3 }}>Logins</span>
                        </div>
                      </div>
                    </div>
                    <DualAreaLine
                      seriesA={userGrowthFilled}
                      seriesB={loginGrowthFilled}
                      colorA={T.accent}
                      colorB={T.green}
                      height={115}
                    />
                  </div>
                </Card>

                <Card>
                  <div style={{ padding: '16px 20px' }}>
                    <p style={{ fontFamily: R, fontSize: 10, color: T.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>METRICS</p>
                    <h2 style={{ fontFamily: R, fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 18 }}>Platform Summary</h2>
                    <HorizBars items={[
                      { label: 'Total Visitors',   value: stats?.totalVisitors,  color: T.accent  },
                      { label: 'Visitors (7 days)', value: stats?.visitorsLast7,  color: T.green   },
                      { label: 'New Users Today',  value: stats?.newUsersToday,  color: T.amber   },
                      { label: 'Users (30 days)',  value: stats?.newUsersLast30, color: T.text2   },
                      { label: 'Downloads (7d)',   value: stats?.downloadsLast7, color: T.red     },
                    ]} />
                  </div>
                </Card>
              </div>

              {/* Recent registrations */}
              <Card>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.s3}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontFamily: R, fontSize: 12, fontWeight: 600, color: T.text2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Recent Registrations</p>
                  <button onClick={() => setSection('users')} style={{ fontFamily: R, fontSize: 12, color: T.accent, background: 'none', cursor: 'pointer' }}>View All →</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>{['Account', 'Username', 'Joined', 'Last Login', 'Role'].map(h => <TH key={h} c={h} />)}</tr>
                    </thead>
                    <tbody>
                      {(stats?.recentUsers || []).map((u, ri) => (
                        <tr key={u._id}
                          onMouseEnter={e => e.currentTarget.style.background = T.s2}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <TD c={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent}60, ${T.accentD}60)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontFamily: R, fontSize: 12, fontWeight: 700, color: T.text }}>{(u.profile?.name || u.email || '?')[0].toUpperCase()}</span>
                              </div>
                              <div>
                                <p style={{ fontFamily: R, fontSize: 13, fontWeight: 500, color: T.text }}>{u.profile?.name || 'No name'}</p>
                                <p style={{ fontFamily: R, fontSize: 11, color: T.text2 }}>{u.email}</p>
                              </div>
                            </div>
                          } />
                          <TD c={<span style={{ fontFamily: M, fontSize: 12, color: T.text2 }}>@{u.username || '—'}</span>} />
                          <TD c={<span style={{ fontFamily: R, fontSize: 12, color: T.text2 }}>{fmtDate(u.createdAt)}</span>} />
                          <TD c={<span style={{ fontFamily: R, fontSize: 12, color: T.text2 }}>{fmtTime(u.lastLogin)}</span>} />
                          <TD c={<RolePill isSuperAdmin={u.isSuperAdmin} isAdmin={u.isAdmin} />} />
                        </tr>
                      ))}
                      {!stats?.recentUsers?.length && (
                        <tr><td colSpan={5} style={{ padding: '28px 12px', textAlign: 'center', fontFamily: R, fontSize: 13, color: T.text3 }}>
                          {loading ? 'Loading…' : 'No registrations yet'}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* ══ USERS ═══════════════════════════════════════════════════════════ */}
          {section === 'users' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ fontFamily: R, fontSize: 20, fontWeight: 700, color: T.text }}>User Management</h1>
                  <p style={{ fontFamily: R, fontSize: 12, color: T.text3, marginTop: 3 }}>{filtUsers.length} of {users.length} accounts</p>
                </div>
                <SearchInput value={userQ} onChange={e => setUserQ(e.target.value)} placeholder="Search name, email, username…" />
              </div>

              <Card>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>{['Account', 'Username', 'Joined', 'Last Login', 'Sessions', 'Downloads', 'Role', 'Actions'].map(h => <TH key={h} c={h} />)}</tr>
                    </thead>
                    <tbody>
                      {filtUsers.map(u => {
                        const canToggle = !u.isSuperAdmin && (isSA || !u.isAdmin);
                        return (
                          <tr key={u._id}
                            onMouseEnter={e => e.currentTarget.style.background = T.s2}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <TD c={
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                                  {u.profile?.photo
                                    ? <img src={u.profile.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${T.accent}50, ${T.accentD}50)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontFamily: R, fontSize: 11, fontWeight: 700, color: T.text }}>{(u.profile?.name || u.email || '?')[0].toUpperCase()}</span>
                                      </div>
                                  }
                                </div>
                                <div>
                                  <p style={{ fontFamily: R, fontSize: 13, fontWeight: 500, color: T.text }}>{u.profile?.name || '—'}</p>
                                  <p style={{ fontFamily: R, fontSize: 11, color: T.text2 }}>{u.email}</p>
                                </div>
                              </div>
                            } />
                            <TD c={<span style={{ fontFamily: M, fontSize: 12, color: T.text2 }}>@{u.username || '—'}</span>} />
                            <TD c={<span style={{ fontFamily: R, fontSize: 12, color: T.text2 }}>{fmtDate(u.createdAt)}</span>} />
                            <TD c={<span style={{ fontFamily: R, fontSize: 12, color: T.text2 }}>{fmtTime(u.lastLogin)}</span>} />
                            <TD c={<span style={{ fontFamily: M, fontSize: 12, color: T.accent, fontWeight: 600 }}>{u.loginCount || 0}</span>} style={{ textAlign: 'center' }} />
                            <TD c={<span style={{ fontFamily: M, fontSize: 12, color: T.amber, fontWeight: 600 }}>{u.downloadCount || 0}</span>} style={{ textAlign: 'center' }} />
                            <TD c={<RolePill isSuperAdmin={u.isSuperAdmin} isAdmin={u.isAdmin} />} />
                            <TD c={canToggle ? (
                              <button onClick={() => toggleAdmin(u._id, u.isAdmin)}
                                style={{
                                  padding: '4px 12px', borderRadius: 20, fontFamily: R, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                                  background: u.isAdmin ? 'rgba(244,63,94,0.1)' : 'rgba(0,255,136,0.1)',
                                  color: u.isAdmin ? T.red : T.green,
                                  border: `1px solid ${u.isAdmin ? 'rgba(244,63,94,0.25)' : 'rgba(0,255,136,0.25)'}`,
                                }}>
                                {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                              </button>
                            ) : (
                              <span style={{ fontFamily: R, fontSize: 11, color: T.text3 }}>
                                {u.isSuperAdmin ? '—' : 'Super Admin only'}
                              </span>
                            )} />
                          </tr>
                        );
                      })}
                      {!filtUsers.length && (
                        <tr><td colSpan={8} style={{ padding: '40px 12px', textAlign: 'center', fontFamily: R, fontSize: 13, color: T.text3 }}>
                          {loading ? 'Loading…' : 'No accounts found'}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {filtUsers.length > 0 && (
                  <div style={{ padding: '8px 14px', borderTop: `1px solid ${T.s3}`, fontFamily: R, fontSize: 11, color: T.text3 }}>
                    Showing {filtUsers.length} of {users.length} accounts
                  </div>
                )}
              </Card>
            </>
          )}

          {/* ══ TEMPLATE LIBRARY ════════════════════════════════════════════════ */}
          {section === 'templatelib' && (
            <TemplateLibrary onCountChange={setDesignCount} />
          )}

          {/* ══ DOWNLOADS ═══════════════════════════════════════════════════════ */}
          {section === 'downloads' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ fontFamily: R, fontSize: 20, fontWeight: 700, color: T.text }}>Download Archive</h1>
                  <p style={{ fontFamily: R, fontSize: 12, color: T.text3, marginTop: 3 }}>Saved copy of every user portfolio ZIP · {filtDl.length} records</p>
                </div>
                <SearchInput value={dlQ} onChange={e => setDlQ(e.target.value)} placeholder="Search by name or email…" />
              </div>

              <Card>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>{['#', 'User', 'File', 'Size', 'Downloaded At', 'Action'].map(h => <TH key={h} c={h} />)}</tr></thead>
                    <tbody>
                      {filtDl.map((d, i) => (
                        <tr key={d._id}
                          onMouseEnter={e => e.currentTarget.style.background = T.s2}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <TD c={<span style={{ fontFamily: M, fontSize: 11, color: T.text3 }}>{i + 1}</span>} />
                          <TD c={
                            <div>
                              <p style={{ fontFamily: R, fontSize: 13, fontWeight: 500, color: T.text }}>{d.userName || 'Unknown'}</p>
                              <p style={{ fontFamily: R, fontSize: 11, color: T.text2 }}>{d.userEmail}</p>
                            </div>
                          } />
                          <TD c={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <i className="fas fa-file-archive" style={{ color: T.amber, fontSize: 13 }} />
                              <span style={{ fontFamily: M, fontSize: 12, color: T.text2 }}>{d.fileName}</span>
                            </div>
                          } />
                          <TD c={<span style={{ fontFamily: M, fontSize: 12, color: T.text3 }}>{fmtBytes(d.fileSize)}</span>} />
                          <TD c={<span style={{ fontFamily: R, fontSize: 12, color: T.text2 }}>{fmtTime(d.downloadedAt)}</span>} />
                          <TD c={
                            <button onClick={() => window.open(`/api/admin/downloads/${d._id}/file?token=${token}`, '_blank')}
                              style={{ height: 28, padding: '0 12px', borderRadius: 8, background: `${T.accent}12`, color: T.accent, fontFamily: R, fontSize: 11, cursor: 'pointer', border: `1px solid ${T.accent}28`, display: 'flex', alignItems: 'center', gap: 5 }}>
                              <i className="fas fa-download" style={{ fontSize: 9 }} /> Download
                            </button>
                          } />
                        </tr>
                      ))}
                      {!filtDl.length && (
                        <tr><td colSpan={6} style={{ padding: '48px 12px', textAlign: 'center' }}>
                          <i className="fas fa-inbox" style={{ fontSize: 30, color: T.s3, display: 'block', marginBottom: 10 }} />
                          <p style={{ fontFamily: R, fontSize: 13, color: T.text3 }}>{loading ? 'Loading…' : dlQ ? 'No results found' : 'No downloads recorded yet'}</p>
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {filtDl.length > 0 && (
                  <div style={{ padding: '8px 14px', borderTop: `1px solid ${T.s3}`, fontFamily: R, fontSize: 11, color: T.text3 }}>
                    Showing {filtDl.length} of {downloads.length} records
                  </div>
                )}
              </Card>
            </>
          )}

        </div>
      </main>

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', borderRadius: 12,
          fontFamily: R, fontSize: 13, fontWeight: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          ...(toast.type === 'err'
            ? { background: '#1A0C10', border: `1px solid rgba(244,63,94,0.3)`, color: T.red }
            : { background: '#0C1A14', border: `1px solid rgba(0,255,136,0.3)`, color: T.green }),
        }}>
          <i className={`fas ${toast.type === 'err' ? 'fa-exclamation-circle' : 'fa-check-circle'}`} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
