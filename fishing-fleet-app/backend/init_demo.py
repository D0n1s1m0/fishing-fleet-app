from app.database import SessionLocal, database_engine, Base
from app.models import User, Vessel, FishingSpot
from app.auth import get_password_hash
from datetime import date

def init():
    Base.metadata.create_all(bind=database_engine)
    db = SessionLocal()
    
    if db.query(User).count() > 0:
        print("Data exists")
        db.close()
        return
    
    users = [
        User(username="guest", email="guest@octofish.ru", full_name="Гость", hashed_password=get_password_hash("guest"), role="guest"),
        User(username="client", email="client@octofish.ru", full_name="Иван Петров", hashed_password=get_password_hash("client"), role="client"),
        User(username="admin", email="admin@octofish.ru", full_name="Администратор", hashed_password=get_password_hash("admin"), role="admin"),
    ]
    db.add_all(users)
    db.commit()
    
    admin = db.query(User).filter(User.username == "admin").first()
    
    vessels = [
        Vessel(name="Атлант", type="Траулер", displacement=3500, build_date=date(2018,5,15), passport_number="TR-001", status="in_port", owner_id=admin.id, captain="Сергеев А.Н.", crew_capacity=25, current_crew=22, current_location="Порт Мурманск", max_speed=14, fuel_level=75, total_catch=450, fish_catch={"Треска":250,"Пикша":150,"Сайда":50}),
        Vessel(name="Баренц", type="Сейнер", displacement=1200, build_date=date(2020,3,20), passport_number="SN-015", status="in_port", owner_id=admin.id, captain="Иванов В.П.", crew_capacity=15, current_crew=14, current_location="Порт Мурманск", max_speed=12, fuel_level=45, total_catch=280, fish_catch={"Треска":180,"Минтай":100}),
        Vessel(name="Восток", type="Траулер", displacement=2800, build_date=date(2019,11,10), passport_number="TR-023", status="in_port", owner_id=admin.id, captain="Петров М.С.", crew_capacity=20, current_crew=18, current_location="Порт Мурманск", max_speed=13, fuel_level=90, total_catch=320, fish_catch={"Треска":200,"Камбала":120}),
    ]
    db.add_all(vessels)
    db.commit()
    
    spots = [
        FishingSpot(name="Медвежинская банка", position_lat=73.5, position_lng=38.0, depth=240, fish_types=["Треска","Пикша","Сайда"], catch_rate="high"),
        FishingSpot(name="Гусиная банка", position_lat=71.5, position_lng=45.0, depth=180, fish_types=["Треска","Минтай"], catch_rate="medium"),
        FishingSpot(name="Кильдинская банка", position_lat=69.5, position_lng=35.0, depth=150, fish_types=["Пикша","Сайда","Камбала"], catch_rate="high"),
    ]
    db.add_all(spots)
    db.commit()
    db.close()
    print("Demo data created")

if __name__ == "__main__":
    init()
