-- Триггер для каскадного обновления при изменении статуса судна
CREATE OR REPLACE FUNCTION update_trip_status_on_vessel_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_approved = false AND OLD.is_approved = true THEN
        UPDATE trips SET status = 'cancelled' 
        WHERE vessel_id = NEW.id AND status = 'active';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vessel_approval_trigger
    AFTER UPDATE ON vessels
    FOR EACH ROW
    EXECUTE FUNCTION update_trip_status_on_vessel_change();

-- Триггер для автоматического обновления статуса рейса при добавлении даты возвращения
CREATE OR REPLACE FUNCTION update_trip_status_on_return()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.return_date IS NOT NULL AND OLD.return_date IS NULL THEN
        NEW.status = 'completed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trip_return_trigger
    BEFORE UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION update_trip_status_on_return();

-- Триггер для проверки дат при добавлении посещения банки
CREATE OR REPLACE FUNCTION check_fishing_spot_dates()
RETURNS TRIGGER AS $$
DECLARE
    trip_departure DATE;
    trip_return DATE;
BEGIN
    SELECT departure_date, return_date INTO trip_departure, trip_return
    FROM trips WHERE id = NEW.trip_id;
    
    IF NEW.arrival_date < trip_departure THEN
        RAISE EXCEPTION 'Arrival date cannot be before trip departure date';
    END IF;
    
    IF trip_return IS NOT NULL AND NEW.departure_date > trip_return THEN
        RAISE EXCEPTION 'Departure date from fishing spot cannot be after trip return date';
    END IF;
    
    IF NEW.departure_date < NEW.arrival_date THEN
        RAISE EXCEPTION 'Departure date must be after arrival date';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_fishing_spot_dates
    BEFORE INSERT OR UPDATE ON trip_fishing_spots
    FOR EACH ROW
    EXECUTE FUNCTION check_fishing_spot_dates();
