/**
 * School Van Management System - Core Coordinator (app.js)
 * Manages SPA Routing, Auth, Table Pagination/Filters, Global Search, Charts, and Modals.
 */

import { Store } from './store.js';
import { Db } from './db.js';
import { Translations, translateUI } from './language.js';
import { VoiceAssistant } from './voice.js';

// Global App State
const AppState = {
  currentSection: 'dashboard',
  currentLang: 'en',
  theme: 'light',
  user: null,
  activeConfirmCallback: null,
  activeReportType: 'students',
  
  // Table sorting, page, and search states
  tables: {
    vans: { page: 1, limit: 5, search: '', filter: '', sortField: 'vanNumber', sortAsc: true },
    drivers: { page: 1, limit: 5, search: '', filter: '', sortField: 'name', sortAsc: true },
    students: { page: 1, limit: 5, search: '', filterClass: '', filterVan: '', sortField: 'name', sortAsc: true },
    trips: { page: 1, limit: 5, search: '', filter: '', sortField: 'tripId', sortAsc: true },
    payments: { page: 1, limit: 5, search: '', filter: '', sortField: 'studentName', sortAsc: true }
  },

  // Chart references
  charts: {}
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  Store.init();
  Db.init();
  initTheme();
  initAuth();
  initLanguage();
  initRouter();
  initSidebar();
  initVoice();
  initGlobalSearch();
  initNotificationDrawer();
  initSettings();
  initForms();
  
  // Custom store listener to update UI components when stores update
  window.addEventListener('store-updated', async (e) => {
    await updateKpis();
    await renderActiveSection();
    renderNotificationDrawer();
  });

  window.addEventListener('store-reset', async () => {
    showToast(Translations[AppState.currentLang].resetSuccess, 'success');
    updateTheme(Store.get(Store.KEYS.SETTINGS).theme);
    updateLang(Store.get(Store.KEYS.SETTINGS).language);
    await updateKpis();
    await renderActiveSection();
    renderNotificationDrawer();
  });
});

/* ================= THEME ENGINE ================= */
function initTheme() {
  const settings = Store.get(Store.KEYS.SETTINGS) || { theme: 'light' };
  AppState.theme = settings.theme;
  updateTheme(AppState.theme);
  
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    const nextTheme = AppState.theme === 'light' ? 'dark' : 'light';
    AppState.theme = nextTheme;
    updateTheme(nextTheme);
    
    // Save to settings
    const settings = Store.get(Store.KEYS.SETTINGS);
    settings.theme = nextTheme;
    Store.set(Store.KEYS.SETTINGS, settings);
    playSound('click');
  });
}

function updateTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeToggle = document.getElementById('theme-toggle');
  const icon = themeToggle.querySelector('i');
  
  if (theme === 'dark') {
    icon.className = 'fa-solid fa-sun';
  } else {
    icon.className = 'fa-solid fa-moon';
  }
  
  // Re-draw charts with theme-compliant colors if rendering
  if (AppState.currentSection === 'dashboard') {
    setTimeout(renderDashboardCharts, 50);
  }
}

/* ================= AUDIO EFFECTS ================= */
function playSound(type) {
  const settings = Store.get(Store.KEYS.SETTINGS);
  if (!settings || !settings.soundEnabled) return;

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'error' || type === 'warning') {
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else {
      // standard click
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {
    console.warn("Audio Context blocked by policy:", e);
  }
}

/* ================= LANGUAGE ENGINE ================= */
function initLanguage() {
  const settings = Store.get(Store.KEYS.SETTINGS) || { language: 'en' };
  AppState.currentLang = settings.language;
  updateLang(AppState.currentLang);
  
  const switcher = document.getElementById('lang-switcher');
  switcher.value = AppState.currentLang;
  switcher.addEventListener('change', (e) => {
    updateLang(e.target.value);
    
    // Save to settings
    const settings = Store.get(Store.KEYS.SETTINGS);
    settings.language = e.target.value;
    Store.set(Store.KEYS.SETTINGS, settings);
    playSound('click');
  });
}

function updateLang(lang) {
  AppState.currentLang = lang;
  document.documentElement.lang = lang;
  
  const switcher = document.getElementById('lang-switcher');
  switcher.value = lang;
  
  const settingsLang = document.getElementById('settings-lang');
  if (settingsLang) settingsLang.value = lang;
  
  translateUI(lang);
  
  // Re-draw labels on active table columns
  renderActiveSection();
}

/* ================= TOAST SYSTEM ================= */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') { icon = 'fa-circle-check'; playSound('success'); }
  if (type === 'warning') { icon = 'fa-triangle-exclamation'; playSound('warning'); }
  if (type === 'danger') { icon = 'fa-circle-xmark'; playSound('error'); }
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  
  // Animation delay
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Dismiss after 4s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ================= AUTHENTICATION ================= */
function initAuth() {
  const isLoggedIn = localStorage.getItem(Store.KEYS.LOGGED_IN) === 'true';
  const loginScreen = document.getElementById('login-screen');
  const appShell = document.getElementById('app-shell');
  
  if (isLoggedIn) {
    AppState.user = { username: 'admin' };
    loginScreen.style.display = 'none';
    appShell.style.display = 'flex';
    updateKpis();
    renderActiveSection();
    renderNotificationDrawer();
  } else {
    loginScreen.style.display = 'flex';
    appShell.style.display = 'none';
  }
  
  // Handle Submit
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userVal = document.getElementById('login-username').value.trim();
    const passVal = document.getElementById('login-password').value.trim();
    
    let valid = true;
    
    // reset errors
    document.getElementById('error-username').style.display = 'none';
    document.getElementById('error-password').style.display = 'none';
    document.getElementById('login-general-error').style.display = 'none';
    
    if (!userVal) {
      document.getElementById('error-username').style.display = 'block';
      valid = false;
    }
    if (!passVal) {
      document.getElementById('error-password').style.display = 'block';
      valid = false;
    }
    
    if (!valid) return;
    
    if (userVal === 'admin' && passVal === 'admin123') {
      localStorage.setItem(Store.KEYS.LOGGED_IN, 'true');
      AppState.user = { username: 'admin' };
      loginScreen.style.display = 'none';
      appShell.style.display = 'flex';
      showToast(AppState.currentLang === 'ta' ? 'நிர்வாகி உள்நுழைவு வெற்றிகரமாக முடிந்தது!' : 'Admin Login Successful!', 'success');
      
      // Seed default settings and data
      Store.init();
      updateKpis();
      navigate('dashboard');
    } else {
      const errorMsg = document.getElementById('login-general-error');
      errorMsg.textContent = Translations[AppState.currentLang].invalidCredentials;
      errorMsg.style.display = 'block';
      playSound('error');
    }
  });

  // Logout button
  document.getElementById('logout-btn').addEventListener('click', () => {
    showConfirm(AppState.currentLang === 'ta' ? 'நிச்சயமாக வெளியேற விரும்புகிறீர்களா?' : 'Are you sure you want to logout?', () => {
      localStorage.removeItem(Store.KEYS.LOGGED_IN);
      AppState.user = null;
      loginScreen.style.display = 'flex';
      appShell.style.display = 'none';
      document.getElementById('login-form').reset();
    });
  });
}

/* ================= SPA ROUTER ================= */
function initRouter() {
  // Navigation binding
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-section');
      navigate(target);
      playSound('click');
      
      // Close sidebar drawer on mobile
      document.getElementById('app-sidebar').classList.remove('open');
    });
  });
}

function navigate(target) {
  AppState.currentSection = target;
  
  // Update nav highlights
  document.querySelectorAll('.sidebar-link').forEach(link => {
    if (link.getAttribute('data-section') === target) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.style.display = 'none';
  });
  
  // Show active
  const targetSection = document.getElementById(`section-${target}`);
  if (targetSection) {
    targetSection.style.display = 'block';
    renderActiveSection();
  }
}

// Expose navigate to window so the mobile bottom nav (outside ES module) can call it
window.__appNavigate = navigate;


async function renderActiveSection() {
  const current = AppState.currentSection;
  translateUI(AppState.currentLang, document.getElementById(`section-${current}`));
  
  if (current === 'dashboard') {
    await updateKpis();
    await renderDashboardCharts();
    renderDashboardLists();
  } else if (current === 'vans') {
    await renderVansTable();
    await populateDriversDropdown('van-driver');
  } else if (current === 'drivers') {
    await renderDriversTable();
    await populateVansDropdown('driver-van');
  } else if (current === 'students') {
    await renderStudentsTable();
    await populateVansDropdown('student-van');
    await populateStudentsFilterOptions();
  } else if (current === 'trips') {
    await renderTripsTable();
    await populateDriversDropdown('trip-driver');
    await populateVansDropdown('trip-van');
  } else if (current === 'payments') {
    await renderPaymentsTable();
    await populateStudentsDropdown('payment-student');
  } else if (current === 'reports') {
    await renderReportsModule();
  }
}

/* ================= SIDEBAR & GENERAL INTERACTIONS ================= */
function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('app-sidebar');
  
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== toggle) {
      sidebar.classList.remove('open');
    }
  });
}

/* ================= CONFIRMATION DIALOG ================= */
function showConfirm(message, okCallback) {
  const confirmModal = document.getElementById('modal-confirm');
  document.getElementById('confirm-msg').textContent = message;
  confirmModal.classList.add('active');
  
  AppState.activeConfirmCallback = okCallback;
  playSound('warning');
}

document.getElementById('confirm-ok-btn').addEventListener('click', () => {
  if (AppState.activeConfirmCallback) {
    AppState.activeConfirmCallback();
  }
  document.getElementById('modal-confirm').classList.remove('active');
  AppState.activeConfirmCallback = null;
});

// Bind all data-close-modal elements
document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    const modalId = btn.getAttribute('data-close-modal');
    document.getElementById(modalId).classList.remove('active');
  });
});

/* ================= DASHBOARD CORE LOGIC ================= */
async function updateKpis() {
  const [vans, drivers, students, trips, payments] = await Promise.all([
    Db.getAll(Store.KEYS.VANS),
    Db.getAll(Store.KEYS.DRIVERS),
    Db.getAll(Store.KEYS.STUDENTS),
    Db.getAll(Store.KEYS.TRIPS),
    Db.getAll(Store.KEYS.PAYMENTS)
  ]);

  // Total Vans
  document.getElementById('kpi-vans').textContent = vans.length;
  // Total Drivers
  document.getElementById('kpi-drivers').textContent = drivers.length;
  // Total Students
  document.getElementById('kpi-students').textContent = students.length;
  
  // Today's trips (scheduled/running today)
  const todaySimulated = '2026-06-11';
  const todaysTrips = trips.filter(t => t.date === todaySimulated).length;
  document.getElementById('kpi-trips').textContent = todaysTrips;
  
  // Pending payments count
  const pendingPayments = payments.filter(p => p.status === 'Pending').length;
  document.getElementById('kpi-payments').textContent = pendingPayments;
}

