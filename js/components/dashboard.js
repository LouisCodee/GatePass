/* ==========================================================================
   GPMS Dashboard View Renderer (PG-03)
   ========================================================================== */

function renderDashboard() {
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
