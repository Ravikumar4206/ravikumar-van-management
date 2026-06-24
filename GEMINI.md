# GEMINI.md

## ROLE

You are an expert Senior Full-Stack Engineer, Product Designer, UX Designer, and SaaS Dashboard Architect.

Your task is to design and build a complete production-ready **School Van Management System Dashboard**.

Do not create a landing page.

Build a fully functional dashboard application.

Focus on usability, scalability, responsiveness, maintainability, accessibility, and professional UI/UX.

The output should feel like a premium SaaS product.

---

# PROJECT NAME

School Van Management System

---

# PROJECT OBJECTIVE

Build a complete dashboard that allows school administrators to manage:

* Vans
* Drivers
* Students
* Trips
* Payments
* Reports

The system must provide real-time dashboard analytics, powerful search capabilities, voice search, Tamil language support, dark mode, and local data persistence.

The application must be suitable for real-world school transportation operations.

---

# PRIMARY USERS

## Administrator

The administrator can:

* Manage vans
* Manage drivers
* Manage students
* Manage trips
* Manage payments
* Generate reports
* View analytics
* Configure settings

No parent login required.

No student login required.

No driver login required.

Admin-only system.

---

# DEVELOPMENT REQUIREMENTS

Build using:

* HTML5
* CSS3
* Vanilla JavaScript

Do NOT use:

* React
* Vue
* Angular
* jQuery
* Bootstrap
* Backend frameworks

Use:

* Chart.js
* Font Awesome
* Web Speech API
* Local Storage API

The entire application must run without a backend.

All data must be persisted using Local Storage.

---

# APPLICATION STRUCTURE

Create the following sections:

1. Login
2. Dashboard
3. Vans
4. Drivers
5. Students
6. Trips
7. Payments
8. Reports
9. Settings

Use SPA (Single Page Application) behavior where possible.

Avoid page reloads.

---

# DESIGN SYSTEM

## Design Style

Create a modern SaaS dashboard similar to:

* Notion
* Linear
* Stripe Dashboard
* Vercel Dashboard
* Clerk Dashboard

Characteristics:

* Clean
* Minimal
* Professional
* Spacious
* Modern
* Responsive

---

## Color System

### Primary

#2E7D32

### Secondary

#43A047

### Success

#4CAF50

### Warning

#FF9800

### Danger

#E53935

### Info

#2196F3

### Light Background

#F5F7FA

### Dark Background

#121212

---

## Typography

Use:

* Poppins
* Inter

Fallback:

* sans-serif

Use proper visual hierarchy.

---

# AUTHENTICATION

Create an Admin Login screen.

Demo Credentials:

Username:
admin

Password:
admin123

Features:

* Login
* Logout
* Session Persistence
* Remember Login State

Store session in Local Storage.

---

# DASHBOARD

Create a rich dashboard experience.

## KPI Cards

Display:

* Total Vans
* Total Drivers
* Total Students
* Today's Trips
* Pending Payments

Use modern cards.

Add icons.

Add subtle hover effects.

---

## Dashboard Widgets

Include:

### Recent Activities

Examples:

* Student Added
* Driver Updated
* Trip Created
* Payment Received

### Notifications

Examples:

* Pending Payments
* Unassigned Drivers
* Upcoming Trips

### Charts

Use Chart.js.

Include:

* Monthly Collections
* Student Distribution
* Trips Overview
* Payment Status

---

# VAN MANAGEMENT

Create a complete CRUD module.

## Fields

* Van Number
* Registration Number
* Vehicle Model
* Capacity
* Assigned Driver
* Status

Status:

* Active
* In Service
* Maintenance

## Features

* Add
* Edit
* Delete
* Search
* Filter
* View Details

---

# DRIVER MANAGEMENT

Create a complete CRUD module.

## Fields

* Driver Name
* Phone Number
* Address
* License Number
* License Expiry Date
* Assigned Van

## Features

* Add
* Edit
* Delete
* Search
* Filter
* View Profile