async function renderDashboardCharts() {
  const isDark = AppState.theme === 'dark';
  const textCol = isDark ? '#94A3B8' : '#64748B';
  const gridCol = isDark ? '#1E293B' : '#E2E8F0';
  const [payments, students, trips] = await Promise.all([
    Db.getAll(Store.KEYS.PAYMENTS),
    Db.getAll(Store.KEYS.STUDENTS),
    Db.getAll(Store.KEYS.TRIPS)
  ]);

  // Cleanup old charts
  Object.keys(AppState.charts).forEach(key => {
    if (AppState.charts[key]) {
      AppState.charts[key].destroy();
    }
  });

  // Chart options common config
  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: textCol, font: { family: 'Inter' } }
      }
    }
  };

  // 1. Monthly Collections Chart (Simulated last 6 Months)
  const ctxCollections = document.getElementById('chart-monthly-collections').getContext('2d');
  AppState.charts.collections = new Chart(ctxCollections, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: AppState.currentLang === 'ta' ? 'வசூல் (₹)' : 'Collected (₹)',
        data: [18000, 22000, 25000, 20000, 15000, 27500],
        backgroundColor: '#2E7D32',
        borderRadius: 4
      }]
    },
    options: {
      ...chartDefaults,
      scales: {
        x: { grid: { color: gridCol }, ticks: { color: textCol } },
        y: { grid: { color: gridCol }, ticks: { color: textCol } }
      }
    }
  });

  // 2. Student Distribution by Class
  const classCounts = {};
  students.forEach(s => {
    classCounts[s.class] = (classCounts[s.class] || 0) + 1;
  });
  const classes = Object.keys(classCounts).sort((a,b) => parseInt(a) - parseInt(b));
  const classData = classes.map(c => classCounts[c]);

  const ctxDist = document.getElementById('chart-student-distribution').getContext('2d');
  AppState.charts.distribution = new Chart(ctxDist, {
    type: 'doughnut',
    data: {
      labels: classes.map(c => `Class ${c}`),
      datasets: [{
        data: classData.length ? classData : [1],
        backgroundColor: ['#2E7D32', '#4CAF50', '#2196F3', '#FF9800', '#E53935', '#9C27B0', '#795548']
      }]
    },
    options: chartDefaults
  });

  // 3. Trips Overview
  const tripStatusCounts = { Scheduled: 0, Running: 0, Completed: 0 };
  trips.forEach(t => {
    tripStatusCounts[t.status] = (tripStatusCounts[t.status] || 0) + 1;
  });

  const ctxTrips = document.getElementById('chart-trips-overview').getContext('2d');
  AppState.charts.trips = new Chart(ctxTrips, {
    type: 'line',
    data: {
      labels: [
        AppState.currentLang === 'ta' ? 'திட்டமிடப்பட்டது' : 'Scheduled', 
        AppState.currentLang === 'ta' ? 'இயங்குகிறது' : 'Running', 
        AppState.currentLang === 'ta' ? 'முடிந்தது' : 'Completed'
      ],
      datasets: [{
        label: AppState.currentLang === 'ta' ? 'பயணங்கள் எண்ணிக்கை' : 'Trips',
        data: [tripStatusCounts.Scheduled, tripStatusCounts.Running, tripStatusCounts.Completed],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      ...chartDefaults,
      scales: {
        x: { grid: { color: gridCol }, ticks: { color: textCol } },
        y: { grid: { color: gridCol }, ticks: { color: textCol }, min: 0 }
      }
    }
  });

  // 4. Payment Status Chart
  let paidTotal = 0;
  let pendingTotal = 0;
  payments.forEach(p => {
    if (p.status === 'Paid') paidTotal++;
    else pendingTotal++;
  });

  const ctxPayments = document.getElementById('chart-payment-status').getContext('2d');
  AppState.charts.payments = new Chart(ctxPayments, {
    type: 'pie',
    data: {
      labels: [
        AppState.currentLang === 'ta' ? 'செலுத்தப்பட்டது' : 'Paid', 
        AppState.currentLang === 'ta' ? 'நிலுவையில்' : 'Pending'
      ],
      datasets: [{
        data: [paidTotal, pendingTotal],
        backgroundColor: ['#4CAF50', '#FF9800']
      }]
    },
    options: chartDefaults
  });
}

async function renderDashboardLists() {
  // Recent Activities
  const notifs = await Db.getAll(Store.KEYS.NOTIFICATIONS) || [];
  const activityList = document.getElementById('dashboard-activity-list');
  
  if (notifs.length === 0) {
    activityList.innerHTML = `<div class="table-empty-state"><i class="fa-solid fa-clock"></i><p data-i18n="noActivities">${Translations[AppState.currentLang].noActivities}</p></div>`;
  } else {
    // Show top 5 recent activities
    activityList.innerHTML = notifs.slice(0, 5).map(n => {
      let iconClass = 'info';
      if (n.type === 'Warning') iconClass = 'warning';
      if (n.type === 'Danger') iconClass = 'danger';
      if (n.type === 'Success') iconClass = 'success';
      
      const timeStr = new Date(n.time).toLocaleTimeString(AppState.currentLang === 'ta' ? 'ta-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="activity-item">
          <div class="activity-icon ${iconClass}">
            <i class="fa-solid ${iconClass === 'success' ? 'fa-check' : iconClass === 'warning' ? 'fa-triangle-exclamation' : iconClass === 'danger' ? 'fa-exclamation' : 'fa-info'}"></i>
          </div>
          <div class="activity-details">
            <span class="activity-text">${n.message}</span>
            <span class="activity-time">${timeStr}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Dashboard alerts/notifications panel
  const alertList = document.getElementById('dashboard-notif-list');
  const warnings = notifs.filter(n => (n.type === 'Warning' || n.type === 'Danger') && !n.read);
  const alertWidgetCard = alertList ? alertList.closest('.widget-card') : null;
  
  if (warnings.length === 0) {
    if (alertWidgetCard) alertWidgetCard.style.display = 'none';
    if (alertList) alertList.innerHTML = `<div class="table-empty-state"><i class="fa-solid fa-circle-check"></i><p data-i18n="noNotifications">${Translations[AppState.currentLang].noNotifications}</p></div>`;
  } else {
    if (alertWidgetCard) alertWidgetCard.style.display = 'block';
    alertList.innerHTML = warnings.slice(0, 5).map(w => {
      const type = w.type.toLowerCase();
      return `
        <div class="alert-item">
          <div class="alert-icon ${type}">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div class="alert-details">
            <span class="alert-text" style="font-weight:600;">${w.title}</span>
            <span class="alert-text">${w.message}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

/* ================= GLOBAL SEARCH MODULE ================= */
function initGlobalSearch() {
  const searchInput = document.getElementById('global-search');
  const suggestions = document.getElementById('search-suggestions');
  
  searchInput.addEventListener('input', async (e) => {
    const val = e.target.value.toLowerCase().trim();
    if (!val) {
      suggestions.style.display = 'none';
      return;
    }
    
    // Fetch all collections concurrently
    const [vans, drivers, students, trips, payments] = await Promise.all([
      Db.getAll(Store.KEYS.VANS),
      Db.getAll(Store.KEYS.DRIVERS),
      Db.getAll(Store.KEYS.STUDENTS),
      Db.getAll(Store.KEYS.TRIPS),
      Db.getAll(Store.KEYS.PAYMENTS)
    ]);
    
    const index = [];
    
    // Index Vans
    vans.forEach(v => {
      if (v.vanNumber.toLowerCase().includes(val) || v.registrationNumber.toLowerCase().includes(val) || v.vehicleModel.toLowerCase().includes(val)) {
        index.push({ id: v.vanNumber, name: `${v.vanNumber} - ${v.vehicleModel}`, category: 'vans', icon: 'fa-van-shuttle' });
      }
    });

    // Index Drivers
    drivers.forEach(d => {
      if (d.name.toLowerCase().includes(val) || d.phone.includes(val) || d.licenseNumber.toLowerCase().includes(val)) {
        index.push({ id: d.id, name: d.name, category: 'drivers', icon: 'fa-id-card' });
      }
    });

    // Index Students
    students.forEach(s => {
      if (s.name.toLowerCase().includes(val) || s.parentName.toLowerCase().includes(val) || s.studentStop.toLowerCase().includes(val)) {
        index.push({ id: s.id, name: `${s.name} (Class ${s.class}-${s.section})`, category: 'students', icon: 'fa-user-graduate' });
      }
    });

    // Index Trips
    trips.forEach(t => {
      if (t.tripId.toLowerCase().includes(val) || t.route.toLowerCase().includes(val)) {
        index.push({ id: t.tripId, name: `${t.tripId}: ${t.route}`, category: 'trips', icon: 'fa-route' });
      }
    });

    // Index Payments
    payments.forEach(p => {
      if (p.studentName.toLowerCase().includes(val)) {
        index.push({ id: p.id, name: `${p.studentName} - Fee Status: ${p.status}`, category: 'payments', icon: 'fa-credit-card' });
      }
    });

    if (index.length === 0) {
      suggestions.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:13px;">No suggestions found.</div>`;
    } else {
      suggestions.innerHTML = index.slice(0, 8).map(item => `
        <div class="suggestion-item" data-category="${item.category}" data-id="${item.id}">
          <div class="suggestion-icon"><i class="fa-solid ${item.icon}"></i></div>
          <div class="suggestion-details">
            <span class="suggestion-name">${item.name}</span>
            <span class="suggestion-category">${item.category}</span>
          </div>
        </div>
      `).join('');

      suggestions.querySelectorAll('.suggestion-item').forEach(el => {
        el.addEventListener('click', () => {
          const cat = el.getAttribute('data-category');
          const id = el.getAttribute('data-id');
          suggestions.style.display = 'none';
          searchInput.value = '';
          
          navigate(cat);
          
          // Trigger search and view logic
          setTimeout(() => {
            const tableSearchInput = document.getElementById(`${cat.slice(0,-1)}-search`);
            if (tableSearchInput) {
              tableSearchInput.value = id;
              AppState.tables[cat].search = id;
              renderActiveSection();
            }
          }, 100);
        });
      });
    }
    
    suggestions.style.display = 'block';
  });

  // Hide suggestion list when clicked outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.style.display = 'none';
    }
  });
}

/* ================= VOICE COMMANDS MODULE ================= */
function initVoice() {
  const micBtn = document.getElementById('voice-search-btn');
  const overlay = document.getElementById('voice-overlay');
  const voiceText = document.getElementById('voice-text');
  
  const voiceSupported = VoiceAssistant.init();
  
  if (!voiceSupported) {
    micBtn.disabled = true;
    micBtn.title = Translations[AppState.currentLang].voiceNotSupported;
    return;
  }

  micBtn.addEventListener('click', () => {
    VoiceAssistant.start(AppState.currentLang);
    playSound('click');
  });

  VoiceAssistant.on('start', () => {
    micBtn.classList.add('listening');
    overlay.classList.add('active');
    voiceText.textContent = Translations[AppState.currentLang].voiceListening;
  });

  VoiceAssistant.on('result', (text) => {
    voiceText.textContent = `"${text}"`;
  });

  VoiceAssistant.on('error', (err) => {
    console.error("Voice Speech Error:", err);
    overlay.classList.remove('active');
    micBtn.classList.remove('listening');
    showToast(Translations[AppState.currentLang].voiceNoSpeech, 'warning');
  });

  VoiceAssistant.on('end', () => {
    micBtn.classList.remove('listening');
    setTimeout(() => overlay.classList.remove('active'), 1500);
  });

  VoiceAssistant.on('command', (command) => {
    console.log("Matched Voice Action Trigger:", command);
    
    if (command.type === 'route') {
      navigate(command.target);
      if (command.filter) {
        setTimeout(() => {
          const filterSelect = document.getElementById('payment-filter-status');
          if (filterSelect) {
            filterSelect.value = command.filter;
            AppState.tables.payments.filter = command.filter;
            renderPaymentsTable();
          }
        }, 100);
      }
      showToast(`${Translations[AppState.currentLang].voiceMatchSuccess} Open ${command.target}`, 'success');
    }
    
    if (command.type === 'search') {
      navigate(command.target);
      setTimeout(() => {
        const input = document.getElementById('student-search');
        if (input) {
          input.value = command.query;
          AppState.tables.students.search = command.query;
          renderStudentsTable();
        }
      }, 100);
      showToast(`${Translations[AppState.currentLang].voiceMatchSuccess} Search student "${command.query}"`, 'success');
    }

    if (command.type === 'global-search') {
      const searchInput = document.getElementById('global-search');
      searchInput.value = command.query;
      searchInput.dispatchEvent(new Event('input'));
      showToast(`${Translations[AppState.currentLang].voiceMatchSuccess} Global query "${command.query}"`, 'success');
    }
  });
}

/* ================= NOTIFICATIONS DRAWER ================= */
function initNotificationDrawer() {
  const btn = document.getElementById('notif-toggle');
  const drawer = document.getElementById('notification-drawer');
  const close = document.getElementById('notif-drawer-close');
  const markRead = document.getElementById('notif-mark-read');
  const clearAll = document.getElementById('notif-clear-all');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    drawer.classList.toggle('open');
    renderNotificationDrawer();
    playSound('click');
  });

  close.addEventListener('click', () => {
    drawer.classList.remove('open');
  });

  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      drawer.classList.remove('open');
    }
  });

  markRead.addEventListener('click', () => {
    const list = Store.getAll(Store.KEYS.NOTIFICATIONS);
    list.forEach(n => n.read = true);
    Store.set(Store.KEYS.NOTIFICATIONS, list);
    showToast("All notifications marked as read.", 'success');
  });

  clearAll.addEventListener('click', () => {
    showConfirm("Clear all notifications?", () => {
      Store.set(Store.KEYS.NOTIFICATIONS, []);
      showToast("Cleared notification ledger.", 'success');
    });
  });
}

