import pika
import json
import sqlalchemy
from sqlalchemy import text
import datetime
from prediction import calculate_route, generate_vehicle_near_pierce

queue_from = 'processor'
queue_to = 'vehicle'

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

channel.queue_declare(queue=queue_from, durable=True)
channel.queue_declare(queue=queue_to, durable=True)

engine = sqlalchemy.create_engine(
    'postgresql://user:password@127.0.0.1:5432/sharing_taxi'
)

def handle_body(db_connection, body):
    json_body = json.loads(body)
    order_id = json_body["payload"]["id"]

    result = db_connection.execute(text(f'SELECT * FROM core_order WHERE id={order_id};'))
    order = result.one()._asdict()

    result = db_connection.execute(text(f"SELECT * FROM core_port WHERE id={order['from_port_id']};"))
    from_port = result.one()._asdict()

    result = db_connection.execute(text(f"SELECT * FROM core_port WHERE id={order['to_port_id']};"))
    to_port = result.one()._asdict()

    result = db_connection.execute(text(
        "SELECT core_vehicle.id, core_vehicle.name, core_vehicle.capacity, "
        "core_vehicleposition.lat, core_vehicleposition.lon "
        "FROM core_vehicle "
        "JOIN core_vehicleposition ON core_vehicle.id = core_vehicleposition.vehicle_id;"
    ))
    vehicles = [row._asdict() for row in result]

    if not vehicles:
        result = db_connection.execute(text(
            f"update core_order set order_status='no_vehicles' where id={order_id};"
        ))
        db_connection.commit()

        channel.basic_ack(delivery_tag=method_frame.delivery_tag)
        return

    try:
        total_distance, total_time = calculate_route(from_port["name"], to_port["name"])
    except ValueError as e:
        result = db_connection.execute(text(
            f"update core_order set order_status='route_error' where id={order_id};"
        ))
        db_connection.commit()

        channel.basic_ack(delivery_tag=method_frame.delivery_tag)
        return

    selected_vehicle = generate_vehicle_near_pierce(order['from_port_id'], vehicles)
    
    vehicle_id = selected_vehicle["id"]

    # for vehicle in vehicles:
    #     if vehicle["fuel"] >= total_distance * 0.1:
    #         selected_vehicle = vehicle
    #         break

    db_connection.execute(text(
        f"INSERT INTO core_request "
        f"(is_completed, finished_datetime, cost, distance, vehicle_id, order_id, time) VALUES "
        f"({False}, '{datetime.datetime.now()}', 0, {total_distance}, {vehicle_id}, {order_id}, {total_time}) "
        f"RETURNING id;"
    ))
    db_connection.commit()

    channel.basic_publish(
        exchange='',
        routing_key=queue_to,
        body=json.dumps(json_body),
        mandatory=True,
        properties=pika.BasicProperties(content_type='text/plain', delivery_mode=1)
    )

    channel.basic_ack(delivery_tag=method_frame.delivery_tag)

with engine.connect() as db_connection:
    while True:
        method_frame, properties, body = channel.basic_get(queue_from)
        if method_frame:
            handle_body(db_connection, body)
        connection.process_data_events()