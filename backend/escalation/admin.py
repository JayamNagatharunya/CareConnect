from django.contrib import admin
from .models import EscalationLog, ResponseTimeConfig


@admin.register(ResponseTimeConfig)
class ResponseTimeConfigAdmin(admin.ModelAdmin):
    list_display = ("role", "response_window_minutes", "auto_escalate", "is_active")


@admin.register(EscalationLog)
class EscalationLogAdmin(admin.ModelAdmin):
    list_display = ("sos", "from_role", "to_role", "triggered_at")
    list_filter = ("from_role", "to_role")
    search_fields = ("sos__resident__email",)
