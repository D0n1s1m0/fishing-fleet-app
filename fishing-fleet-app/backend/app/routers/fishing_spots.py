from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, FishingSpot
from app.schemas import FishingSpot, FishingSpotCreate
from app.auth import get_current_user, check_authorized

router = APIRouter()

@router.post("/", response_model=FishingSpot)
def create_fishing_spot(
    spot: FishingSpotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_authorized(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_spot = FishingSpot(**spot.dict())
    db.add(db_spot)
    db.commit()
    db.refresh(db_spot)
    return db_spot

@router.get("/", response_model=List[FishingSpot])
def get_fishing_spots(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    spots = db.query(FishingSpot).offset(skip).limit(limit).all()
    return spots
