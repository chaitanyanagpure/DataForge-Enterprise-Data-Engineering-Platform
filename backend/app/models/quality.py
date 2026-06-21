from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class QualityRule(Base):
    __tablename__ = "quality_rules"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    field = Column(String, nullable=False)
    rule_type = Column(String, nullable=False) # not_null, unique, range, regex, type
    parameters_json = Column(Text, nullable=True) # parameters like min, max, regex pattern
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
