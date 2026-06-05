from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_database_session
from app.models import User, Trip
from app.schemas import TripCreationRequest, TripResponse
from app.auth import get_current_authorized_user, is_admin_user, is_client_user

trip_router = APIRouter()

@trip_router.get("/", response_model=List[TripResponse])
def get_all_trips(offset: int = 0, limit: int = 100, database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    return database_session.query(Trip).offset(offset).limit(limit).all()

@trip_router.post("/", response_model=TripResponse)
def create_new_trip(trip_data: TripCreationRequest, database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    if not is_client_user(authorized_user):
        raise HTTPException(status_code=403, detail="Недостаточно прав для создания рейса")
    
    trip_status = "active" if is_admin_user(authorized_user) else "pending"
    
    new_trip = Trip(**trip_data.model_dump(), status=trip_status, total_catch=0, progress=0)
    database_session.add(new_trip)
    database_session.commit()
    database_session.refresh(new_trip)
    return new_trip

@trip_router.put("/{trip_id}/complete")
def mark_trip_as_completed(trip_id: int, database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    if not is_admin_user(authorized_user):
        raise HTTPException(status_code=403, detail="Только администратор может завершать рейсы")
    
    trip_to_complete = database_session.query(Trip).filter(Trip.id == trip_id).first()
    if not trip_to_complete:
        raise HTTPException(status_code=404, detail="Рейс не найден")
    
    trip_to_complete.status = "completed"
    trip_to_complete.progress = 100
    database_session.commit()
    return {"message": "Рейс успешно завершен"}
