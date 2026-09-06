/* ==========================================================================
   GPMS Client Inspection & Kiosk View Renderer (PG-11 & PG-12)
   ========================================================================== */

function renderClientKiosk(serialNo) {
  const pass = gatePassesDB.find(p => p.serialNo === serialNo) || gatePassesDB[0];
  activePassId = pass.serialNo;

  document.getElementById('kioskSerialNo').innerText = pass.serialNo;
  document.getElementById('kioskJobCard').innerText = pass.jobCardNo;

  const itemsList = document.getElementById('kioskItemsList');
  if (itemsList) {
    itemsList.innerHTML = pass.items.map(i => `<div>• ${i.desc} (Qty: <strong>${i.qty}</strong>)</div>`).join('');
  }

  setTimeout(() => initSignatureCanvas(), 100);
}

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
    playSynthSound('alert');
    showToast(`Dispute raised on ${pass.serialNo}. Gate pass paused (FR-4.3).`, 'error');
    navigateTo('PG-04', pass.serialNo);
  }
}
