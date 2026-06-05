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
    owned_vessels = relationship("Vessel", back_populates="vessel_owner")
    submitted_applications = relationship("Application", back_populates="application_author", foreign_keys="Application.user_id")

class Vessel(Base):
    __tablename__ = "vessels"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    vessel_type = Column(String(50), nullable=False)
    displacement = Column(Float, nullable=False)
    construction_date = Column(Date, nullable=False)
    registration_number = Column(String(50), unique=True)
    photo_url = Column(String(500))
    current_status = Column(Enum(VesselStatus), default=VesselStatus.IN_PORT)
    owner_id = Column(Integer, ForeignKey("users.id"))
    captain_name = Column(String(100), nullable=False)
    max_crew_size = Column(Integer, default=10)
    current_crew_count = Column(Integer, default=0)
    current_position = Column(String(200), default="Порт Мурманск")
    maximum_speed = Column(Float, default=10)
    fuel_percentage = Column(Float, default=100)
    vessel_description = Column(String(500))
    last_service_date = Column(Date)
    next_service_date = Column(Date)
    total_catch_weight = Column(Float, default=0)
    catch_by_species = Column(JSON, default=dict)
    registration_date = Column(DateTime(timezone=True), server_default=func.now())
    vessel_owner = relationship("User", back_populates="owned_vessels")
    completed_trips = relationship("Trip", back_populates="assigned_vessel")

class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    vessel_id = Column(Integer, ForeignKey("vessels.id"), nullable=False)
    vessel_display_name = Column(String(100))
    departure_date = Column(Date, nullable=False)
    return_date = Column(Date)
    trip_status = Column(Enum(TripStatus), default=TripStatus.PLANNED)
    trip_catch_total = Column(Float, default=0)
    completion_percentage = Column(Integer, default=0)
    trip_created_at = Column(DateTime(timezone=True), server_default=func.now())
    assigned_vessel = relationship("Vessel", back_populates="completed_trips")
    crew_members_list = relationship("CrewMember", back_populates="parent_trip")
    catch_records = relationship("Catch", back_populates="parent_trip")

class CrewMember(Base):
    __tablename__ = "crew_members"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    member_name = Column(String(100), nullable=False)
    job_position = Column(String(50), nullable=False)
    years_of_experience = Column(Integer, default=0)
    parent_trip = relationship("Trip", back_populates="crew_members_list")

class FishingSpot(Base):
    __tablename__ = "fishing_spots"
    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String(100), unique=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    water_depth = Column(Float)
    available_fish_species = Column(JSON)
    productivity_rate = Column(String(20), default="medium")
    location_description = Column(String(500))
    date_added = Column(DateTime(timezone=True), server_default=func.now())

class Catch(Base):
    __tablename__ = "catches"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    fish_species = Column(String(50), nullable=False)
    catch_amount = Column(Float, nullable=False)
    catch_quality = Column(Enum(CatchQuality), default=CatchQuality.GOOD)
    parent_trip = relationship("Trip", back_populates="catch_records")

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    application_type = Column(Enum(ApplicationType), nullable=False)
    application_data = Column(JSON, nullable=False)
    review_status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    applicant_name = Column(String(100))
    submission_date = Column(DateTime(timezone=True), server_default=func.now())
    application_author = relationship("User", back_populates="submitted_applications", foreign_keys=[user_id])
