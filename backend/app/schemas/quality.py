from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class QualityRuleBase(BaseModel):
    dataset_id: int
    field: str
    rule_type: str
    parameters_json: Optional[str] = None
    is_active: Optional[bool] = True

class QualityRuleCreate(QualityRuleBase):
    pass

class QualityRuleInDB(QualityRuleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class QualityRuleResponse(QualityRuleInDB):
    pass
