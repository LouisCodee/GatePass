/* ==========================================================================
   Gate Pass Management System (GPMS) — Master JavaScript Engine
   Supports all 21 Page Specifications, 7 Process Modules, & 8 User Roles
   ========================================================================== */

// --- 1. STATE STORE & MOCK DATABASE ---
let currentRole = 'frontdesk'; // Default role: Front Desk Officer
let activePassId = 'GP-2026-0891';
let isCanvasInitialized = false;
let canvasCtx = null;
let isDrawing = false;
let segregationOverride = false; // Admin FR-5.3 override toggle

// Sample Initial Database of Gate Passes matching Data Dictionary (§8)
const gatePassesDB = [
  {
    serialNo: 'GP-2026-0891',
    dateIssued: '2026-09-04 09:30',
    clientName: 'Apex Robotics Ltd.',
    clientContact: 'contact@apexrobotics.com • +254 712 345 678',
    jobCardNo: 'WO-9942-B',
    paymentReceiptNo: 'REC-77391',
    department: 'Precision Engineering Lab',
    items: [
      { desc: 'CNC Milled Aluminum Robot Arm Joint', qty: 2 },
      { desc: 'Custom Servo Controller PCB Assembly', qty: 1 }
    ],
    status: 'Pending Payment Verification',
    paymentDetails: { verified: false, amountDue: 450.00, verifiedBy: null, verifiedAt: null },
    checklist: { completed: false, verifiedBy: null, verifiedAt: null },
    clientSignature: null,
    dispute: null,
    approvals: {
      workshop: { status: 'Pending', user: null, date: null },
      coordinator: { status: 'Pending', user: null, date: null },
      accounts: { status: 'Pending', user: null, date: null }
    },
    releaseInfo: { releasedAt: null, securityUser: null, receivingClient: 'Alex Vance', receivingSignature: null },
    auditTrail: [
      { timestamp: '2026-09-04 09:30', user: 'Front Desk Officer (Sarah Jenkins)', action: 'Created Gate Pass record', note: 'Status set to Pending Payment Verification' }
    ]
  },
  {
    serialNo: 'GP-2026-0892',
    dateIssued: '2026-09-04 10:15',
    clientName: 'BioMed Systems Corp.',
    clientContact: 'info@biomed.co • +254 722 987 654',
    jobCardNo: 'WO-8831-C',
    paymentReceiptNo: 'REC-77402',
    department: 'Biomedical Instruments Lab',
    items: [
      { desc: 'Centrifuge Motor Calibrated Head', qty: 1 }
    ],
    status: 'Payment Verified',
    paymentDetails: { verified: true, amountDue: 0.00, verifiedBy: 'Accounts Officer (David Miller)', verifiedAt: '2026-09-04 10:45' },
    checklist: { completed: false, verifiedBy: null, verifiedAt: null },
    clientSignature: null,
    dispute: null,
    approvals: {
      workshop: { status: 'Pending', user: null, date: null },
      coordinator: { status: 'Pending', user: null, date: null },
      accounts: { status: 'Approved', user: 'Accounts Officer (David Miller)', date: '2026-09-04 10:45' }
    },
    releaseInfo: { releasedAt: null, securityUser: null, receivingClient: 'Dr. Helen Vance', receivingSignature: null },
    auditTrail: [
      { timestamp: '2026-09-04 10:15', user: 'Front Desk Officer (Sarah Jenkins)', action: 'Created Gate Pass record' },
      { timestamp: '2026-09-04 10:45', user: 'Accounts Officer (David Miller)', action: 'Verified full payment against Receipt REC-77402' }
    ]
  },
  {
    serialNo: 'GP-2026-0893',
    dateIssued: '2026-09-03 14:20',
    clientName: 'Quantum Tech Inc.',
    clientContact: 'logistics@quantum.io • +254 733 112 233',
    jobCardNo: 'WO-7712-A',
    paymentReceiptNo: 'REC-77210',
    department: 'Electronics Testing Workshop',
    items: [
      { desc: 'Optoelectronics Laser Diode Array', qty: 4 },
      { desc: 'Fiber Optics Test Enclosure', qty: 1 }
    ],
    status: 'Pre-Release Verified',
    paymentDetails: { verified: true, amountDue: 0.00, verifiedBy: 'Accounts Officer (David Miller)', verifiedAt: '2026-09-03 15:00' },
    checklist: { completed: true, verifiedBy: 'Workshop Manager (Dr. Robert Chen)', verifiedAt: '2026-09-03 16:30' },
    clientSignature: null,
    dispute: null,
    approvals: {
      workshop: { status: 'Approved', user: 'Workshop Manager (Dr. Robert Chen)', date: '2026-09-03 16:30' },
      coordinator: { status: 'Pending', user: null, date: null },
      accounts: { status: 'Approved', user: 'Accounts Officer (David Miller)', date: '2026-09-03 15:00' }
    },
    releaseInfo: { releasedAt: null, securityUser: null, receivingClient: 'Marcus Brody', receivingSignature: null },
    auditTrail: [
      { timestamp: '2026-09-03 14:20', user: 'Front Desk Officer', action: 'Created Gate Pass' },
      { timestamp: '2026-09-03 15:00', user: 'Accounts Officer', action: 'Payment verified' },
      { timestamp: '2026-09-03 16:30', user: 'Workshop Manager', action: 'Pre-release checklist completed & specification approved' }
    ]
  },
  {
    serialNo: 'GP-2026-0894',
    dateIssued: '2026-09-03 11:00',
    clientName: 'Solar Dynamics',
    clientContact: 'ops@solardynamics.org • +254 700 555 444',
    jobCardNo: 'WO-6623-D',
    paymentReceiptNo: 'REC-77199',
    department: 'Renewable Energy Systems Lab',
    items: [
      { desc: '5kW Inverter Sub-assembly Refurbished', qty: 2 }
    ],
    status: 'Approved – Ready for Exit',
    paymentDetails: { verified: true, amountDue: 0.00, verifiedBy: 'Accounts Officer', verifiedAt: '2026-09-03 11:30' },
    checklist: { completed: true, verifiedBy: 'Workshop Manager', verifiedAt: '2026-09-03 12:00' },
    clientSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M 10 30 Q 50 10 90 35 T 180 20" stroke="blue" fill="none" stroke-width="2"/></svg>',
    dispute: null,
    approvals: {
      workshop: { status: 'Approved', user: 'Workshop Manager (Dr. Robert Chen)', date: '2026-09-03 12:00' },
      coordinator: { status: 'Approved', user: 'Coordinator (Jane Doe)', date: '2026-09-03 13:15' },
      accounts: { status: 'Approved', user: 'Accounts Officer (David Miller)', date: '2026-09-03 11:30' }
    },
    releaseInfo: { releasedAt: null, securityUser: null, receivingClient: 'Paul Solar', receivingSignature: null },
    auditTrail: [
      { timestamp: '2026-09-03 11:00', user: 'Front Desk Officer', action: 'Created Gate Pass' },
      { timestamp: '2026-09-03 11:30', user: 'Accounts Officer', action: 'Payment verified' },
      { timestamp: '2026-09-03 12:00', user: 'Workshop Manager', action: 'Pre-release checklist completed' },
      { timestamp: '2026-09-03 12:30', user: 'Client (Paul Solar)', action: 'Digitally signed inspection sign-off' },
      { timestamp: '2026-09-03 13:15', user: 'Coordinator', action: 'Final approval granted — Status: Approved – Ready for Exit' }
    ]
  },
  {
    serialNo: 'GP-2026-0895',
    dateIssued: '2026-09-02 08:30',
    clientName: 'Zenith Aerospace',
    clientContact: 'quality@zenithaero.com • +254 711 000 999',
    jobCardNo: 'WO-5541-E',
    paymentReceiptNo: 'REC-77050',
    department: 'Avionics & Hydraulics Dept',
    items: [
      { desc: 'Hydraulic Actuator Pump Valve Assembly', qty: 3 }
    ],
    status: 'Released',
    paymentDetails: { verified: true, amountDue: 0.00, verifiedBy: 'Accounts Officer', verifiedAt: '2026-09-02 09:00' },
    checklist: { completed: true, verifiedBy: 'Workshop Manager', verifiedAt: '2026-09-02 09:30' },
    clientSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M 10 25 Q 60 40 110 15 T 190 30" stroke="navy" fill="none" stroke-width="2"/></svg>',
    dispute: null,
    approvals: {
      workshop: { status: 'Approved', user: 'Workshop Manager', date: '2026-09-02 09:30' },
      coordinator: { status: 'Approved', user: 'Coordinator', date: '2026-09-02 10:00' },
      accounts: { status: 'Approved', user: 'Accounts Officer', date: '2026-09-02 09:00' }
    },
    releaseInfo: { releasedAt: '2026-09-02 11:45', securityUser: 'Officer John Gatekeeper', receivingClient: 'Capt. E. Vance', receivingSignature: 'Signed' },
    auditTrail: [
      { timestamp: '2026-09-02 08:30', user: 'Front Desk Officer', action: 'Created Gate Pass' },
      { timestamp: '2026-09-02 10:00', user: 'System', action: 'All 3 Approvals Recorded' },
      { timestamp: '2026-09-02 11:45', user: 'Security Officer (John Gatekeeper)', action: 'Exit Clearance Verified & Released at Gate' }
    ]
  }
];

