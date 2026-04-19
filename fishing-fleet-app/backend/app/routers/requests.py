from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Request
from app.schemas import Request as RequestSchema, RequestCreate, RequestUpdate
from app.auth import get_current_user, check_admin, check_client

router = APIRouter()

@router.get("/", response_model=List[RequestSchema])
def get_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if check_admin(current_user):
        return db.query(Request).all()
    return db.query(Request).filter(Request.user_id == current_user.id).all()

@router.post("/", response_model=RequestSchema)
def create_request(
    request: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_client(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_request = Request(
        user_id=current_user.id,
        type=request.type,
        data=request.data,
        status="pending"
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.put("/{request_id}", response_model=RequestSchema)
def update_request(
    request_id: int,
    request_update: RequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req.status = request_update.status
    req.processed_by = current_user.id
    req.processed_at = db.func.now()
    
    db.commit()
    db.refresh(req)
    return req
