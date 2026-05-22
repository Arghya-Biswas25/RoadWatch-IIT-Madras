import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle, MapPin, ExternalLink, Info, Cloud, Droplets, Wind, ThumbsUp, ThumbsDown } from 'lucide-react';
import { fetchRoad } from '../lib/api';
import { RoadTypeBadge } from '../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

function Row({ label, value, unavailable }: { label: string; value?: React.ReactNode; unavailable?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className={`text-xs text-right ${unavailable ? 'text-gray-300 italic' : 'text-gray-800 font-medium'}`}>
        {unavailable ? 'Not in public data' : (value ?? '—')}
      </span>
    </div>
  );
}

function WeatherCard({ weather }: { weather: any }) {
  if (!weather) return null;
  const riskColour = { Low: 'text-green-600', Medium: 'text-yellow-600', High: 'text-red-600' }[weather.road_risk?.level as string] || 'text-gray-600';
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
          <Cloud size={15} className="text-blue-500" /> Current Weather
          <span className="ml-auto text-xs text-gray-300 font-normal">Open-Meteo (live)</span>
        </h2>
      </CardHeader>
      <CardBody>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-2xl font-bold text-gray-900">{weather.temperature_c}°C</span>
          <span className="text-sm text-gray-600">{weather.description}</span>
        </div>
        <div className="flex gap-3 text-xs text-gray-500 mb-2">
          <span className="flex items-center gap-1"><Droplets size={11} /> {weather.precipitation_mm}mm</span>
          <span className="flex items-center gap-1"><Wind size={11} /> {weather.wind_kmh} km/h</span>
          {weather.humidity_pct != null && <span>{weather.humidity_pct}% humidity</span>}
        </div>
        <div className={`text-xs font-medium ${riskColour}`}>
          Road risk: {weather.road_risk?.level} — {weather.road_risk?.note}
        </div>
      </CardBody>
    </Card>
  );
}

function UnavailableNote({ url, label }: { url: string; label: string }) {
  return (
    <div className="text-xs text-gray-400 italic flex items-start gap-1.5 mt-1">
      <Info size={11} className="shrink-0 mt-0.5" />
      <span>
        Not available in public APIs.{' '}
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline inline-flex items-center gap-0.5">
          {label} <ExternalLink size={10} />
        </a>
      </span>
    </div>
  );
}

export default function RoadDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: road, isLoading, error } = useQuery({
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
      <p className="text-red-600 mb-2">Road not found in OpenStreetMap data.</p>
      <Link to="/" className="text-brand-600 underline">← Back to Map</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 mt-0.5 shrink-0"><ArrowLeft size={18} /></Link>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{road.road_name}</h1>
            <RoadTypeBadge type={road.road_type} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {[road.road_code, road.district, road.state, road.country].filter(Boolean).join(' · ')}
          </p>
          <p className="text-xs text-gray-300 mt-0.5">Source: OpenStreetMap (osm_id: {road.osm_id})</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Road Info (OSM) */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <MapPin size={15} className="text-brand-600" /> Road Information
              <span className="ml-auto text-xs text-gray-300 font-normal">OpenStreetMap</span>
            </h2>
          </CardHeader>
          <CardBody>
            <Row label="Road type"    value={road.road_type} />
            <Row label="Road code"    value={road.road_code || undefined} unavailable={!road.road_code} />
            <Row label="Surface"      value={road.surface_type || undefined} unavailable={!road.surface_type} />
            <Row label="Lanes"        value={road.lane_count ? String(road.lane_count) : undefined} unavailable={!road.lane_count} />
            <Row label="Max speed"    value={road.max_speed_kmh ? `${road.max_speed_kmh} km/h` : undefined} unavailable={!road.max_speed_kmh} />
            <Row label="One-way"      value={road.oneway ? 'Yes' : 'No'} />
            <Row label="Authority"    value={road.responsible_authority} />
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-500 mb-1">Complaints (our system)</p>
              <div className="flex gap-3 text-xs">
                <span className={road.complaints_summary?.open > 0 ? 'text-orange-600 font-semibold' : 'text-green-600'}>
                  {road.complaints_summary?.open ?? 0} open
                </span>
                <span className="text-gray-400">{road.complaints_summary?.resolved ?? 0} resolved</span>
                <span className="text-gray-400">{road.complaints_summary?.total ?? 0} total</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Weather */}
        <WeatherCard weather={road.weather} />

        {/* Contractor & Budget — unavailable */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-sm text-gray-800">Contractor & Engineer</h2>
          </CardHeader>
          <CardBody>
            {road.admin_data_available?.budget ? (
              // Admin has entered data
              <p className="text-xs text-green-600 mb-2">Admin-entered data available below.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">This information is not available via any public API.</p>
                <UnavailableNote url="https://rtionline.gov.in/" label="File RTI for contractor info" />
                <UnavailableNote url="https://eprocure.gov.in/" label="Search eProcure for tenders" />
                <UnavailableNote url="https://pfms.nic.in/" label="Check PFMS for expenditure" />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Budget — unavailable unless admin-entered */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-sm text-gray-800">Budget & Spending</h2>
          </CardHeader>
          <CardBody>
            {road.budgets?.length > 0 ? (
              road.budgets.map((b: any) => (
                <div key={b.id} className="text-xs border border-gray-100 rounded p-2 mb-2">
                  <div className="flex justify-between"><span className="font-semibold">{b.financial_year}</span><span className="text-gray-400">{b.source}</span></div>
                  <p className="text-gray-500">{b.work_type} · {b.source_scheme}</p>
                  <div className="flex gap-4 mt-1">
                    <div><p className="text-gray-400">Sanctioned</p><p className="font-semibold text-brand-700">₹{(b.amount_sanctioned/100000).toFixed(1)}L</p></div>
                    <div><p className="text-gray-400">Spent</p><p className="font-semibold text-green-700">₹{(b.amount_spent/100000).toFixed(1)}L</p></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Budget data is not in any open public API.</p>
                <UnavailableNote url="https://pfms.nic.in/" label="Check PFMS (public expenditure)" />
                <UnavailableNote url="https://openbudgetsindia.org/" label="Open Budgets India" />
                <UnavailableNote url="https://rtionline.gov.in/" label="File RTI for sanctioned amount" />
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Repair logs — unavailable unless admin-entered */}
      {road.repair_logs?.length > 0 && (
        <Card>
          <CardHeader><h2 className="font-semibold text-sm text-gray-800">Repair History (Admin-entered)</h2></CardHeader>
          <CardBody>
            {road.repair_logs.map((log: any) => (
              <div key={log.id} className="text-sm border border-gray-100 rounded p-2 mb-2">
                <p className="font-medium">{log.work_type}</p>
                <p className="text-gray-600 text-xs">{log.work_description}</p>
                <p className="text-gray-400 text-xs mt-1">{log.start_date} → {log.end_date || 'ongoing'}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Data note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
        <p className="font-semibold mb-1">About this data</p>
        <p>{road.data_note}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Link to={`/report?road_osm_id=${road.osm_id}&road_name=${encodeURIComponent(road.road_name)}`}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
          <AlertTriangle size={15} /> Report Issue on This Road
        </Link>
        <Link to="/track"
          className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
          Track Complaint
        </Link>
      </div>
    </div>
  );
}
