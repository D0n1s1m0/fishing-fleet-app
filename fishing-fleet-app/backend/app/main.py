from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import database_engine, Base
from app.routers import authentication, fleet_vessels, fishing_trips, fishing_locations, applications

Base.metadata.create_all(bind=database_engine)

app = FastAPI(title="OctoFish API", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(authentication.authentication_router, prefix="/api/auth", tags=["auth"])
app.include_router(fleet_vessels.vessel_router, prefix="/api/boats", tags=["boats"])
app.include_router(fishing_trips.trip_router, prefix="/api/trips", tags=["trips"])
app.include_router(fishing_locations.location_router, prefix="/api/spots", tags=["spots"])
app.include_router(applications.application_router, prefix="/api/requests", tags=["requests"])

@app.get("/")
def root():
    return {"message": "OctoFish API"}
