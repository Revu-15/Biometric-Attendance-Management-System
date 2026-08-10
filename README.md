# ATTENDIQ — Biometric Attendance & Monthly Settlement System

<div align="center">

![ATTENDIQ Banner](https://img.shields.io/badge/ATTENDIQ-Biometric%20Attendance%20%26%20Settlement-06B6D4?style=for-the-badge&logo=fingerprint&logoColor=white)

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)](https://sqlalchemy.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

An enterprise-grade, end-to-end **Biometric Attendance, Service Consumption & Monthly Settlement Engine**. Built with FastAPI, SQLAlchemy, WebSockets, and a modern React/TypeScript dashboard.

---

## 🌐 Live Cloud Demo Links

[![Live Web App Vercel](https://img.shields.io/badge/🚀_Live_App-Vercel_Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://biometric-attendance-management-sys-pi.vercel.app)
[![Live Web App GitHub Pages](https://img.shields.io/badge/🌐_Live_App-GitHub_Pages-22C55E?style=for-the-badge&logo=github&logoColor=white)](https://revu-15.github.io/Biometric-Attendance-Management-System/)
[![Swagger API Docs](https://img.shields.io/badge/⚙️_API_Docs-Render_Cloud-46E3B7?style=for-the-badge&logo=fastapi&logoColor=black)](https://biometric-attendance-management-system-kefe.onrender.com/docs)

| Platform / Service | Live Hyperlink | Status |
|---|---|:---:|
| **🚀 Production Web App (Vercel)** | [biometric-attendance-management-sys-pi.vercel.app](https://biometric-attendance-management-sys-pi.vercel.app) | 🟢 **ONLINE** |
| **🌐 Web App (GitHub Pages)** | [revu-15.github.io/Biometric-Attendance-Management-System](https://revu-15.github.io/Biometric-Attendance-Management-System/) | 🟢 **ONLINE** |
| **⚙️ Backend API Endpoint (Render)** | [biometric-attendance-management-system-kefe.onrender.com](https://biometric-attendance-management-system-kefe.onrender.com) | 🟢 **ACTIVE** |
| **📚 Interactive Swagger API Docs** | [biometric-attendance-management-system-kefe.onrender.com/docs](https://biometric-attendance-management-system-kefe.onrender.com/docs) | 🟢 **ACTIVE** |

---

### 🔑 Demo Login Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `admin@system.com` | `admin123` | Full Administrative & Monthly Settlement Control |
| **Staff Operator** | `staff@system.com` | `staff123` | Operational Attendance & Payment Recording |

---

## 🎯 End-to-End Workflow Architecture

ATTENDIQ functions as **one controlled workflow** connecting hardware, validation logic, real-time telemetry, finance, and monthly closing:

```
                           ┌─────────────────────────┐
                           │    Biometric Machine    │  ZKTeco / eSSL / Generic HTTP
                           │   Fingerprint / Thumb   │
                           └────────────┬────────────┘
                                        │ HTTP Webhook / Push API
                                        ▼
                           ┌─────────────────────────┐
                           │    Integration Layer    │  Device Authentication & Adapters
                           └────────────┬────────────┘
                                        ▼
                           ┌─────────────────────────┐
                           │    Validation Engine    │  Device Auth → Client ID → Plan Active
                           └────────────┬────────────┘  → Duplicate Check → Time Rules
                                        ▼
                           ┌─────────────────────────┐
                           │    Attendance Engine    │  Database Commit + Source Tagging
                           └────────────┬────────────┘
                                        ├──────────────────────────┐
                                        ▼                          ▼
                           ┌─────────────────────────┐  ┌─────────────────────────┐
                           │ WebSocket Broadcast Feed│  │ Meal/Service Processing │
                           │ (Real-time Dashboard)   │  │ (Breakfast/Lunch/Dinner)│
                           └─────────────────────────┘  └────────────┬────────────┘
                                                                   ▼
                                                        ┌─────────────────────────┐
                                                        │ Payments & Settlement   │
                                                        └────────────┬────────────┘
                                                                   ▼
                                                        ┌─────────────────────────┐
                                                        │ Monthly Review & Lock   │
                                                        └─────────────────────────┘
```

---

## 🏛️ Generic Client Entity Architecture

Rather than hard-coding to "Student", ATTENDIQ uses a universal **`Client` entity**, making the software reusable across **Colleges/Schools, Hostels/Hotels, Monthly Messes, Gyms, Coworking Spaces, and Enterprise Organizations**.

```
                           ┌───────────────────────────────┐
                           │          CLIENT               │
                           ├───────────────────────────────┤
                           │  • id (PK)                    │
                           │  • client_code (Client ID)    │
                           │  • enrollment_id (Optional)   │
                           │  • name                       │
                           │  • mobile                     │
                           │  • email                      │
                           │  • address                    │
                           │  • gender                     │
                           │  • date_of_birth              │
                           │  • photo_url                  │
                           │  • biometric_user_id (HW ID)  │
                           │  • client_type                │
                           │  • status (active / inactive) │
                           └───────────────┬───────────────┘
                                           │
          ┌────────────────────┬───────────┴───────────┬────────────────────┐
          ▼                    ▼                       ▼                    ▼
   🎓 Student          🏨 Hotel Resident     🍽️ Mess Customer      💼 Staff / Other
```

### Key Client Fields & Types:
* **`client_code`**: Primary Client Identifier (e.g. `STU-2026-001`, `CLI-2026-005`).
* **`enrollment_id`**: Institutional Enrollment or Admission ID (e.g. `ENR-99882`).
* **`biometric_user_id`**: Physical Hardware User ID (e.g. `105`) mapped to biometric scanners.
* **`client_type`**: `Student`, `Hotel Resident`, `Monthly Mess Customer`, `Staff`, `Other`.

---

## ✨ Key Features (21 Connected Modules)

| # | Module | What It Does |
|---|--------|--------------|
| **1** | 🔐 **Login & Role Management** | JWT authentication with dual RBAC roles (**Super Admin** vs **Staff Operator**). Self-registration assigns Staff role. |
| **2** | 👤 **Client Management** | Multi-industry profile management with `enrollment_id`, Biometric ID mapping (`biometric_user_id`), plans, mobile, and status. |
| **3** | 👆 **Biometric Hardware Integration** | Pluggable integration layer supporting **ZKTeco**, **eSSL**, and **Generic HTTP Webhooks**. |
| **4** | 🔄 **Automatic Attendance Sync** | Automated real-time punch ingestion, validation, and storage pipeline. |
| **5** | ⚡ **Real-Time Live Feed** | Instant WebSocket ticker broadcasting attendance events to the dashboard without page reloads. |
| **6** | 📋 **Attendance Management** | Comprehensive status tracking: `PRESENT`, `ABSENT`, `LATE`, `LEAVE`, and manual corrections with audit logging. |
| **7** | 🛡️ **Validation Engine** | 6-stage validation: Device Auth → Client Lookup → Client Active → Plan Active → Duplicate Window → Rules. |
| **8** | ⏱️ **Duplicate Punch Protection** | Configurable duplicate window (default: 5 mins) preventing multiple scans from generating duplicate attendance records. |
| **9** | ⚙️ **Attendance Rules Engine** | Configurable late thresholds, working days, holidays, duplicate windows, and allowed time slots. |
| **10** | 💳 **Plan & Subscription Engine** | Create plans with fee, validity days, and meal limits. Assign and track active vs expired plans. |
| **11** | 💰 **Payment Management** | Track payments (UPI, Cash, Bank Transfer), pending balances, and transaction history. |
| **12** | 🍽️ **Meal & Service Consumption** | Separate tracking for `BREAKFAST`, `LUNCH`, and `DINNER` meal scans connected to plan meal limits. |
| **13** | 📊 **Monthly Settlement Engine** | Automated statement generation calculating plan fees + meal consumption + payments = final balance. |
| **14** | 🔒 **Monthly Lock & Approval** | Admin month-end review, approval, and read-only locking to prevent historical data tampering. |
| **15** | 📝 **Audit Trail & Logging** | Immutable security trail tracking *Who*, *What*, *When*, *Old Value*, and *New Value* for system changes. |
| **16** | 🖥️ **Device Monitoring** | Heartbeat monitoring, `ONLINE`/`OFFLINE` status tracking, and device registration. |
| **17** | 🔁 **Error & Sync Recovery** | Failed punch logging, retry queues, and automatic sync recovery for offline devices. |
| **18** | 🔔 **Alerts & Notifications** | System warnings for expiring plans, offline devices, overdue payments, and duplicate punch anomalies. |
| **19** | 📈 **Analytics & Forecasting** | Client attendance % rankings, punch distribution, 7-day rolling average forecasts, and revenue projections. |
| **20** | 🚨 **Anomaly Detection** | Automatic flag generation for suspicious duplicate punch patterns or unauthorized biometric IDs. |
| **21** | 📄 **Reports & PDF/Excel Export** | Exportable daily/monthly attendance summaries, individual client statements, and financial reports. |

---

## 🔐 Role-Based Access Control (RBAC)

ATTENDIQ strictly enforces permissions at both the **Backend API level (JWT)** and **Frontend UI level**.

### Permission Comparison Matrix

| Feature / Action | 🔐 Super Admin | ◈ Staff Operator |
|------------------|:--------------:|:----------------:|
| **Dashboard** | Full Business & Financial Intelligence | Operational Overview (Today's Punches & KPIs) |
| **View Client Directory** | ✅ | ✅ (Search by Code, Enrollment ID, Mobile) |
| **Add / Edit Client** | ✅ | ❌ Restricted (403 Forbidden) |
| **Deactivate / Delete Client** | ✅ | ❌ Restricted (403 Forbidden) |
| **View Attendance Logs** | ✅ | ✅ |
| **Manual Attendance Entry** | ✅ | ✅ (If Authorized) |
| **Meal Consumption Tracking** | ✅ | ✅ |
| **Record Payments** | ✅ | ✅ |
| **Plans & Membership Setup** | ✅ Create / Edit / Assign | ❌ View Only |
| **Monthly Settlement Statements**| ✅ Full Access & Invoices | ❌ View Only |
| **Monthly Lock / Unlock** | ✅ Lock / Unlock Month | ❌ Restricted |
| **Biometric Devices & Config** | ✅ Add / Configure | ❌ Restricted |
| **Attendance Rules & Settings** | ✅ Edit Rules | ❌ Restricted |
| **Audit Logs** | ✅ View Full Trail | ❌ Restricted |
| **Self-Registration (`/register`)**| ❌ N/A (Seeded Single Admin) | ✅ Automatically assigned `staff` role |

---

## 📊 Executive Presentation

For a complete 12-slide executive & technical slide deck covering business problem, market gap, financial settlement equations, and validation pipeline flowcharts, view:

👉 **[`PRESENTATION.md`](file:///c:/Users/polam/Desktop/Biometric%20Attendance%20&%20Management%20System/PRESENTATION.md)**

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`

---

### Option 1 — One-Click Launch (Windows)

Simply double-click [`start_system.bat`](file:///c:/Users/polam/Desktop/Biometric%20Attendance%20&%20Management%20System/start_system.bat) or run in PowerShell:
```powershell
.\start_system.bat
```
This automatically starts:
- **FastAPI Backend**: `http://127.0.0.1:8000` (with `--reload`)
- **React Frontend**: `http://localhost:3000`

---

### Option 2 — Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
venv\Scripts\activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI with auto-reload
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## 📂 Codebase Structure

```text
ATTENDIQ Core System
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages CI/CD
├── backend/                        # FastAPI Backend
│   ├── app/
│   │   ├── main.py                 # Entry point & WebSockets
│   │   ├── core/                   # Security & Database engine
│   │   │   ├── config.py           # App settings
│   │   │   ├── database.py         # SQLAlchemy engine
│   │   │   └── security.py         # JWT & bcrypt auth
│   │   ├── models/                 # ORM Data Models
│   │   │   ├── user.py             # User & RBAC roles
│   │   │   ├── client.py           # Client & Enrollment ID
│   │   │   ├── plan.py             # Fee / Plan model
│   │   │   ├── client_plan.py      # Subscriptions
│   │   │   ├── attendance.py      # Punch logs
│   │   │   ├── payment.py         # Payment transactions
│   │   │   ├── device.py          # Biometric hardware
│   │   │   ├── monthly_lock.py    # Settlement lock
│   │   │   ├── system_setting.py  # Business rules
│   │   │   ├── failed_punch_log.py# Recovery logs
│   │   │   └── audit_log.py       # Security audit trail
│   │   ├── schemas/                # Data Validation
│   │   │   └── schemas.py         # Pydantic schemas
│   │   ├── api/                    # REST API Controllers
│   │   │   ├── auth.py            # Authentication
│   │   │   ├── clients.py         # Client CRUD
│   │   │   ├── plans.py           # Plans management
│   │   │   ├── attendance.py      # Webhook ingestion
│   │   │   ├── payments.py        # Payments API
│   │   │   ├── reports.py         # Reports & Locking
│   │   │   ├── devices.py         # Device registry
│   │   │   └── audit_logs.py      # Audit trail
│   │   ├── services/               # Business Logic Services
│   │   │   ├── attendance_service.py # Punch validation engine
│   │   │   ├── biometric_service.py  # Device adapters & ping
│   │   │   ├── billing_service.py    # Monthly statements
│   │   │   ├── report_service.py     # Analytics & alerts
│   │   │   └── validation_service.py # Validation contracts
│   │   ├── workers/                # Background Workers
│   │   │   └── attendance_sync.py # Device recovery worker
│   │   └── integrations/biometric/ # Hardware Adapters
│   │       ├── base.py            # Adapter interface
│   │       ├── generic.py         # Generic HTTP webhook
│   │       └── zkteco.py          # ZKTeco / eSSL ADMS
│   └── requirements.txt            # Python dependencies
├── frontend/                       # React 18 + TypeScript UI
│   ├── src/
│   │   ├── App.tsx                 # Main layout & router
│   │   ├── services/api.ts         # REST API client
│   │   ├── components/             # Reusable UI Components
│   │   │   ├── Sidebar.tsx         # Dynamic RBAC menu
│   │   │   ├── Navbar.tsx          # Top navbar
│   │   │   ├── ClientProfileModal.tsx
│   │   │   ├── MonthlyStatementModal.tsx
│   │   │   └── PunchSimulatorModal.tsx
│   │   └── pages/                  # 12 Core Pages
│   │       ├── LoginPage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── StaffDashboardPage.tsx
│   │       ├── ClientsPage.tsx
│   │       ├── AttendancePage.tsx
│   │       ├── MealsPage.tsx
│   │       ├── PlansPage.tsx
│   │       ├── PaymentsPage.tsx
│   │       ├── ReportsPage.tsx
│   │       ├── AnalyticsPage.tsx
│   │       ├── DevicesPage.tsx
│   │       ├── RulesAndSettingsPage.tsx
│   │       ├── AuditLogsPage.tsx
│   │       └── AlertsPage.tsx
│   ├── vercel.json                 # Vercel SPA routing
│   ├── vite.config.ts              # Vite configuration
│   └── package.json                # Frontend packages
├── DEPLOYMENT.md                   # Deployment Guide
├── PRESENTATION.md                 # Executive Slide Deck
├── render.yaml                     # Render Blueprint
├── vercel.json                     # Vercel Configuration
└── start_system.bat                # Windows Launcher
```

---

## 🔑 Credentials & Access URLs

| Portal / Service | URL | Default Credentials / Role |
|------------------|-----|----------------------------|
| 🖥️ **Web Dashboard** | **http://localhost:3000** | — |
| 🔑 **Super Admin Login** | http://localhost:3000 | `admin@system.com` / `admin123` |
| 🔑 **Staff Operator Login** | http://localhost:3000 | `staff@system.com` / `staff123` |
| 📝 **Create Staff Account** | http://localhost:3000 | Click **Create Account** tab |
| 📖 **FastAPI Swagger Docs** | **http://127.0.0.1:8000/docs** | Interactive API testing |
| 📑 **ReDoc Reference** | http://127.0.0.1:8000/redoc | Clean API specification |

---

## 🔗 Biometric Machine Webhook Integration

To connect any biometric machine (ZKTeco, eSSL, Hikvision, or Generic HTTP), configure the hardware to POST attendance logs to:

```http
POST http://<YOUR_SERVER_IP>:8000/api/v1/attendance/webhook
Content-Type: application/json
```

### 1. Generic HTTP Payload
```json
{
  "device_id": "DEVICE-01",
  "biometric_user_id": "105",
  "punch_type": "IN",
  "timestamp": "2026-08-10T08:32:14Z"
}
```

### 2. ZKTeco ADMS / Push Payload (Auto-Detected)
```json
{
  "SN": "DEVICE-01",
  "PIN": "105",
  "Verify": 1,
  "DateTime": "2026-08-10 08:32:14"
}
```

---

│   │   └── pages/                      # 12 Core Dashboard Modules
│   │       ├── LoginPage.tsx           # Login, Staff Register & Server URL config
│   │       ├── DashboardPage.tsx       # Super Admin Executive Dashboard
│   │       ├── StaffDashboardPage.tsx  # Staff Operations Dashboard
│   │       ├── ClientsPage.tsx         # Universal Client Directory (Enrollment ID & Type search)
│   │       ├── AttendancePage.tsx      # Attendance Log Feed
│   │       ├── MealsPage.tsx           # Service & Meal Consumption tracking
│   │       ├── PlansPage.tsx           # Membership & Fee Plans
│   │       ├── PaymentsPage.tsx        # Payment Ledger & Balances
│   │       ├── ReportsPage.tsx         # Monthly Settlement Reports & Exports
│   │       ├── AnalyticsPage.tsx       # System Analytics & Intelligence
│   │       ├── DevicesPage.tsx         # Biometric Device Manager
│   │       ├── RulesAndSettingsPage.tsx# Attendance Rules & Settings
│   │       ├── AuditLogsPage.tsx       # Security Audit Logs
│   │       └── AlertsPage.tsx          # Notifications & Warning Feed
│   │
│   ├── vercel.json                     # Vercel SPA routing configuration
│   ├── vite.config.ts                  # Vite build configuration (base relative path & proxy)
│   └── package.json                    # Frontend dependencies
│
├── DEPLOYMENT.md                       # Comprehensive Docker, VPS & Cloud Deployment Guide
├── PRESENTATION.md                     # 12-Slide Executive & Technical Slide Deck
├── render.yaml                         # 1-Click Render Cloud Blueprint
├── vercel.json                         # Root Vercel SPA Deployment Configuration
├── start_system.bat                    # One-click local launcher for Windows
└── README.md                           # Master Project Documentation
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">

**ATTENDIQ** · Enterprise Biometric Attendance & Settlement Engine  
Built with ❤️ using FastAPI, React & TypeScript

</div>
