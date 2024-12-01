from django.contrib import admin
from django.contrib.auth.models import User

from core import models


class UserExtensionInline(admin.StackedInline):
    model = models.UserExtension
    fk_name = 'user'


class UserAdmin(admin.ModelAdmin):
    inlines = (UserExtensionInline,)


class VehiclePositionInInline(admin.StackedInline):
    model = models.VehiclePosition
    fk_name = 'vehicle'


class VehicleAdmin(admin.ModelAdmin):
    inlines = (VehiclePositionInInline,)


class RequestInInline(admin.StackedInline):
    model = models.Request
    fk_name = 'order'


class OrderAdmin(admin.ModelAdmin):
    inlines = (RequestInInline,)


admin.site.unregister(User)
admin.site.register(User, UserAdmin)

admin.site.register(models.Vehicle, VehicleAdmin)

admin.site.register(models.Order, OrderAdmin)

admin.site.register(models.Port)
admin.site.register(models.District)
admin.site.register(models.FerryMan)

