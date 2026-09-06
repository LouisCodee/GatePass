/* ==========================================================================
   GPMS New Gate Pass Creation Form Component (PG-08 / Module 1)
   ========================================================================== */

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
  playSynthSound('success');
  showToast(`Gate Pass ${newSerialNo} created successfully!`, 'success');
  navigateTo('PG-04', newSerialNo);
}
