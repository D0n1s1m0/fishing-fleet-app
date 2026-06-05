from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os
from app.database import get_database_session
from app.models import User

load_dotenv()

JWT_SECRET_KEY = os.getenv("SECRET_KEY", "octofish-secret-key-2026")
JWT_ALGORITHM = os.getenv("ALGORITHM", "HS256")
TOKEN_EXPIRATION_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

password_hasher = CryptContext(schemes=["bcrypt"], deprecated="auto")
token_extractor = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def hash_user_password(plain_password: str) -> str:
    return password_hasher.hash(plain_password)

def verify_user_credentials(database_session: Session, username: str, password: str):
    user = database_session.query(User).filter(User.username == username).first()
    if not user or not password_hasher.verify(password, user.hashed_password):
        return False
    return user

def generate_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    token_payload = data.copy()
    expiration_time = datetime.utcnow() + (expires_delta or timedelta(minutes=TOKEN_EXPIRATION_MINUTES))
    token_payload.update({"exp": expiration_time})
    return jwt.encode(token_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

async def get_current_authorized_user(token: str = Depends(token_extractor), database_session: Session = Depends(get_database_session)):
    authentication_error = HTTPException(status_code=401, detail="Недействительный токен авторизации")
    try:
        token_payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username = token_payload.get("sub")
        if not username:
            raise authentication_error
    except JWTError:
        raise authentication_error
    user = database_session.query(User).filter(User.username == username).first()
    if not user:
        raise authentication_error
    return user

def is_admin_user(user: User) -> bool:
    return user.role.value == "admin"

def is_client_user(user: User) -> bool:
    return user.role.value in ["client", "admin"]
