from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import date, datetime
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    GUEST = "guest"
    CLIENT = "client"
    ADMIN = "admin"

class BoatStatus(str, Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    PENDING = "pending"

class TripStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PLANNED = "planned"
    PENDING = "pending"

class RequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class RequestType(str, Enum):
    BOAT = "boat"
    TRIP = "trip"
    SPOT = "spot"

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

# Vessel schemas
class VesselBase(BaseModel):
    name: str
    type: str
    displacement: float
    build_date: date
    passport_number: Optional[str] = None
    image_url: Optional[str] = None
    captain: str
    crew_capacity: int = 10
    current_location: str = "Порт"
    max_speed: float = 10
    description: Optional[str] = None

class VesselCreate(VesselBase):
    pass

class VesselUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    displacement: Optional[float] = None
    captain: Optional[str] = None
    crew_capacity: Optional[int] = None
    current_location: Optional[str] = None
    max_speed: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class Vessel(VesselBase):
    id: int
    status: BoatStatus
    owner_id: int
    current_crew: int
    fuel_level: float
    total_catch: float
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Trip schemas
class TripBase(BaseModel):
    vessel_id: int
    departure_date: date
    return_date: Optional[date] = None

class TripCreate(TripBase):
    pass

class Trip(TripBase):
    id: int
    status: TripStatus
    total_catch: float
    progress: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Fishing Spot schemas
class FishingSpotBase(BaseModel):
    name: str
    position_lat: float
    position_lng: float
    depth: Optional[float] = None
    fish_types: List[str] = []
    catch_rate: str = "medium"
    description: Optional[str] = None

class FishingSpotCreate(FishingSpotBase):
    pass

class FishingSpotUpdate(BaseModel):
    name: Optional[str] = None
    depth: Optional[float] = None
    fish_types: Optional[List[str]] = None
    catch_rate: Optional[str] = None
    description: Optional[str] = None

class FishingSpot(FishingSpotBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Request schemas
class RequestBase(BaseModel):
    type: RequestType
    data: dict

class RequestCreate(RequestBase):
    pass

class RequestUpdate(BaseModel):
    status: RequestStatus

class Request(RequestBase):
    id: int
    user_id: int
    status: RequestStatus
    created_at: datetime
    processed_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# Crew schemas
class CrewMemberBase(BaseModel):
    trip_id: int
    user_id: int
    position: str
    name: str
    experience: int = 0

class CrewMemberCreate(CrewMemberBase):
    pass

class CrewMember(CrewMemberBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Catch schemas
class CatchBase(BaseModel):
    trip_id: int
    fish_type_id: int
    weight_kg: float
    quality: str = "good"

class CatchCreate(CatchBase):
    pass

class Catch(CatchBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
