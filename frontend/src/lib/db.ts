import Dexie, { type Table } from 'dexie';
import type { Road, Complaint, ChatMessage } from '../types';

interface DraftComplaint {
  id?: number;
  road_id: string;
  category: string;
  description: string;
  severity: string;
  latitude: number;
  longitude: number;
  saved_at: string;
}

interface CachedComplaint {
  token: string;
  data: Complaint;
  cached_at: string;
}

class RoadWatchDB extends Dexie {
  roads!: Table<Road>;
  draftComplaints!: Table<DraftComplaint>;
  trackedComplaints!: Table<CachedComplaint>;
  chatHistory!: Table<{ id?: number; session: string; messages: ChatMessage[]; updated_at: string }>;

  constructor() {
    super('RoadWatchDB');
    this.version(1).stores({
      roads: 'id, road_type, state, status',
      draftComplaints: '++id, road_id, saved_at',
      trackedComplaints: 'token, cached_at',
      chatHistory: '++id, session, updated_at',
    });
  }
}

export const db = new RoadWatchDB();

export async function cacheRoads(roads: Road[]) {
  await db.roads.bulkPut(roads);
}

export async function getCachedRoads(): Promise<Road[]> {
  return db.roads.toArray();
}

export async function saveDraftComplaint(draft: Omit<DraftComplaint, 'id'>) {
  return db.draftComplaints.add(draft);
}

export async function getDraftComplaints(): Promise<DraftComplaint[]> {
  return db.draftComplaints.toArray();
}

export async function deleteDraftComplaint(id: number) {
  return db.draftComplaints.delete(id);
}

export async function cacheTrackedComplaint(token: string, data: Complaint) {
  await db.trackedComplaints.put({ token, data, cached_at: new Date().toISOString() });
}

export async function getCachedComplaint(token: string) {
  return db.trackedComplaints.get(token);
}
