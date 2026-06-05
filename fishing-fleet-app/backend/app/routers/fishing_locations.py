from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_database_session
from app.models import User, FishingSpot
from app.schemas import FishingLocationRequest, FishingLocationResponse
from app.auth import get_current_authorized_user, is_admin_user

location_router = APIRouter()

@location_router.get("/", response_model=List[FishingLocationResponse])
def get_all_fishing_locations(database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    return database_session.query(FishingSpot).all()

@location_router.post("/", response_model=FishingLocationResponse)
def create_new_location(location_data: FishingLocationRequest, database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    new_location = FishingSpot(**location_data.model_dump())
    database_session.add(new_location)
    database_session.commit()
    database_session.refresh(new_location)
    return new_location

@location_router.delete("/{location_id}")
def remove_location(location_id: int, database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    if not is_admin_user(authorized_user):
        raise HTTPException(status_code=403, detail="Только администратор может удалять места лова")
    
    location_to_delete = database_session.query(FishingSpot).filter(FishingSpot.id == location_id).first()
    if not location_to_delete:
        raise HTTPException(status_code=404, detail="Место лова не найдено")
    
    database_session.delete(location_to_delete)
    database_session.commit()
    return {"message": "Место лова удалено"}
