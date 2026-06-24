/**
 * School Van Management System - Local Storage Engine (store.js)
 * Provides CRUD capabilities and handles mock data seeding.
 */

const KEYS = {
  VANS: 'school_vans',
  DRIVERS: 'school_drivers',
  STUDENTS: 'school_students',
  TRIPS: 'school_trips',
  PAYMENTS: 'school_payments',
  NOTIFICATIONS: 'school_notifications',
  SETTINGS: 'school_settings',
  LOGGED_IN: 'school_logged_in'
};

const DEFAULT_VANS = [
  { vanNumber: 'V-01', registrationNumber: 'TN-01-AB-1234', vehicleModel: 'Tata Winger', capacity: 15, assignedDriverId: 'D-01', status: 'Active' },
  { vanNumber: 'V-02', registrationNumber: 'TN-02-CD-5678', vehicleModel: 'Force Traveller', capacity: 20, assignedDriverId: 'D-02', status: 'Active' },
  { vanNumber: 'V-03', registrationNumber: 'TN-03-EF-9012', vehicleModel: 'Maruti Omni', capacity: 8, assignedDriverId: 'D-03', status: 'Maintenance' },
  { vanNumber: 'V-04', registrationNumber: 'TN-04-GH-3456', vehicleModel: 'Mahindra Tourister', capacity: 18, assignedDriverId: 'D-04', status: 'Active' },
  { vanNumber: 'V-05', registrationNumber: 'TN-05-IJ-7890', vehicleModel: 'Tata Magic', capacity: 10, assignedDriverId: 'D-05', status: 'In Service' }
];

const DEFAULT_DRIVERS = [
  { id: 'D-01', name: 'Karthik R', phone: '9876543210', address: '12, Main St, Chennai', licenseNumber: 'DL-12345678901', assignedVanNumber: 'V-01' },
  { id: 'D-02', name: 'Suresh Kumar', phone: '9876543211', address: '45, West Cross Rd, Chennai', licenseNumber: 'DL-98765432102', assignedVanNumber: 'V-02' },
  { id: 'D-03', name: 'Ramesh A', phone: '9876543212', address: '78, North Street, Chennai', licenseNumber: 'DL-56789012345', assignedVanNumber: 'V-03' },
  { id: 'D-04', name: 'Vijay K', phone: '9876543213', address: '9, East Mada St, Chennai', licenseNumber: 'DL-78901234567', assignedVanNumber: 'V-04' },
  { id: 'D-05', name: 'Anand S', phone: '9876543214', address: '56, Outer Ring Rd, Chennai', licenseNumber: 'DL-34567890123', assignedVanNumber: 'V-05' }
];

const DEFAULT_STUDENTS = [
  { id: 'S-01', name: 'Ravi Kumar', class: '10', section: 'A', parentName: 'Suresh Kumar', parentPhone: '9876543222', studentStop: 'Adyar, Chennai', assignedVanNumber: 'V-01' },
  { id: 'S-02', name: 'Priya S', class: '9', section: 'B', parentName: 'Sundar', parentPhone: '9876543223', studentStop: 'Velachery, Chennai', assignedVanNumber: 'V-01' },
  { id: 'S-03', name: 'Aravind K', class: '8', section: 'A', parentName: 'Krishnan', parentPhone: '9876543224', studentStop: 'T. Nagar, Chennai', assignedVanNumber: 'V-02' },
  { id: 'S-04', name: 'Divya R', class: '11', section: 'C', parentName: 'Raj', parentPhone: '9876543225', studentStop: 'Mylapore, Chennai', assignedVanNumber: 'V-02' },
  { id: 'S-05', name: 'Hariharan M', class: '12', section: 'A', parentName: 'Murugan', parentPhone: '9876543226', studentStop: 'Guindy, Chennai', assignedVanNumber: 'V-04' },
  { id: 'S-06', name: 'Sruthi V', class: '10', section: 'B', parentName: 'Venkat', parentPhone: '9876543227', studentStop: 'Nungambakkam, Chennai', assignedVanNumber: 'V-04' },
  { id: 'S-07', name: 'Vijay A', class: '7', section: 'C', parentName: 'Arul', parentPhone: '9876543228', studentStop: 'Anna Nagar, Chennai', assignedVanNumber: 'V-05' },
  { id: 'S-08', name: 'Meera N', class: '9', section: 'A', parentName: 'Nathan', parentPhone: '9876543229', studentStop: 'Besant Nagar, Chennai', assignedVanNumber: 'V-05' },
  { id: 'S-09', name: 'Karan J', class: '6', section: 'B', parentName: 'Joseph', parentPhone: '9876543230', studentStop: 'Tambaram, Chennai', assignedVanNumber: 'V-01' },
  { id: 'S-10', name: 'Sneha P', class: '8', section: 'B', parentName: 'Prakash', parentPhone: '9876543231', studentStop: 'Chromepet, Chennai', assignedVanNumber: 'V-02' }
];

