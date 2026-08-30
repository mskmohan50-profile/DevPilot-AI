import uuid
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, func, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base
from app.models.user import GUID

JSONType = JSON().with_variant(JSONB, "postgresql")

class Project(Base):
    __tablename__ = "projects"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="analyzing")
    current_stage = Column(String(50), default="requirements")
    requirements = Column(JSONType, nullable=True)
    architecture = Column(JSONType, nullable=True)
    file_tree = Column(JSONType, nullable=True)
    tests = Column(JSONType, nullable=True)
    debug_results = Column(JSONType, nullable=True)
    review = Column(JSONType, nullable=True)
    health_score = Column(JSONType, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="projects")
