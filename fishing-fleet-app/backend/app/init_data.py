from app.database import SessionLocal, engine, Base
from app.models import User, Vessel, FishingSpot, Trip
from app.auth import get_password_hash

def init_demo_data():
    db = SessionLocal()
    
    # Создаем демо-пользователей
    demo_users = [
        {"username": "guest", "password": "guest", "email": "guest@fleet.ru", "full_name": "Гость", "role": "guest"},
        {"username": "client", "password": "client", "email": "client@fleet.ru", "full_name": "Иван Петров", "role": "client"},
        {"username": "admin", "password": "admin", "email": "admin@fleet.ru", "full_name": "Администратор", "role": "admin"},
    ]
    
    for user_data in demo_users:
        existing = db.query(User).filter(User.username == user_data["username"]).first()
        if not existing:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"]
            )
            db.add(user)
    
    db.commit()
    db.close()
    print("✅ Демо-пользователи созданы: guest/guest, client/client, admin/admin")

if __name__ == "__main__":
    init_demo_data()
