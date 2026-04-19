from sqlalchemy import Column, Integer, String, Date, Float, Boolean, ForeignKey, Text, Enum, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    GUEST = "guest"
    CLIENT = "client"
    ADMIN = "admin"

class FishQuality(str, enum.Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    POOR = "poor"

class Position(str, enum.Enum):
    CAPTAIN = "captain"
    BOATSWAIN = "boatswain"
    FISHERMAN = "fisherman"
    MECHANIC = "mechanic"
    COOK = "cook"

class BoatStatus(str, enum.Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    PENDING = "pending"

class TripStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PLANNED = "planned"
    PENDING = "pending"

class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class RequestType(str, enum.Enum):
    BOAT = "boat"
    TRIP = "trip"
    SPOT = "spot"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(Enum(UserRole), default=UserRole.GUEST)
    is_active = Column(Boolean, default=True)
    avatar = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    vessels = relationship("Vessel", back_populates="owner")
    crew_members = relationship("CrewMember", back_populates="user")
    requests = relationship("Request", back_populates="user")

class Vessel(Base):
    __tablename__ = "vessels"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    displacement = Column(Float, nullable=False)
    build_date = Column(Date, nullable=False)
    passport_number = Column(String(50), unique=True)
    image_url = Column(String(500), nullable=True)
    status = Column(Enum(BoatStatus), default=BoatStatus.PENDING)
    owner_id = Column(Integer, ForeignKey("users.id"))
    captain = Column(String(100), nullable=False)
    crew_capacity = Column(Integer, default=10)
    current_crew = Column(Integer, default=0)
    current_location = Column(String(200), default="Порт")
    max_speed = Column(Float, default=10)
    fuel_level = Column(Float, default=100)
    description = Column(Text, nullable=True)
    last_maintenance = Column(Date, nullable=True)
    next_maintenance = Column(Date, nullable=True)
    total_catch = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner = relationship("User", back_populates="vessels")
    trips = relationship("Trip", back_populates="vessel")

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    vessel_id = Column(Integer, ForeignKey("vessels.id"), nullable=False)
    departure_date = Column(Date, nullable=False)
    return_date = Column(Date)
    status = Column(Enum(TripStatus), default=TripStatus.PLANNED)
    total_catch = Column(Float, default=0)
    progress = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    vessel = relationship("Vessel", back_populates="trips")
    crew = relationship("CrewMember", back_populates="trip")
    fishing_spots = relationship("TripFishingSpot", back_populates="trip")
    catches = relationship("Catch", back_populates="trip")

class CrewMember(Base):
    __tablename__ = "crew_members"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    position = Column(Enum(Position), nullable=False)
    name = Column(String(100), nullable=False)
    experience = Column(Integer, default=0)
    address = Column(Text)
    
    trip = relationship("Trip", back_populates="crew")
    user = relationship("User", back_populates="crew_members")

class FishingSpot(Base):
    __tablename__ = "fishing_spots"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    position_lat = Column(Float, nullable=False)
    position_lng = Column(Float, nullable=False)
    depth = Column(Float)
    fish_types = Column(JSON, default=list)
    catch_rate = Column(String(20), default="medium")
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    trip_spots = relationship("TripFishingSpot", back_populates="fishing_spot")

class TripFishingSpot(Base):
    __tablename__ = "trip_fishing_spots"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    fishing_spot_id = Column(Integer, ForeignKey("fishing_spots.id"), nullable=False)
    arrival_date = Column(Date, nullable=False)
    departure_date = Column(Date, nullable=False)
    fish_quality = Column(Enum(FishQuality), default=FishQuality.GOOD)
    
    trip = relationship("Trip", back_populates="fishing_spots")
    fishing_spot = relationship("FishingSpot", back_populates="trip_spots")
    catches = relationship("Catch", back_populates="trip_fishing_spot")

class FishType(Base):
    __tablename__ = "fish_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    scientific_name = Column(String(100))
    
    catches = relationship("Catch", back_populates="fish_type")

class Catch(Base):
    __tablename__ = "catches"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    trip_fishing_spot_id = Column(Integer, ForeignKey("trip_fishing_spots.id"), nullable=False)
    fish_type_id = Column(Integer, ForeignKey("fish_types.id"), nullable=False)
    weight_kg = Column(Float, nullable=False)
    quality = Column(Enum(FishQuality), default=FishQuality.GOOD)
    
    trip = relationship("Trip", back_populates="catches")
    trip_fishing_spot = relationship("TripFishingSpot", back_populates="catches")
    fish_type = relationship("FishType", back_populates="catches")

class Request(Base):
    __tablename__ = "requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(RequestType), nullable=False)
    data = Column(JSON, nullable=False)
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    processed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    user = relationship("User", foreign_keys=[user_id], back_populates="requests")
    processor = relationship("User", foreign_keys=[processed_by])
