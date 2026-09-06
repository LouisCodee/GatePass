/* ==========================================================================
   GPMS Administration Components (PG-18, PG-19, PG-20, PG-21)
   ========================================================================== */

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

function toggleSegregationOverride(checked) {
  segregationOverride = checked;
  playSynthSound(checked ? 'alert' : 'success');
  showToast(`Segregation of Duties Override: ${checked ? 'ENABLED' : 'DISABLED'}`, checked ? 'warning' : 'info');
}

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
  playSynthSound('success');
  showToast('All notifications marked as read', 'info');
}