---

# STUDENT MANAGEMENT

Create a complete CRUD module.

## Fields

* Student Name
* Class
* Section
* Parent Name
* Parent Phone Number
* Pickup Location
* Assigned Van

## Features

* Add
* Edit
* Delete
* Search
* Filter
* Student Profile

---

# TRIP MANAGEMENT

Create a complete CRUD module.

## Fields

* Trip ID
* Date
* Route
* Driver
* Van
* Start Time
* End Time
* Status

Status:

* Scheduled
* Running
* Completed

## Features

* Create Trip
* Edit Trip
* Delete Trip
* Start Trip
* Complete Trip
* Trip History

---

# PAYMENT MANAGEMENT

Create a complete CRUD module.

## Fields

* Student Name
* Total Fee
* Paid Amount
* Pending Amount
* Payment Date
* Payment Status

Payment Status:

* Paid
* Pending

## Features

* Add Payment
* Edit Payment
* Delete Payment
* Search Payment
* Filter Payment
* Payment History

---

# REPORTS MODULE

Create export functionality.

Generate:

* Student Reports
* Driver Reports
* Van Reports
* Payment Reports

Export:

* CSV

Include download buttons.

---

# GLOBAL SEARCH

Create a universal search system.

Search across:

* Vans
* Drivers
* Students
* Trips
* Payments

Requirements:

* Instant Search
* Search Suggestions
* Keyboard Friendly

---

# VOICE SEARCH

Implement using Web Speech API.

Provide microphone button in header.

Support commands:

* Show students
* Show drivers
* Show vans
* Open payments
* Open reports
* Search student Ravi
* Show pending payments

Display recognition status.

Provide visual feedback.

---

# MULTI-LANGUAGE SUPPORT

Support:

* English
* Tamil

Requirements:

* Language switcher in header
* No page reload
* Translate UI labels
* Translate navigation
* Translate forms
* Translate buttons
* Translate tables
* Translate notifications

Persist language selection.

---

# DARK MODE

Create a professional dark theme.

Requirements:

* Theme toggle button
* Persist theme selection
* Smooth transitions
* Fully optimized dark UI

---

# NOTIFICATIONS

Create a notification center.

Examples:

* Payment Pending
* Student Added
* Driver Assigned
* Trip Created

Store notifications locally.

Show unread count.

---

# SETTINGS

Create a settings module.

Include:

* Language Settings
* Theme Settings
* Notification Settings
* Reset Demo Data

---

# MOBILE EXPERIENCE

The application must be mobile-first.

Requirements:

* Responsive sidebar
* Responsive tables
* Responsive forms
* Touch-friendly controls
* Tablet support
* Laptop support
* Desktop support

---

# LOCAL STORAGE ARCHITECTURE

Use separate storage keys.

Example:

school_vans
school_drivers
school_students
school_trips
school_payments
school_notifications
school_settings

Data must survive browser refresh.

---

# USER EXPERIENCE REQUIREMENTS

Every CRUD action must include:

* Validation
* Error Handling
* Success Messages
* Confirmation Dialogs

Every table must include:

* Search
* Filter
* Pagination
* Sorting

Every form must include:

* Required Validation
* Inline Error Messages

---

# ACCESSIBILITY

Follow accessibility best practices.

Include:

* Keyboard Navigation
* ARIA Labels
* Focus States
* Screen Reader Friendly Components

---

# CODE QUALITY

Generate clean production-ready code.

Requirements:

* Modular structure
* Reusable components
* Well-commented code
* Maintainable architecture
* Consistent naming conventions

---

# FINAL DELIVERABLE

Build a complete, polished, professional School Van Management System Dashboard that feels like a premium SaaS application.

The dashboard must be fully functional using only HTML, CSS, JavaScript, Local Storage, Chart.js, Font Awesome, and Web Speech API.

Do not provide placeholder wireframes.

Do not generate incomplete modules.

Implement every module and feature described in this document.
