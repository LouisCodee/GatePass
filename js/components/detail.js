/* ==========================================================================
   GPMS Gate Pass Detail View Renderer (PG-04)
   ========================================================================== */

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

  if ((currentRole === 'accounts' || currentRole === 'admin') && pass.status === 'Pending Payment Verification') {
    html += `<button onclick="actionConfirmPayment('${pass.serialNo}')" class="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/20">Confirm Payment (Mod 2)</button>`;
  }

  if ((currentRole === 'workshop' || currentRole === 'admin') && pass.status === 'Payment Verified') {
    html += `<button onclick="actionCompleteChecklist('${pass.serialNo}')" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20">Complete Pre-Release Checklist (Mod 3)</button>`;
  }

  if ((currentRole === 'client' || currentRole === 'frontdesk' || currentRole === 'admin') && pass.status === 'Pre-Release Verified') {
    html += `<button onclick="navigateTo('PG-11', '${pass.serialNo}')" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/20">Client Kiosk Sign-off (Mod 4)</button>`;
  }

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

  if ((currentRole === 'security' || currentRole === 'admin') && pass.status === 'Approved – Ready for Exit') {
    html += `<button onclick="navigateTo('PG-15', '${pass.serialNo}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30">Proceed to Exit Clearance (Mod 6)</button>`;
  }

  toolbar.innerHTML = html;
}
