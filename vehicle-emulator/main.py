import pika
import json
import time
import sqlalchemy
from sqlalchemy import text
from datetime import datetime
from math import sqrt
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

queue_name = 'vehicle'

connection = pika.BlockingConnection(
    pika.ConnectionParameters(
        host='localhost',
        port=5672,
        virtual_host='/',
        credentials=pika.PlainCredentials('guest', 'guest'),
        heartbeat=600,
        blocked_connection_timeout=300
    )
)
channel = connection.channel()
channel.queue_declare(queue=queue_name, durable=True)

engine = sqlalchemy.create_engine(
    'postgresql://user:password@172.19.139.243:5432/sharing_taxi'
)

def move_towards(current_lat, current_lon, target_lat, target_lon, step=0.01):
    """
    Движение от текущей позиции к целевой позиции на фиксированный шаг.
    Возвращает новую позицию и оставшееся расстояние.
    """
    dx = target_lat - current_lat
    dy = target_lon - current_lon
    distance = sqrt(dx*dx + dy*dy)

    if distance <= step:
        return target_lat, target_lon, 0  # Карета прибыла =)

    ratio = step / distance
    new_lat = current_lat + dx * ratio
    new_lon = current_lon + dy * ratio
    remaining_distance = distance - step
    return new_lat, new_lon, remaining_distance

def handle_body(db_connection, body, method_frame):
    try:
        json_body = json.loads(body)
        logger.debug(f"Received message body: {json_body}")

        order_id = json_body["payload"]["id"]

        result = db_connection.execute(
            text("SELECT vehicle_id FROM core_request WHERE order_id=:order_id;"),
            {"order_id": order_id}
        )
        data = result.fetchone()
        if data and data[0]:
            vehicle_id = data[0]
        else:
            raise ValueError(f"No vehicle assigned to order_id {order_id}")

        logger.info(f"Received message: Order ID = {order_id}, Vehicle ID = {vehicle_id}")

        run(order_id, vehicle_id, db_connection)

        # Подтверждаем сообщение
        channel.basic_ack(delivery_tag=method_frame.delivery_tag)
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        channel.basic_ack(delivery_tag=method_frame.delivery_tag)

def run(order_id, vehicle_id, connection):
    # Получаем заказ
    order_result = connection.execute(
        text("SELECT * FROM core_order WHERE id=:order_id;"),
        {"order_id": order_id}
    )
    order = order_result.one()._asdict()

    # Получаем from_port и to_port
    from_port_result = connection.execute(
        text("SELECT * FROM core_port WHERE id=:port_id;"),
        {"port_id": order['from_port_id']}
    )
    from_port = from_port_result.one()._asdict()

    to_port_result = connection.execute(
        text("SELECT * FROM core_port WHERE id=:port_id;"),
        {"port_id": order['to_port_id']}
    )
    to_port = to_port_result.one()._asdict()

    # Проверяем загрузку портов
    max_workload = 100  # Предполагаемый максимальный уровень загрузки

    try:
        from_port_workload = int(from_port['workload'])
    except (ValueError, TypeError):
        from_port_workload = 0  # Или обработайте ошибку соответствующим образом

    if from_port_workload >= max_workload:
        logger.warning(f"From Port {from_port['name']} is overloaded. Waiting...")
        time.sleep(60)

    # Для to_port
    try:
        to_port_workload = int(to_port['workload'])
    except (ValueError, TypeError):
        to_port_workload = 0  # Или обработайте ошибку соответствующим образом

    if to_port_workload >= max_workload:
        logger.warning(f"To Port {to_port['name']} is overloaded. Waiting...")
        time.sleep(60)

    logger.info(f"Processing Order ID: {order_id}, Vehicle ID: {vehicle_id}")

    # Обновляем статус заказа на 'waiting'
    connection.execute(
        text("UPDATE core_order SET order_status='waiting' WHERE id=:order_id;"),
        {"order_id": order_id}
    )
    connection.commit()

    time.sleep(60)

    vehicle_result = connection.execute(
        text("SELECT * FROM core_vehicle WHERE id=:vehicle_id;"),
        {"vehicle_id": vehicle_id}
    )
    vehicle = vehicle_result.one()._asdict()
    vehicle_lat = float(vehicle['latitude'])
    vehicle_lon = float(vehicle['longitude'])

    from_port_lat = float(from_port['lat'])
    from_port_lon = float(from_port['lon'])

    while True:
        vehicle_lat, vehicle_lon, remaining_distance = move_towards(
            vehicle_lat, vehicle_lon, from_port_lat, from_port_lon
        )
        connection.execute(
            text("INSERT INTO core_vehicleposition (lat, lon, vehicle_id) VALUES (:lat, :lon, :vehicle_id);"),
            {"lat": vehicle_lat, "lon": vehicle_lon, "vehicle_id": vehicle_id}
        )
        connection.commit()

        if remaining_distance == 0:
            connection.execute(
                text("UPDATE core_order SET order_status='passenger_onboard' WHERE id=:order_id;"),
                {"order_id": order_id}
            )
            connection.commit()
            break

        time.sleep(60) 

    time.sleep(60) 

    to_port_lat = float(to_port['lat'])
    to_port_lon = float(to_port['lon'])

    while True:
        vehicle_lat, vehicle_lon, remaining_distance = move_towards(
            vehicle_lat, vehicle_lon, to_port_lat, to_port_lon
        )

        connection.execute(
            text("INSERT INTO core_vehicleposition (lat, lon, vehicle_id) VALUES (:lat, :lon, :vehicle_id);"),
            {"lat": vehicle_lat, "lon": vehicle_lon, "vehicle_id": vehicle_id}
        )
        connection.commit()

        if remaining_distance == 0:
            connection.execute(
                text("UPDATE core_order SET order_status='finished' WHERE id=:order_id;"),
                {"order_id": order_id}
            )
            connection.commit()
            break

        time.sleep(60) 

    connection.execute(
        text("UPDATE core_request SET is_completed=true, finished_datetime=:finished_datetime WHERE order_id=:order_id;"),
        {"finished_datetime": datetime.now(), "order_id": order_id}
    )
    connection.commit()

    logger.info(f"Order {order_id} completed.")

with engine.connect() as db_connection:
    while True:
        method_frame, properties, body = channel.basic_get(queue_name)
        if method_frame:
            handle_body(db_connection, body, method_frame)
        else:
            time.sleep(1)
        connection.process_data_events()
