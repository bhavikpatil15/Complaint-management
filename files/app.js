/* ===================================================
   app.js — GrievEase Shared Utilities
   Navigation, auth, formatting, and UI helpers.
   ================================================= */

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
};

const formatDateShort = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const timeAgo = (isoString) => {
  const seconds = Math.floor((new Date() - new Date(isoString)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "just now";
};

const getStatusClass = (status) => {
  const map = {
    'Submitted': 'status-submitted',
    'Under Review': 'status-under-review',
    'In Progress': 'status-in-progress',
    'Resolved': 'status-resolved',
    'Rejected': 'status-rejected',
    'Pending Confirmation': 'status-pending-confirmation',
    'Reopened': 'status-reopened',
    'Escalated to Admin': 'status-escalated'
  };
  return map[status] || 'status-submitted';
};

const getUrgencyClass = (urgency) => {
  const map = {
    'Low': 'urgency-low',
    'Medium': 'urgency-medium',
    'High': 'urgency-high',
    'Critical': 'urgency-critical'
  };
  return map[urgency] || 'urgency-low';
};

const requireAuth = (allowedRoles) => {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    // Session has an invalid/mismatched role — clear it before bouncing back
    // to login. Otherwise login.html sees a still-valid session, redirects
    // straight back here, and this check fails again: infinite refresh loop.
    clearSession();
    window.location.href = 'login.html';
    return null;
  }
  return session;
};

const renderNavbar = (activePage) => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const session = getSession();
  if (!session) return;

  const role = session.role;
  let navLinksHTML = '';

  if (role === 'admin' || role === 'department_admin') {
    navLinksHTML += `<a href="admin.html" class="nav-link ${activePage === 'Admin Panel' ? 'active' : ''}">Admin Dashboard</a>`;
  } else {
    navLinksHTML += `<a href="dashboard.html" class="nav-link ${activePage === 'Dashboard' ? 'active' : ''}">Dashboard</a>`;
    navLinksHTML += `<a href="new-complaint.html" class="nav-link ${activePage === 'New Complaint' ? 'active' : ''}">New Complaint</a>`;
    navLinksHTML += `<a href="community.html" class="nav-link ${activePage === 'Community Board' ? 'active' : ''}">Community Board</a>`;
    if (role === 'faculty') {
      navLinksHTML += `<a href="faculty-complaint.html" class="nav-link ${activePage === 'Faculty Complaint' ? 'active' : ''}">Faculty Complaint</a>`;
    }
    navLinksHTML += `<a href="track.html" class="nav-link ${activePage === 'Track Complaints' ? 'active' : ''}">Track Complaints</a>`;
  }

  const notifications = getNotifications(session.id);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  let notifsHTML = notifications.length === 0 ? '<div style="padding:16px;text-align:center;color:#737780">No notifications</div>' : '';
  notifications.reverse().forEach(n => {
    notifsHTML += `
      <div class="notification-item ${!n.read ? 'unread' : ''}" data-id="${n.id}">
        <div style="font-size:13px">${n.message}</div>
        <div style="font-size:11px;color:#737780;margin-top:4px">${timeAgo(n.timestamp)}</div>
      </div>
    `;
  });

  const dashboardLink = (role === 'admin' || role === 'department_admin') ? 'admin.html' : 'dashboard.html';

  navbar.innerHTML = `
    <div class="navbar">
      <a href="${dashboardLink}" class="nav-brand">🏫 GrievEase</a>
      <div class="nav-links">${navLinksHTML}</div>
      <div class="nav-actions">
        <button class="notification-bell" id="notif-btn">
          🔔
          ${unreadCount > 0 ? `<div class="notification-count">${unreadCount}</div>` : ''}
        </button>
        <div class="notification-panel" id="notif-panel">
          ${notifsHTML}
        </div>
        <div class="user-menu" id="user-menu-btn">
          <div class="user-avatar">${session.name.charAt(0).toUpperCase()}</div>
          <div class="user-dropdown" id="user-dropdown">
            <div class="user-dropdown-item" id="logout-btn">Logout</div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('notif-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('notif-panel').classList.toggle('active');
    document.getElementById('user-dropdown').classList.remove('active');
  });

  document.getElementById('user-menu-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('user-dropdown').classList.toggle('active');
    document.getElementById('notif-panel').classList.remove('active');
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    clearSession();
    window.location.href = 'login.html';
  });

  document.addEventListener('click', () => {
    document.getElementById('notif-panel')?.classList.remove('active');
    document.getElementById('user-dropdown')?.classList.remove('active');
  });

  document.querySelectorAll('.notification-item').forEach(el => {
    el.addEventListener('click', function() {
      markNotificationRead(this.getAttribute('data-id'));
      // optionally redirect based on notification
      window.location.reload();
    });
  });
};

window.showToast = (message, type = 'info') => {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

window.showModal = (title, bodyHTML, onConfirm) => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="headline-md">${title}</h3>
        <button class="modal-close" id="dynamic-modal-close">✕</button>
      </div>
      <div id="dynamic-modal-body">${bodyHTML}</div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  setTimeout(() => overlay.classList.add('active'), 10);
  
  overlay.querySelector('#dynamic-modal-close').addEventListener('click', () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 200);
  });
  
  const confirmBtn = overlay.querySelector('#modal-confirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      onConfirm();
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 200);
    });
  }
  const cancelBtn = overlay.querySelector('#modal-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 200);
    });
  }
};

window.closeModal = () => {
  const overlay = document.querySelector('.modal-overlay.active');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 200);
  }
};

const initPage = (pageName, allowedRoles) => {
  const user = requireAuth(allowedRoles);
  if (user) {
    renderNavbar(pageName);
  }
  return user;
};
