from pydantic import BaseModel
from typing import Optional

class EngineGenerateRequest(BaseModel):
    idea: str
    tech_stack: Optional[str] = "react-fastapi-postgres"
