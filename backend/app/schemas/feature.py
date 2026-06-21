from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class FeatureBase(BaseModel):
    name: str
    entity_id: str
    data_type: str
    status: Optional[str] = "active"
    code_definition: Optional[str] = None

class FeatureCreate(FeatureBase):
    pass

class FeatureInDB(FeatureBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class FeatureResponse(FeatureInDB):
    pass
