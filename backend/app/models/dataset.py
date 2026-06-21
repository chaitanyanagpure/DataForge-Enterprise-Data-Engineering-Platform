from sqlalchemy import Column, Integer, String, BigInteger, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    source_type = Column(String, nullable=False) # s3, postgresql, snowflake, bigquery, redshift, local
    status = Column(String, default="active") # active, processing, error, synced
    row_count = Column(BigInteger, default=0)
    size_bytes = Column(BigInteger, default=0)
    owner = Column(String, nullable=True)
    schema_json = Column(Text, nullable=True) # JSON representation of columns and types
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
