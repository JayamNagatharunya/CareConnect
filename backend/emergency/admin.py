from django.contrib import admin
from .models import Guardian, EmergencyContact


@admin.register(Guardian)
class GuardianAdmin(admin.ModelAdmin):
    list_display = ("name", "relation", "phone_number", "resident", "is_primary", "is_verified")
    list_filter = ("is_primary", "is_verified", "relation")
    search_fields = ("name", "phone_number", "resident__email")


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ("name", "phone_number", "resident", "verification_status", "is_active")
    list_filter = ("verification_status", "is_active")
    search_fields = ("name", "phone_number", "resident__email")