function renderNotificationDrawer() {
  const notifs = Store.getAll(Store.KEYS.NOTIFICATIONS) || [];
  const body = document.getElementById('notif-drawer-body');
  const badge = document.getElementById('notif-badge');
  
  const unreadCount = notifs.filter(n => !n.read).length;
  const toggleBtn = document.getElementById('notif-toggle');
  
  if (toggleBtn) {
    if (notifs.length === 0) {
      toggleBtn.style.display = 'none';
    } else {
      toggleBtn.style.display = 'flex';
    }
  }
  
  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }

  if (notifs.length === 0) {
    body.innerHTML = `<div class="table-empty-state"><i class="fa-solid fa-bell-slash"></i><p>${Translations[AppState.currentLang].emptyNotifications}</p></div>`;
    return;
  }

  body.innerHTML = notifs.map(n => {
    const isUnread = !n.read ? 'style="font-weight: 600; border-left: 3px solid var(--primary);"' : '';
    let icon = 'fa-info-circle';
    let typeClass = 'info';
    
    if (n.type === 'Warning') { icon = 'fa-triangle-exclamation'; typeClass = 'warning'; }
    if (n.type === 'Danger') { icon = 'fa-circle-exclamation'; typeClass = 'danger'; }
    if (n.type === 'Success') { icon = 'fa-circle-check'; typeClass = 'success'; }

    const timeString = new Date(n.time).toLocaleString(AppState.currentLang === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return `
      <div class="activity-item" ${isUnread} data-notif-id="${n.id}">
        <div class="activity-icon ${typeClass}"><i class="fa-solid ${icon}"></i></div>
        <div class="activity-details">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; color:var(--text-muted); text-transform:uppercase;">${n.title}</span>
            ${!n.read ? `<span class="badge" style="background-color:var(--primary-light); color:var(--primary); padding:2px 6px; font-size:10px;">New</span>` : ''}
          </div>
          <span class="activity-text" style="margin-top:4px;">${n.message}</span>
          <span class="activity-time">${timeString}</span>
        </div>
      </div>
    `;
  }).join('');

  // Bind click elements to mark individual items as read
  body.querySelectorAll('.activity-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-notif-id');
      const list = Store.getAll(Store.KEYS.NOTIFICATIONS);
      const target = list.find(n => n.id === id);
      if (target && !target.read) {
        target.read = true;
        Store.set(Store.KEYS.NOTIFICATIONS, list);
      }
    });
  });
}

/* ================= DATA DROPDOWNS POPULATOR ================= */
async function populateDriversDropdown(elementId) {
  const select = document.getElementById(elementId);
  if (!select) return;
  
  const drivers = await Db.getAll(Store.KEYS.DRIVERS);
  select.innerHTML = `<option value="">Unassigned / No Driver</option>` + 
    drivers.map(d => `<option value="${d.id}">${d.name} (${d.id})</option>`).join('');
}

async function populateVansDropdown(elementId) {
  const select = document.getElementById(elementId);
  if (!select) return;

  const vans = await Db.getAll(Store.KEYS.VANS);
  select.innerHTML = `<option value="">Unassigned / No Van</option>` +
    vans.map(v => `<option value="${v.vanNumber}">${v.vanNumber} (${v.vehicleModel})</option>`).join('');
}

async function populateStudentsDropdown(elementId) {
  const select = document.getElementById(elementId);
  if (!select) return;

  const students = await Db.getAll(Store.KEYS.STUDENTS);
  select.innerHTML = `<option value="">Select Student</option>` +
    students.map(s => `<option value="${s.name}">${s.name} (Class ${s.class})</option>`).join('');
}

async function populateStudentsFilterOptions() {
  const select = document.getElementById('student-filter-van');
  if (!select) return;

  const vans = await Db.getAll(Store.KEYS.VANS);
  select.innerHTML = `<option value="">${Translations[AppState.currentLang].filterVanAll}</option>` +
    vans.map(v => `<option value="${v.vanNumber}">${v.vanNumber}</option>`).join('');
}

/* ================= PAGINATION HELPER ================= */
function renderPagination(targetKey, filteredCount, elementId, renderFn) {
  const config = AppState.tables[targetKey];
  const paginationContainer = document.getElementById(elementId);
  if (!paginationContainer) return;

  const totalPages = Math.ceil(filteredCount / config.limit) || 1;
  if (config.page > totalPages) config.page = totalPages;

  const start = (config.page - 1) * config.limit + 1;
  const end = Math.min(config.page * config.limit, filteredCount);

  let pagesStr = AppState.currentLang === 'ta'
    ? `${filteredCount} பதிவுகளில் ${start} முதல் ${end} வரை காண்பிக்கிறது`
    : `Showing ${start} to ${end} of ${filteredCount} entries`;
    
  if (filteredCount === 0) {
    pagesStr = AppState.currentLang === 'ta' ? 'பதிவுகள் எதுவும் இல்லை' : 'No entries available';
  }

  paginationContainer.innerHTML = `
    <div>${pagesStr}</div>
    <div class="pagination-controls">
      <button class="pagination-btn" id="${targetKey}-prev-btn" ${config.page === 1 ? 'disabled' : ''}>
        <i class="fa-solid fa-angle-left"></i>
      </button>
      <span style="font-weight: 600;">${config.page} / ${totalPages}</span>
      <button class="pagination-btn" id="${targetKey}-next-btn" ${config.page === totalPages ? 'disabled' : ''}>
        <i class="fa-solid fa-angle-right"></i>
      </button>
    </div>
  `;

  // Bind pagination controls
  const prevBtn = document.getElementById(`${targetKey}-prev-btn`);
  const nextBtn = document.getElementById(`${targetKey}-next-btn`);

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (config.page > 1) {
        config.page--;
        renderFn();
        playSound('click');
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (config.page < totalPages) {
        config.page++;
        renderFn();
        playSound('click');
      }
    });
  }
}

async function renderVansTable() {
  const tbody = document.getElementById('vans-table-body');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="db-loading-spinner-container"><div class="db-spinner"></div><p>Fetching vans...</p></div></td></tr>`;
  }

  const list = await Db.getAll(Store.KEYS.VANS);
  const drivers = await Db.getAll(Store.KEYS.DRIVERS);
  const config = AppState.tables.vans;

  // Filters and Search
  let filtered = list.filter(item => {
    const matchesSearch = item.vanNumber.toLowerCase().includes(config.search.toLowerCase()) ||
                          item.registrationNumber.toLowerCase().includes(config.search.toLowerCase()) ||
                          item.vehicleModel.toLowerCase().includes(config.search.toLowerCase());
    const matchesFilter = config.filter === '' || item.status === config.filter;
    return matchesSearch && matchesFilter;
  });

  // Sorting
  filtered.sort((a, b) => {
    let valA = a[config.sortField];
    let valB = b[config.sortField];
    
    if (typeof valA === 'string') {
      return config.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return config.sortAsc ? valA - valB : valB - valA;
    }
  });

  // Paginated data slice
  const startIdx = (config.page - 1) * config.limit;
  const paginated = filtered.slice(startIdx, startIdx + config.limit);

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-empty-state"><i class="fa-solid fa-van-shuttle"></i><p>No vans match your search criteria.</p></td></tr>`;
  } else {
    tbody.innerHTML = paginated.map(v => {
      const driverObj = drivers.find(d => d.id === v.assignedDriverId);
      const driverName = driverObj ? driverObj.name : 'Unassigned';
      
      const statusClass = v.status.toLowerCase().replace(' ', '');
      
      // Localized status names
      let localizedStatus = v.status;
      if (AppState.currentLang === 'ta') {
        if (v.status === 'Active') localizedStatus = 'செயலில்';
        if (v.status === 'In Service') localizedStatus = 'பணியில்';
        if (v.status === 'Maintenance') localizedStatus = 'பராமரிப்பில்';
      }

      return `
        <tr>
          <td style="font-weight: 600; color: var(--primary);">${v.vanNumber}</td>
          <td>${v.registrationNumber}</td>
          <td>${v.vehicleModel}</td>
          <td><i class="fa-solid fa-chair" style="color:var(--text-muted); margin-right:6px;"></i>${v.capacity}</td>
          <td>${driverName}</td>
          <td><span class="badge badge-${statusClass}">${localizedStatus}</span></td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn-icon edit-btn" data-edit-van="${v.vanNumber}"><i class="fa-solid fa-pen"></i></button>
              <button class="btn-icon delete-btn" data-delete-van="${v.vanNumber}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Edit and Delete events
    tbody.querySelectorAll('[data-edit-van]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-van');
        openVanModal('edit', id);
      });
    });

    tbody.querySelectorAll('[data-delete-van]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-van');
        showConfirm(Translations[AppState.currentLang].confirmDelete, async () => {
          await Db.delete(Store.KEYS.VANS, 'vanNumber', id);
          // Unassign from drivers
          const driversList = await Db.getAll(Store.KEYS.DRIVERS);
          driversList.forEach(d => {
            if (d.assignedVanNumber === id) d.assignedVanNumber = '';
          });
          Store.set(Store.KEYS.DRIVERS, driversList);
          // Unassign from students
          const studentsList = await Db.getAll(Store.KEYS.STUDENTS);
          studentsList.forEach(s => {
            if (s.assignedVanNumber === id) s.assignedVanNumber = '';
          });
          Store.set(Store.KEYS.STUDENTS, studentsList);

          showToast(Translations[AppState.currentLang].successDelete, 'success');
          await renderVansTable();
        });
      });
    });
  }

  renderPagination('vans', filtered.length, 'vans-pagination', renderVansTable);
}

// Bind table search & filter events for Vans
document.getElementById('van-search').addEventListener('input', (e) => {
  AppState.tables.vans.search = e.target.value;
  AppState.tables.vans.page = 1;
  renderVansTable();
});
document.getElementById('van-filter-status').addEventListener('change', (e) => {
  AppState.tables.vans.filter = e.target.value;
  AppState.tables.vans.page = 1;
  renderVansTable();
});

// Bind sorting clicks for Vans Table headers
document.querySelectorAll('#vans-table th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.getAttribute('data-sort');
    const config = AppState.tables.vans;
    if (config.sortField === field) {
      config.sortAsc = !config.sortAsc;
    } else {
      config.sortField = field;
      config.sortAsc = true;
    }
    // Update headers visuals
    document.querySelectorAll('#vans-table th').forEach(el => el.className = '');
    th.className = config.sortAsc ? 'sorted-asc' : 'sorted-desc';
    renderVansTable();
  });
});

async function renderDriversTable() {
  const tbody = document.getElementById('drivers-table-body');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="db-loading-spinner-container"><div class="db-spinner"></div><p>Fetching drivers...</p></div></td></tr>`;
  }

  const list = await Db.getAll(Store.KEYS.DRIVERS);
  const config = AppState.tables.drivers;

  let filtered = list.filter(item => {
    return item.name.toLowerCase().includes(config.search.toLowerCase()) ||
           item.phone.includes(config.search) ||
           item.licenseNumber.toLowerCase().includes(config.search.toLowerCase());
  });

  filtered.sort((a, b) => {
    let valA = a[config.sortField];
    let valB = b[config.sortField];
    
    if (typeof valA === 'string') {
      return config.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return config.sortAsc ? valA - valB : valB - valA;
    }
  });

  const startIdx = (config.page - 1) * config.limit;
  const paginated = filtered.slice(startIdx, startIdx + config.limit);

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="table-empty-state"><i class="fa-solid fa-id-card"></i><p>No drivers found.</p></td></tr>`;
  } else {
    tbody.innerHTML = paginated.map(d => `
      <tr>
        <td style="font-weight:600;">${d.name}</td>
        <td><i class="fa-solid fa-phone" style="color:var(--text-muted); margin-right:6px; font-size:12px;"></i>${d.phone}</td>
        <td><code>${d.licenseNumber}</code></td>
        <td><span style="font-weight:600; color:var(--primary);">${d.assignedVanNumber || 'Unassigned'}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-icon view-btn" data-view-driver="${d.id}"><i class="fa-solid fa-eye"></i></button>
            <button class="btn-icon edit-btn" data-edit-driver="${d.id}"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon delete-btn" data-delete-driver="${d.id}"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-view-driver]').forEach(btn => {
      btn.addEventListener('click', () => openDriverProfile(btn.getAttribute('data-view-driver')));
    });

    tbody.querySelectorAll('[data-edit-driver]').forEach(btn => {
      btn.addEventListener('click', () => openDriverModal('edit', btn.getAttribute('data-edit-driver')));
    });

    tbody.querySelectorAll('[data-delete-driver]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-driver');
        showConfirm(Translations[AppState.currentLang].confirmDelete, async () => {
          await Db.delete(Store.KEYS.DRIVERS, 'id', id);
          // Unassign from vans
          const vansList = await Db.getAll(Store.KEYS.VANS);
          vansList.forEach(v => {
            if (v.assignedDriverId === id) v.assignedDriverId = '';
          });
          Store.set(Store.KEYS.VANS, vansList);

          showToast(Translations[AppState.currentLang].successDelete, 'success');
          await renderDriversTable();
        });
      });
    });
  }

  renderPagination('drivers', filtered.length, 'drivers-pagination', renderDriversTable);
}

