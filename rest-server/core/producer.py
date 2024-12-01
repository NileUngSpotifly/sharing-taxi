import json
import pika
from threading import Thread

THREADS = 5

rabbit_host = 'localhost'
rabbit_port = 5672
rabbit_user = 'guest'
rabbit_password = 'guest'
rabbit_vhost = '/'

class RestProducer(Thread):

    queue = []

    def __init__(self) -> None:
        super().__init__()

        self.connection_parameters = pika.ConnectionParameters(host=rabbit_host,
                                      port=rabbit_port,
                                      virtual_host=rabbit_vhost,
                                      credentials=pika.PlainCredentials(rabbit_user, rabbit_password),
                                                               heartbeat=600)

        self.connection = None
        self.channel = None

    def run(self):
        self.connection = pika.BlockingConnection(self.connection_parameters)

        self.channel = self.connection.channel()

        print("started")

        while True:
            if self.queue:
                exchange, routing_key, body = self.queue.pop(0)
                self.publish(exchange, routing_key, body)

            self.connection.process_data_events()

    def publish(self, exchange, routing_key, body):
        if not self.connection or self.connection.is_closed:
            self.connection = pika.BlockingConnection(self.connection_parameters)
            self.channel = self.connection.channel()

        self.channel.queue_declare(queue=routing_key, durable=True)
        self.channel.basic_publish(
                exchange=exchange,
                routing_key=routing_key,
                body=body,
                mandatory=True,
                properties=pika.BasicProperties(content_type='text/plain',
                                        delivery_mode=1)
            )

