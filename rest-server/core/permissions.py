from rest_framework import permissions


class IsDriver(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.user.user_extension.type == 'driver'


class IsPassenger(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.user.user_extension.type == 'passenger'