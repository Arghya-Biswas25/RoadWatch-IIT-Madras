import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, ArrowRight, X, ChevronDown } from 'lucide-react';
import { fetchComplaints, fetchContractors, assignComplaint, escalateComplaint } from '../lib/api';
import { Badge, RoadTypeBadge } from '../components/ui/Badge';
import type { Complaint, Contractor } from '../types';

const SCORE_COLOR = (s: number) =>
  s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : s >= 40 ? 'text-orange-600' : 'text-red-600';

type TabType = 'complaints' | 'contractors';

export default function AdminDashboard() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabType>('complaints');
  const [reassignId, setReassignId] = useState<string | null>(null);
  const [reassignEngId, setReassignEngId] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedScore, setExpandedScore] = useState<string | null>(null);

  const { data: complaints = [] } = useQuery<Complaint[]>({ queryKey: ['all-complaints'], queryFn: fetchComplaints });
  const { data: contractors = [] } = useQuery<Contractor[]>({ queryKey: ['contractors'], queryFn: fetchContractors });

  const assignMutation = useMutation({
    mutationFn: ({ id, engId }: { id: string; engId: string }) => assignComplaint(id, engId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['all-complaints'] }); setReassignId(null); setReassignEngId(''); },
  });
  const escalateMutation = useMutation({
    mutationFn: (id: string) => escalateComplaint(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-complaints'] }),
  });

  const allComplaints = complaints as Complaint[];
  const filtered = filterStatus === 'all' ? allComplaints : allComplaints.filter(c => c.status === filterStatus);
  const totalOpen   = allComplaints.filter(c => !['Resolved','Closed'].includes(c.status)).length;
  const totalEsc    = allComplaints.filter(c => c.escalated).length;
  const slaBreached = allComplaints.filter(c => c.sla_info?.sla_breach).length;

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Sticky top bar ── */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <Shield size={20} className="text-brand-700" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Full system oversight</p>
          </div>
          {/* Summary pills */}
          <div className="ml-auto flex gap-2 flex-wrap">
            {[
              { v: totalOpen,   l: 'Open',      c: 'bg-orange-50 text-orange-700 border-orange-100' },
              { v: slaBreached, l: 'SLA breach', c: 'bg-red-50    text-red-700    border-red-100'    },
              { v: totalEsc,    l: 'Escalated',  c: 'bg-purple-50 text-purple-700 border-purple-100' },
              { v: allComplaints.length, l: 'Total', c: 'bg-blue-50 text-blue-700 border-blue-100' },
            ].map(p => (
              <div key={p.l} className={`text-xs font-semibold px-3 py-1 rounded-full border ${p.c}`}>
                {p.v} {p.l}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {(['complaints','contractors'] as TabType[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 capitalize
                ${tab === t
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 min-h-0 scroll-panel">

        {/* COMPLAINTS */}
        {tab === 'complaints' && (
          <div className="flex flex-col h-full min-h-0">
            {/* Status filter */}
            <div className="shrink-0 flex gap-1.5 px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex-wrap">
              {['all','Submitted','Routed','Seen','InProgress','Resolved','Escalated'].map(f => (
                <button key={f} onClick={() => setFilterStatus(f)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150
                    ${filterStatus === f ? 'bg-brand-700 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
                  {f === 'all' ? `All (${allComplaints.length})` : `${f} (${allComplaints.filter(c=>c.status===f).length})`}
                </button>
              ))}
            </div>

            {/* Scrollable table */}
            <div className="flex-1 min-h-0 scroll-panel px-4 py-3 mobile-safe-bottom">
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                <table className="w-full text-sm table-sticky">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Token</th>
                      <th className="text-left px-4 py-3">Road / Location</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
                      <th className="text-left px-4 py-3">Severity</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3 hidden lg:table-cell">Filed</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((c: Complaint) => (
                      <tr key={c.id}
                        className={`transition-colors hover:bg-gray-50 ${c.sla_info?.sla_breach ? 'bg-red-50/40' : ''}`}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">{c.tracking_token}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-700 text-xs">{c.road_name || `(${c.latitude?.toFixed(2)}, ${c.longitude?.toFixed(2)})`}</p>
                          {c.road_type && <RoadTypeBadge type={c.road_type} />}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{c.category}</td>
                        <td className="px-4 py-3"><Badge label={c.severity} /></td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <Badge label={c.status} />
                            {c.sla_info?.sla_breach && <span className="text-[10px] text-red-600 font-semibold">⚠ SLA breach</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {!['Resolved','Closed','Escalated'].includes(c.status) && (
                              <button onClick={() => escalateMutation.mutate(c.id)}
                                className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors active:scale-95">
                                Escalate
                              </button>
                            )}
                            <button onClick={() => setReassignId(reassignId === c.id ? null : c.id)}
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors active:scale-95">
                              Reassign
                            </button>
                          </div>
                          {reassignId === c.id && (
                            <div className="mt-2 flex items-center gap-1">
                              <select value={reassignEngId} onChange={e => setReassignEngId(e.target.value)}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1 flex-1 focus:outline-none focus:ring-1 focus:ring-brand-400">
                                <option value="">Select engineer…</option>
                                {(contractors as Contractor[]).map(ct => (
                                  <option key={ct.id} value={ct.id}>{ct.name}</option>
                                ))}
                              </select>
                              <button onClick={() => assignMutation.mutate({ id: c.id, engId: reassignEngId })}
                                disabled={!reassignEngId}
                                className="text-xs px-2 py-1 bg-brand-700 hover:bg-brand-600 text-white rounded-lg disabled:opacity-40 transition-colors active:scale-95">
                                <ArrowRight size={12} />
                              </button>
                              <button onClick={() => setReassignId(null)} className="text-gray-300 hover:text-gray-500">
                                <X size={14} />
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
          </div>
        )}

        {/* CONTRACTORS */}
        {tab === 'contractors' && (
          <div className="px-4 py-4 space-y-3 mobile-safe-bottom">
            {(contractors as Contractor[]).map(c => {
              const score    = c.performance_score;
              const expanded = expandedScore === c.id;
              const band     = score == null ? null : score >= 80 ? { l:'Excellent', cls:'border-green-200 bg-green-50' } : score >= 60 ? { l:'Good', cls:'border-yellow-200 bg-yellow-50' } : score >= 40 ? { l:'Below Average', cls:'border-orange-200 bg-orange-50' } : { l:'Poor', cls:'border-red-200 bg-red-50' };
              return (
                <div key={c.id} className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden card-hover ${band?.cls || 'border-gray-200'}`}>
                  {/* Header row */}
                  <button className="w-full text-left p-4 flex items-center gap-3"
                    onClick={() => setExpandedScore(expanded ? null : c.id)}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.state} · {c.registration_no}</p>
                      {c.note && <p className="text-xs text-gray-300 italic mt-0.5 truncate">{c.note}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      {score != null ? (
                        <>
                          <p className={`text-2xl font-bold ${SCORE_COLOR(score)}`}>{score}</p>
                          <p className="text-xs text-gray-400">{band?.l}</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-300 italic">No data</p>
                      )}
                    </div>
                    <ChevronDown size={16} className={`text-gray-300 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Expanded score breakdown */}
                  {expanded && c.score_breakdown && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
                      {[
                        { label: 'Resolution Rate', value: c.score_breakdown.resolution_rate_score, max: 25, color: 'bg-blue-400' },
                        { label: 'Response Time',   value: c.score_breakdown.response_time_score,   max: 25, color: 'bg-purple-400' },
                        { label: 'Road Longevity',  value: c.score_breakdown.longevity_score,       max: 25, color: 'bg-teal-400' },
                        { label: 'Loyalty Bonus',   value: c.score_breakdown.loyalty_bonus,         max: 10, color: 'bg-green-400' },
                      ].map(row => (
                        <div key={row.label} className="flex items-center gap-3 text-xs">
                          <span className="w-32 text-gray-500 shrink-0">{row.label}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className={`h-2 rounded-full ${row.color} transition-all duration-500`}
                              style={{ width: `${Math.max(0, (row.value / row.max) * 100)}%` }} />
                          </div>
                          <span className="w-8 text-right font-semibold text-gray-600">{row.value.toFixed(1)}</span>
                        </div>
                      ))}
                      {c.score_breakdown.repeat_penalty > 0 && (
                        <div className="flex items-center gap-3 text-xs">
                          <span className="w-32 text-red-500 shrink-0">Repeat Penalty</span>
                          <span className="font-semibold text-red-500">−{c.score_breakdown.repeat_penalty}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
                        <span>Total: {c.score_breakdown.total_complaints}</span>
                        <span>Resolved: {c.score_breakdown.resolved_complaints}</span>
                        <span>Open: {c.score_breakdown.open_complaints}</span>
                        <span>Rate: {c.score_breakdown.resolution_rate}%</span>
                      </div>
                      {c.score_breakdown.longevity_note && (
                        <p className="text-[11px] text-gray-300 italic">{c.score_breakdown.longevity_note}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {(contractors as Contractor[]).length === 0 && (
              <div className="text-center py-12 text-gray-300">
                <p className="text-sm text-gray-400">No contractors yet. Add via admin panel.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
