/* ==========================================================================
   GPMS Data Store & Helper Utilities
   ========================================================================== */

let activePassId = 'GP-2026-0891';
let segregationOverride = false;

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
      { timestamp: '2026-09-04 10:15', user: 'Front Desk Officer', action: 'Created Gate Pass record' },
      { timestamp: '2026-09-04 10:45', user: 'Accounts Officer', action: 'Verified full payment against Receipt REC-77402' }
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
    paymentDetails: { verified: true, amountDue: 0.00, verifiedBy: 'Accounts Officer', verifiedAt: '2026-09-03 15:00' },
    checklist: { completed: true, verifiedBy: 'Workshop Manager', verifiedAt: '2026-09-03 16:30' },
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
  }, 3500);
}
