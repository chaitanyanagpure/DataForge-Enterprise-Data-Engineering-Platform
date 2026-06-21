# DataForge — Enterprise Data Engineering & ML Data Platform

DataForge is a production-grade, enterprise-ready DataOps and MLOps Data Platform designed for modern AI and data teams. It provides a single interface to ingest, validate, transform, version, orchestrate, and monitor dataset health at scale.

---

## 🚀 Key Features

* **Data Ingestion & Catalog**: Search, filter, and inspect structured schemas, columns, cardinality, null/missing counts, and metadata stats.
* **Pipeline Builder**: Interactive, custom drag-and-drop canvas (via React Flow) to construct pipelines with ingestion nodes, filters, joins, transformations, and loaders.
* **Data Quality (DataOps)**: Build, configure, and monitor automated test rules (Completeness, Uniqueness, Ranges, Regexes) with live run logs and trend charts.
* **Workflow Automation**: Schedule workflows with standard Crontab expressions, monitor current runs, and toggle triggers.
* **Data Lineage**: Visual, interactive dependency graph tracking pipeline sources, intermediate datasets, features, and target ML models.
* **Feature Store (MLOps)**: Registry for ML features, tracking data types, entity keys, Python transformation logic, and downstream model consumption.
* **Data Observability**: Real-time charts of system health, CPU/Memory utilization, execution times, success ratios, and data freshness SLAs.
* **Security & Settings**: Role-Based Access Control (RBAC) matrix, team workspace managers, notifications, and immutable audit logs.

---

## 🛠️ Tech Stack

### Frontend
* **Core**: React 19, TypeScript 6.x, Vite 8.x
* **State Management**: Zustand
* **Styling**: Tailwind CSS 4.x, Framer Motion (premium micro-animations)
* **Visualization**: Recharts (smooth SVG charting), React Flow (canvas nodes & lineage)
* **Icons**: Lucide React

### Backend
* **API Framework**: FastAPI (Python 3.9+)
* **Database**: PostgreSQL (SQLAlchemy ORM), SQLite (local zero-config fallback)
* **Task Broker & Cache**: Redis & Celery (simulated in routers)
* **Security**: JWT tokens, bcrypt password hashing, OAuth2 standard

---

## 📁 Repository Structure

```
dataforge/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── app/              # Router and theme providers
│   │   ├── components/       # Primitives, layouts, and modals
│   │   ├── pages/            # View pages (Catalog, Pipelines, Lineage, etc.)
│   │   ├── stores/           # Zustand global state (Auth/App)
│   │   ├── lib/              # Client-side helpers and mock datasets
│   │   └── types/            # Strict TypeScript types
│   ├── Dockerfile            # Multi-stage production Nginx dockerfile
│   └── nginx.conf            # Nginx server configuration (Proxy + SPA router fallback)
├── backend/                  # FastAPI Python application
│   ├── app/
│   │   ├── api/              # Auth, datasets, pipelines, quality, workflows, features routers
│   │   ├── core/             # Configuration, Database engine, Cryptography auth
│   │   ├── models/           # SQLAlchemy schemas (users, datasets, pipelines, workflows)
│   │   ├── schemas/          # Pydantic input validation models
│   │   └── main.py           # FastAPI initialization & Database seeding scripts
│   ├── requirements.txt      # Python backend packages
│   └── Dockerfile            # Lightweight Python runtime container setup
├── docker-compose.yml        # Multi-container orchestration (Postgres, Redis, Backend, Frontend)
└── README.md                 # Complete documentation handbook
```

---

## 🏃 Run Locally

### 1. Frontend Development Setup
```bash
cd frontend

# Install package dependencies
npm install --legacy-peer-deps

# Start Vite live-reload dev server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
* **Pre-filled Credentials**:
  * **Email**: `alex@dataforge.io`
  * **Password**: `password` (Click **Sign In** directly to enter the dashboard)

### 2. Backend Development Setup
Ensure Python 3.9+ is installed:
```bash
cd backend

# Create virtual environment and activate
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend with Uvicorn (local SQLite fallback)
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🐳 Run with Docker Compose

To boot up the complete containerized enterprise application stack (PostgreSQL database, Redis caching broker, FastAPI backend, and Nginx-based React frontend) in a single command:

```bash
# Build and spin up containers
docker-compose up --build
```

* **Frontend Hub**: accessible at [http://localhost:3010](http://localhost:3010)
* **Backend API Docs**: accessible at [http://localhost:8005/docs](http://localhost:8005/docs)
* **Database & Cache**: Isolated securely inside the internal Docker virtual network (no host ports exposed).
