export type RoadStatus = 'Good' | 'Fair' | 'Poor' | 'Critical' | 'Unknown';
export type RoadType = 'NH' | 'SH' | 'MDR' | 'ODR' | 'VR' | 'Urban' | 'Other';
export type ComplaintStatus = 'Submitted' | 'Routed' | 'Seen' | 'InProgress' | 'Resolved' | 'Escalated' | 'Closed';
export type ComplaintCategory = 'Pothole' | 'Flooding' | 'Structural' | 'Signage' | 'Encroachment' | 'Other';
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type UserRole = 'citizen' | 'engineer' | 'admin';

export interface Road {
  id: string;
  road_name: string;
  road_type: RoadType;
  road_code: string;
  state: string;
  district: string;
  country: string;
  contractor_id: string;
  contractor_name?: string;
  contractor_score?: number;
  engineer_id?: string;
  engineer_name?: string;
  engineer_designation?: string;
  length_km: number;
  design_lifespan_years: number;
  constructed_date: string;
  last_relayed_date: string;
  next_maintenance_due: string;
  surface_type: string;
  lane_count: number;
  status: RoadStatus;
  lat: number;
  lng: number;
  coordinates?: [number, number][];
  latest_budget?: {
    year: string;
    work_type: string;
    sanctioned: number;
    spent: number;
    source: string;
    scheme: string;
  };
  open_complaints?: number;
}

export interface RoadDetail extends Road {
  contractor?: Contractor;
  engineer?: { name: string; designation: string };
  budgets: Budget[];
  repair_logs: RepairLog[];
  complaints_summary: { total: number; open: number; resolved: number };
}

export interface Complaint {
  id: string;
  tracking_token: string;
  road_id: string;
  road_name?: string;
  road_type?: RoadType;
  category: ComplaintCategory;
  description: string;
  severity: Severity;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  routed_to: string;
  routed_at: string;
  seen_at?: string;
  resolved_at?: string;
  resolution_note?: string;
  engineer_reply?: string;
  escalated: boolean;
  escalated_at?: string;
  created_at: string;
  updated_at: string;
  sla_info?: { sla_breach: boolean; see_breach: boolean; hours_elapsed: number; sla_resolve_hours: number };
}

export interface Budget {
  id: string;
  road_id: string;
  financial_year: string;
  work_type: string;
  amount_sanctioned: number;
  amount_spent: number;
  source: string;
  source_scheme: string;
  authority: string;
}

export interface RepairLog {
  id: string;
  road_id: string;
  work_description: string;
  work_type: string;
  start_date: string;
  end_date: string;
  quality_rating: number;
  notes?: string;
}

export interface Contractor {
  id: string;
  name: string;
  registration_no: string;
  contact_email?: string;
  contact_phone?: string;
  state: string;
  note?: string;
  performance_score: number;
  score_breakdown?: ScoreBreakdown;
  band?: { label: string; color: string };
}

export interface ScoreBreakdown {
  overall_score: number;
  resolution_rate_score: number;
  response_time_score: number;
  longevity_score: number;
  longevity_note?: string;
  repeat_penalty: number;
  loyalty_bonus: number;
  total_complaints: number;
  resolved_complaints: number;
  open_complaints: number;
  resolution_rate: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  designation: string;
  contractor_id?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string; // Kimi K2.6 chain-of-thought, shown in collapsible panel
}
