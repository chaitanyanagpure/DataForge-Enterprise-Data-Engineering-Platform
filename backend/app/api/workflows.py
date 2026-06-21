from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core import auth
from app.core.database import get_db
from app.models.workflow import Workflow
from app.schemas.workflow import WorkflowCreate, WorkflowResponse, WorkflowUpdate

router = APIRouter()

@router.get("/", response_model=List[WorkflowResponse])
def list_workflows(
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    return db.query(Workflow).all()

@router.post("/", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
def create_workflow(
    workflow_in: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    db_wf = db.query(Workflow).filter(Workflow.name == workflow_in.name).first()
    if db_wf:
        raise HTTPException(status_code=400, detail="Workflow with this name already exists.")
    
    new_workflow = Workflow(
        name=workflow_in.name,
        cron=workflow_in.cron,
        status=workflow_in.status or "active",
        pipeline_id=workflow_in.pipeline_id
    )
    db.add(new_workflow)
    db.commit()
    db.refresh(new_workflow)
    return new_workflow

@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(
    workflow_id: int,
    workflow_in: WorkflowUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    update_data = workflow_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workflow, field, value)
        
    db.commit()
    db.refresh(workflow)
    return workflow

@router.post("/{workflow_id}/toggle", response_model=WorkflowResponse)
def toggle_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    workflow.status = "paused" if workflow.status == "active" else "active"
    db.commit()
    db.refresh(workflow)
    return workflow

@router.post("/{workflow_id}/trigger")
def trigger_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    import random
    return {
        "workflow_id": workflow_id,
        "run_id": f"run_{random.randint(100000, 999999)}",
        "status": "triggered",
        "message": f"Successfully triggered workflow '{workflow.name}'"
    }

@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    db.delete(workflow)
    db.commit()
    return None
