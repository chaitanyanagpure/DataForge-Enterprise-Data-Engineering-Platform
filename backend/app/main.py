from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api import auth, datasets, quality, pipelines, workflows, features, projects, settings as settings_api
from app.models.user import User
from app.models.dataset import Dataset
from app.models.pipeline import Pipeline
from app.models.workflow import Workflow
from app.models.feature import Feature
from app.models.quality import QualityRule
from app.models.project import Project
from app.core.auth import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="DataForge - Data Engineering & ML Data Platform API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Seeding
@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    try:
        # 1. Seed default user if not exists
        default_email = "alex@dataforge.io"
        exists = db.query(User).filter(User.email == default_email).first()
        if not exists:
            hashed_pwd = get_password_hash("password")
            admin_user = User(
                email=default_email,
                hashed_password=hashed_pwd,
                full_name="Alex DataForge",
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Successfully seeded default admin user (alex@dataforge.io / password)")
            
            # Seed default admin user settings
            from app.models.user_settings import UserSettings
            from app.api.settings import DEFAULT_SETTINGS
            user_default = DEFAULT_SETTINGS.copy()
            user_default["profile"] = {
                "full_name": admin_user.full_name or "Alex DataForge",
                "email": admin_user.email
            }
            settings_record = UserSettings(
                user_id=admin_user.id,
                settings_data=user_default
            )
            db.add(settings_record)
            db.commit()
            print("Successfully seeded settings for default admin user")
        
        # 1.2 Seed default projects if empty
        admin_user = db.query(User).filter(User.email == default_email).first()
        if db.query(Project).count() == 0:
            sample_projects = [
                Project(
                    name="Customer Analytics",
                    description="Customer churn prediction and demographics behavior segmentation pipelines",
                    color="#3B82F6",
                    icon="Folder",
                    owner_id=admin_user.id
                ),
                Project(
                    name="Real-Time Fraud Detection",
                    description="Anomaly detection models and streaming pipelines ingestion from transaction data",
                    color="#EF4444",
                    icon="Folder",
                    owner_id=admin_user.id
                ),
                Project(
                    name="Supply Chain Optimization",
                    description="Inventory forecast and supplier metrics aggregation workflows",
                    color="#10B981",
                    icon="Folder",
                    owner_id=admin_user.id
                ),
                Project(
                    name="Product Recommendation",
                    description="Collaborative filtering algorithms and real-time inference tables",
                    color="#F59E0B",
                    icon="Folder",
                    owner_id=admin_user.id
                )
            ]
            db.add_all(sample_projects)
            db.commit()
            print("Successfully seeded mock projects")
        
        # 2. Seed mock datasets if table is empty
        if db.query(Dataset).count() == 0:
            sample_datasets = [
                Dataset(
                    name="users_clickstream_bronze",
                    description="Raw clickstream events ingested from frontend analytics service",
                    source_type="s3",
                    status="active",
                    row_count=1420500,
                    size_bytes=482100340,
                    owner="Alex DataForge",
                    schema_json='[{"name": "event_id", "type": "string"}, {"name": "user_id", "type": "string"}, {"name": "timestamp", "type": "timestamp"}, {"name": "page_url", "type": "string"}, {"name": "device_type", "type": "string"}]'
                ),
                Dataset(
                    name="users_clickstream_silver",
                    description="Cleaned, sessionized clickstream events with geo-IP lookup",
                    source_type="postgresql",
                    status="synced",
                    row_count=1390400,
                    size_bytes=320140200,
                    owner="Alex DataForge",
                    schema_json='[{"name": "session_id", "type": "string"}, {"name": "user_id", "type": "string"}, {"name": "session_duration", "type": "integer"}, {"name": "country", "type": "string"}, {"name": "device", "type": "string"}]'
                ),
                Dataset(
                    name="user_retention_gold",
                    description="Aggregated user retention profiles and ML features cohort matrix",
                    source_type="snowflake",
                    status="synced",
                    row_count=12000,
                    size_bytes=1045000,
                    owner="Alex DataForge",
                    schema_json='[{"name": "user_id", "type": "string"}, {"name": "cohort_month", "type": "string"}, {"name": "is_retained_30d", "type": "boolean"}, {"name": "total_spend_usd", "type": "float"}]'
                )
            ]
            db.add_all(sample_datasets)
            db.commit()
            print("Successfully seeded mock datasets")
            
        # 3. Seed mock pipelines if empty
        if db.query(Pipeline).count() == 0:
            sample_pipelines = [
                Pipeline(
                    name="Clickstream ET-L Pipeline",
                    description="Loads clickstream records from S3, validates quality rules, and sessionizes data into Silver layer",
                    status="idle",
                    definition_json='{"nodes": [], "edges": []}'
                ),
                Pipeline(
                    name="User Cohort Retention Aggregation",
                    description="Aggregates clickstream sessions and transaction receipts into Snowflake cohort matrices",
                    status="idle",
                    definition_json='{"nodes": [], "edges": []}'
                )
            ]
            db.add_all(sample_pipelines)
            db.commit()
            print("Successfully seeded mock pipelines")
            
        # 4. Seed mock workflows if empty
        if db.query(Workflow).count() == 0:
            pipeline_id = db.query(Pipeline).first().id
            sample_workflows = [
                Workflow(
                    name="Hourly Clickstream Ingestion",
                    cron="0 * * * *",
                    status="active",
                    pipeline_id=pipeline_id
                ),
                Workflow(
                    name="Daily Retention Cohort Refresh",
                    cron="0 2 * * *",
                    status="active",
                    pipeline_id=pipeline_id
                )
            ]
            db.add_all(sample_workflows)
            db.commit()
            print("Successfully seeded mock workflows")

        # 5. Seed mock features if empty
        if db.query(Feature).count() == 0:
            sample_features = [
                Feature(
                    name="user_30d_click_count",
                    entity_id="user_id",
                    data_type="integer",
                    status="active",
                    code_definition="def calculate_clicks_30d(df):\n    return df.filter(df.timestamp > current_date() - interval 30 days).groupBy('user_id').count()"
                ),
                Feature(
                    name="user_preferred_device_category",
                    entity_id="user_id",
                    data_type="string",
                    status="active",
                    code_definition="def get_preferred_device(df):\n    # Calculates the mode category of user login device types"
                )
            ]
            db.add_all(sample_features)
            db.commit()
            print("Successfully seeded mock features")

        # 6. Seed mock quality rules if empty
        if db.query(QualityRule).count() == 0:
            dataset_id = db.query(Dataset).first().id
            sample_rules = [
                QualityRule(
                    dataset_id=dataset_id,
                    field="user_id",
                    rule_type="not_null",
                    parameters_json='{}'
                ),
                QualityRule(
                    dataset_id=dataset_id,
                    field="event_id",
                    rule_type="unique",
                    parameters_json='{}'
                )
            ]
            db.add_all(sample_rules)
            db.commit()
            print("Successfully seeded mock quality rules")
            
    finally:
        db.close()

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(datasets.router, prefix=f"{settings.API_V1_STR}/datasets", tags=["Datasets"])
app.include_router(quality.router, prefix=f"{settings.API_V1_STR}/quality", tags=["Data Quality"])
app.include_router(pipelines.router, prefix=f"{settings.API_V1_STR}/pipelines", tags=["Pipelines"])
app.include_router(workflows.router, prefix=f"{settings.API_V1_STR}/workflows", tags=["Workflows"])
app.include_router(features.router, prefix=f"{settings.API_V1_STR}/features", tags=["Feature Store"])
app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["Projects"])
app.include_router(settings_api.router, prefix=f"{settings.API_V1_STR}/settings", tags=["Settings"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "DataForge Backend",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
