# BioSync — Biometric Attendance & Management System

<div align="center">

![BioSync Banner](https://img.shields.io/badge/BioSync-Biometric%20Attendance%20System-06B6D4?style=for-the-badge&logo=fingerprint&logoColor=white)

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)](https://sqlalchemy.org)

A production-grade, end-to-end **Biometric Attendance & Client Management System** featuring real-time punch processing, automatic validation, billing, monthly settlement, and a premium dark-mode React dashboard.

</div>

---

## 🎯 System Architecture

```
┌─────────────────────┐
│  Biometric Machine  │   ZKTeco / eSSL / Generic HTTP
│   Thumb / Finger    │
└──────────┬──────────┘
           │  HTTP Webhook / API Push
           ▼
┌─────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8000)             │
│                                                      │
│  • Webhook Receiver  →  Adapter Layer (ZKTeco/HTTP)  │
│  • Biometric ID      →  Client Identification        │
│  • Validation Engine →  Duplicate / Plan / Status    │
│  • WebSocket Broadcast → Real-Time Dashboard Feed    │
│  • REST APIs         →  Admin Panel Operations       │
└──────────────────────────┬──────────────────────────┘
                           │
                    SQLite (dev) / PostgreSQL (prod)
                           │
┌──────────────────────────▼──────────────────────────┐
│           React Dashboard (Port 3000 / 5173)         │
│                                                      │
│  Live Dashboard • Clients • Attendance • Payments    │
│  Reports • Devices • Settings • Audit Logs           │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Features (21 Modules)

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🔐 **Login & Role Management** | JWT-based auth, Admin / Staff RBAC, password management |
| 2 | 👤 **Client Management** | Add, edit, deactivate, search, full profile with photo |
| 3 | 👆 **Biometric Integration** | ZKTeco, eSSL, Generic HTTP webhook adapters |
| 4 | 🔄 **Automatic Attendance Sync** | Webhook → Validate → Record pipeline |
| 5 | ⚡ **Real-Time Attendance** | WebSocket live feed on the dashboard |
| 6 | 📋 **Attendance Management** | Present / Absent / Late / Leave / Manual correction |
| 7 | 🔍 **Attendance Validation** | Duplicate detection, unknown ID, plan expiry checks |
| 8 | 📅 **Daily & Monthly Records** | Per-client daily logs + monthly rollup with % attendance |
| 9 | 📐 **Attendance Rules** | Late threshold, duplicate window, working days, holidays |
| 10 | 💳 **Plan / Membership** | Create plans, assign, track expiry, renewal, meal limits |
| 11 | 💰 **Payment Management** | Record payments, pending/paid tracking, history |
| 12 | 📊 **Monthly Settlement** | Attendance + plan fee + payments = final monthly statement |
| 13 | 🖥️ **Admin Dashboard** | Live stats, weekly trend chart, alerts, recent punches |
| 14 | 📄 **Reports & Export** | Monthly statements, printable invoices |
| 15 | 🔎 **Search & Filters** | Filter by name, ID, biometric ID, date, plan, status |
| 16 | 🔔 **Alerts & Notifications** | Plan expiry, overdue payments, low attendance alerts |
| 17 | 📡 **Device Management** | Add devices, adapter type, ONLINE/OFFLINE monitoring |
| 18 | 🔁 **Error & Sync Recovery** | Failed punch log, retry tracking, offline sync |
| 19 | 📝 **Audit Logs** | Full trail of who changed what, when, and why |
| 20 | 🔒 **Security & RBAC** | JWT, bcrypt passwords, role-gated UI, secure endpoints |
| 21 | 🗝️ **Monthly Lock & Approval** | Admin reviews → approves → locks month from edits |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend Framework** | FastAPI (Python 3.10+) |
| **ORM & Database** | SQLAlchemy 2.0 + SQLite (dev) / PostgreSQL (prod) |
| **Authentication** | JWT (python-jose) + bcrypt (passlib) |
| **Real-Time** | WebSockets (native FastAPI) |
| **Frontend Framework** | React 18 + TypeScript + Vite |
| **Styling** | Vanilla CSS with glassmorphism dark mode |
| **Biometric Adapters** | ZKTeco, eSSL, Generic HTTP (extensible) |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip

### Option 1 — One-Click Launch (Windows)
```batch
# Double-click or run:
start_system.bat
```
This starts both the backend API (port 8000) and React dashboard (port 3000).

### Option 2 — Manual Setup

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Access
| URL | Description |
|-----|-------------|
| http://localhost:3000 | React Admin Dashboard |
| http://127.0.0.1:8000/docs | FastAPI Swagger API Docs |
| http://127.0.0.1:8000/redoc | ReDoc API Reference |

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `admin@system.com` | `admin123` |
| **Operator Staff** | `staff@system.com` | `staff123` |

> ⚠️ Change these immediately in any production deployment.

---

## 📁 Project Structure

```
Biometric Attendance & Management System/
│
├── backend/                        # FastAPI Python Backend
│   ├── requirements.txt
│   └── app/
│       ├── main.py                 # App entry, WebSocket manager, DB seed
│       ├── core/
│       │   ├── config.py           # Settings (JWT secret, DB URL, rules)
│       │   ├── database.py         # SQLAlchemy engine + session
│       │   └── security.py         # JWT auth, password hashing
│       ├── models/                 # SQLAlchemy ORM models
│       │   ├── user.py
│       │   ├── client.py
│       │   ├── plan.py
│       │   ├── client_plan.py
│       │   ├── attendance.py
│       │   ├── payment.py
│       │   ├── device.py
│       │   └── audit_log.py
│       ├── schemas/
│       │   └── schemas.py          # Pydantic request/response schemas
│       ├── api/                    # Route handlers
│       │   ├── auth.py
│       │   ├── clients.py
│       │   ├── plans.py
│       │   ├── attendance.py       # Webhook + Simulator + Manual + Logs
│       │   ├── payments.py
│       │   ├── reports.py          # Dashboard stats, monthly statement, locks
│       │   ├── devices.py
│       │   └── audit_logs.py
│       ├── services/
│       │   └── validation_service.py  # Core punch validation engine
│       └── integrations/
│           └── biometric/
│               ├── base.py         # Abstract adapter interface
│               ├── generic.py      # Generic HTTP adapter
│               └── zkteco.py       # ZKTeco adapter
│
├── frontend/                       # React + TypeScript + Vite Dashboard
│   ├── index.html
│   ├── vite.config.ts              # Dev proxy → backend :8000
│   ├── tsconfig.json
│   └── src/
│       ├── App.tsx                 # Root with auth, routing, WebSocket
│       ├── main.tsx
│       ├── types/index.ts          # All TypeScript interfaces
│       ├── services/api.ts         # Typed API client
│       ├── styles/index.css        # Design system (dark, glassmorphism)
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── ClientsPage.tsx
│       │   ├── AttendancePage.tsx
│       │   ├── PlansPage.tsx
│       │   ├── PaymentsPage.tsx
│       │   ├── ReportsPage.tsx
│       │   ├── DevicesPage.tsx
│       │   ├── RulesAndSettingsPage.tsx
│       │   └── AuditLogsPage.tsx
│       └── components/
│           ├── Sidebar.tsx
│           ├── Navbar.tsx
│           ├── ClientProfileModal.tsx
│           ├── MonthlyStatementModal.tsx
│           └── PunchSimulatorModal.tsx
│
└── start_system.bat                # One-click Windows launcher
```

---

## 🔗 Biometric Webhook API

To integrate any biometric device, POST punch events to:

```
POST http://your-server:8000/api/v1/attendance/webhook
```

**Generic payload:**
```json
{
  "device_id": "DEVICE-01",
  "biometric_user_id": "105",
  "punch_type": "IN",
  "timestamp": "2026-08-10T14:30:00Z"
}
```

**ZKTeco payload (auto-detected):**
```json
{
  "SN": "DEVICE-01",
  "PIN": "105",
  "Verify": 1,
  "DateTime": "2026-08-10 14:30:00"
}
```

---

## 📜 License

MIT License — free for personal and commercial use.

---

<div align="center">
Built with ❤️ | FastAPI + React + SQLAlchemy
</div>
