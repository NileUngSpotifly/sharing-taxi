from rest_framework import serializers
from django.contrib.auth import authenticate

from django.db import transaction

from django.contrib.auth.models import User
from core import models
from core.models import UserExtension


class TokenSerializer(serializers.Serializer):
    token = serializers.CharField()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        user = authenticate(username=attrs['email'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError('Incorrect email or password.')
        if not user.is_active:
            raise serializers.ValidationError('User is disabled.')
        user.user_extension = models.UserExtension.objects.get_or_create(user=user)[0]
        return {'user': user}


class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    name = serializers.CharField()
    surname = serializers.CharField()
    type = serializers.CharField()

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create(username=validated_data['email'],
                                   email=validated_data['email'],
                                   password=validated_data['password'],
                                   first_name=validated_data['name'],
                                   last_name=validated_data['surname'])
        user.set_password(validated_data['password'])
        user_extension = models.UserExtension.objects.get_or_create(user=user,
                                                                    type=validated_data['type'])[0]
        user.user_extension = user_extension
        user.save()
        return user

    def validate(self, attrs):
        is_user_exists = User.objects.filter(username=attrs["email"]).exists()
        if is_user_exists:
            raise serializers.ValidationError('User already exists.')
        return attrs


class CurrentUserSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='user_extension.type')

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'type')


class VehiclePositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.VehiclePosition
        fields = '__all__'


class VehicleSerializer(serializers.ModelSerializer):
    position = VehiclePositionSerializer(many=False)

    class Meta:
        model = models.Vehicle
        fields = '__all__'


class PortSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Port
        fields = '__all__'


class DistrictSerializer(serializers.ModelSerializer):
    ports = PortSerializer(many=True)

    class Meta:
        model = models.District
        fields = '__all__'


class RequestSerializer(serializers.ModelSerializer):
    vehicle = VehicleSerializer(many=False)

    class Meta:
        model = models.Request
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    request = RequestSerializer(many=False, read_only=True)

    def create(self, validated_data):
        user = self.context['user']

        return models.Order.objects.create(user=user, **validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        from_port = models.Port.objects.get(pk=data["from_port"])
        to_port = models.Port.objects.get(pk=data["to_port"])

        data['from_port'] = from_port.name
        data['to_port'] = to_port.name

        return data

    class Meta:
        model = models.Order
        fields = '__all__'
        read_only_fields = ('id', 'request', 'user', 'order_status')


class FerryManSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.FerryMan
        fields = '__all__'

