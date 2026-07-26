from django.contrib import admin
from .models import Notification, NotificationTemplate


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "recipient", "channel", "is_read", "sent_at")
    list_filter = ("channel", "is_read")
    search_fields = ("title", "recipient__email")


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "channel", "is_active")
    list_filter = ("channel", "is_active")
