from typing import Dict, Any
from pydantic import BaseModel

class UserSettingsBase(BaseModel):
    settings_data: Dict[str, Any]

class UserSettingsCreate(UserSettingsBase):
    pass

class UserSettingsUpdate(UserSettingsBase):
    pass

class UserSettingsResponse(BaseModel):
    id: int
    user_id: int
    settings_data: Dict[str, Any]

    class Config:
        from_attributes = True
