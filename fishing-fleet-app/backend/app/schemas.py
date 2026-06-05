from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import date, datetime
from typing import Optional, List

class UserRegistrationRequest(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: Optional[str]
    role: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AuthenticationToken(BaseModel):
    access_token: str
    token_type: str

class VesselCreationRequest(BaseModel):
    name: str
    type: str
    displacement: float
    build_date: date
    passport_number: Optional[str] = None
    image_url: Optional[str] = None
    captain: str
    crew_capacity: int = 10
    current_location: str = "Порт Мурманск"
    max_speed: float = 10
    description: Optional[str] = None

class VesselResponse(BaseModel):
    id: int
    name: str
    type: str
    displacement: float
    build_date: date
    passport_number: Optional[str]
    image_url: Optional[str]
    status: str
    captain: str
    crew_capacity: int
    current_crew: int
    current_location: str
    max_speed: float
    fuel_level: float
    total_catch: float
    fish_catch: Optional[dict] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TripCreationRequest(BaseModel):
    vessel_id: int
    boat_name: Optional[str] = None
    departure_date: date
    return_date: Optional[date] = None

class TripResponse(BaseModel):
    id: int
    vessel_id: int
    boat_name: Optional[str]
    departure_date: date
    return_date: Optional[date]
    status: str
    total_catch: float
    progress: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class FishingLocationRequest(BaseModel):
    name: str
    position_lat: float
    position_lng: float
    depth: Optional[float] = None
    fish_types: List[str] = []
    catch_rate: str = "medium"
    description: Optional[str] = None

class FishingLocationResponse(BaseModel):
    id: int
    name: str
    position_lat: float
    position_lng: float
    depth: Optional[float]
    fish_types: List[str]
    catch_rate: str
    description: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class ApplicationRequest(BaseModel):
    type: str
    data: dict

class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    data: dict
    status: str
    created_by: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
