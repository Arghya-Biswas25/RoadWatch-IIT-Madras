import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, DollarSign, User, AlertTriangle, Star, Wrench, MapPin, Phone } from 'lucide-react';
import { fetchRoad } from '../lib/api';
import { Badge, RoadTypeBadge } from '../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import type { RoadDetail as RoadDetailType } from '../types';

function formatCurrency(n: number) {
  if (!n) return 'N/A';
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  return `₹${(n / 100_000).toFixed(2)} L`;
}

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold w-10 text-right">{value}</span>
    </div>
  );
}

export default function RoadDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: road, isLoading, error } = useQuery<RoadDetailType>({
    queryKey: ['road', id],
    queryFn: () => fetchRoad(id!),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-700" />
    </div>
  );

  if (error || !road) return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <p className="text-red-600">Road not found.</p>
      <Link to="/" className="text-brand-700 underline mt-2 inline-block">← Back to Map</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ArrowLeft size={18} /></Link>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{road.road_name}</h1>
            <RoadTypeBadge type={road.road_type} />
            <Badge label={road.status} />
          </div>
          <p className="text-sm text-gray-500">{road.district}, {road.state} · {road.length_km} km · {road.lane_count} lanes</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Road Info */}
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-800 flex items-center gap-2"><MapPin size={16} className="text-brand-600" /> Road Information</h2></CardHeader>
          <CardBody className="space-y-2 text-sm">
            <Row label="Road Code" value={road.road_code} />
            <Row label="Surface" value={road.surface_type} />
            <Row label="Constructed" value={road.constructed_date} />
            <Row label="Last Relayed" value={<span className="font-semibold">{road.last_relayed_date}</span>} />
            <Row label="Next Maintenance" value={road.next_maintenance_due} />
            <Row label="Design Lifespan" value={`${road.design_lifespan_years} years`} />
            <Row label="Open Complaints" value={
              <span className={road.complaints_summary.open > 0 ? 'text-orange-600 font-semibold' : 'text-green-600'}>
                {road.complaints_summary.open}
              </span>
            } />
          </CardBody>
        </Card>

        {/* Contractor */}
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-800 flex items-center gap-2"><User size={16} className="text-brand-600" /> Contractor & Engineer</h2></CardHeader>
          <CardBody className="space-y-2 text-sm">
            {road.contractor ? (
              <>
                <Row label="Contractor" value={<span className="font-semibold">{road.contractor.name}</span>} />
                <Row label="Reg. No." value={road.contractor.registration_no} />
                {road.contractor.contact_phone && <Row label="Phone" value={road.contractor.contact_phone} />}
                <Row label="State" value={road.contractor.state} />
                {road.contractor.performance_score != null && (
                  <div>
                    <p className="text-gray-500 mb-1">Performance Score</p>
                    <ScoreBar value={road.contractor.performance_score} />
                  </div>
                )}
              </>
            ) : <p className="text-gray-400 italic">No contractor assigned</p>}
            {road.engineer && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-gray-500">Responsible Engineer</p>
                <p className="font-semibold">{road.engineer.name}</p>
                <p className="text-xs text-gray-500">{road.engineer.designation}</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-800 flex items-center gap-2"><DollarSign size={16} className="text-brand-600" /> Budget & Spending</h2></CardHeader>
          <CardBody>
            {road.budgets.length > 0 ? (
              <div className="space-y-3">
                {road.budgets.map((b) => (
                  <div key={b.id} className="text-sm border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{b.financial_year}</span>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{b.source}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{b.work_type} · {b.source_scheme}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-400">Sanctioned</p>
                        <p className="font-semibold text-brand-700">{formatCurrency(b.amount_sanctioned)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Spent</p>
                        <p className="font-semibold text-green-700">{formatCurrency(b.amount_spent)}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                        <span>Utilisation</span>
                        <span>{Math.round((b.amount_spent / b.amount_sanctioned) * 100)}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-1.5">
                        <div className="bg-brand-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (b.amount_spent / b.amount_sanctioned) * 100)}%` }} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Authority: {b.authority}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400 italic">No budget data available</p>}
          </CardBody>
        </Card>

        {/* Repair History */}
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-800 flex items-center gap-2"><Wrench size={16} className="text-brand-600" /> Repair History</h2></CardHeader>
          <CardBody>
            {road.repair_logs.length > 0 ? (
              <div className="space-y-3">
                {road.repair_logs.map((log) => (
                  <div key={log.id} className="text-sm border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600">{log.work_type}</span>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12} className={s <= (log.quality_rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{log.work_description}</p>
                    <p className="text-xs text-gray-400 mt-1">{log.start_date} → {log.end_date || 'Ongoing'}</p>
                    {log.notes && <p className="text-xs text-gray-500 mt-1 italic">{log.notes}</p>}
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400 italic">No repair logs</p>}
          </CardBody>
        </Card>
      </div>

      {/* Report button */}
      <div className="flex gap-3 pt-2">
        <Link to={`/report?road=${road.id}`}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
          <AlertTriangle size={16} /> Report an Issue on This Road
        </Link>
        <Link to="/track" className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition-colors">
          Track Complaint
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-900 text-right">{value}</span>
    </div>
  );
}
