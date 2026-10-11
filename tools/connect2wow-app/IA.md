# Connect2WOW — information architecture and flows

Visual foundation: Figma `B8Kfu0nGgUIG0REVlQTD5C`, section "New pages" (`1480:18570`).
The prototype in this folder (`index.html`) builds every screen below in that style.

## 1. The shape of the product

```
┌ Rail ┐┌ Module sidebar ┐┌ Top bar: breadcrumb · search · 🔔 · 📅 · 💬 · avatar ▾ ┐
│ Home ││ 4–6 items,     ││                                                        │
│ HR   ││ each one a     ││  Content                                               │
│ HSE  ││ type of record ││                                                        │
│ Crs  ││ the module     ││                                                        │
│ Eng  ││ owns           ││                                                        │
│      ││                ││                                                        │
│ Help ││                ││                                                        │
│ Gear ││                ││                                                        │
└──────┘└────────────────┘└────────────────────────────────────────────────────────┘
```

Three layers, each with a fixed place on screen:

| Layer | What it is | Where it lives |
|---|---|---|
| **Workspace** (mine) | Home, Profile, Notifications, Calendar, Chat | Home is first on the rail. The other four are in the top bar on every screen. |
| **Modules** (the work) | HR, HSE, Courses, Engineering | The rail. Each module has its own sidebar. |
| **Admin** (setup) | Users & roles, permissions, sites, company settings | The gear at the bottom of the rail. Admins only. |

**Rules that keep it honest**
1. **A sidebar item is a type of record the module owns**: a list you can open and act on.
   Filters ("Reports to me") are chips. Actions ("Request resource") are buttons.
   Record views (Payroll, Documents) are tabs on the record.
2. **One record, one home.** A person lives in HR. Profile is the same record seen
   by its owner. Certificates live in Courses, and HR, HSE and Engineering read them.
3. **Approvals have one inbox.** Every module raises requests, and Home collects all of
   the ones waiting for *you*. Approving on Home or inside the module is the same action.
4. **Cross-module checks happen at the moment of need.** Assign a crew without valid
   certificates, or open a permit for someone whose H2S has expired, and the system warns
   inline and links to the fix.

## 2. Modules

### Home — "what needs me"
Role-aware; same layout for everyone, different content.
- **Needs your action**: approval cards from every module (the Figma request card), with tabs All · HR · HSE · Engineering · Courses.
- **Today**: my shifts/rotation, sessions, inspections due (from Calendar).
- **Expiring soon**: my (or my team's) certificates within 30 days.
- **Site status**: days without LTI, open incidents (everyone sees safety).
- **Connection requests**: external partners asking to connect (Figma), routed to HR › Partners.

### HR — people and organisation (Sarah)
| Sidebar | Owns | Key actions |
|---|---|---|
| **People** | Employees and contractors | Add worker, filter (Reports to me, Contractors, Site, Status). Opens the **worker record**: Overview · Employment · Payroll · Documents · Certificates (read from Courses) · Performance · Notes |
| **Organization** | Org chart, positions, disciplines | Chart / Positions / Disciplines as tabs; edit reporting lines |
| **Hiring** | Job postings, candidates | Post job → pipeline (Applied · Screening · Interview · Offer) → Hire creates an onboarding case |
| **Onboarding & offboarding** | Lifecycle cases with checklists | Each case: steps owned by HR, IT/Admin (access), HSE (induction), Courses (mandatory training) |
| **Reviews** | Performance cycles | Cycle → reviews per person → calibrate |
| **Partners** | External companies, providers, contractor firms | Connection requests (accept/ignore), directory, invite, contracts. *(the old "Connection" module; company-level, so it sits with HR)* |

Personal connections (people I work with) sit in **Profile › Network**, not in HR.

### HSE — keeping people safe (Daniel)
| Sidebar | Owns | Key actions |
|---|---|---|
| **Overview** | — | LTI-free days, open incidents by severity, overdue actions, inspections due, active permits |
| **Incidents** | Incident reports | **Report incident** (3 quick steps, anyone can do it) → triage → investigate → actions → close |
| **Inspections & audits** | Scheduled checklists | Schedule, run checklist, findings become corrective actions |
| **Corrective actions** | Actions from any source | One tracker for actions from incidents, inspections and audits; owner, due date, status |
| **Permits to work** | Hot work, confined space, work at height… | Request → check crew certificates (Courses) → approve → active → close |
| **Hazards** | Risk register | Likelihood × severity matrix; links to permits and inspections |

### Courses — learning and certification (everyone)
| Sidebar | Owns | Key actions |
|---|---|---|
| **My learning** | My enrolments | Continue, see due dates, mandatory first |
| **Certificates** | Certificates (per person) | Status (valid · expiring · expired), upload external certificate, **book renewal** |
| **Catalogue** | Courses (internal + external providers) | Browse, filter by mandatory/role, enrol |
| **Sessions** | Classroom/online sessions | Seats, instructor, location; enrol, attendance, issue certificate |
| **Requirements** | Training matrix (role/site → required certs) | Compliance by team and site, gaps, bulk-assign. Feeds HSE permits and Engineering crew checks |

### Engineering — the work in the field (Ryan, Graham)
| Sidebar | Owns | Key actions |
|---|---|---|
| **Overview** | — | Active work orders, crew on site, pending approvals, blocked items |
| **Projects** | Projects/sites (North Pad…) | Project page: work orders, crew, documents, timeline |
| **Work orders** | Work orders | **Create** → submit → **Ops manager approves** → assign crew → permit (HSE) → in progress → close |
| **Crew & resources** | Resource requests, allocations | Request crew/equipment, see who's free *and certified*, source externally via HR › Partners |
| **Drawings** | Diagrams and technical docs | Versioned; open in the editor |

## 3. Workspace services (top bar)

| Service | Pattern | Contents |
|---|---|---|
| **Notifications** 🔔 | Panel from the right | Grouped Today/Earlier, filter by module, inline action (Approve, Open). Follows the six-type model: only *collected* alerts land here; critical ones are modals/banners. |
| **Calendar** 📅 | Page (opens from the icon) | Week view; layers: My shifts & rotation · Sessions · Inspections · Permits · Leave. |
| **Chat** 💬 | Drawer | Direct, crew/site groups, and **threads attached to records** (an incident, a work order). |
| **Profile** (avatar ▾) | Page | Overview · Certificates · Skills · Work history · Network · My documents. Same person as the HR record, editable by its owner where HR allows. |

## 4. Core flows (all clickable in the prototype)

1. **Approve an offboarding** (Sarah, Home): request card → *View request detail* → checklist (access removal, equipment, final pay) → Approve → toast; HR › Onboarding & offboarding shows the case.
2. **Report an incident** (anyone, HSE): Report incident → What happened → Where & when → Severity & people → Submit → banner for High severity, Daniel gets it on Home; detail page with timeline and corrective actions.
3. **Create a work order** (Ryan → Graham): New work order → scope, site, dates → crew picker *warns on an expired certificate* → submit → appears in Graham's Home inbox → Approve.
4. **Renew a certificate** (Mark): Home "Expiring soon" or Courses › Certificates → Book renewal → choose session → confirm → appears in Calendar.
5. **Permit to work check** (Daniel): permit request lists crew; one person's H2S expired → blocked with a link to book the course.
6. **Accept a partner** (Sarah): Home connection request → Accept → HR › Partners.