// --- 2. INITIALIZATION & NAVIGATION ROUTER ---
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderDashboard();
  switchRole('frontdesk');
});

function setupEventListeners() {
  // Global shortcut (Ctrl+K or Cmd+K)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.getElementById('globalSearchInput')?.focus();
    }
  });

  // Global search input auto-filter
  document.getElementById('globalSearchInput')?.addEventListener('input', (e) => {
    const val = e.target.value.trim().toUpperCase();
    if (val.length > 2) {
      const match = gatePassesDB.find(p => p.serialNo.includes(val) || p.clientName.toUpperCase().includes(val) || p.jobCardNo.toUpperCase().includes(val));
      if (match) {
        navigateTo('PG-04', match.serialNo);
      }
    }
  });
}

function navigateTo(pageId, passId = null) {
  if (passId) {
    activePassId = passId;
  }

  // Hide all views
  const views = document.querySelectorAll('.page-view');
  views.forEach(v => v.classList.add('hidden'));

  // Show target view
  const target = document.getElementById(`view-${pageId}`);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('animate-fade-in');
  }

  // Update Page Select dropdown
  const select = document.getElementById('pageSelectDropdown');
  if (select) select.value = pageId;

  // Update Navigation Active State
  document.querySelectorAll('.nav-item-btn').forEach(btn => {
    if (btn.dataset.page === pageId) {
      btn.classList.add('bg-blue-600/20', 'text-blue-400', 'border', 'border-blue-500/30');
    } else {
      btn.classList.remove('bg-blue-600/20', 'text-blue-400', 'border', 'border-blue-500/30');
    }
  });

  // Update Header Breadcrumbs
  updateHeaderBreadcrumbs(pageId);

  // Trigger Page-Specific Renderers
  switch(pageId) {
    case 'PG-03': renderDashboard(); break;
    case 'PG-04': renderPassDetail(activePassId); break;
    case 'PG-05': renderSearchList(); break;
    case 'PG-06': renderNotifications(); break;
    case 'PG-08': resetNewPassForm(); break;
    case 'PG-09': renderPaymentQueue(); break;
    case 'PG-10': renderPreReleaseQueue(); break;
    case 'PG-11': renderClientKiosk(activePassId); break;
    case 'PG-13': renderApprovalsQueue(); break;
    case 'PG-14': resetGateScan(); break;
    case 'PG-15': renderExitClearance(activePassId); break;
    case 'PG-16': renderArchiveTable(); break;
    case 'PG-17': renderPrintablePass(activePassId); break;
    case 'PG-21': renderFullAuditLog(); break;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateHeaderBreadcrumbs(pageId) {
  const badge = document.getElementById('pageIdBadge');
  const title = document.getElementById('pageTitle');
  const subtitle = document.getElementById('pageSubtitle');
  const group = document.getElementById('pageGroupLabel');

  const specs = {
    'PG-01': { group: 'Shared Pages', title: 'Login Screen', sub: 'Authenticate staff user credentials (NFR-2)' },
    'PG-02': { group: 'Shared Pages', title: 'Forgot / Reset Password', sub: 'Self-service account access recovery' },
    'PG-03': { group: 'Shared Pages', title: 'Dashboard (Home)', sub: 'Single landing page summarizing current role action items' },
    'PG-04': { group: 'Shared Pages', title: 'Gate Pass Detail View', sub: 'Single source of truth record for gate pass lifecycle & audit trail' },
    'PG-05': { group: 'Shared Pages', title: 'Gate Pass Search / List', sub: 'Filter by status, client, date range, or job card reference' },
    'PG-06': { group: 'Shared Pages', title: 'Notifications Center', sub: 'In-app alert trail for holds, rejections, disputes, and approvals' },
    'PG-07': { group: 'Shared Pages', title: 'My Profile & Account Settings', sub: 'Manage user contact info and notification preferences' },
    'PG-08': { group: 'Module 1', title: 'New Gate Pass Form', sub: 'Capture intake details, job card, and line items (FR-1.1 - FR-1.11)' },
    'PG-09': { group: 'Module 2', title: 'Payment Verification Queue', sub: 'Accounts Officer queue for verifying payment receipts (FR-2.1)' },
    'PG-10': { group: 'Module 3', title: 'Pre-Release Verification Queue', sub: 'Workshop Manager quality & specification checklist (FR-3.1)' },
    'PG-11': { group: 'Module 4', title: 'Client Inspection & Signature Capture', sub: 'Staff-assisted kiosk screen with HTML5 canvas signature pad' },
    'PG-12': { group: 'Module 4', title: 'Raise a Dispute Modal', sub: 'Capture non-conformance reason to halt pass progression (FR-4.3)' },
    'PG-13': { group: 'Module 5', title: 'My Approvals Queue', sub: 'Three-stage segregation of duties sign-off queue (BR-4, FR-5.1)' },
    'PG-14': { group: 'Module 6', title: 'Gate Lookup & Scanner Terminal', sub: 'Security gate point-of-exit lookup and barcode/QR trigger' },
    'PG-15': { group: 'Module 6', title: 'Exit Clearance & Verification', sub: 'Confirm physical item match and execute final gate release' },
    'PG-16': { group: 'Module 7', title: 'Records Archive & Traceability', sub: 'Complete departmental digital copy retention & export (FR-7.1)' },
    'PG-17': { group: 'Module 7', title: 'Printable Gate Pass Layout', sub: 'Clean print-formatted document for physical filing (FR-7.3)' },
    'PG-18': { group: 'Administration', title: 'User Management', sub: 'System Administrator staff account management (UC-9)' },
    'PG-19': { group: 'Administration', title: 'Roles & Permissions Matrix', sub: 'Configure RBAC access and segregation of duties override' },
    'PG-20': { group: 'Administration', title: 'System Configuration', sub: 'Institutional rules, approval stages, and retention periods' },
    'PG-21': { group: 'Administration', title: 'Audit Log Viewer', sub: 'Immutable, cross-record system action log (FR-7.5, NFR-5)' }
  };

  if (specs[pageId]) {
    if (badge) badge.innerText = pageId;
    if (group) group.innerText = specs[pageId].group;
    if (title) title.innerText = specs[pageId].title;
    if (subtitle) subtitle.innerText = specs[pageId].sub;
  }
}

// --- 3. ROLE SWITCHER & ACCESS CONTROL ---
function toggleRoleMenu() {
  const menu = document.getElementById('roleDropdownMenu');
  if (menu) menu.classList.toggle('hidden');
}

function switchRole(roleId) {
  currentRole = roleId;
  const roleNames = {
    frontdesk: 'Front Desk Officer',
    accounts: 'Accounts Officer',
    workshop: 'Workshop Manager',
    coordinator: 'Consultancy Coordinator',
    client: 'Client (Kiosk View)',
    security: 'Security Personnel',
    records: 'Records Officer',
    admin: 'System Administrator'
  };

  const label = document.getElementById('currentRoleLabel');
  if (label) label.innerText = roleNames[roleId] || roleId;

  // Close dropdown menu
  document.getElementById('roleDropdownMenu')?.classList.add('hidden');

  showToast(`Switched active user role to: ${roleNames[roleId]}`, 'info');

  // Role-based view redirect logic (SRS PG-01 Note)
  if (roleId === 'security') {
    navigateTo('PG-14');
  } else if (roleId === 'client') {
    navigateTo('PG-11', activePassId);
  } else {
    // If currently on Detail page, re-render action toolbar
    const detailView = document.getElementById('view-PG-04');
    if (detailView && !detailView.classList.contains('hidden')) {
      renderPassDetail(activePassId);
    } else {
      renderDashboard();
    }
  }
}

// --- 4. PAGE RENDERERS ---

// PG-03: Dashboard Renderer
function renderDashboard() {
  // Update badge stats
  const pendingPayment = gatePassesDB.filter(p => p.status === 'Pending Payment Verification').length;
  const preRelease = gatePassesDB.filter(p => p.status === 'Payment Verified').length;
  const pendingApprovals = gatePassesDB.filter(p => p.status === 'Client Acknowledged' || p.status === 'Pre-Release Verified').length;
  const readyExit = gatePassesDB.filter(p => p.status === 'Approved – Ready for Exit').length;

  document.getElementById('dashStatPayment').innerText = pendingPayment;
  document.getElementById('dashStatPreRelease').innerText = preRelease;
  document.getElementById('dashStatApprovals').innerText = pendingApprovals;
  document.getElementById('dashStatReadyExit').innerText = readyExit;

  // Render Table
  const tbody = document.getElementById('dashTableBody');
  if (tbody) {
    tbody.innerHTML = gatePassesDB.map(pass => `
      <tr class="hover:bg-slate-800/40 transition-colors cursor-pointer" onclick="navigateTo('PG-04', '${pass.serialNo}')">
        <td class="py-3 px-3 font-mono-code font-bold text-blue-400">${pass.serialNo}</td>
        <td class="py-3 px-3 font-medium text-slate-200">${pass.clientName}</td>
        <td class="py-3 px-3 font-mono text-slate-400">${pass.jobCardNo}</td>
        <td class="py-3 px-3">${getStatusBadgeHTML(pass.status)}</td>
        <td class="py-3 px-3 text-right">
          <button class="text-xs text-blue-400 hover:underline">View →</button>
        </td>
      </tr>
    `).join('');
  }

  // Render Activity Stream
  const activityStream = document.getElementById('dashActivityStream');
  if (activityStream) {
    const allEvents = [];
    gatePassesDB.forEach(p => {
      p.auditTrail.forEach(e => {
        allEvents.push({ pass: p.serialNo, ...e });
      });
    });
    allEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    activityStream.innerHTML = allEvents.slice(0, 5).map(ev => `
      <div class="p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-1 text-xs">
        <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span class="text-blue-400 font-semibold">${ev.pass}</span>
          <span>${ev.timestamp}</span>
        </div>
        <p class="font-medium text-slate-300">${ev.action}</p>
        <p class="text-[11px] text-slate-500">By ${ev.user}</p>
      </div>
    `).join('');
  }
}

// Helper: Status Badge HTML Generator
function getStatusBadgeHTML(status) {
  const classMap = {
    'Draft': 'badge-draft',
    'Pending Payment Verification': 'badge-pending',
    'Payment Verified': 'badge-verified',
    'Pre-Release Verified': 'badge-verified',
    'Client Acknowledged': 'badge-acknowledged',
    'Approved – Ready for Exit': 'badge-approved',
    'Released': 'badge-released',
    'On Hold': 'badge-hold',
    'Disputed': 'badge-disputed',
    'Rejected': 'badge-rejected',
    'Archived': 'badge-archived'
  };
  const cls = classMap[status] || 'badge-draft';
  return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${cls}">${status}</span>`;
}

// PG-04: Gate Pass Detail Renderer
function renderPassDetail(serialNo) {
  const pass = gatePassesDB.find(p => p.serialNo === serialNo) || gatePassesDB[0];
  activePassId = pass.serialNo;

  document.getElementById('detailSerialNo').innerText = pass.serialNo;
  document.getElementById('detailStatusBadge').outerHTML = `<span id="detailStatusBadge" class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeHTML(pass.status).match(/badge-[a-z]+/)[0]}">${pass.status}</span>`;
  document.getElementById('detailDateIssued').innerText = pass.dateIssued;
  document.getElementById('detailDept').innerText = pass.department || 'Main Workshop';
  document.getElementById('detailClientName').innerText = pass.clientName;
  document.getElementById('detailClientContact').innerText = pass.clientContact;
  document.getElementById('detailJobCard').innerText = pass.jobCardNo;
  document.getElementById('detailPaymentRef').innerHTML = `Receipt Ref: <span class="font-mono text-slate-300">${pass.paymentReceiptNo}</span>`;
  
  document.getElementById('detailReleaseTime').innerText = pass.releaseInfo.releasedAt ? pass.releaseInfo.releasedAt : 'Not Released Yet';
  document.getElementById('detailReceivingClient').innerHTML = `Receiving Client: <span class="text-slate-300 font-semibold">${pass.releaseInfo.receivingClient || 'Unsigned'}</span>`;

  // Render Items Table
  const itemsTbody = document.getElementById('detailItemsTbody');
  if (itemsTbody) {
    itemsTbody.innerHTML = pass.items.map((item, idx) => `
      <tr>
        <td class="py-2.5 px-4 font-mono text-slate-500">${idx + 1}</td>
        <td class="py-2.5 px-4 font-medium text-slate-200">${item.desc}</td>
        <td class="py-2.5 px-4 text-right font-mono text-blue-400 font-semibold">${item.qty}</td>
      </tr>
    `).join('');
  }

  // Render Module 5 Approval Statuses
  renderApprovalCard('workshop', pass.approvals.workshop);
  renderApprovalCard('coordinator', pass.approvals.coordinator);
  renderApprovalCard('accounts', pass.approvals.accounts);

  // Render Timeline
  const timeline = document.getElementById('detailTimelineContainer');
  if (timeline) {
    timeline.innerHTML = pass.auditTrail.map(evt => `
      <div class="relative pl-3 space-y-0.5">
        <span class="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-slate-900"></span>
        <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span class="font-semibold text-slate-300">${evt.user}</span>
          <span>${evt.timestamp}</span>
        </div>
        <p class="text-xs text-slate-300 font-medium">${evt.action}</p>
        ${evt.note ? `<p class="text-[11px] text-slate-400 italic">${evt.note}</p>` : ''}
      </div>
    `).join('');
  }

  // Render Contextual Toolbar based on Role & Status
  renderContextualToolbar(pass);
}

function renderApprovalCard(roleKey, approvalObj) {
  const badge = document.getElementById(`appBadge-${roleKey}`);
  const text = document.getElementById(`appText-${roleKey}`);
  
  if (approvalObj.status === 'Approved') {
    if (badge) { badge.className = 'text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-semibold'; badge.innerText = 'Approved'; }
    if (text) text.innerHTML = `<span class="text-emerald-400 font-medium">${approvalObj.user}</span> • ${approvalObj.date}`;
  } else if (approvalObj.status === 'Rejected') {
    if (badge) { badge.className = 'text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono font-semibold'; badge.innerText = 'Rejected'; }
    if (text) text.innerHTML = `<span class="text-rose-400 font-medium">${approvalObj.user}</span> • Rejected`;
  } else {
    if (badge) { badge.className = 'text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono'; badge.innerText = 'Pending'; }
    if (text) text.innerText = 'Awaiting verification';
  }
}

function renderContextualToolbar(pass) {
  const toolbar = document.getElementById('detailActionToolbar');
  if (!toolbar) return;

  let html = `<button onclick="navigateTo('PG-17', '${pass.serialNo}')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center space-x-1.5"><svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg><span>Print / PDF</span></button>`;

  // Accounts Action: Confirm Payment (Module 2)
  if ((currentRole === 'accounts' || currentRole === 'admin') && pass.status === 'Pending Payment Verification') {
    html += `<button onclick="actionConfirmPayment('${pass.serialNo}')" class="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/20">Confirm Payment (Mod 2)</button>`;
  }

  // Workshop Action: Pre-Release Checklist (Module 3)
  if ((currentRole === 'workshop' || currentRole === 'admin') && pass.status === 'Payment Verified') {
    html += `<button onclick="actionCompleteChecklist('${pass.serialNo}')" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20">Complete Pre-Release Checklist (Mod 3)</button>`;
  }

  // Client Action: Inspection Sign-off (Module 4)
  if ((currentRole === 'client' || currentRole === 'frontdesk' || currentRole === 'admin') && pass.status === 'Pre-Release Verified') {
    html += `<button onclick="navigateTo('PG-11', '${pass.serialNo}')" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/20">Client Kiosk Sign-off (Mod 4)</button>`;
  }

  // Approver Action: Module 5 Approvals
  if (pass.status === 'Client Acknowledged' || pass.status === 'Pre-Release Verified') {
    if (currentRole === 'workshop' && pass.approvals.workshop.status === 'Pending') {
      html += `<button onclick="actionApprovePass('${pass.serialNo}', 'workshop')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl">Approve as Workshop Mgr</button>`;
    }
    if (currentRole === 'coordinator' && pass.approvals.coordinator.status === 'Pending') {
      html += `<button onclick="actionApprovePass('${pass.serialNo}', 'coordinator')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl">Approve as Coordinator</button>`;
    }
    if (currentRole === 'accounts' && pass.approvals.accounts.status === 'Pending') {
      html += `<button onclick="actionApprovePass('${pass.serialNo}', 'accounts')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl">Approve as Accounts Officer</button>`;
    }
  }

  // Security Action: Exit Clearance (Module 6)
  if ((currentRole === 'security' || currentRole === 'admin') && pass.status === 'Approved – Ready for Exit') {
    html += `<button onclick="navigateTo('PG-15', '${pass.serialNo}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30">Proceed to Exit Clearance (Mod 6)</button>`;
  }

  toolbar.innerHTML = html;
}

// PG-05: Search / List Renderer
function renderSearchList() {
  filterPassList();
}

function filterPassList() {
  const query = document.getElementById('listFilterSearch')?.value.trim().toUpperCase() || '';
  const statusFilter = document.getElementById('listFilterStatus')?.value || 'ALL';

  const filtered = gatePassesDB.filter(p => {
    const matchesQuery = p.serialNo.includes(query) || p.clientName.toUpperCase().includes(query) || p.jobCardNo.toUpperCase().includes(query);
    const matchesStatus = (statusFilter === 'ALL') || (p.status === statusFilter) || (statusFilter === 'On Hold' && (p.status === 'On Hold' || p.status === 'Disputed'));
    return matchesQuery && matchesStatus;
  });

  const tbody = document.getElementById('listTableBody');
  if (tbody) {
    tbody.innerHTML = filtered.map(pass => `
      <tr class="hover:bg-slate-800/40 transition-colors">
        <td class="py-3 px-4 font-mono-code font-bold text-blue-400">${pass.serialNo}</td>
        <td class="py-3 px-4 text-slate-400 font-mono">${pass.dateIssued}</td>
        <td class="py-3 px-4 font-medium text-slate-200">${pass.clientName}</td>
        <td class="py-3 px-4 font-mono text-slate-400">${pass.jobCardNo}</td>
        <td class="py-3 px-4">${getStatusBadgeHTML(pass.status)}</td>
        <td class="py-3 px-4 text-right">
          <button onclick="navigateTo('PG-04', '${pass.serialNo}')" class="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-xs transition-colors">Details →</button>
        </td>
      </tr>
    `).join('');
  }
}

// PG-06: Notifications Renderer
function renderNotifications() {
  const container = document.getElementById('notifListContainer');
  if (!container) return;

  const notifs = [
    { id: 1, title: 'Dispute Raised by Client', desc: 'Apex Robotics flagged spec mismatch on GP-2026-0891.', time: '10 mins ago', type: 'rose', unread: true },
    { id: 2, title: 'Payment Verification Needed', desc: 'Pass GP-2026-0891 requires receipt REC-77391 confirmation.', time: '1 hour ago', type: 'amber', unread: true },
    { id: 3, title: 'Ready for Security Exit', desc: 'Pass GP-2026-0894 approved by all 3 officers.', time: '2 hours ago', type: 'emerald', unread: false }
  ];

  container.innerHTML = notifs.map(n => `
    <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between space-x-3 ${n.unread ? 'ring-1 ring-blue-500/30' : 'opacity-75'}">
      <div class="flex items-start space-x-3">
        <div class="w-2 h-2 rounded-full mt-1.5 ${n.unread ? 'bg-blue-400' : 'bg-slate-600'}"></div>
        <div>
          <h4 class="text-xs font-semibold text-white">${n.title}</h4>
          <p class="text-xs text-slate-400 mt-0.5">${n.desc}</p>
          <span class="text-[10px] text-slate-500 font-mono mt-1 block">${n.time}</span>
        </div>
      </div>
      <button onclick="this.closest('div').remove()" class="text-slate-600 hover:text-slate-400 text-xs">Dismiss</button>
    </div>
  `).join('');
}

function markAllNotificationsRead() {
  document.getElementById('unreadNotifBadge')?.classList.add('hidden');
  showToast('All notifications marked as read', 'info');
}

// PG-08: New Gate Pass Form Logic (Module 1)
function resetNewPassForm() {
  const autoNo = `GP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const badge = document.getElementById('newAutoSerialNo');
  if (badge) badge.innerText = `Serial No: ${autoNo}`;
}

function addNewItemRow() {
  const container = document.getElementById('newItemRowsContainer');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'flex items-center gap-3 item-line-row animate-fade-in';
  row.innerHTML = `
    <input type="text" required placeholder="Item description..." class="item-desc flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200">
    <input type="number" min="1" value="1" required class="item-qty w-24 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-center">
    <button type="button" onclick="removeItemRow(this)" class="p-2 text-slate-500 hover:text-rose-400"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
  `;
  container.appendChild(row);
}

function removeItemRow(btn) {
  const rows = document.querySelectorAll('.item-line-row');
  if (rows.length > 1) {
    btn.closest('.item-line-row').remove();
  } else {
    showToast('At least one line item is required per gate pass (FR-1.6)', 'warning');
  }
}

function handleCreateGatePass(event) {
  event.preventDefault();

  const clientName = document.getElementById('newClientName').value.trim();
  const clientContact = document.getElementById('newClientContact').value.trim();
  const jobCardNo = document.getElementById('newJobCardNo').value.trim();
  const paymentReceiptNo = document.getElementById('newPaymentReceiptNo').value.trim();

  const itemRows = document.querySelectorAll('.item-line-row');
  const items = [];
  itemRows.forEach(r => {
    const desc = r.querySelector('.item-desc').value.trim();
    const qty = parseInt(r.querySelector('.item-qty').value) || 1;
    if (desc) items.push({ desc, qty });
  });

  const newSerialNo = `GP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const newPass = {
    serialNo: newSerialNo,
    dateIssued: now,
    clientName,
    clientContact,
    jobCardNo,
    paymentReceiptNo,
    department: 'Main Processing Workshop',
    items,
    status: 'Pending Payment Verification',
    paymentDetails: { verified: false, amountDue: 250.00, verifiedBy: null, verifiedAt: null },
    checklist: { completed: false, verifiedBy: null, verifiedAt: null },
    clientSignature: null,
    dispute: null,
    approvals: {
      workshop: { status: 'Pending', user: null, date: null },
      coordinator: { status: 'Pending', user: null, date: null },
      accounts: { status: 'Pending', user: null, date: null }
    },
    releaseInfo: { releasedAt: null, securityUser: null, receivingClient: clientName, receivingSignature: null },
    auditTrail: [
      { timestamp: now, user: `Front Desk Officer (${currentRole})`, action: 'Created new Gate Pass record', note: `Assigned Serial ${newSerialNo}` }
    ]
  };

  gatePassesDB.unshift(newPass);
  showToast(`Gate Pass ${newSerialNo} created successfully!`, 'success');
  navigateTo('PG-04', newSerialNo);
}

// PG-09: Payment Queue Renderer
function renderPaymentQueue() {
  const queue = gatePassesDB.filter(p => p.status === 'Pending Payment Verification');
  const tbody = document.getElementById('paymentQueueTbody');
  if (tbody) {
    tbody.innerHTML = queue.map(p => `
      <tr class="hover:bg-slate-800/40">
        <td class="py-3 px-4 font-mono-code font-bold text-amber-400">${p.serialNo}</td>
        <td class="py-3 px-4 text-slate-200 font-medium">${p.clientName}</td>
        <td class="py-3 px-4 font-mono text-slate-400">${p.jobCardNo}</td>
        <td class="py-3 px-4 font-mono text-slate-300">${p.paymentReceiptNo}</td>
        <td class="py-3 px-4 text-right">
          <button onclick="actionConfirmPayment('${p.serialNo}')" class="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold">Verify Payment</button>
        </td>
      </tr>
    `).join('');
  }
}

function actionConfirmPayment(serialNo) {
  const pass = gatePassesDB.find(p => p.serialNo === serialNo);
  if (pass) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    pass.status = 'Payment Verified';
    pass.paymentDetails.verified = true;
    pass.paymentDetails.verifiedBy = `Accounts Officer (${currentRole})`;
    pass.paymentDetails.verifiedAt = now;
    pass.approvals.accounts = { status: 'Approved', user: `Accounts Officer (${currentRole})`, date: now };
    pass.auditTrail.unshift({ timestamp: now, user: `Accounts Officer (${currentRole})`, action: `Verified full payment against receipt ${pass.paymentReceiptNo}` });
    
    showToast(`Payment verified for ${serialNo}. Advanced to "Payment Verified".`, 'success');
    renderPassDetail(serialNo);
  }
}

