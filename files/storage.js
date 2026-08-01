/* ===================================================
   storage.js — GrievEase Data Layer
   All data persistence via localStorage.
   ================================================= */

// Hardcoded list of admin login IDs (not editable through any UI)
window.ADMIN_ACCOUNTS = [
  { username: "principal_dmce", password: "SecurePass@123", role: "admin" },
  { username: "hod_computer", password: "Comp@dmce123", role: "department_admin", department: "Computer" },
  { username: "hod_it", password: "IT@dmce123", role: "department_admin", department: "IT" },
  { username: "hod_extc", password: "Extc@dmce123", role: "department_admin", department: "Electronics" },
  { username: "hod_mech", password: "Mech@dmce123", role: "department_admin", department: "Mechanical" },
  { username: "hod_civil", password: "Civil@dmce123", role: "department_admin", department: "Civil" },
  { username: "hod_chem", password: "Chem@dmce123", role: "department_admin", department: "Chemical" }
];

/**
 * Initializes the localStorage with demo data if not already present.
 */
const initSeedData = () => {
  if (localStorage.getItem('grievease_initialized')) {
    return;
  }
  const users = [
    { id: 'u_student1', name: 'Rahul Sharma', email: 'rahul@dmce.ac.in', password: 'student123', role: 'student' },
    { id: 'u_faculty1', name: 'Dr. Priya Mehta', email: 'priya@dmce.ac.in', password: 'faculty123', role: 'faculty' }
  ];
  localStorage.setItem('grievease_users', JSON.stringify(users));

  const now = new Date().toISOString();
  const complaints = [
    {
      id: 'c_seed001',
      title: 'AC not working in Lab 301',
      department: 'Computer',
      category: 'Infrastructure',
      description: 'The air conditioning unit in Computer Lab 301 has been non-functional for over two weeks, making it very difficult to work during afternoon sessions.',
      urgency: 'High',
      status: 'Submitted',
      userId: 'u_student1',
      userName: 'Rahul Sharma',
      type: 'student',
      anonymous: false,
      image: null,
      upvotes: 3,
      upvotedBy: ['u_student2', 'u_student3', 'u_student4'],
      createdAt: now,
      updatedAt: now,
      reopenCount: 0,
      timeline: [{ status: 'Submitted', date: now, remark: 'Complaint submitted', by: 'Rahul Sharma' }],
      adminRemark: null
    },
    {
      id: 'c_seed002',
      title: 'Projector bulb burnt out — Room 204',
      department: 'Computer',
      category: 'Infrastructure',
      description: 'The projector in Room 204 has a burnt-out bulb and classes cannot use slides. This has been unresolved for a week.',
      urgency: 'Medium',
      status: 'Under Review',
      userId: 'u_student1',
      userName: 'Rahul Sharma',
      type: 'student',
      anonymous: false,
      image: null,
      upvotes: 1,
      upvotedBy: ['u_student5'],
      createdAt: now,
      updatedAt: now,
      reopenCount: 0,
      timeline: [
        { status: 'Submitted', date: now, remark: 'Complaint submitted', by: 'Rahul Sharma' },
        { status: 'Under Review', date: now, remark: 'Being reviewed by HOD', by: 'System' }
      ],
      adminRemark: null
    },
    {
      id: 'c_seed003',
      title: 'IT Lab computers crashing frequently',
      department: 'IT',
      category: 'Lab Equipment',
      description: 'Around 8 computers in the IT lab keep crashing mid-session. The issue seems to be overheating due to dust accumulation.',
      urgency: 'High',
      status: 'In Progress',
      userId: 'u_student1',
      userName: 'Rahul Sharma',
      type: 'student',
      anonymous: false,
      image: null,
      upvotes: 5,
      upvotedBy: ['u_student1', 'u_student2', 'u_student3', 'u_student4', 'u_student5'],
      createdAt: now,
      updatedAt: now,
      reopenCount: 0,
      timeline: [
        { status: 'Submitted', date: now, remark: 'Complaint submitted', by: 'Rahul Sharma' },
        { status: 'In Progress', date: now, remark: 'Technician assigned', by: 'HOD IT' }
      ],
      adminRemark: null
    },
    {
      id: 'c_seed004',
      title: 'Library reading room lights flickering',
      department: 'Civil',
      category: 'Library',
      description: 'The fluorescent lights in the library reading room have been flickering for the past three days, causing eye strain.',
      urgency: 'Low',
      status: 'Submitted',
      userId: 'u_student1',
      userName: 'Anonymous',
      type: 'student',
      anonymous: true,
      image: null,
      upvotes: 2,
      upvotedBy: ['u_student3', 'u_student4'],
      createdAt: now,
      updatedAt: now,
      reopenCount: 0,
      timeline: [{ status: 'Submitted', date: now, remark: 'Complaint submitted', by: 'Anonymous' }],
      adminRemark: null
    }
  ];
  localStorage.setItem('grievease_complaints', JSON.stringify(complaints));
  localStorage.setItem('grievease_initialized', 'true');
};

