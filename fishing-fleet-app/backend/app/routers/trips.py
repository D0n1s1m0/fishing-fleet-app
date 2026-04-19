from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Trip
from app.schemas import Trip, TripCreate
from app.auth import get_current_user, check_admin, check_client

router = APIRouter()

@router.get("/", response_model=List[Trip])
def get_trips(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Trip).offset(skip).limit(limit).all()

@router.post("/", response_model=Trip)
def create_trip(
    trip: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_client(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    status = "active" if check_admin(current_user) else "pending"
    
    db_trip = Trip(**trip.dict(), status=status, total_catch=0, progress=0)
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@router.put("/{trip_id}/complete")
def complete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    trip.status = "completed"
    trip.progress = 100
    db.commit()
    return {"message": "Trip completed"}