document.getElementById('driver-search').addEventListener('input', (e) => {
  AppState.tables.drivers.search = e.target.value;
  AppState.tables.drivers.page = 1;
  renderDriversTable();
});

document.querySelectorAll('#drivers-table th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.getAttribute('data-sort');
    const config = AppState.tables.drivers;
    if (config.sortField === field) {
      config.sortAsc = !config.sortAsc;
    } else {
      config.sortField = field;
      config.sortAsc = true;
    }
    document.querySelectorAll('#drivers-table th').forEach(el => el.className = '');
    th.className = config.sortAsc ? 'sorted-asc' : 'sorted-desc';
    renderDriversTable();
  });
});

async function openDriverProfile(id) {
  const drivers = await Db.getAll(Store.KEYS.DRIVERS);
  const driver = drivers.find(d => d.id === id);
  if (!driver) return;

  const profileBody = document.getElementById('profile-modal-body');
  document.getElementById('profile-modal-title').textContent = Translations[AppState.currentLang].driverProfileTitle;
  
  profileBody.innerHTML = `
    <div class="profile-card-header">
      <div class="profile-avatar-large">${driver.name.charAt(0)}</div>
      <div class="profile-name-group">
        <h4 class="profile-name">${driver.name}</h4>
        <span class="profile-meta">Driver License: ${driver.id}</span>
      </div>
    </div>
    <div class="profile-detail-grid">
      <div class="profile-detail-item">
        <span class="profile-detail-label" data-i18n="driverPhone">Phone</span>
        <span class="profile-detail-val">${driver.phone}</span>
      </div>
      <div class="profile-detail-item">
        <span class="profile-detail-label" data-i18n="driverVan">Assigned Van</span>
        <span class="profile-detail-val">${driver.assignedVanNumber || 'None'}</span>
      </div>
      <div class="profile-detail-item" style="grid-column: span 2;">
        <span class="profile-detail-label" data-i18n="driverLicNum">License Number</span>
        <span class="profile-detail-val">${driver.licenseNumber}</span>
      </div>
      <div class="profile-detail-item" style="grid-column: span 2;">
        <span class="profile-detail-label" data-i18n="driverAddress">Address</span>
        <span class="profile-detail-val">${driver.address}</span>
      </div>
    </div>
  `;

  translateUI(AppState.currentLang, profileBody);
  document.getElementById('modal-profile-view').classList.add('active');
  playSound('click');
}

