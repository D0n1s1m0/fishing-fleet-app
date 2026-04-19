from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, FishingSpot
from app.schemas import FishingSpot, FishingSpotCreate, FishingSpotUpdate
from app.auth import get_current_user, check_admin, check_client

router = APIRouter()

@router.get("/", response_model=List[FishingSpot])
def get_spots(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(FishingSpot).offset(skip).limit(limit).all()

@router.post("/", response_model=FishingSpot)
def create_spot(
    spot: FishingSpotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_client(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_spot = FishingSpot(**spot.dict())
    db.add(db_spot)
    db.commit()
    db.refresh(db_spot)
    return db_spot

@router.put("/{spot_id}", response_model=FishingSpot)
def update_spot(
    spot_id: int,
    spot_update: FishingSpotUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    spot = db.query(FishingSpot).filter(FishingSpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Spot not found")
    
    for key, value in spot_update.dict(exclude_unset=True).items():
        setattr(spot, key, value)
    
    db.commit()
    db.refresh(spot)
    return spot

@router.delete("/{spot_id}")
def delete_spot(
    spot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    spot = db.query(FishingSpot).filter(FishingSpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Spot not found")
    
    db.delete(spot)
    db.commit()
    return {"message": "Spot deleted"}
