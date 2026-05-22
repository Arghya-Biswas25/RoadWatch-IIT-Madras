import axios from 'axios';
import { useAuthStore } from '../store/auth';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(err);
  }
);

// ── Roads (live OSM) ─────────────────────────────────────────────────────────
export const fetchRoads = (lat: number, lng: number, radius = 5000) =>
  api.get('/roads', { params: { lat, lng, radius } }).then(r => r.data);

export const fetchRoad = (osmId: string) =>
  api.get(`/roads/${osmId}`).then(r => r.data);

// ── Complaints ───────────────────────────────────────────────────────────────
export const submitComplaint = (data: {
  road_osm_id?: string;
  road_name?: string;
  category: string;
  description: string;
  severity: string;
  latitude: number;
  longitude: number;
}) => api.post('/complaints', data).then(r => r.data);

export const trackComplaint = (token: string) =>
  api.get(`/complaints/track/${token}`).then(r => r.data);

export const fetchComplaints = () =>
  api.get('/complaints').then(r => r.data);

export const updateComplaintStatus = (id: string, data: {
  status: string;
  resolution_note?: string;
  engineer_reply?: string;
}) => api.put(`/complaints/${id}/status`, data).then(r => r.data);

export const assignComplaint = (id: string, engineer_id: string) =>
  api.put(`/complaints/${id}/assign`, { engineer_id }).then(r => r.data);

export const escalateComplaint = (id: string) =>
  api.put(`/complaints/${id}/escalate`).then(r => r.data);

// ── Analytics ────────────────────────────────────────────────────────────────
export const fetchAnalytics = () =>
  api.get('/analytics').then(r => r.data);

// ── External data (weather, geocoding, news, national stats) ─────────────────
export const fetchWeather = (lat: number, lng: number) =>
  api.get('/external/weather', { params: { lat, lng } }).then(r => r.data);

export const reverseGeocode = (lat: number, lng: number) =>
  api.get('/external/geocode/reverse', { params: { lat, lng } }).then(r => r.data);

export const searchGeocode = (q: string) =>
  api.get('/external/geocode/search', { params: { q } }).then(r => r.data);

export const fetchNews = (topic?: string) =>
  api.get('/external/news', { params: { topic, all: topic ? undefined : 'true' } }).then(r => r.data);

export const fetchNationalStats = () =>
  api.get('/external/national-stats').then(r => r.data);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then(r => r.data);

// ── Admin ────────────────────────────────────────────────────────────────────
export const fetchContractors = () =>
  api.get('/admin/contractors').then(r => r.data);

export const fetchRoutingRules = () =>
  api.get('/admin/routing-rules').then(r => r.data);

export default api;