/* ================= STUDENT LIST MODULE ================= */
async function renderStudentsTable() {
  const tbody = document.getElementById('students-table-body');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="db-loading-spinner-container"><div class="db-spinner"></div><p>Fetching students...</p></div></td></tr>`;
  }

  const list = await Db.getAll(Store.KEYS.STUDENTS);
  const config = AppState.tables.students;

  let filtered = list.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(config.search.toLowerCase()) ||
                          item.parentName.toLowerCase().includes(config.search.toLowerCase()) ||
                          item.studentStop.toLowerCase().includes(config.search.toLowerCase());
    const matchesClass = config.filterClass === '' || item.class === config.filterClass;
    const matchesVan = config.filterVan === '' || item.assignedVanNumber === config.filterVan;
    return matchesSearch && matchesClass && matchesVan;
  });

  filtered.sort((a, b) => {
    let valA = a[config.sortField];
    let valB = b[config.sortField];
    
    if (typeof valA === 'string') {
      return config.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return config.sortAsc ? valA - valB : valB - valA;
    }
  });

  const startIdx = (config.page - 1) * config.limit;
  const paginated = filtered.slice(startIdx, startIdx + config.limit);

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="table-empty-state"><i class="fa-solid fa-user-graduate"></i><p>No students match your filter settings.</p></td></tr>`;
  } else {
    tbody.innerHTML = paginated.map(s => `
      <tr>
        <td style="font-weight:600;">${s.name}</td>
        <td>Class ${s.class}</td>
        <td>${s.section}</td>
        <td>${s.parentName}</td>
        <td><i class="fa-solid fa-phone" style="color:var(--text-muted); margin-right:6px; font-size:12px;"></i>${s.parentPhone}</td>
        <td>${s.studentStop}</td>
        <td><span style="font-weight:600; color:var(--primary);">${s.assignedVanNumber || 'Unassigned'}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-icon view-btn" data-view-student="${s.id}"><i class="fa-solid fa-eye"></i></button>
            <button class="btn-icon edit-btn" data-edit-student="${s.id}"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon delete-btn" data-delete-student="${s.id}"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-view-student]').forEach(btn => {
      btn.addEventListener('click', () => openStudentProfile(btn.getAttribute('data-view-student')));
    });

    tbody.querySelectorAll('[data-edit-student]').forEach(btn => {
      btn.addEventListener('click', () => openStudentModal('edit', btn.getAttribute('data-edit-student')));
    });

    tbody.querySelectorAll('[data-delete-student]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-student');
        showConfirm(Translations[AppState.currentLang].confirmDelete, async () => {
          await Db.delete(Store.KEYS.STUDENTS, 'id', id);
          showToast(Translations[AppState.currentLang].successDelete, 'success');
          await renderStudentsTable();
        });
      });
    });
  }

  renderPagination('students', filtered.length, 'students-pagination', renderStudentsTable);
}

document.getElementById('student-search').addEventListener('input', (e) => {
  AppState.tables.students.search = e.target.value;
  AppState.tables.students.page = 1;
  renderStudentsTable();
});
document.getElementById('student-filter-class').addEventListener('change', (e) => {
  AppState.tables.students.filterClass = e.target.value;
  AppState.tables.students.page = 1;
  renderStudentsTable();
});
document.getElementById('student-filter-van').addEventListener('change', (e) => {
  AppState.tables.students.filterVan = e.target.value;
  AppState.tables.students.page = 1;
  renderStudentsTable();
});

document.querySelectorAll('#students-table th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.getAttribute('data-sort');
    const config = AppState.tables.students;
    if (config.sortField === field) {
      config.sortAsc = !config.sortAsc;
    } else {
      config.sortField = field;
      config.sortAsc = true;
    }
    document.querySelectorAll('#students-table th').forEach(el => el.className = '');
    th.className = config.sortAsc ? 'sorted-asc' : 'sorted-desc';
    renderStudentsTable();
  });
});

async function openStudentProfile(id) {
  const students = await Db.getAll(Store.KEYS.STUDENTS);
  const s = students.find(item => item.id === id);
  if (!s) return;

  const profileBody = document.getElementById('profile-modal-body');
  document.getElementById('profile-modal-title').textContent = Translations[AppState.currentLang].studentProfileTitle;

  profileBody.innerHTML = `
    <div class="profile-card-header">
      <div class="profile-avatar-large">${s.name.charAt(0)}</div>
      <div class="profile-name-group">
        <h4 class="profile-name">${s.name}</h4>
        <span class="profile-meta">Student ID: ${s.id}</span>
      </div>
    </div>
    <div class="profile-detail-grid">
      <div class="profile-detail-item">
        <span class="profile-detail-label" data-i18n="studentClass">Class</span>
        <span class="profile-detail-val">Grade ${s.class} - ${s.section}</span>
      </div>
      <div class="profile-detail-item">
        <span class="profile-detail-label" data-i18n="studentVan">Assigned Van</span>
        <span class="profile-detail-val">${s.assignedVanNumber || 'None'}</span>
      </div>
      <div class="profile-detail-item">
        <span class="profile-detail-label" data-i18n="studentParent">Parent / Guardian</span>
        <span class="profile-detail-val">${s.parentName}</span>
      </div>
      <div class="profile-detail-item">
        <span class="profile-detail-label" data-i18n="studentParentPhone">Parent Phone</span>
        <span class="profile-detail-val">${s.parentPhone}</span>
      </div>
      <div class="profile-detail-item" style="grid-column: span 2;">
        <span class="profile-detail-label" data-i18n="studentStop">Student Stop</span>
        <span class="profile-detail-val">${s.studentStop}</span>
      </div>
    </div>
  `;

  translateUI(AppState.currentLang, profileBody);
  document.getElementById('modal-profile-view').classList.add('active');
  playSound('click');
}

/* ================= TRIP SCHEDULE MODULE ================= */
async function renderTripsTable() {
  const tbody = document.getElementById('trips-table-body');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="db-loading-spinner-container"><div class="db-spinner"></div><p>Fetching trips...</p></div></td></tr>`;
  }

  const list = await Db.getAll(Store.KEYS.TRIPS);
  const drivers = await Db.getAll(Store.KEYS.DRIVERS);
  const config = AppState.tables.trips;

  let filtered = list.filter(item => {
    const matchesSearch = item.tripId.toLowerCase().includes(config.search.toLowerCase()) ||
                          item.route.toLowerCase().includes(config.search.toLowerCase());
    const matchesFilter = config.filter === '' || item.status === config.filter;
    return matchesSearch && matchesFilter;
  });

  filtered.sort((a, b) => {
    let valA = a[config.sortField];
    let valB = b[config.sortField];
    
    if (typeof valA === 'string') {
      return config.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return config.sortAsc ? valA - valB : valB - valA;
    }
  });

  const startIdx = (config.page - 1) * config.limit;
  const paginated = filtered.slice(startIdx, startIdx + config.limit);

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty-state"><i class="fa-solid fa-route"></i><p>No trips Scheduled.</p></td></tr>`;
  } else {
    tbody.innerHTML = paginated.map(t => {
      const driverObj = drivers.find(d => d.id === t.driverId);
      const driverName = driverObj ? driverObj.name : 'Unknown';
      
      const statusClass = t.status.toLowerCase();
      
      let localizedStatus = t.status;
      if (AppState.currentLang === 'ta') {
        if (t.status === 'Scheduled') localizedStatus = 'திட்டமிடப்பட்டது';
        if (t.status === 'Running') localizedStatus = 'இயங்குகிறது';
        if (t.status === 'Completed') localizedStatus = 'முடிந்தது';
      }

      // Quick Actions based on status
      let quickActionHtml = '';
      if (t.status === 'Scheduled') {
        quickActionHtml = `<button class="btn btn-secondary btn-icon" style="width:auto; padding:4px 8px; font-size:11px;" data-start-trip="${t.tripId}" data-i18n="tripStartBtn">Start Trip</button>`;
      } else if (t.status === 'Running') {
        quickActionHtml = `<button class="btn btn-primary btn-icon" style="width:auto; padding:4px 8px; font-size:11px;" data-complete-trip="${t.tripId}" data-i18n="tripCompleteBtn">Complete Trip</button>`;
      }

      return `
        <tr>
          <td style="font-weight:600; color:var(--primary);">${t.tripId}</td>
          <td>${t.date}</td>
          <td style="font-weight:500;">${t.route}</td>
          <td>${driverName}</td>
          <td><span style="font-weight:600;">${t.vanNumber}</span></td>
          <td>${t.startTime}</td>
          <td>${t.endTime}</td>
          <td><span class="badge badge-${statusClass}">${localizedStatus}</span></td>
          <td>
            <div style="display:flex; gap:6px; align-items:center;">
              ${quickActionHtml}
              <button class="btn-icon view-btn" data-view-map="${t.tripId}" title="View Map Route"><i class="fa-solid fa-map-location-dot"></i></button>
              <button class="btn-icon edit-btn" data-edit-trip="${t.tripId}"><i class="fa-solid fa-pen"></i></button>
              <button class="btn-icon delete-btn" data-delete-trip="${t.tripId}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-start-trip]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-start-trip');
        await Db.update(Store.KEYS.TRIPS, 'tripId', id, { status: 'Running' });
        Store.addActivityNotification('info', `Trip ${id} is now running.`, 'Trip Running Alert');
        showToast(Translations[AppState.currentLang].tripRunningSuccess, 'success');
        await renderTripsTable();
      });
    });

    tbody.querySelectorAll('[data-complete-trip]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-complete-trip');
        await Db.update(Store.KEYS.TRIPS, 'tripId', id, { status: 'Completed' });
        Store.addActivityNotification('success', `Trip ${id} has completed safely.`, 'Trip Completed Alert');
        showToast(Translations[AppState.currentLang].tripCompleteSuccess, 'success');
        await renderTripsTable();
      });
    });

    tbody.querySelectorAll('[data-view-map]').forEach(btn => {
      btn.addEventListener('click', () => {
        openRouteMapModal(btn.getAttribute('data-view-map'));
      });
    });

    tbody.querySelectorAll('[data-edit-trip]').forEach(btn => {
      btn.addEventListener('click', () => {
        openTripModal('edit', btn.getAttribute('data-edit-trip'));
      });
    });

    tbody.querySelectorAll('[data-delete-trip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-trip');
        showConfirm(Translations[AppState.currentLang].confirmDelete, async () => {
          await Db.delete(Store.KEYS.TRIPS, 'tripId', id);
          showToast(Translations[AppState.currentLang].successDelete, 'success');
          await renderTripsTable();
        });
      });
    });

    translateUI(AppState.currentLang, tbody);
  }

  renderPagination('trips', filtered.length, 'trips-pagination', renderTripsTable);
}

document.getElementById('trip-search').addEventListener('input', (e) => {
  AppState.tables.trips.search = e.target.value;
  AppState.tables.trips.page = 1;
  renderTripsTable();
});
document.getElementById('trip-filter-status').addEventListener('change', (e) => {
  AppState.tables.trips.filter = e.target.value;
  AppState.tables.trips.page = 1;
  renderTripsTable();
});

document.querySelectorAll('#trips-table th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.getAttribute('data-sort');
    const config = AppState.tables.trips;
    if (config.sortField === field) {
      config.sortAsc = !config.sortAsc;
    } else {
      config.sortField = field;
      config.sortAsc = true;
    }
    document.querySelectorAll('#trips-table th').forEach(el => el.className = '');
    th.className = config.sortAsc ? 'sorted-asc' : 'sorted-desc';
    renderTripsTable();
  });
});

/* ================= ROUTE MAP INTEGRATION ================= */
async function openRouteMapModal(tripId) {
  const trips = await Db.getAll(Store.KEYS.TRIPS);
  const trip = trips.find(t => t.tripId === tripId);
  if (!trip) return;

  const modal = document.getElementById('modal-route-map');
  document.getElementById('route-map-title').innerHTML = `<i class="fa-solid fa-map-location-dot" style="color:var(--primary); margin-right:8px;"></i>Trip Route Map: ${trip.route}`;
  
  modal.classList.add('active');
  playSound('click');

  // Coordinates mapping database (mock Chennai coords)
  const StopCoordinates = {
    'school': [13.0827, 80.2707], // School base
    'adyar': [13.0012, 80.2565],
    'velachery': [12.9815, 80.2180],
    't. nagar': [13.0405, 80.2337],
    'mylapore': [13.0330, 80.2690],
    'guindy': [13.0067, 80.2206],
    'tambaram': [12.9249, 80.1478],
    'chromepet': [12.9516, 80.1404],
    'anna nagar': [13.0850, 80.2101],
    'nungambakkam': [13.0569, 80.2425],
    'besant nagar': [13.0003, 80.2667]
  };

  // Determine stops along the route. 
  // Find students assigned to this trip's van
  const students = await Db.getAll(Store.KEYS.STUDENTS);
  const vanStudents = students.filter(s => s.assignedVanNumber === trip.vanNumber);
  
  // Find which stops we need to visit
  const stopsToVisit = [];
  vanStudents.forEach(s => {
    if (!s.studentStop) return;
    const stopName = s.studentStop.toLowerCase().split(',')[0].trim();
    if (StopCoordinates[stopName] && !stopsToVisit.some(stop => stop.name.toLowerCase().split(',')[0].trim() === stopName)) {
      stopsToVisit.push({ name: s.studentStop, coord: StopCoordinates[stopName], students: [s.name] });
    } else if (StopCoordinates[stopName]) {
      const match = stopsToVisit.find(stop => stop.name.toLowerCase().split(',')[0].trim() === stopName);
      if (match && !match.students.includes(s.name)) {
        match.students.push(s.name);
      }
    }
  });

  // If no students/stops assigned, use a default fallback based on route name matching
  if (stopsToVisit.length === 0) {
    const routeLower = trip.route.toLowerCase();
    Object.keys(StopCoordinates).forEach(key => {
      if (key !== 'school' && routeLower.includes(key)) {
        stopsToVisit.push({ name: key.charAt(0).toUpperCase() + key.slice(1), coord: StopCoordinates[key], students: [] });
      }
    });
  }

  // Initializing Leaflet map. Destroy old instance if present
  if (AppState.routeMap) {
    AppState.routeMap.remove();
    AppState.routeMap = null;
  }

  setTimeout(() => {
    // Center map on School coords
    const map = L.map('route-map').setView(StopCoordinates.school, 12);
    AppState.routeMap = map;

    // Use OpenStreetMap tile layers
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // School Marker (Start Point)
    const schoolIcon = L.divIcon({
      html: '<i class="fa-solid fa-school" style="color: #1B5E20; font-size: 24px; text-shadow: 0 1px 4px rgba(0,0,0,0.3);"></i>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: 'custom-map-icon'
    });
    L.marker(StopCoordinates.school, { icon: schoolIcon })
      .addTo(map)
      .bindPopup('<b>School Transportation Hub</b><br>Start of Route')
      .openPopup();

    const pathPoints = [StopCoordinates.school];

    // Student Stop Markers
    stopsToVisit.forEach((stop, index) => {
      const stopNum = index + 1;
      const stopIcon = L.divIcon({
        html: `<div style="background-color: var(--primary); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; box-shadow: var(--shadow-md); border: 2px solid white;">${stopNum}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: 'custom-map-icon'
      });

      let popupContent = `<b>Stop ${stopNum}: ${stop.name}</b>`;
      if (stop.students.length > 0) {
        popupContent += `<br><b>Boarding Students:</b><br>` + stop.students.map(n => `- ${n}`).join('<br>');
      } else {
        popupContent += `<br>Scheduled Stop`;
      }

      L.marker(stop.coord, { icon: stopIcon })
        .addTo(map)
        .bindPopup(popupContent);

      pathPoints.push(stop.coord);
    });

    // Draw the routing line connecting School -> Stop 1 -> Stop 2 ...
    if (pathPoints.length > 1) {
      const polyline = L.polyline(pathPoints, {
        color: 'var(--primary)',
        weight: 4,
        opacity: 0.7,
        dashArray: '8, 8',
        lineJoin: 'round'
      }).addTo(map);

      // Fit map view bounds to encompass all points
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }

    // Refresh layout size rendering
    map.invalidateSize();
  }, 200);
}

