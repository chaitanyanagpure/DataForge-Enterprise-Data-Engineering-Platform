from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None
    source_type: str
    status: Optional[str] = "active"
    row_count: Optional[int] = 0
    size_bytes: Optional[int] = 0
    owner: Optional[str] = None
    schema_json: Optional[str] = None

class DatasetCreate(DatasetBase):
    pass

class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    row_count: Optional[int] = None
    size_bytes: Optional[int] = None
    schema_json: Optional[str] = None

class DatasetInDB(DatasetBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DatasetResponse(DatasetInDB):
    pass
