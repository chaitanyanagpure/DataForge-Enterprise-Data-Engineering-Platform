from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Feature(Base):
    __tablename__ = "features"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    entity_id = Column(String, nullable=False) # e.g. user_id
    data_type = Column(String, nullable=False) # float, int, string
    status = Column(String, default="active") # active, draft
    code_definition = Column(Text, nullable=True) # transformation logic
    created_at = Column(DateTime(timezone=True), server_default=func.now())
