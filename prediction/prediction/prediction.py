import pandas as pd
import random

distance_table_data = [
    {"From": "Марьино", "To": "Печатники", "Distance (km)": 7.94, "Time (min)": 40},
    {"From": "Печатники", "To": "Нагатинский затон", "Distance (km)": 4.37, "Time (min)": 22},
    {"From": "Нагатинский затон", "To": "Меловой", "Distance (km)": 2.18, "Time (min)": 11},
    {"From": "Меловой", "To": "Южный речной вокзал", "Distance (km)": 0.82, "Time (min)": 4},
    {"From": "Южный речной вокзал", "To": "Кленовый бульвар", "Distance (km)": 0.00, "Time (min)": 0},
    {"From": "Кленовый бульвар", "To": "ЗИЛ", "Distance (km)": 3.5, "Time (min)": 18},
    {"From": "ЗИЛ", "To": "Автозаводский мост", "Distance (km)": 2.5, "Time (min)": 12},
    {"From": "Автозаводский мост", "To": "Новоспасский", "Distance (km)": 3.0, "Time (min)": 15},
    {"From": "Новоспасский", "To": "Китай-город – Третьяковский", "Distance (km)": 4.0, "Time (min)": 20},
    {"From": "Китай-город – Третьяковский", "To": "Зарядье", "Distance (km)": 1.0, "Time (min)": 5},
    {"From": "Зарядье", "To": "Красный Октябрь", "Distance (km)": 1.5, "Time (min)": 7},
    {"From": "Красный Октябрь", "To": "Патриарший", "Distance (km)": 1.2, "Time (min)": 6},
    {"From": "Патриарший", "To": "Крымский мост", "Distance (km)": 1.0, "Time (min)": 5},
    {"From": "Крымский мост", "To": "Парк Горького", "Distance (km)": 1.5, "Time (min)": 7},
    {"From": "Парк Горького", "To": "Нескучный сад", "Distance (km)": 1.0, "Time (min)": 5},
    {"From": "Нескучный сад", "To": "Андреевский", "Distance (km)": 1.5, "Time (min)": 7},
    {"From": "Андреевский", "To": "Воробьевы горы - Лужники – Центральный", "Distance (km)": 3.0, "Time (min)": 15},
    {"From": "Воробьевы горы - Лужники – Центральный", "To": "Киевский", "Distance (km)": 2.0, "Time (min)": 10},
    {"From": "Киевский", "To": "Трёхгорный", "Distance (km)": 3.5, "Time (min)": 18},
    {"From": "Трёхгорный", "To": "Парк Фили", "Distance (km)": 4.0, "Time (min)": 20},
]

distance_table = pd.DataFrame(distance_table_data)

def calculate_route(from_pierce, to_pierce):

    total_distance = 0
    total_time = 0
    current_pierce = from_pierce

    while current_pierce != to_pierce:
        route = distance_table[distance_table["From"] == current_pierce]
        if route.empty:
            raise ValueError(f"Маршрут из {current_pierce} не найден.")

        segment = route.iloc[0]
        total_distance += segment["Distance (km)"]
        total_time += segment["Time (min)"]
        current_pierce = segment["To"]

    return total_distance, total_time

def generate_vehicle_near_pierce(pierce_id, vehicles):

    pierce_names = {
        39: "Марьино",
        41: "Печатники",
        188: "Нагатинский затон",
        42: "Меловой",
        43: "Южный речной вокзал",
        44: "Кленовый бульвар",
        187: "ЗИЛ",
        146: "Автозаводский мост",
        49: "Новоспасский",
        50: "Китай-город",
        73: "Зарядье",
        47: "Красный Октябрь",
        51: "Патриарший",
        33: "Крымский мост",
        31: "Парк Горького",
        32: "Нескучный сад",
        72: "Андреевский",
        45: "Воробьевы горы",
        46: "Киевский",
        62: "Трёхгорный",
        60: "Парк Фили"
    }

    pierce_name = pierce_names.get(pierce_id, "Unknown Port")

    return vehicles[random.randint(0, len(vehicles) - 1)]