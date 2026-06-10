from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Date, Enum, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    GUEST = "guest"
    CLIENT = "client"
    ADMIN = "admin"

class VesselStatus(str, enum.Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    PENDING = "pending"
    IN_PORT = "in_port"

class TripStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PLANNED = "planned"

class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ApplicationType(str, enum.Enum):
    VESSEL = "boat"
    TRIP = "trip"
    LOCATION = "spot"

class CatchQuality(str, enum.Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    POOR = "poor"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(Enum(UserRole), default=UserRole.GUEST)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Vessel(Base):
    __tablename__ = "vessels"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    displacement = Column(Float, nullable=False)
    build_date = Column(Date, nullable=False)
    passport_number = Column(String(50), unique=True)
    image_url = Column(String(500))
    status = Column(Enum(VesselStatus), default=VesselStatus.IN_PORT)
    owner_id = Column(Integer, ForeignKey("users.id"))
    captain = Column(String(100), nullable=False)
    crew_capacity = Column(Integer, default=10)
    current_crew = Column(Integer, default=0)
    current_location = Column(String(200), default="Порт Мурманск")
    max_speed = Column(Float, default=10)
    fuel_level = Column(Float, default=100)
    description = Column(String(500))
    last_maintenance = Column(Date)
    next_maintenance = Column(Date)
    total_catch = Column(Float, default=0)
    fish_catch = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    vessel_id = Column(Integer, ForeignKey("vessels.id"), nullable=False)
    boat_name = Column(String(100))
    departure_date = Column(Date, nullable=False)
    return_date = Column(Date)
    status = Column(Enum(TripStatus), default=TripStatus.PLANNED)
    total_catch = Column(Float, default=0)
    progress = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CrewMember(Base):
    __tablename__ = "crew_members"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    name = Column(String(100), nullable=False)
    position = Column(String(50), nullable=False)
    experience = Column(Integer, default=0)

class FishingSpot(Base):
    __tablename__ = "fishing_spots"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    position_lat = Column(Float, nullable=False)
    position_lng = Column(Float, nullable=False)
    depth = Column(Float)
    fish_types = Column(JSON)
    catch_rate = Column(String(20), default="medium")
    description = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Catch(Base):
    __tablename__ = "catches"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    fish_type = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    quality = Column(Enum(CatchQuality), default=CatchQuality.GOOD)

class Request(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(ApplicationType), nullable=False)
    data = Column(JSON, nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    created_by = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
