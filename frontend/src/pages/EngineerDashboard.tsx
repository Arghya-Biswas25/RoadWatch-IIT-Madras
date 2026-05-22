import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, Eye, Wrench, AlertTriangle, Send, MapPin, ChevronRight, X } from 'lucide-react';
import { fetchComplaints, updateComplaintStatus } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/Card';
import type { Complaint } from '../types';

const STATUS_FLOW: Record<string, string[]> = {
  Routed: ['Seen'],
  Seen: ['InProgress'],
  InProgress: ['Resolved'],
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Routed:     <MapPin     size={14} className="text-indigo-500" />,
  Seen:       <Eye        size={14} className="text-purple-500" />,
  InProgress: <Wrench     size={14} className="text-yellow-500" />,
  Resolved:   <CheckCircle size={14} className="text-green-500" />,
  Escalated:  <AlertTriangle size={14} className="text-red-500" />,
};

export default function EngineerDashboard() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [reply, setReply] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [filter, setFilter] = useState('all');

  const { data: complaints = [], isLoading } = useQuery<Complaint[]>({
    queryKey: ['my-complaints'],
    queryFn: fetchComplaints,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, note, engineerReply }: any) =>
      updateComplaintStatus(id, { status, resolution_note: note, engineer_reply: engineerReply }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-complaints'] });
      setReply(''); setResolutionNote('');
    },
  });

  const allComplaints = complaints as Complaint[];
  const filtered = filter === 'all' ? allComplaints : allComplaints.filter(c => c.status === filter);
  const open     = allComplaints.filter(c => !['Resolved','Closed'].includes(c.status));
  const resolved = allComplaints.filter(c => c.status === 'Resolved');
  const slaBreached = allComplaints.filter(c => c.sla_info?.sla_breach).length;

  return (
    /* Full-height two-panel layout: nothing clips, each panel scrolls independently */
    <div className="flex flex-col h-full min-h-0">

      {/* ── Sticky top bar ── */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Engineer Dashboard</h1>
            <p className="text-xs text-gray-400">{user?.name} · {user?.designation}</p>
          </div>
          {/* Stat pills */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'Open',     value: open.length,            color: 'bg-orange-50 text-orange-700 border-orange-100' },
              { label: 'Resolved', value: resolved.length,        color: 'bg-green-50  text-green-700  border-green-100'  },
              { label: 'SLA breach',value: slaBreached,           color: 'bg-red-50    text-red-700    border-red-100'    },
              { label: 'Total',    value: allComplaints.length,   color: 'bg-blue-50   text-blue-700   border-blue-100'   },
            ].map(p => (
              <div key={p.label} className={`text-xs font-semibold px-3 py-1 rounded-full border ${p.color}`}>
                {p.value} {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {['all','Routed','Seen','InProgress','Resolved','Escalated'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150
                ${filter === f
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {f === 'all' ? `All (${allComplaints.length})` : f}
              {f !== 'all' && <span className="ml-1 opacity-60">
                {allComplaints.filter(c => c.status === f).length}
              </span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-panel body ── */}
      <div className="flex flex-1 min-h-0 gap-0">

        {/* LEFT — complaint list (scrolls independently) */}
        <div className={`flex flex-col min-h-0 transition-all duration-200 ${selected ? 'hidden lg:flex lg:w-[55%]' : 'flex-1'}`}>
          <div className="flex-1 scroll-panel px-3 py-3 space-y-2 mobile-safe-bottom">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-300">
                <CheckCircle size={40} className="mx-auto mb-2" />
                <p className="text-sm text-gray-400">No complaints in this category</p>
              </div>
            ) : (
              (filtered as Complaint[]).map(c => (
                <button key={c.id} onClick={() => setSelected(c.id === selected?.id ? null : c)}
                  className={`w-full text-left bg-white rounded-xl border transition-all duration-150 group
                    ${selected?.id === c.id
                      ? 'border-brand-400 shadow-md ring-1 ring-brand-200'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm card-hover'}`}>
                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{STATUS_ICON[c.status] || <Clock size={14} className="text-gray-400" />}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <Badge label={c.status} />
                          <Badge label={c.severity} />
                          <Badge label={c.category} />
                          {c.sla_info?.sla_breach && (
                            <span className="text-[11px] text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded">⚠ SLA</span>
                          )}
                        </div>
                        {c.road_name && (
                          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-0.5">
                            <MapPin size={11} className="text-gray-400 shrink-0" />
                            <span className="truncate">{c.road_name}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500 line-clamp-2">{c.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] font-mono text-gray-300">{c.tracking_token}</span>
                        <ChevronRight size={14} className={`text-gray-300 transition-transform ${selected?.id === c.id ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT — detail panel (scrolls independently) */}
        {selected && (
          <div className="flex flex-col min-h-0 w-full lg:w-[45%] border-l border-gray-200 bg-gray-50">
            {/* Panel header */}
            <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 bg-white border-b border-gray-200">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {selected.category} — {selected.road_name || 'Location complaint'}
                </p>
                <p className="text-xs font-mono text-gray-400">{selected.tracking_token}</p>
              </div>
              <button onClick={() => setSelected(null)}
                className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Scrollable detail body */}
            <div className="flex-1 scroll-panel px-4 py-4 space-y-4 mobile-safe-bottom">

              {/* Status badges */}
              <div className="flex gap-2 flex-wrap">
                <Badge label={selected.status} />
                <Badge label={selected.severity} />
                {selected.escalated && <Badge label="Escalated" />}
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selected.description}</p>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2 text-xs text-gray-500">
                <p className="font-semibold text-gray-600 uppercase tracking-wide text-[11px] mb-2">Timeline</p>
                {[
                  { label: 'Submitted', value: selected.created_at },
                  { label: 'Routed',    value: selected.routed_at  },
                  { label: 'Seen',      value: selected.seen_at    },
                  { label: 'Resolved',  value: selected.resolved_at},
                ].filter(t => t.value).map(t => (
                  <div key={t.label} className="flex justify-between">
                    <span className="text-gray-400">{t.label}</span>
                    <span className="font-medium text-gray-600">{new Date(t.value!).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* SLA warning */}
              {selected.sla_info?.sla_breach && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>SLA breached — open for {selected.sla_info.hours_elapsed}h (limit: {selected.sla_info.sla_resolve_hours}h)</span>
                </div>
              )}

              {/* Previous reply */}
              {selected.engineer_reply && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Previous reply</p>
                  <p className="text-sm text-gray-700">{selected.engineer_reply}</p>
                </div>
              )}

              {/* Reply textarea */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Reply to citizen
                </label>
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
                  placeholder="Citizen will see this via their tracking token…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none transition-shadow" />
              </div>

              {/* Resolution note */}
              {selected.status === 'InProgress' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Resolution note
                  </label>
                  <textarea value={resolutionNote} onChange={e => setResolutionNote(e.target.value)} rows={2}
                    placeholder="Describe what was done…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none transition-shadow" />
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2">
                {STATUS_FLOW[selected.status]?.map(nextStatus => (
                  <button key={nextStatus}
                    onClick={() => updateMutation.mutate({
                      id: selected.id, status: nextStatus,
                      engineerReply: reply || undefined,
                      note: nextStatus === 'Resolved' ? resolutionNote : undefined,
                    })}
                    disabled={updateMutation.isPending}
                    className="w-full py-2 px-4 rounded-xl text-sm font-semibold bg-brand-700 hover:bg-brand-600 active:scale-95 text-white transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50">
                    {nextStatus === 'Seen'       && <Eye size={14} />}
                    {nextStatus === 'InProgress' && <Wrench size={14} />}
                    {nextStatus === 'Resolved'   && <CheckCircle size={14} />}
                    Mark as {nextStatus}
                  </button>
                ))}
                {reply && (
                  <button
                    onClick={() => updateMutation.mutate({ id: selected.id, status: selected.status, engineerReply: reply })}
                    disabled={updateMutation.isPending}
                    className="w-full py-2 px-4 rounded-xl text-sm font-semibold border border-brand-300 text-brand-700 hover:bg-brand-50 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2">
                    <Send size={14} /> Send Reply Only
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
