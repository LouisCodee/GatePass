/* ==========================================================================
   GPMS Master Application Entry Point
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  setupGlobalListeners();
  renderDashboard();
  switchRole('frontdesk');
});

function setupGlobalListeners() {
  // Global Shortcut (Ctrl+K / Cmd+K)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.getElementById('globalSearchInput')?.focus();
    }
  });

  // Search Input Live Filter
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

function handleLoginSubmit(e) {
  e.preventDefault();
  playSynthSound('success');
  showToast('Authenticated successfully as Front Desk Officer!', 'success');
  navigateTo('PG-03');
}

function handleResetPasswordSubmit(e) {
  e.preventDefault();
  playSynthSound('success');
  showToast('Password reset instructions sent to your email.', 'info');
  navigateTo('PG-01');
}

function handleProfileUpdate(e) {
  e.preventDefault();
  playSynthSound('success');
  showToast('Profile information updated successfully.', 'success');
}
