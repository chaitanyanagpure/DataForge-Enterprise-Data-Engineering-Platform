from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class PipelineBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[str] = "idle"
    definition_json: Optional[str] = None

class PipelineCreate(PipelineBase):
    pass

class PipelineUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    definition_json: Optional[str] = None

class PipelineInDB(PipelineBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PipelineResponse(PipelineInDB):
    pass
