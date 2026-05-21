import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, MapPin, Clock, DollarSign } from 'lucide-react';
import { fetchAnalytics } from '../lib/api';
import { StatCard } from '../components/ui/Card';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const STATUS_COLORS: Record<string, string> = {
  Submitted: '#3b82f6', Routed: '#6366f1', Seen: '#8b5cf6',
  InProgress: '#f59e0b', Resolved: '#22c55e', Escalated: '#ef4444', Closed: '#94a3b8',
};

function formatLakh(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  return `₹${(n / 100_000).toFixed(1)}L`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics'], queryFn: fetchAnalytics });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-700" />
    </div>
  );

  const d = data as any;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Public Analytics Dashboard</h1>
        <p className="text-sm text-gray-500">Real-time road quality & complaint statistics</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Complaints" value={d?.summary?.total_complaints ?? 0} icon={<AlertTriangle size={18} />} colour="orange" />
        <StatCard label="Resolved" value={d?.summary?.resolved_complaints ?? 0} icon={<CheckCircle size={18} />} colour="green" />
        <StatCard label="Avg Resolution" value={d?.summary?.avg_resolution_hours ? `${d.summary.avg_resolution_hours}h` : 'N/A'} icon={<Clock size={18} />} colour="blue" />
        <StatCard label="Critical Roads" value={d?.summary?.critical_roads ?? 0} sub={`${d?.summary?.poor_roads ?? 0} Poor`} icon={<MapPin size={18} />} colour="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Complaints by Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Complaints by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={d?.complaints_by_status ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}>
                {(d?.complaints_by_status ?? []).map((entry: any, i: number) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Complaints by Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d?.complaints_by_category ?? []} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Complaint Roads */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Most Complained Roads</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d?.top_complaint_roads ?? []} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="road" tick={{ fontSize: 10 }} width={130} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Road Quality Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Road Quality Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={d?.road_quality_distribution ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} label={({ status, count }) => `${status}: ${count}`}>
                {(d?.road_quality_distribution ?? []).map((entry: any, i: number) => {
                  const c: Record<string, string> = { Good: '#22c55e', Fair: '#eab308', Poor: '#f97316', Critical: '#ef4444', Unknown: '#94a3b8' };
                  return <Cell key={i} fill={c[entry.status] || COLORS[i]} />;
                })}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Budget by District */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Budget Utilisation by District</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d?.budget_by_district ?? []} margin={{ left: 10 }}>
              <XAxis dataKey="district" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => formatLakh(v)} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => formatLakh(v)} />
              <Legend />
              <Bar dataKey="sanctioned" name="Sanctioned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Spent" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly complaint volume */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Complaint Volume</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={d?.monthly_volume ?? []} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Complaints" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contractor Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Contractor Performance Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Contractor</th>
                <th className="text-left px-4 py-3">State</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Resolution Rate</th>
                <th className="text-left px-4 py-3">Open / Resolved</th>
                <th className="text-left px-4 py-3">Band</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(d?.contractor_scores ?? []).map((c: any, i: number) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-400">#{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.state}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-lg ${c.overall_score >= 80 ? 'text-green-600' : c.overall_score >= 60 ? 'text-yellow-600' : c.overall_score >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                      {c.overall_score}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-20">
                        <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${c.resolution_rate || 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-600">{c.resolution_rate || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.open_complaints} / {c.resolved_complaints}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                      ${c.band?.label === 'Excellent' ? 'bg-green-100 text-green-700' :
                        c.band?.label === 'Good' ? 'bg-yellow-100 text-yellow-700' :
                        c.band?.label === 'Below Average' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'}`}>
                      {c.band?.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
