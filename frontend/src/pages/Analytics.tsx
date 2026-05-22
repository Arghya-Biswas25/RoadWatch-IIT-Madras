import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { AlertTriangle, CheckCircle, Clock, MapPin, ExternalLink, Newspaper, TrendingUp, Globe } from 'lucide-react';
import { fetchAnalytics } from '../lib/api';
import { StatCard } from '../components/ui/Card';

const STATUS_COLORS: Record<string, string> = {
  Submitted: '#3b82f6', Routed: '#6366f1', Seen: '#8b5cf6',
  InProgress: '#f59e0b', Resolved: '#22c55e', Escalated: '#ef4444',
};

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

function formatLakh(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`;
  return n.toLocaleString();
}

function Tip({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-400 mt-1 italic">{children}</p>;
}

export default function Analytics() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics'], queryFn: fetchAnalytics });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-700" />
    </div>
  );

  const d = data as any;
  const cs = d?.complaint_stats;
  const ns = d?.national_stats;
  const news = d?.news;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Complaints: RoadWatch · National stats: MoRTH/NHAI public reports · News: GDELT Project (live)
        </p>
      </div>

      {/* ── RoadWatch complaint stats ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Complaint Statistics (RoadWatch)</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Complaints"  value={cs?.total ?? 0}       icon={<AlertTriangle size={18} />} colour="orange" />
          <StatCard label="Resolved"          value={cs?.resolved ?? 0}    icon={<CheckCircle size={18} />}   colour="green"  />
          <StatCard label="Avg Resolution"    value={cs?.avg_resolution_hours != null ? `${cs.avg_resolution_hours}h` : 'N/A'} icon={<Clock size={18} />} colour="blue" />
          <StatCard label="Escalated"         value={cs?.escalated ?? 0}   icon={<TrendingUp size={18} />}    colour="red"    />
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Complaints by status */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Complaints by Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={cs?.by_status ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70}
                label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}>
                {(cs?.by_status ?? []).map((e: any, i: number) => (
                  <Cell key={i} fill={STATUS_COLORS[e.status] || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <Tip>Source: RoadWatch complaint database (citizen-submitted)</Tip>
        </div>

        {/* Complaints by category */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cs?.by_category ?? []} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
          <Tip>Source: RoadWatch complaint database</Tip>
        </div>

        {/* Monthly volume */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Monthly Complaint Volume</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={cs?.monthly_volume ?? []} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Complaints" />
            </LineChart>
          </ResponsiveContainer>
          <Tip>Source: RoadWatch complaint database</Tip>
        </div>

        {/* Contractor scores */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Contractor Performance Scores</h3>
          {d?.contractor_scores?.length > 0 ? (
            d.contractor_scores.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.name}</p>
                  {c.note && <p className="text-xs text-gray-400 italic">{c.note.slice(0, 60)}…</p>}
                </div>
                <span className={`text-lg font-bold ${c.overall_score == null ? 'text-gray-300' : c.overall_score >= 70 ? 'text-green-600' : c.overall_score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {c.overall_score != null ? c.overall_score : 'N/A'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">No contractor data. Admin must enter contractor profiles.</p>
          )}
          <Tip>Score computed from RoadWatch complaint resolution data</Tip>
        </div>
      </div>

      {/* ── National Road Statistics (verified govt data) ── */}
      {ns && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Globe size={16} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">National Road Statistics — India</h2>
            <span className="text-xs text-gray-300">MoRTH/NHAI/PMGSY verified reports</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <StatCard label="Total Road Network" value={`${(ns.road_network.total_km/1_000_000).toFixed(2)}M km`}
              sub={`Density: ${ns.road_network.road_density_per_100sqkm} km/100km²`} icon={<MapPin size={18} />} colour="blue" />
            <StatCard label="National Highways" value={`${(ns.road_network.national_highways_km/1000).toFixed(0)}K km`}
              sub="NHAI / MoRTH" icon={<TrendingUp size={18} />} colour="purple" />
            <StatCard label="Road Accidents (2022)" value={ns.accidents.total_accidents.toLocaleString()}
              sub={`Deaths: ${ns.accidents.total_deaths.toLocaleString()}`} icon={<AlertTriangle size={18} />} colour="red" />
            <StatCard label="Budget 2024-25" value={`₹${(ns.budget_2024_25.morth_allocation_cr/100000).toFixed(1)}L Cr`}
              sub="MoRTH allocation" icon={<CheckCircle size={18} />} colour="green" />
          </div>

          {/* Road network breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">India Road Network Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart layout="vertical" margin={{ left: 20 }} data={[
                { type: 'National Highways',    km: ns.road_network.national_highways_km },
                { type: 'State Highways',       km: ns.road_network.state_highways_km },
                { type: 'Other PWD Roads',      km: ns.road_network.other_pwd_roads_km },
                { type: 'Rural Roads (PMGSY)',  km: ns.road_network.rural_roads_km },
                { type: 'Urban Roads',          km: ns.road_network.urban_roads_km },
              ]}>
                <XAxis type="number" tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 10 }} width={130} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} km`} />
                <Bar dataKey="km" fill="#6366f1" radius={[0,4,4,0]} name="Length (km)" />
              </BarChart>
            </ResponsiveContainer>
            <Tip>Source: MoRTH Road Transport Yearbook 2022-23 — verified government data</Tip>
          </div>

          <p className="text-xs text-gray-300 mt-2">{ns.disclaimer}</p>
        </section>
      )}

      {/* ── Live News ── */}
      {news && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Newspaper size={16} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Road & Infrastructure News</h2>
            <span className="text-xs text-gray-300">GDELT Project · last 7 days · live</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {(['infrastructure', 'accidents', 'budget'] as const).map(topic => {
              const feed = news[topic];
              if (!feed?.articles?.length) return null;
              const labels: Record<string, string> = { infrastructure: '🏗 Infrastructure', accidents: '🚨 Accidents', budget: '💰 Budget' };
              return (
                <div key={topic} className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-sm text-gray-800 mb-2">{labels[topic]}</h3>
                  <div className="space-y-2">
                    {feed.articles.map((a: any, i: number) => (
                      <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                        className="block group">
                        <p className="text-xs font-medium text-gray-700 group-hover:text-brand-700 leading-snug line-clamp-2">{a.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          {a.source}
                          {a.published && <> · {new Date(a.published).toLocaleDateString()}</>}
                          <ExternalLink size={9} className="ml-0.5" />
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Data portals */}
      {ns?.data_portals && (
        <section>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Official Data Sources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
            {ns.data_portals.map((p: any) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-2 bg-white border border-gray-200 rounded-lg p-3 hover:border-brand-300 hover:bg-brand-50 transition-colors group">
                <ExternalLink size={13} className="text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-800 group-hover:text-brand-700">{p.name}</p>
                  <p className="text-xs text-gray-500 leading-snug">{p.data}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