/* ================= FEE PAYMENT MODULE ================= */
async function renderPaymentsTable() {
  const tbody = document.getElementById('payments-table-body');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="db-loading-spinner-container"><div class="db-spinner"></div><p>Fetching payments...</p></div></td></tr>`;
  }

  const list = await Db.getAll(Store.KEYS.PAYMENTS);
  const config = AppState.tables.payments;

  let filtered = list.filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(config.search.toLowerCase());
    const matchesFilter = config.filter === '' || item.status === config.filter;
    return matchesSearch && matchesFilter;
  });

  filtered.sort((a, b) => {
    let valA = a[config.sortField];
    let valB = b[config.sortField];
    
    if (typeof valA === 'string') {
      return config.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return config.sortAsc ? valA - valB : valB - valA;
    }
  });

  const startIdx = (config.page - 1) * config.limit;
  const paginated = filtered.slice(startIdx, startIdx + config.limit);

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="table-empty-state"><i class="fa-solid fa-credit-card"></i><p>No payments recorded.</p></td></tr>`;
  } else {
    tbody.innerHTML = paginated.map(p => {
      const statusClass = p.status.toLowerCase();
      let localizedStatus = p.status;
      if (AppState.currentLang === 'ta') {
        localizedStatus = p.status === 'Paid' ? 'செலுத்தப்பட்டது' : 'நிலுவையில்';
      }

      const localizedMode = p.paymentMode === 'Online'
        ? (AppState.currentLang === 'ta' ? 'ஆன்லைன்' : 'Online')
        : (AppState.currentLang === 'ta' ? 'ஆஃப்லைன்' : 'Offline');
      const modeIcon = p.paymentMode === 'Online' ? 'fa-globe' : 'fa-hand-holding-dollar';

      return `
        <tr>
          <td style="font-weight:600;">${p.studentName}</td>
          <td style="font-weight:600;">₹${p.totalFee}</td>
          <td style="color:var(--success); font-weight:600;">₹${p.paidAmount}</td>
          <td style="color:var(--danger); font-weight:600;">₹${p.pendingAmount}</td>
          <td>${p.paymentDate || '-'}</td>
          <td><i class="fa-solid ${modeIcon}" style="color:var(--text-muted); margin-right:6px; font-size:12px;"></i>${localizedMode}</td>
          <td><span class="badge badge-${statusClass}">${localizedStatus}</span></td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn-icon edit-btn" data-edit-payment="${p.id}"><i class="fa-solid fa-pen"></i></button>
              <button class="btn-icon delete-btn" data-delete-payment="${p.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-edit-payment]').forEach(btn => {
      btn.addEventListener('click', () => {
        openPaymentModal('edit', btn.getAttribute('data-edit-payment'));
      });
    });

    tbody.querySelectorAll('[data-delete-payment]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-payment');
        showConfirm(Translations[AppState.currentLang].confirmDelete, async () => {
          await Db.delete(Store.KEYS.PAYMENTS, 'id', id);
          showToast(Translations[AppState.currentLang].successDelete, 'success');
          await renderPaymentsTable();
        });
      });
    });
  }

  renderPagination('payments', filtered.length, 'payments-pagination', renderPaymentsTable);
}

document.getElementById('payment-search').addEventListener('input', (e) => {
  AppState.tables.payments.search = e.target.value;
  AppState.tables.payments.page = 1;
  renderPaymentsTable();
});
document.getElementById('payment-filter-status').addEventListener('change', (e) => {
  AppState.tables.payments.filter = e.target.value;
  AppState.tables.payments.page = 1;
  renderPaymentsTable();
});

document.querySelectorAll('#payments-table th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.getAttribute('data-sort');
    const config = AppState.tables.payments;
    if (config.sortField === field) {
      config.sortAsc = !config.sortAsc;
    } else {
      config.sortField = field;
      config.sortAsc = true;
    }
    document.querySelectorAll('#payments-table th').forEach(el => el.className = '');
    th.className = config.sortAsc ? 'sorted-asc' : 'sorted-desc';
    renderPaymentsTable();
  });
});

/* ================= REPORTS MODULE ================= */
async function renderReportsModule() {
  const sidebar = document.querySelector('.report-sidebar');
  
  // Re-bind sidebar report selectors
  sidebar.querySelectorAll('.report-sidebar-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      sidebar.querySelectorAll('.report-sidebar-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.activeReportType = btn.getAttribute('data-report-type');
      await renderReportPreviewTable();
      playSound('click');
    });
  });

  await renderReportPreviewTable();
}

async function renderReportPreviewTable() {
  const type = AppState.activeReportType;
  const headerRow = document.getElementById('report-preview-header');
  const tbody = document.getElementById('report-preview-body');
  
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="db-loading-spinner-container"><div class="db-spinner"></div><p>Generating report preview...</p></div></td></tr>`;
  }
  
  if (type === 'students') {
    const students = await Db.getAll(Store.KEYS.STUDENTS);
    headerRow.innerHTML = `
      <th>ID</th>
      <th data-i18n="studentName">Student Name</th>
      <th data-i18n="studentClass">Class</th>
      <th data-i18n="studentSection">Section</th>
      <th data-i18n="studentParent">Parent Name</th>
      <th data-i18n="studentStop">Student Stop</th>
      <th data-i18n="studentVan">Assigned Van</th>
    `;
    tbody.innerHTML = students.map(s => `
      <tr>
        <td><code>${s.id}</code></td>
        <td style="font-weight:600;">${s.name}</td>
        <td>Class ${s.class}</td>
        <td>${s.section}</td>
        <td>${s.parentName}</td>
        <td>${s.studentStop}</td>
        <td><span style="font-weight:600; color:var(--primary);">${s.assignedVanNumber || '-'}</span></td>
      </tr>
    `).join('');
  } 
  else if (type === 'drivers') {
    const drivers = await Db.getAll(Store.KEYS.DRIVERS);
    headerRow.innerHTML = `
      <th>ID</th>
      <th data-i18n="driverName">Driver Name</th>
      <th data-i18n="driverPhone">Phone</th>
      <th data-i18n="driverLicNum">License</th>
      <th data-i18n="driverVan">Assigned Van</th>
    `;
    tbody.innerHTML = drivers.map(d => `
      <tr>
        <td><code>${d.id}</code></td>
        <td style="font-weight:600;">${d.name}</td>
        <td>${d.phone}</td>
        <td><code>${d.licenseNumber}</code></td>
        <td><span style="font-weight:600; color:var(--primary);">${d.assignedVanNumber || '-'}</span></td>
      </tr>
    `).join('');
  } 
  else if (type === 'vans') {
    const vans = await Db.getAll(Store.KEYS.VANS);
    headerRow.innerHTML = `
      <th data-i18n="vanNum">Van Number</th>
      <th data-i18n="vanReg">Registration</th>
      <th data-i18n="vanModel">Model</th>
      <th data-i18n="vanCap">Capacity</th>
      <th data-i18n="vanDriver">Driver ID</th>
      <th data-i18n="vanStatus">Status</th>
    `;
    tbody.innerHTML = vans.map(v => `
      <tr>
        <td style="font-weight:600; color:var(--primary);">${v.vanNumber}</td>
        <td>${v.registrationNumber}</td>
        <td>${v.vehicleModel}</td>
        <td>${v.capacity}</td>
        <td><code>${v.assignedDriverId || '-'}</code></td>
        <td>${v.status}</td>
      </tr>
    `).join('');
  } 
  else if (type === 'payments') {
    const payments = await Db.getAll(Store.KEYS.PAYMENTS);
    headerRow.innerHTML = `
      <th>ID</th>
      <th data-i18n="payStudent">Student</th>
      <th data-i18n="payTotal">Total Fee</th>
      <th data-i18n="payPaid">Paid</th>
      <th data-i18n="payPending">Pending</th>
      <th data-i18n="payDate">Date</th>
      <th data-i18n="payMode">Mode</th>
      <th data-i18n="payStatus">Status</th>
    `;
    tbody.innerHTML = payments.map(p => `
      <tr>
        <td><code>${p.id}</code></td>
        <td style="font-weight:600;">${p.studentName}</td>
        <td style="font-weight:600;">₹${p.totalFee}</td>
        <td style="color:var(--success); font-weight:600;">₹${p.paidAmount}</td>
        <td style="color:var(--danger); font-weight:600;">₹${p.pendingAmount}</td>
        <td>${p.paymentDate || '-'}</td>
        <td>${p.paymentMode || '-'}</td>
        <td>${p.status}</td>
      </tr>
    `).join('');
  }

  translateUI(AppState.currentLang, headerRow);
}

// CSV Export Trigger
document.getElementById('btn-export-csv').addEventListener('click', async () => {
  const type = AppState.activeReportType;
  let headers = [];
  let rows = [];
  
  if (type === 'students') {
    headers = ['Student ID', 'Name', 'Class', 'Section', 'Parent Name', 'Parent Phone', 'Student Stop', 'Assigned Van'];
    const students = await Db.getAll(Store.KEYS.STUDENTS);
    rows = students.map(s => [
      s.id, s.name, s.class, s.section, s.parentName, s.parentPhone, s.studentStop, s.assignedVanNumber || 'None'
    ]);
  } else if (type === 'drivers') {
    headers = ['Driver ID', 'Name', 'Phone', 'Address', 'License Number', 'Assigned Van'];
    const drivers = await Db.getAll(Store.KEYS.DRIVERS);
    rows = drivers.map(d => [
      d.id, d.name, d.phone, d.address, d.licenseNumber, d.assignedVanNumber || 'None'
    ]);
  } else if (type === 'vans') {
    headers = ['Van Number', 'Registration Number', 'Vehicle Model', 'Capacity', 'Assigned Driver ID', 'Status'];
    const vans = await Db.getAll(Store.KEYS.VANS);
    rows = vans.map(v => [
      v.vanNumber, v.registrationNumber, v.vehicleModel, v.capacity, v.assignedDriverId || 'None', v.status
    ]);
  } else if (type === 'payments') {
    headers = ['Payment ID', 'Student Name', 'Total Fee', 'Paid Amount', 'Pending Amount', 'Payment Date', 'Payment Mode', 'Status'];
    const payments = await Db.getAll(Store.KEYS.PAYMENTS);
    rows = payments.map(p => [
      p.id, p.studentName, p.totalFee, p.paidAmount, p.pendingAmount, p.paymentDate || 'N/A', p.paymentMode || 'N/A', p.status
    ]);
  }

  // Format CSV String content
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  // Trigger browser download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `School_Transportation_${type}_Report_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast(AppState.currentLang === 'ta' ? 'அறிக்கை பதிவிறக்கம் செய்யப்பட்டது!' : 'CSV Report downloaded successfully!', 'success');
});

/* ================= SETTINGS PANEL CONTROLS ================= */
function initSettings() {
  const langSelect = document.getElementById('settings-lang');
  const themeSelect = document.getElementById('settings-theme');
  const soundToggle = document.getElementById('settings-sound');
  const pushToggle = document.getElementById('settings-push');
  const resetBtn = document.getElementById('btn-reset-demo');

  // Supabase Sync UI controls
  const dbModeSelect = document.getElementById('settings-db-mode');
  const supabaseInputs = document.getElementById('supabase-config-inputs');
  const supabaseUrlInput = document.getElementById('settings-supabase-url');
  const supabaseKeyInput = document.getElementById('settings-supabase-key');
  const testDbBtn = document.getElementById('btn-test-db');
  const dbStatusSpan = document.getElementById('db-connection-status');
  const copySqlBtn = document.getElementById('btn-copy-sql');
  const sqlTextarea = document.getElementById('db-sql-schema');

  // Load current settings values
  const settings = Store.get(Store.KEYS.SETTINGS) || {};
  dbModeSelect.value = settings.dbMode || 'local';
  supabaseUrlInput.value = settings.supabaseUrl || '';
  supabaseKeyInput.value = settings.supabaseKey || '';

  if (dbModeSelect.value === 'supabase') {
    supabaseInputs.style.display = 'block';
  } else {
    supabaseInputs.style.display = 'none';
  }

  dbModeSelect.addEventListener('change', async (e) => {
    if (e.target.value === 'supabase') {
      supabaseInputs.style.display = 'block';
    } else {
      supabaseInputs.style.display = 'none';
      
      const settings = Store.get(Store.KEYS.SETTINGS);
      settings.dbMode = 'local';
      Store.set(Store.KEYS.SETTINGS, settings);
      Db.init(); // Reinitialize offline fallback
      showToast("Switched to Local Offline Database mode", "success");
      await updateKpis();
      await renderActiveSection();
    }
  });

  testDbBtn.addEventListener('click', async () => {
    const url = supabaseUrlInput.value.trim();
    const key = supabaseKeyInput.value.trim();

    if (!url || !key) {
      dbStatusSpan.textContent = "URL and Key are required!";
      dbStatusSpan.className = "status-error";
      showToast("Please enter both URL and API Key", "danger");
      return;
    }

    dbStatusSpan.textContent = "Testing connection...";
    dbStatusSpan.className = "";
    testDbBtn.disabled = true;

    const result = await Db.testConnection(url, key);
    testDbBtn.disabled = false;

    if (result.success) {
      dbStatusSpan.textContent = "Connected successfully!";
      dbStatusSpan.className = "status-success";
      showToast("Cloud Connection Successful!", "success");

      // Save configurations
      const settings = Store.get(Store.KEYS.SETTINGS);
      settings.dbMode = 'supabase';
      settings.supabaseUrl = url;
      settings.supabaseKey = key;
      Store.set(Store.KEYS.SETTINGS, settings);
      
      // Initialize Db global instance
      Db.init();

      // Trigger automatic sync of current local data to Supabase Cloud
      showToast("Syncing local tables to Supabase Cloud...", "info");
      const syncResult = await Db.syncLocalToCloud();
      if (syncResult) {
        showToast("Synchronized initial tables successfully!", "success");
      } else {
        showToast("Table sync encountered warnings. Please make sure SQL schema was run.", "warning");
      }
      
      await updateKpis();
      await renderActiveSection();
    } else {
      dbStatusSpan.textContent = "Connection failed: " + result.message;
      dbStatusSpan.className = "status-error";
      showToast("Failed to connect. Verify database URL, key, and tables.", "danger");
    }
  });

  copySqlBtn.addEventListener('click', () => {
    sqlTextarea.select();
    document.execCommand('copy');
    showToast("SQL Table schema copied to clipboard!", "success");
  });

  // Bind change states
  langSelect.addEventListener('change', (e) => {
    updateLang(e.target.value);
    const settings = Store.get(Store.KEYS.SETTINGS);
    settings.language = e.target.value;
    Store.set(Store.KEYS.SETTINGS, settings);
  });

  themeSelect.addEventListener('change', (e) => {
    updateTheme(e.target.value);
    const settings = Store.get(Store.KEYS.SETTINGS);
    settings.theme = e.target.value;
    Store.set(Store.KEYS.SETTINGS, settings);
  });

  soundToggle.addEventListener('change', (e) => {
    const settings = Store.get(Store.KEYS.SETTINGS);
    settings.soundEnabled = e.target.checked;
    Store.set(Store.KEYS.SETTINGS, settings);
    playSound('click');
  });

  pushToggle.addEventListener('change', (e) => {
    const settings = Store.get(Store.KEYS.SETTINGS);
    settings.pushNotifications = e.target.checked;
    Store.set(Store.KEYS.SETTINGS, settings);
    playSound('click');
  });

  resetBtn.addEventListener('click', () => {
    showConfirm(Translations[AppState.currentLang].resetWarning, () => {
      Store.resetDemoData();
    });
  });
}

/* ================= CRUD MODAL MANAGEMENT FORMS ================= */
function initForms() {
  // 1. Van Form
  document.getElementById('btn-add-van').addEventListener('click', () => openVanModal('add'));
  document.getElementById('form-van').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitVanForm();
  });

  // 2. Driver Form
  document.getElementById('btn-add-driver').addEventListener('click', () => openDriverModal('add'));
  document.getElementById('form-driver').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitDriverForm();
  });

  // 3. Student Form
  document.getElementById('btn-add-student').addEventListener('click', () => openStudentModal('add'));
  document.getElementById('form-student').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitStudentForm();
  });

  // 4. Trip Form
  document.getElementById('btn-add-trip').addEventListener('click', () => openTripModal('add'));
  document.getElementById('form-trip').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitTripForm();
  });

  // 5. Payment Form
  document.getElementById('btn-add-payment').addEventListener('click', () => openPaymentModal('add'));
  document.getElementById('form-payment').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitPaymentForm();
  });
}

