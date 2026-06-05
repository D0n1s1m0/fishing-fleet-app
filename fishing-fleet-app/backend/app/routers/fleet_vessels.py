from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_database_session
from app.models import User, Vessel
from app.schemas import VesselCreationRequest, VesselResponse
from app.auth import get_current_authorized_user, is_admin_user, is_client_user

vessel_router = APIRouter()

@vessel_router.get("/", response_model=List[VesselResponse])
def get_all_vessels(database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    return database_session.query(Vessel).all()

@vessel_router.post("/", response_model=VesselResponse)
def create_new_vessel(vessel_data: VesselCreationRequest, database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    if not is_client_user(authorized_user):
        raise HTTPException(status_code=403, detail="Недостаточно прав для создания судна")
    
    vessel_status = "active" if is_admin_user(authorized_user) else "pending"
    
    new_vessel = Vessel(**vessel_data.model_dump(), owner_id=authorized_user.id, status=vessel_status, current_crew=0, fuel_level=100, total_catch=0)
    database_session.add(new_vessel)
    database_session.commit()
    database_session.refresh(new_vessel)
    return new_vessel

@vessel_router.get("/{vessel_id}", response_model=VesselResponse)
def get_vessel_details(vessel_id: int, database_session: Session = Depends(get_database_session)):
    vessel = database_session.query(Vessel).filter(Vessel.id == vessel_id).first()
    if not vessel:
        raise HTTPException(status_code=404, detail="Судно не найдено")
    return vessel

@vessel_router.put("/{vessel_id}", response_model=VesselResponse)
def update_vessel_info(vessel_id: int, updated_data: VesselCreationRequest, database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    vessel_to_update = database_session.query(Vessel).filter(Vessel.id == vessel_id).first()
    if not vessel_to_update:
        raise HTTPException(status_code=404, detail="Судно не найдено")
    
    for field_name, field_value in updated_data.model_dump().items():
        setattr(vessel_to_update, field_name, field_value)
    
    database_session.commit()
    database_session.refresh(vessel_to_update)
    return vessel_to_update

@vessel_router.delete("/{vessel_id}")
def remove_vessel(vessel_id: int, database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    if not is_admin_user(authorized_user):
        raise HTTPException(status_code=403, detail="Только администратор может удалять суда")
    
    vessel_to_delete = database_session.query(Vessel).filter(Vessel.id == vessel_id).first()
    if not vessel_to_delete:
        raise HTTPException(status_code=404, detail="Судно не найдено")
    
    database_session.delete(vessel_to_delete)
    database_session.commit()
    return {"message": "Судно успешно удалено"}

@vessel_router.put("/{vessel_id}/approve")
def approve_vessel_registration(vessel_id: int, database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    if not is_admin_user(authorized_user):
        raise HTTPException(status_code=403, detail="Только администратор может одобрять суда")
    
    vessel_to_approve = database_session.query(Vessel).filter(Vessel.id == vessel_id).first()
    if not vessel_to_approve:
        raise HTTPException(status_code=404, detail="Судно не найдено")
    
    vessel_to_approve.status = "active"
    database_session.commit()
    return {"message": "Судно одобрено"}
