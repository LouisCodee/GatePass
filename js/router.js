/* ==========================================================================
   GPMS Single Page Application Router
   ========================================================================== */

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