// PG-10: Pre-Release Queue Renderer
function renderPreReleaseQueue() {
  const queue = gatePassesDB.filter(p => p.status === 'Payment Verified');
  const tbody = document.getElementById('preReleaseQueueTbody');
  if (tbody) {
    tbody.innerHTML = queue.map(p => `
      <tr class="hover:bg-slate-800/40">
        <td class="py-3 px-4 font-mono-code font-bold text-blue-400">${p.serialNo}</td>
        <td class="py-3 px-4 text-slate-200 font-medium">${p.clientName}</td>
        <td class="py-3 px-4 font-mono text-slate-400">${p.jobCardNo}</td>
        <td class="py-3 px-4">${getStatusBadgeHTML(p.status)}</td>
        <td class="py-3 px-4 text-right">
          <button onclick="actionCompleteChecklist('${p.serialNo}')" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold">Complete Checklist</button>
        </td>
      </tr>
    `).join('');
  }
}

function actionCompleteChecklist(serialNo) {
  const pass = gatePassesDB.find(p => p.serialNo === serialNo);
  if (pass) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    pass.status = 'Pre-Release Verified';
    pass.checklist.completed = true;
    pass.checklist.verifiedBy = `Workshop Manager (${currentRole})`;
    pass.checklist.verifiedAt = now;
    pass.approvals.workshop = { status: 'Approved', user: `Workshop Manager (${currentRole})`, date: now };
    pass.auditTrail.unshift({ timestamp: now, user: `Workshop Manager (${currentRole})`, action: 'Completed pre-release quality checklist (FR-3.1)' });

    showToast(`Pre-release checklist verified for ${serialNo}.`, 'success');
    renderPassDetail(serialNo);
  }
}

