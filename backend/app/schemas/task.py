from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    status: Literal["pending", "completed"] = "pending"
    priority: Literal["low", "medium", "high"] = "medium"
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    status: Optional[Literal["pending", "completed"]] = None
    priority: Optional[Literal["low", "medium", "high"]] = None
    due_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