// -- Van CRUD helper modals --
function openVanModal(mode, id = null) {
  const modal = document.getElementById('modal-van');
  const form = document.getElementById('form-van');
  form.reset();
  
  // reset errors
  modal.querySelectorAll('.inline-error').forEach(el => el.style.display = 'none');
  
  const title = document.getElementById('van-modal-title');
  document.getElementById('van-form-mode').value = mode;
  document.getElementById('van-num').readOnly = false;

  if (mode === 'add') {
    title.textContent = AppState.currentLang === 'ta' ? 'புதிய வண்டி சேர்' : 'Add New Van';
  } else {
    title.textContent = AppState.currentLang === 'ta' ? 'வண்டி திருத்து' : 'Edit Van';
    const vans = Store.getAll(Store.KEYS.VANS);
    const vanObj = vans.find(v => v.vanNumber === id);
    if (vanObj) {
      document.getElementById('van-num').value = vanObj.vanNumber;
      document.getElementById('van-num').readOnly = true;
      document.getElementById('van-reg').value = vanObj.registrationNumber;
      document.getElementById('van-model').value = vanObj.vehicleModel;
      document.getElementById('van-cap').value = vanObj.capacity;
      document.getElementById('van-driver').value = vanObj.assignedDriverId || '';
      document.getElementById('van-status').value = vanObj.status;
    }
  }
  
  translateUI(AppState.currentLang, modal);
  modal.classList.add('active');
  playSound('click');
}

async function submitVanForm() {
  const mode = document.getElementById('van-form-mode').value;
  const num = document.getElementById('van-num').value.trim();
  const reg = document.getElementById('van-reg').value.trim();
  const model = document.getElementById('van-model').value.trim();
  const cap = parseInt(document.getElementById('van-cap').value);
  const driverId = document.getElementById('van-driver').value;
  const status = document.getElementById('van-status').value;

  let valid = true;
  document.querySelectorAll('#modal-van .inline-error').forEach(el => el.style.display = 'none');

  if (!num) {
    document.getElementById('error-van-num').style.display = 'block';
    valid = false;
  } else if (mode === 'add') {
    const existingVans = await Db.getAll(Store.KEYS.VANS);
    const exists = existingVans.some(v => v.vanNumber.toLowerCase() === num.toLowerCase());
    if (exists) {
      document.getElementById('error-van-num').textContent = "Van Number already exists!";
      document.getElementById('error-van-num').style.display = 'block';
      valid = false;
    }
  }

  if (!reg) {
    document.getElementById('error-van-reg').style.display = 'block';
    valid = false;
  }
  if (!model) {
    document.getElementById('error-van-model').style.display = 'block';
    valid = false;
  }
  if (isNaN(cap) || cap <= 0) {
    document.getElementById('error-van-cap').style.display = 'block';
    valid = false;
  }

  if (!valid) {
    playSound('error');
    return;
  }

  const vanData = {
    vanNumber: num,
    registrationNumber: reg,
    vehicleModel: model,
    capacity: cap,
    assignedDriverId: driverId || '',
    status: status
  };

  if (mode === 'add') {
    await Db.add(Store.KEYS.VANS, vanData);
    Store.addActivityNotification('success', `Van ${num} (${model}) was added.`, 'Van Added');
    showToast(Translations[AppState.currentLang].successAdd, 'success');
  } else {
    await Db.update(Store.KEYS.VANS, 'vanNumber', num, vanData);
    showToast(Translations[AppState.currentLang].successUpdate, 'success');
  }

  // Cross sync driver assigned van reference (local store only for references)
  const driversList = Store.getAll(Store.KEYS.DRIVERS);
  driversList.forEach(d => {
    if (d.assignedVanNumber === num) d.assignedVanNumber = '';
  });
  if (driverId) {
    const driverObj = driversList.find(d => d.id === driverId);
    if (driverObj) driverObj.assignedVanNumber = num;
  }
  Store.set(Store.KEYS.DRIVERS, driversList);

  document.getElementById('modal-van').classList.remove('active');
  await renderVansTable();
}

// -- Driver CRUD helper modals --
function openDriverModal(mode, id = null) {
  const modal = document.getElementById('modal-driver');
  const form = document.getElementById('form-driver');
  form.reset();
  modal.querySelectorAll('.inline-error').forEach(el => el.style.display = 'none');

  document.getElementById('driver-form-mode').value = mode;

  if (mode === 'add') {
    document.getElementById('driver-modal-title').textContent = AppState.currentLang === 'ta' ? 'புதிய ஓட்டுநர் சேர்' : 'Add New Driver';
    document.getElementById('driver-form-id').value = 'D-' + Date.now().toString().slice(-4);
  } else {
    document.getElementById('driver-modal-title').textContent = AppState.currentLang === 'ta' ? 'ஓட்டுநர் திருத்து' : 'Edit Driver';
    const drivers = Store.getAll(Store.KEYS.DRIVERS);
    const driverObj = drivers.find(d => d.id === id);
    if (driverObj) {
      document.getElementById('driver-form-id').value = driverObj.id;
      document.getElementById('driver-name').value = driverObj.name;
      document.getElementById('driver-phone').value = driverObj.phone;
      document.getElementById('driver-address').value = driverObj.address;
      document.getElementById('driver-lic').value = driverObj.licenseNumber;
      document.getElementById('driver-van').value = driverObj.assignedVanNumber || '';
    }
  }

  translateUI(AppState.currentLang, modal);
  modal.classList.add('active');
  playSound('click');
}

async function submitDriverForm() {
  const mode = document.getElementById('driver-form-mode').value;
  const id = document.getElementById('driver-form-id').value;
  const name = document.getElementById('driver-name').value.trim();
  const phone = document.getElementById('driver-phone').value.trim();
  const address = document.getElementById('driver-address').value.trim();
  const lic = document.getElementById('driver-lic').value.trim();
  const vanNum = document.getElementById('driver-van').value;

  let valid = true;
  document.querySelectorAll('#modal-driver .inline-error').forEach(el => el.style.display = 'none');

  if (!name) {
    document.getElementById('error-driver-name').style.display = 'block';
    valid = false;
  }
  if (!phone || !/^\d{10}$/.test(phone)) {
    document.getElementById('error-driver-phone').style.display = 'block';
    valid = false;
  }
  if (!address) {
    document.getElementById('error-driver-address').style.display = 'block';
    valid = false;
  }
  if (!lic) {
    document.getElementById('error-driver-lic').style.display = 'block';
    valid = false;
  }

  if (!valid) {
    playSound('error');
    return;
  }

  const driverData = {
    id: id,
    name: name,
    phone: phone,
    address: address,
    licenseNumber: lic,
    assignedVanNumber: vanNum || ''
  };

  if (mode === 'add') {
    await Db.add(Store.KEYS.DRIVERS, driverData);
    Store.addActivityNotification('success', `Driver ${name} was added successfully.`, 'Driver Added');
    showToast(Translations[AppState.currentLang].successAdd, 'success');
  } else {
    await Db.update(Store.KEYS.DRIVERS, 'id', id, driverData);
    showToast(Translations[AppState.currentLang].successUpdate, 'success');
  }

  // Sync van assignment references (local store cross-reference)
  const vansList = Store.getAll(Store.KEYS.VANS);
  vansList.forEach(v => {
    if (v.assignedDriverId === id) v.assignedDriverId = '';
  });
  if (vanNum) {
    const vanObj = vansList.find(v => v.vanNumber === vanNum);
    if (vanObj) vanObj.assignedDriverId = id;
  }
  Store.set(Store.KEYS.VANS, vansList);

  document.getElementById('modal-driver').classList.remove('active');
  await renderDriversTable();
}

