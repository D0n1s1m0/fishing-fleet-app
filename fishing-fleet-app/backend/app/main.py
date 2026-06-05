from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import database_engine, Base
from app.routers import authentication, fleet_vessels, fishing_trips, fishing_locations, applications

Base.metadata.create_all(bind=database_engine)

application = FastAPI(title="OctoFish API", version="1.0.0")

application.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

application.include_router(authentication.authentication_router, prefix="/api/auth", tags=["Авторизация"])
application.include_router(fleet_vessels.vessel_router, prefix="/api/boats", tags=["Суда"])
application.include_router(fishing_trips.trip_router, prefix="/api/trips", tags=["Рейсы"])
application.include_router(fishing_locations.location_router, prefix="/api/spots", tags=["Места лова"])
application.include_router(applications.application_router, prefix="/api/requests", tags=["Заявки"])

@application.get("/")
def root_endpoint():
    return {"message": "OctoFish API"}
