from django.contrib import admin
from .models import Society, Block, Flat


@admin.register(Society)
class SocietyAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "state", "is_active", "created_at")
    list_filter = ("is_active", "city", "state")
    search_fields = ("name", "address", "pincode")


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "society")
    list_filter = ("society",)
    search_fields = ("name", "code")


@admin.register(Flat)
class FlatAdmin(admin.ModelAdmin):
    list_display = ("flat_number", "floor", "block", "is_available")
    list_filter = ("is_available", "block__society")
    search_fields = ("flat_number",)
