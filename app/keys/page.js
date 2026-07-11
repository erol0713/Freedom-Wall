'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ─── Country flag emoji helper ───
function countryFlag(code) {
  if (!code || code.length !== 2) return '🌍';
  const offset = 127397;
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + offset));
}

// ─── Referrer source badge colors ───
const REFERRER_COLORS = {
  facebook: { bg: 'rgba(24, 119, 242, 0.15)', text: '#4599FF', border: 'rgba(24, 119, 242, 0.3)', icon: '📘' },
  google: { bg: 'rgba(234, 67, 53, 0.15)', text: '#FF6B5E', border: 'rgba(234, 67, 53, 0.3)', icon: '🔍' },
  twitter: { bg: 'rgba(29, 161, 242, 0.15)', text: '#1DA1F2', border: 'rgba(29, 161, 242, 0.3)', icon: '🐦' },
  instagram: { bg: 'rgba(225, 48, 108, 0.15)', text: '#E1306C', border: 'rgba(225, 48, 108, 0.3)', icon: '📷' },
  tiktok: { bg: 'rgba(254, 44, 85, 0.15)', text: '#FE2C55', border: 'rgba(254, 44, 85, 0.3)', icon: '🎵' },
  youtube: { bg: 'rgba(255, 0, 0, 0.15)', text: '#FF4444', border: 'rgba(255, 0, 0, 0.3)', icon: '▶️' },
  reddit: { bg: 'rgba(255, 69, 0, 0.15)', text: '#FF6B35', border: 'rgba(255, 69, 0, 0.3)', icon: '🤖' },
  linkedin: { bg: 'rgba(10, 102, 194, 0.15)', text: '#0A66C2', border: 'rgba(10, 102, 194, 0.3)', icon: '💼' },
  direct: { bg: 'rgba(57, 255, 20, 0.15)', text: '#39FF14', border: 'rgba(57, 255, 20, 0.3)', icon: '🌐' },
  other: { bg: 'rgba(255, 230, 0, 0.15)', text: '#FFE600', border: 'rgba(255, 230, 0, 0.3)', icon: '🔗' },
};

// ─── Device icons ───
function deviceIcon(d) {
  if (d === 'mobile') return '📱';
  if (d === 'tablet') return '📋';
  return '🖥️';
}

// ─── Browser icons ───
function browserIcon(b) {
  if (!b) return '🌐';
  const name = b.toLowerCase();
  if (name.includes('chrome')) return '🟢';
  if (name.includes('firefox')) return '🟠';
  if (name.includes('safari')) return '🔵';
  if (name.includes('edge')) return '🔷';
  if (name.includes('opera')) return '🔴';
  if (name.includes('samsung')) return '🟣';
  return '🌐';
}

// ─── Time ago formatter ───
function timeAgo(date) {
  if (!date) return 'Never';
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now - d) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

