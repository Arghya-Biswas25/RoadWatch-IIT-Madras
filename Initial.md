# 🛣️ RoadWatch — Project Blueprint v0.1

> **"Transparency in every lane. Accountability in every pothole."**
>
> An AI-powered Progressive Web App that enables citizens to monitor road quality, track public spending, report issues to responsible authorities, and hold contractors accountable — built for IIT Madras COERS Hackathon 2026, Problem Statement 1.2.

---

> 🔄 This document is a living blueprint. Every section is open to revision, extension, and iteration as the project evolves. Nothing here is final. Everything here is intentional.

---

## Table of Contents

1. [Project Title & Tagline](#1-project-title--tagline)
2. [Problem Statement](#2-problem-statement)
3. [Our Solution — RoadWatch Overview](#3-our-solution--roadwatch-overview)
4. [Platform Architecture](#4-platform-architecture)
5. [RBAC Design](#5-rbac-design)
6. [Feature List](#6-feature-list)
7. [Tech Stack Recommendation](#7-tech-stack-recommendation)
8. [Data Architecture & Schema](#8-data-architecture--schema)
9. [Complaint Routing Logic](#9-complaint-routing-logic)
10. [Analytics Dashboard Specification](#10-analytics-dashboard-specification)
11. [AI Chatbot Design](#11-ai-chatbot-design)
12. [Contractor Scoring System](#12-contractor-scoring-system)
13. [Privacy & Anonymity Design](#13-privacy--anonymity-design)
14. [Offline & PWA Strategy](#14-offline--pwa-strategy)
15. [Evaluation Criteria Alignment](#15-evaluation-criteria-alignment)
16. [Competitive Edge](#16-competitive-edge)
17. [Development Phases & Roadmap](#17-development-phases--roadmap)
18. [Open Questions, Assumptions & Future Scope](#18-open-questions-assumptions--future-scope)

---

## 1. Project Title & Tagline

| Field | Value |
|---|---|
| **Project Name** | RoadWatch |
| **Subtitle** | AI-Powered Road Transparency & Accountability Platform |
| **Hackathon** | IIT Madras COERS Hackathon 2026 |
| **Problem Statement** | 1.2 — ROADWATCH |
| **Stage 1 Deadline** | 31st May 2026 |
| **Prize Pool** | ₹50K / ₹30K / ₹20K |
| **Version** | Blueprint v0.1 🔄 |

---

## 2. Problem Statement

### 2.1 The Core Issue

Public accountability for road infrastructure in India — and broadly across most developing and developed nations — remains critically low. The root cause is not a lack of data, but a **catastrophic lack of data accessibility and consolidation**.

The following problems are endemic:

- **Fragmented information**: Critical data about road construction, contractor assignments, maintenance contracts, budgets, and repair history is scattered across multiple government departments — NHAI, State PWD, District authorities, Municipal bodies — each operating in silos with no unified public-facing interface.

- **Buried records**: Even when data exists, it is locked inside complex administrative records, RTI portals, government gazette notifications, or internal databases that the average citizen has no practical way to access or understand.

- **Zero visibility for citizens**: A citizen living next to a road has no way to know:
  - Which contractor built or is maintaining their road
  - How much public money was allocated and how much was actually spent
  - When the road was last repaired and what work was done
  - Who the responsible Executive Engineer is and how to contact them
  - Whether the contractor has a history of poor quality work

- **Accountability vacuum**: Because no one is watching, delays go untracked, repeated failures by the same contractor go unpunished, and responsible agencies face no public pressure to perform.

- **Golden hour problem**: When a road deteriorates dangerously — potholes causing accidents, flooded underpasses, structural failures — there is no fast, clear channel for citizens to report it to the right authority. Complaints get lost, misrouted, or simply ignored.

### 2.2 Why Existing Solutions Fail

- **MyGov / PG Portal complaints**: Generic, not road-specific, no contractor-level accountability, no feedback loop to citizen
- **NHAI portal**: Covers only national highways, not state or district roads
- **311/Swachh Bharat apps**: Civic issues only, no infrastructure budget transparency
- **RTI filings**: Slow (30+ days), requires effort, no aggregated analytics

### 2.3 What the Brochure Asks For

From the COERS 2026 brochure, the key aspects that must be addressed:

- ✅ Show Road Type (NH/SH/MDR etc.), last relaying date, and contractor name
- ✅ Routing to the correct Executive Engineer or Authority for complaints
- ✅ Amount sanctioned vs. spent — with source attribution
- ✅ Global applicability across countries
- ✅ Offline functionality and robustness in low-network conditions

Evaluation criteria that our solution must score maximum on:

- 🏆 Data accuracy
- 🏆 Complaint routing mechanism
- 🏆 Budget transparency including the source
- 🏆 User interface & accessibility
- 🏆 Information integration across countries

---

## 3. Our Solution — RoadWatch Overview

### 3.1 What RoadWatch Is

RoadWatch is a **Progressive Web App (PWA)** that serves as the single source of truth for road infrastructure data, complaint management, and contractor accountability. It is not just an app — it is an **ecosystem** connecting three stakeholders who currently have no shared platform:

1. **Citizens** — who experience road quality daily and deserve transparency
2. **Engineers & Contractors** — who need a structured, efficient channel to receive and manage complaints
3. **Authorities & Admins** — who need a command-level view of all complaints, contractors, roads, and budgets

At its core, RoadWatch does four things:

| Function | What it means |
|---|---|
| **Inform** | Show citizens real road data — contractor, budget, repair history, road type |
| **Empower** | Let citizens file complaints that actually reach the right person |
| **Analyse** | Give everyone a data-driven view of road quality and contractor performance |
| **Converse** | Let citizens ask questions in plain language via an AI chatbot that knows all the data |

### 3.2 Design Principles 🔄

- **Anonymous by design**: Citizens never create accounts. Location is all we take.
- **Data-first**: The analytics and road data are the product. The chatbot amplifies it.
- **Routing accuracy over routing speed**: Getting a complaint to the right engineer matters more than getting it somewhere fast.
- **Score what matters**: Contractor performance scoring must be meaningful, not gameable.
- **Works everywhere**: 2G in rural Bihar or fibre in Chennai — same experience.
- **Open to iteration**: Nothing in this build is permanent. Every module can be swapped, upgraded, or extended.

---

## 4. Platform Architecture

### 4.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          ROADWATCH PWA FRONTEND                          │
│                    (React + Vite + Workbox Service Worker)               │
│                                                                          │
│  ┌─────────────┐   ┌──────────────────┐   ┌──────────────────────────┐  │
│  │  CITIZEN UI  │   │  ENGINEER UI     │   │  ADMIN / AUTHORITY UI    │  │
│  │  (Anonymous) │   │  (Authenticated) │   │  (Authenticated)         │  │
│  └──────┬───────┘   └────────┬─────────┘   └────────────┬─────────────┘  │
│         │                    │                           │               │
│         └────────────────────┴───────────────────────────┘               │
│                              │                                           │
│                    ┌─────────▼──────────┐                                │
│                    │   API GATEWAY       │                                │
│                    │   (REST / GraphQL)  │                                │
│                    └─────────┬──────────┘                                │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │
        ┌──────────────────────┼────────────────────────────┐
        │                      │                            │
┌───────▼────────┐   ┌─────────▼──────────┐   ┌────────────▼────────────┐
│  ROAD DATA     │   │  COMPLAINT SERVICE  │   │  AI CHATBOT SERVICE     │
│  SERVICE       │   │  (Routing Engine)   │   │  (Context Injector +    │
│  (CRUD + GIS)  │   │  (Status Tracker)   │   │   AI API Wrapper)       │
└───────┬────────┘   └─────────┬──────────┘   └────────────┬────────────┘
        │                      │                            │
        └──────────────────────┼────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   DATABASE LAYER     │
                    │  PostgreSQL + PostGIS│
                    │  Redis (cache/queue) │
                    └─────────────────────┘
```

### 4.2 PWA Architecture Layers 🔄

```
┌─────────────────────────────────────────────┐
│            PRESENTATION LAYER                │
│   React Components + Tailwind + Recharts     │
│   Leaflet.js / MapLibre for map overlays     │
├─────────────────────────────────────────────┤
│             STATE MANAGEMENT                 │
│   Zustand / React Query for server state     │
│   IndexedDB for offline data persistence     │
├─────────────────────────────────────────────┤
│            SERVICE WORKER LAYER              │
│   Workbox: Cache strategies, BG sync,        │
│   Push notifications, Offline fallback       │
├─────────────────────────────────────────────┤
│              NETWORK LAYER                   │
│   Axios with retry logic + offline queue     │
│   GraphQL with persisted queries             │
├─────────────────────────────────────────────┤
│               BACKEND LAYER                  │
│   Node.js / Express or FastAPI               │
│   PostGIS for geospatial queries             │
│   Redis for complaint queuing                │
├─────────────────────────────────────────────┤
│            EXTERNAL SERVICES                 │
│   AI API (Claude / OpenAI / Gemini)          │
│   Maps API (OpenStreetMap / Mapbox)          │
│   Government open data APIs (where available)│
└─────────────────────────────────────────────┘
```

### 4.3 Deployment Architecture 🔄

```
                         ┌──────────────┐
                         │   CDN Layer   │
                         │  Cloudflare   │
                         └──────┬───────┘
                                │
                    ┌───────────▼───────────┐
                    │   Frontend Hosting    │
                    │   Vercel / Netlify    │
                    │   (Static PWA build)  │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Backend API         │
                    │   Railway / Render /  │
                    │   EC2 (TBD) 🔄        │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Database            │
                    │   Supabase (Postgres  │
                    │   + PostGIS + Auth)   │
                    └───────────────────────┘
```

---

## 5. RBAC Design

### 5.1 Role Overview 🏆

| Role | Who They Are | Authentication | Data Access | Primary Goal |
|---|---|---|---|---|
| **Citizen / User** | Any member of the public | Anonymous — no login | Road data (read), own complaint status | Report issues, access road info, use chatbot |
| **Engineer / Contractor** | Road maintenance engineers, contractors assigned to specific roads | Email/OTP login | Assigned roads, complaints routed to them, their own performance score | Manage complaints, update status, respond |
| **Admin / Authority** | Executive Engineers, government authority, hackathon demo admin | Email + password + 2FA | Full system access | Route complaints, oversee all data, monitor contractor scores |

---

### 5.2 Citizen Role — Detailed Specification 🔄

**What they can do:**
- Open the app without any login or account creation
- Grant or manually input location (GPS pin drop on map)
- View all roads in their vicinity with full data overlay
- Click any road to see:
  - Road type: NH / SH / MDR / Urban / Village
  - Contractor name & contact (if available publicly)
  - Last relaying / repair date
  - Budget sanctioned (with source: Centre / State / Municipality)
  - Budget spent
  - Maintenance schedule
  - Repair history log (timestamped)
  - Responsible Executive Engineer (name & designation)
- File a complaint about a specific road:
  - Select road from map or search
  - Choose complaint category: pothole / flooding / structural / signage / illegal encroachment / other
  - Add a description (text only — no photos to protect anonymity infrastructure)
  - Receive a unique complaint tracking token
- Check complaint status using their tracking token
- See if the engineer has: seen it / replied / resolved it
- Use the AI chatbot for Q&A about road data
- View the public analytics dashboard (read-only)

**What they cannot do:**
- Create accounts or log in
- See other complaints or any identifying data
- Access engineer or admin panels
- Modify road data

---

### 5.3 Engineer / Contractor Role — Detailed Specification 🔄

**What they can do:**
- Log in via email + OTP
- View their assigned roads on a map
- See all complaints routed to them in a feed/inbox style view
- For each complaint:
  - Mark as "Seen" (timestamp recorded)
  - Mark as "In Progress"
  - Add an internal note
  - Reply to the citizen (text reply, pushed to their tracking token view)
  - Mark as "Resolved" with resolution description
  - Flag as "Duplicate" or "Out of jurisdiction" (triggers re-routing by admin)
- View their own performance dashboard:
  - Current performance score breakdown
  - Resolution rate
  - Average response time
  - Open vs resolved complaints
  - Road longevity rating for each assigned road
- View road data for their assigned roads only
- Cannot access roads they're not assigned to

**What they cannot do:**
- See citizen identities (fully preserved)
- Access admin routing controls
- Modify budget or road data records directly
- See other contractors' complaint feeds

---

### 5.4 Admin / Authority Role — Detailed Specification 🔄

**What they can do:**
- Full read/write access to all system data
- View all complaints across all roads, all contractors, all regions
- Manually reassign complaints to correct Engineer if auto-routing failed
- View, create, edit, or deactivate engineer/contractor accounts
- Enter or update road data (road type, contractor assignment, budget records, repair logs)
- View the global analytics dashboard with all filters unlocked
- Escalate unresolved complaints (triggers notification to senior authority — mechanism TBD 🔄)
- View contractor performance scores and flag underperforming contractors
- Generate exportable reports (CSV / PDF) for internal use
- Configure routing rules: which road type maps to which authority
- Add global data for other countries (schema adaptable)

**What they cannot do:**
- See citizen PII (there is none to see — preserved by design)
- Override contractor scores manually (calculated algorithmically only)

---

### 5.5 RBAC Permission Matrix

| Permission | Citizen | Engineer | Admin |
|---|---|---|---|
| View road data | ✅ | ✅ (assigned only) | ✅ (all) |
| File complaint | ✅ | ❌ | ❌ |
| View own complaint status | ✅ | ❌ | ❌ |
| View all complaints | ❌ | ✅ (routed to them) | ✅ (all) |
| Reply to complaint | ❌ | ✅ | ✅ |
| Reassign complaint | ❌ | ❌ | ✅ |
| View own performance score | ❌ | ✅ | ✅ |
| View all contractor scores | ❌ | ❌ | ✅ |
| Edit road data | ❌ | ❌ | ✅ |
| Edit budget data | ❌ | ❌ | ✅ |
| Access analytics | Read-only public | Limited | Full |
| Use AI chatbot | ✅ | ✅ | ✅ |
| Export data | ❌ | ❌ | ✅ |
| Manage accounts | ❌ | ❌ | ✅ |
| Configure routing rules | ❌ | ❌ | ✅ |

---

## 6. Feature List

### 6.1 Citizen-Facing Features

- **Anonymous access**: No signup, no login, no email, no name
- **Location detection**: GPS auto-detect or manual map pin-drop
- **Road data viewer**: Map-based overlay with clickable road segments
- **Road detail card**: Full info — type, contractor, budget, repair history, engineer contact
- **Complaint filing form**: Category selection, text description, anonymous submission
- **Complaint token system**: Unique alphanumeric token returned on submission
- **Complaint status tracker**: Enter token → see current status + engineer reply
- **Push notification opt-in**: Receive updates on complaint progress (optional)
- **AI chatbot**: Conversational Q&A on road data and analytics
- **Public analytics view**: Read-only charts and heatmaps
- **Offline mode**: Last-viewed road data cached, complaint drafts saved, offline indicator

### 6.2 Engineer / Contractor Features

- **Complaint inbox**: All routed complaints in a prioritised feed
- **Complaint detail view**: Full complaint text, road location, submission time
- **Status management**: Seen / In Progress / Resolved / Flagged workflow
- **Citizen reply**: Text reply sent back to citizen's tracking token view
- **Assigned roads map**: Visual overview of all roads under their jurisdiction
- **Own performance dashboard**: Score breakdown, trends, open items
- **Notification system**: Push/email when new complaint is assigned
- **Duplicate/mis-routing flag**: Ability to flag for admin re-routing
- **Offline support**: View complaints and draft replies offline (sync on reconnect)

### 6.3 Admin / Authority Features

- **Command dashboard**: Real-time overview of entire system
- **All-complaints view**: Filterable by region, road type, contractor, status, date
- **Manual complaint reassignment**: Drag-and-drop or dropdown reassign
- **Contractor management**: Create, edit, deactivate contractor accounts
- **Road data management**: Full CRUD for all road records
- **Budget data entry**: Enter sanctioned vs spent amounts, source attribution
- **Repair log management**: Add maintenance records per road
- **Routing rule configuration**: Define NH → NHAI, SH → State PWD, etc.
- **Contractor score viewer**: Ranked list of all contractors with score breakdown
- **Escalation tool**: Mark complaint for escalation to senior authority
- **Data export**: CSV / PDF reports for selected filters
- **Global schema toggle**: Switch country context for international data 🔄
- **Full analytics access**: All charts, all filters, all time ranges

### 6.4 System-Wide Features

- **PWA installability**: Add to home screen on mobile, desktop app on laptop
- **Service worker caching**: Aggressive caching of road data and complaint state
- **Background sync**: Queue offline actions, submit on reconnect
- **AI chatbot (all roles)**: Role-aware context — citizen gets public data answers, admin gets deeper analytics answers
- **Responsive design**: Mobile-first, works on 320px to 4K displays
- **Accessibility**: WCAG 2.1 AA target — screen reader support, contrast ratios, keyboard navigation 🔄

---

## 7. Tech Stack Recommendation

> 🔄 This stack is a starting recommendation. Every choice here is open to revision based on team skill, time constraints, or hosting decisions.

### 7.1 Frontend

| Layer | Technology | Reason |
|---|---|---|
| Framework | React 18 + Vite | Fast builds, excellent PWA ecosystem, wide community |
| Styling | Tailwind CSS + shadcn/ui | Rapid development, consistent design system |
| State Management | Zustand + React Query | Lightweight global state + server-state caching |
| Maps | Leaflet.js + OpenStreetMap | Free, offline-capable tile support, GeoJSON overlay |
| Charts/Analytics | Recharts + D3.js | Composable charts, heatmap capability |
| PWA Tooling | Workbox (via Vite plugin) | Service worker generation, caching strategies, BG sync |
| Offline Storage | IndexedDB via Dexie.js | Structured local DB for road data and draft complaints |
| Notifications | Web Push API + VAPID | Browser push without native app |
| Icons | Lucide React | Consistent, lightweight |

### 7.2 Backend

| Layer | Technology | Reason |
|---|---|---|
| Runtime | Node.js (Express) or Python (FastAPI) 🔄 | Flexible; FastAPI better for AI integration |
| API Style | REST + optional GraphQL 🔄 | REST for simplicity, GraphQL for complex analytics queries |
| Authentication | Supabase Auth (JWT) | Handles engineer/admin auth; citizen needs no auth |
| Geospatial | PostGIS extension on PostgreSQL | Essential for location-based road lookups |
| Job Queue | BullMQ + Redis | Complaint routing queue, notification dispatch |
| File Storage | Supabase Storage / S3 🔄 | For any document/report exports |

### 7.3 Database

| Store | Technology | Use |
|---|---|---|
| Primary DB | PostgreSQL + PostGIS | All structured data — roads, complaints, users, budgets |
| Cache | Redis | Session cache, complaint status cache, API rate limiting |
| Search | PostgreSQL Full-Text Search or Meilisearch 🔄 | Road search by name / pincode / area |
| Offline | IndexedDB (client-side) | Road data cache, complaint drafts, chatbot last session |

### 7.4 AI Chatbot

| Component | Technology | Reason |
|---|---|---|
| AI Model | Claude API (claude-sonnet-4-20250514) | Best context handling, strong reasoning on data |
| Fallback | OpenAI GPT-4o / Gemini 1.5 Flash 🔄 | Cost/availability fallback |
| Context Injection | Dynamic system prompt builder | Injects live analytics data per request |
| Session Memory | Redis TTL sessions | Short-term conversation context per user |

### 7.5 Infrastructure & DevOps 🔄

| Component | Technology |
|---|---|
| Frontend Hosting | Vercel |
| Backend Hosting | Railway / Render |
| Database | Supabase (managed Postgres + PostGIS) |
| CDN | Cloudflare |
| CI/CD | GitHub Actions |
| Monitoring | Sentry (errors) + Posthog (analytics) |
| Environment Config | dotenv + Vault (TBD) |

---

## 8. Data Architecture & Schema

### 8.1 Road Model

```sql
Road {
  id              UUID PRIMARY KEY
  road_name       TEXT                    -- "NH-6", "Raja Rajendra Marg"
  road_type       ENUM(NH, SH, MDR, ODR, VR, Urban, Other)
  road_code       TEXT                    -- Official government road code
  geometry        GEOMETRY(LineString)    -- PostGIS spatial data
  state           TEXT
  district        TEXT
  pincode_zones   TEXT[]                  -- Array of pincodes the road passes through
  country         TEXT DEFAULT 'India'    -- For global schema
  contractor_id   UUID FK → Contractor
  engineer_id     UUID FK → Engineer
  length_km       DECIMAL
  design_lifespan_years INT              -- How long this road is designed to last
  constructed_date DATE
  last_relayed_date DATE
  next_maintenance_due DATE
  surface_type    TEXT
  lane_count      INT
  status          ENUM(Good, Fair, Poor, Critical, Unknown)
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
}
```

### 8.2 Complaint Model

```sql
Complaint {
  id              UUID PRIMARY KEY
  tracking_token  TEXT UNIQUE             -- Citizen-facing ID (e.g. RW-2026-XJKP)
  road_id         UUID FK → Road
  category        ENUM(Pothole, Flooding, Structural, Signage, Encroachment, Other)
  description     TEXT
  severity        ENUM(Low, Medium, High, Critical) -- Auto-assessed or citizen-selected
  latitude        DECIMAL                 -- Approximate location only
  longitude       DECIMAL
  status          ENUM(Submitted, Routed, Seen, InProgress, Resolved, Escalated, Closed)
  routed_to       UUID FK → Engineer      -- Auto-assigned by routing engine
  routed_at       TIMESTAMP
  seen_at         TIMESTAMP
  resolved_at     TIMESTAMP
  resolution_note TEXT
  engineer_reply  TEXT                    -- Shown to citizen via tracking token
  escalated       BOOLEAN DEFAULT false
  escalated_at    TIMESTAMP
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
}
```

### 8.3 Budget Model

```sql
Budget {
  id              UUID PRIMARY KEY
  road_id         UUID FK → Road
  financial_year  TEXT                    -- "2024-25"
  work_type       TEXT                    -- "Resurfacing", "Reconstruction", "Repair"
  amount_sanctioned DECIMAL
  amount_spent    DECIMAL
  source          ENUM(Central, State, Municipal, PMGSY, CRIF, Other)
  source_scheme   TEXT                    -- e.g. "PMGSY Phase III"
  authority       TEXT                    -- Which ministry/dept sanctioned it
  contract_value  DECIMAL
  contractor_id   UUID FK → Contractor
  work_order_date DATE
  expected_completion DATE
  actual_completion DATE
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
}
```

### 8.4 Contractor / Engineer Model

```sql
Contractor {
  id              UUID PRIMARY KEY
  name            TEXT
  registration_no TEXT                    -- Government contractor registration
  contact_email   TEXT
  contact_phone   TEXT
  address         TEXT
  state           TEXT
  country         TEXT DEFAULT 'India'
  type            ENUM(Contractor, Engineer, Authority)
  jurisdiction_roads UUID[]              -- FK array → Road.id
  role            ENUM(Engineer, Contractor, Authority)
  auth_user_id    UUID FK → AuthUser
  performance_score DECIMAL              -- Computed, stored for performance
  last_score_updated TIMESTAMP
  account_active  BOOLEAN DEFAULT true
  created_at      TIMESTAMP
}
```

### 8.5 Repair Log Model

```sql
RepairLog {
  id              UUID PRIMARY KEY
  road_id         UUID FK → Road
  contractor_id   UUID FK → Contractor
  work_description TEXT
  work_type       ENUM(Pothole_Fill, Resurfacing, Reconstruction, Patching, Drainage, Other)
  start_date      DATE
  end_date        DATE
  budget_id       UUID FK → Budget
  quality_rating  INT                    -- Admin-assigned post-completion rating (1-5)
  notes           TEXT
  created_at      TIMESTAMP
}
```

### 8.6 Contractor Score Model

```sql
ContractorScore {
  id                  UUID PRIMARY KEY
  contractor_id       UUID FK → Contractor
  score_date          DATE
  overall_score       DECIMAL             -- Weighted composite (0-100)
  loyalty_score       DECIMAL             -- See scoring section
  quality_score       DECIMAL
  resolution_rate     DECIMAL             -- % complaints resolved
  avg_response_time_hrs DECIMAL
  repeat_complaint_penalty DECIMAL
  total_complaints    INT
  open_complaints     INT
  resolved_complaints INT
  computed_at         TIMESTAMP
}
```

### 8.7 Country Schema Adapter 🔄

```yaml
# country_schema.yaml - Adaptable per country
India:
  road_types: [NH, SH, MDR, ODR, VR, Urban]
  authority_mapping:
    NH: NHAI
    SH: State PWD
    MDR: District Authority
    Urban: Municipal Corporation
  budget_sources: [Central, State, Municipal, PMGSY, CRIF]
  
UK:
  road_types: [Motorway, A_road, B_road, Local]
  authority_mapping:
    Motorway: Highways England
    A_road: Local Highway Authority
  budget_sources: [DfT, Local Authority, PFI]

USA:
  road_types: [Interstate, US_Highway, State_Route, County_Road, Local]
  authority_mapping:
    Interstate: FHWA
    State_Route: State DOT
  budget_sources: [Federal, State, Municipal, TIFIA]
```

---

## 9. Complaint Routing Logic

### 9.1 Routing Flow 🏆

```
Citizen files complaint
         │
         ▼
┌─────────────────────────┐
│  Extract road_id from   │
│  GPS location (PostGIS  │
│  nearest road query)    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Look up road.road_type │
│  in routing rules table │
└───────────┬─────────────┘
            │
     ┌──────┴──────┐
     │             │
  Road type     Road type
  found in      NOT found
  rules         in rules
     │             │
     ▼             ▼
┌──────────┐   ┌──────────┐
│ Auto-    │   │ Route to │
│ route to │   │ default  │
│ correct  │   │ Admin    │
│ engineer │   │ queue    │
└────┬─────┘   └────┬─────┘
     │              │
     ▼              ▼
┌──────────────────────────┐
│  Create complaint record │
│  Status: ROUTED          │
│  Assign tracking token   │
│  Notify engineer (push / │
│  email)                  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Engineer sees complaint │
│  Status: SEEN            │
│  Timestamp recorded      │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Engineer marks In       │
│  Progress / Replies      │
│  Status: IN_PROGRESS     │
│  Reply sent to citizen   │
└──────────┬───────────────┘
           │
     ┌─────┴──────┐
     │            │
  Resolved    Not resolved
  within SLA   within SLA
     │            │
     ▼            ▼
┌──────────┐   ┌──────────────┐
│ Status:  │   │ Auto-flag to │
│ RESOLVED │   │ Admin for    │
│ Score    │   │ escalation   │
│ updated  │   │ Status:      │
└──────────┘   │ ESCALATED    │
               └──────────────┘
```

### 9.2 Routing Rules Table (Configurable by Admin) 🔄

| Road Type | Country | Authority Type | Routing Target |
|---|---|---|---|
| NH | India | NHAI / MoRTH | Regional Officer by zone |
| SH | India | State PWD | District Engineer by district |
| MDR | India | District Collector's Office | Sub-divisional Engineer |
| Urban | India | Municipal Corporation | Ward-level Engineer |
| VR (Village Road) | India | Panchayati Raj / PMGSY | Block Engineer |
| Motorway | UK | National Highways | Regional Operations |
| A Road | UK | Local Highway Authority | County Engineer |

> 🔄 This table is admin-configurable. New countries and road types can be added at any time.

### 9.3 SLA Thresholds (Default — Configurable) 🔄

| Complaint Severity | Time to See | Time to Resolve |
|---|---|---|
| Critical | 4 hours | 48 hours |
| High | 12 hours | 7 days |
| Medium | 48 hours | 14 days |
| Low | 7 days | 30 days |

---

## 10. Analytics Dashboard Specification

### 10.1 Public Analytics (Citizen View) 🏆

Visible to all users without login:

| Metric | Visualisation |
|---|---|
| Total complaints filed (all time / this month) | Counter card |
| Complaints by status (submitted / in progress / resolved) | Donut chart |
| Top 10 most complained roads in selected area | Horizontal bar chart |
| Complaint heatmap overlaid on map | Map heatmap layer |
| Average resolution time (all contractors) | Gauge / KPI card |
| Budget utilisation by district | Stacked bar chart |
| Road quality index by area | Choropleth map 🔄 |

### 10.2 Engineer Analytics (Role-Restricted)

| Metric | Visualisation |
|---|---|
| My open complaints | Counter card + list |
| My resolution rate (this month / all time) | % KPI card |
| My average response time | KPI card |
| Complaints by category (assigned to me) | Pie chart |
| My performance score trend | Line chart over time |
| Roads I manage — complaint frequency | Bar chart per road |

### 10.3 Admin Analytics (Full Access) 🏆

| Metric | Visualisation |
|---|---|
| System-wide complaint volume over time | Time-series line chart |
| Contractor performance leaderboard | Ranked table with scores |
| Budget sanctioned vs. spent by road / district / scheme | Grouped bar chart |
| Complaint resolution rate by contractor | Sortable table |
| Unresolved complaints past SLA | Alert list |
| Road quality index — predicted deterioration timeline | 🔄 future scope |
| Escalated complaints | Flagged list |
| Geographic distribution of complaints | Heatmap on map |
| Top complaint categories | Treemap / bar chart |
| Contractor score history | Line chart per contractor |

### 10.4 Filter Controls (All Dashboards) 🔄

- **Location**: Country → State → District → Pincode
- **Road Type**: NH / SH / MDR / Urban / VR / All
- **Time Period**: Today / This Week / This Month / Custom Range
- **Contractor**: Dropdown (admin only)
- **Complaint Category**: Multi-select
- **Status**: Multi-select

---

## 11. AI Chatbot Design

### 11.1 Overview

The chatbot is not a separate product — it is an **analytics amplifier**. Its entire purpose is to let citizens (and admins) ask questions in plain conversational language and get answers grounded in real road data.

It does not hallucinate road data. It only answers from what is in the analytics context.

### 11.2 Context Injection Architecture 🏆

```
User sends a message
       │
       ▼
┌──────────────────────────────────────────┐
│  CONTEXT BUILDER SERVICE                 │
│                                          │
│  1. Identify user location (from session)│
│  2. Query DB for relevant road data      │
│     (roads within N km of user)          │
│  3. Query analytics aggregates           │
│     (complaint stats, contractor scores) │
│  4. Build dynamic system prompt          │
│  5. Append conversation history          │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│  AI API REQUEST                          │
│                                          │
│  System prompt:                          │
│  "You are RoadWatch Assistant. You have  │
│  access to the following road data for   │
│  the user's area: [INJECTED DATA JSON].  │
│  Answer only from this data. If the data │
│  doesn't contain the answer, say so.     │
│  Be concise, factual, and helpful.       │
│  Do not make up contractor names,        │
│  budget figures, or dates."              │
│                                          │
│  User message: [user's question]         │
│  Conversation history: [last N turns]    │
└──────────────────┬───────────────────────┘
                   │
                   ▼
            AI API Response
                   │
                   ▼
         Returned to user in UI
```

### 11.3 Sample System Prompt Template 🔄

```
You are the RoadWatch Assistant — an AI that helps citizens understand 
road quality, public spending, and infrastructure accountability in their area.

You have access to the following real-time data for the user's location 
({user_lat}, {user_lng}), covering roads within {radius_km} km:

ROAD DATA:
{road_data_json}

ANALYTICS SUMMARY:
{analytics_summary_json}

RULES:
- Only answer using the data provided above
- If a specific piece of data is not available, say clearly: 
  "I don't have that data currently available."
- Do not invent contractor names, budgets, dates, or repair history
- If the user asks to file a complaint, guide them to the complaint form
- Keep answers concise — 2-4 sentences unless more detail is needed
- Use simple, non-technical language
- You may suggest which authority is responsible for an issue
```

### 11.4 Example Q&A Flows

**Example 1 — Road data query**
> User: "Who is responsible for the road near Santoshpur flyover?"
> Bot: "The road near Santoshpur flyover is NH-12, maintained under NHAI. The assigned contractor is ABC Constructions Pvt. Ltd. The last maintenance was done in February 2025. The responsible Executive Engineer is Er. Ramesh Singh (NHAI, Kolkata Zone)."

**Example 2 — Budget transparency query**
> User: "How much money was spent on the road outside my house?"
> Bot: "Based on your location, the nearest road is the SH-17 Sector B stretch. ₹45 lakh was sanctioned for resurfacing in FY 2024-25, of which ₹38 lakh has been spent. The source is State PWD, West Bengal."

**Example 3 — Complaint guidance**
> User: "There's a huge pothole near my home, what do I do?"
> Bot: "You can file a complaint directly through RoadWatch — it takes under a minute and stays completely anonymous. Based on your location, your complaint will be routed to the District PWD Engineer for this road. Tap 'Report an Issue' on the home screen to get started."

**Example 4 — Contractor accountability**
> User: "Is my road contractor doing a good job?"
> Bot: "The contractor for your road (XYZ Infra Ltd.) currently has a performance score of 61/100. They have 8 open complaints, an average resolution time of 12 days, and 3 complaints on the same stretch in the past 6 months — which has lowered their repeat-complaint score."

### 11.5 Admin Chatbot Extensions 🔄

The admin version of the chatbot gets deeper context injected:
- All contractor performance data
- Budget utilisation across all schemes
- Escalation-pending complaints
- Can answer: "Which contractor has the worst score in West Bengal this year?"

### 11.6 Offline Chatbot Behaviour

- If offline: Show last 3 chatbot exchanges from IndexedDB cache
- Display a clear banner: "Chatbot unavailable offline — showing last saved session"
- Cache common Q&A patterns for roads near user location for instant offline answers 🔄

---

## 12. Contractor Scoring System

### 12.1 Score Philosophy 🏆

The scoring system must be:
- **Tamper-proof**: No engineer can manually set their own score
- **Algorithmically computed**: Runs on a scheduled job (daily/weekly)
- **Transparent**: Admins can see the breakdown; engineers can see their own breakdown
- **Meaningful**: Each component measures something that actually matters to road quality
- **Penalising of gaming**: Closing complaints without resolution, or repeat failures, must tank the score

### 12.2 Score Components

#### Component 1: Resolution Rate Score (0–25 points)

```
resolved_complaints / total_complaints × 25
```

- If 90% of complaints are resolved → 22.5 points
- If 40% are resolved → 10 points

#### Component 2: Response Time Score (0–25 points)

```
For each complaint:
  if resolved within SLA → full points
  if resolved 1–2x SLA → partial points
  if unresolved past 2x SLA → 0 points

Average across all complaints × 25
```

SLA thresholds defined in Section 9.3.

#### Component 3: Road Longevity Score (0–25 points) ⚠️

This is the most innovative score component:

```
For each road under contractor's responsibility:
  longevity_ratio = (current_age_years) / (design_lifespan_years)
  
  if longevity_ratio < 0.5 AND complaints > threshold:
    → road is failing early → penalty score
    
  if longevity_ratio > 1.0 AND complaints < threshold:
    → road has exceeded lifespan without failure → bonus

Road Longevity Score = average across all assigned roads (normalised to 0–25)
```

*Example: A road designed to last 5 years is receiving pothole complaints at 1 year. The contractor who built it gets penalised. This is the core accountability mechanism.*

#### Component 4: Repeat Complaint Penalty (0 to -15 points)

```
For each road:
  repeat_complaints = complaints on same road within 90 days

penalty = repeat_complaints × weight (e.g. -1 per repeat above threshold)
capped at -15 points total
```

This prevents contractors from "resolving" complaints without actually fixing the problem.

#### Component 5: Loyalty / Tenure Bonus (0–10 points)

```
tenure_years = years assigned to current roads
bonus = min(tenure_years × 1, 10)
```

Rewards long-term contractors who stick with their roads, discourages churn.

### 12.3 Overall Score Formula

```
Overall Score = 
  Resolution_Rate_Score (0-25)
  + Response_Time_Score (0-25)
  + Road_Longevity_Score (0-25)
  - Repeat_Complaint_Penalty (0 to -15)
  + Loyalty_Bonus (0-10)

Max possible: 85 + 10 = 95
Normalised to 0-100 for display 🔄
```

### 12.4 Score Bands

| Score | Band | Meaning |
|---|---|---|
| 80–100 | 🟢 Excellent | Consistently high performer |
| 60–79 | 🟡 Good | Generally reliable, room for improvement |
| 40–59 | 🟠 Below Average | Needs attention, admin review recommended |
| 20–39 | 🔴 Poor | Multiple failures, at risk |
| 0–19 | ⚫ Critical | Immediate admin escalation recommended |

### 12.5 Score Computation Schedule 🔄

- Scores recomputed: Daily at 2 AM (background job via BullMQ)
- Score history stored in `ContractorScore` table (one record per day per contractor)
- Admins can view score trends over time as a line chart

---

## 13. Privacy & Anonymity Design

### 13.1 What We Never Collect

| Data Type | Collected? | Why |
|---|---|---|
| Name | ❌ Never | Not needed, privacy by design |
| Phone number | ❌ Never | Not needed |
| Email | ❌ Never (citizen) | Not needed |
| IP address | ❌ Not stored | Drop after routing, do not persist |
| Device fingerprint | ❌ Never | Not needed |
| Photo / image | ❌ Not implemented in MVP | Reduces anonymity risk |
| Precise GPS | ⚠️ Approximate only | Rounded to nearest 100m grid |

### 13.2 What We Do Collect (Citizen)

| Data Type | Precision | Purpose |
|---|---|---|
| Location | ~100m grid square | Road lookup, complaint routing |
| Complaint text | As typed | Forwarded to engineer (no PII should be included — UI warns user) |
| Tracking token | Random UUID | Let citizen check status |
| Complaint timestamp | Rounded to hour | Analytics, SLA tracking |

### 13.3 Anonymisation Mechanisms

- Location is rounded to a ~100m grid before storage (exact GPS never stored)
- Tracking token is randomly generated with no connection to device or session
- No cookies, no sessions, no fingerprinting for citizen role
- UI includes a clear notice: "Do not include your name, phone, or address in complaint description"
- Complaint descriptions are scanned for common PII patterns (regex) and user warned before submission 🔄

### 13.4 Engineer & Admin Data

- Stored securely in Supabase Auth (hashed passwords, JWT)
- Admin access logged for audit trail
- Data encrypted at rest (Supabase default) and in transit (HTTPS everywhere)

### 13.5 Compliance Notes 🔄

- DPDP Act 2023 (India) compliance to be reviewed before production
- GDPR compliance for international deployment to be reviewed
- No third-party analytics scripts that track citizens (no Google Analytics on citizen-facing pages)

---

## 14. Offline & PWA Strategy

### 14.1 PWA Requirements Checklist

| Requirement | Implementation |
|---|---|
| HTTPS | Enforced everywhere |
| Web App Manifest | name, icons, theme_color, display: standalone |
| Service Worker | Workbox-generated, registered on load |
| Installable | Meets Chrome/Safari install criteria |
| Responsive | Mobile-first CSS, tested 320px–2560px |
| Fast load | Lighthouse PWA score target: 90+ 🔄 |

### 14.2 Caching Strategy per Resource Type

| Resource | Strategy | Details |
|---|---|---|
| App shell (HTML/JS/CSS) | Cache First | Never hits network after first load |
| Road data for user area | Stale While Revalidate | Shows cached, fetches update in background |
| Map tiles | Cache First (TTL: 7 days) | OpenStreetMap tiles cached aggressively |
| Analytics data | Network First (fallback to cache) | Prefer fresh data, show cached if offline |
| AI chatbot responses | No cache (live only) | Show offline message, show last session |
| Complaint status | Network First | Must be fresh, show last known if offline |

### 14.3 Offline Actions Queue (Background Sync)

```
User files complaint while offline
           │
           ▼
Complaint saved to IndexedDB queue
           │
           ▼
UI shows: "Complaint saved. Will be submitted when you're back online."
           │
           ▼
Service Worker registers BackgroundSync event
           │
     Connectivity restored
           │
           ▼
Service Worker fires sync event
           │
           ▼
Complaint submitted to API
           │
           ▼
Tracking token received and stored in IndexedDB
           │
           ▼
Push notification (if opted in): "Your complaint has been submitted. Token: RW-2026-XJKP"
```

### 14.4 Low-Bandwidth Optimisations

- All API responses compressed (gzip / brotli)
- Map tiles lazy-loaded, only for visible viewport
- Analytics charts load progressively — skeleton loaders shown first
- Images (if any) served in WebP format with srcset
- AI chatbot disabled on connections < 2G (detected via `navigator.connection`) 🔄
- Road data paginated — do not fetch all roads, only visible area + buffer

### 14.5 Device Compatibility Targets

| Device Type | Target |
|---|---|
| Android 8+ (2GB RAM) | Full support |
| iOS 14+ Safari | Full support |
| Low-end Android 6/7 | Degraded but functional 🔄 |
| Desktop Chrome/Firefox/Edge | Full support |
| Desktop Safari | Full support |
| Offline | Core features (road view, complaint draft) |

---

## 15. Evaluation Criteria Alignment

> 🏆 This section is critical for the hackathon judges.

| Brochure Criterion | How RoadWatch Addresses It | Features Involved |
|---|---|---|
| **Data accuracy** | Road data sourced from government open data APIs and manually curated; timestamped and versioned; admin CRUD with audit trail | Road Model, Admin CRUD, Budget Model, RepairLog |
| **Complaint routing mechanism** | Automated geo-based routing rules: NH→NHAI, SH→State PWD, MDR→District, Urban→Municipal; admin manual override; SLA-based escalation | Routing Engine, Routing Rules Table, Complaint Model, Escalation |
| **Budget transparency including the source** | Budget model stores amount_sanctioned, amount_spent, source (Central/State/Municipal/PMGSY/CRIF), scheme name, and authority; publicly visible to citizens via road detail card and chatbot | Budget Model, Road Detail Card, Public Analytics, AI Chatbot |
| **User interface & accessibility** | PWA with mobile-first responsive design; WCAG 2.1 AA target; interactive dashboard; map-based navigation; role-specific UI skins; offline UI indicators | Entire Frontend, Responsive Design, Accessibility Layer |
| **Information integration across countries** | Country schema adapter; road_type and authority_mapping configurable per country; global applicability built into data model | Country Schema YAML, Road Model (country field), Routing Rules Table |

### 15.1 Additional Brochure Requirements

| Brochure Requirement | Implementation |
|---|---|
| Shows Road Type (NH/SH/MDR etc.) | Road model `road_type` field; shown on road detail card |
| Last relaying date | Road model `last_relayed_date`; shown on road detail card |
| Contractor name | Road model `contractor_id` → Contractor name; shown publicly |
| Routing to correct Executive Engineer | Automated routing engine + manual admin override |
| Amount sanctioned/spent | Budget model; public-facing; source attributed |
| Global applicability | Country schema adapter; configurable routing rules |
| Offline functionality | Service worker, IndexedDB, BG sync, offline queue |
| Robustness in low-network conditions | Aggressive caching, compressed APIs, lazy loading |

---

## 16. Competitive Edge

### 16.1 Why RoadWatch Should Win 🏆

Most hackathon submissions will build:
- A basic CRUD app with a map
- A chatbot that answers static FAQ
- A complaint form with no routing logic
- A dashboard with no real data

**RoadWatch is different because:**

| Differentiator | What Makes It Stand Out |
|---|---|
| **Anonymous-first architecture** | Most civic apps require accounts. We require nothing. This dramatically lowers the barrier to participation and is the right privacy stance. |
| **Real routing logic** | Not just "send complaint to someone." The routing engine actually maps road type to correct authority. This is the hard problem no one solves. |
| **Contractor scoring system** | No other submission will have a multi-component, algorithmically computed performance score that includes road longevity vs design lifespan. This is deeply thought out. |
| **AI chatbot with live context injection** | The chatbot is not a static FAQ bot. It receives real analytics data as context and answers from it. This is technically more sophisticated and genuinely useful. |
| **PWA offline-first** | The target users — citizens in rural or semi-urban areas with poor connectivity — will actually be able to use this app. Most hackathon submissions assume WiFi. |
| **Budget transparency with source** | Directly addresses the evaluation criterion. We don't just show "budget = ₹50L." We show source: PMGSY Phase III, Central, sanctioned by MoRTH. |
| **Global schema** | The country adapter means this isn't India-only. It shows system design maturity. |
| **3-role ecosystem** | Most submissions build one view. We build three deeply differentiated experiences. |

### 16.2 What Makes This Winnable in Stage 1 🔄

Stage 1 is a submission — not a live demo. This means:
- The **quality of documentation** matters as much as the code
- A **clear, well-structured blueprint** with real design depth will stand out
- **Evaluation criterion alignment** (Section 15) must be made explicit in submission
- A **working MVP** (even partial) of the citizen view + routing demo + chatbot demo will be powerful

---

## 17. Development Phases & Roadmap

### 17.1 Phase 1 — Stage 1 MVP (Target: 31st May 2026) 🔄

**Goal:** Working demo sufficient to win Stage 1 shortlisting.

| Week | Focus | Deliverable |
|---|---|---|
| Week 1 | Setup, DB schema, basic backend | Supabase schema live, API skeleton, auth for engineer/admin |
| Week 2 | Citizen UI — map view, road data display | Map with clickable roads showing road type, contractor, last relayed, budget |
| Week 3 | Complaint filing + routing engine | Complaint form, routing logic, tracking token generation |
| Week 4 | Engineer dashboard (basic) | Complaint inbox, seen/resolved status, reply to citizen |
| Week 5 | AI Chatbot (basic context injection) | Working chatbot with road data context for user area |
| Week 6 | Analytics dashboard + PWA setup | Charts, offline mode, service worker, installability |
| Week 7 | Admin dashboard (basic) | Complaint overview, manual routing, contractor list |
| Week 8 | Polish, testing, documentation | Bug fixes, Lighthouse score, submission doc, demo video |

**MVP Feature Scope:**
- ✅ Citizen map view + road detail
- ✅ Complaint filing + token
- ✅ Engineer inbox + status update
- ✅ Basic admin dashboard
- ✅ AI chatbot (basic)
- ✅ PWA installable + offline indicator
- ✅ Public analytics (3-4 core charts)
- ⏸️ Contractor scoring (basic only in MVP)
- ⏸️ Push notifications (if time permits)
- ⏸️ Global schema (India only in MVP)

### 17.2 Phase 2 — Stage 2 (If Shortlisted) 🔄

**Goal:** Full feature completion, production-quality, live demo.

- Full contractor scoring system
- Push notifications
- Enhanced AI chatbot (admin context, deeper analytics answers)
- Budget data entry UI for admin
- Complaint escalation workflow
- Repair log management
- Export reports (CSV/PDF)
- Performance optimisation (Lighthouse 90+)
- Accessibility audit (WCAG 2.1 AA)
- Multi-language support (Hindi + regional languages) 🔄

### 17.3 Phase 3 — Full Vision (Post-Hackathon) 🔄

- Government open data API integrations (NHAI data API, state PWD portals)
- Real-time road condition monitoring (IoT sensor data integration)
- Predictive deterioration modelling (ML-based road lifecycle prediction)
- Citizen up-voting of complaints (without breaking anonymity)
- Mobile app wrappers (Capacitor / Expo) for deeper native features
- International deployments (UK, Bangladesh, Sri Lanka as pilot countries)
- WhatsApp / SMS complaint filing (for feature phone users)
- Road quality image classification (crowdsourced photos → AI pothole detection) 🔄

---

## 18. Open Questions, Assumptions & Future Scope

### 18.1 Open Questions 🔄

| Question | Current Assumption | Priority |
|---|---|---|
| What is the actual source of road data for MVP? | Manual data entry by admin / seeded demo data | HIGH |
| Are government open data APIs available for road contractor/budget data? | Partially — needs research into NHAI, data.gov.in | HIGH |
| Which AI API will we use? | Claude API preferred; fallback to OpenAI | MEDIUM |
| What is the hosting budget? | Free tiers (Vercel + Supabase + Railway free tier) | HIGH |
| Do we need a mobile app or is PWA sufficient? | PWA sufficient for Stage 1 | MEDIUM |
| How do we seed realistic road data for demo? | Manually create 20-30 roads in West Bengal/Tamil Nadu for demo | HIGH |
| What language support beyond English is needed for Stage 1? | English only in Stage 1 | LOW |
| How granular should offline caching be? | Roads within 5km of last known location | MEDIUM |
| Is photo upload needed for complaints? | Not in MVP — text only to preserve anonymity simplicity | LOW |
| How is contractor score displayed to engineers? | Engineers see their own score; admin sees all | MEDIUM |

### 18.2 Assumptions

- Demo data will be manually seeded for MVP — real government API integration is Phase 2+
- Road geometry (LineString) will use OpenStreetMap data for demo purposes
- Stage 1 judges will evaluate on design quality, completeness, and evaluation criterion alignment — not just code
- Free tier infrastructure (Vercel + Supabase + Railway) will be sufficient for demo load
- The team has basic React and backend development skills 🔄

### 18.3 Future Scope (Beyond Hackathon)

- **WhatsApp integration**: Citizens file complaints by WhatsApp message — no app needed
- **SMS fallback**: For feature phones and zero-data situations
- **IoT road sensors**: Real-time road condition data from embedded sensors
- **Crowdsourced road photos**: AI classifies pothole severity from uploaded images
- **Predictive maintenance**: ML model predicts when a road will need repair based on age, traffic, weather, complaint history
- **Carbon impact tracking**: Track CO2 impact of poor roads vs. maintained roads 🔄
- **Parliamentary transparency layer**: Link budget data to parliamentary budget allocations
- **Multi-language voice interface**: Citizen speaks in Hindi/Bengali to the chatbot 🔄
- **Real-time contractor location tracking**: (For active repair jobs, engineer-consented) 🔄

---

## Appendix A: Competition Information

| Field | Value |
|---|---|
| Hackathon | IIT Madras COERS Hackathon 2026 |
| Problem Statement | 1.2 — ROADWATCH |
| Stage 1 Opens | 11th March 2026 |
| Registration Deadline | 15th April 2026 |
| Stage 1 Submission Deadline | 31st May 2026 |
| Stage 2 | Details to shortlisted participants |
| 1st Prize | ₹50,000 |
| 2nd Prize | ₹30,000 |
| 3rd Prize | ₹20,000 |
| Participation Certificate | All teams clearing Stage 1 and submitting |
| Special Opportunity | Selected participants — job/internship offers |
| Eligibility | All students, engineers, problem solvers; min age 15; no professional qualifications required |
| Team Size | Individuals or groups of any size — no restriction |

---

## Appendix B: Glossary

| Term | Definition |
|---|---|
| NH | National Highway — under NHAI jurisdiction |
| SH | State Highway — under State PWD jurisdiction |
| MDR | Major District Road — under District authority |
| ODR | Other District Road |
| VR | Village Road — under Panchayati Raj / PMGSY |
| PWD | Public Works Department |
| NHAI | National Highways Authority of India |
| PMGSY | Pradhan Mantri Gram Sadak Yojana |
| CRIF | Central Road and Infrastructure Fund |
| RBAC | Role-Based Access Control |
| PWA | Progressive Web App |
| PostGIS | Spatial extension for PostgreSQL |
| SLA | Service Level Agreement |
| PII | Personally Identifiable Information |
| BG Sync | Background Sync (Web API for offline action queuing) |
| RTI | Right to Information (India) |

---

> 🔄 **This document is version 0.1 — a living blueprint. It will evolve with every sprint, every decision, and every new insight. Nothing here is final except the commitment to build something that actually works for the people who need it.**

---

*RoadWatch — Built for IIT Madras COERS Hackathon 2026 | Problem Statement 1.2*
