import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Search, CheckCircle, Clock, Eye, Wrench, AlertTriangle, ArrowUp } from 'lucide-react';
import { trackComplaint } from '../lib/api';
import { cacheTrackedComplaint } from '../lib/db';
import { Badge } from '../components/ui/Badge';

const STATUS_ICON: Record<string, React.ReactNode> = {
  Submitted: <Clock size={18} className="text-blue-500" />,
  Routed: <ArrowUp size={18} className="text-indigo-500" />,
  Seen: <Eye size={18} className="text-purple-500" />,
  InProgress: <Wrench size={18} className="text-yellow-500" />,
  Resolved: <CheckCircle size={18} className="text-green-500" />,
  Escalated: <AlertTriangle size={18} className="text-red-500" />,
  Closed: <CheckCircle size={18} className="text-gray-400" />,
};

const STATUS_ORDER = ['Submitted', 'Routed', 'Seen', 'InProgress', 'Resolved'];

export default function TrackComplaint() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: () => trackComplaint(token.trim().toUpperCase()),
    onSuccess: (data) => {
      setResult(data);
      cacheTrackedComplaint(token.trim().toUpperCase(), data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) mutation.mutate();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Complaint</h1>
      <p className="text-gray-500 text-sm mb-6">Enter the tracking token you received when you filed your complaint.</p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="e.g. RW-2026-XJKP"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase"
        />
        <button type="submit"
          disabled={mutation.isPending || !token.trim()}
          className="bg-brand-700 hover:bg-brand-600 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors">
          <Search size={16} /> {mutation.isPending ? '...' : 'Track'}
        </button>
      </form>

      {/* Demo hint */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-500 mb-6">
        <strong>Demo tokens:</strong>{' '}
        {['RW-2026-XJKP', 'RW-2026-MNBV', 'RW-2026-QWER', 'RW-2026-TYUI'].map(t => (
          <button key={t} onClick={() => setToken(t)} className="text-brand-600 hover:underline mr-2 font-mono">{t}</button>
        ))}
      </div>

      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {(mutation.error as any)?.response?.data?.error || 'Token not found. Please check and try again.'}
        </div>
      )}

      {result && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-brand-800 text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-200 font-mono">{result.tracking_token}</p>
                <p className="font-bold mt-0.5">{result.road_name}</p>
              </div>
              <div className="flex items-center gap-2">
                {STATUS_ICON[result.status]}
                <Badge label={result.status} className="bg-white/20 text-white border-white/30" />
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Progress stepper */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Progress</p>
              <div className="flex items-center gap-0">
                {STATUS_ORDER.map((s, i) => {
                  const idx = STATUS_ORDER.indexOf(result.status);
                  const done = i <= idx;
                  const current = s === result.status;
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <div className={`flex flex-col items-center flex-1 ${i > 0 ? 'relative' : ''}`}>
                        {i > 0 && <div className={`absolute left-0 right-1/2 top-3 h-0.5 -translate-y-1/2 ${done ? 'bg-brand-500' : 'bg-gray-200'}`} />}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 transition-all
                          ${current ? 'bg-brand-600 border-brand-600' : done ? 'bg-brand-100 border-brand-400' : 'bg-gray-100 border-gray-300'}`}>
                          {done ? <CheckCircle size={12} className={current ? 'text-white' : 'text-brand-600'} /> : <span className="text-gray-300 text-xs">·</span>}
                        </div>
                        <p className={`text-xs mt-1 text-center leading-tight ${current ? 'text-brand-700 font-semibold' : done ? 'text-gray-600' : 'text-gray-300'}`}>
                          {s}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Detail label="Category" value={result.category} />
              <Detail label="Severity" value={<Badge label={result.severity} />} />
              <Detail label="Submitted" value={new Date(result.submitted_at).toLocaleDateString()} />
              {result.seen_at && <Detail label="Seen by Engineer" value={new Date(result.seen_at).toLocaleDateString()} />}
              {result.resolved_at && <Detail label="Resolved" value={new Date(result.resolved_at).toLocaleDateString()} />}
              {result.escalated && <Detail label="Status" value={<span className="text-red-600 font-semibold">Escalated</span>} />}
            </div>

            {/* SLA warning */}
            {result.sla_info?.sla_breach && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong>SLA Breached</strong> — This complaint has been open for {result.sla_info.hours_elapsed} hours,
                  exceeding the {result.sla_info.sla_resolve_hours}-hour target. It has been flagged for admin review.
                </div>
              </div>
            )}

            {/* Engineer reply */}
            {result.engineer_reply && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-blue-600 mb-1">Reply from Engineer</p>
                <p className="text-sm text-gray-700">{result.engineer_reply}</p>
              </div>
            )}

            {/* Resolution */}
            {result.resolution_note && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-green-600 mb-1">Resolution Note</p>
                <p className="text-sm text-gray-700">{result.resolution_note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