// ═══════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ═══════════════════════════════════════════════════════
function StatCard({ label, value, icon, color, pulse }) {
  return (
    <div className="glass-card-neon rounded-xl p-5 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]">
      {/* Background glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: color }}
      />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-body uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-display font-bold" style={{ color }}>{value}</p>
        </div>
        <div className="text-3xl relative">
          {icon}
          {pulse && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MINI BAR CHART COMPONENT (CSS-only)
// ═══════════════════════════════════════════════════════
function BarChart({ data, color, label }) {
  const maxVal = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="glass-card-neon rounded-xl p-5">
      <h3 className="text-sm font-body font-semibold text-slate-300 mb-4">{label}</h3>
      <div className="flex items-end gap-2 h-32">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-body text-slate-400">{item.count}</span>
            <div
              className="w-full rounded-t-md transition-all duration-700 ease-out"
              style={{
                height: `${Math.max((item.count / maxVal) * 100, 4)}%`,
                background: `linear-gradient(to top, ${color}88, ${color})`,
                minHeight: '4px',
              }}
            />
            <span className="text-[9px] font-body text-slate-500 text-center leading-tight truncate w-full">
              {item.label || item.date?.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// HORIZONTAL BAR LIST COMPONENT
// ═══════════════════════════════════════════════════════
function HBarList({ data, color, label, nameKey = 'name', icon }) {
  const maxVal = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="glass-card-neon rounded-xl p-5">
      <h3 className="text-sm font-body font-semibold text-slate-300 mb-4">{label}</h3>
      <div className="space-y-2.5">
        {data.length === 0 && (
          <p className="text-xs text-slate-500 italic">No data yet</p>
        )}
        {data.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-xs font-body mb-1">
              <span className="text-slate-300">
                {icon && typeof icon === 'function' ? icon(item[nameKey]) : ''} {item[nameKey] || 'Unknown'}
              </span>
              <span className="text-slate-400">{item.count}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(item.count / maxVal) * 100}%`,
                  background: `linear-gradient(90deg, ${color}88, ${color})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// VISITOR DETAIL MODAL
// ═══════════════════════════════════════════════════════
function VisitorDetailModal({ visitor, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId: visitor._id }),
        });
        if (res.ok) {
          const data = await res.json();
          setDetail(data);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [visitor._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative glass-card-neon rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-xl"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(255,0,127,0.2))' }}
          >
            {deviceIcon(visitor.device)}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Visitor Details
            </h2>
            <p className="text-xs font-mono text-slate-500">{visitor.fingerprintId?.slice(0, 16)}...</p>
          </div>
          <div className="ml-auto">
            {visitor.isOnline ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-body font-semibold text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-body text-slate-500 bg-slate-700/30 border border-slate-600/20 rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-slate-500" /> Offline
              </span>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'IP Address', value: visitor.ipAddress || 'Unknown' },
            { label: 'Location', value: [visitor.city, visitor.region, visitor.country].filter(Boolean).join(', ') || 'Unknown' },
            { label: 'Browser', value: `${visitor.browser || 'Unknown'} ${visitor.browserVersion || ''}` },
            { label: 'OS', value: visitor.os || 'Unknown' },
            { label: 'Device', value: visitor.device || 'Unknown' },
            { label: 'Screen', value: visitor.screenRes || 'Unknown' },
            { label: 'Language', value: visitor.language || 'Unknown' },
            { label: 'Timezone', value: visitor.timezone || 'Unknown' },
            { label: 'Referrer', value: visitor.referrerSource || 'direct' },
            { label: 'Visit Count', value: visitor.visitCount || 1 },
            { label: 'First Visit', value: visitor.firstVisit ? new Date(visitor.firstVisit).toLocaleString() : 'Unknown' },
            { label: 'Last Visit', value: visitor.lastVisit ? new Date(visitor.lastVisit).toLocaleString() : 'Unknown' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-800/40 rounded-lg p-3">
              <p className="text-[10px] font-body uppercase tracking-widest text-slate-500 mb-0.5">{item.label}</p>
              <p className="text-sm font-body text-slate-200 truncate">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Cookies */}
        {(visitor.fbpCookie || visitor.fbcCookie) && (
          <div className="mb-6">
            <h3 className="text-sm font-body font-semibold text-slate-300 mb-2">Facebook Cookies</h3>
            <div className="bg-slate-800/40 rounded-lg p-3 space-y-1">
              {visitor.fbpCookie && (
                <p className="text-xs font-mono text-slate-400"><span className="text-neon-cyan">_fbp:</span> {visitor.fbpCookie}</p>
              )}
              {visitor.fbcCookie && (
                <p className="text-xs font-mono text-slate-400"><span className="text-neon-cyan">_fbc:</span> {visitor.fbcCookie}</p>
              )}
            </div>
          </div>
        )}

        {/* Session history */}
        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading session history...</div>
        ) : detail?.sessions?.length > 0 ? (
          <div>
            <h3 className="text-sm font-body font-semibold text-slate-300 mb-2">
              Recent Sessions ({detail.sessions.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {detail.sessions.slice(-10).reverse().map((session, i) => (
                <div key={i} className="bg-slate-800/40 rounded-lg p-3">
                  <p className="text-xs font-body text-slate-400 mb-1">
                    {new Date(session.startTime).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {session.pages?.map((page, j) => (
                      <span key={j} className="text-[10px] font-mono text-neon-cyan bg-neon-cyan/10 rounded px-1.5 py-0.5">
                        {page.path}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500 text-sm">No session history available</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN ADMIN PAGE
// ═══════════════════════════════════════════════════════
export default function AdminKeys() {
  const [activeTab, setActiveTab] = useState('visitors');

  // ─── Posts state ───
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  // ─── Visitors state ───
  const [visitors, setVisitors] = useState([]);
  const [visitorsTotal, setVisitorsTotal] = useState(0);
  const [visitorsLoading, setVisitorsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitorFilter, setVisitorFilter] = useState('all'); // all | online
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorSort, setVisitorSort] = useState('lastVisit');

  // ─── Fetch posts ───
  const fetchPosts = useCallback(async () => {
    try {
      setPostsLoading(true);
      const res = await fetch('/api/posts?limit=100');
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(data.posts);
    } catch (err) {
      setPostsError(err.message);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  // ─── Fetch visitors ───
  const fetchVisitors = useCallback(async () => {
    try {
      setVisitorsLoading(true);
      const params = new URLSearchParams();
      params.set('sort', visitorSort);
      params.set('limit', '100');
      if (visitorFilter === 'online') params.set('status', 'online');
      if (visitorSearch) params.set('search', visitorSearch);

      const res = await fetch(`/api/visitors?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch visitors');
      const data = await res.json();
      setVisitors(data.visitors);
      setVisitorsTotal(data.total);
    } catch {
      // Silent
    } finally {
      setVisitorsLoading(false);
    }
  }, [visitorFilter, visitorSearch, visitorSort]);

  // ─── Fetch stats ───
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch('/api/visitors/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch {
      // Silent
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ─── Initial load & auto-refresh ───
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (activeTab === 'visitors') {
      fetchVisitors();
      fetchStats();

      // Auto-refresh every 10 seconds
      const interval = setInterval(() => {
        fetchVisitors();
        fetchStats();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchVisitors, fetchStats]);

  // ─── Delete post handler ───
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post permanently?')) return;
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      alert('Error deleting post: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen relative z-10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-xl font-bold text-gradient-neon">
                Admin Dashboard
              </h1>

              {/* Tab Navigation */}
              <div className="flex items-center gap-1 bg-slate-800/60 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('visitors')}
                  className={`px-4 py-1.5 rounded-md text-xs font-body font-semibold transition-all duration-200 ${
                    activeTab === 'visitors'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-neon-cyan border border-neon-cyan/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  👁️ Visitors
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-4 py-1.5 rounded-md text-xs font-body font-semibold transition-all duration-200 ${
                    activeTab === 'posts'
                      ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-neon-magenta border border-neon-magenta/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📝 Posts
                </button>
              </div>
            </div>

            <Link
              href="/"
              className="text-xs font-body text-slate-400 hover:text-white transition-colors bg-slate-800/40 hover:bg-slate-700/60 rounded-lg px-4 py-2 border border-slate-700/40"
            >
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ═══════════ VISITORS TAB ═══════════ */}
        {activeTab === 'visitors' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            {statsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="glass-card-neon rounded-xl p-5 h-24 shimmer" />
                ))}
              </div>
            ) : stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Online Now" value={stats.onlineNow} icon="🟢" color="#39FF14" pulse />
                <StatCard label="Total Visitors" value={stats.totalVisitors} icon="👁️" color="#00F0FF" />
                <StatCard label="Today" value={stats.todayVisitors} icon="📅" color="#FF007F" />
                <StatCard label="Avg Pages/Visit" value={stats.avgPagesPerVisit} icon="📊" color="#FFE600" />
              </div>
            )}

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status filter */}
              <div className="flex items-center gap-1 bg-slate-800/60 rounded-lg p-1">
                <button
                  onClick={() => setVisitorFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-xs font-body font-medium transition-all ${
                    visitorFilter === 'all'
                      ? 'bg-slate-700/60 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({visitorsTotal})
                </button>
                <button
                  onClick={() => setVisitorFilter('online')}
                  className={`px-3 py-1.5 rounded-md text-xs font-body font-medium transition-all ${
                    visitorFilter === 'online'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🟢 Online
                </button>
              </div>

              {/* Sort */}
              <select
                value={visitorSort}
                onChange={e => setVisitorSort(e.target.value)}
                className="bg-slate-800/60 border border-slate-700/40 text-slate-300 text-xs font-body rounded-lg px-3 py-2 focus:outline-none focus:border-neon-cyan/40"
              >
                <option value="lastVisit">Last Visit</option>
                <option value="firstVisit">First Visit</option>
                <option value="visitCount">Most Visits</option>
              </select>

              {/* Search */}
              <div className="flex-1 min-w-[200px] max-w-sm">
                <input
                  type="text"
                  placeholder="Search by IP, browser, country..."
                  value={visitorSearch}
                  onChange={e => setVisitorSearch(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700/40 text-slate-200 text-xs font-body rounded-lg px-4 py-2 placeholder-slate-500 focus:outline-none focus:border-neon-cyan/40"
                />
              </div>

              {/* Auto-refresh indicator */}
              <div className="ml-auto flex items-center gap-1.5 text-[10px] font-body text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live — refreshes every 10s
              </div>
            </div>

            {/* Visitors Table */}
            <div className="glass-card-neon rounded-xl overflow-hidden">
              {visitorsLoading && visitors.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm font-body">Loading visitors...</div>
              ) : visitors.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-3">👻</div>
                  <p className="text-slate-400 text-sm font-body">No visitors found</p>
                  <p className="text-slate-600 text-xs font-body mt-1">Visitors will appear here as people browse your site</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-4 py-3 text-[10px] font-body font-semibold uppercase tracking-widest text-slate-500">Status</th>
                        <th className="px-4 py-3 text-[10px] font-body font-semibold uppercase tracking-widest text-slate-500">Visitor</th>
                        <th className="px-4 py-3 text-[10px] font-body font-semibold uppercase tracking-widest text-slate-500">Location</th>
                        <th className="px-4 py-3 text-[10px] font-body font-semibold uppercase tracking-widest text-slate-500">Browser / OS</th>
                        <th className="px-4 py-3 text-[10px] font-body font-semibold uppercase tracking-widest text-slate-500">Source</th>
                        <th className="px-4 py-3 text-[10px] font-body font-semibold uppercase tracking-widest text-slate-500">Visits</th>
                        <th className="px-4 py-3 text-[10px] font-body font-semibold uppercase tracking-widest text-slate-500">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {visitors.map(visitor => {
                        const ref = REFERRER_COLORS[visitor.referrerSource] || REFERRER_COLORS.other;
                        return (
                          <tr
                            key={visitor._id}
                            onClick={() => setSelectedVisitor(visitor)}
                            className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                          >
                            {/* Status */}
                            <td className="px-4 py-3">
                              {visitor.isOnline ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                                  <span className="text-[10px] font-body text-green-400 font-medium">LIVE</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                  <span className="text-[10px] font-body text-slate-500">OFF</span>
                                </span>
                              )}
                            </td>

                            {/* Visitor */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-slate-800/80 border border-slate-700/40 group-hover:border-neon-cyan/20 transition-colors">
                                  {deviceIcon(visitor.device)}
                                </div>
                                <div>
                                  <p className="text-xs font-mono text-slate-300 group-hover:text-neon-cyan transition-colors">
                                    {visitor.fingerprintId?.slice(0, 12)}...
                                  </p>
                                  <p className="text-[10px] font-body text-slate-500">{visitor.ipAddress || 'Unknown IP'}</p>
                                </div>
                              </div>
                            </td>

                            {/* Location */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{countryFlag(visitor.countryCode)}</span>
                                <div>
                                  <p className="text-xs font-body text-slate-300">{visitor.city || visitor.country || 'Unknown'}</p>
                                  {visitor.city && visitor.country && (
                                    <p className="text-[10px] font-body text-slate-500">{visitor.country}</p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Browser / OS */}
                            <td className="px-4 py-3">
                              <p className="text-xs font-body text-slate-300">
                                {browserIcon(visitor.browser)} {visitor.browser || 'Unknown'}
                              </p>
                              <p className="text-[10px] font-body text-slate-500">{visitor.os || 'Unknown OS'}</p>
                            </td>

                            {/* Source */}
                            <td className="px-4 py-3">
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-body font-semibold rounded-full px-2.5 py-1 border"
                                style={{
                                  background: ref.bg,
                                  color: ref.text,
                                  borderColor: ref.border,
                                }}
                              >
                                {ref.icon} {visitor.referrerSource || 'direct'}
                              </span>
                            </td>

                            {/* Visits */}
                            <td className="px-4 py-3">
                              <span className="text-sm font-body font-semibold text-slate-200">{visitor.visitCount || 1}</span>
                            </td>

                            {/* Last Seen */}
                            <td className="px-4 py-3">
                              <p className="text-xs font-body text-slate-400">{timeAgo(visitor.lastVisit)}</p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Charts Section */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Daily visits chart */}
                {stats.dailyVisits?.length > 0 && (
                  <div className="lg:col-span-2">
                    <BarChart
                      data={stats.dailyVisits}
                      color="#00F0FF"
                      label="📈 Visitors — Last 7 Days"
                    />
                  </div>
                )}

                {/* Browsers */}
                {stats.browsers?.length > 0 && (
                  <HBarList
                    data={stats.browsers}
                    color="#FF007F"
                    label="🌐 Browsers"
                    nameKey="name"
                    icon={browserIcon}
                  />
                )}

                {/* Devices */}
                {stats.devices?.length > 0 && (
                  <HBarList
                    data={stats.devices.map(d => ({ name: d.type, count: d.count }))}
                    color="#39FF14"
                    label="📱 Devices"
                    nameKey="name"
                    icon={deviceIcon}
                  />
                )}

                {/* Referrer sources */}
                {stats.referrerSources?.length > 0 && (
                  <HBarList
                    data={stats.referrerSources.map(r => ({ name: r.source, count: r.count }))}
                    color="#FFE600"
                    label="🔗 Traffic Sources"
                    nameKey="name"
                    icon={(name) => REFERRER_COLORS[name]?.icon || '🔗'}
                  />
                )}

                {/* Countries */}
                {stats.countries?.length > 0 && (
                  <HBarList
                    data={stats.countries.map(c => ({ name: `${countryFlag(c.code)} ${c.country}`, count: c.count }))}
                    color="#00F0FF"
                    label="🌍 Top Countries"
                    nameKey="name"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ POSTS TAB ═══════════ */}
        {activeTab === 'posts' && (
          <div className="animate-fade-in">
            {postsError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm font-body">
                Error: {postsError}
              </div>
            )}

            {postsLoading ? (
              <div className="text-center py-20 text-slate-500 font-body">Loading posts...</div>
            ) : (
              <div className="glass-card-neon rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-4 py-3 text-[10px] font-body font-semibold uppercase tracking-widest text-slate-500">ID / Date</th>
                      <th className="px-4 py-3 text-[10px] font-body font-semibold uppercase tracking-widest text-slate-500">Author</th>
                      <th className="px-4 py-3 text-[10px] font-body font-semibold uppercase tracking-widest text-slate-500 w-1/2">Content</th>
                      <th className="px-4 py-3 text-[10px] font-body font-semibold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {posts.map((post) => (
                      <tr key={post._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 align-top">
                          <div className="text-[10px] font-mono text-slate-600 mb-1">{post._id}</div>
                          <div className="text-xs font-body text-slate-400">
                            {new Date(post.createdAt).toLocaleDateString()}{' '}
                            {new Date(post.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {post.isAnonymous ? (
                            <span className="text-slate-500 italic text-xs font-body">Anonymous</span>
                          ) : (
                            <span className="font-semibold text-neon-cyan text-xs font-body">@{post.userHandle}</span>
                          )}
                          <div className="text-[10px] text-slate-600 mt-1 font-body">
                            Type: {post.contentType} <br />
                            Mood: {post.mood}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="text-xs text-slate-300 max-h-32 overflow-y-auto whitespace-pre-wrap font-body">
                            {post.content}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-right">
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg font-semibold text-xs transition-all font-body"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {posts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-500 text-sm font-body">
                          No posts found in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <VisitorDetailModal
          visitor={selectedVisitor}
          onClose={() => setSelectedVisitor(null)}
        />
      )}
    </div>
  );
}