// -- Student CRUD helper modals --
function openStudentModal(mode, id = null) {
  const modal = document.getElementById('modal-student');
  const form = document.getElementById('form-student');
  form.reset();
  modal.querySelectorAll('.inline-error').forEach(el => el.style.display = 'none');

  document.getElementById('student-form-mode').value = mode;

  if (mode === 'add') {
    document.getElementById('student-modal-title').textContent = AppState.currentLang === 'ta' ? 'புதிய மாணவர் சேர்' : 'Add New Student';
    document.getElementById('student-form-id').value = 'S-' + Date.now().toString().slice(-4);
  } else {
    document.getElementById('student-modal-title').textContent = AppState.currentLang === 'ta' ? 'மாணவர் திருத்து' : 'Edit Student';
    const students = Store.getAll(Store.KEYS.STUDENTS);
    const s = students.find(item => item.id === id);
    if (s) {
      document.getElementById('student-form-id').value = s.id;
      document.getElementById('student-name').value = s.name;
      document.getElementById('student-class').value = s.class;
      document.getElementById('student-sec').value = s.section;
      document.getElementById('student-parent').value = s.parentName;
      document.getElementById('student-parent-phone').value = s.parentPhone;
      document.getElementById('student-stop').value = s.studentStop;
      document.getElementById('student-van').value = s.assignedVanNumber || '';
    }
  }

  translateUI(AppState.currentLang, modal);
  modal.classList.add('active');
  playSound('click');
}

async function submitStudentForm() {
  const mode = document.getElementById('student-form-mode').value;
  const id = document.getElementById('student-form-id').value;
  const name = document.getElementById('student-name').value.trim();
  const cls = document.getElementById('student-class').value.trim();
  const sec = document.getElementById('student-sec').value.trim();
  const parentName = document.getElementById('student-parent').value.trim();
  const parentPhone = document.getElementById('student-parent-phone').value.trim();
  const pickup = document.getElementById('student-stop').value.trim();
  const vanNum = document.getElementById('student-van').value;

  let valid = true;
  document.querySelectorAll('#modal-student .inline-error').forEach(el => el.style.display = 'none');

  if (!name) {
    document.getElementById('error-student-name').style.display = 'block';
    valid = false;
  }
  if (!cls) {
    document.getElementById('error-student-class').style.display = 'block';
    valid = false;
  }
  if (!sec) {
    document.getElementById('error-student-sec').style.display = 'block';
    valid = false;
  }
  if (!parentName) {
    document.getElementById('error-student-parent').style.display = 'block';
    valid = false;
  }
  if (!parentPhone || !/^\d{10}$/.test(parentPhone)) {
    document.getElementById('error-student-parent-phone').style.display = 'block';
    valid = false;
  }
  if (!pickup) {
    document.getElementById('error-student-stop').style.display = 'block';
    valid = false;
  }

  if (!valid) {
    playSound('error');
    return;
  }

  const studentData = {
    id, name, class: cls, section: sec, parentName, parentPhone, studentStop: pickup, assignedVanNumber: vanNum || ''
  };

  if (mode === 'add') {
    await Db.add(Store.KEYS.STUDENTS, studentData);
    
    // Auto-create a default payment record for new student
    const newPayment = {
      id: 'P-' + Date.now().toString().slice(-4),
      studentName: name,
      totalFee: 3000,
      paidAmount: 0,
      pendingAmount: 3000,
      paymentDate: '',
      paymentMode: 'Online',
      status: 'Pending'
    };
    await Db.add(Store.KEYS.PAYMENTS, newPayment);
    Store.addActivityNotification('success', `Student ${name} enrolled and payment record created.`, 'Student Enrolled');
    showToast(Translations[AppState.currentLang].successAdd, 'success');
  } else {
    const allStudents = await Db.getAll(Store.KEYS.STUDENTS);
    const originalStudent = allStudents.find(s => s.id === id);
    await Db.update(Store.KEYS.STUDENTS, 'id', id, studentData);
    
    // Update payments if student name changed
    if (originalStudent && originalStudent.name !== name) {
      const payments = Store.getAll(Store.KEYS.PAYMENTS);
      payments.forEach(p => {
        if (p.studentName === originalStudent.name) p.studentName = name;
      });
      Store.set(Store.KEYS.PAYMENTS, payments);
    }
    showToast(Translations[AppState.currentLang].successUpdate, 'success');
  }

  document.getElementById('modal-student').classList.remove('active');
  await renderStudentsTable();
}

// -- Trip CRUD helper modals --
function openTripModal(mode, id = null) {
  const modal = document.getElementById('modal-trip');
  const form = document.getElementById('form-trip');
  form.reset();
  modal.querySelectorAll('.inline-error').forEach(el => el.style.display = 'none');

  document.getElementById('trip-form-mode').value = mode;
  document.getElementById('trip-id').readOnly = false;

  if (mode === 'add') {
    document.getElementById('trip-modal-title').textContent = AppState.currentLang === 'ta' ? 'பயணம் திட்டமிடு' : 'Schedule New Trip';
  } else {
    document.getElementById('trip-modal-title').textContent = AppState.currentLang === 'ta' ? 'பயணம் திருத்து' : 'Edit Scheduled Trip';
    const trips = Store.getAll(Store.KEYS.TRIPS);
    const tripObj = trips.find(t => t.tripId === id);
    if (tripObj) {
      document.getElementById('trip-id').value = tripObj.tripId;
      document.getElementById('trip-id').readOnly = true;
      document.getElementById('trip-date').value = tripObj.date;
      document.getElementById('trip-route').value = tripObj.route;
      document.getElementById('trip-driver').value = tripObj.driverId || '';
      document.getElementById('trip-van').value = tripObj.vanNumber || '';
      document.getElementById('trip-start').value = tripObj.startTime;
      document.getElementById('trip-end').value = tripObj.endTime;
    }
  }

  translateUI(AppState.currentLang, modal);
  modal.classList.add('active');
  playSound('click');
}

async function submitTripForm() {
  const mode = document.getElementById('trip-form-mode').value;
  const id = document.getElementById('trip-id').value.trim();
  const date = document.getElementById('trip-date').value;
  const route = document.getElementById('trip-route').value.trim();
  const driverId = document.getElementById('trip-driver').value;
  const vanNum = document.getElementById('trip-van').value;
  const start = document.getElementById('trip-start').value;
  const end = document.getElementById('trip-end').value;

  let valid = true;
  document.querySelectorAll('#modal-trip .inline-error').forEach(el => el.style.display = 'none');

  if (!id) {
    document.getElementById('error-trip-id').style.display = 'block';
    valid = false;
  } else if (mode === 'add') {
    const existingTrips = await Db.getAll(Store.KEYS.TRIPS);
    const exists = existingTrips.some(t => t.tripId.toLowerCase() === id.toLowerCase());
    if (exists) {
      document.getElementById('error-trip-id').textContent = "Trip ID already exists!";
      document.getElementById('error-trip-id').style.display = 'block';
      valid = false;
    }
  }

  if (!date) {
    document.getElementById('error-trip-date').style.display = 'block';
    valid = false;
  }
  if (!route) {
    document.getElementById('error-trip-route').style.display = 'block';
    valid = false;
  }
  if (!start) {
    document.getElementById('error-trip-start').style.display = 'block';
    valid = false;
  }
  if (!end) {
    document.getElementById('error-trip-end').style.display = 'block';
    valid = false;
  }

  if (!valid) {
    playSound('error');
    return;
  }

  const tripData = {
    tripId: id,
    date: date,
    route: route,
    driverId: driverId || '',
    vanNumber: vanNum || '',
    startTime: start,
    endTime: end,
    status: 'Scheduled'
  };

  if (mode === 'add') {
    await Db.add(Store.KEYS.TRIPS, tripData);
    Store.addActivityNotification('info', `Trip ${id} scheduled for ${date} on route: ${route}.`, 'Trip Created');
    showToast(Translations[AppState.currentLang].successAdd, 'success');
  } else {
    // Preserve original status when editing an existing trip
    const allTrips = await Db.getAll(Store.KEYS.TRIPS);
    const orig = allTrips.find(t => t.tripId === id);
    if (orig) tripData.status = orig.status;
    await Db.update(Store.KEYS.TRIPS, 'tripId', id, tripData);
    showToast(Translations[AppState.currentLang].successUpdate, 'success');
  }

  document.getElementById('modal-trip').classList.remove('active');
  await renderTripsTable();
}

// -- Payment CRUD helper modals --
function openPaymentModal(mode, id = null) {
  const modal = document.getElementById('modal-payment');
  const form = document.getElementById('form-payment');
  form.reset();
  modal.querySelectorAll('.inline-error').forEach(el => el.style.display = 'none');

  document.getElementById('payment-form-mode').value = mode;

  if (mode === 'add') {
    document.getElementById('payment-modal-title').textContent = AppState.currentLang === 'ta' ? 'புதிய கட்டணம் பதிவுசெய்' : 'Record New Fee Payment';
    document.getElementById('payment-form-id').value = 'P-' + Date.now().toString().slice(-4);
  } else {
    document.getElementById('payment-modal-title').textContent = AppState.currentLang === 'ta' ? 'கட்டணம் திருத்து' : 'Edit Fee Payment';
    const payments = Store.getAll(Store.KEYS.PAYMENTS);
    const pObj = payments.find(p => p.id === id);
    if (pObj) {
      document.getElementById('payment-form-id').value = pObj.id;
      document.getElementById('payment-student').value = pObj.studentName;
      document.getElementById('payment-total').value = pObj.totalFee;
      document.getElementById('payment-paid').value = pObj.paidAmount;
      document.getElementById('payment-date').value = pObj.paymentDate;
      document.getElementById('payment-mode').value = pObj.paymentMode || 'Online';
      document.getElementById('payment-status').value = pObj.status;
    }
  }

  translateUI(AppState.currentLang, modal);
  modal.classList.add('active');
  playSound('click');
}

async function submitPaymentForm() {
  const mode = document.getElementById('payment-form-mode').value;
  const id = document.getElementById('payment-form-id').value;
  const student = document.getElementById('payment-student').value;
  const total = parseFloat(document.getElementById('payment-total').value);
  const paid = parseFloat(document.getElementById('payment-paid').value);
  const date = document.getElementById('payment-date').value;
  const payMode = document.getElementById('payment-mode').value;
  const status = document.getElementById('payment-status').value;

  let valid = true;
  document.querySelectorAll('#modal-payment .inline-error').forEach(el => el.style.display = 'none');

  if (!student) {
    showToast("Please choose a student.", "warning");
    valid = false;
  }
  if (isNaN(total) || total < 0) {
    document.getElementById('error-payment-total').style.display = 'block';
    valid = false;
  }
  if (isNaN(paid) || paid < 0 || paid > total) {
    document.getElementById('error-payment-paid').style.display = 'block';
    valid = false;
  }
  if (!date) {
    document.getElementById('error-payment-date').style.display = 'block';
    valid = false;
  }

  if (!valid) {
    playSound('error');
    return;
  }

  const paymentData = {
    id: id,
    studentName: student,
    totalFee: total,
    paidAmount: paid,
    pendingAmount: total - paid,
    paymentDate: date,
    paymentMode: payMode,
    status: status
  };

  if (mode === 'add') {
    await Db.add(Store.KEYS.PAYMENTS, paymentData);
    const notifMsg = status === 'Paid'
      ? `Payment of ₹${paid} received from ${student} via ${payMode}.`
      : `Fee record created for ${student}. ₹${total - paid} pending.`;
    Store.addActivityNotification(status === 'Paid' ? 'success' : 'warning', notifMsg, 'Payment Recorded');
    showToast(Translations[AppState.currentLang].successAdd, 'success');
  } else {
    await Db.update(Store.KEYS.PAYMENTS, 'id', id, paymentData);
    showToast(Translations[AppState.currentLang].successUpdate, 'success');
  }

  document.getElementById('modal-payment').classList.remove('active');
  await renderPaymentsTable();
}