const DEFAULT_TRIPS = [
  { tripId: 'T-101', date: '2026-06-11', route: 'Adyar Route (Morning)', driverId: 'D-01', vanNumber: 'V-01', startTime: '07:30', endTime: '08:15', status: 'Completed' },
  { tripId: 'T-102', date: '2026-06-11', route: 'Velachery Route (Morning)', driverId: 'D-01', vanNumber: 'V-01', startTime: '08:30', endTime: '09:15', status: 'Completed' },
  { tripId: 'T-103', date: '2026-06-11', route: 'T. Nagar Route (Morning)', driverId: 'D-02', vanNumber: 'V-02', startTime: '07:15', endTime: '08:00', status: 'Completed' },
  { tripId: 'T-104', date: '2026-06-11', route: 'Mylapore Route (Morning)', driverId: 'D-02', vanNumber: 'V-02', startTime: '08:15', endTime: '09:00', status: 'Completed' },
  { tripId: 'T-105', date: '2026-06-11', route: 'Guindy Route (Morning)', driverId: 'D-04', vanNumber: 'V-04', startTime: '07:30', endTime: '08:30', status: 'Completed' },
  { tripId: 'T-106', date: '2026-06-11', route: 'Adyar Drop (Evening)', driverId: 'D-01', vanNumber: 'V-01', startTime: '15:30', endTime: '16:15', status: 'Running' },
  { tripId: 'T-107', date: '2026-06-11', route: 'Velachery Drop (Evening)', driverId: 'D-01', vanNumber: 'V-01', startTime: '16:30', endTime: '17:15', status: 'Scheduled' },
  { tripId: 'T-108', date: '2026-06-11', route: 'T. Nagar Drop (Evening)', driverId: 'D-02', vanNumber: 'V-02', startTime: '15:30', endTime: '16:15', status: 'Scheduled' }
];

const DEFAULT_PAYMENTS = [
  { id: 'P-01', studentName: 'Ravi Kumar', totalFee: 3000, paidAmount: 3000, pendingAmount: 0, paymentDate: '2026-06-05', status: 'Paid', paymentMode: 'Online' },
  { id: 'P-02', studentName: 'Priya S', totalFee: 3000, paidAmount: 1500, pendingAmount: 1500, paymentDate: '2026-06-05', status: 'Pending', paymentMode: 'Offline' },
  { id: 'P-03', studentName: 'Aravind K', totalFee: 3500, paidAmount: 3500, pendingAmount: 0, paymentDate: '2026-06-04', status: 'Paid', paymentMode: 'Online' },
  { id: 'P-04', studentName: 'Divya R', totalFee: 3500, paidAmount: 2000, pendingAmount: 1500, paymentDate: '2026-06-06', status: 'Pending', paymentMode: 'Online' },
  { id: 'P-05', studentName: 'Hariharan M', totalFee: 4000, paidAmount: 4000, pendingAmount: 0, paymentDate: '2026-06-03', status: 'Paid', paymentMode: 'Offline' },
  { id: 'P-06', studentName: 'Sruthi V', totalFee: 4000, paidAmount: 0, pendingAmount: 4000, paymentDate: '2026-06-07', status: 'Pending', paymentMode: 'Offline' },
  { id: 'P-07', studentName: 'Vijay A', totalFee: 3000, paidAmount: 3000, pendingAmount: 0, paymentDate: '2026-06-02', status: 'Paid', paymentMode: 'Online' },
  { id: 'P-08', studentName: 'Meera N', totalFee: 3000, paidAmount: 1000, pendingAmount: 2000, paymentDate: '2026-06-08', status: 'Pending', paymentMode: 'Offline' },
  { id: 'P-09', studentName: 'Karan J', totalFee: 3000, paidAmount: 3000, pendingAmount: 0, paymentDate: '2026-06-01', status: 'Paid', paymentMode: 'Online' },
  { id: 'P-10', studentName: 'Sneha P', totalFee: 3500, paidAmount: 0, pendingAmount: 3500, paymentDate: '2026-06-09', status: 'Pending', paymentMode: 'Offline' }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 'N-02', title: 'Payment Pending Alert', message: 'Student Sruthi V has a pending payment of ₹4000.', time: '2026-06-10T14:30:00.000Z', read: false, type: 'Info' },
  { id: 'N-03', title: 'Maintenance Alert', message: 'Van V-03 is currently marked as Maintenance.', time: '2026-06-09T10:15:00.000Z', read: true, type: 'Warning' }
];

