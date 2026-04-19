from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Vessel, Trip, FishingSpot, Request
from app.schemas import User as UserSchema
from app.auth import get_current_user, check_admin

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return {
        "total_users": db.query(User).count(),
        "total_vessels": db.query(Vessel).count(),
        "pending_vessels": db.query(Vessel).filter(Vessel.status == "pending").count(),
        "active_trips": db.query(Trip).filter(Trip.status == "active").count(),
        "pending_requests": db.query(Request).filter(Request.status == "pending").count(),
        "total_spots": db.query(FishingSpot).count()
    }

@router.get("/users", response_model=List[UserSchema])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    return db.query(User).all()

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role
    db.commit()
    return {"message": f"User role updated to {role}"}
