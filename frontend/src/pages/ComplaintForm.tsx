import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Copy, ArrowLeft } from 'lucide-react';
import { fetchRoads, submitComplaint } from '../lib/api';
import { useAppStore } from '../store/app';
import type { Road } from '../types';

const CATEGORIES = ['Pothole', 'Flooding', 'Structural', 'Signage', 'Encroachment', 'Other'];
const SEVERITIES = [
  { value: 'Low', label: 'Low', desc: 'Minor inconvenience' },
  { value: 'Medium', label: 'Medium', desc: 'Needs attention' },
  { value: 'High', label: 'High', desc: 'Potential hazard' },
  { value: 'Critical', label: 'Critical', desc: 'Immediate danger' },
];

export default function ComplaintForm() {
  const [params] = useSearchParams();
  const { userLat, userLng } = useAppStore();
  const { data: roads = [] } = useQuery<Road[]>({ queryKey: ['roads'], queryFn: () => fetchRoads() });

  const [form, setForm] = useState({
    road_id: params.get('road') || '',
    category: '',
    severity: 'Medium',
    description: '',
  });
  const [submitted, setSubmitted] = useState<{ tracking_token: string; routed_to_authority?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: () => submitComplaint({
      road_id: form.road_id,
      category: form.category,
      description: form.description,
      severity: form.severity,
      latitude: userLat || 0,
      longitude: userLng || 0,
    }),
    onSuccess: (data) => setSubmitted(data),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.road_id || !form.category || !form.description.trim()) return;
    mutation.mutate();
  };

  const copyToken = async () => {
    if (submitted?.tracking_token) {
      await navigator.clipboard.writeText(submitted.tracking_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complaint Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your complaint has been submitted anonymously and routed to the responsible authority.
          </p>
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">Your Tracking Token</p>
            <p className="text-2xl font-mono font-bold text-brand-800">{submitted.tracking_token}</p>
            <button onClick={copyToken}
              className="mt-2 flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 mx-auto">
              <Copy size={12} /> {copied ? 'Copied!' : 'Copy token'}
            </button>
          </div>
          {submitted.routed_to_authority && (
            <p className="text-sm text-gray-600 mb-4">
              Routed to: <strong>{submitted.routed_to_authority}</strong>
            </p>
          )}
          <p className="text-xs text-gray-400 mb-6">Save this token to check the status of your complaint later.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/track" className="px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
              Track Complaint
            </Link>
            <Link to="/" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Back to Map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Report a Road Issue</h1>
          <p className="text-sm text-gray-500">Anonymous — no account needed</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 text-sm text-blue-700">
        🔒 Your complaint is completely anonymous. Do not include your name, phone number, or email address in the description.
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Road selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Road *</label>
          <select
            value={form.road_id}
            onChange={(e) => setForm(f => ({ ...f, road_id: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            required>
            <option value="">Choose a road...</option>
            {(roads as Road[]).map((r) => (
              <option key={r.id} value={r.id}>{r.road_name} ({r.road_type} · {r.district})</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue Category *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button"
                onClick={() => setForm(f => ({ ...f, category: cat }))}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors
                  ${form.category === cat
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Severity *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SEVERITIES.map(({ value, label, desc }) => (
              <button key={value} type="button"
                onClick={() => setForm(f => ({ ...f, severity: value }))}
                className={`py-2 px-3 rounded-lg text-sm border transition-colors text-left
                  ${form.severity === value
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                <p className="font-medium">{label}</p>
                <p className={`text-xs ${form.severity === value ? 'text-blue-100' : 'text-gray-400'}`}>{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
            placeholder="Describe the issue clearly. E.g.: Large pothole near the bus stop, approximately 30cm wide and 10cm deep."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            required
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/500</p>
        </div>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {(mutation.error as any)?.response?.data?.error || 'Something went wrong. Please try again.'}
          </div>
        )}

        <button type="submit"
          disabled={mutation.isPending || !form.road_id || !form.category || !form.description.trim()}
          className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
          {mutation.isPending ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
          ) : (
            <><AlertTriangle size={18} /> Submit Complaint</>
          )}
        </button>
      </form>
    </div>
  );
}