// PG-11: Client Kiosk & Canvas Signature Logic (Module 4)
function renderClientKiosk(serialNo) {
  const pass = gatePassesDB.find(p => p.serialNo === serialNo) || gatePassesDB[0];
  activePassId = pass.serialNo;

  document.getElementById('kioskSerialNo').innerText = pass.serialNo;
  document.getElementById('kioskJobCard').innerText = pass.jobCardNo;

  const itemsList = document.getElementById('kioskItemsList');
  if (itemsList) {
    itemsList.innerHTML = pass.items.map(i => `<div>• ${i.desc} (Qty: <strong>${i.qty}</strong>)</div>`).join('');
  }

  // Initialize Canvas
  setTimeout(() => initSignatureCanvas(), 100);
}

function initSignatureCanvas() {
  const canvas = document.getElementById('signatureCanvas');
  if (!canvas) return;

  canvasCtx = canvas.getContext('2d');
  canvasCtx.strokeStyle = '#3b82f6';
  canvasCtx.lineWidth = 3;
  canvasCtx.lineCap = 'round';

  if (isCanvasInitialized) return;
  isCanvasInitialized = true;

  const getCoords = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    isDrawing = true;
    const { x, y } = getCoords(e);
    canvasCtx.beginPath();
    canvasCtx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    canvasCtx.lineTo(x, y);
    canvasCtx.stroke();
  };

  const stopDraw = () => { isDrawing = false; };

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);

  canvas.addEventListener('touchstart', startDraw, { passive: true });
  canvas.addEventListener('touchmove', draw, { passive: true });
  canvas.addEventListener('touchend', stopDraw);
}