const DEFAULT_SETTINGS = {
  language: 'en',
  theme: 'light',
  soundEnabled: true,
  pushNotifications: true,
  dbMode: 'local',
  supabaseUrl: '',
  supabaseKey: ''
};

export const Store = {
  KEYS,

  init() {
    this._initKey(KEYS.VANS, DEFAULT_VANS);
    this._initKey(KEYS.DRIVERS, DEFAULT_DRIVERS);
    this._initKey(KEYS.STUDENTS, DEFAULT_STUDENTS);
    this._initKey(KEYS.TRIPS, DEFAULT_TRIPS);
    this._initKey(KEYS.PAYMENTS, DEFAULT_PAYMENTS);
    this._initKey(KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    this._initKey(KEYS.SETTINGS, DEFAULT_SETTINGS);

    // Run dynamic checks to populate any auto-alerts (e.g. expiring licenses)
    this.checkAlerts();
  },

  _initKey(key, defaultValue) {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
    }
  },

  get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
    // Dispatch an event so other system sections can listen for changes
    window.dispatchEvent(new CustomEvent('store-updated', { detail: { key, val } }));
  },

  // CRUD helpers
  getAll(key) {
    return this.get(key) || [];
  },

  add(key, item) {
    const list = this.getAll(key);
    list.push(item);
    this.set(key, list);
    this.addActivityNotification('success', `Added new item to ${key.replace('school_', '')}`);
    return item;
  },

  update(key, idField, idValue, updatedFields) {
    const list = this.getAll(key);
    const index = list.findIndex(item => item[idField] === idValue);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      this.set(key, list);
      this.addActivityNotification('info', `Updated item ${idValue} in ${key.replace('school_', '')}`);
      return list[index];
    }
    return null;
  },

  delete(key, idField, idValue) {
    const list = this.getAll(key);
    const filtered = list.filter(item => item[idField] !== idValue);
    if (filtered.length !== list.length) {
      this.set(key, filtered);
      this.addActivityNotification('danger', `Deleted item ${idValue} from ${key.replace('school_', '')}`);
      return true;
    }
    return false;
  },

  // Notification helpers
  addActivityNotification(type, message, title = 'System Activity') {
    const notifications = this.getAll(KEYS.NOTIFICATIONS);
    const newNotif = {
      id: 'N-' + Date.now(),
      title,
      message,
      time: new Date().toISOString(),
      read: false,
      type: type.charAt(0).toUpperCase() + type.slice(1) // Info, Warning, Success, Danger
    };
    notifications.unshift(newNotif);
    // limit notifications list size to 50
    if (notifications.length > 50) notifications.pop();
    this.set(KEYS.NOTIFICATIONS, notifications);
  },

  // Reset Demo Data
  resetDemoData() {
    localStorage.setItem(KEYS.VANS, JSON.stringify(DEFAULT_VANS));
    localStorage.setItem(KEYS.DRIVERS, JSON.stringify(DEFAULT_DRIVERS));
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    localStorage.setItem(KEYS.TRIPS, JSON.stringify(DEFAULT_TRIPS));
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(DEFAULT_PAYMENTS));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    this.checkAlerts();
    window.dispatchEvent(new CustomEvent('store-reset'));
  },

  checkAlerts() {
    const notifications = this.getAll(KEYS.NOTIFICATIONS);
    // Check vans capacity logic (any van that has too many students)
    const vans = this.getAll(KEYS.VANS);
    const students = this.getAll(KEYS.STUDENTS);
    vans.forEach(van => {
      const passengerCount = students.filter(s => s.assignedVanNumber === van.vanNumber).length;
      if (passengerCount > van.capacity) {
        const exists = notifications.some(n => n.message.includes(`Van ${van.vanNumber} is overloaded`));
        if (!exists) {
          this.addActivityNotification(
            'danger',
            `Van ${van.vanNumber} is overloaded! Capacity is ${van.capacity} but has ${passengerCount} students assigned.`,
            'Van Capacity Warning'
          );
        }
      }
    });
  }
};
