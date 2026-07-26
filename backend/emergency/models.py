from django.db import models
from users.models import User


class Guardian(models.Model):
    RELATION_CHOICES = (
        ("parent", "Parent"),
        ("spouse", "Spouse"),
        ("sibling", "Sibling"),
        ("friend", "Friend"),
        ("other", "Other"),
    )

    resident = models.ForeignKey(User, related_name="guardians", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    relation = models.CharField(max_length=20, choices=RELATION_CHOICES)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    is_primary = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("resident", "phone_number")

    def __str__(self):
        return f"{self.name} ({self.relation}) - {self.resident.email}"


class EmergencyContact(models.Model):
    VERIFICATION_STATUS_CHOICES = (
        ("pending", "Pending"),
        ("verified", "Verified"),
        ("rejected", "Rejected"),
    )

    resident = models.ForeignKey(User, related_name="emergency_contacts", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    relation = models.CharField(max_length=100, blank=True)
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default="pending")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.resident.email}"
