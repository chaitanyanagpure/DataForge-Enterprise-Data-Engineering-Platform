from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core import auth
from app.core.database import get_db
from app.models.dataset import Dataset
from app.schemas.dataset import DatasetCreate, DatasetResponse, DatasetUpdate

router = APIRouter()

@router.get("/", response_model=List[DatasetResponse])
def list_datasets(
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    return db.query(Dataset).all()

@router.post("/", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
def create_dataset(
    dataset_in: DatasetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    db_dataset = db.query(Dataset).filter(Dataset.name == dataset_in.name).first()
    if db_dataset:
        raise HTTPException(status_code=400, detail="Dataset with this name already exists.")
    
    new_dataset = Dataset(
        name=dataset_in.name,
        description=dataset_in.description,
        source_type=dataset_in.source_type,
        status=dataset_in.status or "active",
        row_count=dataset_in.row_count or 0,
        size_bytes=dataset_in.size_bytes or 0,
        owner=dataset_in.owner or current_user.full_name or current_user.email,
        schema_json=dataset_in.schema_json
    )
    db.add(new_dataset)
    db.commit()
    db.refresh(new_dataset)
    return new_dataset

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset

@router.put("/{dataset_id}", response_model=DatasetResponse)
def update_dataset(
    dataset_id: int,
    dataset_in: DatasetUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    update_data = dataset_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(dataset, field, value)
        
    db.commit()
    db.refresh(dataset)
    return dataset

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    db.delete(dataset)
    db.commit()
    return None
