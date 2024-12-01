from django.urls import path
from rest_framework.routers import SimpleRouter

from core import views

urlpatterns = [
    path('ports/<int:pk>/', views.PortMixin.as_view()),
    path('ports/', views.PortsMixin.as_view()),
    path('login/', views.LoginView.as_view()),
    path('user/info/', views.UserInfoApiView.as_view()),

    path('orders/', views.ActiveOrdersMixin.as_view()),
    path('order/<int:pk>/', views.OrderMixin.as_view()),
    path('user/history/', views.OrdersHistoryMixin.as_view()),
]