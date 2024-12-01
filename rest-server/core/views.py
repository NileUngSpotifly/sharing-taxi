from rest_framework.mixins import RetrieveModelMixin, \
    ListModelMixin, CreateModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.generics import GenericAPIView
from rest_framework.views import APIView
from rest_framework import views, permissions, response, status

from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token

from core import models
from core import serializers
from core import permissions as core_permissions

from drf_yasg import openapi
from drf_yasg.openapi import Parameter, IN_QUERY
from drf_yasg.utils import swagger_auto_schema

from django.db.models import Q
from core import producer
from core.producer import RestProducer

import json


rest_producer = RestProducer()
rest_producer.start()


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(request_body=serializers.LoginSerializer,
                         responses={200: "{\"token\": \"string\"}"},
                         operation_description="Авторизует пользователя. Возвращает токен, который впоследствии долэен передаваться в заголовке Authorization: Token <token>.")
    def post(self, request):  # auth
        serializer = serializers.LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return response.Response({'error': serializer.errors}, status=status.HTTP_401_UNAUTHORIZED)
        user = serializer.validated_data['user']
        token = Token.objects.get_or_create(user=user)
        return response.Response({'token': token[0].key})


    @swagger_auto_schema(request_body=serializers.RegistrationSerializer,
                         responses={200: "{\"token\": \"string\"}"},
                         operation_description="Регистрирует пользователя. Возвращает токен, который впоследствии долэен передаваться в заголовке Authorization: Token <token>.")
    def put(self, request):  # registration
        serializer = serializers.RegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return response.Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        token = Token.objects.get_or_create(user=user)
        return response.Response({'token': token[0].key})

class PortsMixin(ListModelMixin, GenericAPIView):
    permission_classes = [permissions.AllowAny]

    serializer_class = serializers.DistrictSerializer
    queryset = models.District.objects.all().order_by('name')

    @swagger_auto_schema(operation_description="Возвращает список портов.")
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class PortMixin(RetrieveModelMixin, GenericAPIView):
    permission_classes = [permissions.AllowAny]

    serializer_class = serializers.PortSerializer
    queryset = models.Port.objects.all().order_by('name')

    @swagger_auto_schema(operation_description="Возвращает информацию по конкретному порту.")
    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class UserInfoApiView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(operation_description="Возвращает данные о пользователе.")
    def get(self, request):
        serializer = serializers.CurrentUserSerializer(instance=request.user)
        return response.Response(serializer.data)

class ActiveOrdersMixin(ListModelMixin, CreateModelMixin, GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated, core_permissions.IsPassenger]
    serializer_class = serializers.OrderSerializer


    def get_queryset(self):
        return (models.Order.objects.filter(Q(user=self.request.user) &
                                            Q(Q(order_status='in_search') | Q(order_status='waiting') | Q(order_status='active')) &
                                            Q(Q(request=None) | Q(request__is_completed=False)))
                .order_by('-created_datetime'))


    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.request.user

        return context


    @swagger_auto_schema(operation_description="Возвращает список активных заказов.")
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


    @swagger_auto_schema(operation_description="Создает новый заказ.")
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        order = models.Order.objects.create(user=request.user, **serializer.validated_data)

        body = {
            "payload": {
                "id": order.pk
            }
        }

        rest_producer.queue.append(("", "processor", json.dumps(body)))

        serializer = self.get_serializer(instance=order)

        return response.Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderMixin(RetrieveModelMixin, GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated, core_permissions.IsPassenger]
    serializer_class = serializers.OrderSerializer


    def get_queryset(self):
        return models.Order.objects.filter(user=self.request.user).order_by('-created_datetime')


    @swagger_auto_schema(operation_description="Возвращает информацию по конкретному заказу.")
    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


    @swagger_auto_schema(operation_description="Отменяет заказ.")
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.order_status = 'cancelled'

        if hasattr(instance, 'request'):
            instance.request.is_completed = True
            instance.request.save()

        instance.save()

        return response.Response(status=status.HTTP_200_OK)



class OrdersHistoryMixin(ListModelMixin, GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated, core_permissions.IsPassenger]
    serializer_class = serializers.OrderSerializer


    def get_queryset(self):
        return (models.Order.objects.filter(Q(user=self.request.user) &
                                            Q(Q(order_status='cancelled') |
                                              Q(order_status='no_vehicles') |
                                              Q(order_status='route_error') |
                                              Q(request__is_completed=True)))
                .order_by('-created_datetime'))

    @swagger_auto_schema(operation_description="Возвращает информацию по завершенным заказам")
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
