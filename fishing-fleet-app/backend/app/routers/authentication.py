from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from app.database import get_database_session
from app.models import User
from app.schemas import UserRegistrationRequest, UserResponse, AuthenticationToken
from app.auth import (
    verify_user_credentials, generate_access_token, hash_user_password,
    get_current_authorized_user, TOKEN_EXPIRATION_MINUTES
)

authentication_router = APIRouter()

@authentication_router.post("/register", response_model=UserResponse)
def register_new_user(user_registration: UserRegistrationRequest, database_session: Session = Depends(get_database_session)):
    existing_user = database_session.query(User).filter(User.username == user_registration.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким именем уже существует")
    
    hashed_password = hash_user_password(user_registration.password)
    new_user = User(
        username=user_registration.username,
        email=user_registration.email,
        full_name=user_registration.full_name,
        hashed_password=hashed_password,
        role="guest"
    )
    database_session.add(new_user)
    database_session.commit()
    database_session.refresh(new_user)
    return new_user

@authentication_router.post("/login")
def login_user(login_form: OAuth2PasswordRequestForm = Depends(), database_session: Session = Depends(get_database_session)):
    authenticated_user = verify_user_credentials(database_session, login_form.username, login_form.password)
    if not authenticated_user:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    
    access_token = generate_access_token(data={"sub": authenticated_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@authentication_router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_authorized_user)):
    return current_user
