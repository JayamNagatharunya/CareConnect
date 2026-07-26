from django.urls import path
from .views import EscalationLogListView, EscalationTriggerView, ResponseTimeConfigDetailView, ResponseTimeConfigListView

urlpatterns = [
    path("response-configs/", ResponseTimeConfigListView.as_view(), name="response-time-config-list"),
    path("response-configs/<int:pk>/", ResponseTimeConfigDetailView.as_view(), name="response-time-config-detail"),
    path("logs/", EscalationLogListView.as_view(), name="escalation-log-list"),
    path("trigger/", EscalationTriggerView.as_view(), name="escalation-trigger"),
]