/**
 * DEV HELPER: Clears seed flag so initSeedData() re-runs on next load.
 * Call grieveaseResetSeed() in browser console to reset demo data.
 */
window.grieveaseResetSeed = () => {
  localStorage.removeItem('grievease_initialized');
  localStorage.removeItem('grievease_complaints');
  localStorage.removeItem('grievease_users');
  console.log('[GrievEase] Seed data cleared. Reload the page to re-seed.');
};

/**
 * Returns all complaints.
 */
const getComplaints = () => {
  return JSON.parse(localStorage.getItem('grievease_complaints') || '[]');
};

/**
 * Adds a new complaint.
 */
const addComplaint = (complaint) => {
  const complaints = getComplaints();
  // Only generate a new id if one hasn't been supplied by the caller.
  if (!complaint.id) {
    complaint.id = 'c_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  const now = new Date().toISOString();
  if (!complaint.createdAt) complaint.createdAt = now;
  if (!complaint.updatedAt) complaint.updatedAt = now;
  if (complaint.reopenCount === undefined) complaint.reopenCount = 0;
  if (!complaint.timeline || !complaint.timeline.length) {
    complaint.timeline = [{ status: 'Submitted', date: now, remark: 'Complaint submitted', by: complaint.userName || 'Complainant' }];
  }
  complaints.push(complaint);
  localStorage.setItem('grievease_complaints', JSON.stringify(complaints));
  console.log('[GrievEase] addComplaint: saved complaint', complaint.id, '— total complaints now:', complaints.length);
  return complaint;
};

/**
 * Updates a complaint by id.
 */
const updateComplaint = (id, updates, byUser) => {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === id);
  if (index !== -1) {
    const oldStatus = complaints[index].status;
    complaints[index] = { ...complaints[index], ...updates };
    complaints[index].updatedAt = new Date().toISOString();
    
    if (updates.status && updates.status !== oldStatus) {
      complaints[index].timeline.push({
        status: updates.status,
        date: complaints[index].updatedAt,
        remark: updates.adminRemark || `Status changed to ${updates.status}`,
        by: byUser || 'System'
      });
    }
    localStorage.setItem('grievease_complaints', JSON.stringify(complaints));
    return complaints[index];
  }
  return null;
};

/**
 * Returns all users.
 */
const getUsers = () => {
  return JSON.parse(localStorage.getItem('grievease_users') || '[]');
};

/**
 * Adds a user.
 */
const addUser = (user) => {
  const users = getUsers();
  user.id = 'u_' + Date.now().toString(36);
  users.push(user);
  localStorage.setItem('grievease_users', JSON.stringify(users));
  return user;
};

/**
 * Gets active session.
 */
const getSession = () => {
  return JSON.parse(localStorage.getItem('grievease_session'));
};

/**
 * Sets session.
 */
const setSession = (user) => {
  localStorage.setItem('grievease_session', JSON.stringify(user));
};

/**
 * Clears session.
 */
const clearSession = () => {
  localStorage.removeItem('grievease_session');
};

/**
 * Gets notifications for user.
 */
const getNotifications = (userId) => {
  const notifs = JSON.parse(localStorage.getItem('grievease_notifications') || '[]');
  if (userId === 'admin') return notifs; // Admin sees all? Or admin has own ID. We assume admin has own ID.
  return notifs.filter(n => n.userId === userId);
};

/**
 * Adds notification.
 */
const addNotification = ({userId, message, complaintId, type}) => {
  const notifs = JSON.parse(localStorage.getItem('grievease_notifications') || '[]');
  const notif = {
    id: 'n_' + Date.now().toString(36),
    userId,
    message,
    complaintId,
    type,
    read: false,
    timestamp: new Date().toISOString()
  };
  notifs.push(notif);
  localStorage.setItem('grievease_notifications', JSON.stringify(notifs));
  return notif;
};

/**
 * Marks notification as read.
 */
const markNotificationRead = (id) => {
  const notifs = JSON.parse(localStorage.getItem('grievease_notifications') || '[]');
  const index = notifs.findIndex(n => n.id === id);
  if (index !== -1) {
    notifs[index].read = true;
    localStorage.setItem('grievease_notifications', JSON.stringify(notifs));
  }
};

/**
 * Upvotes a complaint.
 */
