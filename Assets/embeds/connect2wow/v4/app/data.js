/* Connect2WOW prototype data. One store for every module, so a change made in
   one place (approve a request, book a session, report an incident) shows up
   everywhere it should. "Today" is fixed: Tue 13 Sep 2022, inside the project. */
window.TODAY = "Tue 13 Sep 2022";

window.DB = {
  people: {
    sarah:  { name: "Sarah Lim", role: "HR Manager", dept: "Human resources", site: "Calgary HQ", type: "Employee", c: "#E2558E", manager: "graham", email: "sarah.lim@prairie-energy.ca", phone: "(403) 555-0142", start: "Mar 2016", level: "Level C", status: "Active" },
    mark:   { name: "Mark Rushmore", role: "Journeyman welder", dept: "Field operations", site: "North Pad", type: "Employee", c: "#3374F5", manager: "ryan", email: "mark.rushmore@prairie-energy.ca", phone: "(780) 555-0199", start: "Jun 2019", level: "Level B", status: "Active", rotation: "14 on / 14 off" },
    daniel: { name: "Daniel Okafor", role: "HSE Lead", dept: "Health, safety & environment", site: "North Pad", type: "Employee", c: "#D97706", manager: "graham", email: "daniel.okafor@prairie-energy.ca", phone: "(780) 555-0117", start: "Jan 2018", level: "Level C", status: "Active" },
    ryan:   { name: "Ryan Mitchell", role: "Project Manager", dept: "Engineering", site: "North Pad", type: "Employee", c: "#7A5AF8", manager: "graham", email: "ryan.mitchell@prairie-energy.ca", phone: "(780) 555-0170", start: "Aug 2017", level: "Level C", status: "Active" },
    graham: { name: "Graham Whitfield", role: "Operations Manager", dept: "Engineering", site: "Calgary HQ", type: "Employee", c: "#3F3DB6", manager: null, email: "graham.whitfield@prairie-energy.ca", phone: "(403) 555-0101", start: "Feb 2012", level: "Level D", status: "Active" },
    nadia:  { name: "Nadia Rahimi", role: "System Administrator", dept: "IT", site: "Calgary HQ", type: "Employee", c: "#0E9384", manager: "graham", email: "nadia.rahimi@prairie-energy.ca", phone: "(403) 555-0133", start: "May 2020", level: "Level B", status: "Active" },
    daman:  { name: "Daman Forbs", role: "HR Business Partner", dept: "Human resources", site: "Calgary HQ", type: "Employee", c: "#C2410C", manager: "sarah", email: "daman.forbs@prairie-energy.ca", phone: "(403) 555-0150", start: "Oct 2020", level: "Level B", status: "Active" },
    markj:  { name: "Mark Jeferson", role: "Instrument technician", dept: "Field operations", site: "Camp 3", type: "Employee", c: "#B45309", manager: "ryan", email: "mark.jeferson@prairie-energy.ca", phone: "(780) 555-0163", start: "Apr 2015", level: "Level B", status: "Offboarding" },
    ilma:   { name: "Ilma Jeferson", role: "Process engineer", dept: "Engineering", site: "Calgary HQ", type: "Employee", c: "#DB2777", manager: "ryan", email: "illa.jeferson@prairie-energy.ca", phone: "(990) 44999 999", start: "Jul 2021", level: "Level A", status: "Active" },
    aiden:  { name: "Aiden Kowalski", role: "Pipefitter", dept: "Field operations", site: "North Pad", type: "Contractor", company: "Northline Lifts", c: "#D97706", manager: "ryan", email: "aiden@northline.ca", phone: "(780) 555-0188", start: "May 2022", level: "—", status: "Active" },
    lina:   { name: "Lina Ortiz", role: "Crane operator", dept: "Field operations", site: "North Pad", type: "Contractor", company: "Northline Lifts", c: "#0891B2", manager: "ryan", email: "lina@northline.ca", phone: "(780) 555-0121", start: "Aug 2022", level: "—", status: "Active" },
    tom:    { name: "Tom Becker", role: "Electrician", dept: "Field operations", site: "Camp 3", type: "Employee", c: "#4F46E5", manager: "ryan", email: "tom.becker@prairie-energy.ca", phone: "(780) 555-0104", start: "Nov 2014", level: "Level B", status: "Active" },
    priya:  { name: "Priya Nair", role: "HR Lead", dept: "SCW Logistics", site: "External", type: "Partner", c: "#9333EA", email: "priya@scw.com", start: "—", level: "—", status: "Pending" }
  },

  /* Approval requests. One store; Home shows the ones whose approver is "me". */
  requests: [
    { id: "r1", module: "hr", kind: "Offboarding", color: "red", icon: "hugeicons:information-diamond", from: "daman", subject: "markj", text: "wants to offboard", approver: "sarah", status: "open", ago: "1d ago",
      detail: { "Last working day": "Fri 30 Sep 2022", Reason: "Resignation", "Notice period": "Served (4 weeks)" },
      checklist: ["Revoke system access (Administration)", "Collect site badge and PPE", "Return company vehicle (Mercedes V-Class)", "Final pay and unused leave", "Exit interview"] },
    { id: "r2", module: "hr", kind: "Hiring", color: "blue", icon: "iconoir:user-plus", from: "daman", subject: "lina", text: "wants to hire", approver: "sarah", status: "open", ago: "2d ago",
      detail: { Position: "Crane operator (contract)", Site: "North Pad", Start: "Mon 3 Oct 2022", Rate: "$62 / h" },
      checklist: ["Offer letter signed", "Background check passed", "Crane operator certificate verified", "H2S Alive valid"] },
    { id: "r3", module: "hr", kind: "Access", color: "blue", icon: "hugeicons:biometric-access", from: "daman", subject: "aiden", text: "wants to grant access", approver: "sarah", status: "open", ago: "3h ago",
      detail: { Access: "HSE · report incidents, view permits", Duration: "Until contract end (31 Dec 2022)", Type: "Contractor" },
      checklist: ["Contractor agreement on file", "Site induction completed"] },
    { id: "r4", module: "eng", kind: "Work order", color: "purple", icon: "hugeicons:drawing-compass", from: "ryan", subject: "wo214", text: "submitted work order", approver: "graham", status: "open", ago: "5h ago",
      detail: { "Work order": "WO-214 · Pipe rack tie-in", Site: "North Pad", Dates: "Sep 19 – Sep 23", Crew: "3 people", Permit: "Hot work (HSE)" },
      checklist: ["Scope reviewed", "Crew certified", "Permit to work requested"] },
    { id: "r5", module: "eng", kind: "Resources", color: "orange", icon: "hugeicons:user-group", from: "ryan", subject: "res1", text: "requests resources", approver: "graham", status: "open", ago: "1d ago",
      detail: { Request: "2 welders · North Pad", Dates: "Sep 25 – Sep 27", Source: "Internal first, then Northline Lifts" },
      checklist: ["Budget code confirmed"] },
    { id: "r6", module: "hse", kind: "Permit", color: "orange", icon: "ant-design:safety-outlined", from: "ryan", subject: "ptw31", text: "requests a permit", approver: "daniel", status: "open", ago: "4h ago",
      detail: { Permit: "PTW-031 · Hot work", Site: "North Pad · pipe rack", Window: "Sep 19, 07:00 – 17:00", "Linked work order": "WO-214" },
      checklist: ["Gas test plan attached", "Fire watch assigned", "Crew certificates valid"] },
    { id: "r7", module: "hse", kind: "Incident close", color: "green", icon: "hugeicons:checkmark-circle-02", from: "daniel", subject: "inc108", text: "asks to close", approver: "graham", status: "open", ago: "2d ago",
      detail: { Incident: "INC-108 · Missing guard rail", Actions: "2 of 2 complete", Investigation: "Root cause recorded" },
      checklist: ["All corrective actions verified"] },
    { id: "r8", module: "courses", kind: "Enrolment", color: "purple", icon: "solar:square-academic-cap-2-linear", from: "mark", subject: "h2s", text: "wants to enrol", approver: "ryan", status: "open", ago: "6h ago",
      detail: { Course: "H2S Alive (renewal)", Provider: "Energy Safety Canada", Session: "Thu 15 Sep, Fort McMurray", Cost: "$245" },
      checklist: ["Required for role (training matrix)"] }
  ],

  partnerRequests: [
    { id: "p1", who: "Maya Patel", co: "Northwind Energy", kind: "HR", c: "#E11D48" },
    { id: "p2", who: "Daniel Kim", co: "Tritech Safety", kind: "Worker", c: "#16A34A" },
    { id: "p3", who: "Priya Nair", co: "SCW Logistics", kind: "HR", c: "#D97706" },
    { id: "p4", who: "Jordan Lee", co: "EPFC Corp", kind: "Instructor", c: "#DC2626" }
  ],
  partners: [
    { name: "Northline Lifts", kind: "Provider", what: "Cranes, operators, rigging", people: 6, contract: "Active · until Dec 2022", c: "#0E9384" },
    { name: "Tritech Safety", kind: "Provider", what: "Safety training, gas testing", people: 3, contract: "Active · rolling", c: "#16A34A" },
    { name: "Energy Safety Canada", kind: "Training provider", what: "H2S Alive, First Aid, CSO", people: 0, contract: "Framework", c: "#2563EB" },
    { name: "Prairie Welding Co.", kind: "Contractor firm", what: "Pressure welders", people: 4, contract: "Expired Aug 2022", c: "#9333EA" }
  ],

  /* Courses: certificates per person. days = until expiry (negative = expired). */
  certs: {
    mark:   [["First Aid", 12, "Energy Safety Canada"], ["QA Professional", 120, "Tritech"], ["H2S Alive", -9, "Energy Safety Canada"], ["Confined Space", 300, "Tritech"], ["Pressure welding B", 410, "ABSA"]],
    aiden:  [["H2S Alive", 200, "Energy Safety Canada"], ["First Aid", 330, "Energy Safety Canada"], ["Work at height", 90, "Tritech"]],
    lina:   [["Crane operator 3", 520, "Alberta AIT"], ["H2S Alive", 20, "Energy Safety Canada"], ["First Aid", 160, "Energy Safety Canada"]],
    tom:    [["Electrical 309A", 700, "Alberta AIT"], ["First Aid", -30, "Energy Safety Canada"], ["H2S Alive", 140, "Energy Safety Canada"]],
    daniel: [["CRSP", 900, "BCRSP"], ["H2S Alive", 60, "Energy Safety Canada"], ["First Aid", 210, "Energy Safety Canada"]],
    ryan:   [["H2S Alive", 95, "Energy Safety Canada"], ["First Aid", 25, "Energy Safety Canada"]],
    sarah:  [["First Aid", 400, "Energy Safety Canada"]],
    graham: [["H2S Alive", 180, "Energy Safety Canada"]],
    markj:  [["H2S Alive", 50, "Energy Safety Canada"]],
    ilma:   [["H2S Alive", 300, "Energy Safety Canada"]]
  },
  courses: [
    { id: "h2s", name: "H2S Alive", provider: "Energy Safety Canada", len: "1 day", mode: "Classroom", mandatory: true, roles: "All field roles", price: "$245" },
    { id: "fa", name: "Standard First Aid & CPR", provider: "Energy Safety Canada", len: "2 days", mode: "Classroom", mandatory: true, roles: "All staff", price: "$190" },
    { id: "cse", name: "Confined Space Entry", provider: "Tritech Safety", len: "1 day", mode: "Classroom", mandatory: false, roles: "Welders, pipefitters", price: "$310" },
    { id: "wah", name: "Work at Height", provider: "Tritech Safety", len: "1 day", mode: "Classroom", mandatory: false, roles: "Field roles at height", price: "$280" },
    { id: "gd", name: "Ground Disturbance 201", provider: "Energy Safety Canada", len: "1 day", mode: "Online", mandatory: false, roles: "Supervisors", price: "$150" },
    { id: "ind", name: "North Pad site induction", provider: "Prairie Energy (internal)", len: "2 h", mode: "Online", mandatory: true, roles: "Everyone at North Pad", price: "Free" }
  ],
  sessions: [
    { id: "s1", course: "h2s", date: "Thu 15 Sep", time: "08:00 – 16:30", where: "Fort McMurray training centre", seats: 3, cap: 16, instructor: "Jordan Lee" },
    { id: "s2", course: "h2s", date: "Tue 20 Sep", time: "08:00 – 16:30", where: "Calgary · Energy Safety Canada", seats: 9, cap: 16, instructor: "Jordan Lee" },
    { id: "s3", course: "fa", date: "Mon 19 Sep – Tue 20 Sep", time: "08:30 – 16:30", where: "North Pad camp, room B", seats: 5, cap: 12, instructor: "Tritech Safety" },
    { id: "s4", course: "fa", date: "Mon 3 Oct – Tue 4 Oct", time: "08:30 – 16:30", where: "Calgary HQ", seats: 12, cap: 12, instructor: "Tritech Safety" },
    { id: "s5", course: "cse", date: "Wed 21 Sep", time: "08:00 – 15:00", where: "North Pad camp, room B", seats: 6, cap: 10, instructor: "Tritech Safety" }
  ],
  learning: { mark: [["fa", "Due 25 Sep", 0, "Renewal"], ["ind", "Done", 100, "Completed 2 Jun"], ["cse", "Optional", 40, "In progress"]] },
  /* Training matrix: role → required certificates */
  matrix: [
    ["Journeyman welder", ["H2S Alive", "First Aid", "Confined Space"]],
    ["Pipefitter", ["H2S Alive", "First Aid", "Work at height"]],
    ["Crane operator", ["H2S Alive", "First Aid", "Crane operator 3"]],
    ["Electrician", ["H2S Alive", "First Aid", "Electrical 309A"]],
    ["HSE Lead", ["H2S Alive", "First Aid", "CRSP"]]
  ],

  incidents: [
    { id: "INC-112", title: "Gas reading above limit", site: "North Pad", where: "Pipe rack, bay 4", sev: "High", status: "Investigating", owner: "daniel", reported: "mark", when: "Sep 12, 09:40", type: "Near miss",
      what: "Portable monitor alarmed at 12 ppm H2S during line break. Area evacuated, wind direction NW.",
      timeline: [["Reported by Mark Rushmore", "Sep 12, 09:42"], ["Area evacuated, supervisor notified", "Sep 12, 09:45"], ["Triaged: High · Daniel Okafor", "Sep 12, 10:10"], ["Investigation started", "Sep 12, 13:00"]] },
    { id: "INC-111", title: "Hand laceration, grinding", site: "Camp 3", where: "Workshop", sev: "Medium", status: "Actions open", owner: "daniel", reported: "tom", when: "Sep 9, 14:05", type: "First aid", what: "Minor cut while changing grinder disc; first aid on site.", timeline: [["Reported by Tom Becker", "Sep 9, 14:07"], ["First aid given", "Sep 9, 14:15"]] },
    { id: "INC-110", title: "Vehicle reversing without spotter", site: "North Pad", where: "Laydown yard", sev: "Medium", status: "Actions open", owner: "daniel", reported: "ryan", when: "Sep 6, 11:20", type: "Unsafe act", what: "", timeline: [] },
    { id: "INC-109", title: "Spill, 5 L hydraulic oil", site: "Yard", where: "Fuel bay", sev: "Low", status: "Closed", owner: "daniel", reported: "aiden", when: "Aug 30, 16:00", type: "Environmental", what: "", timeline: [] },
    { id: "INC-108", title: "Missing guard rail", site: "Camp 3", where: "Platform B stairs", sev: "Medium", status: "Pending close", owner: "daniel", reported: "markj", when: "Aug 24, 08:10", type: "Unsafe condition", what: "", timeline: [] }
  ],
  actions: [
    { id: "CA-41", title: "Replace gas monitor sensor, unit #17", src: "INC-112", owner: "daniel", due: "Sep 14", status: "Open", pri: "High" },
    { id: "CA-40", title: "Add line-break gas test to JSA template", src: "INC-112", owner: "ryan", due: "Sep 20", status: "Open", pri: "High" },
    { id: "CA-39", title: "Grinder guard check in weekly toolbox talk", src: "INC-111", owner: "tom", due: "Sep 16", status: "In progress", pri: "Medium" },
    { id: "CA-38", title: "Spotter rule signage, laydown yard", src: "INC-110", owner: "ryan", due: "Sep 10", status: "Overdue", pri: "Medium" },
    { id: "CA-37", title: "Fire extinguisher tags, Camp 3", src: "INSP-77", owner: "daniel", due: "Sep 30", status: "Open", pri: "Low" },
    { id: "CA-35", title: "Install guard rail, platform B", src: "INC-108", owner: "tom", due: "Aug 31", status: "Done", pri: "Medium" }
  ],
  inspections: [
    { id: "INSP-79", title: "Weekly site walk", site: "North Pad", type: "Inspection", date: "Thu 15 Sep", owner: "daniel", status: "Scheduled", items: 24 },
    { id: "INSP-78", title: "Scaffold inspection, pipe rack", site: "North Pad", type: "Inspection", date: "Wed 14 Sep", owner: "daniel", status: "Scheduled", items: 18 },
    { id: "INSP-77", title: "Fire equipment", site: "Camp 3", type: "Inspection", date: "Fri 9 Sep", owner: "daniel", status: "Done · 2 findings", items: 30 },
    { id: "AUD-12", title: "COR external audit", site: "All sites", type: "Audit", date: "Mon 17 Oct", owner: "daniel", status: "Planned", items: 64 }
  ],
  permits: [
    { id: "PTW-031", type: "Hot work", wo: "WO-214", site: "North Pad · pipe rack", window: "Sep 19, 07:00 – 17:00", crew: ["mark", "aiden", "lina"], req: ["H2S Alive", "First Aid"], status: "Requested", by: "ryan" },
    { id: "PTW-030", type: "Confined space", wo: "WO-209", site: "Camp 3 · tank T-2", window: "Sep 13, 06:00 – 18:00", crew: ["tom", "markj"], req: ["H2S Alive", "Confined Space"], status: "Active", by: "ryan" },
    { id: "PTW-029", type: "Work at height", wo: "WO-207", site: "North Pad · flare stack", window: "Sep 8", crew: ["aiden"], req: ["Work at height"], status: "Closed", by: "ryan" }
  ],
  hazards: [
    { id: "HZ-14", title: "H2S release during line break", l: 3, s: 5, controls: "Gas test, SCBA on standby, permit", owner: "daniel" },
    { id: "HZ-13", title: "Dropped objects from pipe rack", l: 3, s: 4, controls: "Exclusion zone, tool lanyards", owner: "ryan" },
    { id: "HZ-12", title: "Vehicle–pedestrian contact, yard", l: 3, s: 3, controls: "Spotters, marked walkways", owner: "ryan" },
    { id: "HZ-11", title: "Hydraulic oil spill", l: 2, s: 2, controls: "Spill kits, drip trays", owner: "daniel" },
    { id: "HZ-10", title: "Fall from platform B", l: 2, s: 4, controls: "Guard rail installed", owner: "tom" }
  ],

  projects: [
    { id: "np", name: "North Pad expansion", site: "North Pad", phase: "Construction", progress: 62, wos: 7, crew: 18, lead: "ryan" },
    { id: "c3", name: "Camp 3 tank refurbishment", site: "Camp 3", phase: "Execution", progress: 35, wos: 4, crew: 6, lead: "ryan" },
    { id: "fl", name: "Flare stack inspection", site: "North Pad", phase: "Closing", progress: 92, wos: 2, crew: 3, lead: "ryan" }
  ],
  workorders: [
    { id: "WO-214", title: "Pipe rack tie-in", project: "np", site: "North Pad", dates: "Sep 19 – Sep 23", crew: ["mark", "aiden", "lina"], status: "Awaiting approval", permit: "PTW-031", pri: "High" },
    { id: "WO-213", title: "Valve replacement V-102", project: "np", site: "North Pad", dates: "Sep 14 – Sep 15", crew: ["tom"], status: "Approved", permit: "—", pri: "Medium" },
    { id: "WO-212", title: "Cable tray install, bay 2", project: "np", site: "North Pad", dates: "Sep 12 – Sep 16", crew: ["tom", "aiden"], status: "In progress", permit: "—", pri: "Medium" },
    { id: "WO-209", title: "Tank T-2 internal inspection", project: "c3", site: "Camp 3", dates: "Sep 13", crew: ["tom", "markj"], status: "In progress", permit: "PTW-030", pri: "High" },
    { id: "WO-207", title: "Flare tip check", project: "fl", site: "North Pad", dates: "Sep 8", crew: ["aiden"], status: "Closed", permit: "PTW-029", pri: "Low" }
  ],
  resources: [
    { id: "res1", what: "2 × Welders", site: "North Pad", dates: "Sep 25 – Sep 27", by: "ryan", status: "Awaiting approval", wo: "WO-216" },
    { id: "res2", what: "1 × Crane + operator", site: "North Pad", dates: "Sep 19 – Sep 23", by: "ryan", status: "Approved · Northline Lifts", wo: "WO-214" },
    { id: "res3", what: "Scaffold crew (3)", site: "Camp 3", dates: "Sep 26 – Sep 30", by: "ryan", status: "Sourcing", wo: "WO-215" }
  ],
  drawings: [
    { id: "P&ID-NP-014", title: "Pipe rack tie-in, bay 4", rev: "Rev C", by: "ilma", date: "Sep 8", project: "np", kind: "P&ID" },
    { id: "ISO-NP-221", title: "Line 6\"-HC-221 isometric", rev: "Rev B", by: "ilma", date: "Sep 2", project: "np", kind: "Isometric" },
    { id: "GA-C3-002", title: "Tank T-2 general arrangement", rev: "Rev A", by: "ilma", date: "Aug 18", project: "c3", kind: "GA" }
  ],

  hiring: {
    jobs: [{ title: "Crane operator (contract)", site: "North Pad", open: 1, apps: 9 }, { title: "Journeyman welder", site: "North Pad", open: 2, apps: 14 }, { title: "Safety coordinator", site: "Camp 3", open: 1, apps: 5 }],
    pipe: { Applied: [["Owen Price", "Journeyman welder"], ["Hana Sato", "Safety coordinator"], ["Luis Mora", "Journeyman welder"]], Screening: [["Ava Brooks", "Safety coordinator"], ["Kofi Mensah", "Journeyman welder"]], Interview: [["Ben Clark", "Journeyman welder"]], Offer: [["Lina Ortiz", "Crane operator (contract)"]] }
  },
  cases: [
    { kind: "Offboarding", who: "markj", date: "Last day Sep 30", done: 1, total: 5, owner: "sarah" },
    { kind: "Onboarding", who: "lina", date: "Starts Oct 3", done: 2, total: 6, owner: "daman" },
    { kind: "Onboarding", who: "aiden", date: "Started May 2", done: 6, total: 6, owner: "daman" }
  ],
  reviews: [["mark", "Self review done", "Manager review due Sep 30"], ["tom", "Not started", "Self review due Sep 20"], ["ilma", "Calibrated", "Shared"], ["markj", "Skipped", "Offboarding"]],

  notifications: [
    { m: "hse", t: "INC-112 escalated to High", s: "Gas reading above limit · North Pad", ago: "18m", unread: true, go: "#/hse/incidents/INC-112" },
    { m: "eng", t: "Ryan submitted WO-214 for approval", s: "Pipe rack tie-in · Sep 19 – 23", ago: "5h", unread: true, go: "#/home" },
    { m: "courses", t: "Your First Aid expires in 12 days", s: "Book a renewal session", ago: "1d", unread: true, go: "#/courses/certificates" },
    { m: "hr", t: "Daman sent an offboarding request", s: "Mark Jeferson · last day Sep 30", ago: "1d", unread: false, go: "#/home" },
    { m: "hse", t: "Inspection INSP-78 tomorrow", s: "Scaffold inspection, pipe rack", ago: "2d", unread: false, go: "#/hse/inspections" },
    { m: "hr", t: "Maya Patel wants to connect", s: "Northwind Energy · HR", ago: "3d", unread: false, go: "#/hr/partners" }
  ],
  /* Calendar, week of Mon 12 – Sun 18 Sep 2022. day 0 = Mon; start/end in hours */
  events: [
    { d: 0, s: 6, e: 18, t: "Day shift · North Pad", k: "shift" }, { d: 1, s: 6, e: 18, t: "Day shift · North Pad", k: "shift" }, { d: 2, s: 6, e: 18, t: "Day shift · North Pad", k: "shift" },
    { d: 3, s: 8, e: 16.5, t: "H2S Alive renewal · Fort McMurray", k: "session" }, { d: 4, s: 6, e: 18, t: "Day shift · North Pad", k: "shift" },
    { d: 2, s: 9, e: 11, t: "INSP-78 Scaffold inspection", k: "insp" }, { d: 3, s: 13, e: 15, t: "INSP-79 Weekly site walk", k: "insp" },
    { d: 1, s: 13, e: 14, t: "Toolbox talk: line breaks", k: "meet" }, { d: 5, s: 0, e: 0, t: "", k: "" }
  ],
  threads: [
    { id: "t1", name: "North Pad crew", kind: "group", c: "#2563EB", last: "Daniel: gas test before line break, no exceptions", msgs: [["daniel", "Morning all, reminder: gas test before any line break today."], ["mark", "Copy. Monitor #17 was acting up yesterday though."], ["daniel", "Swap it at the tool crib, I've raised CA-41 to get it fixed."], ["daniel", "Gas test before line break, no exceptions"]] },
    { id: "t2", name: "INC-112 · Gas reading", kind: "record", c: "#C81E1E", ctx: "#/hse/incidents/INC-112", last: "Ryan: JSA template updated", msgs: [["daniel", "Starting the investigation, who was on the line break?"], ["mark", "Me and Aiden. Alarm went at 12 ppm."], ["ryan", "JSA template updated with a mandatory gas test step."]] },
    { id: "t3", name: "Ryan Mitchell", kind: "dm", c: "#7A5AF8", last: "Can you approve WO-214 today?", msgs: [["ryan", "Hi Graham, can you approve WO-214 today? Crane is booked from the 19th."]] },
    { id: "t4", name: "Sarah Lim", kind: "dm", c: "#E2558E", last: "Lina's offer is signed 🎉", msgs: [["sarah", "Lina's offer is signed, onboarding starts Oct 3."]] }
  ]
};
