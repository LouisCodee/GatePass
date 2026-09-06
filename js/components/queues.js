/* ==========================================================================
   GPMS Work Queues Component (PG-09, PG-10, PG-13, PG-15)
   ========================================================================== */

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
    
    playSynthSound('success');
    showToast(`Payment verified for ${serialNo}. Advanced to "Payment Verified".`, 'success');
    renderPassDetail(serialNo);
  }
}

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

    playSynthSound('success');
    showToast(`Pre-release checklist verified for ${serialNo}.`, 'success');
    renderPassDetail(serialNo);
  }
}

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

    const approvedCount = Object.values(pass.approvals).filter(a => a.status === 'Approved').length;
    if (approvedCount >= 3) {
      pass.status = 'Approved – Ready for Exit';
      pass.auditTrail.unshift({ timestamp: now, user: 'System Engine', action: 'All 3 approvals complete. Status advanced to Approved – Ready for Exit' });
      playSynthSound('success');
      showToast(`All 3 approvals recorded for ${serialNo}! Ready for exit.`, 'success');
    } else {
      playSynthSound('success');
      showToast(`Approval recorded (${approvedCount}/3 complete).`, 'info');
    }

    renderPassDetail(serialNo);
  }
}

function renderExitClearance(serialNo) {
  const pass = gatePassesDB.find(p => p.serialNo === serialNo) || gatePassesDB[0];
  activePassId = pass.serialNo;

  const banner = document.getElementById('exitStatusBanner');
  const details = document.getElementById('exitPassDetails');
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

    playSynthSound('success');
    showToast(`Gate Pass ${serialNo} successfully RELEASED!`, 'success');
    renderExitClearance(serialNo);
  }
}
