from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Vessel
from app.schemas import Vessel, VesselCreate, VesselUpdate
from app.auth import get_current_user, check_admin, check_client

router = APIRouter()

@router.get("/", response_model=List[Vessel])
def get_vessels(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if check_admin(current_user):
        vessels = db.query(Vessel).offset(skip).limit(limit).all()
    else:
        vessels = db.query(Vessel).filter(Vessel.status == "active").offset(skip).limit(limit).all()
    return vessels

@router.post("/", response_model=Vessel)
def create_vessel(
    vessel: VesselCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_client(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    status = "active" if check_admin(current_user) else "pending"
    
    db_vessel = Vessel(
        **vessel.dict(),
        owner_id=current_user.id,
        status=status,
        current_crew=0,
        fuel_level=100,
        total_catch=0
    )
    db.add(db_vessel)
    db.commit()
    db.refresh(db_vessel)
    return db_vessel

@router.get("/{vessel_id}", response_model=Vessel)
def get_vessel(
    vessel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vessel = db.query(Vessel).filter(Vessel.id == vessel_id).first()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    if not check_admin(current_user) and vessel.status != "active":
        raise HTTPException(status_code=403, detail="Access denied")
    return vessel

@router.put("/{vessel_id}", response_model=Vessel)
def update_vessel(
    vessel_id: int,
    vessel_update: VesselUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vessel = db.query(Vessel).filter(Vessel.id == vessel_id).first()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    
    if not check_admin(current_user) and vessel.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for key, value in vessel_update.dict(exclude_unset=True).items():
        setattr(vessel, key, value)
    
    db.commit()
    db.refresh(vessel)
    return vessel

@router.delete("/{vessel_id}")
def delete_vessel(
    vessel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    vessel = db.query(Vessel).filter(Vessel.id == vessel_id).first()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    
    db.delete(vessel)
    db.commit()
    return {"message": "Vessel deleted"}

@router.put("/{vessel_id}/approve")
def approve_vessel(
    vessel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    vessel = db.query(Vessel).filter(Vessel.id == vessel_id).first()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    
    vessel.status = "active"
    db.commit()
    return {"message": "Vessel approved"}
