from pydantic import BaseModel
from typing import Optional, Any
from uuid import UUID
from datetime import datetime

class ProjectCreate(BaseModel):
    title: str
    description: str

class ProjectUpdate(BaseModel):
    status: Optional[str] = None
    current_stage: Optional[str] = None
    requirements: Optional[Any] = None
    architecture: Optional[Any] = None
    file_tree: Optional[Any] = None
    tests: Optional[Any] = None
    debug_results: Optional[Any] = None
    review: Optional[Any] = None
    health_score: Optional[Any] = None

class ProjectResponse(BaseModel):
    id: UUID
    title: str
    description: str
    status: str
    current_stage: str
    requirements: Optional[Any] = None
    architecture: Optional[Any] = None
    file_tree: Optional[Any] = None
    tests: Optional[Any] = None
    debug_results: Optional[Any] = None
    review: Optional[Any] = None
    health_score: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True
