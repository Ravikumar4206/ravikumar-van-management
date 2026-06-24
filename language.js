/**
 * School Van Management System - Localization Module (language.js)
 * Provides English and Tamil translation dictionaries.
 */

export const Translations = {
  en: {
    // Navigation
    navDashboard: "Dashboard",
    navVans: "Vans",
    navDrivers: "Drivers",
    navStudents: "Students",
    navTrips: "Trips",
    navPayments: "Payments",
    navReports: "Reports",
    navSettings: "Settings",
    navLogout: "Logout",

    // Authentication
    loginTitle: "Admin Login",
    loginSubtitle: "School Van Management System",
    usernameLabel: "Username",
    passwordLabel: "Password",
    rememberMe: "Remember me",
    loginBtn: "Login",
    invalidCredentials: "Invalid username or password!",
    sessionExpired: "Session expired. Please log in again.",

    // Dashboard
    kpiTotalVans: "Total Vans",
    kpiTotalDrivers: "Total Drivers",
    kpiTotalStudents: "Total Students",
    kpiTodaysTrips: "Today's Trips",
    kpiPendingPayments: "Pending Payments",
    chartCollections: "Monthly Collections (₹)",
    chartDistribution: "Student Distribution by Class",
    chartTrips: "Trips Overview",
    chartPaymentStatus: "Payment Status",
    widgetActivities: "Recent Activities",
    widgetNotifications: "Important Alerts",
    noActivities: "No recent activities recorded.",
    noNotifications: "No urgent alerts found.",

    // Common Actions
    addBtn: "Add New",
    editBtn: "Edit",
    deleteBtn: "Delete",
    viewBtn: "View",
    actionCol: "Actions",
    searchPlaceholder: "Search...",
    globalSearchPlaceholder: "Universal search (Vans, Drivers, Students, Payments...)",
    filterAll: "All Statuses",
    filterDriverAll: "All Drivers",
    filterVanAll: "All Vans",
    filterClassAll: "All Classes",
    filterStatus: "Filter by Status",
    saveBtn: "Save Changes",
    cancelBtn: "Cancel",
    confirmDelete: "Are you sure you want to delete this record? This action cannot be undone.",
    successAdd: "Record added successfully!",
    successUpdate: "Record updated successfully!",
    successDelete: "Record deleted successfully!",
    validationError: "Please fill in all required fields correctly.",

    // Van Management
    vanTitle: "Van Fleet Management",
    vanNum: "Van Number",
    vanReg: "Registration Number",
    vanModel: "Vehicle Model",
    vanCap: "Capacity (Seating)",
    vanDriver: "Assigned Driver",
    vanStatus: "Status",
    statusActive: "Active",
    statusInService: "In Service",
    statusMaintenance: "Maintenance",

    // Driver Management
    driverTitle: "Driver Management",
    driverName: "Driver Name",
    driverPhone: "Phone Number",
    driverAddress: "Address",
    driverLicNum: "License Number",
    driverLicExp: "License Expiry Date",
    driverVan: "Assigned Van",
    driverProfileTitle: "Driver Profile Details",
    expiryWarning: "License Expiring Soon!",

    // Student Management
    studentTitle: "Student Registry",
    studentName: "Student Name",
    studentClass: "Class",
    studentSection: "Section",
    studentParent: "Parent Name",
    studentParentPhone: "Parent Phone",
    studentPickup: "Pickup Location",
    studentStop: "Student Stop",
    studentVan: "Assigned Van",
    studentProfileTitle: "Student Profile Details",

    // Trip Management
    tripTitle: "Trip Scheduler",
    tripId: "Trip ID",
    tripDate: "Date",
    tripRoute: "Route",
    tripDriver: "Driver",
    tripVan: "Van",
    tripStart: "Start Time",
    tripEnd: "End Time",
    tripStatus: "Trip Status",
    tripStartBtn: "Start Trip",
    tripCompleteBtn: "Complete Trip",
    statusScheduled: "Scheduled",
    statusRunning: "Running",
    statusCompleted: "Completed",
    tripRunningSuccess: "Trip is now running!",
    tripCompleteSuccess: "Trip marked as completed!",

    // Payment Management
    paymentTitle: "Fee Payment Tracker",
    payStudent: "Student Name",
    payTotal: "Total Fee (₹)",
    payPaid: "Paid Amount (₹)",
    payPending: "Pending Amount (₹)",
    payDate: "Payment Date",
    payStatus: "Payment Status",
    statusPaid: "Paid",
    statusPending: "Pending",
    payMode: "Payment Mode",
    modeOnline: "Online",
    modeOffline: "Offline",

    // Reports Module
    reportsTitle: "Data Reports & Export",
    reportSelect: "Select Report Category",
    repStudents: "Student Register",
    repDrivers: "Driver Directory",
    repVans: "Van Fleet Inventory",
    repPayments: "Financial Ledger",
    exportCsv: "Export to CSV",
    previewData: "Report Preview",

    // Voice & Search
    voiceModalTitle: "Voice Command Assistant",
    voiceListening: "Listening for commands...",
    voiceInstruction: "Try saying: 'Show students', 'Show drivers', 'Open payments', or 'Search student Ravi'.",
    voiceNoSpeech: "No speech was detected. Please try again.",
    voiceNotSupported: "Web Speech API is not supported in this browser.",
    voiceMatchSuccess: "Command matched:",
    voiceMatchFail: "Command not recognized. Try again.",

    // Settings
    settingsTitle: "System Settings",
    setLang: "Default Language",
    setTheme: "UI Color Theme",
    themeLight: "Light Theme",
    themeDark: "Dark Theme",
    setSound: "Enable System Sound Effects",
    setPush: "Enable Alerts & Notifications",
    resetBtn: "Reset All System Demo Data",
    resetWarning: "This will permanently wipe all changes and restore original mock datasets. Proceed?",
    resetSuccess: "System data reset successfully!",

    // General UI
    notificationCenter: "Notification Center",
    markAllRead: "Mark all as read",
    clearAll: "Clear alerts",
    unreadBadge: "unread alerts",
    emptyNotifications: "No new notifications",
    footerText: "School Van Management System Dashboard • Admin Panel",
    voiceBtnTooltip: "Voice Commands"
  },
  ta: {
    // Navigation
    navDashboard: "முகப்புப்பலகை",
    navVans: "வண்டிகள்",
    navDrivers: "ஓட்டுநர்கள்",
    navStudents: "மாணவர்கள்",
    navTrips: "பயணங்கள்",
    navPayments: "கட்டணங்கள்",
    navReports: "அறிக்கைகள்",
    navSettings: "அமைப்புகள்",
    navLogout: "வெளியேறு",

    // Authentication
    loginTitle: "நிர்வாகி உள்நுழைவு",
    loginSubtitle: "பள்ளி வண்டி மேலாண்மை அமைப்பு",
    usernameLabel: "பயனர் பெயர்",
    passwordLabel: "கடவுச்சொல்",
    rememberMe: "என்னை நினைவில் கொள்",
    loginBtn: "உள்நுழை",
    invalidCredentials: "தவறான பயனர் பெயர் அல்லது கடவுச்சொல்!",
    sessionExpired: "அமர்வு முடிந்தது. மீண்டும் உள்நுழையவும்.",

    // Dashboard
    kpiTotalVans: "மொத்த வண்டிகள்",
    kpiTotalDrivers: "மொத்த ஓட்டுநர்கள்",
    kpiTotalStudents: "மொத்த மாணவர்கள்",
    kpiTodaysTrips: "இன்றைய பயணங்கள்",
    kpiPendingPayments: "நிலுவைக் கட்டணங்கள்",
    chartCollections: "மாதாந்திர கட்டண வசூல் (₹)",
    chartDistribution: "வகுப்பு வாரியாக மாணவர்கள்",
    chartTrips: "பயணங்கள் கண்ணோட்டம்",
    chartPaymentStatus: "கட்டண நிலை",
    widgetActivities: "சமீபத்திய நடவடிக்கைகள்",
    widgetNotifications: "முக்கிய விழிப்பூட்டல்கள்",
    noActivities: "சமீபத்திய நடவடிக்கைகள் எதுவும் இல்லை.",
    noNotifications: "அவசர விழிப்பூட்டல்கள் எதுவும் இல்லை.",

    // Common Actions
    addBtn: "புதிதாக சேர்",
    editBtn: "திருத்து",
    deleteBtn: "அழி",
    viewBtn: "பார்வை",
    actionCol: "செயல்கள்",
    searchPlaceholder: "தேடு...",
    globalSearchPlaceholder: "பொதுவான தேடல் (வண்டிகள், ஓட்டுநர்கள், மாணவர்கள், கட்டணங்கள்...)",
    filterAll: "அனைத்து நிலைகளும்",
    filterDriverAll: "அனைத்து ஓட்டுநர்கள்",
    filterVanAll: "அனைத்து வண்டிகள்",
    filterClassAll: "அனைத்து வகுப்புகள்",
    filterStatus: "நிலை மூலம் வடிகட்டு",
    saveBtn: "மாற்றங்களைச் சேமி",
    cancelBtn: "ரத்து செய்",
    confirmDelete: "இந்தப் பதிவை நிச்சயமாக அழிக்க விரும்புகிறீர்களா? இந்தச் செயலை மாற்ற முடியாது.",
    successAdd: "பதிவு வெற்றிகரமாக சேர்க்கப்பட்டது!",
    successUpdate: "பதிவு வெற்றிகரமாக புதுப்பிக்கப்பட்டது!",
    successDelete: "பதிவு வெற்றிகரமாக அழிக்கப்பட்டது!",
    validationError: "தேவையான அனைத்து புலங்களையும் சரியாக நிரப்பவும்.",

    // Van Management
    vanTitle: "வண்டி மேலாண்மை",
    vanNum: "வண்டி எண்",
    vanReg: "பதிவு எண்",
    vanModel: "வண்டி வகை (மாடல்)",
    vanCap: "இருக்கை கொள்ளளவு",
    vanDriver: "ஒதுக்கப்பட்ட ஓட்டுநர்",
    vanStatus: "நிலை",
    statusActive: "செயலில்",
    statusInService: "பணியில்",
    statusMaintenance: "பராமரிப்பில்",

    // Driver Management
    driverTitle: "ஓட்டுநர் மேலாண்மை",
    driverName: "ஓட்டுநர் பெயர்",
    driverPhone: "தொலைபேசி எண்",
    driverAddress: "முகவரி",
    driverLicNum: "ஓட்டுநர் உரிம எண்",
    driverLicExp: "உரிம காலாவதி தேதி",
    driverVan: "ஒதுக்கப்பட்ட வண்டி",
    driverProfileTitle: "ஓட்டுநர் விவரங்கள்",
    expiryWarning: "உரிமம் விரைவில் காலாவதியாகிறது!",

    // Student Management
    studentTitle: "மாணவர் பதிவேடு",
    studentName: "மாணவர் பெயர்",
    studentClass: "வகுப்பு",
    studentSection: "பிரிவு",
    studentParent: "பெற்றோர் பெயர்",
    studentParentPhone: "பெற்றோர் தொலைபேசி",
    studentPickup: "ஏற்றுமிடம் (Pickup)",
    studentStop: "மாணவர் நிறுத்தம்",
    studentVan: "ஒதுக்கப்பட்ட வண்டி",
    studentProfileTitle: "மாணவர் சுயவிவர விவரங்கள்",

    // Trip Management
    tripTitle: "பயணத் திட்டம்",
    tripId: "பயண எண் (ID)",
    tripDate: "தேதி",
    tripRoute: "வழித்தடம் (Route)",
    tripDriver: "ஓட்டுநர்",
    tripVan: "வண்டி",
    tripStart: "ஆரம்ப நேரம்",
    tripEnd: "முடிவு நேரம்",
    tripStatus: "பயண நிலை",
    tripStartBtn: "பயணத்தைத் தொடங்கு",
    tripCompleteBtn: "பயணத்தை முடி",
    statusScheduled: "திட்டமிடப்பட்டது",
    statusRunning: "இயங்குகிறது",
    statusCompleted: "முடிந்தது",
    tripRunningSuccess: "பயணம் இப்போது இயங்குகிறது!",
    tripCompleteSuccess: "பயணம் வெற்றிகரமாக முடிந்தது!",

    // Payment Management
    paymentTitle: "கட்டண கண்காணிப்பு",
    payStudent: "மாணவர் பெயர்",
    payTotal: "மொத்த கட்டணம் (₹)",
    payPaid: "செலுத்திய தொகை (₹)",
    payPending: "நிலுவைத் தொகை (₹)",
    payDate: "செலுத்தப்பட்ட தேதி",
    payStatus: "கட்டண நிலை",
    statusPaid: "செலுத்தப்பட்டது",
    statusPending: "நிலுவையில்",
    payMode: "செலுத்தப்பட்ட முறை",
    modeOnline: "ஆன்லைன்",
    modeOffline: "ஆஃப்லைன்",

    // Reports Module
    reportsTitle: "தரவு அறிக்கைகள் & ஏற்றுமதி",
    reportSelect: "அறிக்கைத் வகையைத் தேர்வுசெய்",
    repStudents: "மாணவர் பதிவேடு",
    repDrivers: "ஓட்டுநர் விவரங்கள்",
    repVans: "வண்டி விவரங்கள்",
    repPayments: "கட்டண நிதி அறிக்கை",
    exportCsv: "CSV கோப்பாக ஏற்றுமதி செய்",
    previewData: "அறிக்கை முன்னோட்டம்",

    // Voice & Search
    voiceModalTitle: "குரல் கட்டளை உதவியாளர்",
    voiceListening: "குரல் கட்டளைக்காகக் காத்திருக்கிறது...",
    voiceInstruction: "இப்படிச் சொல்லிப் பாருங்கள்: 'Show students', 'Show drivers', 'Open payments', அல்லது 'Search student Ravi'.",
    voiceNoSpeech: "பேச்சு எதுவும் கண்டறியப்படவில்லை. மீண்டும் முயற்சிக்கவும்.",
    voiceNotSupported: "இந்த உலாவியில் பேச்சு கட்டளை வசதி ஆதரிக்கப்படவில்லை.",
    voiceMatchSuccess: "பொருந்திய கட்டளை:",
    voiceMatchFail: "கட்டளை கண்டறியப்படவில்லை. மீண்டும் முயற்சிக்கவும்.",

    // Settings
    settingsTitle: "கணினி அமைப்புகள்",
    setLang: "இயல்பு மொழி",
    setTheme: "திரை நிற அமைப்புகள்",
    themeLight: "பகல் திரை (Light)",
    themeDark: "இரவுத் திரை (Dark)",
    setSound: "கணினி ஒலிகளை இயக்கு",
    setPush: "விழிப்பூட்டல் அறிவிப்புகளை இயக்கு",
    resetBtn: "கணினி மாதிரி தரவை மீட்டமை",
    resetWarning: "இது உங்கள் மாற்றங்கள் அனைத்தையும் அழித்து அசல் மாதிரி தரவை மீட்டமைக்கும். தொடரலாமா?",
    resetSuccess: "மாதிரி தரவு வெற்றிகரமாக மீட்டமைக்கப்பட்டது!",

    // General UI
    notificationCenter: "அறிவிப்பு மையம்",
    markAllRead: "அனைத்தையும் படித்ததாகக் குறி",
    clearAll: "அறிவிப்புகளை அழி",
    unreadBadge: "படிக்காத அறிவிப்புகள்",
    emptyNotifications: "புதிய அறிவிப்புகள் இல்லை",
    footerText: "பள்ளி வண்டி மேலாண்மை அமைப்பு • நிர்வாகக் கட்டுப்பாட்டு பலகை",
    voiceBtnTooltip: "குரல் கட்டளைகள்"
  }
};

export function translateUI(lang, container = document) {
  const elements = container.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (Translations[lang] && Translations[lang][key]) {
      // Check if it's an input/textarea with placeholder attribute
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = Translations[lang][key];
      } else {
        el.textContent = Translations[lang][key];
      }
    }
  });

  const placeholders = container.querySelectorAll('[data-i18n-placeholder]');
  placeholders.forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (Translations[lang] && Translations[lang][key]) {
      el.placeholder = Translations[lang][key];
    }
  });

  const tooltips = container.querySelectorAll('[data-i18n-title]');
  tooltips.forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (Translations[lang] && Translations[lang][key]) {
      el.title = Translations[lang][key];
    }
  });
}
