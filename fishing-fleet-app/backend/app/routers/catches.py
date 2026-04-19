from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.models import User, Vessel, Trip, FishingSpot, TripFishingSpot, FishType, Catch
from app.schemas import *
from app.auth import get_current_user

router = APIRouter()

@router.get("/boat-catches", response_model=List[dict])
def get_boat_catches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(
        Vessel.name,
        Trip.departure_date,
        FishType.name.label('fish_type'),
        func.sum(Catch.weight_kg).label('total_catch')
    ).join(Trip, Vessel.id == Trip.vessel_id)\
     .join(Catch, Trip.id == Catch.trip_id)\
     .join(FishType, Catch.fish_type_id == FishType.id)\
     .group_by(Vessel.name, Trip.departure_date, FishType.name)\
     .order_by(Vessel.name, Trip.departure_date)\
     .all()
    
    boat_catches = {}
    for result in results:
        boat_name = result[0]
        departure_date = result[1]
        fish_type = result[2]
        total_catch = result[3]
        
        if boat_name not in boat_catches:
            boat_catches[boat_name] = []
        
        boat_catches[boat_name].append({
            "departure_date": departure_date,
            "fish_type": fish_type,
            "catch_kg": float(total_catch)
        })
    
    return [{"boat_name": k, "catches": v} for k, v in boat_catches.items()]

@router.get("/top-boats-by-fish", response_model=List[TopBoatCatch])
def get_top_boats_by_fish(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    max_catches = db.query(
        FishType.name,
        func.max(func.sum(Catch.weight_kg)).label('max_catch')
    ).join(Catch, FishType.id == Catch.fish_type_id)\
     .join(Trip, Catch.trip_id == Trip.id)\
     .filter(and_(Trip.departure_date >= start_date, Trip.departure_date <= end_date))\
     .group_by(FishType.name, Trip.vessel_id)\
     .subquery()
    
    results = db.query(
        Vessel.name.label('boat_name'),
        FishType.name.label('fish_type'),
        func.sum(Catch.weight_kg).label('total_catch')
    ).join(Trip, Vessel.id == Trip.vessel_id)\
     .join(Catch, Trip.id == Catch.trip_id)\
     .join(FishType, Catch.fish_type_id == FishType.id)\
     .filter(and_(Trip.departure_date >= start_date, Trip.departure_date <= end_date))\
     .group_by(Vessel.name, FishType.name)\
     .having(func.sum(Catch.weight_kg) == db.query(func.max(max_catches.c.max_catch)))\
     .all()
    
    return [
        TopBoatCatch(
            boat_name=r.boat_name,
            fish_type=r.fish_type,
            total_catch=float(r.total_catch)
        ) for r in results
    ]

@router.get("/spot-average-catches", response_model=List[SpotAverageCatch])
def get_spot_average_catches(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(
        FishingSpot.name.label('spot_name'),
        FishType.name.label('fish_type'),
        func.avg(Catch.weight_kg).label('avg_catch'),
        func.sum(Catch.weight_kg).label('total_catch'),
        func.count(func.distinct(Trip.id)).label('trip_count')
    ).join(TripFishingSpot, FishingSpot.id == TripFishingSpot.fishing_spot_id)\
     .join(Trip, TripFishingSpot.trip_id == Trip.id)\
     .join(Catch, TripFishingSpot.id == Catch.trip_fishing_spot_id)\
     .join(FishType, Catch.fish_type_id == FishType.id)\
     .filter(and_(Trip.departure_date >= start_date, Trip.departure_date <= end_date))\
     .group_by(FishingSpot.name, FishType.name)\
     .all()
    
    return [
        SpotAverageCatch(
            spot_name=r.spot_name,
            fish_type=r.fish_type,
            average_catch=float(r.avg_catch),
            total_catch=float(r.total_catch),
            trip_count=r.trip_count
        ) for r in results
    ]

@router.get("/above-average-boats/{spot_id}", response_model=List[AboveAverageBoat])
def get_above_average_boats(
    spot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    avg_catch = db.query(
        func.avg(Catch.weight_kg)
    ).join(TripFishingSpot, Catch.trip_fishing_spot_id == TripFishingSpot.id)\
     .filter(TripFishingSpot.fishing_spot_id == spot_id)\
     .scalar()
    
    results = db.query(
        Vessel.name.label('boat_name'),
        Trip.departure_date.label('trip_date'),
        func.sum(Catch.weight_kg).label('catch_amount')
    ).join(Trip, Vessel.id == Trip.vessel_id)\
     .join(TripFishingSpot, Trip.id == TripFishingSpot.trip_id)\
     .join(Catch, TripFishingSpot.id == Catch.trip_fishing_spot_id)\
     .filter(TripFishingSpot.fishing_spot_id == spot_id)\
     .group_by(Vessel.name, Trip.departure_date)\
     .having(func.sum(Catch.weight_kg) > avg_catch)\
     .all()
    
    return [
        AboveAverageBoat(
            boat_name=r.boat_name,
            trip_date=r.trip_date,
            catch_amount=float(r.catch_amount),
            average_catch=float(avg_catch or 0)
        ) for r in results
    ]

@router.get("/fish-trips", response_model=List[dict])
def get_fish_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(
        FishType.name,
        Vessel.name,
        Trip.departure_date,
        Trip.return_date,
        func.sum(Catch.weight_kg).label('total_catch')
    ).join(Catch, FishType.id == Catch.fish_type_id)\
     .join(Trip, Catch.trip_id == Trip.id)\
     .join(Vessel, Trip.vessel_id == Vessel.id)\
     .group_by(FishType.name, Vessel.name, Trip.departure_date, Trip.return_date)\
     .order_by(FishType.name, Trip.departure_date)\
     .all()
    
    fish_data = {}
    for r in results:
        fish_type = r[0]
        if fish_type not in fish_data:
            fish_data[fish_type] = []
        
        fish_data[fish_type].append({
            "boat_name": r[1],
            "departure_date": r[2],
            "return_date": r[3],
            "catch_kg": float(r[4])
        })
    
    return [{"fish_type": k, "trips": v} for k, v in fish_data.items()]

@router.post("/add-catch", response_model=Catch)
def add_catch(
    catch: CatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_catch = Catch(**catch.dict())
    db.add(db_catch)
    db.commit()
    db.refresh(db_catch)
    return db_catch

@router.get("/trips-by-fish-and-spot", response_model=List[dict])
def get_trips_by_fish_and_spot(
    fish_type_id: int = Query(...),
    spot_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(
        Vessel.name,
        Trip.departure_date,
        Trip.return_date,
        func.sum(Catch.weight_kg).label('total_catch'),
        FishingSpot.name.label('spot_name')
    ).join(Trip, Vessel.id == Trip.vessel_id)\
     .join(TripFishingSpot, Trip.id == TripFishingSpot.trip_id)\
     .join(FishingSpot, TripFishingSpot.fishing_spot_id == FishingSpot.id)\
     .join(Catch, TripFishingSpot.id == Catch.trip_fishing_spot_id)\
     .filter(
         and_(
             Catch.fish_type_id == fish_type_id,
             FishingSpot.id == spot_id
         )
     )\
     .group_by(Vessel.name, Trip.departure_date, Trip.return_date, FishingSpot.name)\
     .all()
    
    return [
        {
            "boat_name": r.name,
            "departure_date": r.departure_date,
            "return_date": r.return_date,
            "total_catch_kg": float(r.total_catch),
            "fishing_spot": r.spot_name
        } for r in results
    ]
