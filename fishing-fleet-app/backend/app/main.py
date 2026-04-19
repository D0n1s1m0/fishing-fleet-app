from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, boats, trips, spots, requests, admin

# Создание таблиц
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Северный Рыболовецкий Флот API",
    description="API для управления рыболовецким флотом",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(boats.router, prefix="/api/boats", tags=["boats"])
app.include_router(trips.router, prefix="/api/trips", tags=["trips"])
app.include_router(spots.router, prefix="/api/spots", tags=["spots"])
app.include_router(requests.router, prefix="/api/requests", tags=["requests"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/")
def read_root():
    return {"message": "Северный Рыболовецкий Флот API", "status": "running"}
