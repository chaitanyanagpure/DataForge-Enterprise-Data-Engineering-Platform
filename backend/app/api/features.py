from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core import auth
from app.core.database import get_db
from app.models.feature import Feature
from app.schemas.feature import FeatureCreate, FeatureResponse

router = APIRouter()

@router.get("/", response_model=List[FeatureResponse])
def list_features(
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    return db.query(Feature).all()

@router.post("/", response_model=FeatureResponse, status_code=status.HTTP_201_CREATED)
def create_feature(
    feature_in: FeatureCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    db_feat = db.query(Feature).filter(Feature.name == feature_in.name).first()
    if db_feat:
        raise HTTPException(status_code=400, detail="Feature with this name already exists.")
    
    new_feature = Feature(
        name=feature_in.name,
        entity_id=feature_in.entity_id,
        data_type=feature_in.data_type,
        status=feature_in.status or "active",
        code_definition=feature_in.code_definition
    )
    db.add(new_feature)
    db.commit()
    db.refresh(new_feature)
    return new_feature

@router.get("/{feature_id}", response_model=FeatureResponse)
def get_feature(
    feature_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    feature = db.query(Feature).filter(Feature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    return feature

@router.delete("/{feature_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feature(
    feature_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    feature = db.query(Feature).filter(Feature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    db.delete(feature)
    db.commit()
    return None
