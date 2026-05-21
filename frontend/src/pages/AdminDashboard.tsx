import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Users, MapPin, AlertTriangle, CheckCircle, TrendingUp, ChevronDown, ArrowRight } from 'lucide-react';
import { fetchComplaints, fetchContractors, assignComplaint, escalateComplaint, fetchRoads } from '../lib/api';
import { Badge, RoadTypeBadge } from '../components/ui/Badge';
import { Card, CardHeader, CardBody, StatCard } from '../components/ui/Card';
import type { Complaint, Contractor, Road } from '../types';

const SCORE_COLOR = (s: number) =>
  s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : s >= 40 ? 'text-orange-600' : 'text-red-600';

const SCORE_BG = (s: number) =>
  s >= 80 ? 'bg-green-50 border-green-100' : s >= 60 ? 'bg-yellow-50 border-yellow-100' : s >= 40 ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100';

type TabType = 'complaints' | 'contractors' | 'roads';

export default function AdminDashboard() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabType>('complaints');
  const [reassignId, setReassignId] = useState<string | null>(null);
  const [reassignEngId, setReassignEngId] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: complaints = [] } = useQuery<Complaint[]>({ queryKey: ['all-complaints'], queryFn: fetchComplaints });
  const { data: contractors = [] } = useQuery<Contractor[]>({ queryKey: ['contractors'], queryFn: fetchContractors });
  const { data: roads = [] } = useQuery<Road[]>({ queryKey: ['roads'], queryFn: () => fetchRoads() });

  const assignMutation = useMutation({
    mutationFn: ({ id, engId }: { id: string; engId: string }) => assignComplaint(id, engId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['all-complaints'] }); setReassignId(null); setReassignEngId(''); },
  });

  const escalateMutation = useMutation({
    mutationFn: (id: string) => escalateComplaint(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-complaints'] }),
  });

  const filteredComplaints = filterStatus === 'all'
    ? complaints as Complaint[]
    : (complaints as Complaint[]).filter(c => c.status === filterStatus);

  const totalOpen = (complaints as Complaint[]).filter(c => !['Resolved', 'Closed'].includes(c.status)).length;
  const totalResolved = (complaints as Complaint[]).filter(c => c.status === 'Resolved').length;
  const escalated = (complaints as Complaint[]).filter(c => c.escalated).length;
  const slaBreached = (complaints as Complaint[]).filter(c => c.sla_info?.sla_breach).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-4">
      <div className="flex items-center gap-3">
        <Shield size={24} className="text-brand-700" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Command Dashboard</h1>
          <p className="text-sm text-gray-500">Full system oversight</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Open Complaints" value={totalOpen} icon={<AlertTriangle size={18} />} colour="orange" />
        <StatCard label="Resolved" value={totalResolved} icon={<CheckCircle size={18} />} colour="green" />
        <StatCard label="SLA Breached" value={slaBreached} icon={<AlertTriangle size={18} />} colour="red" />
        <StatCard label="Escalated" value={escalated} icon={<TrendingUp size={18} />} colour="purple" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['complaints', 'contractors', 'roads'] as TabType[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors -mb-px
              ${tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* COMPLAINTS TAB */}
      {tab === 'complaints' && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {['all', 'Submitted', 'Routed', 'Seen', 'InProgress', 'Resolved', 'Escalated'].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${filterStatus === f ? 'bg-brand-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f === 'all' ? `All (${(complaints as Complaint[]).length})` : f}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Token</th>
                  <th className="text-left px-4 py-3">Road</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Severity</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredComplaints.map(c => (
                  <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${c.sla_info?.sla_breach ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.tracking_token}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{c.road_name}</p>
                      {c.road_type && <RoadTypeBadge type={c.road_type} />}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.category}</td>
                    <td className="px-4 py-3"><Badge label={c.severity} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <Badge label={c.status} />
                        {c.sla_info?.sla_breach && <span className="text-xs text-red-600">⚠ SLA</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!['Resolved', 'Closed', 'Escalated'].includes(c.status) && (
                          <button onClick={() => escalateMutation.mutate(c.id)}
                            className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors">
                            Escalate
                          </button>
                        )}
                        <button onClick={() => { setReassignId(c.id); setReassignEngId(''); }}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                          Reassign
                        </button>
                      </div>
                      {reassignId === c.id && (
                        <div className="mt-2 flex items-center gap-1">
                          <select value={reassignEngId} onChange={e => setReassignEngId(e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 flex-1">
                            <option value="">Select engineer...</option>
                            {(contractors as Contractor[]).map(ct => (
                              <option key={ct.id} value={ct.id}>{ct.name}</option>
                            ))}
                          </select>
                          <button onClick={() => assignMutation.mutate({ id: c.id, engId: reassignEngId })}
                            disabled={!reassignEngId}
                            className="text-xs px-2 py-1 bg-brand-700 text-white rounded disabled:bg-gray-300">
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTRACTORS TAB */}
      {tab === 'contractors' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(contractors as Contractor[]).map(c => (
            <Card key={c.id} className={`${SCORE_BG(c.performance_score || 0)}`}>
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.state} · {c.registration_no}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${SCORE_COLOR(c.performance_score || 0)}`}>{c.performance_score}</p>
                    <p className="text-xs text-gray-400">/ 100</p>
                  </div>
                </div>
                {c.score_breakdown && (
                  <div className="space-y-1.5 text-xs">
                    <ScoreRow label="Resolution Rate" value={c.score_breakdown.resolution_rate_score} max={25} />
                    <ScoreRow label="Response Time" value={c.score_breakdown.response_time_score} max={25} />
                    <ScoreRow label="Road Longevity" value={c.score_breakdown.longevity_score} max={25} />
                    <ScoreRow label="Repeat Penalty" value={-c.score_breakdown.repeat_penalty} max={0} colour="red" />
                    <ScoreRow label="Loyalty Bonus" value={c.score_breakdown.loyalty_bonus} max={10} colour="green" />
                    <div className="pt-1 border-t border-gray-200 flex justify-between text-gray-500">
                      <span>Resolved: {c.score_breakdown.resolved_complaints}/{c.score_breakdown.total_complaints}</span>
                      <span>Open: {c.score_breakdown.open_complaints}</span>
                    </div>
                  </div>
                )}
                {c.band && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <Badge label={c.band.label} />
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* ROADS TAB */}
      {tab === 'roads' && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Road</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Contractor</th>
                <th className="text-left px-4 py-3">Last Relayed</th>
                <th className="text-left px-4 py-3">Open Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(roads as Road[]).map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{r.road_name}</p>
                    <p className="text-xs text-gray-400">{r.district}, {r.state}</p>
                  </td>
                  <td className="px-4 py-3"><RoadTypeBadge type={r.road_type} /></td>
                  <td className="px-4 py-3"><Badge label={r.status} /></td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{r.contractor_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.last_relayed_date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${(r.open_complaints || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {r.open_complaints ?? 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ScoreRow({ label, value, max, colour = 'blue' }: { label: string; value: number; max: number; colour?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const barColor = colour === 'red' ? 'bg-red-400' : colour === 'green' ? 'bg-green-500' : 'bg-brand-500';
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${Math.abs(pct)}%` }} />
      </div>
      <span className={`w-8 text-right font-semibold ${colour === 'red' ? 'text-red-500' : 'text-gray-700'}`}>
        {value < 0 ? value : value.toFixed(1)}
      </span>
    </div>
  );
}
