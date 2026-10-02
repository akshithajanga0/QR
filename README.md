# QR Restaurant Ordering System

A production-grade, modern QR-based restaurant ordering system built with **Node.js, Express, SQLite, Socket.io, React, and Vanilla CSS**.

## 🌟 Core Concept & Architecture

- **ONLY TWO USER ROLES**:
  1. **User / Customer** (Mobile-first digital menu)
  2. **Admin / Restaurant Manager** (Desktop-first operational SaaS dashboard)
  *(No separate waiter account and no separate kitchen account)*
- **ONE COMMON QR CODE**: The same QR code is physically placed on every table with the table number printed **above** it (e.g., `TABLE 12`).
- **Table Validation & Confirmation**: Scanning prompts the user for their table number, validates it with the backend database, confirms the table, and creates an active table dining session.
- **Multiple Orders Per Session**: Customer can place multiple orders during their visit (e.g. Order #1042 Biryani, Order #1043 Coke, Order #1044 Ice Cream), all linked to Table 12.
- **Call Waiter / Assistance Flow**: Customer raises table requests (Water, Extra Plates, Cutlery, Bill, etc.). Admin receives an alert, clicks **[ INFORM WAITER ]**, and marks it **[ COMPLETED ]**.
- **Real-Time Sync & Audio Chimes**: Socket.io bi-directional synchronization with synthesized Web Audio API chimes for incoming orders and table calls.

---

## 🚀 Quick Start

### 1. Run the Application
The full-stack application is running at:
- **Customer QR Ordering Page**: [http://localhost:5000/](http://localhost:5000/)
- **Admin Management Portal**: [http://localhost:5000/#admin](http://localhost:5000/#admin)

### 2. Admin Credentials
- **Email**: `admin@royalspice.com`
- **Password**: `admin123`

---

## 📁 Project Structure

```
├── client/                     # Vite + React Frontend (Vanilla CSS Design System)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CustomerHeader.jsx          # Sticky customer header with table badge
│   │   │   ├── CustomerMenu.jsx            # Category tabs, search, chef specials, food cards
│   │   │   ├── FoodDetailModal.jsx         # Customization, add-ons & live pricing
│   │   │   ├── CartModal.jsx               # Cart drawer, kitchen notes, tax & checkout
│   │   │   ├── OrderConfirmationModal.jsx  # Celebration screen with confetti & order #
│   │   │   ├── OrderTrackingModal.jsx      # Multi-order history & progress stepper
│   │   │   ├── CallWaiterModal.jsx         # Assistance options & live status tracking
│   │   │   ├── QrEntryPage.jsx             # Table entry, validation & standee mockup
│   │   │   └── admin/
│   │   │       ├── AdminLogin.jsx          # Secure JWT authentication
│   │   │       ├── AdminSidebar.jsx        # Navigation with live badges
│   │   │       ├── AdminTopNav.jsx         # Audio toggle, quick view switcher
│   │   │       ├── AdminDashboardView.jsx  # KPI sales, orders, tables & requests
│   │   │       ├── AdminOrdersView.jsx     # Live orders board & status transitions
│   │   │       ├── AdminHelpView.jsx       # Help desk with "Inform Waiter" workflow
│   │   │       ├── AdminMenuView.jsx       # Categories, dishes, add-ons & sold-out toggle
│   │   │       ├── AdminTablesView.jsx     # Tables management & printable QR Standees
│   │   │       ├── AdminPaymentsView.jsx   # Payment review & transactions
│   │   │       ├── AdminReportsView.jsx    # Analytics & popular dishes leaderboard
│   │   │       └── AdminSettingsView.jsx   # Restaurant profile & tax configuration
│   │   ├── utils/
│   │   │   ├── audio.js                    # Web Audio API synthesized polite chimes
│   │   │   └── socket.js                   # Socket.io client instance
│   │   ├── App.jsx                         # Main orchestrator & role router
│   │   └── index.css                       # Modern CSS design system & custom properties
├── server/                     # Express + SQLite + Socket.io Backend
│   ├── db.js                   # SQLite relational database schema & seeding
│   ├── auth.js                 # JWT token generation & verification middleware
│   ├── index.js                # REST APIs, Socket.io broadcast, static client serve
│   └── test_e2e.js             # Automated end-to-end API test suite
└── package.json                # Root automation scripts
```

---

## 🧪 Verification Tests

Run the automated test suite anytime:
```bash
cd server
node test_e2e.js
```
Expected output:
```
🧪 Running automated verification tests on QR Restaurant Ordering API...

✅ Test 1 [Valid Table]: PASSED
✅ Test 2 [Invalid Table]: PASSED
✅ Test 3 [Table Session]: PASSED
✅ Test 4 [Order Creation]: PASSED
✅ Test 5 [Help Request]: PASSED
✅ Test 6 [Admin Login]: PASSED
✅ Test 7 [Order Status Transition]: PASSED
✅ Test 8 [Help Request Inform Waiter]: PASSED
✅ Test 9 [Admin Reports]: PASSED

🎉 All 9 verification tests executed successfully!
```
