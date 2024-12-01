from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserExtension(models.Model):
    class UserType(models.TextChoices):
        PASSENGER = 'passenger', 'passenger',
        DRIVER = 'driver', 'driver'

    user = models.OneToOneField(to=User, on_delete=models.CASCADE, related_name='user_extension')
    type = models.CharField(max_length=20, choices=UserType.choices, default=UserType.PASSENGER)


class Vehicle(models.Model):
    name = models.TextField(max_length=256)
    capacity = models.IntegerField()


class VehiclePosition(models.Model):
    lon = models.DecimalField(max_digits=9, decimal_places=6)
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    vehicle = models.OneToOneField(to=Vehicle, on_delete=models.CASCADE, related_name='position')


class District(models.Model):
    name = models.TextField(max_length=512)


class Port(models.Model):
    class PortType(models.TextChoices):
        EMPTY = 'empty', 'empty',
        BUSY = 'busy', 'busy'
        FULL = 'full', 'full'

    name = models.TextField(max_length=512)
    district = models.ForeignKey(to=District, on_delete=models.CASCADE, related_name='ports')
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lon = models.DecimalField(max_digits=9, decimal_places=6)
    workload = models.CharField(max_length=20, choices=PortType.choices, default=PortType.EMPTY)


class Order(models.Model):
    class OrderStatus(models.TextChoices):
        IN_SEARCH = 'in_search', 'in_search',
        WAITING = 'waiting', 'waiting',
        ACTIVE = 'active', 'active',
        FINISHED = 'finished', 'finished',
        CANCELLED = 'cancelled', 'cancelled',
        ROUTE_ERROR = 'route_error', 'route_error',
        NO_VEHICLES = 'no_vehicles', 'no_vehicles'

    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    from_port = models.ForeignKey(to=Port, on_delete=models.CASCADE, related_name='orders_from')
    to_port = models.ForeignKey(to=Port, on_delete=models.CASCADE, related_name='orders_to')
    created_datetime = models.DateTimeField(default=timezone.now, editable=False)
    date = models.DateTimeField(default=timezone.now)
    order_status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.IN_SEARCH)


class Request(models.Model):
    vehicle = models.ForeignKey(to=Vehicle, on_delete=models.CASCADE)
    cost = models.IntegerField(default=0)
    distance = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    finished_datetime = models.DateTimeField(default=timezone.now)
    order = models.OneToOneField(to=Order, on_delete=models.CASCADE, null=True, related_name='request')
    time = models.IntegerField(default=0)


class FerryMan(models.Model):
    user = models.ForeignKey(to=UserExtension, on_delete=models.CASCADE)
    vehicle = models.ForeignKey(to=Vehicle, on_delete=models.CASCADE)
    job_start_datetime = models.DateTimeField(default=timezone.now, editable=False)
    job_end_datetime = models.DateTimeField(default=timezone.now)
    is_completed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        self.job_start_datetime = timezone.now()
        super().save(*args, **kwargs)
