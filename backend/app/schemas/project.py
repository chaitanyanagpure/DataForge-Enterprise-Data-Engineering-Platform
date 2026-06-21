from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#6366F1"
    icon: Optional[str] = "Folder"
    status: Optional[str] = "active"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    status: Optional[str] = None

class ProjectInDB(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProjectResponse(ProjectInDB):
    pass
