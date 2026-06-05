from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_database_session
from app.models import User, Request
from app.schemas import ApplicationRequest, ApplicationResponse
from app.auth import get_current_authorized_user, is_admin_user, is_client_user

application_router = APIRouter()

@application_router.get("/", response_model=List[ApplicationResponse])
def get_user_applications(database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    if is_admin_user(authorized_user):
        return database_session.query(Request).all()
    return database_session.query(Request).filter(Request.user_id == authorized_user.id).all()

@application_router.post("/", response_model=ApplicationResponse)
def submit_new_application(application_data: ApplicationRequest, database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    if not is_client_user(authorized_user):
        raise HTTPException(status_code=403, detail="Недостаточно прав для подачи заявки")
    
    new_application = Request(
        user_id=authorized_user.id,
        type=application_data.type,
        data=application_data.data,
        status="pending",
        created_by=authorized_user.full_name
    )
    database_session.add(new_application)
    database_session.commit()
    database_session.refresh(new_application)
    return new_application

@application_router.put("/{application_id}/approve")
def approve_application(application_id: int, database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    if not is_admin_user(authorized_user):
        raise HTTPException(status_code=403, detail="Только администратор может одобрять заявки")
    
    application = database_session.query(Request).filter(Request.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    
    application.status = "approved"
    database_session.commit()
    return {"message": "Заявка одобрена"}

@application_router.put("/{application_id}/reject")
def reject_application(application_id: int, database_session: Session = Depends(get_database_session), authorized_user: User = Depends(get_current_authorized_user)):
    if not is_admin_user(authorized_user):
        raise HTTPException(status_code=403, detail="Только администратор может отклонять заявки")
    
    application = database_session.query(Request).filter(Request.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    
    application.status = "rejected"
    database_session.commit()
    return {"message": "Заявка отклонена"}
