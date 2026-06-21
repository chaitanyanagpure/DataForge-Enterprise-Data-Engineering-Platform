from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core import auth
from app.core.database import get_db
from app.models.pipeline import Pipeline
from app.schemas.pipeline import PipelineCreate, PipelineResponse, PipelineUpdate

router = APIRouter()

@router.get("/", response_model=List[PipelineResponse])
def list_pipelines(
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    return db.query(Pipeline).all()

@router.post("/", response_model=PipelineResponse, status_code=status.HTTP_201_CREATED)
def create_pipeline(
    pipeline_in: PipelineCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    db_pipeline = db.query(Pipeline).filter(Pipeline.name == pipeline_in.name).first()
    if db_pipeline:
        raise HTTPException(status_code=400, detail="Pipeline with this name already exists.")
    
    new_pipeline = Pipeline(
        name=pipeline_in.name,
        description=pipeline_in.description,
        status=pipeline_in.status or "idle",
        definition_json=pipeline_in.definition_json
    )
    db.add(new_pipeline)
    db.commit()
    db.refresh(new_pipeline)
    return new_pipeline

@router.get("/{pipeline_id}", response_model=PipelineResponse)
def get_pipeline(
    pipeline_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline

@router.put("/{pipeline_id}", response_model=PipelineResponse)
def update_pipeline(
    pipeline_id: int,
    pipeline_in: PipelineUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    update_data = pipeline_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pipeline, field, value)
        
    db.commit()
    db.refresh(pipeline)
    return pipeline

@router.post("/{pipeline_id}/run")
def run_pipeline(
    pipeline_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    pipeline.status = "running"
    db.commit()
    
    # Return simulated execution logs
    import random
    execution_steps = [
        "Initializing pipeline execution context...",
        "Validating nodes configurations and inputs...",
        "Fetching data from source connectors...",
        "Applying schemas transformations and mapping rules...",
        "Writing output data back to data warehouse...",
        "Pipeline executed successfully."
    ]
    
    return {
        "pipeline_id": pipeline_id,
        "status": "success" if random.random() > 0.05 else "failed",
        "logs": execution_steps,
        "duration_seconds": round(random.uniform(5.0, 25.0), 2)
    }

@router.delete("/{pipeline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pipeline(
    pipeline_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    db.delete(pipeline)
    db.commit()
    return None