function clearSignatureCanvas() {
  const canvas = document.getElementById('signatureCanvas');
  if (canvas && canvasCtx) {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function submitClientSignature() {
  const pass = gatePassesDB.find(p => p.serialNo === activePassId);
  if (pass) {
    const canvas = document.getElementById('signatureCanvas');
    const signatureData = canvas ? canvas.toDataURL() : 'digital-signature-captured';
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    pass.clientSignature = signatureData;
    pass.status = 'Client Acknowledged';
    pass.auditTrail.unshift({ timestamp: now, user: `Client (${pass.clientName})`, action: 'Digitally signed physical item inspection sign-off' });

    showToast('Client acknowledgment signature captured successfully!', 'success');
    navigateTo('PG-04', pass.serialNo);
  }
}

// PG-12: Dispute Logic
function openDisputeModal() {
  document.getElementById('disputeModal')?.classList.remove('hidden');
}

function closeDisputeModal() {
  document.getElementById('disputeModal')?.classList.add('hidden');
}

function submitDispute() {
  const pass = gatePassesDB.find(p => p.serialNo === activePassId);
  if (pass) {
    const category = document.getElementById('disputeCategory').value;
    const comment = document.getElementById('disputeComment').value.trim();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    pass.status = 'Disputed';
    pass.dispute = { category, comment, date: now };
    pass.auditTrail.unshift({ timestamp: now, user: `Client (${pass.clientName})`, action: `Raised Dispute: ${category}`, note: comment });

    closeDisputeModal();
    showToast(`Dispute raised on ${pass.serialNo}. Gate pass paused (FR-4.3).`, 'error');
    navigateTo('PG-04', pass.serialNo);
  }
}

// PG-13: Approvals Queue Renderer (Module 5)
function renderApprovalsQueue() {
  const queue = gatePassesDB.filter(p => p.status === 'Client Acknowledged' || p.status === 'Pre-Release Verified');
  const tbody = document.getElementById('approvalsQueueTbody');
  if (tbody) {
    tbody.innerHTML = queue.map(p => {
      const appCount = Object.values(p.approvals).filter(a => a.status === 'Approved').length;
      return `
        <tr class="hover:bg-slate-800/40">
          <td class="py-3 px-4 font-mono-code font-bold text-indigo-400">${p.serialNo}</td>
          <td class="py-3 px-4 text-slate-200 font-medium">${p.clientName}</td>
          <td class="py-3 px-4 font-mono">
            <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-xs font-semibold">${appCount} of 3 Recorded</span>
          </td>
          <td class="py-3 px-4">${getStatusBadgeHTML(p.status)}</td>
          <td class="py-3 px-4 text-right">
            <button onclick="navigateTo('PG-04', '${p.serialNo}')" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold">Review Pass →</button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function actionApprovePass(serialNo, roleKey) {
  const pass = gatePassesDB.find(p => p.serialNo === serialNo);
  if (pass) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    pass.approvals[roleKey] = { status: 'Approved', user: `${roleKey.toUpperCase()} Officer (${currentRole})`, date: now };
    pass.auditTrail.unshift({ timestamp: now, user: `${roleKey.toUpperCase()} Officer (${currentRole})`, action: `Granted Module 5 approval for ${roleKey}` });

    // Check if all 3 approvals complete (FR-5.5)
    const approvedCount = Object.values(pass.approvals).filter(a => a.status === 'Approved').length;
    if (approvedCount >= 3) {
      pass.status = 'Approved – Ready for Exit';
      pass.auditTrail.unshift({ timestamp: now, user: 'System Engine', action: 'All 3 approvals complete. Status advanced to Approved – Ready for Exit' });
      showToast(`All 3 approvals recorded for ${serialNo}! Ready for exit.`, 'success');
    } else {
      showToast(`Approval recorded (${approvedCount}/3 complete).`, 'info');
    }

    renderPassDetail(serialNo);
  }
}

// PG-14 & PG-15: Gate Security Scanner & Clearance Terminal (Module 6)
function resetGateScan() {
  document.getElementById('gateScanInput').value = '';
}

function simulateQRScan() {
  const randomPass = gatePassesDB[Math.floor(Math.random() * gatePassesDB.length)];
  document.getElementById('gateScanInput').value = randomPass.serialNo;
  performGateLookup();
}

function performGateLookup() {
  const inputVal = document.getElementById('gateScanInput')?.value.trim().toUpperCase();
  if (!inputVal) {
    showToast('Please enter or scan a Gate Pass Serial Number', 'warning');
    return;
  }

  const pass = gatePassesDB.find(p => p.serialNo === inputVal || p.clientName.toUpperCase().includes(inputVal));
  if (pass) {
    navigateTo('PG-15', pass.serialNo);
  } else {
    showToast(`No Gate Pass found matching "${inputVal}"`, 'error');
  }
}

function renderExitClearance(serialNo) {
  const pass = gatePassesDB.find(p => p.serialNo === serialNo) || gatePassesDB[0];
  activePassId = pass.serialNo;

  const banner = document.getElementById('exitStatusBanner');
  const details = document.getElementById('exitPassDetails');

  // Security Alert Check (FR-6.2, FR-6.6)
  const isValidForExit = (pass.status === 'Approved – Ready for Exit');

  if (isValidForExit) {
    banner.innerHTML = `
      <div class="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl flex items-center space-x-3 text-emerald-400">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div>
          <h3 class="text-base font-display font-bold">APPROVED — VALID FOR EXIT CLEARANCE</h3>
          <p class="text-xs text-emerald-300/80">Pass ${pass.serialNo} has all 3 required approvals & verified payment.</p>
        </div>
      </div>
    `;
  } else {
    banner.innerHTML = `
      <div class="p-4 bg-rose-500/20 border-2 border-rose-500/60 rounded-2xl flex items-center space-x-3 text-rose-400 animate-alert-pulse">
        <div class="w-10 h-10 rounded-xl bg-rose-500/30 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div>
          <h3 class="text-base font-display font-bold">UNAUTHORIZED / INVALID PASS ALERT (FR-6.6)</h3>
          <p class="text-xs text-rose-300">Status is currently: "${pass.status}". Exit clearance CANNOT be granted!</p>
        </div>
      </div>
    `;
  }

  details.innerHTML = `
    <div class="grid grid-cols-2 gap-4 text-xs">
      <div>
        <span class="text-slate-500 uppercase font-mono-code text-[10px]">Client Name</span>
        <p class="font-semibold text-white text-sm">${pass.clientName}</p>
      </div>
      <div>
        <span class="text-slate-500 uppercase font-mono-code text-[10px]">Job Card</span>
        <p class="font-mono text-blue-400 font-semibold text-sm">${pass.jobCardNo}</p>
      </div>
    </div>

    <div class="space-y-2 pt-2 border-t border-slate-800">
      <h4 class="text-xs font-semibold text-slate-400 uppercase font-mono-code">Physical Items Checklist for Security Match (FR-6.3)</h4>
      <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
        ${pass.items.map(i => `
          <label class="flex items-center space-x-3 text-xs text-slate-200">
            <input type="checkbox" ${isValidForExit ? 'checked' : ''} class="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700">
            <span>Verify physical item: <strong>${i.desc}</strong> (Qty: ${i.qty})</span>
          </label>
        `).join('')}
      </div>
    </div>

    <div class="flex items-center justify-between pt-4 border-t border-slate-800">
      <button onclick="navigateTo('PG-14')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl">Back to Scanner</button>
      ${isValidForExit ? `
        <button onclick="confirmExitRelease('${pass.serialNo}')" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/30">
          Confirm Match & Release Exit (FR-6.7)
        </button>
      ` : `
        <button disabled class="px-6 py-3 bg-slate-800 text-slate-500 text-sm font-semibold rounded-xl cursor-not-allowed">
          Release Blocked by System
        </button>
      `}
    </div>
  `;
}

function confirmExitRelease(serialNo) {
  const pass = gatePassesDB.find(p => p.serialNo === serialNo);
  if (pass) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    pass.status = 'Released';
    pass.releaseInfo.releasedAt = now;
    pass.releaseInfo.securityUser = `Security Officer (${currentRole})`;
    pass.auditTrail.unshift({ timestamp: now, user: `Security Officer (${currentRole})`, action: 'Confirmed physical item match & released gate pass exit (FR-6.7)' });

    showToast(`Gate Pass ${serialNo} successfully RELEASED!`, 'success');
    renderExitClearance(serialNo);
  }
}

// PG-16: Records Archive Renderer
function renderArchiveTable() {
  const tbody = document.getElementById('archiveTableBody');
  if (tbody) {
    tbody.innerHTML = gatePassesDB.map(p => `
      <tr class="hover:bg-slate-800/40">
        <td class="py-3 px-4 font-mono-code font-bold text-cyan-400">${p.serialNo}</td>
        <td class="py-3 px-4 text-slate-400 font-mono">${p.dateIssued}</td>
        <td class="py-3 px-4 text-slate-200 font-medium">${p.clientName}</td>
        <td class="py-3 px-4 font-mono text-slate-400">${p.jobCardNo}</td>
        <td class="py-3 px-4">${getStatusBadgeHTML(p.status)}</td>
        <td class="py-3 px-4 text-right">
          <button onclick="navigateTo('PG-04', '${p.serialNo}')" class="text-xs text-blue-400 hover:underline">View Record</button>
        </td>
      </tr>
    `).join('');
  }
}

function exportPassesCSV() {
  let csv = 'Serial Number,Date Issued,Client Name,Job Card,Status\n';
  gatePassesDB.forEach(p => {
    csv += `"${p.serialNo}","${p.dateIssued}","${p.clientName}","${p.jobCardNo}","${p.status}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GPMS_Records_Archive_Export_${new Date().toISOString().substring(0, 10)}.csv`;
  a.click();

  showToast('Records Archive exported to CSV (FR-7.2)', 'success');
}

// PG-17: Printable Gate Pass Layout Renderer
function renderPrintablePass(serialNo) {
  const pass = gatePassesDB.find(p => p.serialNo === serialNo) || gatePassesDB[0];
  const container = document.getElementById('printablePassContent');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-300 pb-4">
      <div>
        <h2 class="text-2xl font-bold font-display text-slate-900">OFFICIAL GATE PASS</h2>
        <p class="text-xs text-slate-600">Gate Pass Management System — Authorised Release Copy</p>
      </div>
      <div class="text-right font-mono">
        <span class="text-lg font-bold text-slate-900 block">${pass.serialNo}</span>
        <span class="text-xs text-slate-500">Date: ${pass.dateIssued}</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6 text-xs text-slate-800">
      <div>
        <span class="font-bold text-slate-500 block uppercase">Client Information</span>
        <p class="font-semibold text-sm">${pass.clientName}</p>
        <p>${pass.clientContact}</p>
      </div>
      <div>
        <span class="font-bold text-slate-500 block uppercase">Reference Information</span>
        <p>Job Card No: <strong class="font-mono">${pass.jobCardNo}</strong></p>
        <p>Payment Receipt: <strong class="font-mono">${pass.paymentReceiptNo}</strong></p>
      </div>
    </div>

    <div class="space-y-2">
      <span class="font-bold text-slate-500 text-xs uppercase block">Item Description & Quantities</span>
      <table class="w-full text-left text-xs border border-slate-300 divide-y divide-slate-300">
        <thead class="bg-slate-100 font-bold text-slate-700">
          <tr>
            <th class="p-2">Item Description</th>
            <th class="p-2 text-right">Quantity</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          ${pass.items.map(i => `
            <tr>
              <td class="p-2">${i.desc}</td>
              <td class="p-2 text-right font-bold">${i.qty}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="pt-6 grid grid-cols-3 gap-4 text-center text-[11px] text-slate-700">
      <div class="border-t border-slate-400 pt-2">
        <span class="font-semibold block">Workshop Manager</span>
        <span class="text-[10px] text-slate-500">${pass.approvals.workshop.user || 'Pending'}</span>
      </div>
      <div class="border-t border-slate-400 pt-2">
        <span class="font-semibold block">Consultancy Coordinator</span>
        <span class="text-[10px] text-slate-500">${pass.approvals.coordinator.user || 'Pending'}</span>
      </div>
      <div class="border-t border-slate-400 pt-2">
        <span class="font-semibold block">Accounts Officer</span>
        <span class="text-[10px] text-slate-500">${pass.approvals.accounts.user || 'Pending'}</span>
      </div>
    </div>
  `;
}

// PG-21: Audit Log Viewer Renderer
function renderFullAuditLog() {
  const container = document.getElementById('fullAuditLogContainer');
  if (!container) return;

  const logs = [];
  gatePassesDB.forEach(p => {
    p.auditTrail.forEach(e => logs.push({ pass: p.serialNo, ...e }));
  });
  logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  container.innerHTML = logs.map(l => `
    <div class="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
      <div>
        <span class="text-blue-400 font-bold mr-2">[${l.pass}]</span>
        <span class="text-slate-200 font-medium">${l.action}</span>
        <span class="text-slate-500 text-[11px] ml-2">by ${l.user}</span>
      </div>
      <span class="text-slate-500 text-[11px] font-mono">${l.timestamp}</span>
    </div>
  `).join('');
}

// Toggle Segregation of Duties Override (Admin FR-5.3)
function toggleSegregationOverride(checked) {
  segregationOverride = checked;
  showToast(`Segregation of Duties Override: ${checked ? 'ENABLED' : 'DISABLED'}`, checked ? 'warning' : 'info');
}

// Toast Notifications System
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const colorMap = {
    info: 'bg-blue-600 text-white border-blue-400',
    success: 'bg-emerald-600 text-white border-emerald-400',
    warning: 'bg-amber-600 text-white border-amber-400',
    error: 'bg-rose-600 text-white border-rose-400'
  };

  const toast = document.createElement('div');
  toast.className = `px-4 py-3 rounded-2xl border shadow-2xl text-xs font-semibold flex items-center space-x-2 animate-pop-in ${colorMap[type] || colorMap.info}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
