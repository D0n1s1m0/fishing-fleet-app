from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, CrewMember
from app.schemas import CrewMember, CrewMemberCreate
from app.auth import get_current_user, check_authorized

router = APIRouter()

@router.post("/", response_model=CrewMember)
def create_crew_member(
    crew_member: CrewMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_authorized(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_crew = CrewMember(**crew_member.dict())
    db.add(db_crew)
    db.commit()
    db.refresh(db_crew)
    return db_crew

@router.get("/trip/{trip_id}", response_model=List[CrewMember])
def get_trip_crew(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    crew = db.query(CrewMember).filter(CrewMember.trip_id == trip_id).all()
    return crew
