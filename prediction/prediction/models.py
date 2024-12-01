class GeoPosition:
    def __init__(self, lat, lon):
        self.lat = lat
        self.lon = lon


class Vehicle:
    def __init__(self, id, position, capacity, fuel):
        self.id = id
        self.position = position
        self.capacity = capacity
        self.fuel = fuel


class Pierce:
    def __init__(self, id, name, lat, lon):
        self.id = id
        self.name = name
        self.lat = lat
        self.lon = lon


class Timetable:
    def __init__(self, id, pierce, start_date, end_date, start_time, end_time, duration):
        self.id = id
        self.pierce = pierce
        self.start_date = start_date
        self.end_date = end_date
        self.start_time = start_time
        self.end_time = end_time
        self.duration = duration
