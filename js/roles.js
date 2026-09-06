/* ==========================================================================
   GPMS Role & Access Control Manager
   ========================================================================== */

let currentRole = 'frontdesk';

function toggleRoleMenu() {
  const menu = document.getElementById('roleDropdownMenu');
  if (menu) menu.classList.toggle('hidden');
}

function switchRole(roleId) {
  currentRole = roleId;
  const roleNames = {
    frontdesk: 'Front Desk Officer',
    accounts: 'Accounts Officer',
    workshop: 'Workshop Manager',
    coordinator: 'Consultancy Coordinator',
    client: 'Client (Kiosk View)',
    security: 'Security Personnel',
    records: 'Records Officer',
    admin: 'System Administrator'
  };

  const label = document.getElementById('currentRoleLabel');
  if (label) label.innerText = roleNames[roleId] || roleId;

  document.getElementById('roleDropdownMenu')?.classList.add('hidden');
  showToast(`Switched active user role to: ${roleNames[roleId]}`, 'info');

  if (roleId === 'security') {
    navigateTo('PG-14');
  } else if (roleId === 'client') {
    navigateTo('PG-11', activePassId);
  } else {
    const detailView = document.getElementById('view-PG-04');
    if (detailView && !detailView.classList.contains('hidden')) {
      renderPassDetail(activePassId);
    } else {
      renderDashboard();
    }
  }
}
