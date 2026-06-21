# DataForge — Enterprise Data Engineering & ML Data Platform

DataForge is a production-grade, enterprise-inspired Data Engineering, DataOps, and MLOps platform designed to simulate the modern data infrastructure used by organizations to manage the complete lifecycle of data — from ingestion and cataloging to validation, transformation, orchestration, and ML-ready dataset management.

Built using a scalable full-stack architecture, DataForge provides a unified workspace for data engineers, ML engineers, and analytics teams to discover datasets, monitor data quality, design visual pipelines, automate workflows, and manage data assets securely.

This project demonstrates practical implementation of enterprise-level concepts including multi-tenant architecture, secure authentication, metadata management, data quality monitoring, workflow orchestration, and cloud-native application design.

---

## Application Screenshots

---

### Home Page

<img width="1470" height="883" alt="Home page" src="https://github.com/user-attachments/assets/ed0adb44-6b94-4da1-8812-ea6e1bd33b29" />

---

### Login Page

<img width="1470" height="879" alt="Login Page" src="https://github.com/user-attachments/assets/c321fdce-4f61-493c-9de2-b6b2a681429b" />

---

### Dashboard

<img width="1470" height="884" alt="Dashboard" src="https://github.com/user-attachments/assets/c2c14571-1761-448c-820f-c801f23f4c36" />
<img width="1470" height="884" alt="Dashboard 2" src="https://github.com/user-attachments/assets/3e6c46dd-be60-4c27-838f-7f8472297179" />

---

### Data Catalog

<img width="1470" height="883" alt="Data Catalog" src="https://github.com/user-attachments/assets/0b426785-37b2-4b45-ac08-7d158c5b1501" />

---

### Data Quality

<img width="1470" height="885" alt="Data Quality" src="https://github.com/user-attachments/assets/d83c532c-d4c7-4495-a426-b3c5d7ce0bb2" />
<img width="1470" height="881" alt="Data Quality Validation rules" src="https://github.com/user-attachments/assets/38706c9d-4e92-4fad-b4aa-4f7f2fa8d489" />

---

### Pipeline Builder

<img width="1470" height="881" alt="Pipeline Builder" src="https://github.com/user-attachments/assets/94ee8672-e665-4d6e-b9fe-92a5d108c409" />

---

### Data Versioning

<img width="1470" height="883" alt="Data Versioning" src="https://github.com/user-attachments/assets/339824aa-cb03-4a41-b92d-9c7448ad74d3" />

---

### Feature Store

<img width="1470" height="886" alt="Feature Store" src="https://github.com/user-attachments/assets/a1cf1165-7590-42a1-8335-f8181a00ad62" />

---

### Data Lineage

<img width="1470" height="882" alt="Data Lineage" src="https://github.com/user-attachments/assets/fb0a7ab9-0142-4cc3-9bc8-3432dbba2b67" />

---

### Workflow Automation

<img width="1470" height="881" alt="Workflow Automation" src="https://github.com/user-attachments/assets/2fb62935-6067-4320-bba9-ddb6835a88c3" />

---

### Observability

<img width="1470" height="883" alt="Observability" src="https://github.com/user-attachments/assets/cb49ad42-0d61-45b9-921d-2863a27d4930" />

---

### Settings

<img width="1470" height="881" alt="Settings" src="https://github.com/user-attachments/assets/c0b6bb14-3c63-4759-980e-6c4ff732e619" />
<img width="1470" height="883" alt="Settings   Access control" src="https://github.com/user-attachments/assets/4d626d04-36d7-4738-a54a-cc52428353b7" />

---

## Key Features

### Unified Data Catalog

- Centralized platform to upload, organize, and manage enterprise datasets.
- Automatic schema discovery and metadata extraction.
- Dataset profiling with statistics, column information, and storage insights.
- Dataset ownership, version tracking, and lifecycle management.

### Interactive ETL Pipeline Builder

- Visual drag-and-drop pipeline creation using React Flow.
- Build complex ETL workflows using ingestion, transformation, and output nodes.
- JSON-based pipeline configuration for reproducible workflows.
- Pipeline execution monitoring and status tracking.

### Data Quality & Validation Framework

- Integration with Great Expectations for automated quality checks.
- Configure validation rules including:
  - Null value validation.
  - Uniqueness constraints.
  - Data type verification.
  - Range and pattern validations.
- Generate quality reports and dataset health scores.

### Workflow Orchestration

- Automated workflow scheduling using cron-based triggers.
- Track execution history, status, runtime, and processing statistics.
- Failure handling and operational logging for reliable pipeline execution.

### Multi-Tenant Project & User Management

- Secure user authentication using JWT and OAuth2 workflows.
- Individual workspaces with complete data isolation.
- Persistent user settings including profile, team, and notification preferences.
- Role-based access patterns and resource ownership validation.

### Enterprise Security & Reliability

