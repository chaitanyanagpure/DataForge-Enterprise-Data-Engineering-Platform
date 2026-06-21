from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class WorkflowBase(BaseModel):
    name: str
    cron: str
    status: Optional[str] = "active"
    pipeline_id: int

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    cron: Optional[str] = None
    status: Optional[str] = None
    pipeline_id: Optional[int] = None

class WorkflowInDB(WorkflowBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WorkflowResponse(WorkflowInDB):
    pass
