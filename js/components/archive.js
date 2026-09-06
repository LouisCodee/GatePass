/* ==========================================================================
   GPMS Records Archive & Printable View Renderer (PG-05, PG-16, PG-17)
   ========================================================================== */

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

  playSynthSound('success');
  showToast('Records Archive exported to CSV (FR-7.2)', 'success');
}

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
