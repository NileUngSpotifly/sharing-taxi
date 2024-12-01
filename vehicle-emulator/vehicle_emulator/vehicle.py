from typing import List
from typing import Optional

import sqlalchemy
from sqlalchemy import ForeignKey
from sqlalchemy import String

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy import text
from datetime import datetime


def run(order_id):
    vehicle_id = 2

    engine = sqlalchemy.create_engine(
        'postgresql://user:password@172.19.139.243:5432/sharing_taxi')

    with engine.connect() as connection:
        result = connection.execute(text(f'SELECT * FROM core_order WHERE id={order_id};'))

        order = result.one()._asdict()

        result = connection.execute(text(f'SELECT * FROM core_port WHERE id={order['from_port_id']};'))

        from_port = result.one()._asdict()

        result = connection.execute(text(f'SELECT * FROM core_port WHERE id={order['to_port_id']};'))

        to_port = result.one()._asdict()

        result = connection.execute(text(f'insert into core_request ' +
                                         f'(is_completed, finished_datetime, cost, distance, ' +
                                         f'vehicle_id, order_id) values ' +
                                         f'({False}, \'{datetime.now()}\', 0, 0, {vehicle_id}, {order_id}) ' +
                                         f'returning id;'))
        connection.commit()

        result_id = result.one()[0]
        print(order_id, result_id)
