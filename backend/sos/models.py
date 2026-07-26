from django.db import models
from users.models import User


class EmergencyCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class SOS(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("acknowledged", "Acknowledged"),
        ("resolved", "Resolved"),
        ("cancelled", "Cancelled"),
    )

    resident = models.ForeignKey(User, related_name="sos_alerts", on_delete=models.CASCADE)
    category = models.ForeignKey(EmergencyCategory, related_name="sos_alerts", on_delete=models.SET_NULL, null=True)
    message = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    address = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"SOS by {self.resident.email} at {self.created_at}"


class IncidentUpdate(models.Model):
    sos = models.ForeignKey(SOS, related_name="updates", on_delete=models.CASCADE)
    message = models.TextField()
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Update for {self.sos} at {self.created_at}"
