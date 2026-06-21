from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core import auth
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists."
        )
    
    hashed_password = auth.get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=user_in.role or "viewer"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Seed default user settings for the newly registered user
    from app.models.user_settings import UserSettings
    from app.api.settings import DEFAULT_SETTINGS
    user_default = DEFAULT_SETTINGS.copy()
    user_default["profile"] = {
        "full_name": new_user.full_name or new_user.email.split("@")[0],
        "email": new_user.email
    }
    settings_record = UserSettings(
        user_id=new_user.id,
        settings_data=user_default
    )
    db.add(settings_record)
    db.commit()

    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Authenticate user
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=400,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(auth.get_current_user)):
    return current_user