- Password hashing using BCrypt.
- Secure API authorization and protected routes.
- Database transaction management with commit and rollback mechanisms.
- Strict validation using Pydantic schemas.
- User-level data access control.

---

## Technology Stack

### Frontend

| Category | Technologies |
|----------|-------------|
| Framework | React 19, TypeScript, Vite |
| State Management | Zustand with Persistence Middleware |
| Styling | Tailwind CSS |
| UI Components | Custom Components, Lucide React |
| Animations | Framer Motion |
| Visualizations | React Flow, Recharts |

---

### Backend

| Category | Technologies |
|----------|-------------|
| Framework | FastAPI, Python 3.9+ |
| API Design | REST APIs, Dependency Injection |
| Validation | Pydantic v2 |
| Authentication | JWT Authentication, OAuth2 |
| Security | BCrypt Password Hashing |
| ORM | SQLAlchemy |
| Data Processing | Spark, dbt, Great Expectations |

---

### Infrastructure & Deployment

| Component | Technology |
|----------|------------|
| Containerization | Docker |
| Service Orchestration | Docker Compose |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Reverse Proxy | Nginx |

---

## System Architecture

The DataForge architecture follows a scalable three-tier design consisting of a modern React frontend, FastAPI backend services, and a robust data processing and persistence layer.

<img width="1024" height="1024" alt="exact_architecture" src="https://github.com/user-attachments/assets/5002e7bf-5ca9-4acf-b8eb-289e147ae3f7" />

---

## Repository Structure

```
dataforge-platform/
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Routing, layouts, and themes
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Application screens
│   │   ├── stores/              # Zustand global state
│   │   └── types/               # TypeScript interfaces
│   │
│   ├── Dockerfile               # Production frontend container
│   └── nginx.conf               # Reverse proxy configuration
│
├── backend/
│   ├── app/
│   │   ├── api/                 # API endpoints
│   │   ├── core/                # Configuration and security
│   │   ├── models/              # Database models
│   │   └── schemas/             # Request and response validation
│   │
│   ├── requirements.txt
│   └── Dockerfile
│
├── screenshots/                 # Application screenshots
├── sample datasets/             # Example datasets
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

# Getting Started

## Prerequisites

Ensure the following tools are installed:

- Docker and Docker Compose
- Node.js 18+
- Python 3.9+
- PostgreSQL (optional for local development)

---

## Running Using Docker (Recommended)

Start the complete application stack:

```bash
docker-compose up --build -d
```

Services:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3010 |
| Backend API Documentation | http://localhost:8005/docs |

### Demo Account

```
Email: alex@dataforge.io
Password: password
```

---

## Local Development Setup

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate environment

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the development server:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend API will be available at:

```
http://localhost:8000/docs
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Frontend will be available at:

```
http://localhost:5173
```

---

## Engineering Highlights

- Designed a full-stack enterprise Data Engineering platform with a modern React + FastAPI architecture.
- Implemented a multi-tenant resource management system ensuring complete user-level data isolation.
- Developed interactive ETL pipeline workflows using React Flow with configurable JSON-based pipeline definitions.
- Built a centralized Data Catalog with metadata management and dataset profiling capabilities.
- Integrated Great Expectations for automated data validation and quality monitoring.
- Implemented secure JWT-based authentication with BCrypt password encryption and protected API routes.
- Designed persistent user settings, project management, and workflow execution history backed by PostgreSQL.
- Containerized the complete application using Docker Compose for consistent development and deployment environments.

---

## Future Enhancements

- Cloud storage integration (AWS S3, Google Cloud Storage, Azure Blob Storage).
- Apache Airflow based workflow orchestration.
- Real-time streaming pipelines using Apache Kafka.
- ML feature store and experiment tracking.
- Advanced data lineage visualization.
- Role-based access control and enterprise governance capabilities.

---

## License

This project is intended for educational, research, and professional portfolio purposes only. It demonstrates enterprise-level concepts in Data Engineering, DataOps, and MLOps, including data catalog management, ETL pipeline orchestration, data quality validation, workflow automation, and secure multi-tenant application architecture.

DataForge is designed as a production-inspired platform to showcase modern software engineering practices and is not intended to replace commercial enterprise data management solutions.

---

## Author

**Chaitanya Nagpure**

**AI/ML Engineer | Data Scientist | Data Engineer | Full-Stack AI Developer**

DataForge was developed as a production-grade Enterprise Data Engineering & ML Data Platform demonstrating expertise in modern data infrastructure, DataOps workflows, scalable full-stack architecture, API engineering, database design, secure authentication, containerized deployment, and cloud-ready application development.

**Connect with me:**

- LinkedIn:  https://www.linkedin.com/in/chaitanyanagpure/
- GitHub: https://github.com/chaitanyanagpure
- Email: chaitanyanagpure64791@gmail.com
