import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, Info, Navigation } from 'lucide-react';
import { fetchRoads } from '../lib/api';
import { cacheRoads } from '../lib/db';
import { useAppStore } from '../store/app';
import { Badge, RoadTypeBadge } from '../components/ui/Badge';
import type { Road } from '../types';
import 'leaflet/dist/leaflet.css';

const STATUS_COLOR: Record<string, string> = {
  Good: '#22c55e', Fair: '#eab308', Poor: '#f97316', Critical: '#ef4444', Unknown: '#94a3b8',
};

function LocationSetter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 13); }, [lat, lng, map]);
  return null;
}

function formatCurrency(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)} L`;
  return `₹${n.toLocaleString()}`;
}

export default function CitizenHome() {
  const navigate = useNavigate();
  const { userLat, userLng, setLocation } = useAppStore();
  const [center, setCenter] = useState<[number, number]>([22.5726, 88.3639]);
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);

  const { data: roads = [], isLoading } = useQuery({
    queryKey: ['roads'],
    queryFn: () => fetchRoads(),
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation(latitude, longitude);
          setCenter([latitude, longitude]);
        },
        () => { /* use default center */ }
      );
    }
  }, []);

  return (
    <div className="flex h-[calc(100vh-56px)] relative">
      {/* Map */}
      <div className="flex-1">
        <MapContainer center={center} zoom={12} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userLat && userLng && (
            <>
              <LocationSetter lat={userLat} lng={userLng} />
              <CircleMarker center={[userLat, userLng]} radius={8} fillColor="#3b82f6" color="#1d4ed8" fillOpacity={1} weight={2}>
                <Popup><strong>Your location</strong></Popup>
              </CircleMarker>
            </>
          )}
          {(roads as Road[]).map((road) => (
            <CircleMarker
              key={road.id}
              center={[road.lat, road.lng]}
              radius={12}
              fillColor={STATUS_COLOR[road.status] || STATUS_COLOR.Unknown}
              color="#fff"
              fillOpacity={0.85}
              weight={2}
              eventHandlers={{ click: () => setSelectedRoad(road) }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-semibold text-sm">{road.road_name}</p>
                  <p className="text-xs text-gray-500">{road.district}, {road.state}</p>
                  <div className="flex gap-1 mt-1">
                    <RoadTypeBadge type={road.road_type} />
                    <Badge label={road.status} />
                  </div>
                  <button
                    onClick={() => navigate(`/road/${road.id}`)}
                    className="mt-2 w-full text-xs bg-brand-700 text-white py-1 rounded hover:bg-brand-600">
                    View Details
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Side panel */}
      <div className="hidden lg:flex flex-col w-80 bg-white border-l border-gray-200 overflow-y-auto">
        {/* Hero banner */}
        <div className="bg-brand-800 text-white p-4">
          <h2 className="font-bold text-lg">Road Transparency Map</h2>
          <p className="text-xs text-blue-200 mt-1">Click any road marker to explore data, file complaints, or track budgets.</p>
        </div>

        {/* Legend */}
        <div className="p-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Road Condition</p>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(STATUS_COLOR).filter(([k]) => k !== 'Unknown').map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                {status}
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="p-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/report" className="flex flex-col items-center gap-1 p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors text-center">
              <AlertTriangle size={20} className="text-red-600" />
              <span className="text-xs font-medium text-red-700">Report Issue</span>
            </Link>
            <Link to="/track" className="flex flex-col items-center gap-1 p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors text-center">
              <Info size={20} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Track Complaint</span>
            </Link>
          </div>
        </div>

        {/* Road list */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 pt-3 pb-2">
            {isLoading ? 'Loading roads...' : `${(roads as Road[]).length} Roads in System`}
          </p>
          {(roads as Road[]).map((road) => (
            <button key={road.id} onClick={() => navigate(`/road/${road.id}`)}
              className="w-full text-left px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{road.road_name}</p>
                  <p className="text-xs text-gray-500">{road.district} · {road.length_km} km</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <RoadTypeBadge type={road.road_type} />
                  <Badge label={road.status} />
                </div>
              </div>
              {road.open_complaints != null && road.open_complaints > 0 && (
                <p className="text-xs text-orange-600 mt-0.5">⚠ {road.open_complaints} open complaint{road.open_complaints > 1 ? 's' : ''}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: tap to get location */}
      <button
        onClick={() => navigator.geolocation?.getCurrentPosition(p => {
          setLocation(p.coords.latitude, p.coords.longitude);
          setCenter([p.coords.latitude, p.coords.longitude]);
        })}
        className="absolute bottom-20 right-4 md:bottom-6 md:right-6 bg-brand-700 text-white p-3 rounded-full shadow-lg z-10 hover:bg-brand-600 transition-colors">
        <Navigation size={20} />
      </button>

      {/* Mobile bottom road list toggle */}
      {(roads as Road[]).length > 0 && (
        <div className="lg:hidden absolute bottom-16 left-0 right-0 bg-white border-t border-gray-200 max-h-48 overflow-y-auto z-10">
          <div className="p-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">{(roads as Road[]).length} Roads Near You</p>
          </div>
          <div className="divide-y divide-gray-50">
            {(roads as Road[]).slice(0, 5).map((road) => (
              <button key={road.id} onClick={() => navigate(`/road/${road.id}`)}
                className="w-full text-left px-3 py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{road.road_name}</p>
                  <p className="text-xs text-gray-500">{road.district}</p>
                </div>
                <div className="flex items-center gap-1">
                  <RoadTypeBadge type={road.road_type} />
                  <Badge label={road.status} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
