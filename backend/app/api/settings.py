from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core import auth
from app.core.database import get_db
from app.models.user import User
from app.models.user_settings import UserSettings
from app.schemas.user_settings import UserSettingsResponse, UserSettingsUpdate

router = APIRouter()

# Default mock data for seeding new settings records
DEFAULT_SETTINGS = {
    "profile": {
        "full_name": "Alex DataForge",
        "email": "alex@dataforge.io"
    },
    "team": [
        {
            "id": "u1",
            "name": "Alex Chen",
            "email": "alex@dataforge.io",
            "role": "admin",
            "createdAt": "2024-01-15T08:00:00Z"
        },
        {
            "id": "u2",
            "name": "Sarah Kim",
            "email": "sarah@dataforge.io",
            "role": "data_engineer",
            "createdAt": "2024-02-10T09:00:00Z"
        },
        {
            "id": "u3",
            "name": "Marcus Lee",
            "email": "marcus@dataforge.io",
            "role": "data_scientist",
            "createdAt": "2024-03-01T10:00:00Z"
        }
    ],
    "notifications": {
        "pipeline_failures": True,
        "data_quality": True,
        "sla_breaches": True,
        "pipeline_completions": False,
        "team_members": True,
        "feature_updates": False
    },
    "theme": "dark"
}

@router.get("", response_model=UserSettingsResponse)
def get_user_settings(
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    settings_record = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings_record:
        # Create default settings tailored to the authenticated user
        user_default = DEFAULT_SETTINGS.copy()
        user_default["profile"] = {
            "full_name": current_user.full_name or current_user.email.split("@")[0],
            "email": current_user.email
        }
        
        settings_record = UserSettings(
            user_id=current_user.id,
            settings_data=user_default
        )
        db.add(settings_record)
        db.commit()
        db.refresh(settings_record)
        
    return settings_record

@router.put("", response_model=UserSettingsResponse)
def update_user_settings(
    settings_in: UserSettingsUpdate,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure settings input is non-empty
    if not settings_in.settings_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Settings data cannot be empty."
        )

    # 1. Update core user details (full_name / email) if profile changes are present
    profile = settings_in.settings_data.get("profile")
    if profile:
        new_name = profile.get("full_name")
        new_email = profile.get("email")

        # Validate name is non-empty
        if new_name is not None and not new_name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name cannot be empty."
            )
            
        # Validate email is non-empty
        if new_email is not None and not new_email.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address cannot be empty."
            )

        # Handle email conflict validation
        if new_email and new_email.lower() != current_user.email.lower():
            conflict_user = db.query(User).filter(User.email.ilike(new_email)).first()
            if conflict_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A user with this email address already exists."
                )
            current_user.email = new_email.strip()

        if new_name:
            current_user.full_name = new_name.strip()

    # 2. Update user_settings record
    settings_record = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings_record:
        settings_record = UserSettings(
            user_id=current_user.id,
            settings_data=settings_in.settings_data
        )
        db.add(settings_record)
    else:
        # Re-assign dict to ensure SQLAlchemy flags modification on JSON column
        settings_record.settings_data = settings_in.settings_data

    db.commit()
    db.refresh(settings_record)
    return settings_record
