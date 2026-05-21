import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, Eye, Wrench, AlertTriangle, Send, MapPin } from 'lucide-react';
import { fetchComplaints, updateComplaintStatus } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardBody, StatCard } from '../components/ui/Card';
import type { Complaint } from '../types';

const STATUS_FLOW: Record<string, string[]> = {
  Routed: ['Seen'],
  Seen: ['InProgress'],
  InProgress: ['Resolved'],
};

export default function EngineerDashboard() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [reply, setReply] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const { data: complaints = [], isLoading } = useQuery<Complaint[]>({
    queryKey: ['my-complaints'],
    queryFn: fetchComplaints,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, note, engineerReply }: any) =>
      updateComplaintStatus(id, { status, resolution_note: note, engineer_reply: engineerReply }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-complaints'] });
      setSelected(null); setReply(''); setResolutionNote('');
    },
  });

  const filtered = filter === 'all' ? complaints : (complaints as Complaint[]).filter(c => c.status === filter);
  const open = (complaints as Complaint[]).filter(c => !['Resolved', 'Closed'].includes(c.status));
  const resolved = (complaints as Complaint[]).filter(c => c.status === 'Resolved');

  const slaBreached = (complaints as Complaint[]).filter(c => c.sla_info?.sla_breach).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Engineer Dashboard</h1>
        <p className="text-sm text-gray-500">{user?.name} · {user?.designation}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Open Complaints" value={open.length} icon={<Clock size={18} />} colour="orange" />
        <StatCard label="Resolved" value={resolved.length} icon={<CheckCircle size={18} />} colour="green" />
        <StatCard label="SLA Breaches" value={slaBreached} icon={<AlertTriangle size={18} />} colour="red" />
        <StatCard label="Total Assigned" value={(complaints as Complaint[]).length} icon={<Wrench size={18} />} colour="blue" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'Routed', 'Seen', 'InProgress', 'Resolved', 'Escalated'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${filter === f ? 'bg-brand-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Complaint list */}
        <div className="flex-1 space-y-2">
          {isLoading ? (
            <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700 mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No complaints in this category</div>
          ) : (
            (filtered as Complaint[]).map((c) => (
              <button key={c.id} onClick={() => setSelected(c === selected ? null : c)}
                className={`w-full text-left bg-white rounded-xl border transition-all ${selected?.id === c.id ? 'border-brand-400 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge label={c.status} />
                        <Badge label={c.severity} />
                        {c.sla_info?.sla_breach && <span className="text-xs text-red-600 font-semibold">⚠ SLA Breach</span>}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" /> {c.road_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.category} · {new Date(c.created_at).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.description}</p>
                    </div>
                    <span className="text-xs font-mono text-gray-400">{c.tracking_token}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 shrink-0">
            <Card className="sticky top-4">
              <CardHeader>
                <h3 className="font-semibold text-gray-800 text-sm">{selected.road_name}</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{selected.tracking_token}</p>
              </CardHeader>
              <CardBody className="space-y-3 text-sm">
                <div className="flex gap-2 flex-wrap">
                  <Badge label={selected.status} />
                  <Badge label={selected.severity} />
                  <Badge label={selected.category} />
                </div>
                <p className="text-gray-700">{selected.description}</p>
                <div className="text-xs text-gray-400 space-y-0.5">
                  <p>Submitted: {new Date(selected.created_at).toLocaleString()}</p>
                  {selected.seen_at && <p>Seen: {new Date(selected.seen_at).toLocaleString()}</p>}
                  {selected.resolved_at && <p>Resolved: {new Date(selected.resolved_at).toLocaleString()}</p>}
                </div>

                {/* Reply field */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Reply to Citizen</label>
                  <textarea value={reply} onChange={(e) => setReply(e.target.value)}
                    rows={3} placeholder="Write a reply (visible to citizen via their token)..."
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none" />
                </div>

                {selected.status === 'InProgress' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Resolution Note</label>
                    <textarea value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)}
                      rows={2} placeholder="Describe what was done to resolve the issue..."
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none" />
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
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-brand-700 hover:bg-brand-600 text-white transition-colors flex items-center justify-center gap-1 disabled:bg-gray-300">
                      {nextStatus === 'Seen' && <Eye size={12} />}
                      {nextStatus === 'InProgress' && <Wrench size={12} />}
                      {nextStatus === 'Resolved' && <CheckCircle size={12} />}
                      Mark as {nextStatus}
                    </button>
                  ))}
                  {reply && (
                    <button
                      onClick={() => updateMutation.mutate({ id: selected.id, status: selected.status, engineerReply: reply })}
                      disabled={updateMutation.isPending}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold border border-brand-300 text-brand-700 hover:bg-brand-50 transition-colors flex items-center justify-center gap-1">
                      <Send size={12} /> Send Reply Only
                    </button>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
