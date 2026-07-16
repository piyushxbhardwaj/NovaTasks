from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.schemas.response import APIResponse
from app.auth import get_current_user

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

@router.get("", response_model=APIResponse[List[TaskResponse]])
def get_tasks(
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve tasks for the currently authenticated user, with optional search, filters, and sorting."""
    query = db.query(Task).filter(Task.owner_id == current_user.id)
    
    # Real-time search filter
    if search:
        query = query.filter(
            or_(
                Task.title.ilike(f"%{search}%"),
                Task.description.ilike(f"%{search}%")
            )
        )
        
    # Status filter (pending / completed)
    if status:
        query = query.filter(Task.status == status)
        
    # Priority filter (low / medium / high)
    if priority:
        query = query.filter(Task.priority == priority)
        
    # Sorting logic
    if sort_by in ["created_at", "due_date", "priority", "title"]:
        column = getattr(Task, sort_by)
        if sort_order == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())
    else:
        query = query.order_by(Task.created_at.desc())
        
    tasks = query.all()
    
    return APIResponse(
        success=True,
        message="Tasks retrieved successfully",
        data=tasks
    )

@router.post("", response_model=APIResponse[TaskResponse], status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task for the authenticated user."""
    db_task = Task(
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        priority=task_in.priority,
        due_date=task_in.due_date,
        owner_id=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return APIResponse(
        success=True,
        message="Task created successfully",
        data=db_task
    )

@router.put("/{task_id}", response_model=APIResponse[TaskResponse])
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update details of a specific task owned by the authenticated user."""
    db_task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or unauthorized"
        )
        
    # Update only the fields that were sent in the request
    update_data = task_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
        
    db.commit()
    db.refresh(db_task)
    
    return APIResponse(
        success=True,
        message="Task updated successfully",
        data=db_task
    )

@router.delete("/{task_id}", response_model=APIResponse[None])
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a task owned by the authenticated user."""
    db_task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or unauthorized"
        )
        
    db.delete(db_task)
    db.commit()
    
    return APIResponse(
        success=True,
        message="Task deleted successfully",
        data=None
    )
