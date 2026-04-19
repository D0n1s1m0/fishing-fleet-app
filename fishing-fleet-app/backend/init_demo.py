from app.database import SessionLocal, engine, Base
from app.models import User, Vessel, FishingSpot, Trip
from app.auth import get_password_hash
from datetime import date

def init_demo_data():
    # Создаем таблицы
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Проверяем, есть ли уже пользователи
    if db.query(User).count() > 0:
        print("✅ Данные уже существуют")
        db.close()
        return
    
    # Создаем демо-пользователей
    demo_users = [
        {"username": "guest", "password": "guest", "email": "guest@fleet.ru", "full_name": "Гость", "role": "guest"},
        {"username": "client", "password": "client", "email": "client@fleet.ru", "full_name": "Иван Петров", "role": "client"},
        {"username": "admin", "password": "admin", "email": "admin@fleet.ru", "full_name": "Администратор", "role": "admin"},
    ]
    
    for user_data in demo_users:
        user = User(
            username=user_data["username"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            hashed_password=get_password_hash(user_data["password"]),
            role=user_data["role"]
        )
        db.add(user)
    
    db.commit()
    
    # Получаем admin'а для создания судов
    admin = db.query(User).filter(User.username == "admin").first()
    
    # Создаем демо-суда
    vessels = [
        Vessel(
            name="Атлант", type="Траулер", displacement=3500, 
            build_date=date(2018, 5, 15), passport_number="TR-2018-001",
            image_url="https://images.unsplash.com/photo-1566933293069-b55c7f326dd4?w=400",
            status="active", owner_id=admin.id, captain="Сергеев А.Н.",
            crew_capacity=25, current_crew=22, current_location="Баренцево море",
            max_speed=14, fuel_level=75, description="Современный рыболовный траулер",
            last_maintenance=date(2026, 1, 15), next_maintenance=date(2026, 7, 15), total_catch=450
        ),
        Vessel(
            name="Баренц", type="Сейнер", displacement=1200,
            build_date=date(2020, 3, 20), passport_number="SN-2020-015",
            image_url="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
            status="active", owner_id=admin.id, captain="Иванов В.П.",
            crew_capacity=15, current_crew=14, current_location="Норвежское море",
            max_speed=12, fuel_level=45, description="Кошельковый сейнер",
            last_maintenance=date(2026, 2, 1), next_maintenance=date(2026, 8, 1), total_catch=280
        ),
        Vessel(
            name="Восток", type="Траулер", displacement=2800,
            build_date=date(2019, 11, 10), passport_number="TR-2019-023",
            image_url="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400",
            status="pending", owner_id=admin.id, captain="Петров М.С.",
            crew_capacity=20, current_crew=0, current_location="Порт Мурманск",
            max_speed=13, fuel_level=90, description="Траулер-морозильщик",
            last_maintenance=date(2026, 3, 10), next_maintenance=date(2026, 4, 20), total_catch=320
        ),
    ]
    
    for vessel in vessels:
        db.add(vessel)
    
    db.commit()
    
    # Создаем места лова
    spots = [
        FishingSpot(
            name="Медвежинская банка", position_lat=73.5, position_lng=38.0,
            depth=240, fish_types=["Треска", "Пикша", "Сайда"],
            catch_rate="high", description="Крупнейшее рыболовное угодье в Баренцевом море"
        ),
        FishingSpot(
            name="Гусиная банка", position_lat=71.5, position_lng=45.0,
            depth=180, fish_types=["Треска", "Минтай"],
            catch_rate="medium", description="Хорошее место для ловли трески"
        ),
        FishingSpot(
            name="Кильдинская банка", position_lat=69.5, position_lng=35.0,
            depth=150, fish_types=["Пикша", "Сайда", "Камбала"],
            catch_rate="high", description="Богатое разнообразие донных рыб"
        ),
        FishingSpot(
            name="Рыбачья банка", position_lat=70.2, position_lng=32.0,
            depth=200, fish_types=["Треска", "Зубатка"],
            catch_rate="low", description="Сезонная миграция трески"
        ),
        FishingSpot(
            name="Северная банка", position_lat=75.0, position_lng=40.0,
            depth=300, fish_types=["Палтус", "Треска"],
            catch_rate="medium", description="Глубоководная рыбалка на палтуса"
        ),
    ]
    
    for spot in spots:
        db.add(spot)
    
    db.commit()
    
    # Получаем судно для рейсов
    atlant = db.query(Vessel).filter(Vessel.name == "Атлант").first()
    barents = db.query(Vessel).filter(Vessel.name == "Баренц").first()
    
    # Создаем рейсы
    trips = [
        Trip(
            vessel_id=atlant.id, departure_date=date(2026, 4, 1),
            status="active", total_catch=45, progress=65
        ),
        Trip(
            vessel_id=barents.id, departure_date=date(2026, 4, 3),
            status="active", total_catch=28, progress=40
        ),
    ]
    
    for trip in trips:
        db.add(trip)
    
    db.commit()
    db.close()
    
    print("✅ Демо-данные созданы!")
    print("📁 База данных: fishing_fleet.db")
    print("👤 Доступы: guest/guest, client/client, admin/admin")

if __name__ == "__main__":
    init_demo_data()
