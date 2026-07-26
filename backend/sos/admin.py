from django.contrib import admin
from .models import EmergencyCategory, SOS, IncidentUpdate


@admin.register(EmergencyCategory)
class EmergencyCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active")
    list_filter = ("is_active",)


@admin.register(SOS)
class SOSAdmin(admin.ModelAdmin):
    list_display = ("resident", "category", "status", "latitude", "longitude", "created_at")
    list_filter = ("status", "category")
    search_fields = ("resident__email", "address")


@admin.register(IncidentUpdate)
class IncidentUpdateAdmin(admin.ModelAdmin):
    list_display = ("sos", "message", "updated_by", "created_at")
    search_fields = ("message",)
