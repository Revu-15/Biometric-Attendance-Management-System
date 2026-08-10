# 🚀 ATTENDIQ — Production Deployment Guide

This guide details step-by-step instructions for deploying **ATTENDIQ (BioSync)** to a production environment.

---

## 🎯 Production Architecture Overview

In production, ATTENDIQ uses a secure, scalable architecture:

```
                            ┌────────────────────────┐
                            │   Biometric Machine    │ (ZKTeco / eSSL / Generic)
                            └───────────┬────────────┘
                                        │ HTTPS Webhook (Port 443)
                                        ▼
                            ┌────────────────────────┐
                            │    Nginx Reverse Proxy │ (SSL / TLS Certificate)
                            └───────────┬────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────┐
│   FastAPI / Gunicorn Backend         │  │   React Static Build             │
│   (Port 8000 / Uvicorn Workers)      │  │   (Served by Nginx / Vercel)     │
└──────────────────┬───────────────────┘  └──────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│   PostgreSQL Production Database     │
└──────────────────────────────────────┘
```

---

## 🛠️ Deployment Option 1: Docker & Docker Compose (Recommended)

Docker provides a containerized setup with PostgreSQL, FastAPI, Gunicorn, and Nginx.

### 1. Create `backend/Dockerfile`
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn uvicorn

COPY . .

EXPOSE 8000

CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8000"]
```

### 2. Create `frontend/Dockerfile`
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Nginx stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Create `docker-compose.yml` (Root)
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: attendiq_db
    restart: always
    environment:
      POSTGRES_USER: attendiq_user
      POSTGRES_PASSWORD: StrongProductionPassword123!
      POSTGRES_DB: attendiq_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    container_name: attendiq_backend
    restart: always
    environment:
      DATABASE_URL: postgresql://attendiq_user:StrongProductionPassword123!@db:5432/attendiq_db
      SECRET_KEY: super_secret_jwt_key_change_in_production
      ACCESS_TOKEN_EXPIRE_MINUTES: 10080
    ports:
      - "8000:8000"
    depends_on:
      - db

  frontend:
    build: ./frontend
    container_name: attendiq_frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 4. Launch Containers
```bash
docker-compose up -d --build
```
Access the application at `http://your-server-ip`.

---

## ☁️ Deployment Option 2: VPS Server (Ubuntu 22.04 LTS)

Deploy to AWS EC2, DigitalOcean, Hetzner, or Linode VPS.

### Step 1: Server Preparation
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib nginx certbot python3-certbot-nginx git nodejs npm
```

### Step 2: PostgreSQL Database Setup
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE attendiq_db;
CREATE USER attendiq_user WITH PASSWORD 'StrongProductionPassword123!';
GRANT ALL PRIVILEGES ON DATABASE attendiq_db TO attendiq_user;
\q
```

### Step 3: Clone & Setup Backend
```bash
cd /var/www
sudo git clone https://github.com/Revu-15/Biometric-Attendance-Management-System.git attendiq
sudo chown -R $USER:$USER /var/www/attendiq

cd /var/www/attendiq/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt gunicorn uvicorn psycopg2-binary
```

### Step 4: Environment Variables (`backend/.env`)
Create `/var/www/attendiq/backend/.env`:
```env
PROJECT_NAME="ATTENDIQ Enterprise"
DATABASE_URL="postgresql://attendiq_user:StrongProductionPassword123!@localhost:5432/attendiq_db"
SECRET_KEY="generate_random_64_character_hex_key_here"
ACCESS_TOKEN_EXPIRE_MINUTES=10080
DUPLICATE_PUNCH_COOLDOWN_SECONDS=300
```

### Step 5: Systemd Service for Backend
Create `/etc/systemd/system/attendiq-backend.service`:
```ini
[Unit]
Description=ATTENDIQ FastAPI Backend Server
After=network.target postgresql.service

[Service]
User=ubuntu
WorkingDirectory=/var/www/attendiq/backend
ExecStart=/var/www/attendiq/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 127.0.0.1:8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable & start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable attendiq-backend
sudo systemctl start attendiq-backend
```

### Step 6: Build Frontend
```bash
cd /var/www/attendiq/frontend
npm install
npm run build
```

### Step 7: Nginx Web Server Configuration
Create `/etc/nginx/sites-available/attendiq`:
```nginx
server {
    server_name attendiq.yourdomain.com;

    # React Frontend static build
    location / {
        root /var/www/attendiq/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # FastAPI Backend REST APIs
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Telemetry Stream
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site & test Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/attendiq /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: SSL/TLS Certificate (Let's Encrypt HTTPS)
```bash
sudo certbot --nginx -d attendiq.yourdomain.com
```

---

## 🌐 Deployment Option 3: Free Cloud Hosting (Render / Railway + Vercel)

### Backend on Render.com or Railway.app
1. Push repo to GitHub (`Revu-15/Biometric-Attendance-Management-System`).
2. Connect Render/Railway to the repository.
3. Root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn -w 2 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT`
6. Add PostgreSQL add-on database.

### Frontend on Vercel or Netlify
1. Connect Vercel to your GitHub repo.
2. Root directory: `frontend`
3. Framework Preset: `Vite`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Environment variable: `VITE_API_BASE_URL=https://your-backend-url.onrender.com`

---

## 🌐 Custom Domain Setup (GitHub Pages + Backend API)

To point your own custom domain (e.g., `attendiq.com` or `app.yourdomain.com`) to the application:

---

### Part A: Custom Domain for GitHub Pages Frontend (`app.yourdomain.com`)

1. **DNS Provider Setup (GoDaddy / Namecheap / Cloudflare / Route53)**:
   - Create a **CNAME Record**:
     - **Type**: `CNAME`
     - **Host / Name**: `app` (or `@` for apex domain `attendiq.com`)
     - **Target / Value**: `revu-15.github.io`
     - **TTL**: `Automatic` or `3600`

2. **Configure Domain in GitHub**:
   - Go to GitHub Repo: **Settings** → **Pages**.
   - Under **Custom domain**, type your domain name: `app.yourdomain.com` (or `attendiq.com`).
   - Click **Save**.
   - Check **Enforce HTTPS** (GitHub will automatically issue a free Let's Encrypt SSL certificate).

---

### Part B: Custom Subdomain for Backend API & Biometric Webhooks (`api.yourdomain.com`)

1. **DNS Provider Setup**:
   - Create an **A Record** (for VPS server IP) or **CNAME Record** (for Cloud Host):
     - **Type**: `A`
     - **Host / Name**: `api`
     - **Value**: `YOUR_VPS_PUBLIC_IP` (e.g. `185.199.108.153`)
     - *(Or CNAME to `your-backend.onrender.com` if using Render)*

2. **Nginx SSL Setup**:
   ```bash
   # Issue SSL for your API subdomain
   sudo certbot --nginx -d api.yourdomain.com
   ```

3. **Biometric Machine Configuration**:
   Configure hardware scanners to push punches to:
   `https://api.yourdomain.com/api/v1/attendance/webhook`

---

## 🔒 Production Security Checklist

- [x] Set a unique, secret `SECRET_KEY` in environment variables.
- [x] Use HTTPS (SSL certificate) for secure webhook ingestion.
- [x] Configure firewall (`ufw allow 80,443/tcp`).
- [x] Change default Super Admin (`admin@system.com`) password upon first login.
- [x] Enable automated PostgreSQL database backups (`pg_dump`).
