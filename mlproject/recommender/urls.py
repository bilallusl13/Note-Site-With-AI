from django.urls import path
from .views import analyze_messages

urlpatterns = [
    path('analyze/', analyze_messages, name='analyze_messages'),
]