const upvoteComplaint = (complaintId, userId) => {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === complaintId);
  if (index !== -1) {
    if (!complaints[index].upvotedBy) complaints[index].upvotedBy = [];
    if (!complaints[index].upvotedBy.includes(userId)) {
      complaints[index].upvotedBy.push(userId);
      complaints[index].upvotes = (complaints[index].upvotes || 0) + 1;
      localStorage.setItem('grievease_complaints', JSON.stringify(complaints));
    }
    return complaints[index];
  }
  return null;
};

initSeedData();

/**
 * MIGRATION: If grievease_initialized was previously set but complaints
 * array is empty (old empty-seed bug), inject seed complaints so the
 * "similar complaints" feature has data to display.
 */
(() => {
  const existing = getComplaints();
  const hasSeedComplaint = existing.some(c => c.id && c.id.startsWith('c_seed'));
  if (existing.length === 0 || !hasSeedComplaint) {
    const now = new Date().toISOString();
    const seedComplaints = [
      {
        id: 'c_seed001',
        title: 'AC not working in Lab 301',
        department: 'Computer',
        category: 'Infrastructure',
        description: 'The air conditioning unit in Computer Lab 301 has been non-functional for over two weeks, making it very difficult to work during afternoon sessions.',
        urgency: 'High',
        status: 'Submitted',
        userId: 'u_student1',
        userName: 'Rahul Sharma',
        type: 'student',
        anonymous: false,
        image: null,
        upvotes: 3,
        upvotedBy: ['u_student2', 'u_student3', 'u_student4'],
        createdAt: now,
        updatedAt: now,
        reopenCount: 0,
        timeline: [{ status: 'Submitted', date: now, remark: 'Complaint submitted', by: 'Rahul Sharma' }],
        adminRemark: null
      },
      {
        id: 'c_seed002',
        title: 'Projector bulb burnt out — Room 204',
        department: 'Computer',
        category: 'Infrastructure',
        description: 'The projector in Room 204 has a burnt-out bulb and classes cannot use slides. This has been unresolved for a week.',
        urgency: 'Medium',
        status: 'Under Review',
        userId: 'u_student1',
        userName: 'Rahul Sharma',
        type: 'student',
        anonymous: false,
        image: null,
        upvotes: 1,
        upvotedBy: ['u_student5'],
        createdAt: now,
        updatedAt: now,
        reopenCount: 0,
        timeline: [
          { status: 'Submitted', date: now, remark: 'Complaint submitted', by: 'Rahul Sharma' },
          { status: 'Under Review', date: now, remark: 'Being reviewed by HOD', by: 'System' }
        ],
        adminRemark: null
      },
      {
        id: 'c_seed003',
        title: 'IT Lab computers crashing frequently',
        department: 'IT',
        category: 'Lab Equipment',
        description: 'Around 8 computers in the IT lab keep crashing mid-session. The issue seems to be overheating due to dust accumulation.',
        urgency: 'High',
        status: 'In Progress',
        userId: 'u_student1',
        userName: 'Rahul Sharma',
        type: 'student',
        anonymous: false,
        image: null,
        upvotes: 5,
        upvotedBy: ['u_student1', 'u_student2', 'u_student3', 'u_student4', 'u_student5'],
        createdAt: now,
        updatedAt: now,
        reopenCount: 0,
        timeline: [
          { status: 'Submitted', date: now, remark: 'Complaint submitted', by: 'Rahul Sharma' },
          { status: 'In Progress', date: now, remark: 'Technician assigned', by: 'HOD IT' }
        ],
        adminRemark: null
      },
      {
        id: 'c_seed004',
        title: 'Library reading room lights flickering',
        department: 'Civil',
        category: 'Library',
        description: 'The fluorescent lights in the library reading room have been flickering for the past three days, causing eye strain.',
        urgency: 'Low',
        status: 'Submitted',
        userId: 'u_student1',
        userName: 'Anonymous',
        type: 'student',
        anonymous: true,
        image: null,
        upvotes: 2,
        upvotedBy: ['u_student3', 'u_student4'],
        createdAt: now,
        updatedAt: now,
        reopenCount: 0,
        timeline: [{ status: 'Submitted', date: now, remark: 'Complaint submitted', by: 'Anonymous' }],
        adminRemark: null
      }
    ];
    // Merge: keep any real user-submitted complaints, then append seeds that aren't already present
    const existingIds = new Set(existing.map(c => c.id));
    const toAdd = seedComplaints.filter(c => !existingIds.has(c.id));
    if (toAdd.length > 0) {
      const merged = [...existing, ...toAdd];
      localStorage.setItem('grievease_complaints', JSON.stringify(merged));
      console.log('[GrievEase] Migration: injected', toAdd.length, 'seed complaint(s) into existing storage.');
    }
  }
})();
