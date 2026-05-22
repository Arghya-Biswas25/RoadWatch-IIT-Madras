import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, Search, Navigation, Loader, Info, ExternalLink } from 'lucide-react';
import { fetchRoads } from '../lib/api';
import { useAppStore } from '../store/app';
import { Badge, RoadTypeBadge } from '../components/ui/Badge';
import 'leaflet/dist/leaflet.css';

const TYPE_COLOR: Record<string, string> = {
  NH: '#2563eb', SH: '#7c3aed', MDR: '#0891b2', ODR: '#059669',
  Urban: '#d97706', VR: '#16a34a', Other: '#94a3b8',
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 13, { duration: 1.2 }); }, [lat, lng]);
  return null;
}

export default function CitizenHome() {
  const navigate = useNavigate();
  const { userLat, userLng, setLocation } = useAppStore();
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center
  const [searchInput, setSearchInput] = useState('');

  // Auto-detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setLocation(latitude, longitude);
          setMapCenter([latitude, longitude]);
        },
        () => {} // permission denied — stay at India center
      );
    }
  }, []);

  // Fetch live OSM roads for the user's location
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['roads', userLat?.toFixed(2), userLng?.toFixed(2)],
    queryFn: () => fetchRoads(userLat!, userLng!),
    enabled: !!(userLat && userLng),
    staleTime: 30 * 60_000, // 30 min — matches OSM cache
  });

  const roads = (data?.roads ?? []) as any[];
  const meta  = data?.meta;

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      setLocation(latitude, longitude);
      setMapCenter([latitude, longitude]);
    });
  }, []);

  return (
    <div className="flex h-[calc(100vh-56px)] relative">
      {/* ── Map ── */}
      <div className="flex-1 relative">
        <MapContainer center={mapCenter} zoom={userLat ? 13 : 5} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userLat && userLng && <RecenterMap lat={userLat} lng={userLng} />}

          {/* User location dot */}
          {userLat && userLng && (
            <CircleMarker center={[userLat, userLng]} radius={9}
              fillColor="#2563eb" color="#1d4ed8" fillOpacity={1} weight={2}>
              <Popup><strong>Your location</strong></Popup>
            </CircleMarker>
          )}

          {/* Real OSM roads */}
          {roads.map((road: any) => (
            <CircleMarker key={road.id}
              center={[road.lat, road.lng]} radius={10}
              fillColor={TYPE_COLOR[road.road_type] || TYPE_COLOR.Other}
              color="#fff" fillOpacity={0.85} weight={2}
              eventHandlers={{ click: () => navigate(`/road/${road.id}`) }}>
              <Popup>
                <div className="min-w-[200px]">
                  <p className="font-semibold text-sm">{road.road_name}</p>
                  {road.road_code && <p className="text-xs text-gray-500">{road.road_code}</p>}
                  {(road.district || road.state) && (
                    <p className="text-xs text-gray-400">{[road.district, road.state].filter(Boolean).join(', ')}</p>
                  )}
                  <div className="flex gap-1 mt-1">
                    <RoadTypeBadge type={road.road_type} />
                    {road.surface_type && <span className="text-xs text-gray-500">{road.surface_type}</span>}
                  </div>
                  {road.open_complaints > 0 && (
                    <p className="text-xs text-orange-600 mt-1">⚠ {road.open_complaints} open complaint{road.open_complaints > 1 ? 's' : ''}</p>
                  )}
                  <button onClick={() => navigate(`/road/${road.id}`)}
                    className="mt-2 w-full text-xs bg-brand-700 text-white py-1.5 rounded hover:bg-brand-600">
                    View Details →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Loading overlay */}
        {(isLoading || isFetching) && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/90 shadow rounded-full px-3 py-1.5 flex items-center gap-2 text-xs text-brand-700 z-10">
            <Loader size={12} className="animate-spin" />
            {isLoading ? 'Loading roads from OpenStreetMap…' : 'Refreshing road data…'}
          </div>
        )}

        {/* No location prompt */}
        {!userLat && !isLoading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-lg p-6 text-center z-10 max-w-xs">
            <MapPin size={32} className="text-brand-600 mx-auto mb-2" />
            <p className="font-semibold text-gray-800 mb-1">Allow location access</p>
            <p className="text-xs text-gray-500 mb-3">We use your location to show real roads from OpenStreetMap near you.</p>
            <button onClick={locateMe}
              className="w-full bg-brand-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
              Use My Location
            </button>
          </div>
        )}
      </div>

      {/* ── Side panel ── */}
      <div className="hidden lg:flex flex-col w-80 bg-white border-l border-gray-200 overflow-hidden">
        {/* Source badge */}
        <div className="bg-brand-800 text-white px-4 py-3">
          <h2 className="font-bold">Road Transparency Map</h2>
          <p className="text-xs text-blue-200 mt-0.5">
            Road data: <span className="font-medium">OpenStreetMap (live)</span>
          </p>
          {meta?.location?.state && (
            <p className="text-xs text-blue-300 mt-0.5">{meta.location.city || meta.location.district}, {meta.location.state}</p>
          )}
        </div>

        {/* Legend */}
        <div className="px-3 py-2 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Road Type</p>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(TYPE_COLOR).filter(([k]) => k !== 'Other').map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                {type}
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-3 py-2 border-b border-gray-100 flex gap-2">
          <Link to="/report" className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 border border-red-100 transition-colors">
            <AlertTriangle size={14} /> Report Issue
          </Link>
          <Link to="/track" className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 border border-blue-100 transition-colors">
            <Search size={14} /> Track Token
          </Link>
        </div>

        {/* Road list */}
        <div className="flex-1 overflow-y-auto">
          {!userLat ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              <MapPin size={24} className="mx-auto mb-2 text-gray-300" />
              Allow location access to see roads near you.
            </div>
          ) : isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              <Loader size={20} className="animate-spin mx-auto mb-2" />
              Querying OpenStreetMap…
            </div>
          ) : roads.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-400">
              No named roads found nearby. OSM data may be sparse in this area.
              <a href="https://www.openstreetmap.org/edit" target="_blank" rel="noopener noreferrer"
                className="block mt-2 text-brand-600 hover:underline text-xs flex items-center gap-1">
                <ExternalLink size={11} /> Contribute to OpenStreetMap
              </a>
            </div>
          ) : (
            <>
              <div className="px-3 pt-2 pb-1 text-xs text-gray-400">
                {roads.length} roads from OpenStreetMap
              </div>
              {roads.map((road: any) => (
                <button key={road.id} onClick={() => navigate(`/road/${road.id}`)}
                  className="w-full text-left px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{road.road_name}</p>
                      <p className="text-xs text-gray-400">
                        {road.road_code ? `${road.road_code} · ` : ''}{road.surface_type || 'surface unknown'}
                      </p>
                    </div>
                    <RoadTypeBadge type={road.road_type} />
                  </div>
                  {road.open_complaints > 0 && (
                    <p className="text-xs text-orange-600 mt-0.5">⚠ {road.open_complaints} open complaint{road.open_complaints > 1 ? 's' : ''}</p>
                  )}
                </button>
              ))}
              <div className="px-3 py-2">
                <p className="text-xs text-gray-300 flex items-center gap-1">
                  <Info size={10} /> Data: OpenStreetMap contributors
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Locate me button */}
      <button onClick={locateMe}
        className="absolute bottom-20 right-4 md:bottom-6 md:right-6 bg-brand-700 text-white p-3 rounded-full shadow-lg z-10 hover:bg-brand-600 transition-colors">
        <Navigation size={20} />
      </button>

      {/* Mobile road strip */}
      {roads.length > 0 && (
        <div className="lg:hidden absolute bottom-16 left-0 right-0 bg-white border-t border-gray-200 max-h-40 overflow-y-auto z-10">
          <p className="text-xs text-gray-400 px-3 py-1.5 border-b border-gray-100">
            {roads.length} roads nearby (OpenStreetMap)
          </p>
          {roads.slice(0, 6).map((road: any) => (
            <button key={road.id} onClick={() => navigate(`/road/${road.id}`)}
              className="w-full text-left px-3 py-2 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">{road.road_name}</p>
                <p className="text-xs text-gray-400">{road.road_code || road.surface_type || ''}</p>
              </div>
              <RoadTypeBadge type={road.road_type} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
